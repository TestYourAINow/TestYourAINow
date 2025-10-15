import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

interface PageContent {
  url: string;
  title: string;
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    console.log("Multi-page scraping from:", url);

    if (!url || (!url.startsWith("http://") && !url.startsWith("https://"))) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;
    const useScraperAPI = !!SCRAPER_API_KEY;
    
    if (useScraperAPI) {
      console.log("🔧 Using ScraperAPI for enhanced scraping");
    }

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Cache-Control': 'max-age=0',
      'DNT': '1',
    };

    function getScraperApiUrl(targetUrl: string, renderJs: boolean = false): string {
      if (!SCRAPER_API_KEY) return targetUrl;
      
      const params = new URLSearchParams({
        api_key: SCRAPER_API_KEY,
        url: targetUrl,
        render: renderJs ? 'true' : 'false',
        country_code: 'ca'
      });
      
      return `http://api.scraperapi.com?${params.toString()}`;
    }

    // 🆕 FONCTION DE NETTOYAGE AMÉLIORÉE
    function cleanAndDeduplicateText(text: string): string {
      // 1. Séparer en lignes
      const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      // 2. Filtrer les lignes non désirées
      const unwantedPatterns = [
        /cookie/i,
        /back button/i,
        /filter button/i,
        /close/i,
        /^ok$/i,
        /^cancel$/i,
        /^apply$/i,
        /checkbox label/i,
        /unable to load/i,
        /error has occurred/i,
        /uh-oh/i,
        /whoa there/i,
        /we're sorry/i,
        /cart has expired/i,
        /browser is set to block/i,
        /strictly necessary/i,
        /functional cookies/i,
        /performance cookies/i,
        /targeting cookies/i,
        /your privacy/i,
        /redeemable at participating/i,
        /50% off sub/i,
        /download the app/i,
        /switch your order/i,
        /prev.*next/i
      ];
      
      const filteredLines = lines.filter(line => {
        // Ignorer les lignes trop courtes (moins de 15 caractères)
        if (line.length < 15) return false;
        
        // Ignorer les lignes qui matchent les patterns non désirés
        return !unwantedPatterns.some(pattern => pattern.test(line));
      });
      
      // 3. Supprimer les doublons consécutifs
      const deduplicatedLines: string[] = [];
      let previousLine = '';
      
      for (const line of filteredLines) {
        // Normaliser pour comparaison (lowercase, sans ponctuation excessive)
        const normalizedLine = line.toLowerCase().replace(/[^a-z0-9\s]/g, '');
        const normalizedPrevious = previousLine.toLowerCase().replace(/[^a-z0-9\s]/g, '');
        
        // Ajouter seulement si différent de la ligne précédente
        if (normalizedLine !== normalizedPrevious) {
          deduplicatedLines.push(line);
          previousLine = line;
        }
      }
      
      // 4. Supprimer les doublons non-consécutifs (garder première occurrence)
      const uniqueLines = Array.from(new Set(deduplicatedLines));
      
      return uniqueLines.join('\n');
    }

    async function scrapePage(pageUrl: string, renderJs: boolean = false): Promise<PageContent | null> {
      try {
        console.log("Scraping page:", pageUrl);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        let response;
        let retries = 0;
        const maxRetries = 2;

        const fetchUrl = useScraperAPI ? getScraperApiUrl(pageUrl, renderJs) : pageUrl;

        while (retries <= maxRetries) {
          try {
            response = await fetch(fetchUrl, {
              headers: useScraperAPI ? {} : headers,
              signal: controller.signal,
              redirect: 'follow'
            });

            clearTimeout(timeoutId);

            if (response.ok) break;

            if (retries < maxRetries) {
              console.log(`⚠️ Retry ${retries + 1}/${maxRetries} for ${pageUrl}`);
              await new Promise(resolve => setTimeout(resolve, 1000));
              retries++;
            } else {
              return null;
            }
          } catch (error) {
            clearTimeout(timeoutId);
            if (retries < maxRetries) {
              console.log(`⚠️ Retry ${retries + 1}/${maxRetries} after error for ${pageUrl}`);
              await new Promise(resolve => setTimeout(resolve, 1000));
              retries++;
            } else {
              return null;
            }
          }
        }

        if (!response || !response.ok) return null;

        const html = await response.text();
        const $ = cheerio.load(html);

        // 🆕 NETTOYAGE PLUS AGRESSIF
        $(
          'script, style, noscript, header, footer, nav, ' +
          '.cookie, .popup, iframe, button, ' +
          '[class*="cookie"], [class*="popup"], [class*="modal"], ' +
          '[class*="dialog"], [id*="cookie"], [id*="popup"]'
        ).remove();

        const title = $('title').text().trim() || $('h1').first().text().trim();

        const textElements: string[] = [];

        // Extraire le contenu principal avec filtrage
        $('h1, h2, h3, h4, h5, h6, p, li').each((_, element) => {
          const text = $(element).text().trim();
          
          // Filtrer les textes courts ou non pertinents
          if (text && text.length > 15 && text.length < 500) {
            // Vérifier que ce n'est pas du contenu de navigation/cookie
            const lowerText = text.toLowerCase();
            if (!lowerText.includes('cookie') && 
                !lowerText.includes('back button') &&
                !lowerText.includes('error') &&
                !lowerText.includes('unable to load')) {
              textElements.push(text);
            }
          }
        });

        const rawContent = textElements.join('\n').trim();
        
        // 🆕 APPLIQUER LE NETTOYAGE ET DÉDUPLICATION
        const cleanedContent = cleanAndDeduplicateText(rawContent);

        return {
          url: pageUrl,
          title,
          content: cleanedContent
        };
      } catch (error) {
        console.error(`Error scraping ${pageUrl}:`, error);
        return null;
      }
    }

    // 🆕 APPROCHE UNIVERSELLE - Toujours activer JS rendering avec ScraperAPI
    const renderJs = useScraperAPI; // Si on utilise ScraperAPI, on active JS rendering
    
    console.log(`🌐 Fetching main page (JS rendering: ${renderJs ? 'ON' : 'OFF'}): ${url}`);
    
    const mainPage = await scrapePage(url, renderJs);
    
    if (!mainPage || mainPage.content.length < 200) {
      return NextResponse.json({
        error: useScraperAPI 
          ? "Could not extract enough content from this website even with enhanced scraping"
          : "Could not access this website. The site may have anti-bot protection."
      }, { status: 400 });
    }

    console.log(`📝 Main page content extracted: ${mainPage.content.length} characters`);

    const pages: PageContent[] = [mainPage];

    // 🆕 LOGIQUE UNIVERSELLE - Scraper pages supplémentaires pour TOUS les sites
    const $ = cheerio.load(mainPage.content);
    const baseUrl = new URL(url);
    const domain = baseUrl.origin;

    const importantLinks = new Set<string>();

    $('nav a, .nav a, .navbar a, .menu a, header a, .header a').each((_, element) => {
      const href = $(element).attr('href');
      const text = $(element).text().trim().toLowerCase();

      if (href && (
        text.includes('about') || text.includes('services') || text.includes('pricing') ||
        text.includes('contact') || text.includes('help') || text.includes('faq') ||
        text.includes('features') || text.includes('how') || text.includes('why') ||
        text.includes('team') || text.includes('company') || text.includes('support') ||
        text.includes('menu') || text.includes('products') ||
        text.includes('à-propos') || text.includes('apropos') || text.includes('tarifs') ||
        text.includes('prix') || text.includes('aide') || text.includes('équipe') ||
        text.includes('equipe') || text.includes('nous') || text.includes('entreprise') ||
        text.includes('pourquoi') || text.includes('comment') || text.includes('produits')
      )) {
        let fullUrl = href;
        if (href.startsWith('/')) {
          fullUrl = domain + href;
        } else if (!href.startsWith('http')) {
          fullUrl = domain + '/' + href;
        }

        try {
          const linkUrl = new URL(fullUrl);
          if (linkUrl.origin === domain) {
            importantLinks.add(fullUrl);
          }
        } catch { }
      }
    });

    const commonPages = [
      // Anglais
      '/about', '/about-us', '/services', '/pricing', '/contact',
      '/faq', '/help', '/features', '/how-it-works', '/support',
      '/menu', '/our-menu', '/products',
      // Français
      '/a-propos', '/apropos', '/services', '/tarifs', '/prix', '/contact',
      '/aide', '/faq', '/fonctionnalites', '/equipe', '/entreprise', '/nous',
      '/menu', '/notre-menu', '/produits'
    ];
    
    for (const page of commonPages) {
      importantLinks.add(domain + page);
    }

    console.log(`🔗 Found ${importantLinks.size} important links to scrape`);

    // 🆕 SCRAPING GÉNÉREUX - Maximum de contenu pour les clients
    const maxPages = 10; // Toujours 10 pages max pour tous les sites
    const linksToScrape = Array.from(importantLinks).slice(0, maxPages);

    for (const link of linksToScrape) {
      if (link !== url) {
        const pageContent = await scrapePage(link, renderJs);
        if (pageContent && pageContent.content.length > 100) {
          pages.push(pageContent);
          console.log(`✅ Scraped: ${link} (${pageContent.content.length} chars)`);
        }
        // Pause adaptative selon ScraperAPI
        await new Promise(resolve => setTimeout(resolve, useScraperAPI ? 800 : 400));
      }
    }

    console.log(`📊 Total pages scraped: ${pages.length}`);

    // Compiler le contenu
    let finalContent = `# ${pages[0].title}\n\n`;

    for (const page of pages) {
      if (page.content.length > 50) {
        finalContent += `\n## ${page.title}\n\n${page.content}\n\n`;
      }
    }

    // Nettoyage final
    finalContent = finalContent
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    console.log(`📏 Final compiled content: ${finalContent.length} characters`);

    if (finalContent.length < 200) {
      return NextResponse.json({
        error: "Could not extract enough content from this website"
      }, { status: 400 });
    }

    // Limiter la taille finale à 25000 caractères
    if (finalContent.length > 25000) {
      finalContent = finalContent.slice(0, 25000) + '\n\n[Content truncated for optimal processing...]';
    }

    return NextResponse.json({
      content: finalContent,
      metadata: {
        pagesScraped: pages.length,
        totalLength: finalContent.length,
        pages: pages.map(p => ({ url: p.url, title: p.title })),
        usedScraperAPI: useScraperAPI
      }
    });

  } catch (error: any) {
    console.error("Multi-page scraping error:", error);

    return NextResponse.json({
      error: "Failed to scrape website content"
    }, { status: 500 });
  }
}
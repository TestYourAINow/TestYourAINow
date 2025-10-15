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

    // 🆕 SCRAPERAPI KEY depuis les variables d'environnement
    const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;
    
    // Vérifier si on doit utiliser ScraperAPI
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

    // 🆕 FONCTION POUR CRÉER URL SCRAPERAPI
    function getScraperApiUrl(targetUrl: string, renderJs: boolean = false): string {
      if (!SCRAPER_API_KEY) return targetUrl;
      
      const params = new URLSearchParams({
        api_key: SCRAPER_API_KEY,
        url: targetUrl,
        render: renderJs ? 'true' : 'false',
        country_code: 'ca' // Canada pour Subway
      });
      
      return `http://api.scraperapi.com?${params.toString()}`;
    }

    // Fonction pour scraper une page
    async function scrapePage(pageUrl: string, renderJs: boolean = false): Promise<PageContent | null> {
      try {
        console.log("Scraping page:", pageUrl);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s avec ScraperAPI

        let response;
        let retries = 0;
        const maxRetries = 2;

        // 🆕 UTILISER SCRAPERAPI SI DISPONIBLE
        const fetchUrl = useScraperAPI ? getScraperApiUrl(pageUrl, renderJs) : pageUrl;

        while (retries <= maxRetries) {
          try {
            response = await fetch(fetchUrl, {
              headers: useScraperAPI ? {} : headers, // Pas besoin de headers avec ScraperAPI
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

        // Supprimer les éléments non utiles
        $('script, style, noscript, header, footer, nav, .cookie, .popup, iframe').remove();

        const title = $('title').text().trim() || $('h1').first().text().trim();

        const textElements: string[] = [];

        // Extraire le contenu principal
        $('h1, h2, h3, h4, h5, h6, p, li').each((_, element) => {
          const text = $(element).text().trim();
          if (text && text.length > 10 && text.length < 500) {
            textElements.push(text);
          }
        });

        const content = textElements.join('\n').trim();

        return {
          url: pageUrl,
          title,
          content
        };
      } catch (error) {
        console.error(`Error scraping ${pageUrl}:`, error);
        return null;
      }
    }

    // Scraper la page principale avec render JS si c'est Subway ou similaire
    const needsJsRendering = url.includes('subway.com') || url.includes('mcdonalds.com');
    
    console.log(`🌐 Fetching main page (JS rendering: ${needsJsRendering ? 'ON' : 'OFF'}): ${url}`);
    
    const mainPage = await scrapePage(url, needsJsRendering);
    
    if (!mainPage || mainPage.content.length < 200) {
      return NextResponse.json({
        error: useScraperAPI 
          ? "Could not extract enough content from this website even with enhanced scraping"
          : "Could not access this website. The site may have anti-bot protection. Consider upgrading to premium scraping."
      }, { status: 400 });
    }

    console.log(`📝 Main page content extracted: ${mainPage.content.length} characters`);

    const pages: PageContent[] = [mainPage];

    // 2. Extraire les liens de navigation
    const $ = cheerio.load(mainPage.content);
    const baseUrl = new URL(url);
    const domain = baseUrl.origin;

    const importantLinks = new Set<string>();

    // Navigation principale
    $('nav a, .nav a, .navbar a, .menu a, header a, .header a').each((_, element) => {
      const href = $(element).attr('href');
      const text = $(element).text().trim().toLowerCase();

      if (href && (
        text.includes('about') || text.includes('services') || text.includes('pricing') ||
        text.includes('contact') || text.includes('help') || text.includes('faq') ||
        text.includes('menu') || text.includes('products') ||
        text.includes('à-propos') || text.includes('tarifs') || text.includes('produits')
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

    // Pages communes
    const commonPages = [
      '/about', '/services', '/pricing', '/contact', '/faq',
      '/menu', '/products',
      '/a-propos', '/tarifs', '/produits'
    ];

    for (const page of commonPages) {
      importantLinks.add(domain + page);
    }

    console.log(`🔗 Found ${importantLinks.size} important links to scrape`);

    // 3. Scraper les pages importantes (limité selon l'utilisation de ScraperAPI)
    const maxPages = useScraperAPI ? 5 : 8; // Moins de pages avec ScraperAPI pour économiser les crédits
    const linksToScrape = Array.from(importantLinks).slice(0, maxPages);

    for (const link of linksToScrape) {
      if (link !== url) {
        const pageContent = await scrapePage(link, needsJsRendering);
        if (pageContent && pageContent.content.length > 100) {
          pages.push(pageContent);
          console.log(`✅ Scraped: ${link} (${pageContent.content.length} chars)`);
        }
        // Pause plus longue avec ScraperAPI
        await new Promise(resolve => setTimeout(resolve, useScraperAPI ? 1000 : 500));
      }
    }

    console.log(`📊 Total pages scraped: ${pages.length}`);

    // 4. Compiler tout le contenu
    let finalContent = `# ${pages[0].title}\n\n`;

    for (const page of pages) {
      if (page.content.length > 50) {
        finalContent += `\n## ${page.title}\n\n${page.content}\n\n`;
      }
    }

    // 5. Nettoyage final
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

    // Limiter la taille finale
    if (finalContent.length > 25000) {
      finalContent = finalContent.slice(0, 25000) + '\n\n[Content truncated due to length...]';
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
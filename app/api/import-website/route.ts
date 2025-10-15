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

    // Fonction pour scraper une page
    async function scrapePage(pageUrl: string): Promise<PageContent | null> {
      try {
        console.log("Scraping page:", pageUrl);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

        let response;
        let retries = 0;
        const maxRetries = 2;

        while (retries <= maxRetries) {
          try {
            response = await fetch(pageUrl, {
              headers,
              signal: controller.signal,
              redirect: 'follow'
            });

            clearTimeout(timeoutId);

            if (response.ok) break; // ✅ Succès, sortir de la boucle

            // Si erreur 4xx/5xx, retry
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

    // 🆕 CONFIGURATION OPTIMISÉE POUR PRODUCTION
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    let response;
    let retryCount = 0;
    const maxRetries = 3;

    // 🔄 RETRY LOGIC pour la production
    while (retryCount <= maxRetries) {
      try {
        console.log(`🌐 Fetching main page (attempt ${retryCount + 1}/${maxRetries + 1}): ${url}`);
        
        response = await fetch(url, {
          headers,
          signal: controller.signal,
          redirect: 'follow'
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          console.log(`✅ Main page fetched successfully (${response.status})`);
          break;
        }
        
        // Si erreur serveur, retry
        if (response.status >= 500 && retryCount < maxRetries) {
          console.log(`⚠️ Server error ${response.status}, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          retryCount++;
          continue;
        }
        
        // Si erreur client (4xx), pas la peine de retry
        if (response.status >= 400) {
          clearTimeout(timeoutId);
          return NextResponse.json({
            error: `Website returned error ${response.status}. This site may be blocking automated access or require authentication.`
          }, { status: 400 });
        }
        
      } catch (error: any) {
        clearTimeout(timeoutId);
        console.error(`❌ Fetch error (attempt ${retryCount + 1}):`, error.message);
        
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          retryCount++;
          continue;
        }
        
        return NextResponse.json({
          error: error.name === 'AbortError' 
            ? "Website took too long to respond (timeout after 15s). Try a simpler page or different site."
            : `Could not connect to website: ${error.message}. The site may be blocking automated access.`
        }, { status: 400 });
      }
    }

    // Vérifier si on a une réponse valide
    if (!response || !response.ok) {
      return NextResponse.json({
        error: "Could not access main page after multiple attempts. The website may be blocking automated requests."
      }, { status: 400 });
    }

    const html = await response.text();

    // 🔍 VÉRIFIER SI LE CONTENU EST VIDE
    if (!html || html.length < 100) {
      return NextResponse.json({
        error: "Website returned empty content. It may require JavaScript or authentication."
      }, { status: 400 });
    }

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

    const mainContent = textElements.join('\n').trim();

    // 🔍 VÉRIFIER SI ON A DU CONTENU
    if (mainContent.length < 200) {
      return NextResponse.json({
        error: "Could not extract enough content from this website. It may use heavy JavaScript or block scraping."
      }, { status: 400 });
    }

    console.log(`📝 Main page content extracted: ${mainContent.length} characters`);

    const pages: PageContent[] = [{
      url: url,
      title: title,
      content: mainContent
    }];

    // 2. Extraire les liens de navigation
    const baseUrl = new URL(url);
    const domain = baseUrl.origin;

    const importantLinks = new Set<string>();

    // Navigation principale
    $('nav a, .nav a, .navbar a, .menu a, header a, .header a').each((_, element) => {
      const href = $(element).attr('href');
      const text = $(element).text().trim().toLowerCase();

      // Filtrer les liens importants
      if (href && (
        // Anglais
        text.includes('about') || text.includes('services') || text.includes('pricing') ||
        text.includes('contact') || text.includes('help') || text.includes('faq') ||
        text.includes('features') || text.includes('how') || text.includes('why') ||
        text.includes('team') || text.includes('company') || text.includes('support') ||
        text.includes('menu') || text.includes('products') || // 🆕 AJOUTÉ
        // Français
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

    // Pages communes
    const commonPages = [
      '/about', '/about-us', '/services', '/pricing', '/contact',
      '/faq', '/help', '/features', '/how-it-works', '/support',
      '/menu', '/products', // 🆕 AJOUTÉ
      '/a-propos', '/apropos', '/services', '/tarifs', '/prix', '/contact',
      '/aide', '/faq', '/fonctionnalites', '/equipe', '/entreprise', '/nous'
    ];

    for (const page of commonPages) {
      importantLinks.add(domain + page);
    }

    console.log(`🔗 Found ${importantLinks.size} important links to scrape`);

    // 3. Scraper les pages importantes (max 8 pour éviter timeout)
    const maxPages = 8;
    const linksToScrape = Array.from(importantLinks).slice(0, maxPages);

    for (const link of linksToScrape) {
      if (link !== url) {
        const pageContent = await scrapePage(link);
        if (pageContent && pageContent.content.length > 100) {
          pages.push(pageContent);
          console.log(`✅ Scraped: ${link} (${pageContent.content.length} chars)`);
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log(`📊 Total pages scraped: ${pages.length}`);

    // 4. Compiler tout le contenu
    let finalContent = '';

    // Titre principal
    finalContent += `# ${pages[0].title}\n\n`;

    // Meta description
    const metaDesc = $('meta[name="description"]').attr('content');
    if (metaDesc) {
      finalContent += `${metaDesc}\n\n`;
    }

    // Contenu de chaque page
    for (const page of pages) {
      if (page.content.length > 50) {
        finalContent += `\n## ${page.title}\n\n`;
        finalContent += `${page.content}\n\n`;
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
        pages: pages.map(p => ({ url: p.url, title: p.title }))
      }
    });

  } catch (error: any) {
    console.error("Multi-page scraping error:", error);

    return NextResponse.json({
      error: "Failed to scrape website content"
    }, { status: 500 });
  }
}
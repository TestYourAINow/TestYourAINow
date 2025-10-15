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

    console.log("🌐 Multi-page scraping from:", url);

    if (!url || (!url.startsWith("http://") && !url.startsWith("https://"))) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // 🔑 ScraperAPI Key
    const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;
    const useScraperAPI = !!SCRAPER_API_KEY;
    
    if (useScraperAPI) {
      console.log("✅ Using ScraperAPI for enhanced scraping");
    } else {
      console.log("⚠️ No ScraperAPI key - using direct scraping");
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

    // 🆕 FONCTION SCRAPERAPI AMÉLIORÉE
    function getScraperApiUrl(targetUrl: string, renderJs: boolean = false): string {
      if (!SCRAPER_API_KEY) return targetUrl;
      
      const params = new URLSearchParams({
        api_key: SCRAPER_API_KEY,
        url: targetUrl,
        render: renderJs ? 'true' : 'false',
        country_code: 'ca',
     
        session_number: '123' // 🆕 Garder la même session
      });
      
      return `http://api.scraperapi.com?${params.toString()}`;
    }

    // 🔧 FONCTION SCRAPEPAGE CORRIGÉE
    async function scrapePage(pageUrl: string, renderJs: boolean = false): Promise<PageContent | null> {
      try {
        console.log(`📄 Scraping: ${pageUrl} (JS: ${renderJs ? 'ON' : 'OFF'})`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), renderJs ? 45000 : 30000); // Plus de temps si JS

        let response;
        let retries = 0;
        const maxRetries = 2;

        const fetchUrl = useScraperAPI ? getScraperApiUrl(pageUrl, renderJs) : pageUrl;
        
        console.log(`🔗 Fetch URL: ${fetchUrl.substring(0, 100)}...`);

        while (retries <= maxRetries) {
          try {
            response = await fetch(fetchUrl, {
              headers: useScraperAPI ? {} : headers,
              signal: controller.signal,
              redirect: 'follow'
            });

            clearTimeout(timeoutId);

            if (response.ok) {
              console.log(`✅ Success (${response.status})`);
              break;
            }

            if (retries < maxRetries) {
              console.log(`⚠️ Retry ${retries + 1}/${maxRetries} (status: ${response.status})`);
              await new Promise(resolve => setTimeout(resolve, 2000));
              retries++;
            } else {
              console.log(`❌ Failed after ${maxRetries} retries`);
              return null;
            }
          } catch (error: any) {
            clearTimeout(timeoutId);
            console.log(`❌ Fetch error: ${error.message}`);
            
            if (retries < maxRetries) {
              console.log(`⚠️ Retry ${retries + 1}/${maxRetries} after error`);
              await new Promise(resolve => setTimeout(resolve, 2000));
              retries++;
            } else {
              return null;
            }
          }
        }

        if (!response || !response.ok) return null;

        const html = await response.text();
        
        // 🔍 DEBUG - Vérifier ce qu'on reçoit
        console.log(`📊 HTML length: ${html.length} chars`);
        console.log(`📝 HTML preview: ${html.substring(0, 200)}`);

        const $ = cheerio.load(html);

        // Supprimer les éléments non utiles
        $('script, style, noscript, header, footer, nav, .cookie, .popup, iframe').remove();

        const title = $('title').text().trim() || $('h1').first().text().trim() || 'Page';

        const textElements: string[] = [];

        // 🆕 EXTRACTION AMÉLIORÉE - Plus de sélecteurs
        $('h1, h2, h3, h4, h5, h6, p, li, article, section, div[class*="content"], div[class*="text"]').each((_, element) => {
          const text = $(element).text().trim();
          if (text && text.length > 10 && text.length < 500) {
            textElements.push(text);
          }
        });

        const content = textElements.join('\n').trim();
        
        console.log(`📝 Extracted ${textElements.length} text elements, ${content.length} chars total`);

        return {
          url: pageUrl,
          title,
          content
        };
      } catch (error: any) {
        console.error(`❌ Error scraping ${pageUrl}:`, error.message);
        return null;
      }
    }

    // 🎯 DÉTECTION SITES NÉCESSITANT JS
    const needsJsRendering = 
      url.includes('subway.com') || 
      url.includes('mcdonalds.com') ||
      url.includes('starbucks.com') ||
      url.includes('chipotle.com');
    
    console.log(`🎯 Target: ${url} (Needs JS: ${needsJsRendering})`);

    // 1️⃣ SCRAPER LA PAGE PRINCIPALE
    const mainPage = await scrapePage(url, needsJsRendering);
    
    if (!mainPage) {
      console.log("❌ Could not access main page");
      return NextResponse.json({
        error: useScraperAPI 
          ? "Could not access this website. It may be heavily protected or temporarily unavailable."
          : "Could not access this website. Try enabling premium scraping or contact support."
      }, { status: 400 });
    }

    console.log(`✅ Main page scraped: ${mainPage.content.length} chars`);

    // 🔍 VÉRIFICATION DU CONTENU
    if (mainPage.content.length < 100) {
      console.log(`⚠️ Content too short (${mainPage.content.length} chars)`);
      
      // Si ScraperAPI et toujours vide, le site est vraiment protégé
      return NextResponse.json({
        error: useScraperAPI
          ? "This website is heavily protected and could not be scraped. Try a different URL or page."
          : "Could not extract content. The site may require premium scraping."
      }, { status: 400 });
    }

    const pages: PageContent[] = [mainPage];

    // 2️⃣ EXTRAIRE LES LIENS (si assez de contenu dans la page principale)
    if (mainPage.content.length >= 200) {
      try {
        const html = mainPage.content; // On utilise le contenu déjà extrait
        const $ = cheerio.load(html);
        const baseUrl = new URL(url);
        const domain = baseUrl.origin;

        const importantLinks = new Set<string>();

        // Pages communes à essayer
        const commonPages = [
          '/menu', '/our-menu', '/menus',
          '/about', '/about-us',
          '/locations', '/find-a-restaurant',
          '/contact', '/contact-us'
        ];

        for (const page of commonPages) {
          const fullUrl = domain + page;
          importantLinks.add(fullUrl);
        }

        console.log(`🔗 Trying ${importantLinks.size} common pages`);

        // 3️⃣ SCRAPER QUELQUES PAGES ADDITIONNELLES (max 3 pour économiser)
        const maxPages = 3;
        const linksToScrape = Array.from(importantLinks).slice(0, maxPages);

        for (const link of linksToScrape) {
          if (link !== url) {
            const pageContent = await scrapePage(link, needsJsRendering);
            if (pageContent && pageContent.content.length > 100) {
              pages.push(pageContent);
              console.log(`✅ Additional page scraped: ${link}`);
            }
            // Pause entre requêtes
            await new Promise(resolve => setTimeout(resolve, useScraperAPI ? 2000 : 1000));
          }
        }
      } catch (error) {
        console.log("⚠️ Error extracting links, continuing with main page only");
      }
    }

    console.log(`📊 Total pages scraped: ${pages.length}`);

    // 4️⃣ COMPILER LE CONTENU
    let finalContent = `# ${pages[0].title}\n\n`;

    for (const page of pages) {
      if (page.content.length > 50) {
        finalContent += `\n## ${page.title}\n\n${page.content}\n\n`;
      }
    }

    // 5️⃣ NETTOYAGE FINAL
    finalContent = finalContent
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    console.log(`📏 Final content: ${finalContent.length} characters`);

    if (finalContent.length < 200) {
      return NextResponse.json({
        error: "Could not extract enough meaningful content from this website"
      }, { status: 400 });
    }

    // Limiter la taille
    if (finalContent.length > 25000) {
      finalContent = finalContent.slice(0, 25000) + '\n\n[Content truncated due to length...]';
    }

    return NextResponse.json({
      content: finalContent,
      metadata: {
        pagesScraped: pages.length,
        totalLength: finalContent.length,
        pages: pages.map(p => ({ url: p.url, title: p.title })),
        usedScraperAPI: useScraperAPI,
        jsRendering: needsJsRendering
      }
    });

  } catch (error: any) {
    console.error("❌ Multi-page scraping error:", error);

    return NextResponse.json({
      error: "Failed to scrape website content: " + error.message
    }, { status: 500 });
  }
}
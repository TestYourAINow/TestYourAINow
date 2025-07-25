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
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    };

    // Fonction pour scraper une page
    async function scrapePage(pageUrl: string): Promise<PageContent | null> {
      try {
        console.log("Scraping page:", pageUrl);
        
        const controller = new AbortController();
        // Timeout généreux pour Vercel Pro
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(pageUrl, { 
          headers,
          signal: controller.signal,
          redirect: 'follow'
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) return null;

        const html = await response.text();
        const $ = cheerio.load(html);

        // Supprimer les éléments non utiles
        $('script, style, noscript, header, footer, nav, .cookie, .popup').remove();

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

    // 1. Scraper la page principale d'abord
    const mainPage = await scrapePage(url);
    if (!mainPage) {
      return NextResponse.json({ error: "Could not access main page" }, { status: 400 });
    }

    const pages: PageContent[] = [mainPage];
    
    // 2. Extraire les liens de navigation de la page principale
    const response = await fetch(url, { headers });
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const baseUrl = new URL(url);
    const domain = baseUrl.origin;
    
    // Chercher les liens importants dans la navigation
    const importantLinks = new Set<string>();
    
    // Navigation principale
    $('nav a, .nav a, .navbar a, .menu a, header a, .header a').each((_, element) => {
      const href = $(element).attr('href');
      const text = $(element).text().trim().toLowerCase();
      
      // Filtrer les liens importants
      if (href && (
        text.includes('about') || text.includes('services') || text.includes('pricing') ||
        text.includes('contact') || text.includes('help') || text.includes('faq') ||
        text.includes('features') || text.includes('how') || text.includes('why') ||
        text.includes('team') || text.includes('company') || text.includes('support')
      )) {
        let fullUrl = href;
        if (href.startsWith('/')) {
          fullUrl = domain + href;
        } else if (!href.startsWith('http')) {
          fullUrl = domain + '/' + href;
        }
        
        // Vérifier que c'est le même domaine
        try {
          const linkUrl = new URL(fullUrl);
          if (linkUrl.origin === domain) {
            importantLinks.add(fullUrl);
          }
        } catch {}
      }
    });

    // Aussi chercher des pages communes
    const commonPages = [
      '/about', '/about-us', '/services', '/pricing', '/contact', 
      '/faq', '/help', '/features', '/how-it-works', '/support'
    ];
    
    for (const page of commonPages) {
      importantLinks.add(domain + page);
    }

    console.log("Found important links:", Array.from(importantLinks));

    // 3. Optimisé pour Vercel Pro (60s timeout)
    const maxPages = 10; // 10 pages = ~40-50 secondes sur Vercel Pro
    const linksToScrape = Array.from(importantLinks).slice(0, maxPages);
    
    for (const link of linksToScrape) {
      if (link !== url) { // Éviter de re-scraper la page principale
        const pageContent = await scrapePage(link);
        if (pageContent && pageContent.content.length > 100) {
          pages.push(pageContent);
        }
        
        // Pause optimale pour Vercel Pro
        await new Promise(resolve => setTimeout(resolve, 400));
      }
    }

    console.log(`Scraped ${pages.length} pages total`);

    // 4. Compiler tout le contenu
    let finalContent = '';
    
    // Titre principal du site
    finalContent += `# ${pages[0].title}\n\n`;
    
    // Meta description si disponible
    const $main = cheerio.load(html);
    const metaDesc = $main('meta[name="description"]').attr('content');
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

    console.log("Final compiled content length:", finalContent.length);

    if (finalContent.length < 200) {
      return NextResponse.json({ 
        error: "Could not extract enough content from this website" 
      }, { status: 400 });
    }

    // Limiter la taille finale
    if (finalContent.length > 15000) {
      finalContent = finalContent.slice(0, 15000) + '\n\n[Content truncated due to length...]';
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
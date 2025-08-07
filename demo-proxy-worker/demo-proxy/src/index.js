/**
 * Demo Proxy Worker - Custom Domains for TestYourAI
 * Proxy les domaines personnalisés vers les demos
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const hostname = url.hostname;
    
    // Log pour debug
    console.log(`🌐 Request pour: ${hostname}`);
    
    // Si c'est notre workers.dev OU notre proxy domain, afficher les infos de debug
    if (hostname.includes('workers.dev') || hostname === 'proxy.testyourainow.com') {
      return new Response(`
        <h1>🚀 Demo Proxy Worker Active!</h1>
        <p><strong>Worker URL:</strong> ${hostname}</p>
        <p><strong>Status:</strong> ✅ Fonctionnel</p>
        <h2>🔧 Test du mapping:</h2>
        <pre>GET /?test=demo.client.com pour tester un domaine</pre>
        <h2>📝 Domaines configurés:</h2>
        <p><em>Aucun pour le moment - utilisez l'API pour en ajouter</em></p>
      `, {
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    // Chercher le mapping du domaine
    let mapping;
    try {
      const mappingData = await env.DOMAIN_MAPPINGS.get(hostname);
      if (!mappingData) {
        console.log(`❌ Aucun mapping trouvé pour: ${hostname}`);
        return new Response(`
          <h1>❌ Demo Not Found</h1>
          <p>Le domaine <code>${hostname}</code> n'est pas configuré.</p>
          <p>Configurez votre demo sur <a href="https://testyourainow.com">TestYourAI</a></p>
        `, { 
          status: 404,
          headers: { 'Content-Type': 'text/html' }
        });
      }
      
      mapping = JSON.parse(mappingData);
      console.log(`✅ Mapping trouvé:`, mapping);
      
    } catch (error) {
      console.error('❌ Erreur mapping:', error);
      return new Response('Erreur de configuration', { status: 500 });
    }
    
    // Construire l'URL cible
    const targetUrl = `https://testyourainow.com/shared/${mapping.demoId}?embed=true&proxy=true`;
    console.log(`🎯 Proxy vers: ${targetUrl}`);
    
    try {
      // Faire la requête vers la vraie demo
      const response = await fetch(targetUrl, {
        method: request.method,
        headers: {
          ...request.headers,
          // Ajouter headers pour identifier la requête proxy
          'X-Proxy-Host': hostname,
          'X-Proxy-Original': request.url
        },
        body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined
      });
      
      if (!response.ok) {
        console.log(`❌ Erreur response: ${response.status}`);
        return new Response(`Demo temporairement indisponible (${response.status})`, { 
          status: response.status 
        });
      }
      
      // Transformer le contenu
      let content = await response.text();
      
      // Seulement transformer le HTML
      if (response.headers.get('content-type')?.includes('text/html')) {
        content = transformContent(content, hostname);
      }
      
      // Créer la réponse proxy
      const proxyResponse = new Response(content, {
        status: response.status,
        statusText: response.statusText
      });
      
      // Copier les headers importants
      const headersToKeep = [
        'content-type', 'cache-control', 'expires', 
        'last-modified', 'etag', 'vary'
      ];
      
      headersToKeep.forEach(header => {
        const value = response.headers.get(header);
        if (value) {
          proxyResponse.headers.set(header, value);
        }
      });
      
      // Ajouter headers de sécurité
      proxyResponse.headers.set('X-Frame-Options', 'SAMEORIGIN');
      proxyResponse.headers.set('X-Content-Type-Options', 'nosniff');
      proxyResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      
      // Supprimer headers révélateurs
      proxyResponse.headers.delete('server');
      proxyResponse.headers.delete('x-powered-by');
      
      console.log(`✅ Proxy réussi pour ${hostname}`);
      return proxyResponse;
      
    } catch (error) {
      console.error('❌ Erreur proxy:', error);
      return new Response(`
        <h1>❌ Erreur Temporaire</h1>
        <p>La demo est temporairement indisponible.</p>
        <p>Veuillez réessayer dans quelques minutes.</p>
      `, { 
        status: 500,
        headers: { 'Content-Type': 'text/html' }
      });
    }
  }
};

/**
 * Transforme le contenu HTML pour masquer l'origine
 */
function transformContent(content, customDomain) {
  // Remplacer toutes les références au domaine original
  content = content.replace(/https:\/\/testyourainow\.com/g, `https://${customDomain}`);
  content = content.replace(/testyourainow\.com/g, customDomain);
  
  // Injecter CSS pour masquer le branding
  content = content.replace('</head>', `
    <style>
      /* Masquer complètement le branding */
      .demo-header, 
      .demo-footer, 
      [data-powered-by],
      .powered-by,
      .branding {
        display: none !important;
      }
      
      /* Ajuster le layout pour le mode embed */
      body {
        margin: 0 !important;
        padding: 0 !important;
      }
      
      /* Ajuster le chat widget */
      .chat-widget {
        position: fixed !important;
        bottom: 20px !important;
        right: 20px !important;
        z-index: 9999 !important;
      }
    </style>
  </head>`);
  
  // Ajouter une classe pour identifier le mode proxy
  content = content.replace('<body', '<body class="proxy-mode"');
  
  return content;
}
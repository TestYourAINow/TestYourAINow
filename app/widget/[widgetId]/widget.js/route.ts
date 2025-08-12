// app/widget/[widgetId]/widget.js/route.ts - VERSION ULTRA SIMPLE
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: any
) {
  const params = await context.params;
  const widgetId = params.widgetId;
  const baseUrl = req.nextUrl.origin;

  // 🎯 SCRIPT ULTRA SIMPLE qui utilise ton système existant
  const script = `
(function() {
  'use strict';
  
  const WIDGET_ID = "${widgetId}";
  const BASE_URL = "${baseUrl}";
  
  console.log('[AIChatWidget] Initializing widget:', WIDGET_ID);
  
  // 🔒 Éviter double chargement
  if (window.AIChatWidgetLoaded) return;
  window.AIChatWidgetLoaded = true;
  
  // 🏗️ Container simple
  const container = document.createElement('div');
  container.style.cssText = \`
    position: fixed !important;
    bottom: 20px !important;
    right: 20px !important;
    z-index: 2147483647 !important;
  \`;
  
  // 🎯 IFRAME SIMPLE qui charge ta page existante
  const iframe = document.createElement('iframe');
  iframe.style.cssText = \`
    width: 64px !important;
    height: 64px !important;
    border: none !important;
    border-radius: 50% !important;
    box-shadow: 0 4px 16px rgba(0,0,0,0.12) !important;
    transition: all 0.3s ease !important;
  \`;
  
  // 🔗 URL simple vers ta page existante
  iframe.src = BASE_URL + '/widget/' + WIDGET_ID;
  
  container.appendChild(iframe);
  document.body.appendChild(container);
  
  console.log('[AIChatWidget] Widget ready! ✓');
})();
`;

  return new NextResponse(script, {
    status: 200,
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=300",
      'Access-Control-Allow-Origin': '*',
    },
  });
}
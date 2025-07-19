// app/widget/[widgetId]/widget.js/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: any
) {
  const params = await context.params;
  const widgetId = params.widgetId;

  const script = `
    (function() {
      if (window.AIChatWidget) return;

      var script = document.createElement('script');
      script.src = "https://votre-domaine.com/widget-client.js";
      script.onload = function() {
        window.AIChatWidget.init({ widgetId: "${widgetId}" });
      };
      document.body.appendChild(script);
    })();
  `;

  return new NextResponse(script, {
    headers: {
      "Content-Type": "application/javascript",
      // ❌ ENLÈVE LE CACHE ICI si tu veux que ce soit toujours frais
      // "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
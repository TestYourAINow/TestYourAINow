// app/widget/[widgetId]/widget.js/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, ctx: { params: { widgetId: string } }) {
  const { widgetId } = ctx.params;
  const baseUrl = req.nextUrl.origin;

  const script = `
// == TestYourAI Now Widget ==
(function () {
  "use strict";
  var WIDGET_NS = "AIChatWidget";

  if (window[WIDGET_NS]) {
    console.debug("[AIChatWidget] Already initialized; skipping.");
    return;
  }

  // --- Locate <script> tag (for logging parity with BuildMyAgent) ---
  var scripts = document.getElementsByTagName("script");
  console.log("[AIChatWidget] Looking for widget script among " + scripts.length + " scripts");
  var selfScript = null;
  for (var i = scripts.length - 1; i >= 0; i--) {
    var src = scripts[i].getAttribute("src") || "";
    if (src.indexOf("/widget/${widgetId}/widget.js") !== -1) {
      selfScript = scripts[i];
      break;
    }
  }
  if (selfScript) {
    console.log("[AIChatWidget] Found widget script: " + selfScript.src);
  }

  // --- Resolve hosts (like BuildMyAgent does) ---
  var scriptDomain = "${baseUrl}";
  console.log("[AIChatWidget] Script domain detected: " + scriptDomain);

  var apiHost = scriptDomain; // même domaine
  console.log("[AIChatWidget] Using API host: " + apiHost);

  var settingsUrl = apiHost + "/api/widget/${widgetId}/settings";
  console.log("[AIChatWidget] Fetching settings from: " + settingsUrl);

  window[WIDGET_NS] = {
    destroy: function () {
      try {
        var c = document.querySelector('[data-tnow-widget-container="${widgetId}"]');
        if (c && c.parentNode) c.parentNode.removeChild(c);
        delete window[WIDGET_NS];
      } catch (e) {}
    },
  };

  function px(n){ return typeof n === "number" ? (n + "px") : n; }

  fetch(settingsUrl, {
    method: "GET", credentials: "omit", headers: { "Accept": "application/json" }
  })
  .then(function (res) {
    console.log("[AIChatWidget] Settings response status:", res.status);
    return res.json().catch(function(){ return {}; }).then(function (json){ return {res:res, json:json}; });
  })
  .then(function (payload) {
    var res = payload.res, data = payload.json;
    if (!res.ok || !data || (!data.settings && !data.config)) {
      throw new Error("Settings load failed");
    }
    var s = data.settings || data.config || {};
    console.log("[AIChatWidget] Settings loaded successfully");

    // Final settings (calqués sur ce que tu as dans ta DB/types)
    var minimizedSize = (s.minimizedSize === "small") ? 56 : (s.minimizedSize === "large" ? 72 : 64);
    var buttonSize = s.buttonSize || minimizedSize;
    var placement = s.placement || "bottom-right";
    var theme = s.theme || "light";
    var themeColor = s.themeColor || s.primaryColor || "#4f46e5";
    var template = s.template || "professional"; // prêt si tu gères plusieurs templates
    var width = s.width || 360;
    var height = s.height || 520;

    console.log("[AIChatWidget] Final settings:", {
      template: template,
      minimizedSize: (s.minimizedSize || "medium"),
      minimizedSizePixels: minimizedSize,
      buttonSize: buttonSize
    });

    // Container (bouton + panel)
    var container = document.createElement("div");
    container.setAttribute("data-tnow-widget-container", "${widgetId}");
    container.style.position = "fixed";
    container.style.zIndex = "2147483647";
    container.style.width = px(buttonSize);
    container.style.height = px(buttonSize);

    var margin = 20;
    if (placement.indexOf("bottom") !== -1) container.style.bottom = px(margin);
    if (placement.indexOf("top") !== -1) container.style.top = px(margin);
    if (placement.indexOf("right") !== -1) container.style.right = px(margin);
    if (placement.indexOf("left") !== -1) container.style.left = px(margin);

    var btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("aria-label", "Open chat");
    btn.style.width = px(buttonSize);
    btn.style.height = px(buttonSize);
    btn.style.borderRadius = "50%";
    btn.style.border = "0";
    btn.style.cursor = "pointer";
    btn.style.boxShadow = "0 10px 30px rgba(0,0,0,0.25)";
    btn.style.background = themeColor;
    btn.style.color = "#fff";
    btn.style.display = "flex";
    btn.style.alignItems = "center";
    btn.style.justifyContent = "center";
    btn.style.fontSize = "24px";
    btn.style.lineHeight = "1";
    btn.textContent = "💬";

    var panel = document.createElement("div");
    panel.style.position = "fixed";
    panel.style.display = "none";
    panel.style.boxShadow = "0 24px 64px rgba(0,0,0,0.32)";
    panel.style.borderRadius = "16px";
    panel.style.overflow = "hidden";
    panel.style.width = px(width);
    panel.style.height = px(height);

    var lift = (buttonSize + 12);
    if (placement.indexOf("bottom") !== -1) panel.style.bottom = px(lift);
    if (placement.indexOf("top") !== -1) panel.style.top = px(lift);
    if (placement.indexOf("right") !== -1) panel.style.right = px(margin);
    if (placement.indexOf("left") !== -1) panel.style.left = px(margin);

    // iFrame → charge ta page widget (la même que le preview) avec overrides dynamiques
    var iframeSrc = scriptDomain + "/widget/${widgetId}"
      + "?theme=" + encodeURIComponent(theme)
      + "&themeColor=" + encodeURIComponent(themeColor)
      + "&template=" + encodeURIComponent(template);

    console.log("[AIChatWidget] Loading iframe from: " + iframeSrc);

    var iframe = document.createElement("iframe");
    iframe.src = iframeSrc;
    iframe.title = "AI Chat";
    iframe.allow = "clipboard-write; microphone; autoplay";
    iframe.style.border = "0";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.onload = function () {
      console.log("[AIChatWidget] Widget iframe loaded successfully");
    };

    panel.appendChild(iframe);
    container.appendChild(panel);
    container.appendChild(btn);
    document.body.appendChild(container);

    var open = false;
    function setOpen(v){ open = v; panel.style.display = open ? "block" : "none"; }
    btn.addEventListener("click", function(){ setOpen(!open); });

    window.addEventListener("message", function(ev){
      if (!ev || !ev.data) return;
      try{
        var d = ev.data;
        if (d && d.type === "tnow:resize" && typeof d.width === "number" && typeof d.height === "number") {
          panel.style.width = px(d.width);
          panel.style.height = px(d.height);
        }
        if (d && d.type === "tnow:close") setOpen(false);
        if (d && d.type === "tnow:open") setOpen(true);
      }catch(e){}
    });

    console.log("[AIChatWidget] Widget initialized successfully with settings:", {
      widgetId: "${widgetId}",
      theme: theme,
      themeColor: themeColor,
      baseUrl: scriptDomain,
      placement: placement
    });
    console.log("[AIChatWidget] Widget ready! ✓");
  })
  .catch(function (err) {
    console.error("[AIChatWidget] Failed to initialize:", err);
  });
})();
  `;

  return new NextResponse(script, {
    status: 200,
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

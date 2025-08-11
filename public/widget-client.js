// public/widget-client.js
window.AIChatWidget = {
  init: function ({ widgetId }) {
    if (document.getElementById("ai-chat-widget")) return;

    const iframe = document.createElement("iframe");
    iframe.id = "ai-chat-widget";
    iframe.src = `https://testyourainow.com/widget/${widgetId}`;
    iframe.style.position = "fixed";
    iframe.style.bottom = "24px";
    iframe.style.right  = "24px";

    // 👉 taille "fermée" = juste le bouton
    iframe.style.width  = "72px";
    iframe.style.height = "72px";

    iframe.style.border = "none";
    iframe.style.zIndex = "2147483647";
    iframe.style.borderRadius = "18px";
    iframe.style.background = "transparent";
    iframe.setAttribute("allowtransparency", "true");

    // Mobile offset léger
    const mq = window.matchMedia("(max-width: 600px)");
    function place() {
      if (mq.matches) { iframe.style.bottom = "16px"; iframe.style.right = "16px"; }
      else { iframe.style.bottom = "24px"; iframe.style.right = "24px"; }
    }
    mq.addEventListener?.("change", place);
    place();

    // 👉 écoute les messages venant du widget pour redimensionner
    window.addEventListener("message", (event) => {
      const d = event.data;
      if (!d || d.source !== "TYAN_WIDGET") return;
      if (d.type === "RESIZE" && typeof d.width === "number" && typeof d.height === "number") {
        iframe.style.width  = d.width + "px";
        iframe.style.height = d.height + "px";
      }
    });

    document.body.appendChild(iframe);
  }
};

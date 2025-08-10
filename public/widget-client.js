window.AIChatWidget = {
  init: function ({ widgetId }) {
    // Évite le double chargement
    if (document.getElementById("ai-chat-widget")) return;

    // Crée un <iframe> pour charger ton widget SSR
    const iframe = document.createElement("iframe");
    iframe.id = "ai-chat-widget";
    iframe.src = `https://testyourainow.com/widget/${widgetId}`;
    iframe.style.position = "fixed";
    iframe.style.bottom = "24px";
    iframe.style.right = "24px";
    iframe.style.width = "100%";
    iframe.style.maxWidth = "400px";
    iframe.style.height = "600px";
    iframe.style.maxHeight = "90vh";
    iframe.style.border = "none";
    iframe.style.zIndex = "999999";
    iframe.style.borderRadius = "18px";
    iframe.style.boxShadow = "0 10px 25px rgba(0, 0, 0, 0.3)";
    iframe.style.transition = "all 0.3s ease";
    iframe.style.backgroundColor = "transparent"; // 🆕 AJOUTÉ
    iframe.style.overflow = "hidden"; // 🆕 AJOUTÉ
    
    // 🆕 IMPORTANT: Permettre la transparence
    iframe.setAttribute('allowtransparency', 'true');
    iframe.setAttribute('frameborder', '0');

    const mediaQuery = window.matchMedia("(max-width: 600px)");
    function adaptSize() {
      if (mediaQuery.matches) {
        iframe.style.width = "95%";
        iframe.style.height = "80vh";
        iframe.style.right = "2.5%";
        iframe.style.bottom = "2.5%";
        iframe.style.borderRadius = "12px";
      } else {
        iframe.style.width = "100%";
        iframe.style.maxWidth = "400px";
        iframe.style.height = "600px";
        iframe.style.bottom = "24px";
        iframe.style.right = "24px";
        iframe.style.borderRadius = "18px";
      }
    }

    mediaQuery.addListener(adaptSize);
    adaptSize();

    document.body.appendChild(iframe);
  }
};
// app/widget/[widgetId]/page.tsx
import { connectToDatabase } from "@/lib/db";
import { ChatbotConfig } from "@/models/ChatbotConfig";
import { ChatWidgetConfig } from "@/types/ChatWidgetConfig";
import { notFound } from "next/navigation";

// 🔘 BOUTON LANCEUR (optionnel si tu affiches directement le chat)
function WidgetButton({ color, onClick }: { color: string; onClick: () => void }) {
  return (
    <div style={{
      width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <button
        onClick={onClick}
        aria-label="Open chat"
        style={{
          width: 56, height: 56, borderRadius: "50%", border: 0, cursor: "pointer",
          boxShadow: "0 10px 30px rgba(0,0,0,.25)", background: color, color: "#fff", fontSize: 24, lineHeight: 1
        }}
      >💬</button>
    </div>
  );
}

// 🧩 CHAT UI minimal (remplace-le par ton beau “preview” si tu veux)
function ChatUI({ config }: { config: ChatWidgetConfig }) {
  const dark = config.theme === "dark";
  return (
    <div
      style={{
        width: "100vw", height: "100vh",
        background: dark ? "#0b0f19" : "#ffffff",
        color: dark ? "#e5e7eb" : "#111827",
        fontFamily: "Inter,system-ui,Arial", display: "flex", flexDirection: "column"
      }}
    >
      <div style={{
        background: config.primaryColor, color: "#fff",
        padding: "16px", fontWeight: 600, minHeight: 64, display: "flex", alignItems: "center"
      }}>
        {config.chatTitle || "Chat"}
      </div>

      <div id="msgs" style={{
        flex: 1, overflow: "auto", padding: 16,
        background: dark ? "#111827" : "#f9fafb"
      }} />

      <div style={{
        display: "flex", gap: 8, padding: 12,
        borderTop: dark ? "1px solid rgba(255,255,255,.08)" : "1px solid rgba(0,0,0,.08)"
      }}>
        <input
          id="inp"
          placeholder={config.placeholderText || "Écris ton message..."}
          style={{
            flex: 1, padding: "10px 12px", borderRadius: 10,
            border: dark ? "1px solid rgba(255,255,255,.16)" : "1px solid rgba(0,0,0,.16)",
            background: dark ? "#0f1422" : "#fff", color: "inherit"
          }}
        />
        <button id="send" className="btn" style={{
          padding: "10px 14px", borderRadius: 10, border: 0,
          background: config.primaryColor, color: "#fff", cursor: "pointer"
        }}>Envoyer</button>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function(){
              var cfg = ${JSON.stringify({
                welcomeMessage: true,
              })};
              var msgs = document.getElementById("msgs");
              function addMsg(t, who){
                var d = document.createElement("div");
                d.style.margin = "8px 0";
                d.style.textAlign = who === "bot" ? "left" : "right";
                d.textContent = t;
                msgs.appendChild(d);
                msgs.scrollTop = msgs.scrollHeight;
              }
              // message d'accueil si présent
              var wm = ${JSON.stringify(null)}; // on laisse le serveur le gérer via config ci-dessous
              if (wm && wm.length) addMsg(wm, "bot");

              var inp = document.getElementById("inp");
              var send = document.getElementById("send");
              async function ask(){
                var t = inp.value.trim();
                if(!t) return;
                addMsg(t, "me");
                inp.value = "";
                try{
                  var r = await fetch("/api/widget/ask", {
                    method: "POST", headers: {"Content-Type":"application/json"},
                    body: JSON.stringify({ widgetId: "${/* will be injected in parent */""}", message: t })
                  });
                  var data = await r.json();
                  addMsg(data.reply || "…", "bot");
                }catch(e){
                  addMsg("Erreur réseau.", "bot");
                }
              }
              send.addEventListener("click", ask);
              inp.addEventListener("keydown", function(e){ if(e.key==="Enter") ask(); });
            })();`
        }}
      />
    </div>
  );
}

// 🚀 PAGE SERVEUR — aucun headers(), aucun Promise dans les types de params
export default async function WidgetPage({
  params,
  searchParams,
}: {
  params: { widgetId: string };
  searchParams: { [k: string]: string | string[] | undefined };
}) {
  await connectToDatabase();

  const widgetId = params.widgetId;
  const raw = await ChatbotConfig.findById(widgetId).lean<ChatWidgetConfig>();
  if (!raw) return notFound();

  // on clone proprement (lean + JSON)
  const base = JSON.parse(JSON.stringify(raw)) as ChatWidgetConfig;

  // ✅ Overrides dynamiques via search params (comme l’autre site)
  const themeFromUrl = (searchParams.theme as string) || "";
  const themeColorFromUrl = (searchParams.themeColor as string) || "";
  const templateFromUrl = (searchParams.template as string) || ""; // prêt pour plus tard

  const config: ChatWidgetConfig = {
    ...base,
    theme: (themeFromUrl === "dark" || themeFromUrl === "light") ? (themeFromUrl as "dark"|"light") : base.theme,
    primaryColor: themeColorFromUrl ? decodeURIComponent(themeColorFromUrl) : base.primaryColor,
    // tu peux aussi brancher "template" dans ta logique interne si tu en as besoin
  };

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
        <title>{config.chatTitle || "Chat"}</title>
      </head>
      <body style={{ margin: 0, padding: 0, overflow: "hidden" }}>
        <ChatUI config={config} />
      </body>
    </html>
  );
}

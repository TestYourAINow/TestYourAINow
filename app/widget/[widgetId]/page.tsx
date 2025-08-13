// app/widget/[widgetId]/page.tsx
// Page iFrame ultra-safe (aucun import, aucun typage strict, pas de DB)
// -> évite les 500, accepte les variables dynamiques (searchParams), rendu plein écran.

export const dynamic = "force-dynamic"; // pas de static optimization

export default async function WidgetPage({ params, searchParams }: any) {
  const widgetId = params?.widgetId;

  // 1) Récupère les settings via ton API (relatif => même origine, pas d’URL absolue)
  let payload: any = null;
  try {
    const res = await fetch(`/api/widget/${widgetId}/settings`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    payload = await res.json();
  } catch (e: any) {
    payload = { error: String(e?.message || e) };
  }

  // 2) Sécurise le chargement
  if (!payload || payload.error) {
    return (
      <html>
        <body style={{ margin: 0, fontFamily: "system-ui, Arial" }}>
          <div style={{ padding: 16, color: "#b91c1c", background: "#fef2f2" }}>
            <b>Widget error:</b> {payload?.error || "Failed to load settings"}
          </div>
        </body>
      </html>
    );
  }

  const s = payload.settings || payload.config || {};

  // 3) Variables dynamiques (priorité aux searchParams passés par widget.js)
  const themeParam = (searchParams?.theme as string) || "";
  const theme =
    themeParam === "dark" || themeParam === "light"
      ? themeParam
      : (s.theme || "light");

  const themeColorParam = (searchParams?.themeColor as string) || "";
  const themeColor =
    themeColorParam ? decodeURIComponent(themeColorParam) : (s.themeColor || s.primaryColor || "#4f46e5");

  const template = (searchParams?.template as string) || s.template || "professional";

  const dark = theme === "dark";

  // 4) UI minimaliste (remplace plus tard par ton “beau preview”)
  return (
    <html>
      <head>
        <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
        <title>{s.ui?.chatTitle || "Chat"}</title>
        <style>{`
          :root { --pri: ${themeColor}; }
          html, body { height: 100%; }
          body {
            margin: 0;
            background: ${dark ? "#0b0f19" : "#ffffff"};
            color: ${dark ? "#e5e7eb" : "#111827"};
            font-family: Inter, system-ui, Arial;
          }
          .card { width: 100%; height: 100vh; display: flex; flex-direction: column; }
          .header { padding: 12px 16px; font-weight: 600; background: var(--pri); color: #fff; }
          .messages { flex: 1; overflow: auto; padding: 12px 16px; background: ${dark ? "#111827" : "#f9fafb"}; }
          .input { display: flex; gap: 8px; padding: 12px; border-top: 1px solid ${dark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.08)"}; }
          .input input { flex: 1; padding: 10px 12px; border-radius: 10px; border: 1px solid ${dark ? "rgba(255,255,255,.16)" : "rgba(0,0,0,.16)"}; background: ${dark ? "#0f1422" : "#fff"}; color: inherit; }
          .btn { padding: 10px 14px; border-radius: 10px; border: 0; background: var(--pri); color:#fff; cursor: pointer; }
        `}</style>
      </head>
      <body>
        <div className="card">
          <div className="header">
            {(s.ui?.chatTitle || "Chat")} {template !== "professional" ? `— ${template}` : ""}
          </div>
          <div id="msgs" className="messages"></div>
          <div className="input">
            <input id="inp" placeholder={s.ui?.placeholder || "Écris ton message..."} />
            <button id="send" className="btn">Envoyer</button>
          </div>
        </div>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                var msgs = document.getElementById("msgs");
                function addMsg(t, who){
                  var d = document.createElement("div");
                  d.style.margin = "8px 0";
                  d.style.textAlign = who === "bot" ? "left" : "right";
                  d.textContent = t;
                  msgs.appendChild(d);
                  msgs.scrollTop = msgs.scrollHeight;
                }
                var welcome = ${JSON.stringify(s.ui?.welcomeMessage || "")};
                var showWelcome = ${JSON.stringify(s.ui?.showWelcomeMessage !== false)};
                if (showWelcome && welcome) addMsg(welcome, "bot");

                var inp = document.getElementById("inp");
                var send = document.getElementById("send");
                async function ask(){
                  var t = inp.value.trim();
                  if(!t) return;
                  addMsg(t, "me");
                  inp.value = "";
                  try{
                    var r = await fetch("/api/widget/ask", {
                      method:"POST",
                      headers:{ "Content-Type":"application/json" },
                      body: JSON.stringify({ widgetId: ${JSON.stringify(widgetId)}, message: t })
                    });
                    var data = await r.json();
                    addMsg(data.reply || "…", "bot");
                  }catch(e){
                    addMsg("Erreur réseau.", "bot");
                  }
                }
                send.addEventListener("click", ask);
                inp.addEventListener("keydown", function(e){ if(e.key==="Enter") ask(); });
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}

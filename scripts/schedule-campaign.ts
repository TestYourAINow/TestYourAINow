import { MongoClient } from "mongodb";
import * as fs from "fs";
import * as path from "path";

const envPath = path.resolve(process.cwd(), ".env");
for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const idx = trimmed.indexOf("=");
  if (idx === -1) continue;
  const key = trimmed.slice(0, idx).trim();
  const val = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "");
  if (key && !process.env[key]) process.env[key] = val;
}

const EXCLUDED = new Set([
  "raphaelpanor13@gmail.com", "aikumis@higgsfield.ai", "sango_ks@hotmail.com",
  "idummyaccount@testyourainow.com", "isango.ai@hotmail.com", "naruto123@hotmail.com",
  "marcus.bien-aime@live.ca", "jsjsjs@hotmail.com", "hecib46084@bipochub.com", "jesuisunannase@gmail.com"
]);

async function brevo(method: string, endpoint: string, body?: object) {
  const res = await fetch("https://api.brevo.com/v3" + endpoint, {
    method,
    headers: { "api-key": process.env.BREVO_API_KEY!, "Content-Type": "application/json", "Accept": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  return { status: res.status, data: text ? JSON.parse(text) : {} };
}

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

async function main() {
  console.log("\n=== Schedule Campaign ===\n");

  // 1. Get contacts from MongoDB
  const client = new MongoClient(process.env.MONGODB_URI!);
  await client.connect();
  const users = await client.db("testmyai-db").collection("users")
    .find({ isSubscribed: { $ne: true } }, { projection: { email: 1 } }).toArray();
  await client.close();

  const emails = [...new Set(
    users
      .map((u: { email?: string }) => u.email?.toLowerCase().trim())
      .filter((e): e is string => !!e && !EXCLUDED.has(e))
  )];
  console.log(`${emails.length} contacts eligibles.`);

  // 2. Create list
  const { data: list } = await brevo("POST", "/contacts/lists", { name: "Re-engagement Avril 2026", folderId: 1 });
  console.log(`Liste créée — id: ${list.id}`);

  // 3. Import contacts
  await brevo("POST", "/contacts/import", {
    listIds: [list.id],
    jsonBody: emails.map((email) => ({ email })),
    updateExistingContacts: true,
  });
  console.log("Import lancé. Attente 8 secondes...");
  await sleep(8000);

  // 4. Verify
  const { data: check } = await brevo("GET", `/contacts/lists/${list.id}/contacts?limit=5`);
  const confirmed = check.contacts?.length ?? 0;
  console.log(`Contacts confirmés dans la liste: ${confirmed} (aperçu sur 5)`);
  if (confirmed === 0) { console.log("ERREUR: liste vide, abandon."); return; }

  // 5. Schedule campaign 4 — Sunday April 19 2026 at 9h ET = 13h UTC
  const { status } = await brevo("PUT", "/emailCampaigns/4", {
    recipients: { listIds: [list.id] },
    scheduledAt: "2026-04-19T13:00:00+00:00",
  });
  console.log(`Campagne mise à jour. Status: ${status}`);
  console.log("\nProgrammé: dimanche 19 avril 2026 à 9h00 ET.");
  console.log("Brevo enverra automatiquement. Rien à faire dimanche.");
}

main().catch(console.error);

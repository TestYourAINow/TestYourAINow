import { MongoClient } from "mongodb";
import * as fs from "fs";
import * as path from "path";

const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "");
    if (key && !process.env[key]) process.env[key] = val;
  }
}

async function main() {
  const uri = process.env.MONGODB_URI!;
  const client = new MongoClient(uri);
  await client.connect();

  const db = client.db("testmyai-db");
  const users = await db.collection("users")
    .find({}, { projection: { email: 1, isSubscribed: 1, createdAt: 1 } })
    .sort({ createdAt: 1 })
    .toArray();

  console.log(`\nTotal: ${users.length} comptes\n`);
  console.log("email | statut | date inscription");
  console.log("------|--------|------------------");
  for (const u of users) {
    const status = u.isSubscribed ? "ABONNE" : "non-abonne";
    const date = u.createdAt ? new Date(u.createdAt).toISOString().slice(0, 10) : "?";
    console.log(`${u.email} | ${status} | ${date}`);
  }

  await client.close();
}

main().catch(console.error);

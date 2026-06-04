/**
 * Le .env.cloudflare e valida CLOUDFLARE_API_TOKEN (evita parser CMD quebrado).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(root, ".env.cloudflare");

if (!fs.existsSync(envPath)) {
  console.error("ERRO: .env.cloudflare nao existe.");
  console.error("Copie: copy .env.cloudflare.example .env.cloudflare");
  process.exit(1);
}

let token = "";
for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq < 0) continue;
  const key = trimmed.slice(0, eq).trim();
  const value = trimmed.slice(eq + 1).trim();
  if (key === "CLOUDFLARE_API_TOKEN") token = value;
}

if (!token) {
  console.error("ERRO: CLOUDFLARE_API_TOKEN vazio em .env.cloudflare");
  console.error("Edite o arquivo: uma linha CLOUDFLARE_API_TOKEN=seu_token");
  process.exit(1);
}

process.env.CLOUDFLARE_API_TOKEN = token;
console.log("Token Cloudflare carregado (.env.cloudflare).");

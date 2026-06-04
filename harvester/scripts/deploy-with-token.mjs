/**
 * Build + deploy com CLOUDFLARE_API_TOKEN (.env.cloudflare)
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const bun = process.env.BUN_INSTALL_BIN || process.execPath;
const envPath = path.join(root, ".env.cloudflare");

function loadToken() {
  if (!fs.existsSync(envPath)) {
    console.error("ERRO: .env.cloudflare nao existe. Copie .env.cloudflare.example");
    process.exit(1);
  }
  let token = "";
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    if (t.slice(0, i).trim() === "CLOUDFLARE_API_TOKEN") {
      token = t.slice(i + 1).trim();
    }
  }
  if (!token) {
    console.error("ERRO: CLOUDFLARE_API_TOKEN vazio. Edite .env.cloudflare");
    process.exit(1);
  }
  return token;
}

function run(args) {
  const r = spawnSync(bun, args, {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

process.env.CLOUDFLARE_API_TOKEN = loadToken();
delete process.env.WRANGLER_LOG;
process.env.BUN_INSTALL_BIN = bun;

console.log("=== Deploy com API Token ===\n");
run(["scripts/prebuild-clean.mjs"]);
run(["install"]);
run(["run", "build"]);

const wrangler = spawnSync("cmd", ["/c", path.join(root, "scripts", "wrangler-deploy.cmd")], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});
if (wrangler.status !== 0) process.exit(wrangler.status ?? 1);

console.log("\nOK: https://scouttapi.inovatitech.com.br");

/**
 * Apos o build Nitro, adiciona rota do scouttapi ao wrangler.json gerado.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const wranglerPath = path.join(root, "dist", "server", "wrangler.json");

if (!fs.existsSync(wranglerPath)) {
  console.warn("[patch-wrangler] dist/server/wrangler.json nao existe — rode build antes.");
  process.exit(0);
}

const cfg = JSON.parse(fs.readFileSync(wranglerPath, "utf8"));
cfg.routes = ["scouttapi.inovatitech.com.br/*"];
fs.writeFileSync(wranglerPath, JSON.stringify(cfg, null, 2) + "\n");
console.log("[patch-wrangler] routes:", cfg.routes);

const deployCmd = path.join(root, "scripts", "DEPLOY-DIST-SERVER.cmd");
const deployDest = path.join(root, "dist", "server", "DEPLOY.cmd");
if (fs.existsSync(deployCmd)) {
  fs.copyFileSync(deployCmd, deployDest);
  console.log("[patch-wrangler] copiado:", deployDest);
}

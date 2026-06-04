/**
 * Lista deploys do Worker via API Cloudflare (estavel no Windows).
 * Usa token OAuth do wrangler (~/.wrangler/config/default.toml).
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const serverDir = path.join(root, "dist", "server");
const configPath = path.join(serverDir, "wrangler.json");

if (!fs.existsSync(configPath)) {
  console.error("ERRO: dist/server/wrangler.json ausente. Rode DEPLOY-CLOUDFLARE.cmd antes.");
  process.exit(1);
}

const { name: workerName } = JSON.parse(fs.readFileSync(configPath, "utf8"));
const bunBin = process.env.BUN_INSTALL_BIN || process.execPath;

function wranglerConfigPath() {
  const home = os.homedir();
  const candidates = [
    path.join(home, "AppData", "Roaming", "xdg.config", ".wrangler", "config", "default.toml"),
    path.join(home, ".wrangler", "config", "default.toml"),
    path.join(home, ".config", ".wrangler", "config", "default.toml"),
  ];
  return candidates.find((p) => fs.existsSync(p));
}

function readOAuthToken() {
  if (process.env.CLOUDFLARE_API_TOKEN) {
    return { token: process.env.CLOUDFLARE_API_TOKEN, source: "CLOUDFLARE_API_TOKEN" };
  }
  const cfg = wranglerConfigPath();
  if (!cfg) return null;
  const text = fs.readFileSync(cfg, "utf8");
  const token = text.match(/oauth_token\s*=\s*"([^"]+)"/)?.[1];
  const exp = text.match(/expiration_time\s*=\s*"([^"]+)"/)?.[1];
  if (!token) return null;
  if (exp && new Date(exp) < new Date()) {
    return { token: null, expired: exp };
  }
  return { token, source: cfg };
}

async function cfFetch(pathname, token) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${pathname}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();
  if (!data.success) {
    const msg = data.errors?.[0]?.message || res.statusText || "erro API Cloudflare";
    throw new Error(msg);
  }
  return data.result;
}

async function fetchDeploymentsApi(token) {
  const accounts = await cfFetch("/accounts", token);
  const list = Array.isArray(accounts) ? accounts : [accounts];
  const accountId = list[0]?.id;
  if (!accountId) {
    throw new Error("nenhuma conta Cloudflare no token");
  }

  const result = await cfFetch(
    `/accounts/${accountId}/workers/scripts/${workerName}/deployments`,
    token,
  );

  if (Array.isArray(result)) return result;
  if (result?.deployments && Array.isArray(result.deployments)) {
    return result.deployments;
  }
  return [];
}

function extractJsonArray(text) {
  const combined = String(text || "").trim();
  if (!combined) return null;
  const start = combined.indexOf("[");
  if (start < 0) return null;
  let depth = 0;
  let end = -1;
  for (let i = start; i < combined.length; i++) {
    if (combined[i] === "[") depth++;
    else if (combined[i] === "]") {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end < 0) return null;
  return JSON.parse(combined.slice(start, end + 1));
}

function fetchDeploymentsWrangler() {
  const env = { ...process.env };
  delete env.WRANGLER_LOG;
  delete env.CI;
  const r = spawnSync(bunBin, ["x", "wrangler", "deployments", "list", "--json"], {
    cwd: serverDir,
    encoding: "utf8",
    env,
    maxBuffer: 16 * 1024 * 1024,
    timeout: 120_000,
  });
  const combined = [r.stdout, r.stderr].filter(Boolean).join("\n");
  if (r.status !== 0) return null;
  return extractJsonArray(combined);
}

function fmtDate(iso) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("pt-BR");
  } catch {
    return iso;
  }
}

function versionsFromDeployments(deployments) {
  const byId = new Map();
  for (const d of deployments) {
    const when = d.created_on;
    for (const v of d.versions || []) {
      const id = v.version_id;
      if (!id) continue;
      const prev = byId.get(id);
      if (!prev || new Date(when) > new Date(prev.when)) {
        byId.set(id, { id, when, pct: v.percentage });
      }
    }
  }
  return [...byId.values()].sort(
    (a, b) => new Date(b.when).getTime() - new Date(a.when).getTime(),
  );
}

function deploymentMessage(d) {
  return (
    d.annotations?.["workers/message"] ??
    d.annotations?.["workers/triggered_by"] ??
    d.source ??
    "-"
  );
}

async function loadDeployments() {
  const auth = readOAuthToken();
  if (auth?.expired) {
    throw new Error(`token OAuth expirou em ${auth.expired}. Veja WRANGLER-LOGIN-LEIA-ME.txt`);
  }
  if (auth?.token) {
    try {
      const list = await fetchDeploymentsApi(auth.token);
      if (list.length) {
        console.log("(fonte: API Cloudflare)");
        return list;
      }
    } catch (err) {
      console.warn("(API falhou:", err.message + "; tentando wrangler CLI...)");
    }
  }

  const cli = fetchDeploymentsWrangler();
  if (cli?.length) {
    console.log("(fonte: wrangler CLI)");
    return cli;
  }

  if (!auth?.token) {
    throw new Error("sem token. Rode WRANGLER-LOGIN.cmd ou defina CLOUDFLARE_API_TOKEN");
  }
  throw new Error("nao foi possivel listar deploys (API e CLI falharam)");
}

console.log("Pasta:", serverDir);
console.log("Worker:", workerName);
console.log("URL: https://scouttapi.inovatitech.com.br");
console.log("");

try {
  console.log("=== Ultimos deploys ===");
  const deployments = await loadDeployments();
  const sorted = [...deployments].sort(
    (a, b) => new Date(b.created_on).getTime() - new Date(a.created_on).getTime(),
  );
  for (const d of sorted.slice(0, 10)) {
    const ver = d.versions?.[0]?.version_id ?? "-";
    const verShort = ver.length > 8 ? `${ver.slice(0, 8)}...` : ver;
    console.log(`- ${fmtDate(d.created_on)} | ${verShort} | ${deploymentMessage(d)}`);
  }

  console.log("");
  console.log("=== Versoes (dos deploys acima) ===");
  const versions = versionsFromDeployments(deployments);
  for (const v of versions.slice(0, 10)) {
    const pct = v.pct != null ? `${v.pct}%` : "-";
    console.log(`- ${fmtDate(v.when)} | ${v.id} | trafego ${pct}`);
  }

  if (versions[0]) {
    console.log("");
    console.log("Versao em producao (mais recente):", versions[0].id);
  }
} catch (err) {
  console.error("ERRO:", err.message);
  console.error("Leia: harvester\\WRANGLER-LOGIN-LEIA-ME.txt");
  process.exit(1);
}

/**
 * Evita EEXIST no OneDrive:
 * - .vite-temp -> junction em %TEMP%
 * - .nitro/vite/... -> remove antes do build (nao usar junction em .nitro inteiro)
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function removePath(p) {
  try {
    fs.rmSync(p, { recursive: true, force: true, maxRetries: 8, retryDelay: 120 });
  } catch {
    // ignore
  }
}

function isJunctionTo(link, dest) {
  try {
    const st = fs.lstatSync(link);
    if (!st.isSymbolicLink()) return false;
    const resolved = fs.realpathSync(link);
    const destResolved = fs.realpathSync(dest);
    return resolved.toLowerCase() === destResolved.toLowerCase();
  } catch {
    return false;
  }
}

function ensureViteTempJunction() {
  const link = path.join(root, "node_modules", ".vite-temp");
  const target = path.join(os.tmpdir(), "scouttapi-harvester-vite-temp");
  fs.mkdirSync(target, { recursive: true });

  if (isJunctionTo(link, target)) {
    console.log("[prebuild-clean] .vite-temp junction OK");
    return;
  }

  removePath(link);
  if (process.platform === "win32") {
    execSync(`cmd /c mklink /J "${link}" "${target}"`, { stdio: "pipe" });
  } else {
    fs.symlinkSync(target, link, "dir");
  }
  console.log("[prebuild-clean] .vite-temp ->", target);
}

function cleanNitroBuildCache() {
  const nitroRoot = path.join(root, "node_modules", ".nitro");
  // Se .nitro for junction antigo (teste anterior), remover
  try {
    if (fs.lstatSync(nitroRoot).isSymbolicLink()) {
      fs.rmSync(nitroRoot, { recursive: true, force: true });
      console.log("[prebuild-clean] removido junction antigo em .nitro");
    }
  } catch {
    // nao existe
  }

  const targets = [
    path.join(nitroRoot, "vite", "services", "ssr"),
    path.join(nitroRoot, "vite", "services"),
    path.join(nitroRoot, "vite"),
  ];
  for (const p of targets) {
    if (fs.existsSync(p)) {
      removePath(p);
      console.log("[prebuild-clean] limpo:", path.relative(root, p));
    }
  }
}

ensureViteTempJunction();
cleanNitroBuildCache();
console.log("[prebuild-clean] pronto");

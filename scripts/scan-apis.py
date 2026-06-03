#!/usr/bin/env python3
"""
Escaneia um repositório e gera inventário de APIs + documentação Markdown.
Uso: python scan-apis.py --root PATH --out docs
"""

from __future__ import annotations

import argparse
import html
import json
import re
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable

__version__ = "1.4.0"

SKIP_DIRS = {
    "node_modules", ".git", "dist", "build", "vendor", "__pycache__",
    ".venv", "venv", ".next", "coverage", ".turbo", "target", "bin", "obj",
    ".cursor", "terminals",
}
SKIP_EXT = {".min.js", ".map", ".lock", ".png", ".jpg", ".ico", ".woff", ".woff2"}
CODE_EXT = {
    ".py", ".js", ".ts", ".tsx", ".jsx", ".go", ".java", ".kt", ".cs",
    ".rb", ".php", ".rs", ".yaml", ".yml", ".json", ".graphql", ".gql",
}

OPENAPI_NAMES = {"openapi.yaml", "openapi.yml", "openapi.json", "swagger.yaml", "swagger.json"}

EXPRESS_ROUTE_RE = re.compile(
    r"\b(app|\w+Router)\.(get|post|put|patch|delete|all)\s*\(\s*['\"`]([^'\"`]+)",
    re.I,
)

ROUTE_PATTERNS: list[tuple[str, re.Pattern[str]]] = [
    ("fastify", re.compile(r"\bfastify\.(get|post|put|patch|delete)\s*\(\s*['\"`]([^'\"`]+)", re.I)),
    ("nestjs", re.compile(r"@(Get|Post|Put|Patch|Delete)\s*\(\s*['\"`]([^'\"`]*)['\"`]?", re.I)),
    ("fastapi", re.compile(r"@(app|router)\.(get|post|put|patch|delete)\s*\(\s*['\"`]([^'\"`]+)", re.I)),
    ("flask", re.compile(r"@(?:app|bp)\.route\s*\(\s*['\"`]([^'\"`]+)", re.I)),
    ("spring", re.compile(r"@(Get|Post|Put|Patch|Delete|Request)Mapping\s*\(\s*(?:value\s*=\s*)?['\"`]([^'\"`]+)", re.I)),
    ("minimal_api", re.compile(r"\bapp\.Map(Get|Post|Put|Delete|Patch)\s*\(\s*['\"`]([^'\"`]+)", re.I)),
    ("gin", re.compile(r"\b(?:r|router|g)\.(GET|POST|PUT|PATCH|DELETE)\s*\(\s*['\"`]([^'\"`]+)", re.I)),
    ("go_http", re.compile(r"http\.HandleFunc\s*\(\s*['\"`]([^'\"`]+)", re.I)),
    ("laravel", re.compile(r"Route::(get|post|put|patch|delete)\s*\(\s*['\"`]([^'\"`]+)", re.I)),
]

MOUNT_RE = re.compile(
    r"\bapp\.use\s*\(\s*['\"`]([^'\"`]+)['\"`]\s*,\s*(\w+)",
    re.I,
)

CLIENT_PATTERNS: list[tuple[str, re.Pattern[str]]] = [
    ("fetch_url", re.compile(r"fetch\s*\(\s*['\"`](https?://[^'\"`]+)", re.I)),
    ("axios_url", re.compile(r"axios\.(?:get|post|put|delete|patch)\s*\(\s*['\"`](https?://[^'\"`]+)", re.I)),
    ("axios_create", re.compile(r"axios\.create\s*\(\s*\{[^}]*baseURL\s*:\s*['\"`](https?://[^'\"`]+)", re.I | re.S)),
    ("requests_url", re.compile(r"requests\.(?:get|post|put|delete)\s*\(\s*['\"`](https?://[^'\"`]+)", re.I)),
    ("httpx", re.compile(r"httpx\.(?:get|post|put|delete)\s*\(\s*['\"`](https?://[^'\"`]+)", re.I)),
    ("base_url", re.compile(r"baseURL\s*:\s*['\"`](https?://[^'\"`]+)", re.I)),
    ("env_url", re.compile(r"(?:process\.env\.|os\.(?:environ\.get|getenv)\(\s*['\"])([A-Z][A-Z0-9_]*(?:URL|_URI|_ENDPOINT)[A-Z0-9_]*)", re.I)),
]

OPENAPI_PATH_RE = re.compile(r"^\s{2,}(/[A-Za-z0-9_./{}:-]+):\s*$", re.M)
SECRET_RE = re.compile(
    r"(?:api[_-]?key|secret|password|token)\s*[:=]\s*['\"][^'\"]{8,}['\"]",
    re.I,
)


@dataclass
class ApiHit:
    kind: str
    method: str
    path: str
    file: str
    line: int
    framework: str = ""
    note: str = ""
    path_full: str = ""
    router_var: str = ""


@dataclass
class ScanResult:
    root: str
    scanned_at: str
    scanner_version: str
    stacks: list[str] = field(default_factory=list)
    hits: list[ApiHit] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)


def iter_files(root: Path) -> Iterable[Path]:
    for p in root.rglob("*"):
        if not p.is_file():
            continue
        if any(part in SKIP_DIRS for part in p.parts):
            continue
        if p.suffix.lower() not in CODE_EXT and p.name.lower() not in OPENAPI_NAMES:
            continue
        if any(p.name.endswith(s) for s in SKIP_EXT):
            continue
        try:
            if p.stat().st_size > 2_000_000:
                continue
        except OSError:
            continue
        yield p


def detect_stacks(files: list[Path]) -> list[str]:
    names = {f.name.lower() for f in files}
    stacks: list[str] = []
    if "package.json" in names:
        stacks.append("node")
    if "requirements.txt" in names or "pyproject.toml" in names:
        stacks.append("python")
    if "go.mod" in names:
        stacks.append("go")
    if any(n.endswith(".csproj") for n in names):
        stacks.append("dotnet")
    if "pom.xml" in names or "build.gradle" in names:
        stacks.append("java")
    return stacks or ["unknown"]


def join_paths(prefix: str, sub: str) -> str:
    if not prefix:
        return sub or "/"
    if sub in ("", "/"):
        return prefix if prefix.startswith("/") else f"/{prefix}"
    base = prefix.rstrip("/")
    suffix = sub if sub.startswith("/") else f"/{sub}"
    return f"{base}{suffix}"


def build_mount_map(hits: list[ApiHit]) -> dict[str, str]:
    mounts: dict[str, str] = {}
    for h in hits:
        if h.kind != "mount" or not h.note.startswith("router="):
            continue
        router = h.note.split("=", 1)[1].strip()
        mounts[router] = h.path if h.path.startswith("/") else f"/{h.path}"
    return mounts


def resolve_full_paths(hits: list[ApiHit]) -> None:
    mount_map = build_mount_map(hits)
    for h in hits:
        if h.kind != "route":
            continue
        if h.router_var and h.router_var in mount_map:
            h.path_full = join_paths(mount_map[h.router_var], h.path)
        else:
            h.path_full = h.path
        if h.path != h.path_full:
            h.note = f"rel={h.path}" + (f"; {h.note}" if h.note else "")


def parse_route_match(fw: str, m: re.Match[str]) -> tuple[str, str]:
    groups = m.groups()
    if fw == "flask":
        return "GET", groups[0] or "/"
    if fw == "go_http":
        return "GET", groups[0] or "/"
    if len(groups) >= 2:
        method, route = groups[0], groups[-1]
    else:
        method, route = "GET", groups[0] if groups else "/"
    method = (method or "GET").upper()
    if fw == "nestjs" and not route:
        route = "/"
    return method, route or "/"


def scan_openapi_file(path: Path, root: Path, hits: list[ApiHit]) -> None:
    rel = str(path.relative_to(root)).replace("\\", "/")
    try:
        text = path.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return
    hits.append(ApiHit("openapi", "", rel, rel, 0, note="spec file"))
    for m in OPENAPI_PATH_RE.finditer(text):
        hits.append(ApiHit("openapi", "", m.group(1), rel, 0, framework="openapi-path"))


def scan_mounts(text: str, rel: str, hits: list[ApiHit]) -> None:
    for i, line in enumerate(text.splitlines(), 1):
        for m in MOUNT_RE.finditer(line):
            prefix, router = m.group(1), m.group(2)
            hits.append(
                ApiHit(
                    "mount",
                    "",
                    prefix.rstrip("/"),
                    rel,
                    i,
                    framework="express-mount",
                    note=f"router={router}",
                )
            )


def scan_file(path: Path, root: Path, hits: list[ApiHit], warnings: list[str]) -> None:
    rel = str(path.relative_to(root)).replace("\\", "/")

    if path.name.lower() in OPENAPI_NAMES or (
        path.suffix.lower() in {".yaml", ".yml", ".json"} and "openapi" in path.name.lower()
    ):
        scan_openapi_file(path, root, hits)
        return

    try:
        text = path.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return

    if path.suffix in {".graphql", ".gql"}:
        hits.append(ApiHit("graphql", "", rel, rel, 0, note="schema file"))

    scan_mounts(text, rel, hits)

    for i, line in enumerate(text.splitlines(), 1):
        for m in EXPRESS_ROUTE_RE.finditer(line):
            receiver, method, route = m.group(1), m.group(2), m.group(3)
            method = (method or "GET").upper()
            router_var = receiver if receiver != "app" else ""
            hits.append(
                ApiHit(
                    "route",
                    method,
                    route or "/",
                    rel,
                    i,
                    framework="express",
                    router_var=router_var,
                )
            )

        for fw, pat in ROUTE_PATTERNS:
            for m in pat.finditer(line):
                method, route = parse_route_match(fw, m)
                hits.append(ApiHit("route", method, route, rel, i, framework=fw))

        for kind, pat in CLIENT_PATTERNS:
            for m in pat.finditer(line):
                val = m.group(1)
                hits.append(ApiHit("client", "", val, rel, i, framework=kind))

        if re.search(r"type\s+Query\s*\{", line) or re.search(r"type\s+Mutation\s*\{", line):
            hits.append(ApiHit("graphql", "", "inline schema", rel, i, note="graphql type"))

        if SECRET_RE.search(line):
            warnings.append(f"Possível segredo hardcoded: `{rel}:{i}`")


def dedupe_hits(hits: list[ApiHit]) -> list[ApiHit]:
    seen: set[tuple] = set()
    out: list[ApiHit] = []
    for h in hits:
        if h.kind == "mount":
            key = (h.kind, h.path, h.file, h.note, h.line)
        else:
            path_key = h.path_full or h.path
            key = (h.kind, h.method, path_key, h.file, h.router_var, h.line, h.framework)
        if key in seen:
            continue
        seen.add(key)
        out.append(h)
    return out


def render_markdown(result: ScanResult) -> str:
    mounts = [h for h in result.hits if h.kind == "mount"]
    routes = [h for h in result.hits if h.kind == "route"]
    clients = [h for h in result.hits if h.kind == "client"]
    specs = [h for h in result.hits if h.kind == "openapi"]
    gql = [h for h in result.hits if h.kind == "graphql"]

    lines = [
        f"# Documentação de APIs — {Path(result.root).name}",
        "",
        f"> Gerado em: {result.scanned_at}",
        f"> Scanner: v{result.scanner_version}",
        f"> Raiz: `{result.root}`",
        f"> Stacks: {', '.join(result.stacks) or 'n/d'}",
        "",
        "## Resumo",
        "",
        "| Tipo | Quantidade |",
        "|------|------------|",
        f"| Prefixos montados (app.use) | {len(mounts)} |",
        f"| Endpoints (caminho completo) | {len(routes)} |",
        f"| OpenAPI (arquivos + paths) | {len(specs)} |",
        f"| Clientes / URLs / env | {len(clients)} |",
        f"| GraphQL | {len(gql)} |",
        "",
        "## Prefixos de API (app.use)",
        "",
        "| Prefixo | Router | Arquivo |",
        "|---------|--------|---------|",
    ]
    for h in sorted(mounts, key=lambda x: x.path):
        lines.append(f"| `{h.path}` | {h.note or '—'} | `{h.file}` |")
    if not mounts:
        lines.append("| — | *Nenhum* | — |")

    lines += [
        "",
        "## APIs expostas (caminho completo)",
        "",
        "| Método | Caminho completo | Router | Arquivo | Linha |",
        "|--------|------------------|--------|---------|-------|",
    ]
    for h in sorted(routes, key=lambda x: (x.path_full or x.path, x.method)):
        full = h.path_full or h.path
        router = h.router_var or "app"
        lines.append(f"| {h.method} | `{full}` | {router} | `{h.file}` | {h.line} |")

    if not routes:
        lines.append("| — | *Nenhuma rota detectada automaticamente* | — | — | — |")

    lines += [
        "",
        "## Integrações / clientes HTTP",
        "",
        "| URL / variável | Tipo | Arquivo | Linha |",
        "|----------------|------|---------|-------|",
    ]
    for h in sorted(clients, key=lambda x: (x.path, x.file)):
        lines.append(f"| `{h.path}` | {h.framework} | `{h.file}` | {h.line} |")

    if specs:
        lines += ["", "## OpenAPI / Swagger", ""]
        for h in sorted(specs, key=lambda x: x.file):
            extra = f" — `{h.path}`" if h.path and h.path != h.file else ""
            lines.append(f"- `{h.file}` ({h.framework or h.note}){extra}")

    if gql:
        lines += ["", "## GraphQL", ""]
        for h in gql:
            lines.append(f"- `{h.file}` — {h.note or h.path}")

    if result.warnings:
        lines += ["", "## Alertas de segurança (revisar manualmente)", ""]
        for w in result.warnings[:30]:
            lines.append(f"- {w}")
        if len(result.warnings) > 30:
            lines.append(f"- ... e mais {len(result.warnings) - 30}")

    lines += [
        "",
        "## Limitações",
        "",
        "- Rotas dinâmicas, middleware chains e RPC podem não aparecer.",
        "- Hono e outros frameworks que usam `app.get` podem exigir revisão manual.",
        "- Mesmo router em vários `app.use`: só o último prefixo é usado para `path_full`.",
        "- Revise manualmente WebSocket, gRPC, filas e BFFs.",
        "",
        "## Atualizar",
        "",
        "```powershell",
        f'python scripts/scan-apis.py --root "{result.root}" --out docs',
        "```",
        "",
    ]
    return "\n".join(lines)


def render_html(result: ScanResult) -> str:
    mounts = sorted(
        [h for h in result.hits if h.kind == "mount"],
        key=lambda x: x.path,
    )
    routes = sorted(
        [h for h in result.hits if h.kind == "route"],
        key=lambda x: (x.path_full or x.path, x.method),
    )
    clients = sorted(
        [h for h in result.hits if h.kind == "client"],
        key=lambda x: (x.path, x.file),
    )
    name = html.escape(Path(result.root).name)
    stacks = html.escape(", ".join(result.stacks) or "n/d")
    scanned = html.escape(result.scanned_at)
    version = html.escape(result.scanner_version)

    mount_rows = "\n".join(
        f"<tr><td><code>{html.escape(h.path)}</code></td>"
        f"<td>{html.escape(h.note.replace('router=', '') if h.note else '—')}</td>"
        f"<td><code>{html.escape(h.file)}</code></td><td>{h.line}</td></tr>"
        for h in mounts
    ) or '<tr><td colspan="4">Nenhum prefixo detectado</td></tr>'

    route_rows = "\n".join(
        f'<tr data-method="{html.escape(h.method)}" data-path="{html.escape((h.path_full or h.path).lower())}">'
        f"<td><strong>{html.escape(h.method)}</strong></td>"
        f"<td><code>{html.escape(h.path_full or h.path)}</code></td>"
        f"<td>{html.escape(h.router_var or 'app')}</td>"
        f"<td><code>{html.escape(h.file)}</code></td><td>{h.line}</td></tr>"
        for h in routes
    ) or '<tr><td colspan="5">Nenhuma rota detectada</td></tr>'

    client_rows = "\n".join(
        f"<tr><td><code>{html.escape(h.path)}</code></td>"
        f"<td>{html.escape(h.framework)}</td>"
        f"<td><code>{html.escape(h.file)}</code></td><td>{h.line}</td></tr>"
        for h in clients
    ) or '<tr><td colspan="4">Nenhum cliente HTTP detectado</td></tr>'

    warn_block = ""
    if result.warnings:
        items = "".join(f"<li>{html.escape(w)}</li>" for w in result.warnings[:20])
        warn_block = f'<section class="warn"><h2>Alertas</h2><ul>{items}</ul></section>'

    return f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>API — {name}</title>
<style>
:root {{ font-family: system-ui, sans-serif; color: #1a1a1a; background: #f6f8fa; }}
body {{ max-width: 1100px; margin: 0 auto; padding: 1.5rem; }}
h1 {{ margin-bottom: 0.25rem; }}
.meta {{ color: #555; font-size: 0.9rem; margin-bottom: 1.5rem; }}
input#q {{ width: 100%; padding: 0.6rem; font-size: 1rem; border: 1px solid #ccc; border-radius: 6px; box-sizing: border-box; }}
section {{ background: #fff; border-radius: 8px; padding: 1rem; margin: 1rem 0; box-shadow: 0 1px 3px #0001; }}
table {{ width: 100%; border-collapse: collapse; font-size: 0.9rem; }}
th, td {{ text-align: left; padding: 0.45rem 0.5rem; border-bottom: 1px solid #eee; }}
th {{ background: #f0f3f6; }}
code {{ font-size: 0.85em; }}
.warn {{ border-left: 4px solid #d97706; }}
.hidden {{ display: none; }}
</style>
</head>
<body>
<h1>Catálogo de APIs — {name}</h1>
<p class="meta">Scanner v{version} · {scanned} · Stacks: {stacks}<br>Raiz: <code>{html.escape(result.root)}</code></p>
<label for="q">Buscar endpoint (método ou caminho)</label>
<input id="q" type="search" placeholder="Ex.: GET /api/clientes" autocomplete="off">
<section>
<h2>Prefixos (app.use)</h2>
<table><thead><tr><th>Prefixo</th><th>Router</th><th>Arquivo</th><th>Linha</th></tr></thead>
<tbody>{mount_rows}</tbody></table>
</section>
<section>
<h2>Endpoints ({len(routes)})</h2>
<table id="routes"><thead><tr><th>Método</th><th>Caminho</th><th>Router</th><th>Arquivo</th><th>Linha</th></tr></thead>
<tbody>{route_rows}</tbody></table>
</section>
<section>
<h2>Integrações HTTP ({len(clients)})</h2>
<table><thead><tr><th>URL / variável</th><th>Tipo</th><th>Arquivo</th><th>Linha</th></tr></thead>
<tbody>{client_rows}</tbody></table>
</section>
{warn_block}
<p class="meta">Arquivos irmãos: <code>api-inventory.json</code>, <code>SYSTEM-API-DOCUMENTATION.md</code></p>
<script>
const q = document.getElementById('q');
const rows = document.querySelectorAll('#routes tbody tr[data-path]');
q.addEventListener('input', () => {{
  const t = q.value.trim().toLowerCase();
  rows.forEach(r => {{
    const text = (r.dataset.method + ' ' + r.dataset.path).toLowerCase();
    r.classList.toggle('hidden', t && !text.includes(t));
  }});
}});
</script>
</body>
</html>"""


def main() -> None:
    ap = argparse.ArgumentParser(description="Mapeia APIs em um repositório")
    ap.add_argument("--root", required=True, help="Pasta raiz do sistema")
    ap.add_argument("--out", default="docs", help="Pasta de saída")
    ap.add_argument("--version", action="version", version=f"%(prog)s {__version__}")
    args = ap.parse_args()

    root = Path(args.root).resolve()
    if not root.is_dir():
        raise SystemExit(f"Raiz inválida: {root}")

    out_dir = Path(args.out)
    if not out_dir.is_absolute():
        out_dir = (Path.cwd() / out_dir).resolve()
    out_dir.mkdir(parents=True, exist_ok=True)

    files = list(iter_files(root))
    result = ScanResult(
        root=str(root),
        scanned_at=datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
        scanner_version=__version__,
        stacks=detect_stacks(files),
    )

    for f in files:
        scan_file(f, root, result.hits, result.warnings)

    resolve_full_paths(result.hits)
    result.hits = dedupe_hits(result.hits)

    inv_path = out_dir / "api-inventory.json"
    doc_path = out_dir / "SYSTEM-API-DOCUMENTATION.md"

    payload = {
        "scanner_version": __version__,
        "root": result.root,
        "scanned_at": result.scanned_at,
        "stacks": result.stacks,
        "warnings": result.warnings,
        "counts": {
            "routes": sum(1 for h in result.hits if h.kind == "route"),
            "clients": sum(1 for h in result.hits if h.kind == "client"),
            "openapi": sum(1 for h in result.hits if h.kind == "openapi"),
            "graphql": sum(1 for h in result.hits if h.kind == "graphql"),
            "mounts": sum(1 for h in result.hits if h.kind == "mount"),
        },
        "hits": [asdict(h) for h in result.hits],
    }
    inv_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    doc_path.write_text(render_markdown(result), encoding="utf-8")

    site_dir = out_dir / "api-catalog"
    site_dir.mkdir(parents=True, exist_ok=True)
    site_path = site_dir / "index.html"
    site_path.write_text(render_html(result), encoding="utf-8")

    print(f"OK: {inv_path}")
    print(f"OK: {doc_path}")
    print(f"OK: {site_path}")
    c = payload["counts"]
    print(f"Rotas: {c['routes']} | OpenAPI: {c['openapi']} | Clientes: {c['clients']} | Alertas: {len(result.warnings)}")


if __name__ == "__main__":
    main()

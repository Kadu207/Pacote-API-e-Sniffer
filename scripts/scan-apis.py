#!/usr/bin/env python3
"""
Escaneia um repositório e gera inventário de APIs + documentação Markdown.
Uso: python scan-apis.py --root PATH --out docs
"""

from __future__ import annotations

import argparse
import json
import re
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable

SKIP_DIRS = {
    "node_modules", ".git", "dist", "build", "vendor", "__pycache__",
    ".venv", "venv", ".next", "coverage", ".turbo", "target", "bin", "obj",
}
SKIP_EXT = {".min.js", ".map", ".lock", ".png", ".jpg", ".ico", ".woff", ".woff2"}

OPENAPI_NAMES = {"openapi.yaml", "openapi.yml", "openapi.json", "swagger.yaml", "swagger.json"}

ROUTE_PATTERNS: list[tuple[str, re.Pattern[str]]] = [
    ("express", re.compile(r"\b(?:app|router)\.(get|post|put|patch|delete|all)\s*\(\s*['\"`]([^'\"`]+)", re.I)),
    ("fastify", re.compile(r"\bfastify\.(get|post|put|patch|delete)\s*\(\s*['\"`]([^'\"`]+)", re.I)),
    ("nestjs", re.compile(r"@(Get|Post|Put|Patch|Delete)\s*\(\s*['\"`]?([^'\"`)\s]*)", re.I)),
    ("fastapi", re.compile(r"@(app|router)\.(get|post|put|patch|delete)\s*\(\s*['\"`]([^'\"`]+)", re.I)),
    ("flask", re.compile(r"@app\.route\s*\(\s*['\"`]([^'\"`]+)", re.I)),
    ("spring", re.compile(r"@(Get|Post|Put|Patch|Delete|Request)Mapping\s*\(\s*(?:value\s*=\s*)?['\"`]([^'\"`]+)", re.I)),
    ("aspnet", re.compile(r"\[(Http(Get|Post|Put|Delete|Patch))\][^\n]*\n[^\n]*\[Route\s*\(\s*['\"`]([^'\"`]+)", re.I | re.M)),
    ("minimal_api", re.compile(r"\bapp\.Map(Get|Post|Put|Delete)\s*\(\s*['\"`]([^'\"`]+)", re.I)),
    ("gin", re.compile(r"\b(?:r|router)\.(GET|POST|PUT|PATCH|DELETE)\s*\(\s*['\"`]([^'\"`]+)", re.I)),
    ("go_http", re.compile(r"http\.HandleFunc\s*\(\s*['\"`]([^'\"`]+)", re.I)),
]

CLIENT_PATTERNS: list[tuple[str, re.Pattern[str]]] = [
    ("fetch_url", re.compile(r"fetch\s*\(\s*['\"`](https?://[^'\"`]+)", re.I)),
    ("axios_url", re.compile(r"axios\.(?:get|post|put|delete|patch)\s*\(\s*['\"`](https?://[^'\"`]+)", re.I)),
    ("requests_url", re.compile(r"requests\.(?:get|post|put|delete)\s*\(\s*['\"`](https?://[^'\"`]+)", re.I)),
    ("base_url", re.compile(r"baseURL\s*:\s*['\"`](https?://[^'\"`]+)", re.I)),
    ("env_url", re.compile(r"(?:process\.env\.|os\.environ(?:\.get)?\(['\"]?)([A-Z][A-Z0-9_]*URL[A-Z0-9_]*)", re.I)),
]


@dataclass
class ApiHit:
    kind: str
    method: str
    path: str
    file: str
    line: int
    framework: str = ""
    note: str = ""


@dataclass
class ScanResult:
    root: str
    scanned_at: str
    stacks: list[str] = field(default_factory=list)
    hits: list[ApiHit] = field(default_factory=list)
    openapi_files: list[str] = field(default_factory=list)
    graphql_files: list[str] = field(default_factory=list)


def iter_files(root: Path) -> Iterable[Path]:
    for p in root.rglob("*"):
        if not p.is_file():
            continue
        if any(part in SKIP_DIRS for part in p.parts):
            continue
        if p.suffix.lower() in {".exe", ".dll", ".zip", ".pdf"}:
            continue
        if any(p.name.endswith(s) for s in SKIP_EXT):
            continue
        if p.stat().st_size > 2_000_000:
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


def scan_file(path: Path, root: Path, hits: list[ApiHit]) -> None:
    rel = str(path.relative_to(root)).replace("\\", "/")
    try:
        text = path.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return

    if path.name.lower() in OPENAPI_NAMES or "openapi" in path.parts:
        hits.append(ApiHit("openapi", "", rel, rel, 0, note="spec file"))

    if path.suffix in {".graphql", ".gql"}:
        hits.append(ApiHit("graphql", "", rel, rel, 0, note="schema file"))

    for i, line in enumerate(text.splitlines(), 1):
        for fw, pat in ROUTE_PATTERNS:
            for m in pat.finditer(line):
                groups = m.groups()
                if len(groups) >= 2:
                    method, route = groups[0], groups[-1]
                else:
                    method, route = "GET", groups[0]
                method = (method or "GET").upper()
                hits.append(ApiHit("route", method, route or "/", rel, i, framework=fw))

        for kind, pat in CLIENT_PATTERNS:
            for m in pat.finditer(line):
                val = m.group(1)
                hits.append(ApiHit("client", "", val, rel, i, framework=kind))

        if re.search(r"type\s+Query\s*\{", line) or re.search(r"type\s+Mutation\s*\{", line):
            hits.append(ApiHit("graphql", "", "inline schema", rel, i, note="graphql type"))


def dedupe_hits(hits: list[ApiHit]) -> list[ApiHit]:
    seen: set[tuple[str, str, str, str]] = set()
    out: list[ApiHit] = []
    for h in hits:
        key = (h.kind, h.method, h.path, h.file)
        if key in seen:
            continue
        seen.add(key)
        out.append(h)
    return out


def render_markdown(result: ScanResult) -> str:
    routes = [h for h in result.hits if h.kind == "route"]
    clients = [h for h in result.hits if h.kind == "client"]
    specs = [h for h in result.hits if h.kind == "openapi"]
    gql = [h for h in result.hits if h.kind == "graphql"]

    lines = [
        f"# Documentação de APIs — {Path(result.root).name}",
        "",
        f"> Gerado em: {result.scanned_at}",
        f"> Raiz: `{result.root}`",
        f"> Stacks detectadas: {', '.join(result.stacks) or 'n/d'}",
        "",
        "## Resumo",
        "",
        f"| Tipo | Quantidade |",
        f"|------|------------|",
        f"| Rotas no código | {len(routes)} |",
        f"| Chamadas / URLs externas | {len(clients)} |",
        f"| Arquivos OpenAPI | {len(specs)} |",
        f"| GraphQL | {len(gql)} |",
        "",
        "## APIs expostas (rotas)",
        "",
        "| Método | Caminho | Framework | Arquivo | Linha |",
        "|--------|---------|-----------|---------|-------|",
    ]
    for h in sorted(routes, key=lambda x: (x.path, x.method)):
        lines.append(f"| {h.method} | `{h.path}` | {h.framework} | `{h.file}` | {h.line} |")

    lines += ["", "## Integrações / clientes HTTP", "", "| URL / variável | Tipo | Arquivo | Linha |", "|----------------|------|---------|-------|"]
    for h in clients:
        lines.append(f"| `{h.path}` | {h.framework} | `{h.file}` | {h.line} |")

    if specs:
        lines += ["", "## Especificações OpenAPI/Swagger", ""]
        for h in specs:
            lines.append(f"- `{h.file}`")

    if gql:
        lines += ["", "## GraphQL", ""]
        for h in gql:
            lines.append(f"- `{h.file}` — {h.note or h.path}")

    lines += [
        "",
        "## Como atualizar",
        "",
        "```powershell",
        f'python scripts/scan-apis.py --root "{result.root}" --out docs',
        "```",
        "",
    ]
    return "\n".join(lines)


def main() -> None:
    ap = argparse.ArgumentParser(description="Mapeia APIs em um repositório")
    ap.add_argument("--root", required=True, help="Pasta raiz do sistema")
    ap.add_argument("--out", default="docs", help="Pasta de saída")
    args = ap.parse_args()

    root = Path(args.root).resolve()
    if not root.is_dir():
        raise SystemExit(f"Raiz inválida: {root}")

    out_dir = Path(args.out)
    if not out_dir.is_absolute():
        out_dir = Path.cwd() / out_dir
    out_dir.mkdir(parents=True, exist_ok=True)

    files = list(iter_files(root))
    result = ScanResult(
        root=str(root),
        scanned_at=datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
        stacks=detect_stacks(files),
    )

    for f in files:
        scan_file(f, root, result.hits)

    result.hits = dedupe_hits(result.hits)

    inv_path = out_dir / "api-inventory.json"
    doc_path = out_dir / "SYSTEM-API-DOCUMENTATION.md"

    payload = {
        "root": result.root,
        "scanned_at": result.scanned_at,
        "stacks": result.stacks,
        "counts": {
            "routes": sum(1 for h in result.hits if h.kind == "route"),
            "clients": sum(1 for h in result.hits if h.kind == "client"),
            "openapi": sum(1 for h in result.hits if h.kind == "openapi"),
            "graphql": sum(1 for h in result.hits if h.kind == "graphql"),
        },
        "hits": [asdict(h) for h in result.hits],
    }
    inv_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    doc_path.write_text(render_markdown(result), encoding="utf-8")

    print(f"OK: {inv_path}")
    print(f"OK: {doc_path}")
    print(f"Rotas: {payload['counts']['routes']} | Clientes: {payload['counts']['clients']}")


if __name__ == "__main__":
    main()

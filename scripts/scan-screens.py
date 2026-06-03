#!/usr/bin/env python3
"""Mapeia rotas de UI / telas em apps web (React, Next, Vue, etc.)."""

from __future__ import annotations

import argparse
import html
import json
import re
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable

__version__ = "1.0.0"

SKIP_DIRS = {
    "node_modules", ".git", "dist", "build", ".next", "coverage", ".turbo",
    "__pycache__", ".venv", "venv", ".cursor", "terminals",
}
CODE_EXT = {".js", ".ts", ".tsx", ".jsx", ".vue"}

UI_PATTERNS: list[tuple[str, re.Pattern[str]]] = [
    ("react-router", re.compile(r"""<Route\s+[^>]*\bpath\s*=\s*['"`]([^'"`]+)""", re.I)),
    ("react-router", re.compile(r"""\bpath\s*:\s*['"`]([^'"`]+)['"`]""")),
    ("next-link", re.compile(r"""<Link\s+[^>]*\bhref\s*=\s*['"`]([^'"`]+)['"`]""", re.I)),
    ("href", re.compile(r"""\bhref\s*=\s*['"`](/[^'"`?#]+)['"`]""")),
    ("vue-router", re.compile(r"""path\s*:\s*['"`]([^'"`]+)['"`]""")),
    ("angular", re.compile(r"""path\s*:\s*['"`]([^'"`]+)['"`]\s*[,}]""")),
]


@dataclass
class ScreenHit:
    kind: str
    path: str
    file: str
    line: int
    framework: str = ""
    component: str = ""


@dataclass
class ScreenScanResult:
    root: str
    scanned_at: str
    scanner_version: str
    hits: list[ScreenHit] = field(default_factory=list)


def iter_files(root: Path) -> Iterable[Path]:
    for p in root.rglob("*"):
        if not p.is_file() or p.suffix.lower() not in CODE_EXT:
            continue
        if any(part in SKIP_DIRS for part in p.parts):
            continue
        try:
            if p.stat().st_size > 1_500_000:
                continue
        except OSError:
            continue
        yield p


def scan_file(path: Path, root: Path, hits: list[ScreenHit]) -> None:
    rel = str(path.relative_to(root)).replace("\\", "/")
    try:
        text = path.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return
    for i, line in enumerate(text.splitlines(), 1):
        for fw, pat in UI_PATTERNS:
            for m in pat.finditer(line):
                route = (m.group(1) or "").strip()
                if not route or route.startswith(("http://", "https://", "#", "mailto:")):
                    continue
                if route in ("/", "*") and fw == "href":
                    continue
                hits.append(ScreenHit("screen", route, rel, i, framework=fw))


def dedupe(hits: list[ScreenHit]) -> list[ScreenHit]:
    seen: set[tuple[str, str, str, int]] = set()
    out: list[ScreenHit] = []
    for h in hits:
        key = (h.path, h.file, h.framework, h.line)
        if key in seen:
            continue
        seen.add(key)
        out.append(h)
    return out


def render_md(result: ScreenScanResult) -> str:
    screens = sorted([h for h in result.hits if h.kind == "screen"], key=lambda x: (x.path, x.file))
    lines = [
        f"# Telas / rotas de UI — {Path(result.root).name}",
        "",
        f"> Gerado em: {result.scanned_at}",
        f"> Scanner: ui v{result.scanner_version}",
        f"> Raiz: `{result.root}`",
        "",
        "## Resumo",
        "",
        f"| Telas / rotas detectadas | {len(screens)} |",
        "",
        "## Rotas de interface",
        "",
        "| Caminho | Framework | Arquivo | Linha |",
        "|---------|-----------|---------|-------|",
    ]
    for h in screens:
        lines.append(f"| `{h.path}` | {h.framework} | `{h.file}` | {h.line} |")
    if not screens:
        lines.append("| — | *Nenhuma rota de UI detectada* | — | — |")
    lines += [
        "",
        "## Limitações",
        "",
        "- Rotas dinâmicas, modais e drawers podem não aparecer.",
        "- Use o Agente de Telas (browser) para fluxos e estados visuais.",
        "",
    ]
    return "\n".join(lines)


def render_html(result: ScreenScanResult) -> str:
    screens = sorted([h for h in result.hits if h.kind == "screen"], key=lambda x: (x.path, x.file))
    name = html.escape(Path(result.root).name)
    rows = "\n".join(
        f'<tr data-path="{html.escape(h.path.lower())}">'
        f"<td><code>{html.escape(h.path)}</code></td>"
        f"<td>{html.escape(h.framework)}</td>"
        f"<td><code>{html.escape(h.file)}</code></td><td>{h.line}</td></tr>"
        for h in screens
    ) or '<tr><td colspan="4">Nenhuma tela detectada</td></tr>'
    return f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Telas — {name}</title>
<style>
body {{ font-family: system-ui, sans-serif; max-width: 1000px; margin: auto; padding: 1.5rem; background: #f6f8fa; }}
section {{ background: #fff; padding: 1rem; border-radius: 8px; box-shadow: 0 1px 3px #0001; }}
input#q {{ width: 100%; padding: 0.6rem; margin: 1rem 0; box-sizing: border-box; }}
table {{ width: 100%; border-collapse: collapse; }}
th, td {{ padding: 0.4rem; border-bottom: 1px solid #eee; text-align: left; }}
.hidden {{ display: none; }}
</style>
</head>
<body>
<h1>Telas / rotas de UI — {name}</h1>
<p>Scanner UI v{html.escape(result.scanner_version)} · {html.escape(result.scanned_at)}</p>
<input id="q" type="search" placeholder="Buscar rota de tela...">
<section>
<table id="tbl"><thead><tr><th>Caminho</th><th>Framework</th><th>Arquivo</th><th>Linha</th></tr></thead>
<tbody>{rows}</tbody></table>
</section>
<script>
const q = document.getElementById('q');
document.querySelectorAll('#tbl tbody tr[data-path]').forEach(r => {{
  q.addEventListener('input', () => {{
    const t = q.value.trim().toLowerCase();
    r.classList.toggle('hidden', t && !r.dataset.path.includes(t));
  }});
}});
</script>
</body>
</html>"""


def main() -> None:
    ap = argparse.ArgumentParser(description="Mapeia telas/rotas de UI")
    ap.add_argument("--root", required=True)
    ap.add_argument("--out", default="docs")
    ap.add_argument("--version", action="version", version=f"%(prog)s {__version__}")
    args = ap.parse_args()

    root = Path(args.root).resolve()
    if not root.is_dir():
        raise SystemExit(f"Raiz inválida: {root}")

    out_dir = Path(args.out)
    if not out_dir.is_absolute():
        out_dir = (Path.cwd() / out_dir).resolve()
    out_dir.mkdir(parents=True, exist_ok=True)

    result = ScreenScanResult(
        root=str(root),
        scanned_at=datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
        scanner_version=__version__,
    )
    for f in iter_files(root):
        scan_file(f, root, result.hits)
    result.hits = dedupe(result.hits)

    inv = out_dir / "ui-inventory.json"
    md = out_dir / "UI-SCREENS-DOCUMENTATION.md"
    site_dir = out_dir / "ui-catalog"
    site_dir.mkdir(parents=True, exist_ok=True)
    site = site_dir / "index.html"

    payload = {
        "scanner_version": __version__,
        "root": result.root,
        "scanned_at": result.scanned_at,
        "counts": {"screens": sum(1 for h in result.hits if h.kind == "screen")},
        "hits": [asdict(h) for h in result.hits],
    }
    inv.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    md.write_text(render_md(result), encoding="utf-8")
    site.write_text(render_html(result), encoding="utf-8")

    print(f"OK: {inv}")
    print(f"OK: {md}")
    print(f"OK: {site}")
    print(f"Telas: {payload['counts']['screens']}")


if __name__ == "__main__":
    main()

---
name: sniff-app-screens
description: Mapeia telas, rotas de UI e fluxos visuais de aplicativos web (React Router, links, Vue, etc.) e complementa com inspeção via browser quando disponível. Use para inventário de telas, sniffer de interface, mapa de navegação ou documentação UX/técnica do front.
---

# Sniff App Screens (telas)

## Fluxo

1. Confirmar `--root` do **app front** (ou monorepo com `apps/web`, `src/pages`, etc.).
2. Scan estático de rotas no código:
   ```bash
   python scripts/scan-screens.py --root "<RAIZ>" --out docs
   ```
   Windows: `ESCANEAR.cmd "<RAIZ>"` já inclui APIs + telas.
3. Ler `docs/ui-inventory.json`, `docs/UI-SCREENS-DOCUMENTATION.md`, `docs/ui-catalog/index.html`.
4. **Agente browser** (opcional): com MCP browser, navegar URLs base do app e registrar título, formulários, ações principais por tela — sem inventar telas que não existam.
5. Entregar mapa de telas: rota → componente/arquivo → propósito em 1–2 linhas.

## Regras

- Este pacote é **ferramenta**; o app analisado é outro `--root`. Não incluir nem commitar projetos de exemplo no repo do pacote.
- Não misturar repositórios no mesmo scan.
- Saída só em `docs/` do projeto alvo.
- Rotas dinâmicas e modais: marcar para revisão manual ou browser.

## Saídas

| Arquivo | Conteúdo |
|---------|----------|
| `ui-inventory.json` | Rotas de UI detectadas no código |
| `UI-SCREENS-DOCUMENTATION.md` | Tabela markdown |
| `ui-catalog/index.html` | Catálogo navegável |

## Referência

[reference.md](reference.md) · [GUIA-MULTI-AGENTES.md](../../../GUIA-MULTI-AGENTES.md)

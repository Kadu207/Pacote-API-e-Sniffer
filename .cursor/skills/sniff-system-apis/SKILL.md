---
name: sniff-system-apis
description: Mapeia endpoints HTTP, GraphQL, OpenAPI/Swagger e clientes de API em um repositório; gera inventário JSON e documentação Markdown do sistema. Use quando o usuário pedir para snifar/mapear APIs, documentar o sistema, inventário de rotas, ou análise de integrações.
---

# Sniff System APIs

## Objetivo

Produzir documentação **completa e verificável** das APIs de um sistema a partir do código-fonte e de specs existentes.

## Fluxo obrigatório

1. **Confirmar raiz** — diretório do sistema (workspace atual ou path informado pelo usuário).
2. **Rodar o scanner** (preferir script; não inventar endpoints):
   ```bash
   python scripts/scan-apis.py --root "<RAIZ>" --out docs
   ```
   No Windows, a partir deste pacote:
   ```powershell
   python "C:\Users\carlo\OneDrive\Área de Trabalho\Projetos DEV\Pacote API e Sniffer\scripts\scan-apis.py" --root "<RAIZ>" --out docs
   ```
3. **Ler saídas** — `docs/api-inventory.json` e `docs/SYSTEM-API-DOCUMENTATION.md`.
4. **Complementar manualmente** (somente se o scanner não cobrir): rotas dinâmicas, env `*_URL`, gRPC/WebSocket.
5. **Entregar ao usuário** resumo executivo, tabela de APIs, riscos, caminhos dos arquivos.

## Regras

- **Nunca** misturar com outros projetos salvo pedido explícito.
- Ignorar: `node_modules`, `.git`, `dist`, `build`, `vendor`, `__pycache__`, `.venv`.
- Citar arquivo e linha quando adicionar endpoint manualmente.

## Referência

Padrões por framework: [reference.md](reference.md)

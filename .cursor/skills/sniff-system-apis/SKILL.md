---
name: sniff-system-apis
description: Mapeia endpoints HTTP, GraphQL, OpenAPI/Swagger e clientes de API em um repositório; gera inventário JSON e documentação Markdown. Use quando o usuário pedir para snifar/mapear APIs, documentar o sistema, inventário de rotas, ou análise de integrações.
---

# Sniff System APIs

## Fluxo

1. Confirmar `--root` (workspace ou path informado).
2. Executar o scanner (não inventar rotas):
   ```bash
   python scripts/scan-apis.py --root "<RAIZ>" --out docs
   ```
   Se o pacote estiver em outro disco, use o caminho absoluto até `scripts/scan-apis.py` do clone [Pacote-API-e-Sniffer](https://github.com/Kadu207/Pacote-API-e-Sniffer).
3. Ler `docs/api-inventory.json` e `docs/SYSTEM-API-DOCUMENTATION.md`.
4. Complementar manualmente: WebSocket, gRPC, tRPC, rotas 100% dinâmicas.
5. Entregar resumo, tabela por módulo, alertas de `warnings` no JSON, caminhos dos arquivos.

## Regras

- Não misturar projetos (contratos, outros repos) salvo pedido explícito.
- Ignorar `node_modules`, `.git`, `dist`, `.cursor`, etc.
- Citar `arquivo:linha` para achados manuais.
- Template: `templates/SYSTEM-DOCUMENTATION.template.md`

## Referência

Padrões por stack: [reference.md](reference.md)

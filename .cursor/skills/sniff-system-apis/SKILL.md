---
name: sniff-system-apis
description: Mapeia endpoints HTTP, GraphQL, OpenAPI/Swagger e clientes de API em um repositório; gera inventário JSON e documentação Markdown com caminho completo (prefixo app.use + rota). Use quando o usuário pedir para snifar/mapear APIs, documentar o sistema, inventário de rotas, ou análise de integrações.
---

# Sniff System APIs

## Fluxo

1. Confirmar `--root` = workspace do **sistema alvo** (não o clone do Pacote Sniffer, salvo smoke test).
2. Executar o scanner (não inventar rotas):
   ```bash
   python scripts/scan-apis.py --root "<RAIZ>" --out docs
   ```
   Windows (recomendado): `py -3 scripts/scan-apis.py ...` ou `ESCANEAR.cmd "<RAIZ>"` no pacote.
   Se o pacote estiver em outro disco, use o caminho absoluto até `scripts/scan-apis.py` do clone [Pacote-API-e-Sniffer](https://github.com/Kadu207/Pacote-API-e-Sniffer).
3. Ler `docs/api-inventory.json` e `docs/SYSTEM-API-DOCUMENTATION.md` no projeto escaneado.
   - JSON: `kind` mount/route, `path_full`, `router_var`, `warnings`
   - MD: **Prefixos de API (app.use)**, **APIs expostas (caminho completo)**
4. Complementar manualmente: WebSocket, gRPC, tRPC, Hono (pode exigir revisão), rotas 100% dinâmicas.
5. Entregar resumo, tabelas de prefixos e rotas com **caminho completo**, alertas de `warnings`, caminhos `arquivo:linha` para achados manuais.

## Regras

- Não misturar outros repositórios/projetos com o `--root` do scan, salvo pedido explícito.
- Não alterar código do alvo fora de `docs/` salvo pedido explícito.
- “Contratos formais” no template = OpenAPI/GraphQL, não outros repos.
- Preferir `path_full` / coluna **Caminho completo**; `path` sozinho costuma ser relativo ao router.
- Ignorar `node_modules`, `.git`, `dist`, `.cursor`, etc.
- Saída automática: `docs/SYSTEM-API-DOCUMENTATION.md` (gerado pelo scanner).
- Template manual complementar: `templates/SYSTEM-DOCUMENTATION.template.md`
- Confirmar versão: `python scripts/scan-apis.py --version` (esperado 1.3.x)

## Referência

Padrões por stack: [reference.md](reference.md)  
Guia operacional: [GUIA-AGENTES.md](../../../GUIA-AGENTES.md) (no clone do pacote)

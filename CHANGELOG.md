# Changelog

## [1.3.0] - 2026-06-03

### Melhorias

- Tabela de rotas com **caminho completo** (`/api/clientes/:id` = prefixo `app.use` + rota relativa)
- Campos `path_full` e `router_var` no JSON de inventário

## [1.2.0] - 2026-06-03

### Melhorias

- Detecta `*Router` (Express) e prefixos `app.use`

## [1.1.0] - 2026-06-03

### Melhorias

- Scanner v1.1.0: Hono, Laravel, httpx, paths OpenAPI em YAML, alertas de segredos hardcoded
- Corrigido parsing NestJS (rota vazia → `/`)
- Ignora `.cursor` e `terminals` na varredura
- `PUSH-GITHUB.ps1`: mensagem de commit dinâmica; push via git quando `gh` não autenticado
- `VALIDAR.ps1` e `scripts/git-env.ps1` para diagnóstico
- Documentação alinhada ao repo `Kadu207/Pacote-API-e-Sniffer`

### Conhecidas (limitações)

- Rotas tRPC, WebSocket, gRPC e decorators complexos exigem revisão manual
- ASP.NET com `[HttpGet]` e `[Route]` em linhas separadas pode não ser detectado

## [1.0.0] - 2026-06-03

- Versão inicial: skill Cursor, scanner, CI, templates

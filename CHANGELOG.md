# Changelog

## [1.5.0] - 2026-06-03

### Melhorias

- **Scanner de telas** `scan-screens.py` + skill `sniff-app-screens`
- `ESCANEAR.cmd` roda APIs + UI no mesmo comando
- Documentação focada em pacote multi-agente (APIs + telas), sem projetos cliente no repo
- Guia multi-agente com 6 papéis (API, UI, enriquecimento, validação, publicação)

## [1.4.0] - 2026-06-03

### Melhorias

- Site estático `docs/api-catalog/index.html` (busca de endpoints, tabelas)
- `GUIA-MULTI-AGENTES.md` — fluxo 4 agentes (descoberta, enriquecimento, validação, publicação)
- `PUBLICAR-WEB.md` — GitHub Pages, Cloudflare, qualquer PC

## [1.3.1] - 2026-06-03

### Melhorias

- Documentação alinhada à v1.3.x: README, GUIA-AGENTES, skill, reference, template
- Seção explícita **projetos separados** (pacote vs sistema escaneado)
- Scanner: dedupe de mounts por router; linha nos `app.use`; sem duplicar Hono/`app.get`
- `ESCANEAR.cmd`: valida se a pasta `--root` existe
- `CONFIGURAR-GIT-PATH.cmd`: aviso sobre risco do `setx PATH`

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

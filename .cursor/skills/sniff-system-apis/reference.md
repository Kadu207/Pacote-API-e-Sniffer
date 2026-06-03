# Padrões de busca por stack

## Node / TypeScript

- Express rotas: `(app|\w+Router)\.(get|post|put|patch|delete|all)\(`
- Express mounts: `app\.use\s*\(\s*['\`]` + prefixo + `, nomeRouter`
- Fastify: `fastify\.(get|post|put|delete)`
- NestJS: `@(Get|Post|Put|Patch|Delete)\(`
- Hono: pode usar `app.get` — revisão manual se não aparecer como Express
- Laravel (PHP): `Route::(get|post)\(`
- tRPC: `createTRPCRouter`, procedimentos em `routers/`

### Caminho completo (v1.3+)

- `path` no JSON = trecho no arquivo (ex. `/:id`)
- `path_full` = prefixo do `app.use` + `path` quando `router_var` está no mapa de mounts
- Rotas em `app.get('/api/...')` já saem com caminho completo

## Python

- FastAPI: `@(app|router)\.(get|post|put|delete|patch)\(`
- Flask: `@app\.route\(`
- Django REST: `path(`, `router\.register`

## Java / Kotlin

- Spring: `@(Get|Post|Put|Delete|Patch|Request)Mapping`
- JAX-RS: `@(GET|POST|Path)`

## C# / .NET

- `[Http(Get|Post|Put|Delete|Patch)]`
- `MapGet(`, `MapPost(` (minimal APIs)

## Go

- `r\.(GET|POST|PUT|DELETE)\(`
- `http\.HandleFunc\(`

## Specs e GraphQL

- `openapi.yaml`, `swagger.json`
- `.graphql`, `type Query`, `type Mutation`

## Clientes HTTP

- `fetch(`, `axios.`, `baseURL:`, `process.env.*URL`

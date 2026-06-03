# Padrões de busca por stack

## Node / TypeScript

- Express: `(app|router)\.(get|post|put|patch|delete|all)\(`
- Fastify: `fastify\.(get|post|put|delete)`
- NestJS: `@(Get|Post|Put|Patch|Delete|Controller)\(`
- Hono: `app\.(get|post)\(`
- tRPC: `createTRPCRouter`, procedimentos em `routers/`

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

# API Harvester — Documentação Completa

> **Projeto finalizado e pronto para uso.**
> Ferramenta de coleta automatizada de especificações de API para acelerar o desenvolvimento backend no Cursor.

---

## 1. O que é o API Harvester?

O **API Harvester** é uma aplicação web fullstack que permite ao usuário:

1. **Inserir URLs** de documentações de API, sistemas ou sites.
2. **Colar anotações** e snippets diretamente.
3. **Fazer upload** de arquivos (`.json`, `.yaml`, `.md`, `.txt`, specs OpenAPI/Swagger).
4. Clicar em **"Search API"** para disparar agentes de IA que:
   - Varrem o site em busca de endpoints, auth, schemas, webhooks, SDKs, rate limits.
   - Detectam automaticamente especificações **OpenAPI/Swagger**.
   - Geram um relatório técnico estruturado em **Markdown** + **JSON**.
5. **Exportar** o resultado como `.md` (documentação) ou `.json` (estruturado para o Cursor).

---

## 2. Tecnologias e Stack

| Camada | Tecnologia | Finalidade |
|--------|-----------|------------|
| Framework | TanStack Start v1 | SSR/SSG, rotas file-based, server functions |
| Build | Vite 7 | Bundling e dev server |
| Frontend | React 19 + Tailwind CSS v4 | UI responsiva e estilizada |
| Roteamento | TanStack Router | Navegação tipada |
| Estado assíncrono | TanStack Query | Gerenciamento de mutations |
| Backend | `createServerFn` (TanStack Start) | Server-side logic (edge runtime) |
| Web Scraping | Firecrawl SDK v2 | Scrape, map, deep crawl de sites |
| IA / LLM | Lovable AI Gateway (`google/gemini-2.5-flash`) | Extração estruturada de dados técnicos |
| Parsing YAML | `yaml` | Leitura de specs OpenAPI em YAML |
| Markdown | `react-markdown` + `remark-gfm` | Renderização do relatório no browser |
| Icons | `lucide-react` | Ícones consistentes |
| Validação | `zod` | Schemas de entrada robustos |

---

## 3. Estrutura de Arquivos

```text
src/
├── lib/
│   └── api/
│       └── analyze.functions.ts    ← Backend principal (server function)
├── routes/
│   ├── index.tsx                  ← Página principal (input + relatório)
│   └── __root.tsx                 ← Layout raiz
├── styles.css                     ← Tokens de design + tema escuro + .prose-report
├── router.tsx                     ← Configuração do router
└── routeTree.gen.ts               ← Auto-gerado pelo TanStack Router
```

---

## 4. Arquitetura do Backend

### 4.1 Server Function: `analyzeApis`

**Arquivo:** `src/lib/api/analyze.functions.ts`

**Input (Zod schema):**
```ts
{
  urls: string[];          // max 15 URLs
  notes: string;           // max 20.000 chars
  files: { name: string; content: string }[];  // max 10 arquivos, 1MB cada
  deepCrawl: boolean;      // default true
}
```

**Fluxo de execução:**

```
1. Recebe URLs + notas + arquivos
2. Para cada arquivo → detecta se é OpenAPI/Swagger (JSON/YAML)
   → Se sim: parseia e adiciona como fonte "openapi"
   → Se não: adiciona como fonte "file"
3. Para cada URL:
   a. Tenta baixar a URL diretamente como spec OpenAPI
   b. Se não for spec, tenta ~17 caminhos comuns (/openapi.json, /swagger.yaml, etc.)
   c. Se deepCrawl=true: usa Firecrawl.map() para descobrir até 200 links,
      filtra os relevantes (api/docs/reference/webhook/graphql/v1/...),
      e faz scrape paralelo dos top 8 links
   d. Se deepCrawl=false: faz scrape simples da URL
4. Adiciona notas como fonte "notes"
5. Concatena todas as fontes em um corpus (máx 180.000 chars)
6. Envia corpus + system prompt para Lovable AI Gateway (Gemini 2.5 Flash)
   → response_format: { type: "json_object" } para garantir JSON válido
7. Converte o JSON estruturado em Markdown bonito
8. Retorna: { structured, markdown, sourcesCount, openApiCount, sources, generatedAt }
```

### 4.2 Detecção de OpenAPI/Swagger

```ts
function tryParseSpec(text: string): any | null
```
- Tenta `JSON.parse()` primeiro.
- Se falhar, tenta `YAML.parse()`.
- Valida se o objeto possui `openapi`, `swagger` ou `paths`.

**Caminhos de descoberta automática (`OPENAPI_CANDIDATE_PATHS`):**
```
/openapi.json, /openapi.yaml, /openapi.yml
/swagger.json, /swagger.yaml, /swagger.yml
/api/openapi.json, /api/swagger.json
/v1/openapi.json, /v2/openapi.json, /v3/openapi.json
/api-docs, /api-docs.json, /api/v1/openapi.json
/docs/openapi.json, /.well-known/openapi.json
/spec.json, /spec.yaml
```

### 4.3 Deep Crawl com Firecrawl

```ts
async function deepCrawlSite(fc: Firecrawl, url: string): Promise<Source[]>
```

- Chama `fc.map(base.origin, { limit: 200 })` para listar todos os links do domínio.
- Filtra links relevantes via regex: `/(api|docs?|reference|openapi|swagger|endpoints?|webhook|graphql|v\d+|developer|integration)/i`
- Mantém no máximo 12 links relevantes.
- Sempre inclui a URL original.
- Faz `fc.scrape()` em paralelo nos top 8 links.
- Limita conteúdo por página a ~14.000 chars.

**Fallback:** se `map()` falhar, faz scrape simples da URL original.

### 4.4 Prompt do Sistema (System Prompt)

O prompt instrui o LLM a extrair:
- **Visão Geral** da API
- **Autenticação** (API Key, OAuth2, JWT, Bearer, Basic, HMAC) com `headerExample` e `curlExample`
- **Base URLs / Ambientes**
- **Endpoints** (método, path, params, requestBody, response, cURL)
- **Schemas / Modelos de Dados**
- **Webhooks / Eventos**
- **Banco de Dados** (inferido)
- **SDKs / Bibliotecas**
- **Rate Limits**
- **Erros**
- **Dependências**
- **Cursor Notes** (instruções diretas em bullets)

**Regras críticas do prompt:**
- Exaustivo em endpoints (especialmente com fontes OpenAPI).
- Sempre preencher `headerExample` e `curlExample` reais e copiáveis.
- Diferenciar tipos de auth (API Key, Bearer, OAuth2 com flow/scopes, JWT, Basic, HMAC).
- Não inventar dados — usar `"Não identificado"` quando ausente.
- JSON estritamente válido (sem texto fora do JSON).

### 4.5 Geração de Markdown

```ts
function buildMarkdownFromStructured(s: any): string
```

Converte o JSON estruturado em Markdown organizado com seções:
1. `# Nome da API`
2. `## Visão Geral`
3. `## Autenticação` (com exemplos de headers e cURL)
4. `## Base URL e Ambientes`
5. `## Endpoints` (com cURL examples)
6. `## Modelos de Dados / Schemas`
7. `## Webhooks / Eventos`
8. `## Banco de Dados`
9. `## SDKs / Bibliotecas Oficiais`
10. `## Rate Limits`
11. `## Erros`
12. `## Dependências / Serviços Externos`
13. `## Notas de Implementação para o Cursor`

---

## 5. Arquitetura do Frontend

### 5.1 Componente Principal: `Index` (`src/routes/index.tsx`)

**Estados:**
- `urls: string[]` — lista dinâmica de inputs de URL (mínimo 1, ilimitado add/remove).
- `notes: string` — textarea para colar conteúdo.
- `files: UploadedFile[]` — arquivos lidos via `FileReader` (máx 10, 1MB cada).

**Mutation:**
```ts
const mutation = useMutation({
  mutationFn: async () => analyze({ data: { urls, notes, files } })
});
```

**Ações do usuário:**
1. Adiciona URLs nos inputs.
2. (Opcional) Cola notas na textarea.
3. (Opcional) Faz upload de arquivos via drag/click.
4. Clica **"Search API"** → chama `analyzeApis` via `useServerFn`.
5. Aguarda o loading (spinner + "Agentes coletando endpoints, libs, schemas e DB…").
6. Recebe o relatório renderizado em Markdown.

**Ações de exportação:**
- **Copiar MD** → copia o markdown para a clipboard.
- **.md** → download do arquivo `.md`.
- **.json p/ Cursor** → download do JSON estruturado.

### 5.2 Design System

**Tema escuro** com acentos em verde-água (`primary: oklch(0.72 0.18 160)`).

Tokens customizados em `src/styles.css`:
```css
--background, --foreground, --card, --surface, --surface-2
--primary, --primary-foreground, --glow
--secondary, --muted, --accent, --destructive
--border, --input, --ring
```

**Classes utilitárias customizadas:**
- `.prose-report` — estilização do relatório Markdown com:
  - Headers coloridos e com bordas
  - Código inline em verde glow (`--glow`)
  - Blocos de código com background escuro e bordas
  - Tabelas com bordas e cabeçalho destacado
  - Links em cor primária

**Layout:** Grid responsivo `lg:grid-cols-5`:
- Coluna esquerda (2/5): inputs, textarea, upload, botão.
- Coluna direita (3/5): painel do relatório.

---

## 6. Variáveis de Ambiente

| Variável | Origem | Uso |
|----------|--------|-----|
| `FIRECRAWL_API_KEY` | Firecrawl Connector | Web scraping (server-side only) |
| `LOVABLE_API_KEY` | Lovable AI Gateway | Chamadas ao LLM para extração estruturada |

> **Importante:** Estas chaves nunca vão para o browser. São lidas apenas dentro de `createServerFn` `.handler()`.

---

## 7. Dependências (`package.json`)

```json
{
  "@mendable/firecrawl-js": "^1.x",
  "react-markdown": "^9.x",
  "remark-gfm": "^4.x",
  "yaml": "^2.x",
  "zod": "^3.x",
  "lucide-react": "^0.x"
}
```

---

## 8. Como Usar (Workflow Completo)

### Passo 1: Acessar o app
Abra o preview em `https://{seu-projeto}.lovable.app`.

### Passo 2: Inserir fontes
- **URLs**: Adicione links de documentação de API (ex: `https://docs.stripe.com/api`).
  - Suporta múltiplas URLs (até 15).
  - O deep crawl descobrirá automaticamente subpáginas relevantes.
- **Texto**: Cole snippets, cURLs, descrições ou múltiplas URLs (uma por linha).
- **Arquivos**: Faça upload de specs OpenAPI/Swagger em `.json`, `.yaml`, `.yml`, `.md`, `.txt`.

### Passo 3: Executar
Clique no botão **"Search API"**.

O backend fará:
1. Parse de specs nos arquivos.
2. Tentativa de discovery OpenAPI nas URLs.
3. Deep crawl do site (map + scrape paralelo).
4. Envio de tudo para o LLM.
5. Geração do JSON estruturado + Markdown.

### Passo 4: Exportar para o Cursor
- **Opção A — Markdown**: Clique em **"Copiar MD"** e cole no Cursor como contexto.
- **Opção B — Download .md**: Baixe o arquivo e importe no Cursor.
- **Opção C — Download .json**: Baixe o JSON estruturado — ideal para:
  - Gerar tipos TypeScript automaticamente.
  - Criar clients de API.
  - Montar collections para testes.

---

## 9. Capacidades de Detecção

| Capacidade | Descrição |
|-----------|-----------|
| **Auth API Key** | Detecta headers tipo `X-API-Key`, posição (header/query/cookie) |
| **OAuth2** | Detecta flow (authorization_code, client_credentials, implicit, password), tokenUrl, authorizationUrl, scopes |
| **JWT** | Detecta uso de tokens JWT, estrutura de claims |
| **Bearer Token** | Exemplo pronto: `Authorization: Bearer <token>` |
| **Basic Auth** | Exemplo pronto: `Authorization: Basic <base64>` |
| **HMAC** | Detecta assinaturas HMAC com timestamp |
| **OpenAPI auto** | Tenta 17 caminhos comuns para encontrar specs |
| **Deep Crawl** | Descobre até 200 links, filtra por relevância, raspa top 8 |
| **Endpoints** | Extrai método, path, params, body, response, cURL example |
| **Schemas** | Modelos de dados com campos e tipos |
| **Webhooks** | Eventos e payloads |
| **Database** | Inferência de tabelas/colunas a partir da documentação |
| **SDKs** | Linguagem, pacote npm, comando de instalação |
| **Rate Limits** | Headers e políticas de limitação |
| **Erros** | Códigos de erro e mensagens |
| **Cursor Notes** | Instruções diretas em bullets do que implementar |

---

## 10. Limites e Constraints

| Limite | Valor |
|--------|-------|
| URLs por requisição | 15 |
| Arquivos por requisição | 10 |
| Tamanho máx por arquivo | 1 MB |
| Caracteres máx por arquivo | 400.000 |
| Caracteres máx nas notas | 20.000 |
| Links descobertos no map | 200 |
| Links relevantes mantidos | 12 |
| Links raspados em paralelo | 8 |
| Chars por página crawled | 14.000 |
| Tamanho máx do corpus enviado ao LLM | 180.000 chars |
| Endpoints extraídos do OpenAPI | 200 |
| Schemas listados do OpenAPI | 80 |

---

## 11. Exemplo de Saída JSON Estruturado

```json
{
  "name": "Stripe API",
  "overview": "Plataforma de pagamentos com APIs RESTful completas",
  "servers": [
    { "name": "production", "url": "https://api.stripe.com" }
  ],
  "authentication": {
    "methods": [
      {
        "type": "API Key",
        "name": "Stripe Secret Key",
        "description": "Autenticação via header Authorization com Bearer token",
        "location": "header",
        "headerName": "Authorization",
        "scheme": "Bearer",
        "headerExample": "Authorization: Bearer sk_test_...\nContent-Type: application/x-www-form-urlencoded",
        "curlExample": "curl https://api.stripe.com/v1/customers \\\n  -u sk_test_...:"
      }
    ]
  },
  "endpoints": [
    {
      "method": "GET",
      "path": "/v1/customers",
      "summary": "Listar todos os clientes",
      "auth": "API Key",
      "params": [
        { "name": "limit", "in": "query", "type": "integer", "required": false, "description": "Máximo de itens retornados" }
      ],
      "curlExample": "curl https://api.stripe.com/v1/customers -u sk_test_...:"
    }
  ],
  "schemas": [
    { "name": "Customer", "description": "Representa um cliente", "fields": { "id": "string", "email": "string", "name": "string" } }
  ],
  "webhooks": [
    { "event": "payment_intent.succeeded", "description": "Disparado quando um pagamento é confirmado", "payload": { "id": "string", "amount": "number" } }
  ],
  "database": "PostgreSQL com tabelas: customers, payments, subscriptions, invoices",
  "sdks": [
    { "language": "Node.js", "package": "stripe", "version": "^14.0", "install": "npm install stripe" }
  ],
  "rateLimits": "200 requests/min no modo teste",
  "errors": [
    { "code": "401", "message": "Unauthorized — chave de API inválida" },
    { "code": "429", "message": "Too Many Requests" }
  ],
  "dependencies": ["Redis (cache)", "PostgreSQL"],
  "cursorNotes": "- Usar SDK stripe Node.js\n- Implementar webhooks com verify signature\n- Usar idempotency-key em POSTs\n- Cachear customers no Redis"
}
```

---

## 12. Checklist de Entrega para o Cursor

Ao levar este projeto para o Cursor, você tem:

- [x] **Frontend completo** com inputs de URL dinâmicos, textarea, upload de arquivos.
- [x] **Backend server function** com scraping inteligente (Firecrawl).
- [x] **Detecção automática de OpenAPI/Swagger** em URLs e arquivos.
- [x] **Deep crawl** que vasculha todo o site por páginas de API/docs.
- [x] **Extração por IA** (Gemini 2.5 Flash) de endpoints, auth, schemas, webhooks, DB, SDKs.
- [x] **Exemplos prontos de headers e cURL** para cada método de autenticação.
- [x] **Exportação em Markdown** (.md) — pronto para colar como contexto.
- [x] **Exportação em JSON estruturado** (.json) — pronto para gerar código.
- [x] **Tema escuro elegante** com design tokens semânticos.
- [x] **Tratamento de erros** (rate limit, créditos esgotados, falhas de scrape).
- [x] **Validação de entrada** com Zod (limites de tamanho, quantidade, formatos).

---

## 13. Próximos Passos Sugeridos

Se quiser evoluir o projeto no Cursor:

1. **Gerador de código**: Use o JSON exportado para gerar automaticamente:
   - Clients HTTP tipados (TypeScript).
   - Schemas Zod ou interfaces TypeScript.
   - Collections para Postman/Insomnia.
   - Tests automatizados com os cURL examples.

2. **Cache de resultados**: Armazenar resultados no banco (Supabase/Lovable Cloud) para evitar re-processamento.

3. **Comparação de versões**: Salvar múltiplas análises da mesma API e diff entre versões.

4. **Importação direta no Cursor**: Criar uma extensão ou CLI que consuma o endpoint e injete os dados como contexto no `.cursorrules`.

5. **Suporte a GraphQL**: Detectar introspection endpoints (`/graphql`, `?introspection=true`) e gerar queries/mutations.

6. **Autenticação no app**: Adicionar login para salvar histórico de análises por usuário.

---

## 14. Comandos Úteis

```bash
# Instalar dependências
bun install

# Rodar em desenvolvimento
bun dev

# Build para produção
bun run build
```

---

**Projeto:** API Harvester  
**Status:** ✅ Concluído e operacional  
**Última atualização:** Junho 2026  
**Destino:** Cursor IDE (backend development)

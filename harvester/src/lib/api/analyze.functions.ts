import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import Firecrawl from "@mendable/firecrawl-js";
import YAML from "yaml";

const InputSchema = z.object({
  urls: z.array(z.string().url()).max(15).default([]),
  notes: z.string().max(20000).optional().default(""),
  files: z
    .array(z.object({ name: z.string().max(200), content: z.string().max(400000) }))
    .max(10)
    .default([]),
  deepCrawl: z.boolean().default(true),
});

type Source = {
  kind: "url" | "file" | "notes" | "openapi" | "crawled";
  name: string;
  content: string;
};

const OPENAPI_CANDIDATE_PATHS = [
  "/openapi.json", "/openapi.yaml", "/openapi.yml",
  "/swagger.json", "/swagger.yaml", "/swagger.yml",
  "/api/openapi.json", "/api/swagger.json",
  "/v1/openapi.json", "/v2/openapi.json", "/v3/openapi.json",
  "/api-docs", "/api-docs.json", "/api/v1/openapi.json",
  "/docs/openapi.json", "/.well-known/openapi.json",
  "/spec.json", "/spec.yaml",
];

const API_LINK_RE = /\/(api|docs?|reference|openapi|swagger|endpoints?|webhook|graphql|v\d+|developer|integration)\b/i;

function tryParseSpec(text: string): any | null {
  text = text.trim();
  if (!text) return null;
  try {
    const j = JSON.parse(text);
    if (j && (j.openapi || j.swagger || j.paths)) return j;
  } catch {}
  try {
    const y = YAML.parse(text);
    if (y && (y.openapi || y.swagger || y.paths)) return y;
  } catch {}
  return null;
}

async function fetchText(url: string, timeoutMs = 8000): Promise<string | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: "application/json, application/yaml, text/yaml, text/plain, */*" },
    });
    clearTimeout(t);
    if (!res.ok) return null;
    const txt = await res.text();
    if (txt.length > 600_000) return txt.slice(0, 600_000);
    return txt;
  } catch {
    return null;
  }
}

async function findOpenApiFromBase(base: URL): Promise<{ url: string; spec: any } | null> {
  for (const p of OPENAPI_CANDIDATE_PATHS) {
    const u = new URL(p, base.origin).toString();
    const txt = await fetchText(u);
    if (!txt) continue;
    const spec = tryParseSpec(txt);
    if (spec) return { url: u, spec };
  }
  return null;
}

function summarizeOpenApi(spec: any, sourceUrl: string): string {
  const info = spec.info ?? {};
  const servers = (spec.servers ?? []).map((s: any) => s.url).filter(Boolean);
  const paths = spec.paths ?? {};
  const lines: string[] = [];
  lines.push(`OPENAPI_SPEC source=${sourceUrl}`);
  lines.push(`title=${info.title ?? ""} version=${info.version ?? ""}`);
  if (servers.length) lines.push(`servers=${servers.join(", ")}`);
  const sec = spec.components?.securitySchemes ?? spec.securityDefinitions ?? {};
  if (Object.keys(sec).length) {
    lines.push(`securitySchemes=${JSON.stringify(sec).slice(0, 2000)}`);
  }
  let count = 0;
  for (const [p, methods] of Object.entries<any>(paths)) {
    for (const [method, op] of Object.entries<any>(methods ?? {})) {
      if (!["get","post","put","patch","delete","options","head"].includes(method)) continue;
      count++;
      if (count > 200) break;
      const summary = op?.summary || op?.operationId || "";
      const params = (op?.parameters ?? []).map((pa: any) => `${pa.in}:${pa.name}`).join(",");
      const body = op?.requestBody ? "body:yes" : "";
      const secOp = op?.security ? `sec:${JSON.stringify(op.security)}` : "";
      lines.push(`${method.toUpperCase()} ${p} — ${summary} ${params} ${body} ${secOp}`.trim());
    }
    if (count > 200) break;
  }
  const schemas = spec.components?.schemas ?? spec.definitions ?? {};
  const schemaNames = Object.keys(schemas).slice(0, 80);
  if (schemaNames.length) lines.push(`schemas=${schemaNames.join(", ")}`);
  return lines.join("\n");
}

async function deepCrawlSite(fc: Firecrawl, url: string): Promise<Source[]> {
  const sources: Source[] = [];
  try {
    const base = new URL(url);
    const mapRes: any = await fc.map(base.origin, {
      limit: 200,
      includeSubdomains: false,
    });
    const links: string[] = mapRes?.links ?? mapRes?.data?.links ?? [];
    const relevant = Array.from(
      new Set(
        links
          .filter((l) => typeof l === "string" && API_LINK_RE.test(l))
          .slice(0, 12)
      )
    );
    // Always include the original URL
    if (!relevant.includes(url)) relevant.unshift(url);
    const top = relevant.slice(0, 8);
    const scraped = await Promise.all(
      top.map(async (u) => {
        try {
          const r: any = await fc.scrape(u, {
            formats: ["markdown"],
            onlyMainContent: true,
          });
          const md = r?.markdown ?? r?.data?.markdown ?? "";
          return { u, md: md.slice(0, 14000) };
        } catch {
          return { u, md: "" };
        }
      })
    );
    for (const { u, md } of scraped) {
      if (md) sources.push({ kind: "crawled", name: u, content: md });
    }
  } catch {
    // map may fail on some sites; fall back to single scrape
    try {
      const r: any = await fc.scrape(url, { formats: ["markdown"], onlyMainContent: true });
      const md = r?.markdown ?? r?.data?.markdown ?? "";
      if (md) sources.push({ kind: "url", name: url, content: md.slice(0, 18000) });
    } catch (e: any) {
      sources.push({ kind: "url", name: url, content: `[Failed: ${e?.message ?? "scrape error"}]` });
    }
  }
  return sources;
}

async function callLovableAIJson(system: string, user: string): Promise<any> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    if (res.status === 429) throw new Error("AI rate limit. Tente novamente.");
    if (res.status === 402) throw new Error("Créditos do Lovable AI esgotados.");
    throw new Error(`AI error ${res.status}: ${txt.slice(0, 300)}`);
  }
  const json: any = await res.json();
  const content = json?.choices?.[0]?.message?.content ?? "{}";
  try {
    return JSON.parse(content);
  } catch {
    // try to extract JSON block
    const m = content.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    throw new Error("AI returned non-JSON response");
  }
}

function buildMarkdownFromStructured(s: any): string {
  const lines: string[] = [];
  lines.push(`# ${s.name ?? "API"}\n`);
  if (s.overview) lines.push(`## Visão Geral\n${s.overview}\n`);

  lines.push(`## Autenticação`);
  const auth = s.authentication ?? {};
  if (Array.isArray(auth.methods) && auth.methods.length) {
    for (const m of auth.methods) {
      lines.push(`\n### ${m.type ?? "Método"}${m.name ? ` — ${m.name}` : ""}`);
      if (m.description) lines.push(m.description);
      if (m.location) lines.push(`- **Localização**: ${m.location}`);
      if (m.headerName) lines.push(`- **Header**: \`${m.headerName}\``);
      if (m.scheme) lines.push(`- **Scheme**: \`${m.scheme}\``);
      if (m.flow) lines.push(`- **Fluxo OAuth**: ${m.flow}`);
      if (m.tokenUrl) lines.push(`- **Token URL**: ${m.tokenUrl}`);
      if (m.authorizationUrl) lines.push(`- **Authorization URL**: ${m.authorizationUrl}`);
      if (Array.isArray(m.scopes) && m.scopes.length) lines.push(`- **Scopes**: ${m.scopes.join(", ")}`);
      if (m.headerExample) {
        lines.push(`\n**Exemplo de header:**\n\`\`\`http\n${m.headerExample}\n\`\`\``);
      }
      if (m.curlExample) {
        lines.push(`\n**Exemplo cURL:**\n\`\`\`bash\n${m.curlExample}\n\`\`\``);
      }
    }
  } else {
    lines.push("Não identificado nas fontes.");
  }

  lines.push(`\n## Base URL e Ambientes`);
  if (Array.isArray(s.servers) && s.servers.length) {
    for (const sv of s.servers) lines.push(`- **${sv.name ?? "server"}**: \`${sv.url}\``);
  } else lines.push("Não identificado.");

  lines.push(`\n## Endpoints (${(s.endpoints ?? []).length})`);
  for (const e of s.endpoints ?? []) {
    lines.push(`\n### \`${e.method} ${e.path}\``);
    if (e.summary) lines.push(e.summary);
    if (e.auth) lines.push(`- **Auth**: ${e.auth}`);
    if (Array.isArray(e.params) && e.params.length) {
      lines.push(`- **Params**:`);
      for (const p of e.params) lines.push(`  - \`${p.name}\` (${p.in ?? "?"}, ${p.type ?? "?"})${p.required ? " — obrigatório" : ""}${p.description ? ` — ${p.description}` : ""}`);
    }
    if (e.requestBody) lines.push(`- **Body**: \`${typeof e.requestBody === "string" ? e.requestBody : JSON.stringify(e.requestBody)}\``);
    if (e.response) lines.push(`- **Response**: \`${typeof e.response === "string" ? e.response : JSON.stringify(e.response)}\``);
    if (e.curlExample) lines.push(`\n\`\`\`bash\n${e.curlExample}\n\`\`\``);
  }

  if (Array.isArray(s.schemas) && s.schemas.length) {
    lines.push(`\n## Modelos de Dados / Schemas`);
    for (const sc of s.schemas) {
      lines.push(`\n### ${sc.name}`);
      if (sc.description) lines.push(sc.description);
      if (sc.fields) {
        lines.push("```json");
        lines.push(JSON.stringify(sc.fields, null, 2));
        lines.push("```");
      }
    }
  }

  if (Array.isArray(s.webhooks) && s.webhooks.length) {
    lines.push(`\n## Webhooks / Eventos`);
    for (const w of s.webhooks) {
      lines.push(`- **${w.event}** — ${w.description ?? ""}${w.payload ? `\n  \`\`\`json\n  ${JSON.stringify(w.payload, null, 2)}\n  \`\`\`` : ""}`);
    }
  }

  if (s.database) {
    lines.push(`\n## Banco de Dados (inferido)`);
    if (typeof s.database === "string") lines.push(s.database);
    else lines.push("```json\n" + JSON.stringify(s.database, null, 2) + "\n```");
  }

  if (Array.isArray(s.sdks) && s.sdks.length) {
    lines.push(`\n## SDKs / Bibliotecas Oficiais`);
    for (const sdk of s.sdks) {
      lines.push(`- **${sdk.language}**: \`${sdk.package}\`${sdk.version ? ` (${sdk.version})` : ""}${sdk.install ? ` — \`${sdk.install}\`` : ""}`);
    }
  }

  if (s.rateLimits) {
    lines.push(`\n## Rate Limits`);
    lines.push(typeof s.rateLimits === "string" ? s.rateLimits : "```json\n" + JSON.stringify(s.rateLimits, null, 2) + "\n```");
  }

  if (Array.isArray(s.errors) && s.errors.length) {
    lines.push(`\n## Erros`);
    for (const e of s.errors) lines.push(`- **${e.code}** — ${e.message ?? ""}`);
  }

  if (Array.isArray(s.dependencies) && s.dependencies.length) {
    lines.push(`\n## Dependências / Serviços Externos`);
    for (const d of s.dependencies) lines.push(`- ${d}`);
  }

  if (s.cursorNotes) {
    lines.push(`\n## Notas de Implementação para o Cursor\n\`\`\`\n${s.cursorNotes}\n\`\`\``);
  }

  return lines.join("\n");
}

export const analyzeApis = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => InputSchema.parse(d))
  .handler(async ({ data }) => {
    const sources: Source[] = [];
    const discoveredSpecs: { url: string; spec: any }[] = [];

    // 1. Process uploaded files: detect OpenAPI specs first
    for (const f of data.files) {
      const spec = tryParseSpec(f.content);
      if (spec) {
        discoveredSpecs.push({ url: f.name, spec });
        sources.push({
          kind: "openapi",
          name: `${f.name} (OpenAPI/Swagger)`,
          content: summarizeOpenApi(spec, f.name),
        });
      } else {
        sources.push({ kind: "file", name: f.name, content: f.content.slice(0, 40000) });
      }
    }

    // 2. Process URLs: try OpenAPI discovery + (optional) deep crawl
    if (data.urls.length) {
      const fcKey = process.env.FIRECRAWL_API_KEY;
      if (!fcKey) throw new Error("FIRECRAWL_API_KEY não configurada. Conecte o Firecrawl.");
      const fc = new Firecrawl({ apiKey: fcKey });

      for (const url of data.urls) {
        // 2a. Try fetching URL directly as a spec
        const direct = await fetchText(url);
        if (direct) {
          const spec = tryParseSpec(direct);
          if (spec) {
            discoveredSpecs.push({ url, spec });
            sources.push({
              kind: "openapi",
              name: `${url} (OpenAPI/Swagger)`,
              content: summarizeOpenApi(spec, url),
            });
            continue;
          }
        }

        // 2b. Try common OpenAPI paths from base origin
        try {
          const found = await findOpenApiFromBase(new URL(url));
          if (found) {
            discoveredSpecs.push(found);
            sources.push({
              kind: "openapi",
              name: `${found.url} (OpenAPI auto-discovered)`,
              content: summarizeOpenApi(found.spec, found.url),
            });
          }
        } catch {}

        // 2c. Deep crawl or single scrape
        if (data.deepCrawl) {
          const crawled = await deepCrawlSite(fc, url);
          sources.push(...crawled);
        } else {
          try {
            const r: any = await fc.scrape(url, { formats: ["markdown"], onlyMainContent: true });
            const md = r?.markdown ?? r?.data?.markdown ?? "";
            sources.push({ kind: "url", name: url, content: md.slice(0, 18000) });
          } catch (e: any) {
            sources.push({ kind: "url", name: url, content: `[Failed: ${e?.message}]` });
          }
        }
      }
    }

    if (data.notes.trim()) {
      sources.push({ kind: "notes", name: "Notas coladas", content: data.notes });
    }

    if (!sources.length) {
      throw new Error("Forneça ao menos uma URL, arquivo ou anotação.");
    }

    const corpus = sources
      .map((s, i) => `### Fonte ${i + 1} — [${s.kind}] ${s.name}\n${s.content}\n`)
      .join("\n---\n")
      .slice(0, 180000);

    const system = `Você é um arquiteto de integrações sênior. Extraia TODAS as informações técnicas das fontes para um desenvolvedor backend implementar a integração no Cursor.

Responda EXCLUSIVAMENTE com um JSON válido (sem texto fora do JSON) no seguinte formato:

{
  "name": "Nome do sistema/API",
  "overview": "string curta",
  "servers": [{ "name": "production|staging", "url": "https://..." }],
  "authentication": {
    "methods": [
      {
        "type": "API Key | OAuth2 | JWT | Basic Auth | Bearer Token | HMAC | Session Cookie",
        "name": "nome amigável",
        "description": "como funciona",
        "location": "header | query | cookie",
        "headerName": "Authorization | X-API-Key | ...",
        "scheme": "Bearer | Basic | ApiKey",
        "flow": "authorization_code | client_credentials | implicit | password",
        "tokenUrl": "https://...",
        "authorizationUrl": "https://...",
        "scopes": ["read:user", "write:data"],
        "headerExample": "Authorization: Bearer <SEU_TOKEN>\\nContent-Type: application/json",
        "curlExample": "curl -H 'Authorization: Bearer $TOKEN' https://api.exemplo.com/v1/me"
      }
    ]
  },
  "endpoints": [
    {
      "method": "GET|POST|PUT|PATCH|DELETE",
      "path": "/v1/resource/{id}",
      "summary": "...",
      "auth": "qual método de auth",
      "params": [{ "name": "id", "in": "path|query|header|body", "type": "string", "required": true, "description": "..." }],
      "requestBody": { "exemplo": "json" },
      "response": { "exemplo": "json" },
      "curlExample": "curl ..."
    }
  ],
  "schemas": [{ "name": "User", "description": "...", "fields": { "id": "string", "email": "string" } }],
  "webhooks": [{ "event": "user.created", "description": "...", "payload": { "id": "string" } }],
  "database": "tabelas/colunas inferidas ou objeto",
  "sdks": [{ "language": "Node.js", "package": "@exemplo/sdk", "version": "^2.0", "install": "npm i @exemplo/sdk" }],
  "rateLimits": "string ou objeto com headers de rate-limit",
  "errors": [{ "code": "401", "message": "Unauthorized" }],
  "dependencies": ["Redis", "Postgres"],
  "cursorNotes": "Instruções diretas em bullets do que o backend deve implementar"
}

REGRAS CRÍTICAS:
- Seja exaustivo em endpoints, especialmente se houver fontes OPENAPI_SPEC — extraia TODOS os endpoints listados.
- Para autenticação, SEMPRE preencha headerExample e curlExample concretos e copiáveis.
- Detecte e diferencie API Key (header X-API-Key), Bearer Token, OAuth2 (com flow/scopes/urls), JWT, Basic Auth, HMAC.
- Não invente. Use "Não identificado" como valor de string quando algo não está nas fontes.
- Mantenha JSON estritamente válido.`;

    const user = `Fontes coletadas (${sources.length}, incluindo ${discoveredSpecs.length} OpenAPI specs):\n\n${corpus}`;

    const structured = await callLovableAIJson(system, user);
    const markdown = buildMarkdownFromStructured(structured);

    return {
      structured,
      markdown,
      sourcesCount: sources.length,
      openApiCount: discoveredSpecs.length,
      sources: sources.map((s) => ({ kind: s.kind, name: s.name })),
      generatedAt: new Date().toISOString(),
    };
  });

# Onde obter LOVABLE_API_KEY e FIRECRAWL_API_KEY

O **API Harvester** (`harvester/`) foi criado no **Lovable**. As chaves vêm dos conectores/configurações do projeto **no Lovable** — não são geradas neste repositório.

---

## 1. FIRECRAWL_API_KEY (web scraping)

Usada para mapear e extrair conteúdo de sites (deep crawl, OpenAPI em URLs).

| Onde conseguir |
|----------------|
| Conta em [https://www.firecrawl.dev](https://www.firecrawl.dev) → API Keys no dashboard |
| No **Lovable**: projeto API Harvester → **Settings / Integrations** → conector **Firecrawl** → ao conectar, o Lovable usa a chave do conector |

**No `.env` local:**

```env
FIRECRAWL_API_KEY=fc-xxxxxxxx
```

Se o projeto no Lovable já tem Firecrawl conectado, copie a mesma chave do painel Firecrawl ou exporte as variáveis do Lovable (se disponível em Project Settings → Environment / Secrets).

---

## 2. LOVABLE_API_KEY (IA — Gemini via Lovable Gateway)

Usada para transformar o corpus coletado em relatório JSON/Markdown (`analyze.functions.ts`).

| Onde conseguir |
|----------------|
| **Lovable Cloud / AI** do projeto em [https://lovable.dev](https://lovable.dev) |
| Abra o projeto **API Harvester** que você construiu |
| **Project Settings** → **Environment variables** ou **Secrets** (nomes podem variar na UI) |
| Procure variável injetada pelo Lovable, em geral relacionada ao **AI Gateway** / `LOVABLE_API_KEY` |

**No `.env` local:**

```env
LOVABLE_API_KEY=sua_chave_lovable
```

Essa chave é **específica do ecossistema Lovable** — não é a mesma coisa que uma API key do Google Gemini direto. Para rodar **fora** do deploy Lovable, você precisa copiar o valor que o Lovable configurou no projeto ou pedir no suporte/docs Lovable como exportar secrets para desenvolvimento local.

---

## 3. Passo a passo prático

1. Entre em [https://lovable.dev](https://lovable.dev) e abra o projeto **API Harvester**.
2. Vá em **Settings** (ou ícone de engrenagem) → **Integrations** / **Connectors**.
3. **Firecrawl** — conecte ou veja a chave no site Firecrawl.
4. **AI / Lovable** — confira variáveis de ambiente do projeto (secrets).
5. Cole no arquivo:

   `harvester\.env`

   ```env
   FIRECRAWL_API_KEY=...
   LOVABLE_API_KEY=...
   ```

6. Salve e rode `.\DEV.cmd` na pasta `harvester`.

---

## 4. Se não tiver as chaves ainda

| Serviço | Ação |
|---------|------|
| Firecrawl | Criar conta gratuita/trial em firecrawl.dev e gerar API key |
| Lovable AI | Usar o projeto no Lovable em produção (lá as chaves já vêm injetadas) **ou** exportar secrets para dev local |

Sem as duas chaves, **Search API** falha com mensagens como `FIRECRAWL_API_KEY não configurada` ou `LOVABLE_API_KEY not configured`.

---

## 5. Segurança

- **Nunca** commitar `.env` no Git (já está no `.gitignore`).
- Não compartilhar chaves em chat público.
- Rotacione chaves se vazarem.

---

## Referência no código

- `harvester/src/lib/api/analyze.functions.ts` — lê `process.env.FIRECRAWL_API_KEY` e `process.env.LOVABLE_API_KEY`
- Documentação Lovable: [docs/API-HARVESTER-LOVABLE.md](API-HARVESTER-LOVABLE.md) (tabela de variáveis ~linha 237)

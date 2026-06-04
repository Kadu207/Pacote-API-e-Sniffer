# Cloudflare — scouttapi.inovatitech.com.br

Domínio configurado: **https://scouttapi.inovatitech.com.br**

App: **API Harvester** em `harvester/` (TanStack Start + Nitro → Cloudflare Workers).

**Deploy recomendado:** [DEPLOY-CI-DOCKER.md](DEPLOY-CI-DOCKER.md) (GitHub Actions + API Token + Docker).

---

## 1. Corrigir dev local antes do deploy

Se aparecer `EEXIST: mkdir ...\.vite-temp`:

```powershell
cd harvester
.\LIMPAR-VITE.cmd
.\DEV.cmd
```

Projeto no **OneDrive** pode causar conflito em `node_modules` — se persistir, exclua `harvester\node_modules` da sincronização OneDrive ou clone o repo fora do OneDrive.

---

## 2. Variáveis na Cloudflare (produção)

No dashboard Cloudflare → **Workers & Pages** → seu worker → **Settings** → **Variables and Secrets**:

| Nome | Tipo | Uso |
|------|------|-----|
| `LOVABLE_API_KEY` | Secret | IA / relatório |
| `FIRECRAWL_API_KEY` | Secret | Scraping de URLs |

Mesmos nomes do `.env` local. Ver [CHAVES-API.md](CHAVES-API.md).

---

## 3. Build e deploy (Workers)

Na pasta `harvester/` (com Bun no PATH ou caminho WinGet):

```powershell
$bun = "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Oven-sh.Bun_Microsoft.Winget.Source_8wekyb3d8bbwe\bun-windows-x64\bun.exe"

cd harvester
& $bun install
& $bun run build

cd dist\server
& $bun x wrangler deploy --route "scouttapi.inovatitech.com.br/*"
```

Ou: `.\DEPLOY-CLOUDFLARE.cmd` (usa **Bun** em tudo; Node não precisa estar no PATH).

Scripts usam apenas Bun. O deploy remove `harvester\.wrangler` antes do wrangler para evitar conflito de config.

Primeira vez (dentro de `dist\server` após o build):

```powershell
cd dist\server
& $bun x wrangler login
```

Config válido após o build: `harvester/dist/server/wrangler.json` (não use `wrangler.jsonc` na raiz do harvester).

---

## 4. DNS (já configurado)

No Cloudflare **DNS** da zona `inovatitech.com.br`:

| Tipo | Nome | Destino |
|------|------|---------|
| CNAME ou A | `scouttapi` | Worker/Pages do deploy (automático ao vincular custom domain) |

**Custom domain** no Worker:

1. Workers & Pages → projeto → **Custom Domains**
2. Adicionar `scouttapi.inovatitech.com.br`
3. SSL/TLS → **Full (strict)** se houver origin

---

## 5. Checklist pós-deploy

- [ ] `https://scouttapi.inovatitech.com.br` abre a UI
- [ ] Secrets `LOVABLE_API_KEY` e `FIRECRAWL_API_KEY` configurados
- [ ] **Search API** responde sem erro 500
- [ ] Logs: `bun x wrangler tail` na pasta `harvester`

---

## 6. Pacote Python (core) — separado

Os scanners `scripts/scan-apis.py` / `scan-screens.py` **não** rodam no Worker por padrão. O Harvester usa Firecrawl + LLM na URL.

Integração futura: Worker chama um serviço com Python ou replica fluxo só via Harvester.

---

## Referências

- [harvester/README.md](../harvester/README.md)
- [ARQUITETURA.md](ARQUITETURA.md)
- Cloudflare Wrangler: https://developers.cloudflare.com/workers/wrangler/

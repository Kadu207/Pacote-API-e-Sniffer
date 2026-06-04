# API Harvester (Lovable / TanStack Start)

Aplicação **fullstack** (UI + server functions) exportada do Lovable.

- **Search API** — URLs, notas, upload de specs, relatório MD/JSON
- **Backend** — `src/lib/api/analyze.functions.ts` (`createServerFn`)
- **Frontend** — `src/routes/index.tsx`

Documentação completa: [docs/API-HARVESTER-LOVABLE.md](../docs/API-HARVESTER-LOVABLE.md)

## Desenvolvimento local

Requisitos: [Bun](https://bun.sh) (recomendado) ou Node 22+ com npm.

### Windows (sem Bun no PATH)

```powershell
cd harvester
.\INSTALAR-BUN.cmd
# Feche e abra um NOVO terminal
.\DEV.cmd
```

Ou manualmente:

```powershell
copy .env.example .env
# Edite .env: LOVABLE_API_KEY, FIRECRAWL_API_KEY
bun install
bun run dev
```

Alternativa: `npm install` + `npm run dev` se tiver Node.js completo no PATH (não só o node do Cursor).

**Onde pegar as chaves:** [docs/CHAVES-API.md](../docs/CHAVES-API.md) (Firecrawl + Lovable AI Gateway).

### Docker (dev isolado)

```powershell
.\DOCKER-DEV.cmd
# http://localhost:8080
```

Ver [docs/DEPLOY-CI-DOCKER.md](../docs/DEPLOY-CI-DOCKER.md).

## Deploy em producao (scouttapi)

| Metodo | Comando / acao |
|--------|----------------|
| **CI GitHub** (recomendado) | Push em `main` + secret `CLOUDFLARE_API_TOKEN` |
| API Token local | `.\DEPLOY-COM-TOKEN.cmd` (`.env.cloudflare`) |
| OAuth / manual | `.\DEPLOY-CLOUDFLARE.cmd` |

Ver deploys: `.\VER-DEPLOYS.cmd`

## Integração com o core Python (futuro)

Os scanners locais permanecem na raiz do monorepo:

```bash
python ../scripts/scan-apis.py --root <path> --out <path>/docs
python ../scripts/scan-screens.py --root <path> --out <path>/docs
```

O Harvester cobre coleta por **URL/web**; o core Python cobre **código-fonte** no disco (fase 2, quando autorizado).

## Relação com `portal/`

`portal/index.html` é protótipo estático; **API Harvester** é o produto web principal.

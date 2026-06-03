# API Harvester (Lovable / TanStack Start)

Aplicação **fullstack** (UI + server functions) exportada do Lovable.

- **Search API** — URLs, notas, upload de specs, relatório MD/JSON
- **Backend** — `src/lib/api/analyze.functions.ts` (`createServerFn`)
- **Frontend** — `src/routes/index.tsx`

Documentação completa: [docs/API-HARVESTER-LOVABLE.md](../docs/API-HARVESTER-LOVABLE.md)

## Desenvolvimento local

Requisitos: [Bun](https://bun.sh) (recomendado) ou Node 22+.

```bash
cd harvester
bun install
cp .env.example .env   # quando existir; ver config.server.ts
bun run dev
```

Variáveis típicas (Lovable): Firecrawl, AI Gateway — ver `src/lib/config.server.ts`.

## Integração com o core Python (futuro)

Os scanners locais permanecem na raiz do monorepo:

```bash
python ../scripts/scan-apis.py --root <path> --out <path>/docs
python ../scripts/scan-screens.py --root <path> --out <path>/docs
```

O Harvester cobre coleta por **URL/web**; o core Python cobre **código-fonte** no disco (fase 2, quando autorizado).

## Relação com `portal/`

`portal/index.html` é protótipo estático; **API Harvester** é o produto web principal.

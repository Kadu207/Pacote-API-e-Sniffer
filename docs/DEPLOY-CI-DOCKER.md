# Deploy — CI (GitHub), API Token e Docker

Três formas de publicar o **API Harvester** em `scouttapi.inovatitech.com.br`.

| Método | Quando usar |
|--------|-------------|
| **GitHub Actions** (recomendado) | Push em `main` → deploy automático |
| **DEPLOY-COM-TOKEN.cmd** | Deploy manual sem login OAuth |
| **DEPLOY-CLOUDFLARE.cmd** | Deploy manual (OAuth ou token na sessão) |
| **Docker** | Dev/build isolado (OneDrive) |

---

## 1. CI no GitHub (mais robusto)

Workflow: `.github/workflows/deploy-scouttapi.yml`

### Secrets obrigatórios

Repositório → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret | Onde obter |
|--------|------------|
| `CLOUDFLARE_API_TOKEN` | [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens) → **Create Token** → template **Edit Cloudflare Workers** |

### Secrets opcionais (análise no app)

| Secret | Uso |
|--------|-----|
| `LOVABLE_API_KEY` | IA no Worker |
| `FIRECRAWL_API_KEY` | Scraping no Worker |

Se ambos estiverem definidos, o workflow roda `wrangler secret put` após cada deploy.

### Fluxo

1. Commit na branch `main` ou `master` (alterações em `harvester/`).
2. GitHub executa: `bun install` → `bun run build` → `wrangler deploy`.
3. Site atualizado em https://scouttapi.inovatitech.com.br

Deploy manual: **Actions** → **Deploy scouttapi** → **Run workflow**.

### Account ID

Não é obrigatório no workflow: o token já está vinculado à conta. Para referência: `0252c61a2109e807b883c4d466617ebb`.

---

## 2. API Token local (sem OAuth)

1. Copie `harvester/.env.cloudflare.example` → `harvester/.env.cloudflare`
2. Cole o token em `CLOUDFLARE_API_TOKEN=...`
3. Rode:

```powershell
cd harvester
.\DEPLOY-COM-TOKEN.cmd
```

Ou na sessão PowerShell:

```powershell
$env:CLOUDFLARE_API_TOKEN = "seu-token"
.\DEPLOY-CLOUDFLARE.cmd
```

`VER-DEPLOYS.cmd` e `scripts/list-deploys.mjs` usam o mesmo token (ou OAuth salvo).

---

## 3. Docker (dev / build)

Requisito: [Docker Desktop](https://www.docker.com/products/docker-desktop/) no Windows.

```powershell
cd harvester
copy .env.example .env
# edite .env (LOVABLE + FIRECRAWL para dev)

docker compose up --build
```

App: http://localhost:8080

Só build (sem subir servidor):

```powershell
docker compose --profile build run --rm build
```

Deploy após build no container ainda precisa de token (use CI ou `DEPLOY-COM-TOKEN.cmd` no host).

### Por que Docker?

- `node_modules` e cache Vite fora do OneDrive
- Mesmo ambiente em qualquer máquina
- Não substitui o Worker na Cloudflare

---

## 4. Comparativo rápido

| | OAuth `wrangler login` | API Token | GitHub Actions |
|--|------------------------|-----------|----------------|
| Navegador | Sim | Não | Não |
| Outra máquina | Login de novo | Só o token | Só git push |
| OneDrive | Pode dar EEXIST | Igual | N/A |

**Recomendação:** configurar **CI + `CLOUDFLARE_API_TOKEN`** e usar Docker só para desenvolvimento local.

---

## 5. Chaves do app (todas as opções)

Produção no Worker (dashboard ou secrets do CI):

- `LOVABLE_API_KEY`
- `FIRECRAWL_API_KEY`

Ver [CHAVES-API.md](CHAVES-API.md).

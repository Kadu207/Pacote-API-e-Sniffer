# Passo a passo — CI GitHub + API Token Cloudflare

Guia para publicar **https://scouttapi.inovatitech.com.br** sem `wrangler login` no PC.

---

## Antes de começar

| Você precisa | Onde |
|--------------|------|
| Conta Cloudflare (mesma do deploy OAuth) | [dash.cloudflare.com](https://dash.cloudflare.com) |
| Repositório no GitHub | `Kadu207/Pacote-API-e-Sniffer` (ou seu fork) |
| Git no PC | `git` no PATH ou Git Bash |

**Pasta no PC:** você já está em `harvester` quando o prompt termina com `...\harvester>`.  
**Não rode** `cd harvester` de novo (vira `harvester\harvester` e dá erro).

**Docker:** opcional só para dev local. Se `docker` não for reconhecido, pule a seção Docker e use `.\DEV.cmd`.

---

## Parte A — Criar API Token na Cloudflare (5–10 min)

### A1. Abrir API Tokens

1. Acesse: https://dash.cloudflare.com/profile/api-tokens  
2. Faça login na conta que já publicou o Worker (`kadu207-pacote-api-e-sniffer-harvester`).

### A2. Criar token

1. Clique em **Create Token**.
2. Use o template **Edit Cloudflare Workers** (recomendado).  
   - Se não aparecer, **Create Custom Token** com:
     - **Permissions:** Account → Workers Scripts → *Edit*
     - **Permissions:** Account → Workers Scripts → *Read* (se disponível)
     - **Account Resources:** Include → sua conta
3. **Continue to summary** → **Create Token**.

### A3. Copiar o token (só aparece uma vez)

1. Copie o valor (string longa). Exemplo de formato: não começa necessariamente com `fc-`; tokens de API Cloudflare são diferentes do Firecrawl.
2. Guarde em um gerenciador de senhas. **Não** commite no Git.

### A4. (Opcional) Usar o token no PC — arquivo local

1. No Explorer ou editor, abra:

   `harvester\.env.cloudflare`

2. Deixe assim (substitua pelo token real, **sem aspas**):

   ```env
   CLOUDFLARE_API_TOKEN=cole_o_token_aqui
   ```

3. Salve o arquivo.

4. Teste deploy local **sem OAuth**:

   ```powershell
   cd "C:\Users\carlo\OneDrive\Área de Trabalho\Projetos DEV\Pacote API e Sniffer\harvester"
   .\DEPLOY-COM-TOKEN.cmd
   ```

   Se aparecer `CLOUDFLARE_API_TOKEN vazio`, o `.env.cloudflare` não foi salvo ou a linha está errada (tem que ser exatamente `CLOUDFLARE_API_TOKEN=` sem espaços antes do nome).

---

## Parte B — Secrets no GitHub (5 min)

### B1. Abrir secrets do repositório

1. https://github.com/Kadu207/Pacote-API-e-Sniffer  
2. **Settings** (aba do repositório; precisa ser dono ou admin).
3. Menu esquerdo: **Secrets and variables** → **Actions**.
4. Aba **Secrets**.

### B2. Secret obrigatório

1. **New repository secret**
2. **Name:** `CLOUDFLARE_API_TOKEN` (exatamente assim, maiúsculas).
3. **Secret:** cole o token da Parte A.
4. **Add secret**.

### B3. Secrets opcionais (app — análise de APIs)

Só se você já tiver as chaves (ver [CHAVES-API.md](CHAVES-API.md)):

| Name | Valor |
|------|--------|
| `LOVABLE_API_KEY` | chave do Lovable AI Gateway |
| `FIRECRAWL_API_KEY` | chave `fc-...` do Firecrawl |

Repita **New repository secret** para cada uma.

Se **não** configurar agora, o site abre; a busca/análise na UI pode falhar até você adicionar (no GitHub ou no dashboard do Worker).

---

## Parte C — Enviar código e disparar o deploy (10 min)

### C1. Ver o que mudou no PC

```powershell
cd "C:\Users\carlo\OneDrive\Área de Trabalho\Projetos DEV\Pacote API e Sniffer"
git status
```

### C2. Commit (se ainda não enviou CI/Docker/docs)

```powershell
git add .github/workflows/deploy-scouttapi.yml
git add docs/DEPLOY-CI-DOCKER.md docs/SETUP-GITHUB-CI-PASSO-A-PASSO.md
git add harvester/DEPLOY-COM-TOKEN.cmd harvester/.env.cloudflare.example
git add harvester/Dockerfile harvester/docker-compose.yml harvester/DOCKER-DEV.cmd
git add harvester/scripts/list-deploys.mjs
git commit -m "feat(harvester): CI deploy scouttapi, API token e Docker dev"
```

Ajuste `git add` conforme `git status` (inclua outros arquivos do harvester se faltarem).

### C3. Push na branch main

```powershell
git push origin main
```

Se sua branch principal for `master`:

```powershell
git push origin master
```

O workflow só roda em push para `main` ou `master` (e quando arquivos em `harvester/` mudam).

### C4. Acompanhar o workflow

1. GitHub → repositório → aba **Actions**.
2. Clique no workflow **Deploy scouttapi**.
3. Abra o run mais recente (amarelo = rodando, verde = ok, vermelho = falhou).

**Etapas esperadas:**

- Install dependencies  
- Build (Nitro / Cloudflare)  
- Remove wrangler state  
- Deploy Worker  
- Sync Worker secrets (só se `LOVABLE` e `FIRECRAWL` existirem nos secrets)

### C5. Deploy manual (sem push)

1. **Actions** → **Deploy scouttapi** → **Run workflow** → **Run workflow**.

---

## Parte D — Conferir se deu certo

### D1. No GitHub Actions

- Último job **deploy** com ✓ verde.

### D2. No site

- Abra: https://scouttapi.inovatitech.com.br

### D3. Lista de deploys no PC

```powershell
cd "C:\Users\carlo\OneDrive\Área de Trabalho\Projetos DEV\Pacote API e Sniffer\harvester"
.\VER-DEPLOYS.cmd
```

Deve aparecer um deploy novo (data/hora após o CI) com `(fonte: API Cloudflare)`.

---

## Depois disso — rotina do dia a dia

| Tarefa | O que fazer |
|--------|-------------|
| Publicar alteração | Editar código → `git add` → `git commit` → `git push origin main` → esperar Actions |
| Ver deploys | `.\VER-DEPLOYS.cmd` |
| Dev local | `.\DEV.cmd` (com `.env` Lovable + Firecrawl) |
| Deploy local sem CI | `.\DEPLOY-COM-TOKEN.cmd` (com `.env.cloudflare` preenchido) |
| Docker | Instalar [Docker Desktop](https://www.docker.com/products/docker-desktop/) → `.\DOCKER-DEV.cmd` |

**Não precisa** `wrangler login` se usar CI ou `DEPLOY-COM-TOKEN.cmd`.

---

## Erros comuns

| Mensagem | Solução |
|----------|---------|
| `CLOUDFLARE_API_TOKEN vazio` | Edite `harvester\.env.cloudflare` e cole o token na mesma linha |
| `cd harvester` não existe | Você já está em `harvester`; use `cd ..` para subir |
| `docker` não reconhecido | Instale Docker Desktop ou use `.\DEV.cmd` |
| Actions falhou no Deploy | Ver log; confira secret `CLOUDFLARE_API_TOKEN` e permissão Workers |
| Actions ok mas app sem análise | Adicione secrets `LOVABLE_API_KEY` e `FIRECRAWL_API_KEY` no GitHub e rode workflow de novo |

---

## Account ID (referência)

`0252c61a2109e807b883c4d466617ebb` — não precisa no GitHub para o workflow atual; o token já está ligado à conta.

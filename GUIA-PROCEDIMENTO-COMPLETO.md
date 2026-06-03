# Procedimento completo — scan, agentes, site e download

> **Use este guia na fase 2** — quando o pacote já estiver pronto e você for analisar um app.  
> **Fase 1 (só construir o pacote):** [CONSTRUINDO-PACOTE.md](CONSTRUINDO-PACOTE.md)

Este guia cobre **do zero** até catálogo de APIs/telas, uso no Cursor e publicação na web.

---

## O que você precisa entender antes

| Entrada | O que o pacote faz hoje |
|---------|-------------------------|
| **Pasta local** do código (`C:\...\meu-app`) | Scan automático completo (`ESCANEAR.cmd`) — **recomendado** |
| **URL do GitHub** (repositório) | Não escaneia direto pela URL; você **clona** e passa a pasta clonada |
| **URL do site no ar** (`https://app.com`) | Scanner Python **não** lê o site pela URL; use **agentes + browser** no Cursor para tráfego/rede e telas; código local continua sendo o melhor para todos os endpoints |

O botão **Search API** no [portal](portal/index.html) organiza o fluxo e gera comandos/prompts — a coleta pesada roda no **seu PC** (Cursor + Python) ou, no futuro, em um servidor que você hospedar.

---

## Parte 1 — Preparar o PC (uma vez)

### Passo 1.1 — Git

1. Instale [Git for Windows](https://git-scm.com/download/win) se ainda não tiver.
2. Em um PowerShell **novo**, teste:
   ```powershell
   git --version
   ```
3. Se falhar, na pasta do pacote:
   ```powershell
   . .\scripts\git-env.ps1
   git --version
   ```

### Passo 1.2 — Python 3.12+

1. Na pasta do pacote:
   ```powershell
   .\INSTALAR-PYTHON.cmd
   ```
2. **Feche e abra** o terminal.
3. Teste:
   ```powershell
   py -3 --version
   ```

### Passo 1.3 — Clonar o pacote Sniffer

```powershell
cd $env:USERPROFILE\Projects
git clone https://github.com/Kadu207/Pacote-API-e-Sniffer.git
cd Pacote-API-e-Sniffer
```

*(Ou use a pasta no Desktop: `Projetos DEV\Pacote API e Sniffer`.)*

### Passo 1.4 — Copiar as duas skills no Cursor (uma vez por PC)

Abra PowerShell **na pasta do pacote**:

```powershell
$desk = [Environment]::GetFolderPath("Desktop")
Set-Location -LiteralPath (Join-Path $desk "Projetos DEV\Pacote API e Sniffer")
# Se usou clone em Projects, ajuste o Set-Location.

New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.cursor\skills" | Out-Null
Copy-Item -Recurse -Force ".cursor\skills\sniff-system-apis" "$env:USERPROFILE\.cursor\skills\sniff-system-apis"
Copy-Item -Recurse -Force ".cursor\skills\sniff-app-screens" "$env:USERPROFILE\.cursor\skills\sniff-app-screens"
```

Confirme:

```powershell
Test-Path "$env:USERPROFILE\.cursor\skills\sniff-system-apis\SKILL.md"
Test-Path "$env:USERPROFILE\.cursor\skills\sniff-app-screens\SKILL.md"
```

Deve retornar `True` nos dois.

### Passo 1.5 — Abrir o pacote no Cursor

1. **File → Open Folder** → pasta `Pacote API e Sniffer` (ou o clone).
2. Em um chat **Agent**, as skills passam a estar disponíveis pelo nome.

---

## Parte 2 — Preparar o app que será analisado

O app **não** fica dentro do pacote. Exemplo: você tem o código em `C:\Users\carlo\Projects\meu-sistema`.

### Passo 2.1 — Ter o código na máquina

**Opção A — já tem pasta local**

Anote o caminho, ex.: `C:\Users\carlo\Projects\meu-sistema`

**Opção B — só tem URL do GitHub**

```powershell
cd C:\Users\carlo\Projects
git clone https://github.com/ORGANIZACAO/REPO.git meu-sistema
```

Caminho final: `C:\Users\carlo\Projects\meu-sistema`

**Opção C — só tem site publicado (sem código)**

1. Descubra se existe repositório público ou peça o código ao time.
2. Enquanto isso, use o **portal** + agentes browser (Parte 4) para inventário parcial da URL.

---

## Parte 3 — Executar o scan (APIs + telas)

### Passo 3.1 — Comando

No PowerShell, na pasta do **pacote**:

```powershell
$desk = [Environment]::GetFolderPath("Desktop")
Set-Location -LiteralPath (Join-Path $desk "Projetos DEV\Pacote API e Sniffer")

.\ESCANEAR.cmd "C:\Users\carlo\Projects\meu-sistema"
```

Substitua pelo **caminho real** do seu app (não use texto de exemplo).

### Passo 3.2 — O que deve aparecer

```
=== APIs ===
OK: ...\meu-sistema\docs\api-inventory.json
OK: ...\meu-sistema\docs\SYSTEM-API-DOCUMENTATION.md
OK: ...\meu-sistema\docs\api-catalog\index.html
Rotas: N | ...

=== Telas / UI ===
OK: ...\ui-inventory.json
OK: ...\UI-SCREENS-DOCUMENTATION.md
OK: ...\ui-catalog\index.html
Telas: M | ...

Documentacao em: ...\meu-sistema\docs
APIs:  ...\api-catalog\index.html
Telas: ...\ui-catalog\index.html
```

### Passo 3.3 — Abrir os catálogos no navegador

```powershell
start "C:\Users\carlo\Projects\meu-sistema\docs\api-catalog\index.html"
start "C:\Users\carlo\Projects\meu-sistema\docs\ui-catalog\index.html"
```

Ou duplo clique nos arquivos.

### Passo 3.4 — Erros comuns

| Erro | Solução |
|------|---------|
| `Raiz invalida` | Caminho errado ou pasta inexistente — use aspas e path absoluto |
| `Python nao encontrado` | Rode `INSTALAR-PYTHON.cmd` e abra terminal novo |
| `0 rotas` | Projeto sem Express/etc. na raiz — aponte `--root` para subpasta `apps/api` manualmente (ver abaixo) |

Scan manual em subpasta da API:

```powershell
py -3 scripts\scan-apis.py --root "C:\...\meu-sistema\apps\api" --out "C:\...\meu-sistema\docs"
py -3 scripts\scan-screens.py --root "C:\...\meu-sistema\apps\web" --out "C:\...\meu-sistema\docs"
```

---

## Parte 4 — Agentes no Cursor (coleta rigorosa)

Abra o Cursor na pasta do **app analisado** (`meu-sistema`), não só no pacote.

### Passo 4.1 — Colar URL no portal (opcional)

1. Abra `portal/index.html` do pacote no navegador (duplo clique).
2. Cole a URL do site ou caminho local.
3. Clique **Search API** — copie os prompts gerados.

### Passo 4.2 — Ordem dos 6 agentes

| # | Ação | Prompt resumido |
|---|------|-----------------|
| 1 | Scan API | `Use sniff-system-apis. Confirme docs/api-inventory.json e path_full.` |
| 2 | Scan telas | `Use sniff-app-screens. Confirme docs/ui-inventory.json.` |
| 3 | Enriquecer API | `Leia cada route em api-inventory.json, arquivo:linha, crie ENDPOINTS-DETALHADOS.md` |
| 4 | Enriquecer UI | `Leia ui-inventory + browser na URL do app, crie TELAS-DETALHADAS.md` |
| 5 | Validar | `Liste WebSocket, GraphQL, rotas dinâmicas não cobertas` |
| 6 | Publicar | `Siga PUBLICAR-WEB.md; informe URLs finais` |

Prompt único (após `ESCANEAR.cmd`):

```
Use sniff-system-apis e sniff-app-screens neste repositório.
Revise docs/api-inventory.json e docs/ui-inventory.json.
Enriqueça: ENDPOINTS-DETALHADOS.md e TELAS-DETALHADAS.md (crie em docs/).
Valide lacunas. Não invente rotas. Cite arquivo:linha.
```

### Passo 4.3 — Se a entrada foi URL do site (não pasta local)

```
URL do sistema: https://seu-dominio.com
Use sniff-system-apis e sniff-app-screens.
Com browser MCP: navegue rotas principais, registre chamadas de API (método, path, status).
Cruze com OpenAPI/Swagger se existir em /api-docs ou similar.
Gere docs/api-inventory.json e documentação em docs/ sem alterar código de produção.
```

*(Inventário por URL é complementar; código local continua mais completo.)*

---

## Parte 5 — Publicar no seu site

### Passo 5.1 — Arquivos a subir

Do app analisado, pasta `docs/`:

- `api-catalog/` (site APIs)
- `ui-catalog/` (site telas)
- `api-inventory.json`, `ui-inventory.json` (download)
- `*.md` (documentação)

### Passo 5.2 — Portal central (pacote)

Publique a pasta `portal/` do pacote como **página inicial** do seu domínio:

- Campo URL + **Search API**
- Link **Download** → ZIP do GitHub

Ver [PUBLICAR-WEB.md](PUBLICAR-WEB.md).

### Passo 5.3 — GitHub Pages (exemplo)

No repositório do **app**:

```powershell
cd C:\Users\carlo\Projects\meu-sistema
git add docs/
git commit -m "docs: catálogo API e telas"
git push
```

GitHub → **Settings → Pages** → branch `main`, pasta `/docs`.

---

## Parte 6 — Download para rodar em qualquer computador

### Opção A — ZIP do GitHub (sem git)

1. Acesse: https://github.com/Kadu207/Pacote-API-e-Sniffer/archive/refs/heads/main.zip
2. Extraia.
3. Instale Python + copie skills (Parte 1).
4. `.\ESCANEAR.cmd "C:\caminho\do\app"`

### Opção B — Git clone

```powershell
git clone https://github.com/Kadu207/Pacote-API-e-Sniffer.git
```

### Opção C — Página do portal

O `portal/index.html` tem botão **Baixar pacote local** apontando para o ZIP oficial.

---

## Parte 7 — Site com “Search API” (visão)

| Hoje | Futuro (servidor opcional) |
|------|----------------------------|
| Portal estático: URL → comandos + prompts | API no servidor: clone + scan + fila de agentes |
| Scan na sua máquina | Scan na nuvem com o mesmo `scan-apis.py` |

Fluxo ideal no site:

1. Usuário cola URL ou path.
2. **Search API** → valida entrada → mostra plano (clone / scan / agentes).
3. Resultado publicado em `api-catalog` + JSON para download.

O repositório já inclui `portal/index.html` como **versão 1** desse site.

---

## Checklist rápido

- [ ] Python + Git OK
- [ ] Pacote clonado
- [ ] Duas skills em `%USERPROFILE%\.cursor\skills\`
- [ ] Código do app na máquina (caminho anotado)
- [ ] `.\ESCANEAR.cmd "caminho"` sem erro
- [ ] `api-catalog` e `ui-catalog` abrem no navegador
- [ ] Agentes geraram `ENDPOINTS-DETALHADOS.md` / `TELAS-DETALHADAS.md`
- [ ] `docs/` publicado no seu domínio
- [ ] Portal + link de download no ar

---

## Referências

- [GUIA-AGENTES.md](GUIA-AGENTES.md)
- [GUIA-MULTI-AGENTES.md](GUIA-MULTI-AGENTES.md)
- [README.md](README.md)

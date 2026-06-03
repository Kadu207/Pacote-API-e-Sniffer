# Pacote API e Sniffer

Pacote Cursor para **mapear APIs** em qualquer codebase e gerar **documentação** (rotas com caminho completo, prefixos `app.use`, OpenAPI, integrações HTTP, alertas básicos de segredos).

**Repositório:** https://github.com/Kadu207/Pacote-API-e-Sniffer

> **Não é** o repositório do sistema escaneado. Use `--root` apontando para o app (ex. monorepo em `Projects\...`). O scanner só **escreve** em `{root}/docs/`.

## Estrutura

| Pasta / arquivo | Função |
|-----------------|--------|
| `.cursor/skills/sniff-system-apis/` | Skill do Agent |
| `scripts/scan-apis.py` | Scanner (v1.3.1) |
| `scripts/git-env.ps1` | Git no PATH da sessão |
| `ESCANEAR.cmd` | Scan com Python do AppData |
| `INSTALAR-PYTHON.cmd` | Instala Python 3.12 via winget |
| `CONFIGURAR-GIT-PATH.cmd` | Aviso + PATH (use com cuidado) |
| `VALIDAR.ps1` / `VALIDAR.cmd` | Checagem local/remoto + smoke |
| `PUSH-GITHUB.ps1` / `PUSH.cmd` | Commit + push deste pacote |
| `GUIA-AGENTES.md` | Uso no Cursor (agentes) |
| `templates/` | Template manual complementar |

## Início rápido

```powershell
$desk = [Environment]::GetFolderPath("Desktop")
Set-Location -LiteralPath (Join-Path $desk "Projetos DEV\Pacote API e Sniffer")

# Se não tiver Python: .\INSTALAR-PYTHON.cmd (feche e abra o terminal depois)
.\ESCANEAR.cmd "C:\caminho\real\do\seu-projeto"
```

*(Substitua `C:\caminho\real\do\seu-projeto` pelo path absoluto do sistema — não use o texto literal `caminho\do\projeto`.)*

Ou manualmente (com Python no PATH):

```powershell
py -3 scripts\scan-apis.py --root "C:\caminho\real\do\seu-projeto" --out "C:\caminho\real\do\seu-projeto\docs"
```

### Saída (v1.3+)

Em `{seu-projeto}/docs/`:

- `api-inventory.json` — `path_full`, `router_var`, mounts (`kind: mount`)
- `SYSTEM-API-DOCUMENTATION.md` — tabelas **Prefixos de API** e **Caminho completo** (`GET /api/...`)

## Cursor Agent

Ver [GUIA-AGENTES.md](GUIA-AGENTES.md).

```
Use a skill sniff-system-apis. Escaneie este repositório (raiz do app) e gere a documentação de APIs em docs/.
```

Copiar skill globalmente:

```powershell
Copy-Item -Recurse -Force ".cursor\skills\sniff-system-apis" "$env:USERPROFILE\.cursor\skills\sniff-system-apis"
```

## Git (sem PATH configurado)

Se `.\VALIDAR.ps1` falhar por **política de execução**, use os `.cmd` ou `-ExecutionPolicy Bypass`:

```powershell
.\VALIDAR.cmd
.\PUSH.cmd

powershell -NoProfile -ExecutionPolicy Bypass -File ".\VALIDAR.ps1"
. .\scripts\git-env.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File ".\PUSH-GITHUB.ps1" -CommitMessage "feat: sua mensagem"
```

## Roadmap

Ver [CHANGELOG.md](CHANGELOG.md), [GITHUB.md](GITHUB.md) e [CONTRIBUTING.md](CONTRIBUTING.md).

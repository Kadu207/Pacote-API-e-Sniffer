# Pacote API e Sniffer

Pacote Cursor para **mapear APIs** em qualquer codebase e gerar **documentação** (rotas, OpenAPI, integrações HTTP, alertas básicos de segredos).

**Repositório:** https://github.com/Kadu207/Pacote-API-e-Sniffer

## Estrutura

| Pasta / arquivo | Função |
|-----------------|--------|
| `.cursor/skills/sniff-system-apis/` | Skill do Agent |
| `scripts/scan-apis.py` | Scanner (v1.1.0) |
| `scripts/git-env.ps1` | Git no PATH da sessão |
| `PUSH-GITHUB.ps1` | Commit + push |
| `VALIDAR.ps1` | Checagem local/remoto |
| `GUIA-AGENTES.md` | Uso no Cursor |

## Início rápido

```powershell
$desk = [Environment]::GetFolderPath("Desktop")
Set-Location -LiteralPath (Join-Path $desk "Projetos DEV\Pacote API e Sniffer")

python scripts\scan-apis.py --root "C:\caminho\do\projeto" --out docs
```

Saída: `docs/api-inventory.json` + `docs/SYSTEM-API-DOCUMENTATION.md`

## Cursor Agent

```
Use a skill sniff-system-apis. Escaneie este repositório e gere a documentação de APIs em docs/.
```

Copiar skill globalmente:

```powershell
Copy-Item -Recurse -Force ".cursor\skills\sniff-system-apis" "$env:USERPROFILE\.cursor\skills\sniff-system-apis"
```

## Git (sem PATH configurado)

```powershell
. .\scripts\git-env.ps1
.\VALIDAR.ps1
powershell -ExecutionPolicy Bypass -File ".\PUSH-GITHUB.ps1" -CommitMessage "feat: sua mensagem"
```

## Roadmap

Ver [CHANGELOG.md](CHANGELOG.md) e [CONTRIBUTING.md](CONTRIBUTING.md).

# GitHub — Kadu207/Pacote-API-e-Sniffer

URL: https://github.com/Kadu207/Pacote-API-e-Sniffer

Este repositório contém **apenas o pacote** (scanners + skills + guias). Inventários de APIs e telas ficam no `{app}/docs/` de cada app analisado — nunca commitados aqui por padrão.

## Publicar alterações

```powershell
$desk = [Environment]::GetFolderPath("Desktop")
Set-Location -LiteralPath (Join-Path $desk "Projetos DEV\Pacote API e Sniffer")
powershell -ExecutionPolicy Bypass -File ".\PUSH-GITHUB.ps1" -CommitMessage "feat: descreva a mudança"
```

## Clonar em outro PC

```powershell
git clone https://github.com/Kadu207/Pacote-API-e-Sniffer.git
```

## Validar

```powershell
.\VALIDAR.cmd
```

## Ver também

- [GUIA-AGENTES.md](GUIA-AGENTES.md) — agentes Cursor
- [COMANDOS-PUSH.txt](COMANDOS-PUSH.txt) — comandos copiáveis
- [CONTRIBUTING.md](CONTRIBUTING.md) — alterar scanner/skill

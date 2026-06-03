# Guia — Agentes Cursor + Pacote API Sniffer

**Repo:** https://github.com/Kadu207/Pacote-API-e-Sniffer

## Abrir a pasta (evita erro `Ãrea`)

```powershell
$desk = [Environment]::GetFolderPath("Desktop")
Set-Location -LiteralPath (Join-Path $desk "Projetos DEV\Pacote API e Sniffer")
```

## Escanear outro sistema

```powershell
python scripts\scan-apis.py --root "C:\Users\carlo\Projects\SEU_PROJETO" --out "C:\Users\carlo\Projects\SEU_PROJETO\docs"
```

## Skill global

```powershell
Copy-Item -Recurse -Force ".cursor\skills\sniff-system-apis" "$env:USERPROFILE\.cursor\skills\sniff-system-apis"
```

## Prompt Agent

```
Use sniff-system-apis. Execute scan-apis.py na raiz deste repo. Gere docs/SYSTEM-API-DOCUMENTATION.md e resumo com stacks, totais e alertas de segurança.
```

## Git / push / validar

```powershell
. .\scripts\git-env.ps1
.\VALIDAR.ps1
powershell -ExecutionPolicy Bypass -File ".\PUSH-GITHUB.ps1" -CommitMessage "feat: minha alteracao"
```

Mais detalhes: [README.md](README.md), [CHANGELOG.md](CHANGELOG.md)

# Guia — Agentes Cursor + Pacote API e Sniffer

**Repo:** https://github.com/Kadu207/Pacote-API-e-Sniffer  
**Escopo:** ferramenta multi-agente — **APIs** + **telas de aplicativos** (não versionar apps analisados aqui).

## Princípio

| O quê | Onde fica |
|-------|-----------|
| Pacote (scanners, skills, guias) | Este repositório |
| App analisado | Outro `--root`; saída só em `{app}/docs/` |
| Site público | Você publica `api-catalog/` e `ui-catalog/` do app |

Não commitar código de sistemas clientes no pacote. Não usar nomes de projetos reais como exemplo fixo na documentação.

## Skills

| Skill | Uso |
|-------|-----|
| `sniff-system-apis` | Endpoints, OpenAPI, clientes HTTP |
| `sniff-app-screens` | Rotas de UI; browser para fluxos visuais |

```powershell
Copy-Item -Recurse -Force ".cursor\skills\sniff-system-apis" "$env:USERPROFILE\.cursor\skills\sniff-system-apis"
Copy-Item -Recurse -Force ".cursor\skills\sniff-app-screens" "$env:USERPROFILE\.cursor\skills\sniff-app-screens"
```

## Scan completo (APIs + telas)

```powershell
$desk = [Environment]::GetFolderPath("Desktop")
Set-Location -LiteralPath (Join-Path $desk "Projetos DEV\Pacote API e Sniffer")
.\ESCANEAR.cmd "C:\caminho\real\do\app-analisado"
```

## Fluxo do agente

1. `--root` = pasta do **app** (front + back ou monorepo).
2. `ESCANEAR.cmd` ou `scan-apis.py` + `scan-screens.py`.
3. Conferir `docs/api-inventory.json` e `docs/ui-inventory.json`.
4. Abrir `docs/api-catalog/index.html` e `docs/ui-catalog/index.html`.
5. Enriquecer (handlers + telas no browser) — ver [GUIA-MULTI-AGENTES.md](GUIA-MULTI-AGENTES.md).
6. Publicar — [PUBLICAR-WEB.md](PUBLICAR-WEB.md).

## Prompt Agent

```
Use sniff-system-apis e sniff-app-screens.
Escaneie o repositório alvo (--root). Gere inventários em docs/.
Resuma APIs (path_full, prefixos) e telas (rotas UI).
Não altere código fora de docs/ salvo pedido explícito.
Não inclua outros projetos neste pacote Sniffer.
```

## Saídas

| Artefato | Tipo |
|----------|------|
| `api-catalog/index.html` | Site — APIs |
| `ui-catalog/index.html` | Site — telas |
| `api-inventory.json` / `ui-inventory.json` | Dados para agentes |

## Documentação

- [GUIA-MULTI-AGENTES.md](GUIA-MULTI-AGENTES.md)
- [PUBLICAR-WEB.md](PUBLICAR-WEB.md)
- [README.md](README.md) · [CHANGELOG.md](CHANGELOG.md)

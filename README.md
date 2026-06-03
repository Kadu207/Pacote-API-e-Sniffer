# Pacote API e Sniffer

Pacote **multi-agente** para Cursor: coleta de **APIs** e **telas** de aplicativos, com saída em arquivo e site — **ferramenta reutilizável**, sem código de clientes neste repo.

**Repositório:** https://github.com/Kadu207/Pacote-API-e-Sniffer

---

## Fase atual: construir o pacote

Você **não precisa** analisar nenhum software agora.

| Agora | Depois |
|-------|--------|
| Validar scanners, portal, skills, guias | `ESCANEAR.cmd` no app que você escolher |
| Publicar `portal/` no seu site | Gerar `docs/` no projeto analisado |

**Comece aqui:** [CONSTRUINDO-PACOTE.md](CONSTRUINDO-PACOTE.md) · [docs/ARQUITETURA.md](docs/ARQUITETURA.md)  
**API Harvester (Lovable):** [harvester/](harvester/) · [docs/API-HARVESTER-LOVABLE.md](docs/API-HARVESTER-LOVABLE.md)

```powershell
$desk = [Environment]::GetFolderPath("Desktop")
Set-Location -LiteralPath (Join-Path $desk "Projetos DEV\Pacote API e Sniffer")
.\VALIDAR.cmd
Start-Process -LiteralPath ".\portal\index.html"
```

---

## O que o pacote fará (quando estiver pronto)

| Camada | Scanner | Saída em `{app}/docs/` |
|--------|---------|-------------------------|
| **APIs** | `scan-apis.py` | `api-catalog/`, inventário JSON |
| **Telas** | `scan-screens.py` | `ui-catalog/`, inventário JSON |

Portal: **Search API** + **download** local — [portal/index.html](portal/index.html)

---

## Estrutura do repositório

| Item | Função |
|------|--------|
| `harvester/` | App fullstack Lovable (Search API, relatórios) |
| `portal/` | Protótipo estático legado |
| `backend/` `frontend/` | Apontam para `harvester/` |
| `scripts/` | Core — scanners Python |
| `.cursor/skills/` | Skills para agentes |
| `CONSTRUINDO-PACOTE.md` | Checklist fase construção |
| `GUIA-MULTI-AGENTES.md` | Fluxo dos 6 agentes (uso futuro) |
| `GUIA-PROCEDIMENTO-COMPLETO.md` | Passo a passo ao analisar um app |

---

## Skills (desenvolvimento no Cursor)

```powershell
Copy-Item -Recurse -Force ".cursor\skills\sniff-system-apis" "$env:USERPROFILE\.cursor\skills\sniff-system-apis"
Copy-Item -Recurse -Force ".cursor\skills\sniff-app-screens" "$env:USERPROFILE\.cursor\skills\sniff-app-screens"
```

---

## Git

```powershell
.\VALIDAR.cmd
.\PUSH.cmd
```

[CHANGELOG.md](CHANGELOG.md) · [GITHUB.md](GITHUB.md) · [CONTRIBUTING.md](CONTRIBUTING.md)

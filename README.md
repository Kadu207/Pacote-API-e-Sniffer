# Pacote API e Sniffer

Pacote **multi-agente** para Cursor: coleta objetiva de **APIs** (endpoints, integrações) e **telas** (rotas de UI / interface) de qualquer aplicativo, com saída em **arquivo** e **site estático** publicável.

**Repositório:** https://github.com/Kadu207/Pacote-API-e-Sniffer

> Repositório **somente da ferramenta**. O app analisado é outro projeto (`--root`). Nada de código de sistemas clientes é versionado aqui.

## O que o pacote faz

| Camada | Scanner | Saída em `{app}/docs/` |
|--------|---------|-------------------------|
| **APIs** | `scan-apis.py` | `api-inventory.json`, `SYSTEM-API-DOCUMENTATION.md`, `api-catalog/` |
| **Telas / UI** | `scan-screens.py` | `ui-inventory.json`, `UI-SCREENS-DOCUMENTATION.md`, `ui-catalog/` |

Agentes no Cursor enriquecem (como cada endpoint/tela funciona) e publicam na web — ver [GUIA-MULTI-AGENTES.md](GUIA-MULTI-AGENTES.md).

## Estrutura

| Item | Função |
|------|--------|
| `.cursor/skills/sniff-system-apis/` | Skill — APIs |
| `.cursor/skills/sniff-app-screens/` | Skill — telas / UI |
| `scripts/scan-apis.py` | Scanner HTTP (v1.4.x) |
| `scripts/scan-screens.py` | Scanner UI (v1.0.x) |
| `ESCANEAR.cmd` | APIs + telas em um comando |
| `GUIA-AGENTES.md` | Uso no Cursor |
| `GUIA-MULTI-AGENTES.md` | Fluxo multi-agente |
| `PUBLICAR-WEB.md` | Publicar catálogos no seu site |

## Início rápido (qualquer PC)

```powershell
git clone https://github.com/Kadu207/Pacote-API-e-Sniffer.git
cd Pacote-API-e-Sniffer

$desk = [Environment]::GetFolderPath("Desktop")
# ou permaneça na pasta do clone

.\ESCANEAR.cmd "C:\caminho\real\do\app-analisado"
```

Copiar skills para o Cursor:

```powershell
Copy-Item -Recurse -Force ".cursor\skills\sniff-system-apis" "$env:USERPROFILE\.cursor\skills\sniff-system-apis"
Copy-Item -Recurse -Force ".cursor\skills\sniff-app-screens" "$env:USERPROFILE\.cursor\skills\sniff-app-screens"
```

## Prompt multi-agente (resumo)

```
Use sniff-system-apis e sniff-app-screens no --root do app.
Rode ESCANEAR ou os dois scanners. Documente APIs (path_full) e telas (ui-inventory).
Enriqueça comportamento e fluxos visuais; publique api-catalog e ui-catalog conforme PUBLICAR-WEB.md.
Não misturar outros repositórios neste pacote.
```

## Git / validar

```powershell
.\VALIDAR.cmd
.\PUSH.cmd
```

Ver [CHANGELOG.md](CHANGELOG.md), [GITHUB.md](GITHUB.md), [CONTRIBUTING.md](CONTRIBUTING.md).

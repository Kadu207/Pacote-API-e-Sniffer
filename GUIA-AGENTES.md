# Guia — Agentes Cursor + Pacote API e Sniffer

**Repo (este pacote):** https://github.com/Kadu207/Pacote-API-e-Sniffer  
**Scanner atual:** v1.3.x (`python scripts/scan-apis.py --version`)

Este repositório é **somente a ferramenta** de scan. O sistema analisado (ex.: um app em `C:\Users\carlo\Projects\...`) é outro projeto — o scanner grava saída em `{projeto}/docs/`, sem alterar código-fonte do alvo.

## Projetos separados (não misturar)

| Projeto | Papel |
|---------|--------|
| **Pacote API e Sniffer** | Skill + `scan-apis.py` + scripts `.cmd`/`.ps1` |
| **Sistema escaneado** (`--root`) | App real; recebe apenas `docs/api-inventory.json` e `docs/SYSTEM-API-DOCUMENTATION.md` |
| **Contratos formais** (OpenAPI/GraphQL) | Seção do template / specs no inventário — não confundir com outros repositórios |

Não commitar nem editar o código do alvo salvo pedido explícito. Não assumir que `Dental_lab`, `dental-lab-system` ou outro nome no GitHub é o mesmo path local sem o usuário confirmar a URL.

## Abrir a pasta (evita erro `Ãrea`)

```powershell
$desk = [Environment]::GetFolderPath("Desktop")
Set-Location -LiteralPath (Join-Path $desk "Projetos DEV\Pacote API e Sniffer")
```

## Fluxo do agente (ordem)

1. Confirmar `--root` = pasta do **sistema a documentar** (não a pasta do Pacote, salvo smoke test).
2. Executar o scanner (não inventar rotas):
   ```powershell
   .\ESCANEAR.cmd "C:\caminho\real\do\seu-projeto"
   ```
   Ou, com Python no PATH:
   ```powershell
   py -3 scripts\scan-apis.py --root "C:\caminho\real\do\seu-projeto" --out "C:\caminho\real\do\seu-projeto\docs"
   ```
   Se o pacote estiver em outro disco, use o caminho absoluto até `scripts/scan-apis.py` do clone [Pacote-API-e-Sniffer](https://github.com/Kadu207/Pacote-API-e-Sniffer).
3. Ler `docs/api-inventory.json` e `docs/SYSTEM-API-DOCUMENTATION.md` **no projeto escaneado**.
4. Validar no MD: `> Scanner: v1.3.x`, seção **Prefixos de API (app.use)**, tabela **APIs expostas (caminho completo)**.
5. No JSON: `kind` (`mount` / `route`), `path_full`, `router_var`, `warnings`.
6. Complementar manualmente: WebSocket, gRPC, tRPC, rotas 100% dinâmicas.
7. Entregar resumo com stacks, totais, prefixos, rotas com **caminho completo**, alertas de segurança e caminhos dos arquivos.

## Skill global

```powershell
Copy-Item -Recurse -Force ".cursor\skills\sniff-system-apis" "$env:USERPROFILE\.cursor\skills\sniff-system-apis"
```

## Prompt Agent (copiar)

```
Use a skill sniff-system-apis. Execute scan-apis.py na raiz DESTE repositório (sistema alvo).
Gere docs/SYSTEM-API-DOCUMENTATION.md e resumo com stacks, totais, prefixos app.use,
rotas com caminho completo (path_full no JSON) e alertas de segurança.
Não altere código fora de docs/ salvo pedido explícito.
```

## Saída v1.3+ (o que conferir)

| Artefato | Conteúdo |
|----------|----------|
| `SYSTEM-API-DOCUMENTATION.md` | Tabela **Caminho completo** (ex. `GET /api/clientes/:id`) |
| `api-inventory.json` | `path` (relativo no router), `path_full`, `router_var`, mounts com `note: router=...` |

Template manual (complemento): `templates/SYSTEM-DOCUMENTATION.template.md` — a saída automática é `SYSTEM-API-DOCUMENTATION.md`.

## Git / push / validar (só neste pacote)

```powershell
.\VALIDAR.cmd
.\PUSH.cmd
```

PowerShell com política de scripts bloqueada:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File ".\VALIDAR.ps1"
powershell -NoProfile -ExecutionPolicy Bypass -File ".\PUSH-GITHUB.ps1" -CommitMessage "feat: sua alteração"
```

Git na sessão (sem alterar PATH permanente):

```powershell
. .\scripts\git-env.ps1
```

Para PATH permanente, prefira adicionar Git nas Configurações do Windows; evite `setx PATH` com `%PATH%` inteiro (pode truncar).

## Documentação relacionada

- [README.md](README.md) — início rápido e estrutura
- [CHANGELOG.md](CHANGELOG.md) — versões do scanner
- [GITHUB.md](GITHUB.md) — clone e push
- [COMANDOS-PUSH.txt](COMANDOS-PUSH.txt) — comandos copiáveis
- [CONTRIBUTING.md](CONTRIBUTING.md) — alterar o scanner ou a skill

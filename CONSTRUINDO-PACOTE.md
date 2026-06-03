# Construindo o pacote (antes de analisar apps)

**Fase atual:** montar a **ferramenta** (scanners, portal, skills, guias, download).  
**Depois:** usar `ESCANEAR.cmd` em sistemas reais — ver [GUIA-PROCEDIMENTO-COMPLETO.md](GUIA-PROCEDIMENTO-COMPLETO.md).

Nenhum software cliente precisa ser analisado agora. **Não escanear apps externos** até o pipeline e o produto (backend/frontend Lovable) estarem prontos.

**Arquitetura e pipeline:** [docs/ARQUITETURA.md](docs/ARQUITETURA.md)  
**Quando o Lovable chegar:** [LOVABLE-INTEGRACAO.md](LOVABLE-INTEGRACAO.md)

---

## Visão do produto final

| Peça | Função |
|------|--------|
| **Backend** | `backend/` — Lovable (jobs, Search API) |
| **Frontend** | `frontend/` — Lovable (UI produto) |
| **Portal web** | `portal/` — protótipo até migrar para frontend |
| **Scanners (core)** | `scan-apis.py` + `scan-screens.py` |
| **Skills Cursor** | `sniff-system-apis` + `sniff-app-screens` |
| **Guias multi-agente** | 6 papéis (coleta, enriquecimento, validação, publicação) |
| **Saída por app** | `{app}/docs/` — só na **fase 2** |

---

## O que já está pronto

- [x] Scanner APIs v1.4+ (caminho completo, `api-catalog`)
- [x] Scanner telas v1.0 (`ui-catalog`)
- [x] `ESCANEAR.cmd` (APIs + UI)
- [x] Skills + `GUIA-AGENTES` + `GUIA-MULTI-AGENTES`
- [x] `portal/index.html` (protótipo Search API + download)
- [x] CI (`py_compile` + smoke no próprio pacote)
- [x] Scripts Git/validar/push

---

## Checklist — Fase 1 (construção)

Marque conforme for concluindo **neste repo**:

### A. Validar o pacote localmente

```powershell
$desk = [Environment]::GetFolderPath("Desktop")
Set-Location -LiteralPath (Join-Path $desk "Projetos DEV\Pacote API e Sniffer")

.\VALIDAR.cmd
py -3 scripts\scan-apis.py --version
py -3 scripts\scan-screens.py --version
```

Smoke (scan só no pacote, sem app externo):

```powershell
py -3 scripts\scan-apis.py --root . --out docs\example-run
py -3 scripts\scan-screens.py --root . --out docs\example-run
```

Abra `docs\example-run\api-catalog\index.html` se quiser ver o layout (poucas rotas — normal).

### B. Portal (site do produto)

```powershell
Start-Process -LiteralPath ".\portal\index.html"
```

Pendente de produto (você + agentes):

- [ ] Publicar `portal/` no domínio que você escolher
- [ ] Ajustar textos / marca no `portal/index.html`
- [ ] (Futuro) backend: Search API executar scan na nuvem

### C. Skills no Cursor (só para desenvolver o pacote)

```powershell
Copy-Item -Recurse -Force ".cursor\skills\sniff-system-apis" "$env:USERPROFILE\.cursor\skills\sniff-system-apis"
Copy-Item -Recurse -Force ".cursor\skills\sniff-app-screens" "$env:USERPROFILE\.cursor\skills\sniff-app-screens"
```

Prompt útil **agora** (melhorar o pacote, não escanear cliente):

```
Trabalhe só no repositório Pacote-API-e-Sniffer.
Objetivo: evoluir portal, scanners e guias. Não rode ESCANEAR em apps externos.
Proponha mudanças mínimas e teste com VALIDAR.cmd e smoke em --root .
```

### D. Documentação

- [x] `CONSTRUINDO-PACOTE.md` (este arquivo)
- [ ] Revisar `portal/` e `PUBLICAR-WEB.md` com sua URL final
- [ ] Release GitHub `v1.5.0` com ZIP para download no portal

### E. API Harvester (Lovable)

- [x] App em `harvester/` + doc em `docs/API-HARVESTER-LOVABLE.md`
- [ ] `cd harvester && bun install && bun run dev`
- [ ] Configurar `.env` (`LOVABLE_API_KEY`, `FIRECRAWL_API_KEY`) — ver `.env.example`
- [ ] (Futuro) Bridge para `scripts/scan-*.py` em análise de código local

### F. GitHub

```powershell
.\PUSH.cmd
```

Mensagem sugerida: `docs: arquitetura pipeline fase construção + portal`

---

## Fase 2 — Quando o pacote estiver pronto

Aí sim:

1. Escolher pasta ou repo do **app alvo**
2. `.\ESCANEAR.cmd "C:\caminho\real\do\app"`
3. Agentes enriquecem `docs/` do app
4. Publicar `api-catalog` + `ui-catalog` no site do cliente

**Não antecipe a fase 2** enquanto a fase 1 não estiver publicada e validada.

---

## Estrutura deste repositório (não confundir)

```
Pacote API e Sniffer/     ← VOCÊ CONSTRÓI AQUI
├── portal/               ← site Search API + download
├── scripts/              ← scanners
├── .cursor/skills/       ← agentes
└── docs/example-run/     ← só testes (gitignore se necessário)

(outro projeto)/docs/     ← saída futura, FORA deste repo
```

---

## Próximos passos sugeridos (ordem)

1. Commit + push do `portal/` e guias pendentes  
2. Publicar portal no seu domínio  
3. Criar release com ZIP no GitHub  
4. (Opcional) API servidor para Search API automático  
5. Iniciar fase 2 com o primeiro app escolhido por você  

---

## Referências

- [README.md](README.md)
- [CHANGELOG.md](CHANGELOG.md)
- [CONTRIBUTING.md](CONTRIBUTING.md)

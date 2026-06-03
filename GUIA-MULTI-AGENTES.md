# Guia multi-agente — APIs + telas de aplicativos

Pacote para **vários agentes** trabalharem de forma **objetiva**: coleta automática, enriquecimento, validação e publicação — **sem** misturar o código do app analisado neste repositório.

## Arquitetura (6 papéis)

| # | Agente | Foco | Saída principal |
|---|--------|------|-----------------|
| 1 | **Descoberta API** | `scan-apis.py` | `api-inventory.json`, `api-catalog/` |
| 2 | **Descoberta telas** | `scan-screens.py` + browser opcional | `ui-inventory.json`, `ui-catalog/` |
| 3 | **Enriquecimento API** | Ler handlers `arquivo:linha` | `ENDPOINTS-DETALHADOS.md` |
| 4 | **Enriquecimento UI** | Browser / componentes | `TELAS-DETALHADAS.md` |
| 5 | **Validação** | Lacunas (WS, modais, rotas dinâmicas) | Lista de gaps |
| 6 | **Publicação** | Site + arquivos portáteis | URL + pasta `docs/` |

Um agente pode rodar tudo em sequência; em apps grandes, **uma conversa por papel**.

---

## Agente 1 — Descoberta API

```powershell
git clone https://github.com/Kadu207/Pacote-API-e-Sniffer.git
.\ESCANEAR.cmd "C:\caminho\real\do\app-analisado"
```

**Prompt:**

```
Papel: Descoberta API. Skill sniff-system-apis.
Scan na raiz do app. Não inventar rotas. Confirmar path_full.
Entregar totais e caminho docs/api-catalog/index.html.
```

---

## Agente 2 — Descoberta telas (sniffer de interface)

**Prompt:**

```
Papel: Descoberta telas. Skill sniff-app-screens.
Usar ui-inventory.json e ui-catalog/index.html.
Se o app estiver rodando, use browser MCP para amostrar telas principais (título, formulários, ações).
Não inventar rotas que não existam no inventário ou na navegação real.
Atualizar docs/TELAS-RESUMO.md no app alvo se necessário.
```

---

## Agente 3 — Enriquecimento API

```
Papel: Enriquecimento API. docs/api-inventory.json (kind=route).
Por endpoint: params, auth, resposta, efeitos. docs/ENDPOINTS-DETALHADOS.md no app alvo.
```

---

## Agente 4 — Enriquecimento UI

```
Papel: Enriquecimento UI. ui-inventory.json + inspeção visual.
Por tela: propósito, campos, APIs chamadas, perfis de acesso. docs/TELAS-DETALHADAS.md no app alvo.
```

---

## Agente 5 — Validação

```
Papel: Validação. Cruzar API + UI com busca manual (GraphQL, WebSocket, modais, iframe).
Listar omissões com severidade. Não duplicar itens já inventariados.
```

---

## Agente 6 — Publicação

| Canal | Conteúdo |
|-------|----------|
| Arquivos | `docs/*.json`, `*.md`, `api-catalog/`, `ui-catalog/` |
| Site | [PUBLICAR-WEB.md](PUBLICAR-WEB.md) |

```
Papel: Publicação. Publicar api-catalog e ui-catalog no domínio informado pelo usuário.
Entregar URLs finais e checklist de arquivos para outro PC.
```

---

## Regras de eficiência

1. Tabelas e JSON antes de prosa longa.
2. Evidência: `arquivo:linha`, `path_full`, rota UI.
3. `--root` = só o app analisado.
4. **Nunca** versionar apps clientes dentro do repo Pacote-API-e-Sniffer.
5. Re-scan após releases grandes.

---

## Limitações

- API: regex estática; Hono/mounts complexos — revisão manual.
- UI: modais e rotas dinâmicas — Agente 4 + browser.
- “Como funciona” = Agentes 3 e 4, não o scanner sozinho.

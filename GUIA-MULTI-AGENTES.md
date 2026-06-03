# Guia multi-agente — coleta completa de APIs

Objetivo: **todos os endpoints**, **caminho completo**, **como funcionam** (parâmetros, auth, resposta), em **arquivo** e **site**, executável em qualquer PC com clone do pacote + Python.

## Arquitetura (4 papéis)

| Agente | Foco | Entrada | Saída |
|--------|------|---------|--------|
| **1 — Descoberta** | Scan automático | `--root` do sistema | `docs/api-inventory.json`, MD, `docs/api-catalog/index.html` |
| **2 — Enriquecimento** | Ler handlers em `arquivo:linha` | JSON de rotas | Notas por endpoint (body, query, auth, status) |
| **3 — Validação** | Conferir omissões | Inventário + código | Lista de lacunas (WS, gRPC, tRPC, rotas dinâmicas) |
| **4 — Publicação** | Site + portabilidade | `docs/api-catalog/` | URL pública + pacote de arquivos |

Rode no **Cursor** com a skill `sniff-system-apis` ou prompts abaixo. Um único agente pode fazer as 4 fases em sequência; para projetos grandes, use **4 conversas** (uma por papel).

---

## Agente 1 — Descoberta (automático)

```powershell
git clone https://github.com/Kadu207/Pacote-API-e-Sniffer.git
cd Pacote-API-e-Sniffer
.\ESCANEAR.cmd "C:\caminho\real\do\seu-projeto"
```

**Prompt:**

```
Papel: Descoberta de APIs. Use sniff-system-apis.
Execute scan na raiz do projeto alvo. Não invente rotas.
Entregue totais (mounts, rotas, clientes, alertas) e confirme path_full em cada rota Express.
Aponte docs/api-catalog/index.html para abrir no navegador.
```

---

## Agente 2 — Enriquecimento (como funciona cada endpoint)

O scanner não infere lógica de negócio. Este agente abre cada `arquivo:linha` da tabela e documenta:

- Parâmetros (`:id`, query, body)
- Middleware / auth
- Resposta esperada (status, shape JSON)
- Efeitos colaterais (DB, filas)

**Prompt:**

```
Papel: Enriquecimento. Leia docs/api-inventory.json (kind=route).
Para cada endpoint, abra o arquivo na linha indicada e descreva comportamento em 2-4 linhas.
Atualize docs/ENDPOINTS-DETALHADOS.md (crie se não existir) com seções por módulo/router.
Não altere código de produção.
```

---

## Agente 3 — Validação

**Prompt:**

```
Papel: Validação. Compare api-inventory.json com busca manual por WebSocket, GraphQL, tRPC, app.use sem padrão, rotas em strings dinâmicas.
Liste o que falta no inventário. Marque severidade (crítico / informativo).
Não duplicar rotas já listadas com path_full.
```

---

## Agente 4 — Publicação (site + qualquer computador)

| Canal | Como |
|-------|------|
| **Arquivos** | Copiar pasta `docs/` (JSON + MD + `api-catalog/`) |
| **Site estático** | Publicar `docs/api-catalog/` — ver [PUBLICAR-WEB.md](PUBLICAR-WEB.md) |
| **Outro PC** | Clone do pacote + `ESCANEAR.cmd` ou só abrir `index.html` + JSON |

**Prompt:**

```
Papel: Publicação. Siga PUBLICAR-WEB.md para GitHub Pages ou hospedagem estática no domínio informado pelo usuário.
Garanta que api-inventory.json e index.html fiquem acessíveis. Resuma URL final.
```

---

## Eficiência (regras para todos os agentes)

1. **Objetivo primeiro** — tabela de endpoints antes de texto longo.
2. **Citar evidência** — `arquivo:linha` ou `path_full` do JSON.
3. **Não misturar repos** — `--root` = só o sistema documentado.
4. **Não editar** código do alvo salvo pedido explícito.
5. **Re-scan** após mudanças grandes no código: repetir Agente 1.

---

## Limitações atuais do scanner

- Coleta estática (regex); “como funciona” exige Agente 2.
- Hono / rotas montadas de forma não padrão: revisão manual.
- Mesmo `*Router` em vários `app.use`: só o último prefixo no `path_full`.

Ver [CHANGELOG.md](CHANGELOG.md) e [GUIA-AGENTES.md](GUIA-AGENTES.md).

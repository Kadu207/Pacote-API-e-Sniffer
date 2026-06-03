# Integração Lovable (backend + frontend)

Quando você trouxer o código do Lovable para este chat/repositório, siga esta ordem.

## Antes de colar o código

- [ ] Confirmar: **nenhum** app externo será escaneado nesta etapa
- [ ] Ler [docs/ARQUITETURA.md](docs/ARQUITETURA.md)
- [ ] `.\VALIDAR.cmd` passando no estado atual

## Onde está o código Lovable

| Origem | Pasta destino |
|--------|---------------|
| **API Harvester** (fullstack TanStack Start) | `harvester/` |
| Documentação exportada | `docs/API-HARVESTER-LOVABLE.md` |

`backend/` e `frontend/` são apenas **ponteiros** para `harvester/` (app unificado).

Manter `scripts/scan-apis.py` e `scripts/scan-screens.py` na raiz do monorepo.

## Após colar

1. Adicionar `backend/README.md` e `frontend/README.md` com comandos de dev.
2. Variáveis em `.env.example` (nunca commitar `.env`).
3. Backend chama o core:

   ```python
   # Exemplo conceitual
   subprocess.run([
       sys.executable,
       str(REPO_ROOT / "scripts" / "scan-apis.py"),
       "--root", job_root,
       "--out", str(job_root / "docs"),
   ], check=True)
   ```

4. Frontend consome `POST /v1/jobs` (ou equivalente que o Lovable definir).
5. Atualizar `.github/workflows/ci.yml` com jobs do stack Lovable.
6. Migrar fluxo de `portal/index.html` para o frontend quando a UI estiver pronta.

## O que trazer neste chat

- ZIP ou link do export Lovable
- Stack (Node, Python FastAPI, Supabase, etc.)
- Variáveis de ambiente necessárias
- Mockups da tela **Search API** e **Download**

## O que o agente Cursor deve fazer aqui

```
Integrar backend/ e frontend/ do Lovable ao Pacote-API-e-Sniffer.
Preservar scripts/ e skills/. Não escanear projetos externos.
Atualizar ARQUITETURA.md e CI. Propor pipeline estágio 2 e 3.
```

## Portal atual

`portal/index.html` permanece como referência até o frontend Lovable substituir a mesma UX.

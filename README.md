# System API Sniffer

Pacote de agente para **mapear APIs** de qualquer codebase e gerar **documentação do sistema** (endpoints, integrações, OpenAPI, clientes HTTP).

Compatível com **Cursor Agent Skills**, atualizável via **GitHub** (clone / pull periódico).

## Publicar ou clonar do GitHub

Passo a passo: **[GITHUB.md](GITHUB.md)**

```powershell
git clone https://github.com/Kadu207/Pacote-API-e-Sniffer.git
```

## Início rápido

```powershell
cd "C:\Users\carlo\OneDrive\Área de Trabalho\Projetos DEV\Pacote API e Sniffer"
python scripts\scan-apis.py --root "C:\caminho\do\seu\projeto" --out docs
```

Saída em `docs/`:
- `api-inventory.json` — inventário estruturado
- `SYSTEM-API-DOCUMENTATION.md` — documentação legível

## Usar no Cursor

1. Abra a pasta do **projeto alvo** (não só este repositório).
2. Copie a skill para o projeto alvo **ou** referencie esta pasta no prompt.
3. No chat do Agent, escreva:

```
Use a skill sniff-system-apis. Analise este repositório, liste todas as APIs e gere a documentação em docs/.
```

Guia completo: [GUIA-AGENTES.md](GUIA-AGENTES.md)

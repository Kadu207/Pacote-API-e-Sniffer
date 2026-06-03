# Publicar catálogo de APIs na web

Após o scan, os sites estáticos ficam em:

```
{app-analisado}/docs/api-catalog/index.html   # APIs
{app-analisado}/docs/ui-catalog/index.html    # Telas / UI
```

Abra no navegador (duplo clique) ou publique a pasta `api-catalog` (e opcionalmente `api-inventory.json`) em qualquer hospedagem estática.

## Opção A — GitHub Pages (repositório do sistema escaneado)

1. No repo do **sistema** (não só o Pacote Sniffer), commit de `docs/`:

   ```powershell
   git add docs/api-catalog docs/ui-catalog docs/api-inventory.json docs/ui-inventory.json docs/*.md
   git commit -m "docs: catálogo de APIs"
   git push
   ```

2. No GitHub: **Settings → Pages**
   - Source: branch `main` (ou `master`)
   - Folder: `/docs` (se o site estiver em `docs/api-catalog/`, use subpasta ou mova `index.html` para `docs/` conforme preferir)

3. URL típica: `https://SEU_USUARIO.github.io/SEU_REPO/api-catalog/`

Para servir na raiz do Pages, copie `index.html` para `docs/index.html` ou configure `docs/` como raiz com redirect.

## Opção B — Subdomínio / VPS / Cloudflare Pages

1. Faça upload de:
   - `api-catalog/index.html`
   - (opcional) `api-inventory.json` no mesmo host para download

2. **Cloudflare Pages:** conecte o repo; build command vazio; output directory `docs/api-catalog`.

3. **Nginx / Apache:** `root` apontando para a pasta `api-catalog`.

## Opção C — Site que você já direciona

Se você tem um site (WordPress, portal InovatiTech, etc.):

- **iframe:** embarque `https://sua-url/api-catalog/`
- **Link:** botão “Documentação API” → URL do catálogo
- **CI:** após cada deploy do backend, rode `ESCANEAR.cmd` e publique `api-catalog` no mesmo pipeline

## Executar em qualquer computador

| Requisito | Detalhe |
|-----------|---------|
| Git | `git clone https://github.com/Kadu207/Pacote-API-e-Sniffer.git` |
| Python 3.12+ | `INSTALAR-PYTHON.cmd` ou winget |
| Scan | `.\ESCANEAR.cmd "C:\caminho\do\projeto"` |
| Sem scan | Copie só a pasta `docs/` gerada em outra máquina |

Skill global (Cursor em qualquer PC):

```powershell
Copy-Item -Recurse -Force ".cursor\skills\sniff-system-apis" "$env:USERPROFILE\.cursor\skills\sniff-system-apis"
```

## Atualização contínua

Recomendado: job CI no repo do sistema que roda o scanner e publica `docs/` (ver `.github/workflows` de exemplo no Pacote Sniffer).

```yaml
# Exemplo mínimo (ajuste paths)
- run: python /path/to/Pacote-API-e-Sniffer/scripts/scan-apis.py --root . --out docs
```

## Próximo nível (roadmap)

- OpenAPI importado fundido ao catálogo HTML
- Agente 2 gera `ENDPOINTS-DETALHADOS.md` versionado junto ao site
- API viva (Swagger UI) se existir `openapi.yaml` no projeto

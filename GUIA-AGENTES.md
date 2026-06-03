# Guia completo — Agentes Cursor e Pacote API Sniffer

**Pasta do projeto:**

`C:\Users\carlo\OneDrive\Área de Trabalho\Projetos DEV\Pacote API e Sniffer`

---

## Comandos essenciais

```powershell
cd "C:\Users\carlo\OneDrive\Área de Trabalho\Projetos DEV\Pacote API e Sniffer"

python scripts\scan-apis.py `
  --root "C:\Users\carlo\Projects\SEU_PROJETO" `
  --out "C:\Users\carlo\Projects\SEU_PROJETO\docs"
```

## Skill global no Cursor

```powershell
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.cursor\skills"
Copy-Item -Recurse -Force `
  "C:\Users\carlo\OneDrive\Área de Trabalho\Projetos DEV\Pacote API e Sniffer\.cursor\skills\sniff-system-apis" `
  "$env:USERPROFILE\.cursor\skills\sniff-system-apis"
```

## Prompt no Agent

```
Use a skill sniff-system-apis. Execute scan-apis.py neste repositório e gere docs/SYSTEM-API-DOCUMENTATION.md.
```

Ver README.md e GITHUB.md para detalhes completos.

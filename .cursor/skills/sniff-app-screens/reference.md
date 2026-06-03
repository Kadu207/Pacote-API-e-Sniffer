# Padrões — telas / UI

## React / SPA

- `<Route path="...">`
- `path: '/rota'` em objetos de rota
- `<Link href="...">` (Next.js / similar)

## Busca no código

- Pastas típicas: `src/pages`, `src/routes`, `app/`, `apps/web`
- Ignorar: `node_modules`, `dist`, `.next`

## Agente browser (enriquecimento)

Quando o app estiver rodando localmente ou em URL de staging:

1. Listar rotas do `ui-inventory.json`
2. Abrir cada rota relevante
3. Registrar: título da página, campos, botões, chamadas de API visíveis na rede (referência ao inventário de APIs)
4. Salvar em `docs/TELAS-DETALHADAS.md` no projeto alvo

## Limitações

- Scan estático não vê permissões por perfil nem estados vazios/erro
- Iframes e apps nativos embutidos exigem inspeção manual

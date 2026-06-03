# Contribuindo

Manter o pacote alinhado a stacks modernas e ao Cursor (Skills, Agent).

1. Atualize `scripts/scan-apis.py` e incremente `__version__` + `CHANGELOG.md`
2. Ajuste `.cursor/skills/sniff-system-apis/SKILL.md` e `reference.md`
3. Atualize `README.md`, `GUIA-AGENTES.md` e `templates/` se a saída mudar
4. Teste:
   ```powershell
   py -3 scripts/scan-apis.py --root "C:\caminho\projeto-com-express" --out docs\example-run
   ```
   Projeto com `app.use` + `*Router`: conferir `path_full` no JSON e coluna **Caminho completo** no MD.
5. `.\VALIDAR.cmd` (CI local: `py_compile` + smoke no pacote)
6. Commit e push: ver [COMANDOS-PUSH.txt](COMANDOS-PUSH.txt)

## CI

Workflow `.github/workflows/ci.yml` na branch `main`: compila o scanner e roda smoke scan no próprio pacote.

## Releases

Tags: `v1.0.0` … `v1.3.1` (ver [CHANGELOG.md](CHANGELOG.md)) — https://github.com/Kadu207/Pacote-API-e-Sniffer/releases

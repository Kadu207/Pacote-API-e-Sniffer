@echo off
echo Instalando Bun (runtime do API Harvester)...
winget install --id Oven-sh.Bun -e --source winget --accept-package-agreements --accept-source-agreements
echo.
echo IMPORTANTE:
echo 1. Feche este terminal e abra um NOVO PowerShell
echo 2. Teste: bun --version
echo 3. Na pasta harvester: bun install ^&^& bun run dev
pause

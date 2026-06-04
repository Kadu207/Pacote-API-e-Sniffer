@echo off
REM Deploy com API Token — edite .env.cloudflare (NAO edite este .cmd)
setlocal
cd /d "%~dp0"

call "%~dp0scripts\_bun-init.cmd"
if errorlevel 1 exit /b 1

if not exist ".env.cloudflare" (
  echo Copie: copy .env.cloudflare.example .env.cloudflare
  echo Edite CLOUDFLARE_API_TOKEN=seu_token
  exit /b 1
)

set "BUN_INSTALL_BIN=%BUN%"
"%BUN%" "%~dp0scripts\deploy-with-token.mjs"
pause

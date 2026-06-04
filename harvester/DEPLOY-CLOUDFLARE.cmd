@echo off
setlocal
cd /d "%~dp0"

call "%~dp0scripts\_bun-init.cmd"
if errorlevel 1 exit /b 1

echo === Limpa cache Vite/Nitro (junction em TEMP) ===
"%BUN%" "%~dp0scripts\prebuild-clean.mjs"
if errorlevel 1 exit /b 1

echo === Build (nitro / Cloudflare) ===
"%BUN%" install
"%BUN%" run build
if errorlevel 1 (
  echo.
  echo Build falhou. Rode LIMPAR-VITE.cmd e tente de novo.
  exit /b 1
)

if not exist "dist\server\wrangler.json" (
  echo ERRO: dist\server\wrangler.json ausente.
  exit /b 1
)

copy /y "%~dp0scripts\DEPLOY-DIST-SERVER.cmd" "%~dp0dist\server\DEPLOY.cmd" >nul

call "%~dp0scripts\wrangler-deploy.cmd"
set "ERR=%ERRORLEVEL%"
if %ERR% neq 0 exit /b %ERR%

echo.
echo OK: https://scouttapi.inovatitech.com.br
echo Secrets: LOVABLE_API_KEY, FIRECRAWL_API_KEY
pause

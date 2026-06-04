@echo off
setlocal
cd /d "%~dp0.."
set "HARVESTER=%CD%\"
set "SERVER=%HARVESTER%dist\server"

call "%~dp0_bun-init.cmd"
if errorlevel 1 exit /b 1

copy /y "%HARVESTER%scripts\DEPLOY-DIST-SERVER.cmd" "%SERVER%\DEPLOY.cmd" >nul 2>&1

if not exist "%SERVER%\wrangler.json" (
  echo ERRO: %SERVER%\wrangler.json ausente. Rode DEPLOY-CLOUDFLARE.cmd ou: bun run build
  exit /b 1
)

if exist "%HARVESTER%.wrangler" (
  echo Removendo .wrangler da raiz harvester
  rmdir /s /q "%HARVESTER%.wrangler" 2>nul
)
if exist "%HARVESTER%wrangler.jsonc" del /f /q "%HARVESTER%wrangler.jsonc" 2>nul

cd /d "%SERVER%"
"%BUN%" "%HARVESTER%scripts\patch-wrangler.mjs"
if errorlevel 1 exit /b 1

echo === Wrangler deploy ===
"%BUN%" x wrangler deploy --route "scouttapi.inovatitech.com.br/*"
exit /b %ERRORLEVEL%

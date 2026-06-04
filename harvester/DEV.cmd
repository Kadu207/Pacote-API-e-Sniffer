@echo off
REM Sobe o API Harvester (Bun)
setlocal EnableDelayedExpansion
cd /d "%~dp0"

if not exist ".env" (
  if exist ".env.example" copy /Y ".env.example" ".env" >nul
  echo Edite .env: LOVABLE_API_KEY e FIRECRAWL_API_KEY — ver ..\docs\CHAVES-API.md
)

REM Cache Vite em %%TEMP%% (vite.config.ts) — limpeza opcional legado OneDrive
if exist "node_modules\.vite-temp" rmdir /s /q "node_modules\.vite-temp" 2>nul
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite" 2>nul
if exist "%TEMP%\scouttapi-harvester-vite" rmdir /s /q "%TEMP%\scouttapi-harvester-vite" 2>nul

set "BUN="
where bun >nul 2>&1 && set "BUN=bun" && goto :run
if exist "%USERPROFILE%\.bun\bin\bun.exe" set "BUN=%USERPROFILE%\.bun\bin\bun.exe" && goto :run
set "WINGET_BUN=%LOCALAPPDATA%\Microsoft\WinGet\Packages\Oven-sh.Bun_Microsoft.Winget.Source_8wekyb3d8bbwe\bun-windows-x64\bun.exe"
if exist "%WINGET_BUN%" set "BUN=%WINGET_BUN%" && goto :run

echo Bun nao encontrado. Rode: INSTALAR-BUN.cmd
exit /b 1

:run
echo Usando: %BUN%
"%BUN%" install
if errorlevel 1 exit /b 1
"%BUN%" run dev
exit /b %ERRORLEVEL%

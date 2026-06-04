@echo off
cd /d "%~dp0"
echo Encerrando processos Node/Bun (vite)...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM bun.exe 2>nul
timeout /t 2 /nobreak >nul

set "BUN=%LOCALAPPDATA%\Microsoft\WinGet\Packages\Oven-sh.Bun_Microsoft.Winget.Source_8wekyb3d8bbwe\bun-windows-x64\bun.exe"
if not exist "%BUN%" where bun >nul 2>&1 && set "BUN=bun"

if exist "node_modules\.vite-temp" (
  attrib -R "node_modules\.vite-temp\*" /S /D 2>nul
  rmdir /s /q "node_modules\.vite-temp" 2>nul
)
if exist "node_modules\.nitro" (
  attrib -R "node_modules\.nitro\*" /S /D 2>nul
  rmdir /s /q "node_modules\.nitro" 2>nul
)
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite" 2>nul
if exist "%TEMP%\scouttapi-harvester-vite-temp" rmdir /s /q "%TEMP%\scouttapi-harvester-vite-temp" 2>nul
if exist "%TEMP%\scouttapi-harvester-nitro" rmdir /s /q "%TEMP%\scouttapi-harvester-nitro" 2>nul

if exist "%BUN%" "%BUN%" "%~dp0scripts\prebuild-clean.mjs"

echo Limpo. Rode DEV.cmd ou DEPLOY-CLOUDFLARE.cmd
pause

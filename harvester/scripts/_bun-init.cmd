@echo off
REM Define %BUN% (WinGet ou PATH). Chamar com: call "%~dp0_bun-init.cmd"
set "BUN=%LOCALAPPDATA%\Microsoft\WinGet\Packages\Oven-sh.Bun_Microsoft.Winget.Source_8wekyb3d8bbwe\bun-windows-x64\bun.exe"
if not exist "%BUN%" where bun >nul 2>&1 && set "BUN=bun"
if not exist "%BUN%" (
  echo Bun nao encontrado. Instale: winget install Oven-sh.Bun
  exit /b 1
)

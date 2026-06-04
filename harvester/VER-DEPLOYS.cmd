@echo off
setlocal
cd /d "%~dp0"

call "%~dp0scripts\_bun-init.cmd"
if errorlevel 1 exit /b 1

set "WRANGLER_LOG="
set "BUN_INSTALL_BIN=%BUN%"
"%BUN%" "%~dp0scripts\list-deploys.mjs"
if errorlevel 1 exit /b 1
pause

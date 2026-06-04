@echo off
REM Deploy sem rebuild (requer dist\server de um build anterior)
cd /d "%~dp0"
call "%~dp0scripts\wrangler-deploy.cmd"
set "ERR=%ERRORLEVEL%"
if %ERR% neq 0 exit /b %ERR%
echo.
echo OK: https://scouttapi.inovatitech.com.br
pause

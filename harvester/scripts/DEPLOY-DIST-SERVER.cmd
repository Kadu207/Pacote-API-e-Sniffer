@echo off
REM Conteudo copiado para dist\server\DEPLOY.cmd (nao executar da pasta scripts)
call "%~dp0..\..\scripts\wrangler-deploy.cmd"
exit /b %ERRORLEVEL%

@echo off
setlocal
cd /d "%~dp0dist\server"

call "%~dp0scripts\_bun-init.cmd"
if errorlevel 1 exit /b 1

echo.
echo 1) O navegador vai abrir — autorize em ate 2 minutos.
echo 2) Nao feche este terminal ate ver "Successfully logged in".
echo 3) Se der timeout, leia WRANGLER-LOGIN-LEIA-ME.txt
echo.

"%BUN%" x wrangler login
if errorlevel 1 (
  echo.
  echo Login falhou. Tente API Token: WRANGLER-LOGIN-LEIA-ME.txt
  pause
  exit /b 1
)

echo.
echo OK. Teste: cd .. && VER-DEPLOYS.cmd
pause

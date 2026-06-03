@echo off
REM Uso: ESCANEAR.cmd "C:\caminho\real\do\seu-projeto"  (nao use o texto literal de exemplo)
setlocal
cd /d "%~dp0"

if "%~1"=="" (
  echo Uso: ESCANEAR.cmd "C:\caminho\do\projeto"
  exit /b 1
)

set "ROOT=%~1"
if not exist "%ROOT%\." (
  echo Raiz invalida ou pasta inexistente: %ROOT%
  echo Use o caminho absoluto do projeto, ex.: C:\Users\carlo\Projects\meu-app
  exit /b 1
)
set "OUT=%ROOT%\docs"
set "API=%~dp0scripts\scan-apis.py"
set "UI=%~dp0scripts\scan-screens.py"

if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" (
  set "PY=%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
  goto :run
)
if exist "%LOCALAPPDATA%\Programs\Python\Python313\python.exe" (
  set "PY=%LOCALAPPDATA%\Programs\Python\Python313\python.exe"
  goto :run
)
where py >nul 2>&1 && (
  echo === APIs ===
  py -3 "%API%" --root "%ROOT%" --out "%OUT%" || exit /b 1
  echo.
  echo === Telas / UI ===
  py -3 "%UI%" --root "%ROOT%" --out "%OUT%"
  goto :check
)
where python >nul 2>&1 && (
  echo === APIs ===
  python "%API%" --root "%ROOT%" --out "%OUT%" || exit /b 1
  echo.
  echo === Telas / UI ===
  python "%UI%" --root "%ROOT%" --out "%OUT%"
  goto :check
)
echo Python nao encontrado. Rode: INSTALAR-PYTHON.cmd
exit /b 1

:run
echo === APIs ===
"%PY%" "%API%" --root "%ROOT%" --out "%OUT%"
if errorlevel 1 exit /b 1
echo.
echo === Telas / UI ===
"%PY%" "%UI%" --root "%ROOT%" --out "%OUT%"
goto :check

:check
if errorlevel 1 exit /b 1
echo.
echo Documentacao em: %OUT%
echo APIs:  %OUT%\api-catalog\index.html
echo Telas: %OUT%\ui-catalog\index.html
pause

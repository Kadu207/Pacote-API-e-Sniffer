@echo off
REM Uso: ESCANEAR.cmd "C:\caminho\do\projeto"
setlocal
cd /d "%~dp0"

if "%~1"=="" (
  echo Uso: ESCANEAR.cmd "C:\caminho\do\projeto"
  exit /b 1
)

set "ROOT=%~1"
set "OUT=%ROOT%\docs"
set "SCRIPT=%~dp0scripts\scan-apis.py"

if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" (
  "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" "%SCRIPT%" --root "%ROOT%" --out "%OUT%"
  goto :check
)
if exist "%LOCALAPPDATA%\Programs\Python\Python313\python.exe" (
  "%LOCALAPPDATA%\Programs\Python\Python313\python.exe" "%SCRIPT%" --root "%ROOT%" --out "%OUT%"
  goto :check
)
where py >nul 2>&1 && py -3 "%SCRIPT%" --root "%ROOT%" --out "%OUT%" && goto :check
where python >nul 2>&1 && python "%SCRIPT%" --root "%ROOT%" --out "%OUT%" && goto :check

echo Python nao encontrado. Rode: INSTALAR-PYTHON.cmd
exit /b 1

:check
if errorlevel 1 exit /b 1
echo.
echo Documentacao em: %OUT%
pause

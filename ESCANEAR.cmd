@echo off
REM Uso: ESCANEAR.cmd "C:\caminho\do\projeto"
REM Saida: <projeto>\docs\
setlocal
cd /d "%~dp0"

if "%~1"=="" (
  echo Uso: ESCANEAR.cmd "C:\caminho\do\projeto"
  exit /b 1
)

set "ROOT=%~1"
set "OUT=%ROOT%\docs"

where py >nul 2>&1 && py -3 "%~dp0scripts\scan-apis.py" --root "%ROOT%" --out "%OUT%" && goto :done
where python >nul 2>&1 && python "%~dp0scripts\scan-apis.py" --root "%ROOT%" --out "%OUT%" && goto :done

if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" (
  "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" "%~dp0scripts\scan-apis.py" --root "%ROOT%" --out "%OUT%"
  goto :done
)
if exist "%LOCALAPPDATA%\Programs\Python\Python313\python.exe" (
  "%LOCALAPPDATA%\Programs\Python\Python313\python.exe" "%~dp0scripts\scan-apis.py" --root "%ROOT%" --out "%OUT%"
  goto :done
)

echo Python nao encontrado.
echo Instale: winget install Python.Python.3.12
echo Depois feche e abra o terminal.
exit /b 1

:done
echo.
echo Documentacao em: %OUT%
pause

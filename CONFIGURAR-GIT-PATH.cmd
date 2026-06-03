@echo off
REM Git no PATH permanente — CUIDADO: setx pode TRUNCAR PATH longo no Windows.
REM Preferencia: Configuracoes > Sistema > Variaveis de ambiente > Path > adicionar:
REM   %ProgramFiles%\Git\cmd
REM   %ProgramFiles%\Git\bin
REM Ou na sessao atual:  . scripts\git-env.ps1
echo.
echo AVISO: setx PATH com %%PATH%% inteiro pode corromper o PATH do usuario.
echo Recomendado: adicionar Git manualmente nas Variaveis de Ambiente do Windows.
echo.
set /p OK="Continuar com setx mesmo assim? (S/N): "
if /i not "%OK%"=="S" (
  echo Cancelado. Use:  powershell -File scripts\git-env.ps1
  pause
  exit /b 0
)
set "GITCMD=%ProgramFiles%\Git\cmd"
set "GITBIN=%ProgramFiles%\Git\bin"
setx PATH "%PATH%;%GITCMD%;%GITBIN%"
echo.
echo PATH atualizado. Feche TODOS os terminais e abra um novo.
echo Teste: git --version
pause

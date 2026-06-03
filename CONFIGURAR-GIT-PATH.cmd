@echo off
REM Adiciona Git ao PATH do usuario (permanente). Execute uma vez.
set "GITCMD=%ProgramFiles%\Git\cmd"
set "GITBIN=%ProgramFiles%\Git\bin"
setx PATH "%PATH%;%GITCMD%;%GITBIN%"
echo.
echo PATH atualizado. Feche TODOS os terminais e abra um novo.
echo Teste: git --version
pause

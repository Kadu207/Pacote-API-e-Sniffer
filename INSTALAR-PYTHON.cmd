@echo off
echo Instalando Python 3.12...
winget install --id Python.Python.3.12 -e --source winget --accept-package-agreements --accept-source-agreements
echo.
echo IMPORTANTE:
echo 1. Feche este terminal e abra um NOVO PowerShell
echo 2. Marque "Add python.exe to PATH" se o instalador perguntar
echo 3. Teste: py -3 --version   ou   python --version
echo 4. Escaneie: ESCANEAR.cmd "C:\Users\carlo\Projects\dental-lab-system"
pause

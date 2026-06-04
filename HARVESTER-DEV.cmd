@echo off
REM Sobe o API Harvester (pasta harvester/)
cd /d "%~dp0harvester"
if "%1"=="limpar" call "%~dp0harvester\LIMPAR-VITE.cmd"
call "%~dp0harvester\DEV.cmd"

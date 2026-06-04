@echo off
cd /d "%~dp0"
if not exist ".env" (
  if exist ".env.example" copy /Y ".env.example" ".env" >nul
  echo Edite .env antes de subir o container.
)
docker compose up --build

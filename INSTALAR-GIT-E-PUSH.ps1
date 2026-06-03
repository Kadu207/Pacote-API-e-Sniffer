# Passo 1: instalar Git e GitHub CLI (winget)
# Execute como usuario normal; aceite prompts do instalador.

Write-Host "Instalando Git..." -ForegroundColor Cyan
winget install --id Git.Git -e --source winget --accept-package-agreements --accept-source-agreements

Write-Host ""
Write-Host "Instalando GitHub CLI..." -ForegroundColor Cyan
winget install --id GitHub.cli -e --source winget --accept-package-agreements --accept-source-agreements

Write-Host ""
Write-Host "IMPORTANTE: Feche este PowerShell e abra um NOVO." -ForegroundColor Yellow
Write-Host "Depois rode:" -ForegroundColor Green
Write-Host '  cd "$env:USERPROFILE\OneDrive\Área de Trabalho\Projetos DEV\Pacote API e Sniffer"'
Write-Host "  .\PUSH-GITHUB.ps1"
Write-Host ""
Write-Host "Ou use o atalho sem acento:" -ForegroundColor Green
$desk = [Environment]::GetFolderPath("Desktop")
$atalho = Join-Path $desk "Projetos DEV\Pacote API e Sniffer"
Write-Host "  Set-Location -LiteralPath '$atalho'"
Write-Host "  .\PUSH-GITHUB.ps1"

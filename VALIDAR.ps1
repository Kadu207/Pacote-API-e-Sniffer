# Valida commit local e sincronizacao com GitHub
$ErrorActionPreference = "Continue"
Set-Location -LiteralPath $PSScriptRoot

$git = "${env:ProgramFiles}\Git\bin\git.exe"
if (-not (Test-Path -LiteralPath $git)) { $git = "${env:ProgramFiles}\Git\cmd\git.exe" }

Write-Host "=== VALIDACAO LOCAL ===" -ForegroundColor Cyan
if (-not (Test-Path -LiteralPath $git)) {
    Write-Host "Git nao encontrado." -ForegroundColor Red
    exit 1
}

& $git status -sb
& $git log -1 --format="Commit: %h | %s | %ci"
& $git remote -v
& $git branch -vv

$ahead = & $git rev-list --count origin/main..main 2>$null
$behind = & $git rev-list --count main..origin/main 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Commits a enviar (ahead): $ahead" -ForegroundColor $(if ($ahead -gt 0) { "Yellow" } else { "Green" })
    Write-Host "Commits a puxar (behind): $behind"
    if ($ahead -eq 0 -and $behind -eq 0) {
        Write-Host "Local e GitHub sincronizados." -ForegroundColor Green
    } elseif ($ahead -gt 0) {
        Write-Host "Rode: & '$git' push" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== SCANNER (smoke) ===" -ForegroundColor Cyan
$py = Get-Command python -ErrorAction SilentlyContinue
if ($py) {
    & python "$PSScriptRoot\scripts\scan-apis.py" --root $PSScriptRoot --out "$env:TEMP\sniffer-smoke"
    if ($LASTEXITCODE -eq 0) { Write-Host "Scanner OK." -ForegroundColor Green }
} else {
    Write-Host "Python nao no PATH (opcional)." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Repositorio: https://github.com/Kadu207/Pacote-API-e-Sniffer" -ForegroundColor Cyan

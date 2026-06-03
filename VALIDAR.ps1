# Valida commit local e sincronizacao com GitHub
$ErrorActionPreference = "Continue"
Set-Location -LiteralPath $PSScriptRoot

$git = "${env:ProgramFiles}\Git\bin\git.exe"
if (-not (Test-Path -LiteralPath $git)) { $git = "${env:ProgramFiles}\Git\cmd\git.exe" }

function Find-PythonExe {
    if (Get-Command py -ErrorAction SilentlyContinue) { return @{ Exe = "py"; Args = @("-3") } }
    foreach ($name in @("python", "python3")) {
        $cmd = Get-Command $name -ErrorAction SilentlyContinue
        if ($cmd -and $cmd.Source -notlike "*WindowsApps*") { return @{ Exe = $cmd.Source; Args = @() } }
    }
    $roots = @(
        "$env:LOCALAPPDATA\Programs\Python",
        "$env:ProgramFiles\Python312",
        "$env:ProgramFiles\Python311"
    )
    foreach ($root in $roots) {
        if (-not (Test-Path -LiteralPath $root)) { continue }
        $exe = Get-ChildItem -LiteralPath $root -Filter python.exe -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($exe) { return @{ Exe = $exe.FullName; Args = @() } }
    }
    return $null
}

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
$py = Find-PythonExe
if ($py) {
    $scan = Join-Path $PSScriptRoot "scripts\scan-apis.py"
    & $py.Exe @($py.Args + $scan, "--root", $PSScriptRoot, "--out", "$env:TEMP\sniffer-smoke")
    if ($LASTEXITCODE -eq 0) { Write-Host "Scanner OK." -ForegroundColor Green }
} else {
    Write-Host "Python nao encontrado (opcional). Instale: winget install Python.Python.3.12" -ForegroundColor Yellow
    Write-Host "Ou desative o alias da Microsoft Store em Configuracoes > Aplicativos > Aliases de execucao." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Repositorio: https://github.com/Kadu207/Pacote-API-e-Sniffer" -ForegroundColor Cyan
Write-Host "Dica CMD no PowerShell: use .\VALIDAR.cmd (com ponto-barra)" -ForegroundColor DarkGray

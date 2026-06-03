# Publicar no GitHub - usa caminho completo do Git (PATH nao obrigatorio)
param(
    [string]$RepoName = "Pacote-API-e-Sniffer",
    [string]$GitHubUser = "Kadu207",
    [ValidateSet("public", "private")]
    [string]$Visibility = "public"
)

$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot

$gitExe = "${env:ProgramFiles}\Git\bin\git.exe"
if (-not (Test-Path -LiteralPath $gitExe)) {
    $gitExe = "${env:ProgramFiles}\Git\cmd\git.exe"
}
if (-not (Test-Path -LiteralPath $gitExe)) {
    Write-Host "Git nao encontrado em Program Files. Instale: winget install Git.Git" -ForegroundColor Red
    exit 1
}

$ghExe = "${env:ProgramFiles}\GitHub CLI\gh.exe"
if (-not (Test-Path -LiteralPath $ghExe)) {
    $ghExe = "${env:LocalAppData}\Programs\GitHub CLI\gh.exe"
}

function Run-Git {
    param([string[]]$GitArgs)
    & $gitExe @GitArgs
    if ($LASTEXITCODE -ne 0) {
        throw "git falhou: git $($GitArgs -join ' ')"
    }
}

Write-Host "Pasta:" (Get-Location)
Write-Host "Git:" $gitExe

if (-not (Test-Path -LiteralPath ".git")) {
    Run-Git @("init")
    Write-Host "Git inicializado." -ForegroundColor Green
}

Run-Git @("add", "-A")
& $gitExe status --short

$porcelain = & $gitExe status --porcelain
if ($porcelain) {
    Run-Git @("commit", "-m", "Initial commit: Pacote API e Sniffer (skill Cursor + scanner APIs)")
    Write-Host "Commit OK." -ForegroundColor Green
} else {
    Write-Host "Sem alteracoes para commit." -ForegroundColor Yellow
}

Run-Git @("branch", "-M", "main")

$originUrl = "https://github.com/$GitHubUser/$RepoName.git"
& $gitExe remote get-url origin 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
    Run-Git @("remote", "add", "origin", $originUrl)
    Write-Host "Remote: $originUrl" -ForegroundColor Cyan
} else {
    Run-Git @("remote", "set-url", "origin", $originUrl)
}

if (Test-Path -LiteralPath $ghExe) {
    & $ghExe auth status 2>$null
    if ($LASTEXITCODE -eq 0) {
        if (-not (Test-Path -LiteralPath ".git\refs\remotes\origin\main")) {
            if ($Visibility -eq "private") {
                & $ghExe repo create $RepoName --private --source=. --remote=origin --push
            } else {
                & $ghExe repo create $RepoName --public --source=. --remote=origin --push
            }
        } else {
            Run-Git @("push", "-u", "origin", "main")
        }
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Push OK: https://github.com/$GitHubUser/$RepoName" -ForegroundColor Green
            exit 0
        }
    }
}

Write-Host ""
Write-Host "Fazendo push com git..." -ForegroundColor Cyan
Run-Git @("push", "-u", "origin", "main")
Write-Host "OK: https://github.com/$GitHubUser/$RepoName" -ForegroundColor Green

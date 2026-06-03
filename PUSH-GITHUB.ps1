# Publicar alteracoes no GitHub (Git via caminho completo; gh opcional)
param(
    [string]$RepoName = "Pacote-API-e-Sniffer",
    [string]$GitHubUser = "Kadu207",
    [string]$CommitMessage = "",
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
    Write-Host "Git nao encontrado. winget install Git.Git" -ForegroundColor Red
    exit 1
}

$ghExe = "${env:ProgramFiles}\GitHub CLI\gh.exe"
if (-not (Test-Path -LiteralPath $ghExe)) {
    $ghExe = "${env:LocalAppData}\Programs\GitHub CLI\gh.exe"
}

function Run-Git([string[]]$GitArgs) {
    & $gitExe @GitArgs
    if ($LASTEXITCODE -ne 0) {
        throw "git falhou: git $($GitArgs -join ' ')"
    }
}

Write-Host "Pasta:" (Get-Location)
Write-Host "Git:" $gitExe

if (-not (Test-Path -LiteralPath ".git")) {
    Run-Git @("init")
}

Run-Git @("add", "-A")
& $gitExe status --short

$porcelain = & $gitExe status --porcelain
if ($porcelain) {
    if (-not $CommitMessage) {
        $CommitMessage = "chore: atualiza Pacote API e Sniffer ($(Get-Date -Format 'yyyy-MM-dd HH:mm'))"
    }
    Run-Git @("commit", "-m", $CommitMessage)
    Write-Host "Commit OK." -ForegroundColor Green
} else {
    Write-Host "Sem alteracoes para commit." -ForegroundColor Yellow
}

Run-Git @("branch", "-M", "main")

$originUrl = "https://github.com/$GitHubUser/$RepoName.git"
& $gitExe remote get-url origin 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
    Run-Git @("remote", "add", "origin", $originUrl)
} else {
    Run-Git @("remote", "set-url", "origin", $originUrl)
}

$pushed = $false
if (Test-Path -LiteralPath $ghExe) {
    $null = & $ghExe auth status 2>&1
    if ($LASTEXITCODE -eq 0) {
        & $ghExe repo view "$GitHubUser/$RepoName" 2>$null | Out-Null
        if ($LASTEXITCODE -ne 0) {
            if ($Visibility -eq "private") {
                & $ghExe repo create $RepoName --private --source=. --remote=origin
            } else {
                & $ghExe repo create $RepoName --public --source=. --remote=origin
            }
        }
        Run-Git @("push", "-u", "origin", "main")
        if ($LASTEXITCODE -eq 0) { $pushed = $true }
    }
}

if (-not $pushed) {
    Write-Host "Push via git..." -ForegroundColor Cyan
    Run-Git @("push", "origin", "main")
}

Write-Host "OK: https://github.com/$GitHubUser/$RepoName" -ForegroundColor Green

# Carrega Git no PATH da sessao atual (use: . .\scripts\git-env.ps1)
$gitCmd = "${env:ProgramFiles}\Git\cmd"
$gitBin = "${env:ProgramFiles}\Git\bin"
if (Test-Path -LiteralPath $gitCmd) {
    if ($env:Path -notlike "*$gitCmd*") {
        $env:Path = "$gitCmd;$gitBin;" + $env:Path
    }
    Write-Host "Git no PATH desta sessao." -ForegroundColor Green
    git --version
} else {
    Write-Host "Git nao instalado em Program Files." -ForegroundColor Red
}

# Carrega Git no PATH da sessao (use: . .\scripts\git-env.ps1)
$gitCmd = "${env:ProgramFiles}\Git\cmd"
$gitBin = "${env:ProgramFiles}\Git\bin"
if (Test-Path -LiteralPath $gitCmd) {
    if ($env:Path -notlike "*$gitCmd*") {
        $env:Path = "$gitCmd;$gitBin;" + $env:Path
    }
    Write-Host "Git no PATH desta sessao." -ForegroundColor Green
    git --version
    Write-Host "Para o gh usar o Git: feche o terminal, abra novo, ou rode:" -ForegroundColor DarkGray
    Write-Host "  gh auth setup-git" -ForegroundColor DarkGray
} else {
    Write-Host "Git nao instalado em Program Files." -ForegroundColor Red
}

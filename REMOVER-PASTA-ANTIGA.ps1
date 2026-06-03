# Execute UMA VEZ após confirmar que a pasta nova está completa.
# Remove a cópia antiga em Projects\system-api-sniffer

$antiga = "C:\Users\carlo\Projects\system-api-sniffer"
$nova = $PSScriptRoot

if (-not (Test-Path -LiteralPath (Join-Path $nova "README.md"))) {
    Write-Error "Pasta nova incompleta. Não removi a antiga."
    exit 1
}

if (Test-Path -LiteralPath $antiga) {
    Remove-Item -LiteralPath $antiga -Recurse -Force
    Write-Host "Removido: $antiga"
} else {
    Write-Host "Pasta antiga já não existe."
}

Write-Host "Projeto ativo: $nova"

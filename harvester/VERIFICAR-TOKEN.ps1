# Testa token em .env.cloudflare (PowerShell — nao use curl com \)
$envFile = Join-Path $PSScriptRoot ".env.cloudflare"
if (-not (Test-Path $envFile)) {
  Write-Host "Crie .env.cloudflare a partir de .env.cloudflare.example"
  exit 1
}
$token = $null
Get-Content $envFile | ForEach-Object {
  if ($_ -match '^\s*CLOUDFLARE_API_TOKEN=(.+)$') { $token = $matches[1].Trim() }
}
if (-not $token) {
  Write-Host "CLOUDFLARE_API_TOKEN vazio em .env.cloudflare"
  exit 1
}
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/user/tokens/verify" -Headers $headers

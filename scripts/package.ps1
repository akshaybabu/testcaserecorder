$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$build = Join-Path $root 'build'
$dist = Join-Path $build 'dist'
$archive = Join-Path $build 'AS-Web-Recorder.zip'

if (-not (Test-Path $dist)) {
  throw "Missing dist folder. Run 'npm run build' first."
}

if (-not (Test-Path $build)) {
  New-Item -ItemType Directory -Path $build | Out-Null
}

if (Test-Path $archive) {
  Remove-Item -LiteralPath $archive -Force
}

Compress-Archive -Path (Join-Path $dist '*') -DestinationPath $archive -Force

Write-Host "Packaged extension archive created at $archive"

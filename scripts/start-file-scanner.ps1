param(
  [string]$ScannerRoot = (Join-Path $env:LOCALAPPDATA 'Orbit\clamav'),
  [string]$Version = '1.4.6'
)

$ErrorActionPreference = 'Stop'
$scannerBin = Join-Path $ScannerRoot "runtime\clamav-$Version.win.x64"
$clamd = Join-Path $scannerBin 'clamd.exe'
$freshclam = Join-Path $scannerBin 'freshclam.exe'
$clamdscan = Join-Path $scannerBin 'clamdscan.exe'
if (!(Test-Path -LiteralPath $clamd) -or !(Test-Path -LiteralPath $freshclam)) {
  throw "Install the verified official Windows ClamAV package under $scannerBin. See docs/file-scanner-local.md."
}

New-Item -ItemType Directory -Force -Path (Join-Path $ScannerRoot 'database') | Out-Null
$freshConfig = Join-Path $ScannerRoot 'freshclam.conf'
$scanConfig = Join-Path $ScannerRoot 'clamd.conf'
if (!(Test-Path -LiteralPath $freshConfig)) {
  @"
DatabaseDirectory "$ScannerRoot\database"
DatabaseMirror database.clamav.net
UpdateLogFile "$ScannerRoot\freshclam.log"
LogTime yes
Checks 12
"@ | Set-Content -LiteralPath $freshConfig -Encoding utf8
}
if (!(Test-Path -LiteralPath $scanConfig)) {
  @"
DatabaseDirectory "$ScannerRoot\database"
TCPSocket 3310
TCPAddr 127.0.0.1
Foreground yes
LogFile "$ScannerRoot\clamd.log"
LogTime yes
LogFileMaxSize 5M
LogRotate yes
MaxThreads 2
MaxQueue 16
StreamMaxLength 110M
MaxFileSize 110M
MaxScanSize 150M
AlertExceedsMax yes
"@ | Set-Content -LiteralPath $scanConfig -Encoding utf8
}

# Update signatures before accepting scans; never run with an empty database.
$runningUpdater = Get-Process freshclam -ErrorAction SilentlyContinue |
  Where-Object Path -EQ $freshclam
if (!$runningUpdater) {
  & $freshclam "--config-file=$freshConfig" --quiet
  if ($LASTEXITCODE -ne 0) { throw 'ClamAV signature update failed. See freshclam.log.' }
}

$runningScanner = Get-Process clamd -ErrorAction SilentlyContinue |
  Where-Object Path -EQ $clamd
if (!$runningScanner) {
  Start-Process -FilePath $clamd -ArgumentList "--config-file=`"$scanConfig`"" -WindowStyle Hidden | Out-Null
}
& $clamdscan "--config-file=$scanConfig" --ping=30:1 --quiet
if ($LASTEXITCODE -ne 0) { throw 'ClamAV did not become ready. See clamd.log.' }

# Keep the official signature database current while local development runs.
if (!$runningUpdater) {
  Start-Process -FilePath $freshclam -ArgumentList @('--daemon', "--config-file=`"$freshConfig`"") -WindowStyle Hidden | Out-Null
}
Write-Output 'Orbit file scanner is ready on 127.0.0.1:3310.'

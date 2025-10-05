# Flutter Installation Script for Windows
# This script downloads and sets up Flutter SDK

Write-Host "Flutter SDK Installation Script" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Define installation directory
$FlutterDir = "C:\src\flutter"
$FlutterZip = "$env:TEMP\flutter_windows.zip"

# Create source directory if it doesn't exist
if (!(Test-Path "C:\src")) {
    Write-Host "Creating C:\src directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "C:\src" -Force
}

# Download Flutter SDK
Write-Host "Downloading Flutter SDK..." -ForegroundColor Yellow
$FlutterUrl = "https://storage.googleapis.com/flutter_infra_release/releases/stable/windows/flutter_windows_3.19.6-stable.zip"

try {
    Invoke-WebRequest -Uri $FlutterUrl -OutFile $FlutterZip
    Write-Host "Download completed!" -ForegroundColor Green
} catch {
    Write-Host "Download failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Extract Flutter SDK
Write-Host "Extracting Flutter SDK to $FlutterDir..." -ForegroundColor Yellow
try {
    Expand-Archive -Path $FlutterZip -DestinationPath "C:\src" -Force
    Write-Host "Extraction completed!" -ForegroundColor Green
} catch {
    Write-Host "Extraction failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Clean up zip file
Remove-Item $FlutterZip -Force

# Add to PATH (for current session)
$env:PATH = "$FlutterDir\bin;$env:PATH"

Write-Host "`nFlutter SDK installed successfully!" -ForegroundColor Green
Write-Host "Location: $FlutterDir" -ForegroundColor Cyan

Write-Host "`nTo permanently add Flutter to PATH:" -ForegroundColor Yellow
Write-Host "1. Open System Environment Variables" -ForegroundColor White
Write-Host "2. Add '$FlutterDir\bin' to your PATH" -ForegroundColor White
Write-Host "3. Restart your terminal" -ForegroundColor White

Write-Host "`nRunning Flutter Doctor..." -ForegroundColor Yellow
& "$FlutterDir\bin\flutter.bat" doctor

Write-Host "`nNext steps:" -ForegroundColor Green
Write-Host "1. Add Flutter to your system PATH permanently" -ForegroundColor White
Write-Host "2. Restart your terminal" -ForegroundColor White
Write-Host "3. Run: flutter doctor" -ForegroundColor White
Write-Host "4. Run: flutter doctor --android-licenses (if you plan to develop for Android)" -ForegroundColor White
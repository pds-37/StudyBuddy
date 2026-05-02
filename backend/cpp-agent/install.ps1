$ErrorActionPreference = "Stop"

$AppName = "StudyBuddy Agent"
$BinaryName = "studybuddy.exe"
$BuildDir = Join-Path -Path $PSScriptRoot -ChildPath "build"
$BinaryPath = Join-Path -Path $BuildDir -ChildPath $BinaryName

Write-Host "Installing $AppName..." -ForegroundColor Cyan

if (-not (Test-Path $BinaryPath)) {
    Write-Host "Error: Could not find $BinaryName in build directory." -ForegroundColor Red
    Write-Host "Please build the project first using CMake." -ForegroundColor Yellow
    exit 1
}

$InstallDir = Join-Path -Path $env:USERPROFILE -ChildPath ".studybuddy\bin"

if (-not (Test-Path $InstallDir)) {
    Write-Host "Creating installation directory at $InstallDir"
    New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
}

$TargetBinary = Join-Path -Path $InstallDir -ChildPath $BinaryName

Write-Host "Copying binary to $InstallDir..."
Copy-Item -Path $BinaryPath -Destination $TargetBinary -Force

Write-Host "Updating User PATH environment variable..."
$UserPath = [Environment]::GetEnvironmentVariable("PATH", "User")
$Paths = $UserPath -split ";"

if ($Paths -notcontains $InstallDir) {
    $NewPath = $UserPath + ";" + $InstallDir
    [Environment]::SetEnvironmentVariable("PATH", $NewPath, "User")
    Write-Host "Added $InstallDir to User PATH." -ForegroundColor Green
} else {
    Write-Host "$InstallDir is already in User PATH." -ForegroundColor Yellow
}

Write-Host "`nInstallation successful! 🎉" -ForegroundColor Green
Write-Host "Please restart your terminal or run the following to apply PATH changes:" -ForegroundColor Cyan
Write-Host "  $env:Path = [System.Environment]::GetEnvironmentVariable(`"Path`", `"Machine`") + `";`" + [System.Environment]::GetEnvironmentVariable(`"Path`", `"User`")"
Write-Host "`nTest the installation by running:" -ForegroundColor Cyan
Write-Host "  studybuddy help"

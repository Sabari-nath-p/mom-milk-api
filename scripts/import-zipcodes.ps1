###############################################################################
# Zipcode Import Script - PowerShell Wrapper
# 
# This script provides a convenient wrapper for the Node.js zipcode import tool
# Usage: .\scripts\import-zipcodes.ps1 [options]
###############################################################################

# Set error action preference
$ErrorActionPreference = "Stop"

# Get script directory and project root
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

# Color functions
function Write-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

# Check if Node.js is installed
try {
    $nodeVersion = node --version 2>$null
    if (-not $nodeVersion) {
        throw "Node.js not found"
    }
} catch {
    Write-Error-Custom "Node.js is not installed. Please install Node.js first."
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version 2>$null
    if (-not $npmVersion) {
        throw "npm not found"
    }
} catch {
    Write-Error-Custom "npm is not installed. Please install npm first."
    exit 1
}

# Change to project root
Set-Location $ProjectRoot

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Warning-Custom "Dependencies not installed. Running npm install..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Failed to install dependencies"
        exit 1
    }
}

# Display banner
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════════╗"
Write-Host "║          Zipcode Import Tool - PowerShell Wrapper                ║"
Write-Host "╚══════════════════════════════════════════════════════════════════╝"
Write-Host ""

# Parse arguments and pass them to the Node.js script
if ($args.Count -eq 0) {
    Write-Info "Running import with default settings..."
    npm run import:zipcodes
} else {
    Write-Info "Running import with custom options: $args"
    npm run import:zipcodes -- $args
}

# Capture exit code
$ExitCode = $LASTEXITCODE

Write-Host ""
if ($ExitCode -eq 0) {
    Write-Success "Import completed successfully!"
} else {
    Write-Error-Custom "Import failed with exit code: $ExitCode"
}

exit $ExitCode

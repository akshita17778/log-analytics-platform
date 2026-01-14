#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Push Enterprise Log Analytics Platform to GitHub
.DESCRIPTION
    Automatic script to initialize git, add files, commit, and push to GitHub
.EXAMPLE
    .\push-to-github.ps1
#>

param(
    [string]$Username,
    [string]$Token
)

Write-Host @"
╔════════════════════════════════════════════════════════════════════╗
║  📤 Pushing Log Analytics Platform to GitHub                      ║
╚════════════════════════════════════════════════════════════════════╝
"@

# Check if Git is installed
try {
    $gitVersion = git --version 2>&1
    Write-Host "✓ Git is installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Download from: https://git-scm.com/download/win"
    Write-Host "After installation, restart PowerShell and run this script again."
    exit 1
}

# Get GitHub username if not provided
if (-not $Username) {
    $Username = Read-Host "Enter your GitHub username"
    if ([string]::IsNullOrWhiteSpace($Username)) {
        Write-Host "❌ Username cannot be empty" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Make sure you have:" -ForegroundColor Cyan
Write-Host "1. Created a repository named: log-analytics-platform"
Write-Host "2. Generated a Personal Access Token at:"
Write-Host "   GitHub → Settings → Developer settings → Personal access tokens"
Write-Host ""
Read-Host "Press Enter to continue"

# Navigate to project directory
$projectPath = "C:\Users\vikas\Downloads\log-analytics-platform"
if (-not (Test-Path $projectPath)) {
    Write-Host "❌ Project directory not found: $projectPath" -ForegroundColor Red
    exit 1
}

Set-Location $projectPath
Write-Host "📁 Working directory: $projectPath" -ForegroundColor Cyan

Write-Host ""
Write-Host "🔧 Initializing Git..." -ForegroundColor Yellow
git init

Write-Host "📦 Adding all files..." -ForegroundColor Yellow
git add .

Write-Host "📝 Creating initial commit..." -ForegroundColor Yellow
git commit -m "Initial commit: Enterprise Log Analytics & Incident Intelligence Platform"

Write-Host "🔗 Setting up remote..." -ForegroundColor Yellow
git branch -M main
git remote add origin "https://github.com/$Username/log-analytics-platform.git"

Write-Host ""
Write-Host "📤 Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "Note: When prompted, use your GitHub username and Personal Access Token" -ForegroundColor Cyan
Write-Host ""

git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ SUCCESS! Your project is now on GitHub" -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 Repository: https://github.com/$Username/log-analytics-platform" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Visit your repository"
    Write-Host "2. Add collaborators (Settings > Collaborators)"
    Write-Host "3. Enable Issues for bug tracking"
    Write-Host "4. Share the link with your team"
    Write-Host ""
}
else {
    Write-Host ""
    Write-Host "❌ Push failed. Check the error messages above." -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "• Use Personal Access Token, not password"
    Write-Host "• Check that repository exists: https://github.com/$Username/log-analytics-platform"
    Write-Host "• Verify you have 'repo' scope in your token"
    Write-Host ""
}

Read-Host "Press Enter to exit"

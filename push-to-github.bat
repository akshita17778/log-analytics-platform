@echo off
REM Enterprise Log Analytics Platform - GitHub Push Script
REM Run this script to automatically push to GitHub

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║  Pushing Log Analytics Platform to GitHub                     ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Check if Git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git is not installed!
    echo.
    echo Download from: https://git-scm.com/download/win
    echo After installation, restart this script.
    pause
    exit /b 1
)

echo ✓ Git is installed
echo.

REM Get GitHub username
set /p USERNAME="Enter your GitHub username: "
if "!USERNAME!"=="" (
    echo ❌ Username cannot be empty
    pause
    exit /b 1
)

echo.
echo Make sure you have:
echo 1. Created a repository named: log-analytics-platform
echo 2. Generated a Personal Access Token at GitHub → Settings → Developer settings
echo.
pause

cd /d "C:\Users\vikas\Downloads\log-analytics-platform"

echo.
echo 🔧 Initializing Git...
git init

echo 📦 Adding all files...
git add .

echo 📝 Creating initial commit...
git commit -m "Initial commit: Enterprise Log Analytics & Incident Intelligence Platform"

echo 🔗 Setting up remote...
git branch -M main
git remote add origin https://github.com/!USERNAME!/log-analytics-platform.git

echo.
echo 📤 Pushing to GitHub...
echo Note: When prompted, use your GitHub username and Personal Access Token
echo.

git push -u origin main

if errorlevel 0 (
    echo.
    echo ✅ SUCCESS! Your project is now on GitHub
    echo.
    echo 📍 Repository: https://github.com/!USERNAME!/log-analytics-platform
    echo.
) else (
    echo.
    echo ❌ Push failed. Check the error messages above.
    echo.
)

pause

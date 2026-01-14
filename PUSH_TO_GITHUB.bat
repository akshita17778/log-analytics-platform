@echo off
REM Push Log Analytics Platform to GitHub (Windows Batch)
REM Usage: push-to-github.bat <your-github-username> <your-github-token>

setlocal enabledelayedexpansion

if "%~1"=="" (
    echo.
    echo Usage: push-to-github.bat ^<your-github-username^> ^<your-github-token^>
    echo.
    echo Steps to get your GitHub token:
    echo 1. Go to https://github.com/settings/tokens
    echo 2. Click 'Generate new token (classic)'
    echo 3. Select 'repo' scope
    echo 4. Copy the token
    echo.
    exit /b 1
)

set GITHUB_USER=%~1
set GITHUB_TOKEN=%~2
set REPO_NAME=log-analytics-platform

echo.
echo 🚀 Pushing %REPO_NAME% to GitHub...
echo.

cd /d "%~dp0"

REM Initialize git if not already done
if not exist .git (
    echo 📝 Initializing git repository...
    git init
    git config user.name "Your Name"
    git config user.email "your.email@example.com"
)

REM Add all files
echo 📁 Adding files...
git add .

REM Create initial commit
echo 💾 Creating commit...
git commit -m "Initial commit: Enterprise Log Analytics & Incident Intelligence Platform" 2>nul

REM Add remote and push
echo 🌐 Adding GitHub remote...
git remote remove origin 2>nul
git remote add origin "https://%GITHUB_USER%:%GITHUB_TOKEN%@github.com/%GITHUB_USER%/%REPO_NAME%.git"

REM Create main branch and push
echo 📤 Pushing to GitHub...
git branch -M main
git push -u origin main

echo.
echo ✅ Success! Your repository is now at:
echo    https://github.com/%GITHUB_USER%/%REPO_NAME%
echo.
endlocal

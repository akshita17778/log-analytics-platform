#!/bin/bash
# Push Log Analytics Platform to GitHub
# Usage: bash push-to-github.sh <your-github-username> <your-github-token>

set -e

# Check arguments
if [ $# -lt 2 ]; then
    echo "Usage: bash push-to-github.sh <github-username> <github-token>"
    echo ""
    echo "Steps to get your GitHub token:"
    echo "1. Go to https://github.com/settings/tokens"
    echo "2. Click 'Generate new token (classic)'"
    echo "3. Select 'repo' scope"
    echo "4. Copy the token"
    exit 1
fi

GITHUB_USER=$1
GITHUB_TOKEN=$2
REPO_NAME="log-analytics-platform"

echo "🚀 Pushing $REPO_NAME to GitHub..."
echo ""

cd "$(dirname "$0")"

# Initialize git if not already done
if [ ! -d .git ]; then
    echo "📝 Initializing git repository..."
    git init
    git config user.name "Your Name"
    git config user.email "your.email@example.com"
fi

# Add all files
echo "📁 Adding files..."
git add .

# Create initial commit
echo "💾 Creating commit..."
git commit -m "Initial commit: Enterprise Log Analytics & Incident Intelligence Platform" || true

# Add remote and push
echo "🌐 Adding GitHub remote..."
git remote remove origin 2>/dev/null || true
git remote add origin "https://${GITHUB_USER}:${GITHUB_TOKEN}@github.com/${GITHUB_USER}/${REPO_NAME}.git"

# Create main branch and push
echo "📤 Pushing to GitHub..."
git branch -M main
git push -u origin main

echo ""
echo "✅ Success! Your repository is now at:"
echo "   https://github.com/${GITHUB_USER}/${REPO_NAME}"
echo ""

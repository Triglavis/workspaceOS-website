#!/bin/bash

echo "🚀 Deploying WorkspaceOS Website to GitHub Pages"
echo "================================================"

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "❌ Error: index.html not found. Are you in the right directory?"
    exit 1
fi

# Check git status
echo "📋 Checking git status..."
git status

# Add all changes
echo "📦 Staging all changes..."
git add -A

# Commit changes
echo "💾 Creating commit..."
read -p "Enter commit message (or press Enter for default): " commit_msg
if [ -z "$commit_msg" ]; then
    commit_msg="Update website"
fi
git commit -m "$commit_msg"

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "🌐 GitHub Pages will deploy automatically in a few minutes."
    echo "📍 Your site will be available at:"
    echo "   https://triglavis.github.io/workspaceOS-website"
    echo ""
    echo "To check deployment status:"
    echo "1. Go to: https://github.com/Triglavis/workspaceOS-website/actions"
    echo "2. Look for the 'Deploy to GitHub Pages' workflow"
else
    echo "❌ Push failed. Please check your SSH configuration."
    echo ""
    echo "To set up SSH for GitHub:"
    echo "1. Generate SSH key: ssh-keygen -t ed25519 -C 'your_email@example.com'"
    echo "2. Start SSH agent: eval \"\$(ssh-agent -s)\""
    echo "3. Add key to agent: ssh-add ~/.ssh/id_ed25519"
    echo "4. Copy public key: cat ~/.ssh/id_ed25519.pub"
    echo "5. Add to GitHub: Settings → SSH and GPG keys → New SSH key"
fi
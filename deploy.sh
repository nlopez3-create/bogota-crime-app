#!/bin/bash

# Bogotá Crime Heatmap - Deployment Script
# This script helps you deploy your app to various platforms

echo "🚀 Bogotá Crime Heatmap - Deployment Helper"
echo "=========================================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to setup Git
setup_git() {
    echo "📝 Setting up Git..."
    
    if ! command_exists git; then
        echo "❌ Git is not installed. Please install Git first."
        exit 1
    fi
    
    # Check if git is configured
    if [ -z "$(git config --global user.name)" ]; then
        echo "⚠️  Git user name not set. Please run:"
        echo "   git config --global user.name 'Your Name'"
        echo "   git config --global user.email 'your.email@example.com'"
        echo ""
        read -p "Press Enter after setting up Git..."
    fi
    
    # Initialize git if not already done
    if [ ! -d ".git" ]; then
        git init
        echo "✅ Git repository initialized"
    fi
    
    # Add all files
    git add .
    
    # Check if there are changes to commit
    if git diff --staged --quiet; then
        echo "ℹ️  No changes to commit"
    else
        git commit -m "Deploy: Bogotá Crime Heatmap $(date)"
        echo "✅ Changes committed"
    fi
}

# Function for GitHub Pages deployment
deploy_github_pages() {
    echo "🐙 GitHub Pages Deployment"
    echo "========================="
    
    setup_git
    
    echo ""
    echo "📋 Next steps:"
    echo "1. Create a new repository on GitHub.com"
    echo "2. Copy the repository URL"
    echo "3. Run these commands:"
    echo ""
    echo "   git remote add origin <YOUR_REPO_URL>"
    echo "   git branch -M main"
    echo "   git push -u origin main"
    echo ""
    echo "4. Go to Settings → Pages in your GitHub repository"
    echo "5. Select 'Deploy from a branch' → 'main' → '/ (root)'"
    echo "6. Your app will be live at: https://yourusername.github.io/repo-name"
    echo ""
    read -p "Press Enter when ready to continue..."
}

# Function for Netlify deployment
deploy_netlify() {
    echo "🌐 Netlify Deployment"
    echo "===================="
    
    echo "📋 Choose your deployment method:"
    echo "1. Drag & Drop (Easiest)"
    echo "2. Git Integration"
    echo ""
    read -p "Enter your choice (1 or 2): " choice
    
    case $choice in
        1)
            echo ""
            echo "📦 Creating deployment package..."
            zip -r bogota-crime-heatmap.zip . -x "*.git*" "*.DS_Store*" "deploy.sh" "DEPLOYMENT.md"
            echo "✅ Created bogota-crime-heatmap.zip"
            echo ""
            echo "📋 Next steps:"
            echo "1. Go to https://netlify.com"
            echo "2. Drag 'bogota-crime-heatmap.zip' to the deploy area"
            echo "3. Get your instant URL!"
            echo ""
            echo "📁 Deployment file: bogota-crime-heatmap.zip"
            ;;
        2)
            setup_git
            echo ""
            echo "📋 Next steps:"
            echo "1. Push your code to GitHub"
            echo "2. Go to https://netlify.com"
            echo "3. Click 'New site from Git'"
            echo "4. Connect your GitHub repository"
            echo "5. Deploy settings:"
            echo "   - Build command: (leave empty)"
            echo "   - Publish directory: / (root)"
            echo "6. Deploy!"
            ;;
        *)
            echo "❌ Invalid choice"
            ;;
    esac
}

# Function for Vercel deployment
deploy_vercel() {
    echo "⚡ Vercel Deployment"
    echo "==================="
    
    if ! command_exists vercel; then
        echo "📦 Installing Vercel CLI..."
        if command_exists npm; then
            npm install -g vercel
        else
            echo "❌ npm is not installed. Please install Node.js first."
            exit 1
        fi
    fi
    
    echo "🚀 Deploying to Vercel..."
    vercel --prod
    
    echo "✅ Deployment complete!"
}

# Function to create a simple server for testing
test_locally() {
    echo "🧪 Local Testing"
    echo "==============="
    
    if command_exists python3; then
        echo "🚀 Starting local server..."
        echo "📱 Open http://localhost:8000 in your browser"
        echo "⏹️  Press Ctrl+C to stop the server"
        echo ""
        python3 server.py
    else
        echo "❌ Python 3 is not installed"
        echo "💡 Alternative: Open index.html directly in your browser"
    fi
}

# Main menu
show_menu() {
    echo ""
    echo "🎯 Choose your deployment option:"
    echo "1. 🧪 Test locally first"
    echo "2. 🐙 Deploy to GitHub Pages (Free)"
    echo "3. 🌐 Deploy to Netlify (Free, Recommended)"
    echo "4. ⚡ Deploy to Vercel (Free)"
    echo "5. 📖 Show deployment guide"
    echo "6. ❌ Exit"
    echo ""
}

# Main script
while true; do
    show_menu
    read -p "Enter your choice (1-6): " choice
    
    case $choice in
        1)
            test_locally
            ;;
        2)
            deploy_github_pages
            ;;
        3)
            deploy_netlify
            ;;
        4)
            deploy_vercel
            ;;
        5)
            echo "📖 Opening deployment guide..."
            if command_exists open; then
                open DEPLOYMENT.md
            else
                echo "📄 Please open DEPLOYMENT.md in your text editor"
            fi
            ;;
        6)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid choice. Please enter 1-6."
            ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
done

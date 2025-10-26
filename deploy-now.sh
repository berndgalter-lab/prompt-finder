#!/bin/bash

# ============================================================
# PROMPT FINDER - Blueprint v1.7 Deployment
# ============================================================

echo "🚀 Deploying Prompt Finder Blueprint v1.7 to Live Server..."
echo ""
echo "Server: www200.your-server.de"
echo "User: promptg"
echo "Port: 222"
echo ""
echo "You will be prompted for your SSH password."
echo ""

# SSH-Verbindung mit Passwort-Eingabe
ssh -p 222 promptg@www200.your-server.de << 'ENDSSH'
    echo "✅ Connected to server!"
    echo ""
    
    echo "📂 Navigating to WordPress directory..."
    cd /home/promptg/public_html || { echo "❌ Error: Could not find WordPress directory"; exit 1; }
    
    echo "📊 Current Git status:"
    git status
    echo ""
    
    echo "📥 Pulling latest changes from GitHub..."
    git pull origin main
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Deployment successful!"
        echo ""
        echo "📋 Updated files:"
        git log -1 --stat
        echo ""
        echo "🎯 Next steps:"
        echo "1. Visit: https://prompt-finder.de"
        echo "2. Open a workflow to see Blueprint v1.7 features"
        echo "3. Check: Workflow Variables, Prerequisites, Step Badges"
        echo ""
        echo "✨ Blueprint v1.7 is now LIVE!"
    else
        echo ""
        echo "❌ Error during git pull. Please check manually."
        exit 1
    fi
ENDSSH

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "Test your site: https://prompt-finder.de"


#!/bin/bash

# Deployment Script für Live-Server
# Verbindet via SSH und pulled die neuesten Änderungen

echo "🚀 Starting deployment to live server..."

# Server Details
SERVER="www200.your-server.de"
USER="promptg"
PORT="222"
REMOTE_PATH="/usr/www/users/promptg/wp-content/themes/generatepress-child"
PASSWORD="Bi5e55Xq6c4cMetH"

# SSH Command mit Passwort (benötigt sshpass)
if ! command -v sshpass &> /dev/null; then
    echo "❌ sshpass ist nicht installiert."
    echo "📦 Installiere mit: brew install hudochenkov/sshpass/sshpass (Mac) oder apt-get install sshpass (Linux)"
    exit 1
fi

echo "📡 Connecting to server..."

# Git Pull auf dem Server
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no -p "$PORT" "$USER@$SERVER" << EOF
    echo "📍 Current directory check..."
    cd $REMOTE_PATH || exit 1
    
    echo "📋 Git status..."
    git status
    
    echo "⬇️  Pulling latest changes..."
    git pull origin main
    
    echo "✅ Deployment complete!"
    echo ""
    echo "📊 Deployment Info:"
    git log -1 --oneline
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment erfolgreich!"
    echo ""
    echo "🧪 Test Checklist:"
    echo "   1. Browser öffnen: https://prompt-finder.de/workflows/[workflow-name]"
    echo "   2. Hard Refresh: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)"
    echo "   3. Console öffnen (F12) - prüfe '🚀 Workflow Frontend loading...'"
    echo "   4. Prüfe ob Sidebar links sichtbar ist"
    echo "   5. Prüfe ob Header mit Progress Bar oben ist"
else
    echo "❌ Deployment fehlgeschlagen!"
    exit 1
fi


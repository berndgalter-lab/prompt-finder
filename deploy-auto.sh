#!/bin/bash

# Automated Deployment Script for Prompt Finder
# This script connects to the server and pulls the latest changes

SSH_USER="promptg"
SSH_HOST="www200.your-server.de"
SSH_PORT="222"
WP_PATH="/home/promptg/public_html"

echo "🚀 Deploying Prompt Finder Blueprint v1.7..."
echo ""

# Connect to server and execute commands
ssh -p ${SSH_PORT} ${SSH_USER}@${SSH_HOST} << 'ENDSSH'
    echo "📂 Navigating to WordPress directory..."
    cd /home/promptg/public_html || exit 1
    
    echo "📥 Pulling latest changes from GitHub..."
    git pull origin main
    
    echo "✅ Deployment complete!"
    echo ""
    echo "🎯 Next steps:"
    echo "1. Check your site: https://prompt-finder.de"
    echo "2. Test a workflow to see the new Blueprint v1.7 features"
    echo "3. If needed, run the migration script for existing workflows"
ENDSSH

echo ""
echo "✨ Deployment finished!"


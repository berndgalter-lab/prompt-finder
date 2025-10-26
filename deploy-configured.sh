#!/bin/bash

###############################################################################
# Prompt Finder - Deployment Script (Pre-configured)
# Version: 1.0.0
# Server: www200.your-server.de
###############################################################################

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration (PRE-CONFIGURED)
SSH_USER="promptg"
SSH_HOST="www200.your-server.de"
SSH_PORT="222"

print_header() {
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║         PROMPT FINDER - DEPLOYMENT SCRIPT                 ║"
    echo "║         Server: www200.your-server.de                     ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_step() {
    echo -e "${GREEN}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_header

echo "This script will deploy Prompt Finder to your server."
echo ""
echo "Configuration:"
echo "  SSH User: $SSH_USER"
echo "  SSH Host: $SSH_HOST"
echo "  SSH Port: $SSH_PORT"
echo ""
echo "You will be prompted for your SSH password during execution."
echo ""

read -p "Continue with deployment? (y/n): " confirm
if [ "$confirm" != "y" ]; then
    echo "Deployment cancelled."
    exit 0
fi

echo ""
print_step "Step 1: Finding WordPress installation..."
echo ""
echo "Connecting to server..."
echo "Command: ssh -p $SSH_PORT $SSH_USER@$SSH_HOST"
echo ""

# Find WordPress path
ssh -p $SSH_PORT $SSH_USER@$SSH_HOST << 'ENDSSH'
    echo "Connected successfully!"
    echo ""
    echo "Current directory:"
    pwd
    echo ""
    
    echo "Looking for WordPress installation..."
    
    # Check common paths
    if [ -f "public_html/wp-config.php" ]; then
        WP_PATH="$HOME/public_html"
        echo "✓ Found WordPress in: $WP_PATH"
    elif [ -f "htdocs/wp-config.php" ]; then
        WP_PATH="$HOME/htdocs"
        echo "✓ Found WordPress in: $WP_PATH"
    elif [ -f "www/wp-config.php" ]; then
        WP_PATH="$HOME/www"
        echo "✓ Found WordPress in: $WP_PATH"
    elif [ -f "wp-config.php" ]; then
        WP_PATH="$HOME"
        echo "✓ Found WordPress in: $WP_PATH"
    else
        echo "✗ WordPress not found in common locations"
        echo ""
        echo "Please check manually. Looking for wp-config.php..."
        find ~ -name "wp-config.php" -type f 2>/dev/null | head -5
        exit 1
    fi
    
    echo ""
    echo "WordPress Path: $WP_PATH"
    export WP_PATH
    
    # Step 2: Create Backup
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Step 2: Creating Backup"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    cd "$WP_PATH"
    BACKUP_DATE=$(date +%Y%m%d-%H%M%S)
    
    # Database backup (if WP-CLI available)
    if command -v wp &> /dev/null; then
        echo "▶ Creating database backup..."
        wp db export "backup-before-deployment-$BACKUP_DATE.sql" 2>/dev/null
        if [ $? -eq 0 ]; then
            echo "✓ Database backup created: backup-before-deployment-$BACKUP_DATE.sql"
        fi
    else
        echo "⚠ WP-CLI not available, skipping database backup"
        echo "  (You can create manual backup via phpMyAdmin)"
    fi
    
    # Theme backup
    echo "▶ Creating theme backup..."
    if [ -d "wp-content/themes/generatepress-child" ]; then
        tar -czf "backup-theme-$BACKUP_DATE.tar.gz" wp-content/themes/generatepress-child/ 2>/dev/null
        if [ $? -eq 0 ]; then
            echo "✓ Theme backup created: backup-theme-$BACKUP_DATE.tar.gz"
        fi
    fi
    
    # Step 3: Check Git Status
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Step 3: Checking Git Status"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    if [ -d ".git" ]; then
        echo "Git repository found"
        echo ""
        echo "Current status:"
        git status
        echo ""
        echo "Current branch:"
        git branch
    else
        echo "✗ No git repository found!"
        echo ""
        echo "You need to initialize git first:"
        echo "  cd $WP_PATH"
        echo "  git init"
        echo "  git remote add origin git@github.com:berndgalter-lab/prompt-finder.git"
        echo "  git fetch"
        echo "  git checkout main"
        exit 1
    fi
    
    # Step 4: Pull Changes
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Step 4: Pulling Changes from GitHub"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    echo "▶ Running: git pull origin main"
    git pull origin main
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✓ Git pull successful!"
    else
        echo ""
        echo "✗ Git pull failed!"
        echo ""
        echo "Common issues:"
        echo "  - Merge conflicts (check git status)"
        echo "  - SSH key not configured"
        echo "  - Network issues"
        exit 1
    fi
    
    # Step 5: Verify Files
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Step 5: Verifying Deployment"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    if [ -f "wp-content/themes/generatepress-child/single-workflows.php" ]; then
        echo "✓ single-workflows.php exists"
    else
        echo "✗ single-workflows.php not found"
    fi
    
    if [ -d "wp-content/themes/generatepress-child/docs" ]; then
        echo "✓ docs/ directory exists"
    else
        echo "✗ docs/ directory not found"
    fi
    
    if [ -f "wp-content/themes/generatepress-child/docs/MIGRATION_SCRIPT.php" ]; then
        echo "✓ MIGRATION_SCRIPT.php exists"
    else
        echo "✗ MIGRATION_SCRIPT.php not found"
    fi
    
    # Step 6: Migration
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Step 6: Migration"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    if command -v wp &> /dev/null; then
        echo "WP-CLI is available"
        echo ""
        read -p "Run migration now? (y/n): " run_migration
        
        if [ "$run_migration" = "y" ]; then
            echo ""
            echo "▶ Running migration..."
            wp eval-file wp-content/themes/generatepress-child/docs/MIGRATION_SCRIPT.php
            
            if [ $? -eq 0 ]; then
                echo ""
                echo "✓ Migration completed successfully!"
            else
                echo ""
                echo "⚠ Migration had issues. Check output above."
            fi
        else
            echo "Migration skipped. You can run it later with:"
            echo "  cd $WP_PATH"
            echo "  wp eval-file wp-content/themes/generatepress-child/docs/MIGRATION_SCRIPT.php"
        fi
    else
        echo "⚠ WP-CLI not available"
        echo ""
        echo "To run migration manually:"
        echo "1. Add to functions.php:"
        echo ""
        echo "add_action('admin_init', function() {"
        echo "    if (!get_option('pf_migration_completed')) {"
        echo "        require_once get_stylesheet_directory() . '/docs/MIGRATION_SCRIPT.php';"
        echo "        pf_run_migration();"
        echo "        update_option('pf_migration_completed', true);"
        echo "    }"
        echo "});"
        echo ""
        echo "2. Visit WordPress Admin"
        echo "3. Remove the code"
    fi
    
    # Final Summary
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✓ DEPLOYMENT COMPLETE!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Backups created:"
    echo "  - Database: backup-before-deployment-$BACKUP_DATE.sql (if WP-CLI available)"
    echo "  - Theme: backup-theme-$BACKUP_DATE.tar.gz"
    echo ""
    echo "Next steps:"
    echo "  1. Visit your website and check workflows"
    echo "  2. Check WordPress admin"
    echo "  3. Monitor error logs"
    echo ""
ENDSSH

echo ""
print_success "═══════════════════════════════════════════════════════════"
print_success "  Deployment script completed!"
print_success "═══════════════════════════════════════════════════════════"
echo ""
echo "If everything looks good, you're done! 🎉"
echo ""


#!/bin/bash

###############################################################################
# Prompt Finder - Deployment Script
# Version: 1.0.0
# Commit: b15c4a1
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SSH_USER="promptg"
SSH_HOST="www200.your-server.de"
SSH_PORT="222"
WP_PATH="/home/promptg/public_html"  # Standard path, will be verified

###############################################################################
# Functions
###############################################################################

print_header() {
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║         PROMPT FINDER - DEPLOYMENT SCRIPT                 ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_step() {
    echo -e "${GREEN}▶ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

###############################################################################
# Pre-flight checks
###############################################################################

preflight_checks() {
    print_step "Running pre-flight checks..."
    
    # Check if SSH connection works
    if ! ssh -p $SSH_PORT -o ConnectTimeout=5 $SSH_USER@$SSH_HOST "exit" 2>/dev/null; then
        print_error "Cannot connect to server via SSH"
        echo "Please check:"
        echo "  - SSH_USER: $SSH_USER"
        echo "  - SSH_HOST: $SSH_HOST"
        echo "  - SSH_PORT: $SSH_PORT"
        exit 1
    fi
    
    print_success "SSH connection successful"
    
    # Check if WordPress path exists
    if ! ssh -p $SSH_PORT $SSH_USER@$SSH_HOST "[ -d $WP_PATH ]"; then
        print_error "WordPress path does not exist: $WP_PATH"
        exit 1
    fi
    
    print_success "WordPress path exists"
    
    # Check if git is available on server
    if ! ssh -p $SSH_PORT $SSH_USER@$SSH_HOST "which git" >/dev/null 2>&1; then
        print_error "Git is not installed on server"
        exit 1
    fi
    
    print_success "Git is available"
    
    echo ""
}

###############################################################################
# Backup
###############################################################################

create_backup() {
    print_step "Creating backup..."
    
    BACKUP_DATE=$(date +%Y%m%d-%H%M%S)
    
    # Database backup
    print_step "Backing up database..."
    ssh -p $SSH_PORT $SSH_USER@$SSH_HOST "cd $WP_PATH && wp db export backup-before-deployment-$BACKUP_DATE.sql" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        print_success "Database backup created: backup-before-deployment-$BACKUP_DATE.sql"
    else
        print_warning "Could not create database backup (WP-CLI might not be available)"
    fi
    
    # Theme backup
    print_step "Backing up theme files..."
    ssh -p $SSH_PORT $SSH_USER@$SSH_HOST "cd $WP_PATH && tar -czf backup-theme-$BACKUP_DATE.tar.gz wp-content/themes/generatepress-child/" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        print_success "Theme backup created: backup-theme-$BACKUP_DATE.tar.gz"
    else
        print_warning "Could not create theme backup"
    fi
    
    echo ""
}

###############################################################################
# Deployment
###############################################################################

deploy_code() {
    print_step "Deploying code to server..."
    
    # Navigate to WordPress directory and pull changes
    ssh -p $SSH_PORT $SSH_USER@$SSH_HOST << 'ENDSSH'
        cd $WP_PATH
        
        echo "Current directory: $(pwd)"
        echo ""
        
        # Check git status
        echo "Git status before pull:"
        git status
        echo ""
        
        # Pull changes
        echo "Pulling changes from GitHub..."
        git pull origin main
        
        if [ $? -eq 0 ]; then
            echo "✓ Git pull successful"
        else
            echo "✗ Git pull failed"
            exit 1
        fi
        
        echo ""
        echo "Git status after pull:"
        git status
ENDSSH
    
    if [ $? -eq 0 ]; then
        print_success "Code deployed successfully"
    else
        print_error "Deployment failed"
        exit 1
    fi
    
    echo ""
}

###############################################################################
# Migration
###############################################################################

run_migration() {
    print_step "Running migration..."
    
    echo "Choose migration method:"
    echo "  1) WP-CLI (recommended, faster)"
    echo "  2) Via WordPress Admin (manual)"
    echo "  3) Skip migration"
    read -p "Enter choice [1-3]: " migration_choice
    
    case $migration_choice in
        1)
            print_step "Running migration via WP-CLI..."
            ssh -p $SSH_PORT $SSH_USER@$SSH_HOST "cd $WP_PATH && wp eval-file wp-content/themes/generatepress-child/docs/MIGRATION_SCRIPT.php"
            
            if [ $? -eq 0 ]; then
                print_success "Migration completed successfully"
            else
                print_error "Migration failed"
                echo "You can run it manually later with:"
                echo "  wp eval-file wp-content/themes/generatepress-child/docs/MIGRATION_SCRIPT.php"
            fi
            ;;
        2)
            print_warning "Manual migration selected"
            echo ""
            echo "To complete migration:"
            echo "1. Add this to functions.php:"
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
            echo "3. Remove the code from functions.php"
            ;;
        3)
            print_warning "Migration skipped"
            ;;
        *)
            print_error "Invalid choice"
            ;;
    esac
    
    echo ""
}

###############################################################################
# Verification
###############################################################################

verify_deployment() {
    print_step "Verifying deployment..."
    
    # Check if files exist
    ssh -p $SSH_PORT $SSH_USER@$SSH_HOST "[ -f $WP_PATH/wp-content/themes/generatepress-child/single-workflows.php ]"
    if [ $? -eq 0 ]; then
        print_success "single-workflows.php exists"
    else
        print_error "single-workflows.php not found"
    fi
    
    ssh -p $SSH_PORT $SSH_USER@$SSH_HOST "[ -d $WP_PATH/wp-content/themes/generatepress-child/docs ]"
    if [ $? -eq 0 ]; then
        print_success "docs/ directory exists"
    else
        print_error "docs/ directory not found"
    fi
    
    ssh -p $SSH_PORT $SSH_USER@$SSH_HOST "[ -f $WP_PATH/wp-content/themes/generatepress-child/docs/MIGRATION_SCRIPT.php ]"
    if [ $? -eq 0 ]; then
        print_success "MIGRATION_SCRIPT.php exists"
    else
        print_error "MIGRATION_SCRIPT.php not found"
    fi
    
    echo ""
}

###############################################################################
# Main
###############################################################################

main() {
    print_header
    
    echo "This script will deploy Prompt Finder to your server."
    echo ""
    echo "Configuration:"
    echo "  SSH User: $SSH_USER"
    echo "  SSH Host: $SSH_HOST"
    echo "  SSH Port: $SSH_PORT"
    echo "  WP Path:  $WP_PATH"
    echo ""
    
    read -p "Continue with deployment? (y/n): " confirm
    if [ "$confirm" != "y" ]; then
        echo "Deployment cancelled."
        exit 0
    fi
    
    echo ""
    
    # Run deployment steps
    preflight_checks
    create_backup
    deploy_code
    verify_deployment
    run_migration
    
    # Final message
    echo ""
    print_success "═══════════════════════════════════════════════════════════"
    print_success "  DEPLOYMENT COMPLETE!"
    print_success "═══════════════════════════════════════════════════════════"
    echo ""
    echo "Next steps:"
    echo "  1. Visit your site: https://your-site.com"
    echo "  2. Check workflows: https://your-site.com/workflows/"
    echo "  3. Check WordPress admin"
    echo "  4. Monitor error log for issues"
    echo ""
    echo "Backups created:"
    echo "  - Database: backup-before-deployment-*.sql"
    echo "  - Theme: backup-theme-*.tar.gz"
    echo ""
    print_warning "Keep backups for at least 7 days!"
    echo ""
}

# Run main function
main


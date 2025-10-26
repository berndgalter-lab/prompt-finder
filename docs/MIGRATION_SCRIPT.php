<?php
/**
 * Migration Script: ACF Field Renaming
 * 
 * This script migrates data from old ACF field names to new ones.
 * Run this ONCE after renaming ACF fields in WordPress.
 * 
 * OLD STRUCTURE → NEW STRUCTURE:
 * - pf_variables → variables_workflow
 * - variables → variables_step
 * - Subfields also renamed with prefixes
 * 
 * @package PromptFinder
 * @version 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    die('Direct access not permitted.');
}

/**
 * Migrate Workflow Variables
 * OLD: pf_variables → NEW: variables_workflow
 */
function pf_migrate_workflow_variables() {
    $workflows = get_posts([
        'post_type' => 'workflows',
        'numberposts' => -1,
        'post_status' => 'any'
    ]);
    
    $migrated_count = 0;
    
    foreach ($workflows as $workflow) {
        $post_id = $workflow->ID;
        
        // Get old field data
        $old_variables = get_field('pf_variables', $post_id);
        
        if ($old_variables && is_array($old_variables)) {
            $new_variables = [];
            
            foreach ($old_variables as $var) {
                $new_variables[] = [
                    'workflow_var_key' => $var['var_key'] ?? '',
                    'workflow_var_label' => $var['label'] ?? '',
                    'workflow_var_placeholder' => $var['placeholder'] ?? '',
                    'workflow_var_required' => $var['required'] ?? false,
                    'workflow_var_default_value' => $var['default_value'] ?? '',
                    'workflow_var_prefer_system' => $var['prefer_profile_value'] ?? false,
                    'workflow_var_hint' => $var['hint'] ?? '',
                    'workflow_var_injection_mode' => $var['injection_mode'] ?? 'direct',
                ];
            }
            
            // Save to new field
            update_field('variables_workflow', $new_variables, $post_id);
            
            // Optional: Delete old field (uncomment if you want to clean up)
            // delete_field('pf_variables', $post_id);
            
            $migrated_count++;
            echo "✓ Migrated workflow variables for: {$workflow->post_title} (ID: {$post_id})\n";
        }
    }
    
    return $migrated_count;
}

/**
 * Migrate Step Variables
 * OLD: variables → NEW: variables_step
 */
function pf_migrate_step_variables() {
    $workflows = get_posts([
        'post_type' => 'workflows',
        'numberposts' => -1,
        'post_status' => 'any'
    ]);
    
    $migrated_count = 0;
    
    foreach ($workflows as $workflow) {
        $post_id = $workflow->ID;
        
        // Get steps
        $steps = get_field('steps', $post_id);
        
        if ($steps && is_array($steps)) {
            $updated = false;
            
            foreach ($steps as &$step) {
                // Check if old 'variables' field exists
                if (isset($step['variables']) && is_array($step['variables'])) {
                    $new_step_variables = [];
                    
                    foreach ($step['variables'] as $var) {
                        $new_step_variables[] = [
                            'step_var_name' => $var['var_name'] ?? '',
                            'step_var_description' => $var['var_description'] ?? '',
                            'step_var_example_value' => $var['example_value'] ?? '',
                            'step_var_required' => $var['required'] ?? false,
                        ];
                    }
                    
                    // Set new field
                    $step['variables_step'] = $new_step_variables;
                    
                    // Optional: Remove old field (uncomment if you want to clean up)
                    // unset($step['variables']);
                    
                    $updated = true;
                }
            }
            
            if ($updated) {
                // Save updated steps
                update_field('steps', $steps, $post_id);
                $migrated_count++;
                echo "✓ Migrated step variables for: {$workflow->post_title} (ID: {$post_id})\n";
            }
        }
    }
    
    return $migrated_count;
}

/**
 * Run Full Migration
 */
function pf_run_migration() {
    echo "===========================================\n";
    echo "PROMPT FINDER - ACF MIGRATION SCRIPT\n";
    echo "===========================================\n\n";
    
    echo "Starting migration...\n\n";
    
    // Migrate workflow variables
    echo "--- Migrating Workflow Variables ---\n";
    $workflow_count = pf_migrate_workflow_variables();
    echo "Migrated {$workflow_count} workflows\n\n";
    
    // Migrate step variables
    echo "--- Migrating Step Variables ---\n";
    $step_count = pf_migrate_step_variables();
    echo "Migrated {$step_count} workflows\n\n";
    
    echo "===========================================\n";
    echo "MIGRATION COMPLETE!\n";
    echo "===========================================\n";
    echo "Workflow Variables: {$workflow_count} workflows\n";
    echo "Step Variables: {$step_count} workflows\n";
    echo "\nPlease verify the data in WordPress admin.\n";
}

// HOW TO RUN THIS SCRIPT:
// 
// Option 1: Add to functions.php temporarily
// Add this line to functions.php:
// add_action('admin_init', 'pf_run_migration');
// Then visit any admin page ONCE, then remove the line.
//
// Option 2: Run via WP-CLI
// wp eval-file MIGRATION_SCRIPT.php
//
// Option 3: Create a temporary admin page
// See example below:

/**
 * Example: Create temporary admin page to run migration
 * Add this to functions.php temporarily
 */
/*
add_action('admin_menu', function() {
    add_submenu_page(
        'tools.php',
        'PF Migration',
        'PF Migration',
        'manage_options',
        'pf-migration',
        function() {
            if (isset($_POST['run_migration']) && check_admin_referer('pf_migration')) {
                echo '<div class="wrap"><pre>';
                pf_run_migration();
                echo '</pre></div>';
            } else {
                echo '<div class="wrap">';
                echo '<h1>Prompt Finder Migration</h1>';
                echo '<p>This will migrate ACF field data from old structure to new structure.</p>';
                echo '<form method="post">';
                wp_nonce_field('pf_migration');
                echo '<button type="submit" name="run_migration" class="button button-primary">Run Migration</button>';
                echo '</form>';
                echo '</div>';
            }
        }
    );
});
*/


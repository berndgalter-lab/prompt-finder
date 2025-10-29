<?php
/**
 * DEBUG - Show actual variable structure in workflows
 * Upload to: /usr/www/users/promptg/wp-content/themes/generatepress-child/
 * Access: https://prompt-finder.de/wp-content/themes/generatepress-child/debug-variables.php
 */

require_once(__DIR__ . '/../../../wp-load.php');

if (!current_user_can('manage_options')) {
    die('Access denied. Please log in as admin.');
}

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Variables Debug</title>
    <style>
        body { font-family: monospace; padding: 20px; background: #f5f5f5; }
        pre { background: #263238; color: #aed581; padding: 15px; border-radius: 4px; overflow-x: auto; }
        .workflow { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
        h2 { color: #2196F3; }
    </style>
</head>
<body>
    <h1>🔍 Variables Structure Debug</h1>
    
    <?php
    $workflows = get_posts([
        'post_type' => 'workflows',
        'numberposts' => 1, // Only first workflow
        'post_status' => 'publish'
    ]);
    
    if (empty($workflows)) {
        echo '<p>No workflows found!</p>';
        exit;
    }
    
    $workflow = $workflows[0];
    echo '<div class="workflow">';
    echo '<h2>' . esc_html($workflow->post_title) . '</h2>';
    
    // Get steps
    $steps = get_field('steps', $workflow->ID);
    
    if (!empty($steps) && is_array($steps)) {
        $first_step = $steps[0];
        
        echo '<h3>First Step Variables Structure:</h3>';
        
        // Check both old and new field names
        if (isset($first_step['variables_step'])) {
            echo '<p><strong>Found: variables_step</strong></p>';
            echo '<pre>' . print_r($first_step['variables_step'], true) . '</pre>';
        }
        
        if (isset($first_step['variables'])) {
            echo '<p><strong>Found: variables (OLD)</strong></p>';
            echo '<pre>' . print_r($first_step['variables'], true) . '</pre>';
        }
        
        if (!isset($first_step['variables_step']) && !isset($first_step['variables'])) {
            echo '<p><strong>❌ NO VARIABLES FOUND!</strong></p>';
        }
        
        echo '<h3>Complete First Step Structure:</h3>';
        echo '<pre>' . print_r($first_step, true) . '</pre>';
    }
    
    echo '</div>';
    ?>
    
</body>
</html>


<?php
/**
 * DEBUG SCRIPT - ACF Fields Check
 * 
 * Upload this to: /usr/www/users/promptg/wp-content/themes/generatepress-child/
 * Access via: https://prompt-finder.de/wp-content/themes/generatepress-child/debug-acf-fields.php
 */

// Load WordPress
require_once(__DIR__ . '/../../../wp-load.php');

// Security check
if (!current_user_can('manage_options')) {
    die('Access denied. Please log in as admin.');
}

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>ACF Fields Debug - Prompt Finder</title>
    <style>
        body { font-family: monospace; padding: 20px; background: #f5f5f5; }
        h1 { color: #333; }
        h2 { color: #666; margin-top: 30px; }
        .workflow { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .field { margin: 10px 0; padding: 10px; background: #f9f9f9; border-left: 4px solid #4CAF50; }
        .field-name { font-weight: bold; color: #2196F3; }
        .field-value { color: #333; margin-top: 5px; }
        .empty { color: #999; font-style: italic; }
        .error { color: #f44336; }
        .success { color: #4CAF50; }
        pre { background: #263238; color: #aed581; padding: 15px; border-radius: 4px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>🔍 ACF Fields Debug - Prompt Finder Blueprint v1.7</h1>
    
    <?php
    // Get all workflows
    $workflows = get_posts([
        'post_type' => 'workflows',
        'numberposts' => -1,
        'post_status' => 'publish'
    ]);
    
    if (empty($workflows)) {
        echo '<p class="error">❌ Keine Workflows gefunden!</p>';
        exit;
    }
    
    echo '<p class="success">✅ ' . count($workflows) . ' Workflow(s) gefunden</p>';
    
    foreach ($workflows as $workflow) {
        echo '<div class="workflow">';
        echo '<h2>📄 ' . esc_html($workflow->post_title) . ' (ID: ' . $workflow->ID . ')</h2>';
        
        // Check new Blueprint v1.7 fields
        echo '<h3>🆕 Blueprint v1.7 Felder:</h3>';
        
        // 1. Workflow Variables (Global)
        $variables_workflow = get_field('variables_workflow', $workflow->ID);
        echo '<div class="field">';
        echo '<div class="field-name">variables_workflow (Workflow Variables Global):</div>';
        if (!empty($variables_workflow) && is_array($variables_workflow)) {
            echo '<div class="field-value">';
            echo '<strong>✅ ' . count($variables_workflow) . ' Variable(n) gefunden:</strong>';
            echo '<pre>' . print_r($variables_workflow, true) . '</pre>';
            echo '</div>';
        } else {
            echo '<div class="field-value empty">❌ LEER - Keine Workflow Variables eingetragen!</div>';
        }
        echo '</div>';
        
        // 2. Inputs Prerequisites
        $inputs_prerequisites = get_field('inputs_prerequisites', $workflow->ID);
        echo '<div class="field">';
        echo '<div class="field-name">inputs_prerequisites:</div>';
        if (!empty($inputs_prerequisites)) {
            echo '<div class="field-value">✅ ' . esc_html($inputs_prerequisites) . '</div>';
        } else {
            echo '<div class="field-value empty">❌ LEER</div>';
        }
        echo '</div>';
        
        // 3. Requires Source Content
        $requires_source_content = get_field('requires_source_content', $workflow->ID);
        echo '<div class="field">';
        echo '<div class="field-name">requires_source_content:</div>';
        echo '<div class="field-value">' . ($requires_source_content ? '✅ TRUE' : '❌ FALSE') . '</div>';
        echo '</div>';
        
        // 4. Check Steps
        $steps = get_field('steps', $workflow->ID);
        echo '<h3>📋 Steps (' . (is_array($steps) ? count($steps) : 0) . '):</h3>';
        
        if (!empty($steps) && is_array($steps)) {
            foreach ($steps as $i => $step) {
                $idx = $i + 1;
                echo '<div class="field">';
                echo '<div class="field-name">Step ' . $idx . ': ' . esc_html($step['title'] ?? 'Untitled') . '</div>';
                echo '<div class="field-value">';
                
                // Check new step fields
                $step_type = $step['step_type'] ?? '';
                $prompt_mode = $step['prompt_mode'] ?? '';
                $uses_global_vars = !empty($step['uses_global_vars']);
                $consumes_previous = !empty($step['consumes_previous_output']);
                $paste_guidance = $step['paste_guidance'] ?? '';
                $step_body = $step['step_body'] ?? '';
                $review_hint = $step['review_hint'] ?? '';
                $variables_step = $step['variables_step'] ?? [];
                
                echo '<ul>';
                echo '<li><strong>step_type:</strong> ' . ($step_type ? '✅ ' . esc_html($step_type) : '❌ LEER') . '</li>';
                echo '<li><strong>prompt_mode:</strong> ' . ($prompt_mode ? '✅ ' . esc_html($prompt_mode) : '❌ LEER') . '</li>';
                echo '<li><strong>uses_global_vars:</strong> ' . ($uses_global_vars ? '✅ TRUE' : '❌ FALSE') . '</li>';
                echo '<li><strong>consumes_previous_output:</strong> ' . ($consumes_previous ? '✅ TRUE' : '❌ FALSE') . '</li>';
                echo '<li><strong>paste_guidance:</strong> ' . (!empty($paste_guidance) ? '✅ Vorhanden' : '❌ LEER') . '</li>';
                echo '<li><strong>step_body:</strong> ' . (!empty($step_body) ? '✅ Vorhanden' : '❌ LEER') . '</li>';
                echo '<li><strong>review_hint:</strong> ' . (!empty($review_hint) ? '✅ Vorhanden' : '❌ LEER') . '</li>';
                echo '<li><strong>variables_step:</strong> ' . (is_array($variables_step) && !empty($variables_step) ? '✅ ' . count($variables_step) . ' Variable(n)' : '❌ LEER') . '</li>';
                echo '</ul>';
                
                echo '</div>';
                echo '</div>';
            }
        } else {
            echo '<p class="empty">❌ Keine Steps gefunden!</p>';
        }
        
        echo '</div>'; // .workflow
    }
    ?>
    
    <hr>
    <h2>📝 Zusammenfassung:</h2>
    <p><strong>Wenn "variables_workflow" LEER ist:</strong></p>
    <ul>
        <li>Die Workflow Variables werden NICHT angezeigt (weil <code>if (!empty($workflow_variables))</code>)</li>
        <li>Sie müssen in WordPress → Workflows → [Workflow bearbeiten] die neuen ACF-Felder ausfüllen</li>
        <li>Oder das Migration-Script ausführen (falls alte Daten vorhanden sind)</li>
    </ul>
    
    <p><strong>Nächste Schritte:</strong></p>
    <ol>
        <li>Gehen Sie zu WordPress Admin → Workflows</li>
        <li>Bearbeiten Sie einen Workflow</li>
        <li>Scrollen Sie zu "Workflow Variables"</li>
        <li>Fügen Sie mindestens eine Variable hinzu (z.B. "tone", "goal")</li>
        <li>Speichern Sie den Workflow</li>
        <li>Öffnen Sie den Workflow im Frontend → Workflow Variables sollten sichtbar sein!</li>
    </ol>
    
</body>
</html>


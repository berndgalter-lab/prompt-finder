<?php
/**
 * ADMIN TOOL - Show Variables in WordPress Admin
 * 
 * Upload to: /usr/www/users/promptg/wp-content/themes/generatepress-child/
 * Then add to functions.php to create admin menu
 */

// Add admin menu
add_action('admin_menu', 'pf_debug_variables_menu');

function pf_debug_variables_menu() {
    add_submenu_page(
        'tools.php',
        'PF Variables Debug',
        'PF Variables Debug',
        'manage_options',
        'pf-variables-debug',
        'pf_show_variables_debug'
    );
}

function pf_show_variables_debug() {
    if (!current_user_can('manage_options')) {
        wp_die('Access denied');
    }
    
    ?>
    <div class="wrap">
        <h1>🔍 Prompt Finder - Variables Debug</h1>
        
        <?php
        $workflows = get_posts([
            'post_type' => 'workflows',
            'numberposts' => -1,
            'post_status' => 'publish'
        ]);
        
        if (empty($workflows)) {
            echo '<p style="color: red;">❌ Keine Workflows gefunden!</p>';
            return;
        }
        
        echo '<p style="color: green; font-weight: bold;">✅ ' . count($workflows) . ' Workflow(s) gefunden</p>';
        
        foreach ($workflows as $workflow) {
            ?>
            <div style="background: white; padding: 20px; margin: 20px 0; border: 1px solid #ccc; border-radius: 8px;">
                <h2>📄 <?php echo esc_html($workflow->post_title); ?> (ID: <?php echo $workflow->ID; ?>)</h2>
                
                <h3>🆕 Workflow Variables:</h3>
                <?php
                // Check NEW field name
                $variables_workflow = get_field('variables_workflow', $workflow->ID);
                if (!empty($variables_workflow) && is_array($variables_workflow)) {
                    echo '<p style="color: green;"><strong>✅ variables_workflow: ' . count($variables_workflow) . ' Variable(n)</strong></p>';
                    echo '<pre style="background: #f5f5f5; padding: 10px; overflow-x: auto;">' . print_r($variables_workflow, true) . '</pre>';
                } else {
                    echo '<p style="color: orange;">⚠️ variables_workflow: LEER</p>';
                }
                
                // Check OLD field name
                $pf_variables = get_field('pf_variables', $workflow->ID);
                if (!empty($pf_variables) && is_array($pf_variables)) {
                    echo '<p style="color: green;"><strong>✅ pf_variables (ALT): ' . count($pf_variables) . ' Variable(n)</strong></p>';
                    echo '<pre style="background: #f5f5f5; padding: 10px; overflow-x: auto;">' . print_r($pf_variables, true) . '</pre>';
                } else {
                    echo '<p style="color: orange;">⚠️ pf_variables (ALT): LEER</p>';
                }
                
                // Check Steps
                $steps = get_field('steps', $workflow->ID);
                if (!empty($steps) && is_array($steps)) {
                    echo '<h3>📋 Steps (' . count($steps) . '):</h3>';
                    
                    foreach ($steps as $i => $step) {
                        $idx = $i + 1;
                        echo '<h4>Step ' . $idx . ': ' . esc_html($step['title'] ?? 'Untitled') . '</h4>';
                        
                        // Check NEW field name
                        $variables_step = $step['variables_step'] ?? [];
                        if (!empty($variables_step) && is_array($variables_step)) {
                            echo '<p style="color: green;"><strong>✅ variables_step: ' . count($variables_step) . ' Variable(n)</strong></p>';
                            echo '<pre style="background: #f5f5f5; padding: 10px; overflow-x: auto;">' . print_r($variables_step, true) . '</pre>';
                        } else {
                            echo '<p style="color: orange;">⚠️ variables_step: LEER</p>';
                        }
                        
                        // Check OLD field name
                        $variables = $step['variables'] ?? [];
                        if (!empty($variables) && is_array($variables)) {
                            echo '<p style="color: green;"><strong>✅ variables (ALT): ' . count($variables) . ' Variable(n)</strong></p>';
                            echo '<pre style="background: #f5f5f5; padding: 10px; overflow-x: auto;">' . print_r($variables, true) . '</pre>';
                        } else {
                            echo '<p style="color: orange;">⚠️ variables (ALT): LEER</p>';
                        }
                        
                        echo '<hr>';
                    }
                }
                ?>
            </div>
            <?php
        }
        ?>
        
        <hr>
        <h2>📝 Zusammenfassung:</h2>
        <ul>
            <li>Wenn <strong>variables_workflow</strong> UND <strong>pf_variables</strong> LEER sind → Keine Workflow Variables in der Datenbank</li>
            <li>Wenn <strong>variables_step</strong> UND <strong>variables</strong> LEER sind → Keine Step Variables in der Datenbank</li>
            <li>Der Code unterstützt BEIDE Feldnamen (alt + neu) automatisch</li>
        </ul>
        
        <h3>🎯 Nächste Schritte:</h3>
        <ol>
            <li>Wenn ALLE Felder leer sind → Workflows haben keine Variablen in ACF</li>
            <li>Wenn alte Felder gefüllt sind → Code sollte sie automatisch anzeigen</li>
            <li>Falls nicht angezeigt → Browser-Cache leeren (Cmd+Shift+R)</li>
        </ol>
    </div>
    <?php
}


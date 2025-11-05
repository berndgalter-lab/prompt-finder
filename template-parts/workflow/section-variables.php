<?php
/**
 * Workflow Template Part: Variables Section
 * 
 * Displays interactive input fields for workflow variables
 * 
 * @package GeneratePress_Child
 */

// Security: Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Get workflow variables from ACF (explicit post ID)
$workflow_variables = get_field('variables_workflow', get_the_ID());

// Fallback: support old field 'pf_variables' by mapping to new structure
if ((empty($workflow_variables) || !is_array($workflow_variables))) {
    $old_vars = get_field('pf_variables');
    if (!empty($old_vars) && is_array($old_vars)) {
        $mapped = [];
        foreach ($old_vars as $ov) {
            $mapped[] = [
                'workflow_var_key' => isset($ov['var_key']) ? $ov['var_key'] : '',
                'workflow_var_label' => isset($ov['label']) ? $ov['label'] : '',
                'workflow_var_placeholder' => isset($ov['placeholder']) ? $ov['placeholder'] : '',
                'workflow_var_hint' => isset($ov['hint']) ? $ov['hint'] : '',
                'workflow_var_required' => !empty($ov['required']),
                'workflow_var_default_value' => isset($ov['default_value']) ? $ov['default_value'] : '',
            ];
        }
        $workflow_variables = $mapped;
    }
}

// If no variables, show notice and return
if (empty($workflow_variables) || !is_array($workflow_variables)) {
    ?>
    <section id="variables" class="pf-section pf-section--variables">
        <h2 class="pf-section-heading">Configure Your Variables</h2>
        <div class="pf-variables-notice">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <p>No variables needed for this workflow. You can start right away!</p>
        </div>
    </section>
    <?php
    return;
}

// Get total count for counter
$total_variables = count($workflow_variables);

// Get current post ID for storage key
$post_id = get_the_ID();
?>

<section id="variables" class="pf-section pf-section--variables" data-post-id="<?php echo esc_attr($post_id); ?>">
    
    <!-- Section Heading -->
    <h2 class="pf-section-heading">Configure Your Variables</h2>
    <p class="pf-section-subheading">Fill these inputs before starting the workflow</p>
    
    <!-- Variables Card -->
    <div class="pf-variables-card">
        
        <!-- Card Header -->
        <div class="pf-variables-header">
            <p class="pf-variables-info">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                These values will be inserted into your prompts automatically.
            </p>
            <div class="pf-variables-counter" data-variables-total="<?php echo esc_attr($total_variables); ?>" data-variables-filled="0">
                <span class="pf-counter-number">0</span> / <span class="pf-counter-total"><?php echo esc_html($total_variables); ?></span>
            </div>
        </div>
        
        <!-- Variables List -->
        <div class="pf-variables-list" data-vars-host></div>
        
        <!-- Actions -->
        <div class="pf-variables-actions">
            <button type="button" class="pf-btn pf-btn--secondary pf-btn--clear" data-action="clear-variables">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                Clear All
            </button>
            
            <button type="button" class="pf-btn pf-btn--primary pf-btn--save" data-action="save-variables">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/>
                    <polyline points="7 3 7 8 15 8"/>
                </svg>
                Save & Continue
            </button>
        </div>
        
        <!-- Info Note -->
        <div class="pf-variables-note">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <line x1="12" y1="12" x2="12" y2="16"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <span>Values are saved in your browser for this session</span>
        </div>
        
    </div>
    
</section>

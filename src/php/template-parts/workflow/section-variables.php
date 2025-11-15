<?php
/**
 * Workflow Template Part: Variables Section
 *
 * Displays the three-tier variable overview (profile defaults + workflow inputs)
 *
 * @package GeneratePress_Child
 */

// Security: Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

$workflow_id = get_the_ID();

// Get workflow variables from ACF (explicit post ID)
$workflow_variables = get_field('variables_workflow', $workflow_id);

// Get steps to determine which variables are used where
$steps = get_field('steps', $workflow_id);
$variable_usage = []; // Map of variable_key => array of step numbers

if (!empty($steps) && is_array($steps)) {
    foreach ($steps as $step_index => $step) {
        $step_number = $step_index + 1;
        $step_title = isset($step['step_title']) ? $step['step_title'] : "Step " . $step_number;
        
        // Check step prompt and body for variable placeholders
        $step_prompt = isset($step['prompt']) ? $step['prompt'] : '';
        $step_body = isset($step['step_body']) ? $step['step_body'] : '';
        $combined_content = $step_prompt . ' ' . $step_body;
        
        // Find all {variable_name} placeholders
        if (preg_match_all('/\{([a-zA-Z0-9_]+)(?:\|[^}]*)?\}/', $combined_content, $matches)) {
            foreach ($matches[1] as $var_key) {
                if (!isset($variable_usage[$var_key])) {
                    $variable_usage[$var_key] = [];
                }
                $variable_usage[$var_key][] = [
                    'number' => $step_number,
                    'title' => $step_title
                ];
            }
        }
    }
}

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

$has_workflow_variables = !empty($workflow_variables) && is_array($workflow_variables);
$total_variables = $has_workflow_variables ? count($workflow_variables) : 0;

// Profile defaults (global tier)
$profile_defaults_enabled = (int) get_field('use_profile_defaults', $workflow_id) === 1;
$profile_values = [];

if ($profile_defaults_enabled && is_user_logged_in() && class_exists('PF_UserUidMap') && class_exists('PF_UserVarsStoreWp')) {
    $wp_user_id = get_current_user_id();
    if ($wp_user_id) {
        $user_uid = PF_UserUidMap::userUidFromWpId($wp_user_id);
        $store = new PF_UserVarsStoreWp();
        $payload = $store->getByUserUid($user_uid);
        if (!empty($payload['data']) && is_array($payload['data'])) {
            foreach ($payload['data'] as $key => $value) {
                if (strpos($key, 'sys_') === 0) {
                    continue; // hide system helpers from profile defaults list
                }
                $profile_values[$key] = is_scalar($value) ? (string) $value : wp_json_encode($value);
            }
        }
    }
}

?>

<section id="pf-variables" class="pf-section pf-section--variables" data-post-id="<?php echo esc_attr($workflow_id); ?>">

    <?php if ($profile_defaults_enabled && !empty($profile_values)): ?>
        <!-- Profile Defaults Card (Read-only) -->
        <div class="pf-workflow-vars-card pf-workflow-vars-card--profile">
            <div class="pf-workflow-vars-card-header">
                <span class="pf-workflow-vars-icon">👤</span>
                <div>
                    <h3 class="pf-workflow-vars-title">Your Profile Defaults</h3>
                    <p class="pf-workflow-vars-subtitle">These values are shared across all your workflows.</p>
                </div>
                <div class="pf-variables-counter" data-variables-tier="profile">
                    <span class="pf-counter-number"><?php echo esc_html(count($profile_values)); ?></span>
                    <span class="pf-counter-total">/ <?php echo esc_html(count($profile_values)); ?></span>
                </div>
            </div>
            <div class="pf-workflow-vars-list pf-workflow-vars-list--readonly">
                <?php foreach ($profile_values as $profile_key => $profile_value): ?>
                    <div class="pf-var pf-var--readonly" data-var-key="<?php echo esc_attr($profile_key); ?>">
                        <label class="pf-var-label"><?php echo esc_html(ucwords(str_replace('_', ' ', $profile_key))); ?></label>
                        <div class="pf-var-value"><?php echo esc_html($profile_value); ?></div>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    <?php endif; ?>

    <?php if ($has_workflow_variables): ?>
        <!-- Unified workflow variables card -->
        <div class="pf-workflow-vars-card">
            <div class="pf-workflow-vars-card-header">
                <span class="pf-workflow-vars-icon">⚙️</span>
                <div>
                    <h3 class="pf-workflow-vars-title">Configure Your Variables</h3>
                    <p class="pf-workflow-vars-subtitle">These values apply to all steps in this workflow.</p>
                    <div class="pf-workflow-vars-explainer">
                        <span class="pf-workflow-vars-explainer-label">How variables work</span>
                        <p class="pf-workflow-vars-explainer-text">Any change you make here instantly updates all prompts in the steps below.</p>
                    </div>
                </div>
                <?php if ($total_variables > 0): ?>
                    <div class="pf-variables-progress" data-variables-progress>
                        <span class="pf-progress-text" data-variables-progress-text>
                            0 of <?php echo esc_html($total_variables); ?> completed
                        </span>
                        <div class="pf-progress-bar" role="progressbar" aria-valuenow="0"
                             aria-valuemin="0" aria-valuemax="100">
                            <div class="pf-progress-fill" style="width:0%" data-variables-progress-fill aria-hidden="true"></div>
                        </div>
                    </div>
                <?php endif; ?>
            </div>

            <!-- Variable list: JavaScript will inject the controls here -->
            <div class="pf-workflow-vars-list" data-wf-form></div>
            
            <!-- Hidden data for variable usage -->
            <script type="application/json" id="pf-variable-usage-data">
            <?php echo wp_json_encode($variable_usage); ?>
            </script>
        </div>
    <?php else: ?>
        <div class="pf-workflow-vars-card">
            <div class="pf-variables-notice">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                <p>No workflow-specific variables are required.</p>
            </div>
        </div>
    <?php endif; ?>
</section>

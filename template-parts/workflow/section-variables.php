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

<section id="variables" class="pf-section pf-section--variables" data-post-id="<?php echo esc_attr($workflow_id); ?>">

    <?php if ($profile_defaults_enabled): ?>
        <div class="pf-variables-card pf-variables--profile">
            <div class="pf-variables-header">
                <div class="pf-variables-header-text">
                    <h3 class="pf-variables-title">Your Profile Defaults</h3>
                    <p class="pf-variables-helper">These values are inherited from your profile settings.</p>
                    <p class="pf-variables-helper">These are your default values used across all workflows.</p>
                    <p class="pf-variables-helper">Profile values are shared across all your workflows.</p>
                </div>
                <div class="pf-variables-counter" data-variables-tier="profile">
                    <span class="pf-counter-number"><?php echo esc_html(count($profile_values)); ?></span>
                    <span class="pf-counter-total">/ <?php echo esc_html(count($profile_values)); ?></span>
                </div>
            </div>

            <?php if (!empty($profile_values)): ?>
                <div class="pf-variables-list pf-variables--profile">
                    <?php foreach ($profile_values as $profile_key => $profile_value): ?>
                        <div class="pf-var-item pf-var-item--profile" data-var-key="<?php echo esc_attr($profile_key); ?>">
                            <span class="pf-var-label"><?php echo esc_html(ucwords(str_replace('_', ' ', $profile_key))); ?></span>
                            <span class="pf-var-value" title="<?php echo esc_attr($profile_value); ?>"><?php echo esc_html($profile_value); ?></span>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php else: ?>
                <div class="pf-variables-notice">
                    <p>No profile defaults have been saved yet.</p>
                </div>
            <?php endif; ?>
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
                <div class="pf-variables-counter"
                     data-variables-total="<?php echo esc_attr($total_variables); ?>"
                     data-variables-filled="0">
                    <span class="pf-counter-number">0</span>
                    <span class="pf-counter-total">/ <?php echo esc_html($total_variables); ?></span>
                </div>
            </div>

            <!-- Variable list: JavaScript will inject the controls here -->
            <div class="pf-workflow-vars-list" data-wf-form></div>

            <div class="pf-variables-note">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2" stroke-linecap="round"
                     stroke-linejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    <line x1="12" y1="12" x2="12" y2="16"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <span>These values apply to all steps in this workflow and are saved locally.</span>
            </div>
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

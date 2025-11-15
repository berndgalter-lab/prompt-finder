<?php
/**
 * Workflow Template Part: Master Progress Bar
 *
 * Shows overall progress across workflow variables and all step variables
 * Sticky positioning for constant visibility
 *
 * @package GeneratePress_Child
 */

// Security: Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

$workflow_id = get_the_ID();

// 1. Count Workflow Variables
$workflow_variables = get_field('variables_workflow', $workflow_id);
$wf_var_count = (!empty($workflow_variables) && is_array($workflow_variables)) 
    ? count($workflow_variables) 
    : 0;

// 2. Count Step Variables (across all steps)
$steps = get_field('steps', $workflow_id);
$step_var_count = 0;
$steps_data = [];

if (!empty($steps) && is_array($steps)) {
    foreach ($steps as $index => $step) {
        $step_vars = isset($step['variables_step']) && is_array($step['variables_step']) 
            ? $step['variables_step'] 
            : [];
        $step_count = count($step_vars);
        $step_var_count += $step_count;
        
        // Store step data for status display
        $steps_data[] = [
            'index' => $index + 1,
            'title' => isset($step['step_title']) ? $step['step_title'] : "Step " . ($index + 1),
            'var_count' => $step_count,
        ];
    }
}

// 3. Calculate totals
$total_vars = $wf_var_count + $step_var_count;

// Don't show if no variables exist
if ($total_vars === 0) {
    return;
}

// 4. Calculate initial completion (will be updated by JavaScript)
$initial_percentage = 0; // JavaScript will calculate this based on filled values

?>

<!-- pf:master-progress START -->
<section class="pf-master-progress" role="region" aria-label="Overall Workflow Progress">
    <div class="pf-master-progress-container">
        
        <!-- Header Row with Start Button -->
        <div class="pf-master-progress-header">
            <div class="pf-master-progress-header-left">
                <svg class="pf-master-progress-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 6v6l4 2"></path>
                </svg>
                <div class="pf-master-progress-text">
                    <h2 class="pf-master-progress-title">Workflow Progress</h2>
                    <p class="pf-master-progress-subtitle" data-master-progress-text>
                        <span data-master-filled>0</span> of <span data-master-total><?php echo esc_html($total_vars); ?></span> completed
                    </p>
                </div>
            </div>
            <a href="#pf-variables" 
               class="pf-master-progress-start-btn" 
               data-scroll-to="variables">
                Start workflow
            </a>
        </div>

        <!-- Progress Bar with Percentage -->
        <div class="pf-master-progress-bar-row">
            <div class="pf-master-progress-bar-wrapper">
                <div class="pf-master-progress-bar" role="progressbar" 
                     aria-valuenow="0" 
                     aria-valuemin="0" 
                     aria-valuemax="100"
                     aria-label="Overall completion percentage">
                    <div class="pf-master-progress-bar-fill" 
                         style="width: 0%"
                         data-master-progress-fill></div>
                </div>
            </div>
            <div class="pf-master-progress-percentage" data-master-percentage>0%</div>
        </div>

        <!-- Navigation Pills (Jump Links) -->
        <div class="pf-master-progress-sections">
            
            <!-- Workflow Variables Section -->
            <?php if ($wf_var_count > 0): ?>
            <a href="#pf-variables" 
               class="pf-progress-section" 
               data-section="workflow"
               data-section-total="<?php echo esc_attr($wf_var_count); ?>"
               data-section-filled="0"
               data-scroll-to="variables">
                <svg class="pf-progress-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M12 1v6m0 6v6m5.2-13.2 4.2-4.2m-4.2 4.2-4.2-4.2m4.2 18.4 4.2 4.2m-4.2-4.2-4.2 4.2M1 12h6m6 0h6"></path>
                </svg>
                <span class="pf-progress-section-label">Variables</span>
                <span class="pf-progress-section-status" data-section-status="workflow">
                    <svg class="pf-status-icon pf-status-icon--pending" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                    </svg>
                </span>
            </a>
            <?php endif; ?>

            <!-- Step Sections -->
            <?php foreach ($steps_data as $step): ?>
                <?php if ($step['var_count'] > 0): ?>
                <a href="#pf-step-<?php echo esc_attr($step['index']); ?>" 
                   class="pf-progress-section" 
                   data-section="step-<?php echo esc_attr($step['index']); ?>"
                   data-section-total="<?php echo esc_attr($step['var_count']); ?>"
                   data-section-filled="0"
                   data-scroll-to="step-<?php echo esc_attr($step['index']); ?>">
                    <svg class="pf-progress-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="12" y1="18" x2="12" y2="12"></line>
                        <line x1="9" y1="15" x2="15" y2="15"></line>
                    </svg>
                    <span class="pf-progress-section-label"><?php echo esc_html($step['title']); ?></span>
                    <span class="pf-progress-section-status" data-section-status="step-<?php echo esc_attr($step['index']); ?>">
                        <svg class="pf-status-icon pf-status-icon--pending" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                        </svg>
                    </span>
                </a>
                <?php endif; ?>
            <?php endforeach; ?>

        </div>

    </div>
</section>
<!-- pf:master-progress END -->

<!-- Hidden data for JavaScript -->
<script type="application/json" id="pf-master-progress-data">
{
    "totalVars": <?php echo esc_js($total_vars); ?>,
    "workflowVars": <?php echo esc_js($wf_var_count); ?>,
    "stepVars": <?php echo esc_js($step_var_count); ?>,
    "stepsData": <?php echo wp_json_encode($steps_data); ?>
}
</script>


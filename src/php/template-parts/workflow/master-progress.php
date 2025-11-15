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

// 1. Get all steps
$steps = get_field('steps', $workflow_id);
$steps_data = [];
$total_steps = 0;
$completed_steps = 0;

// 2. Count Workflow Variables for the variables card
$workflow_variables = get_field('variables_workflow', $workflow_id);
$wf_var_count = (!empty($workflow_variables) && is_array($workflow_variables)) 
    ? count($workflow_variables) 
    : 0;

// Count required workflow variables
$required_wf_vars = 0;
if (!empty($workflow_variables) && is_array($workflow_variables)) {
    foreach ($workflow_variables as $var) {
        if (!empty($var['workflow_var_required'])) {
            $required_wf_vars++;
        }
    }
}

// 3. Process steps
if (!empty($steps) && is_array($steps)) {
    foreach ($steps as $index => $step) {
        $step_number = $index + 1;
        $step_title = isset($step['step_title']) ? $step['step_title'] : "Step " . $step_number;
        
        // Count step variables
        $step_vars = isset($step['variables_step']) && is_array($step['variables_step']) 
            ? $step['variables_step'] 
            : [];
        $step_var_count = count($step_vars);
        
        // Step is considered completed if it has a completion status
        // For now, we'll use JavaScript to track this, so default is not completed
        $is_completed = false; // Will be updated by JavaScript
        
        $steps_data[] = [
            'index' => $step_number,
            'title' => $step_title,
            'var_count' => $step_var_count,
            'completed' => $is_completed,
        ];
        
        $total_steps++;
    }
}

// Don't show if no steps exist
if ($total_steps === 0) {
    return;
}

// 4. Calculate initial completion (will be updated by JavaScript based on step completion)
$initial_percentage = 0;
$completed_steps = 0; // JavaScript will update this

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
                        <span data-master-completed>0</span> of <span data-master-total><?php echo esc_html($total_steps); ?></span> steps completed
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
               class="pf-progress-section pf-progress-section--variables" 
               data-section="variables"
               data-required-vars="<?php echo esc_attr($required_wf_vars); ?>"
               data-filled-vars="0"
               data-scroll-to="variables">
                <svg class="pf-progress-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M12 1v6m0 6v6m5.2-13.2 4.2-4.2m-4.2 4.2-4.2-4.2m4.2 18.4 4.2 4.2m-4.2-4.2-4.2 4.2M1 12h6m6 0h6"></path>
                </svg>
                <span class="pf-progress-section-label">Variables</span>
                <span class="pf-progress-section-status" data-variables-status>
                    <svg class="pf-status-icon pf-status-icon--pending" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                    </svg>
                </span>
            </a>
            <?php endif; ?>

            <!-- Step Sections -->
            <?php foreach ($steps_data as $step_index => $step): ?>
                <a href="#pf-step-<?php echo esc_attr($step['index']); ?>" 
                   class="pf-progress-section pf-progress-section--step" 
                   data-section="step"
                   data-step-index="<?php echo esc_attr($step['index']); ?>"
                   data-step-completed="false"
                   data-scroll-to="step-<?php echo esc_attr($step['index']); ?>">
                    <svg class="pf-progress-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="12" y1="18" x2="12" y2="12"></line>
                        <line x1="9" y1="15" x2="15" y2="15"></line>
                    </svg>
                    <span class="pf-progress-section-label"><?php echo esc_html($step['title']); ?></span>
                    <span class="pf-progress-section-status" data-step-status="<?php echo esc_attr($step['index']); ?>">
                        <svg class="pf-status-icon pf-status-icon--open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                        </svg>
                    </span>
                </a>
            <?php endforeach; ?>

        </div>

    </div>
</section>
<!-- pf:master-progress END -->

<!-- Hidden data for JavaScript -->
<script type="application/json" id="pf-master-progress-data">
{
    "totalSteps": <?php echo esc_js($total_steps); ?>,
    "completedSteps": <?php echo esc_js($completed_steps); ?>,
    "requiredVars": <?php echo esc_js($required_wf_vars); ?>,
    "stepsData": <?php echo wp_json_encode($steps_data); ?>
}
</script>


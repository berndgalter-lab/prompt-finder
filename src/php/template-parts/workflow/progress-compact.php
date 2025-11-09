<?php
/**
 * Workflow Template Part: Compact Progress Bar
 * 
 * Displays a compact progress indicator showing step progress and input completion
 * 
 * @package GeneratePress_Child
 * @since 2.0.0
 */

// Security: Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Get workflow data
$steps_field = get_field('steps');
$variables_workflow_field = get_field('variables_workflow');
$total_steps = !empty($steps_field) && is_array($steps_field) ? count($steps_field) : 0;
$total_variables = !empty($variables_workflow_field) && is_array($variables_workflow_field) ? count($variables_workflow_field) : 0;

// Calculate initial progress
$initial_step_number = 1;
$initial_progress_percent = $total_steps > 0 ? round(($initial_step_number / $total_steps) * 100) : 0;

// Start timestamp for elapsed time tracking
$start_timestamp = time();
?>

<div class="pf-progress-compact" role="region" aria-label="Workflow Progress">
    <div class="pf-progress-compact-inner">
        <!-- Step Info -->
        <div class="pf-progress-step-info">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="9 11 12 14 22 4"></polyline>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
            <span data-progress-step>Step <?php echo esc_html($initial_step_number); ?> of <?php echo esc_html($total_steps); ?></span>
        </div>

        <!-- Progress Bar -->
        <div class="pf-progress-bar-compact" role="progressbar" aria-valuenow="<?php echo esc_attr($initial_progress_percent); ?>" aria-valuemin="0" aria-valuemax="100" aria-label="Workflow completion">
            <div class="pf-progress-fill-compact" style="width: <?php echo esc_attr($initial_progress_percent); ?>%" data-progress-fill></div>
        </div>

        <!-- Input Status -->
        <?php if ($total_variables > 0): ?>
            <div class="pf-progress-input-status">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M9 11l3 3L22 4"></path>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
                <span data-input-status>0 of <?php echo esc_html($total_variables); ?> inputs</span>
            </div>
        <?php endif; ?>
    </div>
</div>

<!-- Sticky Progress Bar (appears on scroll) -->
<div class="pf-sticky-progress" role="region" aria-label="Sticky Progress Bar" data-sticky-progress>
    <div class="pf-sticky-progress-inner">
        <!-- Workflow Title -->
        <h2 class="pf-sticky-title"><?php echo esc_html(get_the_title()); ?></h2>
        
        <div class="pf-sticky-divider" aria-hidden="true"></div>
        
        <!-- Progress Info -->
        <div class="pf-sticky-progress-info">
            <div class="pf-sticky-step">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <polyline points="9 11 12 14 22 4"></polyline>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
                <span data-sticky-step>Step <?php echo esc_html($initial_step_number); ?>/<?php echo esc_html($total_steps); ?></span>
            </div>

            <div class="pf-sticky-bar" role="progressbar" aria-valuenow="<?php echo esc_attr($initial_progress_percent); ?>" aria-valuemin="0" aria-valuemax="100" aria-label="Workflow completion">
                <div class="pf-sticky-fill" style="width: <?php echo esc_attr($initial_progress_percent); ?>%" data-sticky-fill></div>
            </div>

            <?php if ($total_variables > 0): ?>
                <div class="pf-sticky-inputs">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M9 11l3 3L22 4"></path>
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                    </svg>
                    <span data-sticky-inputs>0/<?php echo esc_html($total_variables); ?></span>
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>


<?php
/**
 * Workflow Template Part: Value Section
 * 
 * Displays pain points and expected outcomes
 * 
 * @package GeneratePress_Child
 */

// Security: Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Get ACF fields
$pain_points = get_field('pain_points');
$expected_outcome = get_field('expected_outcome');
$time_saved_min = get_field('time_saved_min');
?>

<section id="value" class="pf-section pf-section--value">
    
    <!-- Section Heading -->
    <h2 class="pf-section-heading">Why Use This Workflow?</h2>
    
    <div class="pf-value-grid">
        
        <!-- Pain Points Card -->
        <?php if (!empty($pain_points)): ?>
            <div class="pf-value-card pf-value-card--warning">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <div class="pf-value-card-content">
                    <h3 class="pf-value-card-heading">Problems This Solves</h3>
                    <div class="pf-value-card-text">
                        <?php echo wp_kses_post($pain_points); ?>
                    </div>
                </div>
            </div>
        <?php endif; ?>
        
        <!-- Expected Outcome Card -->
        <?php if (!empty($expected_outcome)): ?>
            <div class="pf-value-card pf-value-card--success">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <div class="pf-value-card-content">
                    <h3 class="pf-value-card-heading">What You'll Get</h3>
                    <div class="pf-value-card-text">
                        <?php echo wp_kses_post($expected_outcome); ?>
                    </div>
                </div>
            </div>
        <?php endif; ?>
        
    </div>
    
    <!-- Time Saved Highlight (if available) -->
    <?php if (!empty($time_saved_min) && $time_saved_min > 0): ?>
        <div class="pf-time-saved-badge" aria-label="Estimated time saving">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
            </svg>
            <div class="pf-time-saved-content">
                <span class="pf-time-saved-value">Saves ~<?php echo esc_html($time_saved_min); ?> minutes</span>
            </div>
        </div>
    <?php endif; ?>
    
</section>

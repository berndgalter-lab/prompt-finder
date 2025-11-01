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
    
    <div class="pf-value-rows">
        
        <!-- Pain Points Card -->
        <?php if (!empty($pain_points)): ?>
            <div class="pf-value-mini pf-value-mini--problems">
                <h3>Problems This Solves</h3>
                <div class="pf-value-card-text">
                    <?php echo wp_kses_post($pain_points); ?>
                </div>
            </div>
        <?php endif; ?>
        
        <!-- Expected Outcome Card -->
        <?php if (!empty($expected_outcome)): ?>
            <div class="pf-value-mini pf-value-mini--outcome">
                <h3>What You'll Get</h3>
                <div class="pf-value-card-text">
                    <?php echo wp_kses_post($expected_outcome); ?>
                </div>
            </div>
        <?php endif; ?>
        
    </div>
    
    <!-- Time Saved Highlight hidden (shown in metrics) -->
    <?php if (!empty($time_saved_min) && $time_saved_min > 0): ?>
        <div class="pf-time-saved-badge" aria-hidden="true" style="display: none;">
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

<?php
/**
 * Workflow Template Part: Hero Value Proposition
 * 
 * Displays the value proposition, benefits, and key metrics
 * to help users understand what they'll achieve with this workflow
 * 
 * @package GeneratePress_Child
 * @since 2.0.0
 */

// Security: Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Get ACF fields
$expected_outcome = get_field('expected_outcome');
$pain_points = get_field('pain_points');
$time_saved_min = get_field('time_saved_min');
$difficulty_without_ai = get_field('difficulty_without_ai');
$summary = get_field('summary');

// Only show if we have at least one key field
if (!$expected_outcome && !$summary) {
    return;
}

// Map difficulty to labels
$difficulty_labels = [
    '1' => 'Very Easy',
    '2' => 'Easy',
    '3' => 'Medium',
    '4' => 'Hard',
    '5' => 'Very Hard'
];
$difficulty_label = isset($difficulty_labels[$difficulty_without_ai]) ? $difficulty_labels[$difficulty_without_ai] : '';

// Format time saved
$time_display = '';
if ($time_saved_min) {
    if ($time_saved_min >= 60) {
        $hours = floor($time_saved_min / 60);
        $mins = $time_saved_min % 60;
        $time_display = $hours . 'h' . ($mins > 0 ? ' ' . $mins . 'min' : '');
    } else {
        $time_display = $time_saved_min . ' min';
    }
}
?>

<section class="pf-hero-value" role="region" aria-label="Workflow Value Proposition">
    <div class="pf-hero-value-inner">
        
        <!-- Primary Value -->
        <div class="pf-hero-primary">
            <!-- Expected Outcome (What you'll create) -->
            <?php if ($expected_outcome): ?>
                <div class="pf-hero-outcome">
                    <svg class="pf-hero-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <div class="pf-hero-outcome-content">
                        <span class="pf-hero-kicker">What you'll create</span>
                        <h2 class="pf-hero-outcome-text"><?php echo esc_html($expected_outcome); ?></h2>
                        
                        <!-- Pain Points (visible as chips) -->
                        <?php if ($pain_points): ?>
                            <?php 
                            // Convert line breaks to array (max 4 pain points for visual clarity)
                            $pain_points_lines = array_filter(array_map('trim', explode("\n", $pain_points)));
                            $pain_points_display = array_slice($pain_points_lines, 0, 4); // Limit to 4
                            if (!empty($pain_points_display)): ?>
                                <div class="pf-pain-chips">
                                    <span class="pf-pain-label">Solves:</span>
                                    <?php foreach ($pain_points_display as $point): ?>
                                        <span class="pf-pain-chip">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                            <?php echo esc_html($point); ?>
                                        </span>
                                    <?php endforeach; ?>
                                </div>
                            <?php endif; ?>
                        <?php endif; ?>
                    </div>
                </div>
            <?php endif; ?>
        </div>

        <!-- Benefits Grid -->
        <?php if ($time_saved_min || $difficulty_without_ai): ?>
            <div class="pf-hero-benefits">
                <?php if ($time_saved_min): ?>
                    <div class="pf-benefit pf-benefit--time">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                            <polyline points="17 6 23 6 23 12"></polyline>
                        </svg>
                        <div class="pf-benefit-content">
                            <span class="pf-benefit-label">Time saved</span>
                            <strong class="pf-benefit-value"><?php echo esc_html($time_display); ?></strong>
                        </div>
                    </div>
                <?php endif; ?>

                <?php if ($difficulty_without_ai && $difficulty_label): ?>
                    <div class="pf-benefit pf-benefit--difficulty">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                        </svg>
                        <div class="pf-benefit-content">
                            <span class="pf-benefit-label">Without AI</span>
                            <strong class="pf-benefit-value"><?php echo esc_html($difficulty_label); ?></strong>
                        </div>
                    </div>
                <?php endif; ?>
            </div>
        <?php endif; ?>

        <!-- Summary (Expandable, optional details) -->
        <?php if ($summary): ?>
            <details class="pf-hero-details">
                <summary class="pf-hero-details-trigger">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    <span>About this workflow</span>
                    <svg class="pf-hero-details-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </summary>
                <div class="pf-hero-details-content">
                    <p><?php echo nl2br(esc_html($summary)); ?></p>
                </div>
            </details>
        <?php endif; ?>

    </div>
</section>


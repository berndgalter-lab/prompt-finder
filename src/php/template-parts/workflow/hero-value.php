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
$access_mode = get_field('access_mode') ?: 'free'; // Default to 'free'
$steps = get_field('steps') ?: [];
$estimated_time_min = get_field('estimated_time_min');

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

// Dynamic CTA configuration based on access_mode
$cta_config = [
    'free' => [
        'text' => 'Start Free Workflow',
        'url' => '#variables',
        'icon' => '→',
        'class' => 'pf-btn-hero--free',
        'note' => 'No sign-up required',
        'scroll' => true
    ],
    'signin' => [
        'text' => 'Sign In to Start',
        'url' => wp_login_url(get_permalink()),
        'icon' => '🔓',
        'class' => 'pf-btn-hero--signin',
        'note' => 'Free account required',
        'scroll' => false
    ],
    'pro' => [
        'text' => 'Upgrade to Pro',
        'url' => home_url('/pricing'),
        'icon' => '⭐',
        'class' => 'pf-btn-hero--pro',
        'note' => 'Unlock all workflow steps',
        'scroll' => false
    ]
];

// Get CTA config for current access_mode (fallback to 'free')
$cta = $cta_config[$access_mode] ?? $cta_config['free'];

// Real Stats (Steps, Time, Access Mode label)
$step_count = count($steps);
$access_labels = [
    'free' => 'Free forever',
    'signin' => 'Sign-in required',
    'pro' => 'Pro only'
];
$access_label = $access_labels[$access_mode] ?? 'Free';
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

        <!-- Dynamic CTA Button (Deploy 3) -->
        <div class="pf-hero-cta">
            <a href="<?php echo esc_url($cta['url']); ?>" 
               class="pf-btn-hero <?php echo esc_attr($cta['class']); ?>"
               <?php if ($cta['scroll']): ?>
               data-scroll-to="variables"
               <?php endif; ?>>
                <?php echo esc_html($cta['text']); ?>
                <span class="pf-btn-icon"><?php echo $cta['icon']; ?></span>
            </a>
            <span class="pf-hero-cta-note"><?php echo esc_html($cta['note']); ?></span>
        </div>

        <!-- Real Workflow Stats (Deploy 3) -->
        <div class="pf-hero-real-stats">
            <?php if ($step_count > 0): ?>
                <div class="pf-real-stat">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <div class="pf-benefit-content">
                        <span class="pf-benefit-label"><?php echo $step_count === 1 ? 'Step' : 'Steps'; ?></span>
                        <strong class="pf-benefit-value"><?php echo esc_html($step_count); ?></strong>
                    </div>
                </div>
            <?php endif; ?>

            <?php if ($estimated_time_min): ?>
                <div class="pf-real-stat">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <div class="pf-benefit-content">
                        <span class="pf-benefit-label">To complete</span>
                        <strong class="pf-benefit-value"><?php echo esc_html($estimated_time_min); ?> min</strong>
                    </div>
                </div>
            <?php endif; ?>

            <div class="pf-real-stat">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <?php if ($access_mode === 'free'): ?>
                        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>
                        <path d="m9 12 2 2 4-4"/>
                    <?php elseif ($access_mode === 'signin'): ?>
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                    <?php else: ?>
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    <?php endif; ?>
                </svg>
                <div class="pf-benefit-content">
                    <span class="pf-benefit-label">Access</span>
                    <strong class="pf-benefit-value"><?php echo esc_html($access_label); ?></strong>
                </div>
            </div>
        </div>

        <!-- Trust Badges (Deploy 3) -->
        <div class="pf-hero-trust">
            <span class="pf-trust-label">Works with:</span>
            <div class="pf-trust-badges">
                <span class="pf-trust-badge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                        <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                    ChatGPT
                </span>
                <span class="pf-trust-badge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                        <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                    Claude
                </span>
            </div>
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


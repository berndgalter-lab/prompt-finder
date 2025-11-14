<?php
/**
 * Workflow Template Part: Hero Value Proposition (Restructured)
 * 
 * PSYCHOLOGY-DRIVEN HIERARCHY FOR FIRST-TIME USERS:
 * 1. VALUE PROP (First 3 seconds) - What is this?
 * 2. CTA (Next 5 seconds) - What should I do?
 * 3. TRUST SIGNALS (Next 5 seconds) - Can I trust this?
 * 4. DETAILS (Expandable) - Tell me more
 * 
 * @package GeneratePress_Child
 * @since 2.0.0 (Deploy 3 - Million-Dollar Startup Edition)
 */

// Security: Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Get ACF fields
$tagline = get_field('tagline');
$expected_outcome = get_field('expected_outcome');
$pain_points = get_field('pain_points');
$time_saved_min = get_field('time_saved_min');
$difficulty_without_ai = get_field('difficulty_without_ai');
$summary = get_field('summary');
$access_mode = get_field('access_mode') ?: 'free';
$steps = get_field('steps') ?: [];
$estimated_time_min = get_field('estimated_time_min');

// Only show if we have at least one key field
if (!$tagline && !$expected_outcome && !$summary) {
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
// Strategy: "Try First" → alle Modi zeigen Step 1 zuerst (SEO/Engagement)
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
        'text' => 'Try Free Step 1',
        'url' => '#variables',
        'icon' => '→',
        'class' => 'pf-btn-hero--try-first',
        'note' => 'Sign in free to unlock remaining steps',
        'scroll' => true
    ],
    'pro' => [
        'text' => 'Try Free Step 1',
        'url' => '#variables',
        'icon' => '→',
        'class' => 'pf-btn-hero--try-first',
        'note' => 'Upgrade to Pro to unlock all steps',
        'scroll' => true
    ]
];

$cta = $cta_config[$access_mode] ?? $cta_config['free'];

// Smart CTA: Wenn User bereits Zugang hat, ändere Text
$user_has_access = false;
if ($access_mode === 'signin' && is_user_logged_in()) {
    $user_has_access = true;
    $cta['text'] = 'Start Workflow';
    $cta['note'] = 'All steps unlocked';
    $cta['class'] = 'pf-btn-hero--free';
}
if ($access_mode === 'pro' && function_exists('user_has_pro_subscription') && user_has_pro_subscription()) {
    $user_has_access = true;
    $cta['text'] = 'Start Workflow';
    $cta['note'] = 'All steps unlocked';
    $cta['class'] = 'pf-btn-hero--free';
}

// Real Stats
$step_count = count($steps);
$access_labels = [
    'free' => 'Free forever',
    'signin' => 'Sign-in required',
    'pro' => 'Pro only'
];
$access_label = $access_labels[$access_mode] ?? 'Free';
?>

<section class="pf-hero-value pf-hero-value--restructured" role="region" aria-label="Workflow Value Proposition">
    <div class="pf-hero-value-inner">
        
        <!-- ========================================
             1. CONTEXT + VALUE PROPOSITION (First 3 seconds)
             "What is this? Why should I care?"
             ======================================== -->
        <div class="pf-hero-primary">
            <!-- Context Badge (for First-Time Users) -->
            <div class="pf-hero-context-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
                Ready-to-Use AI Workflow
                <?php if ($access_mode === 'pro' && !$user_has_access): ?>
                    <span class="pf-inline-access-badge pf-inline-access-badge--pro">💎 Pro</span>
                <?php endif; ?>
            </div>
            
            <!-- Value Proposition (Tagline) -->
            <?php if ($tagline): ?>
                <h2 class="pf-hero-headline"><?php echo esc_html($tagline); ?></h2>
            <?php endif; ?>
            
            <!-- Expected Outcome (What you'll create) -->
            <?php if ($expected_outcome): ?>
                <p class="pf-hero-subline">
                    <svg class="pf-hero-subline-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <?php echo esc_html($expected_outcome); ?>
                </p>
            <?php endif; ?>

            <!-- Pain Points (Problems it solves) -->
            <?php if ($pain_points): ?>
                <?php 
                $pain_points_lines = array_filter(array_map('trim', explode("\n", $pain_points)));
                $pain_points_display = array_slice($pain_points_lines, 0, 3); // Max 3 für Hero
                if (!empty($pain_points_display)): ?>
                    <div class="pf-hero-pain-section">
                        <p class="pf-hero-pain-label">This workflow is for you if…</p>
                        <ul class="pf-hero-pain-list">
                            <?php foreach ($pain_points_display as $point): ?>
                                <li><?php echo esc_html($point); ?></li>
                            <?php endforeach; ?>
                        </ul>
                        <?php if ($time_saved_min): ?>
                            <p class="pf-hero-pain-benefit">
                                Saves ~<?php echo esc_html($time_display); ?> every time you run it
                            </p>
                        <?php endif; ?>
                    </div>
                <?php endif; ?>
            <?php endif; ?>
        </div>

        <!-- ========================================
             2. CALL-TO-ACTION (Next 5 seconds)
             "What should I do?"
             ======================================== -->
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

        <!-- ========================================
             3. HOW IT WORKS (Quick Process Overview)
             "How do I use this?"
             ======================================== -->
        <div class="pf-hero-how-it-works">
            <span class="pf-how-it-works-label">How it works:</span>
            <span class="pf-how-it-works-steps">
                1️⃣ Fill fields → 2️⃣ Copy prompt → 3️⃣ Paste into ChatGPT
            </span>
        </div>

        <!-- ========================================
             4. TRUST SIGNALS (Next 10 seconds)
             "Can I trust this?"
             ======================================== -->
        <div class="pf-hero-trust-row">
            <!-- Trust Badges -->
            <div class="pf-hero-trust">
                <span class="pf-trust-label">Works with:</span>
                <div class="pf-trust-badges">
                    <span class="pf-trust-badge">ChatGPT</span>
                    <span class="pf-trust-badge">Claude</span>
                    <span class="pf-trust-badge">Gemini</span>
                    <span class="pf-trust-badge">Grok</span>
                </div>
            </div>
        </div>

        <!-- ========================================
             5. DETAILS (Expandable - After 20 seconds)
             "Tell me more"
             ======================================== -->
        <?php if ($pain_points || $time_saved_min || $difficulty_without_ai || $summary): ?>
            <details class="pf-hero-details">
                <summary class="pf-hero-details-trigger">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    <span>What does this workflow solve?</span>
                    <svg class="pf-hero-details-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </summary>
                
                <div class="pf-hero-details-content">
                    <!-- Pain Points -->
                        <?php if ($pain_points): ?>
                            <?php 
                            $pain_points_lines = array_filter(array_map('trim', explode("\n", $pain_points)));
                        $pain_points_display = array_slice($pain_points_lines, 0, 4);
                            if (!empty($pain_points_display)): ?>
                            <div class="pf-details-section">
                                <h3 class="pf-details-heading">Problems it solves:</h3>
                                <div class="pf-pain-chips">
                                    <?php foreach ($pain_points_display as $point): ?>
                                        <span class="pf-pain-chip">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                            <?php echo esc_html($point); ?>
                                        </span>
                                    <?php endforeach; ?>
                                </div>
                            </div>
                        <?php endif; ?>
            <?php endif; ?>

                    <!-- Benefits (Time Saved, Difficulty) -->
        <?php if ($time_saved_min || $difficulty_without_ai): ?>
                        <div class="pf-details-section">
                            <h3 class="pf-details-heading">Additional benefits:</h3>
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
            </div>
        <?php endif; ?>

                    <!-- Summary -->
        <?php if ($summary): ?>
                        <div class="pf-details-section">
                            <h3 class="pf-details-heading">About this workflow:</h3>
                            <p class="pf-details-text"><?php echo nl2br(esc_html($summary)); ?></p>
                        </div>
                    <?php endif; ?>
                </div>
            </details>
        <?php endif; ?>

    </div>
</section>

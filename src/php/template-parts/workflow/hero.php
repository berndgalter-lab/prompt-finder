<?php
/**
 * Workflow Template Part: Modern Hero Section
 * 
 * Full-width hero section combining breadcrumb, metadata, headline, and CTA
 * Replaces old header.php + hero-value.php structure
 * 
 * @package GeneratePress_Child
 * @since 3.0.0 (Hero Refactoring)
 */

// Security: Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// ====================================
// GET ALL DATA (from existing templates)
// ====================================

$post_id = get_the_ID();
$post_title = get_the_title();

// ACF Fields
$workflow_id_field = get_field('workflow_id');
$tagline = get_field('tagline');
$best_for = get_field('best_for');
$expected_outcome = get_field('expected_outcome');
$pain_points = get_field('pain_points');
$time_saved_min = get_field('time_saved_min');
$estimated_time_min = get_field('estimated_time_min');
$steps = get_field('steps') ?: [];
$version_field = get_field('version');

// Only show if we have at least one key field
if (!$tagline && !$expected_outcome) {
    return;
}

// Access Mode
$access_mode = pf_workflow_mode($post_id);
$access_labels = [
    'free' => 'Free',
    'signin' => 'Sign-in',
    'pro' => 'Pro'
];
$access_label = $access_labels[$access_mode] ?? 'Free';

// Steps & Time
$step_count = count($steps);
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

// CTA Configuration
$cta_config = [
    'free' => [
        'text' => 'Start Free Workflow',
        'url' => '#variables',
        'icon' => '→',
        'note' => 'All steps are free – just start with Step 1.'
    ],
    'signin' => [
        'text' => 'Try Free Step 1',
        'url' => '#variables',
        'icon' => '→',
        'note' => 'Step 1 is free. Create a free account (no credit card) to unlock ' . ($step_count > 0 ? 'all ' . $step_count . ' steps' : 'remaining steps') . '.'
    ],
    'pro' => [
        'text' => 'Try Free Step 1',
        'url' => '#variables',
        'icon' => '→',
        'note' => 'Step 1 is free. Upgrade to Prompt Finder Pro to unlock all steps.'
    ]
];

$cta = $cta_config[$access_mode] ?? $cta_config['free'];

// Smart CTA: User bereits Zugang?
if ($access_mode === 'signin' && is_user_logged_in()) {
    $cta['text'] = 'Start Workflow';
    $cta['note'] = 'All steps unlocked';
}
if ($access_mode === 'pro' && function_exists('user_has_pro_subscription') && user_has_pro_subscription()) {
    $cta['text'] = 'Start Workflow';
    $cta['note'] = 'All steps unlocked';
}

// Breadcrumb
$workflow_archive_link = get_post_type_archive_link('workflows') ?: home_url('/');
$breadcrumb_category = null;
$breadcrumb_terms = get_the_terms($post_id, 'workflow_category') ?: get_the_terms($post_id, 'category');
if (!empty($breadcrumb_terms) && !is_wp_error($breadcrumb_terms)) {
    $breadcrumb_category = $breadcrumb_terms[0];
}

// Breadcrumb Label: Use custom label if set, otherwise post title
$breadcrumb_label = get_field('breadcrumb_label', $post_id);
$breadcrumb_current = !empty($breadcrumb_label) ? $breadcrumb_label : $post_title;

// Pain Points Processing
$pain_points_lines = array_filter(array_map('trim', explode("\n", $pain_points)));
$pain_points_display = array_slice($pain_points_lines, 0, 3);

?>

<section class="pf-hero">
    <div class="pf-hero__inner">

        <!-- Context Block (top) -->
        <div class="pf-hero__context">

            <!-- Breadcrumbs -->
            <nav class="pf-hero__breadcrumbs" aria-label="Breadcrumb">
                <a href="<?php echo esc_url($workflow_archive_link); ?>">Workflows</a>
                <?php if ($breadcrumb_category): ?>
                    <span class="pf-hero__breadcrumbs-separator">/</span>
                    <a href="<?php echo esc_url(get_term_link($breadcrumb_category)); ?>"><?php echo esc_html($breadcrumb_category->name); ?></a>
                <?php endif; ?>
                <span class="pf-hero__breadcrumbs-separator">/</span>
                <span class="pf-hero__breadcrumbs-current"><?php echo esc_html($breadcrumb_current); ?></span>
            </nav>

            <!-- Meta: Access · Steps · Duration · Workflow ID -->
            <div class="pf-hero__meta">
                <span class="pf-hero__meta-badge pf-hero__meta-badge--<?php echo esc_attr($access_mode); ?>">
                    <?php echo esc_html($access_label); ?>
                </span>
                <span class="pf-hero__meta-separator">·</span>
                <span class="pf-hero__meta-item">
                    <?php echo esc_html($step_count > 0 ? $step_count : '0'); ?> <?php echo $step_count === 1 ? 'step' : 'steps'; ?>
                </span>
                <span class="pf-hero__meta-separator">·</span>
                <span class="pf-hero__meta-item">
                    ~<?php echo esc_html($estimated_time_min ? $estimated_time_min : '5'); ?> min
                </span>
                <?php if ($workflow_id_field): ?>
                    <span class="pf-hero__meta-separator">·</span>
                    <span class="pf-hero__meta-item pf-hero__meta-item--id">
                        <?php echo esc_html($workflow_id_field); ?>
                    </span>
                <?php endif; ?>
            </div>

        </div>

        <!-- Two-Column Layout: Story (left) + Action (right) -->
        <div class="pf-hero__columns">

            <!-- Left Column: Story / Explanation -->
            <div class="pf-hero__story">

                <!-- Label Row -->
                <div class="pf-hero__label-row">
                    <span class="pf-hero__label">READY-TO-USE AI WORKFLOW</span>
                </div>

                <!-- H1 Headline (Post Title) -->
                <h1 class="pf-hero__headline">
                    <?php echo esc_html($post_title); ?>
                </h1>

                <!-- Tagline (optional) -->
                <?php if ($tagline): ?>
                    <p class="pf-hero__tagline">
                        <?php echo esc_html($tagline); ?>
                    </p>
                <?php endif; ?>

                <!-- Outcome (optional) -->
                <?php if ($expected_outcome): ?>
                    <p class="pf-hero__outcome">
                        <strong>Outcome:</strong> <?php echo esc_html($expected_outcome); ?>
                    </p>
                <?php endif; ?>

                <!-- Best for (optional) -->
                <?php if ($best_for): ?>
                    <p class="pf-hero__best-for">
                        <strong>Best for:</strong> <?php echo esc_html($best_for); ?>
                    </p>
                <?php endif; ?>

                <!-- Pain Points -->
                <?php if (!empty($pain_points_display)): ?>
                    <div class="pf-hero__pain">
                        <h2 class="pf-hero__pain-title">This workflow is for you if…</h2>
                        <ul class="pf-hero__pain-list">
                            <?php foreach ($pain_points_display as $point): ?>
                                <li><?php echo esc_html($point); ?></li>
                            <?php endforeach; ?>
                        </ul>
                    </div>
                <?php endif; ?>

                <!-- Saved Time -->
                <?php if ($time_saved_min): ?>
                    <p class="pf-hero__saved-time">
                        Saves ~<?php echo esc_html($time_display); ?> every time you run it
                    </p>
                <?php endif; ?>

            </div>

            <!-- Right Column: Action / Quick Start -->
            <div class="pf-hero__action">

                <!-- CTA Button -->
                <a href="<?php echo esc_url($cta['url']); ?>" 
                   class="pf-hero__cta-button"
                   data-scroll-to="variables">
                    <?php echo esc_html($cta['text']); ?>
                    <span class="pf-hero__cta-icon"><?php echo $cta['icon']; ?></span>
                </a>

                <!-- Access Note -->
                <p class="pf-hero__cta-note"><?php echo esc_html($cta['note']); ?></p>

                <!-- How it works -->
                <div class="pf-hero__how-works">
                    <strong>How it works:</strong>
                    <ol class="pf-hero__how-works-list">
                        <li>Fill fields</li>
                        <li>Copy prompt</li>
                        <li>Paste into ChatGPT</li>
                    </ol>
                </div>

                <!-- Works with -->
                <div class="pf-hero__works-with">
                    <p class="pf-hero__works-with-label"><strong>Works with:</strong></p>
                    <div class="pf-hero__works-with-badges">
                        <span class="pf-hero__works-with-badge">ChatGPT</span>
                        <span class="pf-hero__works-with-badge">Claude</span>
                        <span class="pf-hero__works-with-badge">Gemini</span>
                        <span class="pf-hero__works-with-badge">Grok</span>
                    </div>
                </div>

            </div>

        </div>

    </div>
</section>


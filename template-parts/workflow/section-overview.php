<?php
/**
 * Workflow Template Part: Overview Section
 * 
 * Displays summary, use case badge, and metrics grid
 * 
 * @package GeneratePress_Child
 */

// Security: Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Get ACF fields
$summary = get_field('summary');
$use_case = get_field('use_case');
$estimated_time_min = get_field('estimated_time_min');
$time_saved_min = get_field('time_saved_min');
$difficulty_without_ai = get_field('difficulty_without_ai');
$pain_points = get_field('pain_points');
$expected_outcome = get_field('expected_outcome');

// Helper: Map difficulty (1-5) to text
$difficulty_text_map = [
    '1' => 'Very Low',
    '2' => 'Low',
    '3' => 'Medium',
    '4' => 'High',
    '5' => 'Very High'
];
$difficulty_text = isset($difficulty_text_map[$difficulty_without_ai]) 
    ? $difficulty_text_map[$difficulty_without_ai] 
    : 'Unknown';
$difficulty_numeric = intval($difficulty_without_ai);
if ($difficulty_numeric < 1) $difficulty_numeric = 3; // Default to Medium
if ($difficulty_numeric > 5) $difficulty_numeric = 5;

// Build difficulty stars display (compact)
$difficulty_stars = '';
for ($i = 1; $i <= 5; $i++) {
    $difficulty_stars .= ($i <= $difficulty_numeric) ? '★' : '☆';
}
?>

<!-- pf:overview START -->
<?php $post_id = get_the_ID(); ?>
<section id="overview" class="pf-section pf-section--overview" data-post-id="<?php echo esc_attr($post_id); ?>">
    
    <header class="pf-overview-header">
        <h2 class="pf-section-heading">Overview</h2>
        
        <button 
            class="pf-overview-toggle" 
            type="button" 
            aria-expanded="true"
            data-action="toggle-overview">
            Hide overview
        </button>
    </header>

    <div class="pf-overview-body">
        
        <!-- Key KPIs / Visualize (kompakt) -->
        <?php if (!empty($estimated_time_min) || (!empty($time_saved_min) && $time_saved_min > 0) || !empty($difficulty_without_ai)): ?>
            <ul class="pf-kpis" role="list">
                <?php if (!empty($estimated_time_min)): ?>
                    <li class="pf-kpi">
                        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 6v6l4 2"/>
                        </svg>
                        <span class="pf-kpi-label">Time</span>
                        <span class="pf-kpi-value"><?php echo esc_html($estimated_time_min); ?> min</span>
                    </li>
                <?php endif; ?>
                
                <?php if (!empty($time_saved_min) && $time_saved_min > 0): ?>
                    <li class="pf-kpi">
                        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                        </svg>
                        <span class="pf-kpi-label">Saves</span>
                        <span class="pf-kpi-value">~<?php echo esc_html($time_saved_min); ?> min</span>
                    </li>
                <?php endif; ?>

                <?php if (!empty($difficulty_without_ai)): ?>
                    <li class="pf-kpi">
                        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        <span class="pf-kpi-label">Difficulty</span>
                        <span class="pf-kpi-value"><?php echo esc_html($difficulty_stars); ?></span>
                    </li>
                <?php endif; ?>
            </ul>
        <?php endif; ?>

        <!-- SUMMARY: wieder sichtbar ÜBER den beiden Blöcken -->
        <div class="pf-overview-stack">
            <?php if (!empty($summary)): ?>
                <div class="pf-overview-summary-block">
                    <p class="pf-overview-summary">
                        <?php echo wp_kses_post($summary); ?>
                    </p>
                </div>
            <?php endif; ?>

            <!-- Zwei Spalten: Problem & What you'll get -->
            <?php if (!empty($pain_points) || !empty($expected_outcome)): ?>
                <div class="pf-overview-split">
                    <?php if (!empty($pain_points)): ?>
                        <section class="pf-overview-block">
                            <h3 class="pf-overview-sub">Problem this solves</h3>
                            <div class="pf-overview-text">
                                <?php echo wp_kses_post($pain_points); ?>
                            </div>
                        </section>
                    <?php endif; ?>

                    <?php if (!empty($expected_outcome)): ?>
                        <section class="pf-overview-block">
                            <h3 class="pf-overview-sub">What you'll get</h3>
                            <div class="pf-overview-text">
                                <?php echo wp_kses_post($expected_outcome); ?>
                            </div>
                        </section>
                    <?php endif; ?>
                </div>
            <?php endif; ?>
        </div>

        <!-- Optional: Use Case als kleine Pill (falls du den bereits nutzt) -->
        <?php if (!empty($use_case)): ?>
            <div class="pf-usecase">
                <span><?php echo esc_html($use_case); ?></span>
            </div>
        <?php endif; ?>

    </div>
    
</section>
<!-- pf:overview END -->

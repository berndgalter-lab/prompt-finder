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
        <button 
            class="pf-overview-toggle" 
            type="button" 
            aria-expanded="true"
            data-action="toggle-overview">
            Hide overview
        </button>
    </header>

    <div class="pf-overview-body">
        <div class="pf-overview-card">
            <?php if (!empty($summary)): ?>
                <div class="pf-overview-summary">
                    <?php echo wp_kses_post($summary); ?>
                </div>
            <?php endif; ?>

            <?php if (!empty($pain_points) || !empty($expected_outcome)): ?>
                <div class="pf-overview-grid">
                    <?php if (!empty($pain_points)): ?>
                        <section class="pf-overview-block pf-overview-block--problem">
                            <h3>Problem this solves</h3>
                            <div class="pf-overview-text">
                                <?php echo wp_kses_post($pain_points); ?>
                            </div>
                        </section>
                    <?php endif; ?>

                    <?php if (!empty($expected_outcome)): ?>
                        <section class="pf-overview-block pf-overview-block--outcome">
                            <h3>What you'll get</h3>
                            <div class="pf-overview-text">
                                <?php echo wp_kses_post($expected_outcome); ?>
                            </div>
                        </section>
                    <?php endif; ?>
                </div>
            <?php endif; ?>
        </div>
    </div>
    
</section>
<!-- pf:overview END -->

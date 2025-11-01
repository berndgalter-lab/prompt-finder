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

            <?php
              // Robust Werte beziehen (verwende bestehende Vars, sonst ACF-Fallback)
              $PF_DIFFICULTY = isset($difficulty_stars) ? $difficulty_stars : '';
              if (!$PF_DIFFICULTY) { $PF_DIFFICULTY = get_field('difficulty_stars') ?: get_field('difficulty') ?: ''; }

              $PF_SAVES = isset($time_saved_min) ? ($time_saved_min > 0 ? "~{$time_saved_min} min/run" : '') : '';
              if (!$PF_SAVES) { 
                $saves_field = get_field('saved_time') ?: get_field('time_saved_min') ?: get_field('saves');
                if ($saves_field) {
                  $saves_num = is_numeric($saves_field) ? intval($saves_field) : 0;
                  $PF_SAVES = $saves_num > 0 ? "~{$saves_num} min/run" : '';
                }
              }
            ?>
            <div class="pf-overview-metrics" role="group" aria-label="Workflow impact">
              <div class="pf-metric pf-metric--difficulty">
                <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.86L12 17.77 5.82 21l1.18-6.86L2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <div class="pf-metric-body">
                  <div class="pf-metric-line">
                    <span class="pf-metric-label">Without AI</span>
                    <span class="pf-metric-value"><?php echo esc_html($PF_DIFFICULTY ?: '★★★☆☆'); ?></span>
                  </div>
                  <p class="pf-metric-hint">Mehr manuelle Recherche, Kopieren/Einfügen & Trial-and-Error.</p>
                </div>
              </div>

              <div class="pf-metric pf-metric--saved" <?php if ($PF_SAVES) : ?> data-saves-per-run="<?php echo esc_attr($PF_SAVES); ?>"<?php endif; ?>>
                <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                </svg>
                <div class="pf-metric-body">
                  <div class="pf-metric-line">
                    <span class="pf-metric-label">Time saved</span>
                    <span class="pf-metric-value"><?php echo esc_html($PF_SAVES ?: '~5 min/run'); ?></span>
                  </div>
                  <p class="pf-metric-hint">Jeder Durchlauf spart Zeit — das summiert sich spürbar.</p>
                </div>
              </div>
            </div>

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

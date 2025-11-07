<?php
/**
 * Workflow Template Part: Header
 * 
 * Modern SAAS-style header with progress bar, title, meta chips, and actions
 * 
 * @package GeneratePress_Child
 * @var array $args - Available variables passed from parent template
 */

// Security: Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Get ACF fields
$workflow_id_field = get_field('workflow_id');
$tagline_field = get_field('tagline');
$version_field = get_field('version');
$estimated_time_min_field = get_field('estimated_time_min');
$steps_field = get_field('steps');
$total_steps = is_array($steps_field) ? count($steps_field) : 0;

// Get post title and ID
$post_title = get_the_title();
$post_id = get_the_ID();

// Get access mode using helper
$access_mode = pf_workflow_mode($post_id);

// Build breadcrumb trail
$workflow_archive_link = get_post_type_archive_link('workflows');
$workflow_archive_link = $workflow_archive_link ? $workflow_archive_link : home_url('/');
$breadcrumb_category = null;
$breadcrumb_terms = get_the_terms($post_id, 'workflow_category');
if (empty($breadcrumb_terms) || is_wp_error($breadcrumb_terms)) {
    $breadcrumb_terms = get_the_terms($post_id, 'category');
}
if (!empty($breadcrumb_terms) && !is_wp_error($breadcrumb_terms)) {
    $breadcrumb_category = $breadcrumb_terms[0];
}

$start_timestamp = current_time('timestamp');
$initial_step_number = $total_steps > 0 ? 1 : 0;
$initial_progress_percent = 0;
?>

<nav class="pf-breadcrumb-wrapper" aria-label="Breadcrumb">
    <div class="pf-breadcrumb">
        <a href="<?php echo esc_url($workflow_archive_link); ?>">Workflows</a>
        <?php if ($breadcrumb_category): ?>
            <span class="pf-breadcrumb-separator">/</span>
            <a href="<?php echo esc_url(get_term_link($breadcrumb_category)); ?>"><?php echo esc_html($breadcrumb_category->name); ?></a>
        <?php endif; ?>
        <span class="pf-breadcrumb-separator">/</span>
        <span class="pf-breadcrumb-current"><?php echo esc_html($post_title); ?></span>
    </div>
</nav>

<header class="pf-workflow-header" role="banner" aria-label="Workflow Header">

    <div class="pf-header-content">
        <div class="pf-header-main">
            <h1 class="pf-header-title"><?php echo esc_html($post_title); ?></h1>
            <?php if (!empty($tagline_field)): ?>
                <p class="pf-header-tagline"><?php echo esc_html($tagline_field); ?></p>
            <?php endif; ?>
        </div>

        <div class="pf-header-meta-compact">
            <?php if (!empty($estimated_time_min_field)): ?>
                <span class="pf-meta-chip"><?php echo esc_html($estimated_time_min_field); ?> min</span>
            <?php endif; ?>

            <?php if ($total_steps > 0): ?>
                <span class="pf-meta-chip"><?php echo esc_html($total_steps); ?> <?php echo $total_steps === 1 ? 'step' : 'steps'; ?></span>
            <?php endif; ?>

            <?php if (!empty($version_field)): ?>
                <span class="pf-meta-chip">v<?php echo esc_html($version_field); ?></span>
            <?php endif; ?>
        </div>
    </div>

    <div class="pf-progress-hero" data-workflow-start="<?php echo esc_attr($start_timestamp); ?>">
        <div class="pf-progress-info">
            <h2 class="pf-progress-title" data-progress-step>Step <?php echo esc_html($initial_step_number); ?> of <?php echo esc_html($total_steps); ?></h2>
            <span class="pf-progress-time">Started <span data-time-elapsed>just now</span></span>
            <span class="pf-progress-summary pf-sr-only" data-progress-summary>0 of <?php echo esc_html($total_steps); ?> steps completed</span>
        </div>
        <div class="pf-progress-bar-hero" role="progressbar" aria-valuenow="<?php echo esc_attr($initial_progress_percent); ?>" aria-valuemin="0" aria-valuemax="100">
            <div class="pf-progress-fill-hero" style="width: <?php echo esc_attr($initial_progress_percent); ?>%" data-progress-fill>
                <span class="pf-progress-label" data-progress-label><?php echo esc_html($initial_progress_percent); ?>%</span>
            </div>
        </div>
    </div>
</header>

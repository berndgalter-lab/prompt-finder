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
$access_mode = get_field('access_mode'); // 'free', 'signin', or 'pro'

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

            <div class="pf-header-meta-compact">
                <?php if (!empty($access_mode)): ?>
                    <?php
                    $access_labels = [
                        'free' => 'Free',
                        'signin' => 'Sign-In',
                        'pro' => 'Pro'
                    ];
                    $access_label = isset($access_labels[$access_mode]) ? $access_labels[$access_mode] : ucfirst($access_mode);
                    ?>
                    <span class="pf-meta-chip pf-meta-chip--access pf-meta-chip--access-<?php echo esc_attr($access_mode); ?>">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
                        <?php echo esc_html($access_label); ?>
                    </span>
                <?php endif; ?>

                <?php if (!empty($estimated_time_min_field)): ?>
                    <span class="pf-meta-chip pf-meta-chip--time">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <?php echo esc_html($estimated_time_min_field); ?> min
                    </span>
                <?php endif; ?>

                <?php if ($total_steps > 0): ?>
                    <span class="pf-meta-chip"><?php echo esc_html($total_steps); ?> <?php echo $total_steps === 1 ? 'step' : 'steps'; ?></span>
                <?php endif; ?>

                <?php if (!empty($version_field)): ?>
                    <span class="pf-meta-chip"><?php echo esc_html($version_field); ?></span>
                <?php endif; ?>
            </div>
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

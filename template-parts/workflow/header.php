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
?>

<header class="pf-workflow-header" role="banner" aria-label="Workflow Header">
    
    <!-- Progress Bar (Fixed Top) -->
    <div class="pf-progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" aria-label="Workflow Progress">
        <div class="pf-progress-fill" data-progress="0"></div>
    </div>
    
    <!-- Header Content (Sticky) -->
    <div class="pf-header-content">
        
        <!-- Title Section -->
        <div class="pf-header-title-section">
            <div class="pf-header-title-row">
                <h1 class="pf-header-title">
                    <?php echo esc_html($post_title); ?>
                    <?php if (!empty($workflow_id_field)): ?>
                        <span class="pf-header-id"><?php echo esc_html($workflow_id_field); ?></span>
                    <?php endif; ?>
                </h1>
                
                <div class="pf-header-actions">
                    <button class="pf-action-btn pf-action-btn--favorite" 
                            type="button" 
                            aria-label="Add to favorites"
                            data-action="toggle-favorite">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                    </button>
                    
                    <button class="pf-action-btn pf-action-btn--share" 
                            type="button" 
                            aria-label="Share workflow"
                            data-action="share">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="18" cy="5" r="3"/>
                            <circle cx="6" cy="12" r="3"/>
                            <circle cx="18" cy="19" r="3"/>
                            <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/>
                        </svg>
                    </button>
                    
                    <button class="pf-action-btn pf-action-btn--primary pf-action-btn--reset" 
                            type="button" 
                            aria-label="Reset progress"
                            data-action="reset-progress">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 4v6h6M23 20v-6h-6"/>
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M20.5 14a9 9 0 0 1-14.85 3.36L1 14"/>
                        </svg>
                        <span>Reset</span>
                    </button>
                </div>
            </div>
            
            <?php if (!empty($tagline_field)): ?>
                <p class="pf-header-tagline"><?php echo esc_html($tagline_field); ?></p>
            <?php endif; ?>
        </div>
        
        <!-- Meta Chips -->
        <div class="pf-header-meta">
            <?php if (!empty($estimated_time_min_field)): ?>
                <div class="pf-meta-chip pf-meta-chip--time">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                    </svg>
                    <span class="pf-meta-chip-text"><?php echo esc_html($estimated_time_min_field); ?> min</span>
                </div>
            <?php endif; ?>
            
            <?php if ($total_steps > 0): ?>
                <div class="pf-meta-chip pf-meta-chip--steps">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="5 9 2 12 5 15"/>
                        <polyline points="9 18 12 21 15 18"/>
                        <polyline points="21 9 18 6 15 9"/>
                        <polyline points="5 9 7 7 9 9"/>
                    </svg>
                    <span class="pf-meta-chip-text"><?php echo esc_html($total_steps); ?> <?php echo $total_steps === 1 ? 'step' : 'steps'; ?></span>
                </div>
            <?php endif; ?>
            
            <?php if (!empty($version_field)): ?>
                <div class="pf-meta-chip pf-meta-chip--version">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4 7h4V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3h4a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"/>
                        <line x1="12" y1="12" x2="12" y2="16"/>
                    </svg>
                    <span class="pf-meta-chip-text"><?php echo esc_html($version_field); ?></span>
                </div>
            <?php endif; ?>
            
            <?php 
            // Access Mode Badge (using helper functions)
            $access_badge_text = pf_mode_badge_text($access_mode);
            $access_badge_css = pf_mode_badge_css($access_mode);
            ?>
            <div class="pf-meta-chip <?php echo esc_attr($access_badge_css); ?>">
                <?php if ($access_mode === 'free'): ?>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                        <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                <?php else: ?>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                <?php endif; ?>
                <span class="pf-meta-chip-text"><?php echo esc_html($access_badge_text); ?></span>
            </div>
        </div>
        
    </div>
</header>

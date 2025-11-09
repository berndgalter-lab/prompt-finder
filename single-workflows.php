<?php
/**
 * Single Template: Workflows
 * 
 * Modern modular workflow template using template parts
 * 
 * @package GeneratePress_Child
 * @since 2.0.0
 */

// Security: Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

get_header();
the_post();
?>

<?php
// Get Fast Track thresholds (from constants or ACF override)
$post_id = get_the_ID();
$ft_trigger_this = defined('PF_FT_TRIGGER_THIS_WORKFLOW') ? PF_FT_TRIGGER_THIS_WORKFLOW : 2;
$ft_trigger_any = defined('PF_FT_TRIGGER_ANY_WORKFLOW') ? PF_FT_TRIGGER_ANY_WORKFLOW : 5;

// Allow per-workflow ACF override (optional)
$acf_this = get_field('ft_trigger_this_workflow', $post_id);
$acf_any = get_field('ft_trigger_any_workflow', $post_id);
if ($acf_this) $ft_trigger_this = (int) $acf_this;
if ($acf_any) $ft_trigger_any = (int) $acf_any;

// Check if user has Fast Track enabled (server-side)
$ft_enabled = false;
if (is_user_logged_in()) {
    $ft_enabled = PF_User_Tracking::is_ft_enabled(get_current_user_id());
}
?>

<div class="pf-workflow-container pf-ui-modern <?php echo $ft_enabled ? 'pf-fast-track-active' : ''; ?>" 
     data-post-id="<?php echo esc_attr($post_id); ?>" 
     data-profile-enabled="<?php echo get_field('use_profile_defaults') ? 'true' : 'false'; ?>"
     data-ft-trigger-this="<?php echo esc_attr($ft_trigger_this); ?>"
     data-ft-trigger-any="<?php echo esc_attr($ft_trigger_any); ?>">
    
    <?php get_template_part('src/php/template-parts/workflow/header'); ?>
    <div class="pf-status-cluster">
        <?php get_template_part('src/php/template-parts/workflow/section-variable-status'); ?>
        <?php get_template_part('src/php/template-parts/workflow/section-fast-track-toggle'); ?>
    </div>
    
    <div class="pf-workflow-layout">
        <?php get_template_part('src/php/template-parts/workflow/sidebar-nav'); ?>
        
        <div class="pf-workflow-main">
            <?php 
            // Fast Track: Workflow Info Accordion (shown only in FT mode via CSS)
            get_template_part('src/php/template-parts/workflow/section-workflow-info-accordion');
            
            // Default: Full sections (hidden in FT mode via CSS)
            get_template_part('src/php/template-parts/workflow/section-overview');
            get_template_part('src/php/template-parts/workflow/section-prerequisites');
            
            // Always visible
            get_template_part('src/php/template-parts/workflow/section-variables');
            get_template_part('src/php/template-parts/workflow/section-steps');
            ?>
        </div>
    </div>
    
    <?php get_template_part('src/php/template-parts/workflow/footer'); ?>
    
</div>

<?php get_footer(); ?>

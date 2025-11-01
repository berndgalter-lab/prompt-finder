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

<div class="pf-workflow-container" data-post-id="<?php echo esc_attr(get_the_ID()); ?>">
    
    <?php get_template_part('template-parts/workflow/header'); ?>
    
    <div class="pf-workflow-layout">
        <?php get_template_part('template-parts/workflow/sidebar-nav'); ?>
        
        <div class="pf-workflow-main">
            <?php 
            get_template_part('template-parts/workflow/section-overview');
            // get_template_part('template-parts/workflow/section-value'); // Removed - duplicate of overview
            get_template_part('template-parts/workflow/section-prerequisites');
            get_template_part('template-parts/workflow/section-variables');
            get_template_part('template-parts/workflow/section-steps');
            ?>
        </div>
    </div>
    
    <?php get_template_part('template-parts/workflow/footer'); ?>
    
</div>

<?php get_footer(); ?>

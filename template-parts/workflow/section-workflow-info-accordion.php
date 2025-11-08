<?php
/**
 * Template Part: Workflow Info Accordion
 * 
 * Combines Overview + Prerequisites into a collapsible accordion
 * Only visible in Fast Track Mode (CSS-controlled)
 * 
 * @package GeneratePress_Child
 * @since 1.8.0
 */

// Security: Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="pf-workflow-info-accordion" role="region" aria-label="Workflow Information">
    <button class="pf-accordion-toggle" 
            type="button" 
            aria-expanded="false" 
            aria-controls="pf-workflow-info-content">
        <svg class="pf-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
        <span>Workflow Info</span>
    </button>
    
    <div class="pf-accordion-content" 
         id="pf-workflow-info-content" 
         aria-hidden="true">
        <div class="pf-accordion-content-inner">
            <?php 
            // Include overview and prerequisites (content only, no outer section wrapper)
            // We'll extract just the content parts
            ?>
            
            <!-- Overview Content -->
            <?php
            $summary = get_field('summary');
            $use_case = get_field('use_case');
            $pain_points = get_field('pain_points');
            $expected_outcome = get_field('expected_outcome');
            ?>
            
            <?php if (!empty($summary) || !empty($pain_points) || !empty($expected_outcome)): ?>
            <div class="pf-section">
                <h3 class="pf-section-heading">Overview</h3>
                
                <?php if (!empty($summary)): ?>
                <div class="pf-overview-summary">
                    <?php echo wp_kses_post($summary); ?>
                </div>
                <?php endif; ?>
                
                <?php if (!empty($pain_points)): ?>
                <div class="pf-pain-points">
                    <h4 class="pf-subsection-heading">Challenges this solves:</h4>
                    <?php echo wp_kses_post($pain_points); ?>
                </div>
                <?php endif; ?>
                
                <?php if (!empty($expected_outcome)): ?>
                <div class="pf-expected-outcome">
                    <h4 class="pf-subsection-heading">What you'll get:</h4>
                    <?php echo wp_kses_post($expected_outcome); ?>
                </div>
                <?php endif; ?>
            </div>
            <?php endif; ?>
            
            <!-- Prerequisites Content -->
            <?php
            $inputs_prerequisites = get_field('inputs_prerequisites');
            $requires_source_content = get_field('requires_source_content');
            ?>
            
            <div class="pf-section">
                <h3 class="pf-section-heading">Before you start</h3>
                
                <?php if (!empty($inputs_prerequisites)): ?>
                <div class="pf-prereqs-notes">
                    <?php echo wp_kses_post($inputs_prerequisites); ?>
                </div>
                <?php else: ?>
                <div class="pf-prereqs-notes">
                    <p>No special prerequisites needed.</p>
                </div>
                <?php endif; ?>
                
                <?php if ($requires_source_content): ?>
                <div class="pf-prereqs-alert">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                    <span>You'll need source content for this workflow.</span>
                </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>


<?php
/**
 * Workflow Template Part: Prerequisites Section
 * 
 * Displays prerequisites, privacy warning, and time reminder
 * 
 * @package GeneratePress_Child
 */

// Security: Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Get ACF fields
$inputs_prerequisites = get_field('inputs_prerequisites');
$requires_source_content = get_field('requires_source_content');
$estimated_time_min = get_field('estimated_time_min');

// Only show section if prerequisites exist
if (empty($inputs_prerequisites)) {
    return;
}
?>

<!-- pf:prereqs START -->
<section id="prerequisites" class="pf-section pf-section--prereqs" role="region" aria-labelledby="prereqs-title">
    <div class="pf-prereqs-container">
        
        <!-- Header -->
        <header class="pf-prereqs-header">
            <svg class="pf-prereqs-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M9 11l3 3L22 4"></path>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
            <h2 class="pf-prereqs-title" id="prereqs-title">Before you start</h2>
        </header>

        <!-- Prerequisites List -->
        <ul class="pf-prereqs-list" role="list">
            <?php 
            // Split by line breaks to create individual prerequisite items
            $prereq_lines = array_filter(array_map('trim', explode("\n", $inputs_prerequisites)));
            
            foreach ($prereq_lines as $prereq): 
                // Skip empty lines
                if (empty($prereq)) continue;
            ?>
                <li class="pf-prereq-item">
                    <svg class="pf-prereq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <polyline points="9 11 12 14 22 4"></polyline>
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                    </svg>
                    <div class="pf-prereq-content">
                        <div class="pf-prereq-text">
                            <?php echo wp_kses_post($prereq); ?>
                        </div>
                    </div>
                </li>
            <?php endforeach; ?>
        </ul>
        
    </div>
</section>
<!-- pf:prereqs END -->

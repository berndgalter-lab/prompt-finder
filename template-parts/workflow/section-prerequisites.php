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
?>

<!-- pf:prereqs START -->
<section id="prerequisites" class="pf-section pf-section--prereqs">
    
    <header class="pf-prereqs-header">
        <h2 class="pf-section-heading">Before you start</h2>
    </header>

    <div class="pf-prereqs-body">
        <div class="pf-prereqs-card">
            <!-- Requirements (bestehende PHP-Schleife/Felder beibehalten) -->
            <?php if (!empty($inputs_prerequisites)): ?>
                <ul class="pf-reqs" role="list">
                    <li class="pf-reqs-item">
                        <div class="pf-reqs-notes">
                            <?php echo wp_kses_post($inputs_prerequisites); ?>
                        </div>
                    </li>
                </ul>
            <?php else: ?>
                <ul class="pf-reqs" role="list">
                    <li class="pf-reqs-item">
                        <div class="pf-reqs-notes">No special prerequisites needed.</div>
                    </li>
                </ul>
            <?php endif; ?>
        </div>
    </div>
    
</section>
<!-- pf:prereqs END -->

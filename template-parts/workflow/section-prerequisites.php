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

<section id="prerequisites" class="pf-section pf-section--prerequisites">
    
    <!-- Section Heading -->
    <h2 class="pf-section-heading">Before You Start</h2>
    
    <!-- Prerequisites Card -->
    <div class="pf-prerequisite-card">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
        </svg>
        <div class="pf-prerequisite-content">
            <h3 class="pf-prerequisite-heading">Requirements</h3>
            <div class="pf-prerequisite-text">
                <?php if (!empty($inputs_prerequisites)): ?>
                    <?php echo wp_kses_post($inputs_prerequisites); ?>
                <?php else: ?>
                    <p>No special prerequisites needed.</p>
                <?php endif; ?>
            </div>
        </div>
    </div>
    
    
    <!-- Time Reminder (if available) -->
    <?php if (!empty($estimated_time_min)): ?>
        <div class="pf-time-reminder">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
            </svg>
            <span>This workflow takes about <strong><?php echo esc_html($estimated_time_min); ?> minutes</strong></span>
        </div>
    <?php endif; ?>
    
</section>

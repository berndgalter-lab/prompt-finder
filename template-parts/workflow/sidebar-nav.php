<?php
/**
 * Workflow Template Part: Sidebar Navigation
 * 
 * Fixed sidebar with section links and step navigation
 * 
 * @package GeneratePress_Child
 */

// Security: Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Get ACF fields
$variables_workflow_field = get_field('variables_workflow');
$steps_field = get_field('steps');
$has_variables = !empty($variables_workflow_field) && is_array($variables_workflow_field);
$variable_count = $has_variables ? count($variables_workflow_field) : 0;
?>

<!-- Sidebar Navigation -->
<aside class="pf-workflow-sidebar" role="complementary" aria-label="Workflow Navigation">
    
    <nav class="pf-sidebar-nav" aria-label="Workflow Sections">
        
        <!-- Section Links -->
        <div class="pf-sidebar-section pf-sidebar-section--main">
            <a href="#overview" class="pf-sidebar-link" data-section="overview">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="7" height="7"/>
                    <rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
                </svg>
                <span>Overview</span>
            </a>
            
            <a href="#prerequisites" class="pf-sidebar-link" data-section="prerequisites">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <path d="M9 12l2 2 4-4"/>
                </svg>
                <span>Prerequisites</span>
            </a>
            
            <?php if ($has_variables): ?>
                <a href="#variables" class="pf-sidebar-link" data-section="variables">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M12 1v6m0 6v6M23 12h-6M7 12H1"/>
                    </svg>
                    <span>Variables</span>
                    <span class="pf-sidebar-badge"><?php echo esc_html($variable_count); ?></span>
                </a>
            <?php endif; ?>
        </div>
        
        <!-- Steps Section -->
        <?php if (!empty($steps_field) && is_array($steps_field)): ?>
            <div class="pf-sidebar-divider">
                <span>Steps</span>
            </div>
            
            <div class="pf-sidebar-section pf-sidebar-section--steps">
                <?php foreach ($steps_field as $i => $step): ?>
                    <?php
                    $step_idx = $i + 1;
                    $step_id = isset($step['step_id']) ? sanitize_title($step['step_id']) : '';
                    $step_title = $step['title'] ?? 'Untitled';
                    $step_anchor = 'step-' . $step_idx;
                    ?>
                    <a href="#<?php echo esc_attr($step_anchor); ?>"
                       class="pf-sidebar-link pf-sidebar-link--step"
                       data-section="step-<?php echo esc_attr($step_idx); ?>"
                       data-step-index="<?php echo esc_attr($step_idx); ?>">
                        <span class="pf-step-status-indicator" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="20 6 9 17 4 12"/>
                            </svg>
                        </span>
                        <div class="pf-step-link-body">
                            <span class="pf-step-number"><?php echo esc_html($step_idx); ?></span>
                            <span class="pf-step-title-text"><?php echo esc_html($step_title); ?></span>
                        </div>
                    </a>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
        
    </nav>
    
    <!-- Footer -->
    <div class="pf-sidebar-footer">
        <button class="pf-sidebar-btn pf-sidebar-btn--shortcuts" 
                type="button" 
                aria-label="Show keyboard shortcuts"
                data-action="show-shortcuts">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/>
                <path d="M12 2v6m-6 0h12"/>
            </svg>
            <span>Shortcuts</span>
        </button>
    </div>
    
</aside>

<!-- Mobile Toggle Button -->
<button class="pf-sidebar-toggle" 
        type="button" 
        aria-label="Toggle sidebar"
        aria-expanded="false"
        data-action="toggle-sidebar">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
</button>

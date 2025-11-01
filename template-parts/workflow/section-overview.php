<?php
/**
 * Workflow Template Part: Overview Section
 * 
 * Displays summary, use case badge, and metrics grid
 * 
 * @package GeneratePress_Child
 */

// Security: Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Get ACF fields
$summary = get_field('summary');
$use_case = get_field('use_case');
$estimated_time_min = get_field('estimated_time_min');
$time_saved_min = get_field('time_saved_min');
$difficulty_without_ai = get_field('difficulty_without_ai');

// Helper: Map difficulty (1-5) to text
$difficulty_text_map = [
    '1' => 'Very Low',
    '2' => 'Low',
    '3' => 'Medium',
    '4' => 'High',
    '5' => 'Very High'
];
$difficulty_text = isset($difficulty_text_map[$difficulty_without_ai]) 
    ? $difficulty_text_map[$difficulty_without_ai] 
    : 'Unknown';
$difficulty_numeric = intval($difficulty_without_ai);
if ($difficulty_numeric < 1) $difficulty_numeric = 3; // Default to Medium
if ($difficulty_numeric > 5) $difficulty_numeric = 5;
?>

<section id="overview" class="pf-section pf-section--overview">
    
    <!-- Section Heading -->
    <h2 class="pf-section-heading">Overview</h2>
    
    <!-- Overview Panel: Two-column layout -->
    <div class="pf-overview-panel">
        
        <!-- Left: Summary + Badges + Note -->
        <div class="pf-overview-left">
            
            <!-- Summary -->
            <?php if (!empty($summary)): ?>
                <div class="pf-overview-summary">
                    <p><?php echo esc_html($summary); ?></p>
                </div>
            <?php endif; ?>
            
            <!-- Use Case Badge (only if not empty) -->
            <?php if (!empty($use_case)): ?>
                <div class="pf-overview-badges">
                    <div class="pf-use-case-badge">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7M19 2v6M13 8h6"/>
                        </svg>
                        <span><?php echo esc_html($use_case); ?></span>
                    </div>
                </div>
            <?php endif; ?>
            
            <!-- Optional: Without AI Note -->
            <?php if (!empty($difficulty_without_ai)): ?>
                <div class="pf-overview-note">
                    Difficulty without AI: <?php echo esc_html($difficulty_text); ?>
                </div>
            <?php endif; ?>
            
        </div>
        
        <!-- Right: Metrics -->
        <div class="pf-overview-right">
            <div class="pf-overview-metrics">
        
                <!-- Estimated Time -->
                <?php if (!empty($estimated_time_min)): ?>
                    <div class="pf-metric-card">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 6v6l4 2"/>
                        </svg>
                        <div class="pf-metric-content">
                            <span class="pf-metric-label">Estimated Time</span>
                            <span class="pf-metric-value"><?php echo esc_html($estimated_time_min); ?> min</span>
                        </div>
                    </div>
                <?php endif; ?>
                
                <!-- Time Saved -->
                <?php if (!empty($time_saved_min) && $time_saved_min > 0): ?>
                    <div class="pf-metric-card pf-metric-card--highlight">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                        </svg>
                        <div class="pf-metric-content">
                            <span class="pf-metric-label">Time Saved</span>
                            <span class="pf-metric-value pf-metric-value--accent"><?php echo esc_html($time_saved_min); ?> min</span>
                        </div>
                    </div>
                <?php endif; ?>
                
                <!-- Difficulty -->
                <?php if (!empty($difficulty_without_ai)): ?>
                    <div class="pf-metric-card">
                        <div class="pf-star-rating">
                            <?php for ($i = 1; $i <= 5; $i++): ?>
                                <?php if ($i <= $difficulty_numeric): ?>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" stroke-width="1">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                    </svg>
                                <?php else: ?>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                    </svg>
                                <?php endif; ?>
                            <?php endfor; ?>
                        </div>
                        <div class="pf-metric-content">
                            <span class="pf-metric-label">Without AI</span>
                            <span class="pf-metric-value"><?php echo esc_html($difficulty_text); ?></span>
                        </div>
                    </div>
                <?php endif; ?>
                
            </div>
        </div>
        
    </div>
    
</section>

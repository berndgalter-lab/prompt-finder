<?php
/**
 * Template Part: Fast Track Toggle
 * 
 * Shows toggle to enable/disable Fast Track Mode
 * Only visible after user meets threshold
 * 
 * @package GeneratePress_Child
 * @since 1.8.0
 */

// Security: Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Check if threshold is met (will be shown/hidden via JS)
$post_id = get_the_ID();
$ft_enabled = false;

if (is_user_logged_in()) {
    $ft_enabled = PF_User_Tracking::is_ft_enabled(get_current_user_id());
}
?>

<div class="pf-fast-track-toggle-wrapper" data-ft-ready="false" hidden>
    <div class="pf-fast-track-toggle-card">
        <header class="pf-ft-head">
            <div class="pf-ft-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
            </div>
            <div class="pf-ft-title-wrap">
                <span class="pf-ft-kicker">Power users</span>
                <h3 class="pf-ft-title">Fast Track Mode</h3>
            </div>
            <div class="pf-ft-toggle">
                <button type="button" 
                        class="pf-toggle-switch <?php echo $ft_enabled ? 'is-active' : ''; ?>" 
                        role="switch" 
                        aria-checked="<?php echo $ft_enabled ? 'true' : 'false'; ?>"
                        aria-label="Toggle Fast Track Mode"
                        data-toggle-target="fast-track">
                    <span class="pf-toggle-track">
                        <span class="pf-toggle-thumb"></span>
                    </span>
                    <span class="pf-toggle-label">
                        <span class="pf-toggle-label-off">Off</span>
                        <span class="pf-toggle-label-on">On</span>
                    </span>
                </button>
            </div>
        </header>

        <p class="pf-ft-description">
            Hide onboarding content, expand all steps and minimize objective text once you know the workflow by heart.
        </p>

        <footer class="pf-ft-actions">
            <button type="button" class="pf-ft-info-btn" aria-label="Learn more about Fast Track Mode">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                Details
            </button>
        </footer>
        
        <!-- Info Tooltip (hidden by default) -->
        <div class="pf-ft-info-tooltip" hidden>
            <p>
                <strong>Was sich ändert</strong><br>
                • Overview und Prereqs werden eingeklappt<br>
                • Alle Schritte sind direkt geöffnet<br>
                • Ziele nur als Einzeiler<br>
                • Example Outputs ausgeblendet
            </p>
        </div>
    </div>
</div>


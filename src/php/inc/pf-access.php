<?php
/**
 * Prompt Finder - Access Control Helper Functions
 * 
 * Unified access control system for Free/Sign-in/Pro workflows
 * Server-side rendering only - no sensitive content in HTML when locked
 * 
 * @package GeneratePress_Child
 * @since 1.0.0
 */

// Security: Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Check if user is logged in
 * 
 * @since 1.0.0
 * @return bool True if user is logged in
 */
function pf_user_is_logged_in(): bool {
    return is_user_logged_in();
}

/**
 * Check if user has Pro access
 * 
 * Supports multiple methods:
 * - Variant A: WordPress capability 'pf_pro'
 * - Variant B: User meta 'pf_has_pro'
 * 
 * @since 1.0.0
 * @param int|null $user_id Optional user ID, defaults to current user
 * @return bool True if user has Pro access
 */
function pf_user_has_pro(?int $user_id = null): bool {
    $uid = $user_id ?: get_current_user_id();
    
    if (!$uid) {
        return false;
    }
    
    // Variant A: WordPress capability
    if (user_can($uid, 'pf_pro')) {
        return true;
    }
    
    // Variant B: User meta fallback
    return (bool) get_user_meta($uid, 'pf_has_pro', true);
}

/**
 * Get workflow access mode
 * 
 * Default: 'pro' (HARDLOCK) if not set or unknown
 * 
 * @since 1.0.0
 * @param int $post_id Workflow post ID
 * @return string Access mode: 'free', 'signin', or 'pro'
 */
function pf_workflow_mode(int $post_id): string {
    $mode = get_field('access_mode', $post_id) ?: 'pro'; // Safe default: pro
    
    return in_array($mode, ['free', 'signin', 'pro'], true) ? $mode : 'pro';
}

/**
 * Get free step limit for workflow
 * 
 * Default: 0 (HARDLOCK) if not set
 * 
 * @since 1.0.0
 * @param int $post_id Workflow post ID
 * @return int Number of steps visible without access (minimum 0)
 */
function pf_free_step_limit(int $post_id): int {
    $n = (int) get_field('free_step_limit', $post_id);
    
    return max(0, $n);
}

/**
 * Check if user can view all steps of workflow
 * 
 * Access logic:
 * - free: Everyone can view all steps
 * - signin: Logged-in users can view all steps
 * - pro: Logged-in users with Pro access can view all steps
 * 
 * @since 1.0.0
 * @param int $post_id Workflow post ID
 * @return bool True if user can view all steps
 */
function pf_can_view_all(int $post_id): bool {
    $mode = pf_workflow_mode($post_id);
    
    if ($mode === 'free') {
        return true;
    }
    
    if ($mode === 'signin') {
        return pf_user_is_logged_in();
    }
    
    if ($mode === 'pro') {
        return pf_user_is_logged_in() && pf_user_has_pro();
    }
    
    // Unknown mode: default to locked (pro behavior)
    return false;
}

/**
 * Get number of visible steps for current user
 * 
 * If user can view all steps, returns total.
 * Otherwise returns minimum of total and free_step_limit.
 * 
 * @since 1.0.0
 * @param int $post_id Workflow post ID
 * @param int $total_steps Total number of steps in workflow
 * @return int Number of steps visible to current user
 */
function pf_visible_steps_count(int $post_id, int $total_steps): int {
    if (pf_can_view_all($post_id)) {
        return $total_steps;
    }
    
    return min($total_steps, pf_free_step_limit($post_id));
}

/**
 * Get badge text for access mode
 * 
 * @since 1.0.0
 * @param string $mode Access mode: 'free', 'signin', or 'pro'
 * @return string Badge text: 'Free', 'Sign-in', or 'Pro'
 */
function pf_mode_badge_text(string $mode): string {
    if ($mode === 'free') {
        return 'Free';
    }
    
    if ($mode === 'signin') {
        return 'Sign-in';
    }
    
    return 'Pro'; // Default for 'pro' or unknown
}

/**
 * Get badge CSS class for access mode
 * 
 * @since 1.0.0
 * @param string $mode Access mode: 'free', 'signin', or 'pro'
 * @return string Badge CSS class: 'pf-badge--free', 'pf-badge--signin', or 'pf-badge--pro'
 */
function pf_mode_badge_css(string $mode): string {
    if ($mode === 'free') {
        return 'pf-badge--free';
    }
    
    if ($mode === 'signin') {
        return 'pf-badge--signin';
    }
    
    return 'pf-badge--pro'; // Default for 'pro' or unknown
}

/**
 * Get CTA URL and text based on access state
 * 
 * Returns appropriate CTA for locked workflows:
 * - Not logged in: Login CTA
 * - Logged in but no Pro: Upgrade CTA
 * 
 * @since 1.0.0
 * @param int $post_id Workflow post ID
 * @return array|null CTA info ['url' => string, 'text' => string] or null if no CTA needed
 */
function pf_get_access_cta(int $post_id): ?array {
    if (pf_can_view_all($post_id)) {
        return null; // No CTA needed - user has full access
    }
    
    $mode = pf_workflow_mode($post_id);
    
    // Free mode shouldn't reach here, but handle it
    if ($mode === 'free') {
        return null;
    }
    
    // Not logged in: Login CTA
    if (!pf_user_is_logged_in()) {
        return [
            'url' => wp_login_url(get_permalink($post_id)),
            'text' => 'Sign in to unlock all steps'
        ];
    }
    
    // Logged in but needs Pro: Upgrade CTA
    if ($mode === 'pro' && !pf_user_has_pro()) {
        // TODO: Replace with actual upgrade/checkout URL
        $upgrade_url = home_url('/pricing'); // Placeholder
        return [
            'url' => $upgrade_url,
            'text' => 'Upgrade to Pro to unlock all steps'
        ];
    }
    
    return null;
}


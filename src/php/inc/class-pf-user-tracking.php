<?php
/**
 * PF User Tracking
 * 
 * Handles workflow visit tracking for Fast Track Mode
 * - Logged-in users: WordPress User Meta
 * - Anonymous users: LocalStorage (JS-only, no PHP tracking)
 * - DSGVO compliant: functional tracking only, no personal data
 * 
 * @package GeneratePress_Child
 * @since 1.8.0
 */

// Security: Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class PF_User_Tracking {
    
    /**
     * Meta key for storing workflow visit counts
     */
    const META_KEY_VISITS = 'pf_workflow_visits';
    
    /**
     * Meta key for Fast Track preference
     */
    const META_KEY_FT_ENABLED = 'pf_fast_track_enabled';
    
    /**
     * Meta key for Fast Track trigger preference (auto/manual)
     */
    const META_KEY_FT_PREFERENCE = 'pf_fast_track_preference';
    
    /**
     * Initialize tracking system
     */
    public static function init() {
        // REST API endpoints
        add_action('rest_api_init', [__CLASS__, 'register_rest_routes']);
        
        // Admin: Show tracking data in user profile (optional, for debugging)
        // add_action('show_user_profile', [__CLASS__, 'render_user_tracking_data']);
        // add_action('edit_user_profile', [__CLASS__, 'render_user_tracking_data']);
    }
    
    /**
     * Register REST API endpoints
     */
    public static function register_rest_routes() {
        // Track workflow visit
        register_rest_route('pf/v1', '/track-visit', [
            'methods' => 'POST',
            'callback' => [__CLASS__, 'api_track_visit'],
            'permission_callback' => '__return_true', // Public endpoint (user can be logged out)
            'args' => [
                'workflow_id' => [
                    'required' => true,
                    'type' => 'integer',
                    'validate_callback' => function($param) {
                        return is_numeric($param) && $param > 0;
                    }
                ]
            ]
        ]);
        
        // Get tracking data
        register_rest_route('pf/v1', '/tracking-data', [
            'methods' => 'GET',
            'callback' => [__CLASS__, 'api_get_tracking_data'],
            'permission_callback' => '__return_true'
        ]);
        
        // Update Fast Track preference
        register_rest_route('pf/v1', '/fast-track-preference', [
            'methods' => 'POST',
            'callback' => [__CLASS__, 'api_update_ft_preference'],
            'permission_callback' => '__return_true',
            'args' => [
                'enabled' => [
                    'required' => true,
                    'type' => 'boolean'
                ],
                'preference' => [
                    'required' => false,
                    'type' => 'string',
                    'enum' => ['auto', 'manual'],
                    'default' => 'manual'
                ]
            ]
        ]);
    }
    
    /**
     * API: Track workflow visit
     */
    public static function api_track_visit(WP_REST_Request $request) {
        $workflow_id = $request->get_param('workflow_id');
        
        // Only track for logged-in users (anon users use LocalStorage)
        if (!is_user_logged_in()) {
            return new WP_REST_Response([
                'success' => true,
                'message' => 'Anonymous user - tracking handled client-side',
                'tracked' => false
            ], 200);
        }
        
        $user_id = get_current_user_id();
        
        // Increment visit count
        $visits = self::get_user_visits($user_id);
        
        if (!isset($visits[$workflow_id])) {
            $visits[$workflow_id] = 0;
        }
        
        $visits[$workflow_id]++;
        
        // Save updated visits
        update_user_meta($user_id, self::META_KEY_VISITS, $visits);
        
        // Check if threshold is met
        $threshold_met = self::check_threshold($user_id, $workflow_id);
        
        return new WP_REST_Response([
            'success' => true,
            'workflow_id' => $workflow_id,
            'visit_count' => $visits[$workflow_id],
            'total_visits' => array_sum($visits),
            'threshold_met' => $threshold_met,
            'ft_enabled' => self::is_ft_enabled($user_id)
        ], 200);
    }
    
    /**
     * API: Get tracking data
     */
    public static function api_get_tracking_data(WP_REST_Request $request) {
        if (!is_user_logged_in()) {
            return new WP_REST_Response([
                'logged_in' => false,
                'visits' => [],
                'ft_enabled' => false
            ], 200);
        }
        
        $user_id = get_current_user_id();
        $visits = self::get_user_visits($user_id);
        
        return new WP_REST_Response([
            'logged_in' => true,
            'visits' => $visits,
            'total_visits' => array_sum($visits),
            'ft_enabled' => self::is_ft_enabled($user_id),
            'ft_preference' => self::get_ft_preference($user_id)
        ], 200);
    }
    
    /**
     * API: Update Fast Track preference
     */
    public static function api_update_ft_preference(WP_REST_Request $request) {
        if (!is_user_logged_in()) {
            return new WP_REST_Response([
                'success' => false,
                'message' => 'User not logged in'
            ], 401);
        }
        
        $user_id = get_current_user_id();
        $enabled = $request->get_param('enabled');
        $preference = $request->get_param('preference') ?: 'manual';
        
        update_user_meta($user_id, self::META_KEY_FT_ENABLED, $enabled);
        update_user_meta($user_id, self::META_KEY_FT_PREFERENCE, $preference);
        
        return new WP_REST_Response([
            'success' => true,
            'enabled' => $enabled,
            'preference' => $preference
        ], 200);
    }
    
    /**
     * Get user's workflow visits
     * 
     * @param int $user_id
     * @return array Associative array [workflow_id => count]
     */
    public static function get_user_visits($user_id) {
        $visits = get_user_meta($user_id, self::META_KEY_VISITS, true);
        return is_array($visits) ? $visits : [];
    }
    
    /**
     * Check if Fast Track threshold is met for a workflow
     * 
     * @param int $user_id
     * @param int $workflow_id
     * @return bool
     */
    public static function check_threshold($user_id, $workflow_id) {
        // Get thresholds from constants (or ACF if set)
        $threshold_this = defined('PF_FT_TRIGGER_THIS_WORKFLOW') ? PF_FT_TRIGGER_THIS_WORKFLOW : 2;
        $threshold_any = defined('PF_FT_TRIGGER_ANY_WORKFLOW') ? PF_FT_TRIGGER_ANY_WORKFLOW : 5;
        
        // Allow per-workflow override via ACF (optional)
        if (function_exists('get_field')) {
            $acf_this = get_field('ft_trigger_this_workflow', $workflow_id);
            $acf_any = get_field('ft_trigger_any_workflow', $workflow_id);
            
            if ($acf_this) $threshold_this = (int) $acf_this;
            if ($acf_any) $threshold_any = (int) $acf_any;
        }
        
        // Get visit counts
        $visits = self::get_user_visits($user_id);
        $this_workflow_count = isset($visits[$workflow_id]) ? $visits[$workflow_id] : 0;
        $total_count = array_sum($visits);
        
        // Hybrid logic: THIS workflow ≥ X OR ANY workflow ≥ Y
        return ($this_workflow_count >= $threshold_this) || ($total_count >= $threshold_any);
    }
    
    /**
     * Check if user has Fast Track enabled
     * 
     * @param int $user_id
     * @return bool
     */
    public static function is_ft_enabled($user_id) {
        $enabled = get_user_meta($user_id, self::META_KEY_FT_ENABLED, true);
        return (bool) $enabled;
    }
    
    /**
     * Get Fast Track preference (auto/manual)
     * 
     * @param int $user_id
     * @return string 'auto' or 'manual'
     */
    public static function get_ft_preference($user_id) {
        $pref = get_user_meta($user_id, self::META_KEY_FT_PREFERENCE, true);
        return in_array($pref, ['auto', 'manual']) ? $pref : 'manual';
    }
    
    /**
     * Render tracking data in user profile (admin only)
     * For debugging purposes
     */
    public static function render_user_tracking_data($user) {
        if (!current_user_can('edit_users')) {
            return;
        }
        
        $visits = self::get_user_visits($user->ID);
        $ft_enabled = self::is_ft_enabled($user->ID);
        $ft_preference = self::get_ft_preference($user->ID);
        
        ?>
        <h2><?php _e('Prompt Finder Tracking', 'generatepress'); ?></h2>
        <table class="form-table">
            <tr>
                <th><?php _e('Fast Track Mode', 'generatepress'); ?></th>
                <td>
                    <?php echo $ft_enabled ? '✅ Enabled' : '❌ Disabled'; ?>
                    (<?php echo esc_html($ft_preference); ?>)
                </td>
            </tr>
            <tr>
                <th><?php _e('Workflow Visits', 'generatepress'); ?></th>
                <td>
                    <?php if (empty($visits)): ?>
                        <em>No visits tracked yet</em>
                    <?php else: ?>
                        <ul>
                            <?php foreach ($visits as $wf_id => $count): ?>
                                <li>
                                    <strong>Workflow #<?php echo esc_html($wf_id); ?>:</strong>
                                    <?php echo esc_html($count); ?> visit(s)
                                </li>
                            <?php endforeach; ?>
                        </ul>
                        <p><strong>Total:</strong> <?php echo array_sum($visits); ?> visit(s)</p>
                    <?php endif; ?>
                </td>
            </tr>
        </table>
        <?php
    }
}

// Initialize
PF_User_Tracking::init();


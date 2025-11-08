<?php
// Test-Änderung vom 26.10.2025
// Exit if accessed directly

if ( !defined( 'ABSPATH' ) ) exit;

/* =====================================================
   Constants
===================================================== */

// Rating constants
define('PF_MIN_RATING', 1);
define('PF_MAX_RATING', 5);
define('PF_DEFAULT_FREE_STEPS', 1);

// Rate limiting constants
define('PF_RATE_LIMIT_DURATION', 60); // seconds
define('PF_FAV_LIMIT_DURATION', 60); // seconds

// Cache constants
define('PF_CACHE_DURATION', 3600); // 1 hour

// Fast Track Mode constants
define('PF_FT_TRIGGER_THIS_WORKFLOW', 2); // visits to THIS workflow
define('PF_FT_TRIGGER_ANY_WORKFLOW', 5); // visits to ANY workflow

/* =====================================================
   Helper Functions
===================================================== */

/**
 * Load Access Control Helpers
 */
require_once get_stylesheet_directory() . '/inc/pf-access.php';

/**
 * Load User Tracking (Fast Track Mode)
 */
require_once get_stylesheet_directory() . '/inc/class-pf-user-tracking.php';

/**
 * Load PF configuration from JSON file
 * 
 * @since 1.0.0
 * @return array Configuration array
 */
function pf_load_config(): array {
    static $config = null;
    
    if ($config === null) {
        $cfg_file = get_stylesheet_directory() . '/assets/pf-config.json';
        $config = [];
        
        if (file_exists($cfg_file)) {
            $json = file_get_contents($cfg_file);
            // Remove BOM if present
            $json = preg_replace('/^\xEF\xBB\xBF/', '', $json);
            $tmp = json_decode($json, true);
            if (is_array($tmp)) {
                $config = $tmp;
            }
        }
    }
    
    return $config;
}

/**
 * Get user's current plan
 * 
 * @since 1.0.0
 * @return string User plan ('guest', 'free', 'pro')
 */
function pf_get_user_plan(): string {
    if (current_user_can('pf_pro')) return 'pro';
    if (is_user_logged_in()) {
        $plan = get_user_meta(get_current_user_id(), 'pf_plan', true);
        return is_string($plan) && $plan ? strtolower($plan) : 'free';
    }
    return 'guest';
}

/**
 * Check if user has access based on gating rules
 * 
 * @deprecated Use pf_can_view_all() instead
 * @since 1.0.0
 * @param array $gating Gating configuration
 * @return bool True if user has access
 */
function pf_user_has_access(array $gating): bool {
    // DEPRECATED: login_required field is deprecated, use access_mode instead
    // This function kept for backward compatibility only
    
    // Capability/Tier check
    if (!empty($gating['required_cap']) && !current_user_can($gating['required_cap'])) return false;
    
    return true;
}

/**
 * Enqueue asset with optimized versioning
 * 
 * @since 1.0.0
 * @param string $handle Asset handle
 * @param string $src Asset URL
 * @param array $deps Dependencies
 * @param string $type Asset type ('style' or 'script')
 * @param bool $in_footer For scripts only
 * @return void
 */
function pf_enqueue_asset(string $handle, string $src, array $deps = [], string $type = 'style', bool $in_footer = false): void {
    $file_path = get_stylesheet_directory() . str_replace(get_stylesheet_directory_uri(), '', $src);
    
    if (file_exists($file_path)) {
        $version = (function_exists('wp_get_environment_type') && (function_exists('wp_get_environment_type') && wp_get_environment_type() === 'production')) 
            ? wp_get_theme()->get('Version') 
            : filemtime($file_path);
            
        if ($type === 'style') {
            wp_enqueue_style($handle, $src, $deps, $version);
        } else {
            wp_enqueue_script($handle, $src, $deps, $version, $in_footer);
        }
    }
}

/**
 * Get client IP address with proxy support
 * 
 * @since 1.0.0
 * @return string Client IP address
 */
function pf_get_client_ip(): string {
    $ip_keys = ['HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'];
    
    foreach ($ip_keys as $key) {
        if (!empty($_SERVER[$key])) {
            $ip = $_SERVER[$key];
            
            // Handle comma-separated IPs (from proxies)
            if (strpos($ip, ',') !== false) {
                $ip = trim(explode(',', $ip)[0]);
            }
            
            // Validate IP
            if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                return $ip;
            }
        }
    }
    
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

/* =====================================================
   Child Theme Basics
===================================================== */

// Locale Styles (Parent RTL Support)
if ( !function_exists( 'chld_thm_cfg_locale_css' ) ):
    function chld_thm_cfg_locale_css( $uri ){
        if ( empty( $uri ) && is_rtl() && file_exists( get_template_directory() . '/rtl.css' ) ) {
            $uri = get_template_directory_uri() . '/rtl.css';
        }
        return $uri;
    }
endif;
add_filter( 'locale_stylesheet_uri', 'chld_thm_cfg_locale_css' );

/* =====================================================
   ACF JSON Sync & Global Context
===================================================== */

/**
 * Set ACF JSON save point to theme directory
 */
add_filter('acf/settings/save_json', function($path) {
    return get_stylesheet_directory() . '/acf-json';
});

/**
 * Set ACF JSON load point to theme directory
 */
add_filter('acf/settings/load_json', function($paths) {
    $paths[] = get_stylesheet_directory() . '/acf-json';
    return $paths;
});

/**
 * Add Global Context options page
 */
if (function_exists('acf_add_options_page')) {
    acf_add_options_page([
        'page_title' => 'Global Context',
        'menu_title' => 'Global Context',
        'menu_slug'  => 'acf-options-global-context',
        'capability' => 'manage_options',
        'icon_url'   => 'dashicons-admin-settings',
        'position'   => 30,
    ]);
}

/**
 * Get global context data for workflow injection
 * 
 * @since 1.0.0
 * @return array Global context data
 */
function pf_get_global_context(): array {
    static $context = null;
    
    if ($context === null) {
        $context = [
            'company_name' => get_field('company_name', 'option') ?: '',
            'industry' => get_field('industry', 'option') ?: '',
            'tone_of_voice' => get_field('tone_of_voice', 'option') ?: '',
            'target_audience' => get_field('target_audience', 'option') ?: '',
            'mission_values' => get_field('mission_values', 'option') ?: '',
            'reference_examples' => get_field('reference_examples', 'option') ?: [],
        ];
    }
    
    return $context;
}

/**
 * Inject global context into workflow prompts
 * 
 * @since 1.0.0
 * @param string $prompt The prompt template
 * @param array $context_requirements Required context types
 * @return string Modified prompt with injected context
 */
function pf_inject_global_context(string $prompt, array $context_requirements = []): string {
    if (empty($context_requirements)) {
        return $prompt;
    }
    
    $global_context = pf_get_global_context();
    $injected_context = [];
    
    foreach ($context_requirements as $req) {
        $type = $req['context_type'] ?? '';
        $required = $req['required'] ?? false;
        $source = $req['source'] ?? 'user_profile';
        $default = $req['default_value'] ?? '';
        
        switch ($type) {
            case 'business':
                if ($source === 'user_profile' && !empty($global_context['company_name'])) {
                    $injected_context[] = "Company: " . $global_context['company_name'];
                    if (!empty($global_context['industry'])) {
                        $injected_context[] = "Industry: " . $global_context['industry'];
                    }
                    if (!empty($global_context['mission_values'])) {
                        $injected_context[] = "Mission & Values: " . $global_context['mission_values'];
                    }
                }
                break;
                
            case 'icp':
                if ($source === 'user_profile' && !empty($global_context['target_audience'])) {
                    $injected_context[] = "Target Audience: " . $global_context['target_audience'];
                }
                break;
                
            case 'tone':
                if ($source === 'user_profile' && !empty($global_context['tone_of_voice'])) {
                    $injected_context[] = "Tone of Voice: " . $global_context['tone_of_voice'];
                }
                break;
                
            case 'examples':
                if ($source === 'user_profile' && !empty($global_context['reference_examples'])) {
                    $examples = [];
                    foreach ($global_context['reference_examples'] as $example) {
                        if (!empty($example['title']) && !empty($example['ref_text_or_link'])) {
                            $examples[] = $example['title'] . ": " . $example['ref_text_or_link'];
                        }
                    }
                    if (!empty($examples)) {
                        $injected_context[] = "Reference Examples:\n" . implode("\n", $examples);
                    }
                }
                break;
        }
        
        // Use default if no context found and not required
        if (empty($injected_context) && !$required && !empty($default)) {
            $injected_context[] = $default;
        }
    }
    
    if (!empty($injected_context)) {
        $context_text = "\n\n--- Context ---\n" . implode("\n", $injected_context) . "\n--- End Context ---\n";
        $prompt = $prompt . $context_text;
    }
    
    return $prompt;
}


/* =====================================================
   Frontend CSS / JS Enqueue
===================================================== */
// Run with priority 20 to allow GeneratePress to enqueue style.css first (default is 10)
add_action('wp_enqueue_scripts', function () {
    // Basisvariablen
    $base = get_stylesheet_directory();
    $uri  = get_stylesheet_directory_uri();

    // Child style.css: Check if GeneratePress already enqueued it
    // GeneratePress typically uses 'generate-child-css' handle
    // If GeneratePress loaded it, use that handle; otherwise use our own
    $child_style_handle = 'pf-child';
    $style_uri = get_stylesheet_uri();
    
    // Check if style.css is already enqueued by GeneratePress (common handles)
    $gp_handles = ['generate-child-css', 'generate-child-style', 'child-style'];
    $child_already_enqueued = false;
    
    foreach ($gp_handles as $handle) {
        if (wp_style_is($handle, 'enqueued') || wp_style_is($handle, 'registered')) {
            // GeneratePress already loaded it, use that handle for dependencies
            $child_style_handle = $handle;
            $child_already_enqueued = true;
            break;
        }
    }
    
    // If GeneratePress didn't enqueue it, we do it ourselves as fallback
    if (!$child_already_enqueued) {
        wp_enqueue_style(
            'pf-child',
            $style_uri,
            [],
            wp_get_theme()->get('Version')
        );
        $child_style_handle = 'pf-child';
    }
    
    // Core (immer) - mit Caching für bessere Performance
    // Depend on child style (either 'pf-child' or GeneratePress handle)
    $core = $base . '/assets/css/pf-core.css';
    if (file_exists($core)) {
        $version = (function_exists('wp_get_environment_type') && wp_get_environment_type() === 'production') 
            ? wp_get_theme()->get('Version') 
            : filemtime($core);
        wp_enqueue_style('pf-core', $uri . '/assets/css/pf-core.css', [$child_style_handle], $version);
    }

    // Landing (nur Front Page)
    if (is_front_page()) {
        $f = $base . '/assets/css/pf-landing.css';
        if (file_exists($f)) {
            $version = (function_exists('wp_get_environment_type') && wp_get_environment_type() === 'production') 
                ? wp_get_theme()->get('Version') 
                : filemtime($f);
            wp_enqueue_style('pf-landing', $uri . '/assets/css/pf-landing.css', ['pf-core'], $version);
        }
    }

    // Workflows (Single, Archive, Taxonomy)
    if (is_singular('workflows') || is_post_type_archive('workflows') || is_tax(['workflow_category','workflow_tag'])) {
        // DISABLED: For singular workflows, use new modular system (enqueue_new_workflow_assets)
        // This old code only runs for archives/taxonomies now
        
        // For singular workflows: Assets werden von enqueue_new_workflow_assets() geladen
        // For archives/taxonomies: Old system bleibt aktiv (falls benötigt)
        if (!is_singular('workflows')) {
            // Archive/Taxonomy: Old system
            // OLD: Legacy workflow CSS
            $f = $base . '/assets/css/pf-workflows.css';
            if (file_exists($f)) {
                $version = (function_exists('wp_get_environment_type') && wp_get_environment_type() === 'production') 
                    ? wp_get_theme()->get('Version') 
                    : filemtime($f);
                wp_enqueue_style('pf-workflows', $uri . '/assets/css/pf-workflows.css', ['pf-core'], $version);
            }
        }
        
        // Legacy workflow JavaScript removed - using single orchestrator (pf-workflows.js)

    }

    // Navigation JavaScript (global für alle Seiten)
    $nav_js = $base . '/assets/js/pf-navigation.js';
    if (file_exists($nav_js)) {
        $nav_version = (function_exists('wp_get_environment_type') && wp_get_environment_type() === 'production') 
            ? wp_get_theme()->get('Version') 
            : filemtime($nav_js);
        wp_enqueue_script('pf-navigation-js', $uri . '/assets/js/pf-navigation.js', [], $nav_version, true);
    }

    // Blog
    if (is_home() || is_singular('post') || is_category() || is_tag() || is_date() || is_author()) {
        $f = $base . '/assets/css/pf-blog.css';
        if (file_exists($f)) {
            $version = (function_exists('wp_get_environment_type') && wp_get_environment_type() === 'production') 
                ? wp_get_theme()->get('Version') 
                : filemtime($f);
            wp_enqueue_style('pf-blog', $uri . '/assets/css/pf-blog.css', ['pf-core'], $version);
        }
    }

}, 20); // Priority 20: Run after GeneratePress (default 10)

/**
 * Dequeue duplicate child CSS if both handles point to same file
 * Priority 100 runs after all enqueues to catch duplicates
 */
add_action('wp_enqueue_scripts', function() {
    // If both are enqueued, keep 'generate-child-css', dequeue 'pf-child-css'
    if (wp_style_is('generate-child-css', 'enqueued') && wp_style_is('pf-child-css', 'enqueued')) {
        wp_dequeue_style('pf-child-css');
    }
    // Also check for any other duplicate handles
    if (wp_style_is('generate-child-css', 'enqueued') && wp_style_is('pf-child', 'enqueued')) {
        // Check if they point to the same file
        $gp_src = wp_styles()->registered['generate-child-css']->src ?? '';
        $pf_src = wp_styles()->registered['pf-child']->src ?? '';
        if ($gp_src && $pf_src && $gp_src === $pf_src) {
            wp_dequeue_style('pf-child');
        }
    }
}, 100);


/* =====================================================
   Block Editor (Backend) Styles
===================================================== */
add_action('enqueue_block_editor_assets', function(){

    if ( !function_exists('get_current_screen') ) return;
    $screen = get_current_screen(); if ( !$screen ) return;

    $base = get_stylesheet_directory();
    $uri  = get_stylesheet_directory_uri();

    // Core
    $core = $base . '/assets/css/pf-core.css';
    if (file_exists($core)) {
        $version = (function_exists('wp_get_environment_type') && wp_get_environment_type() === 'production') 
            ? wp_get_theme()->get('Version') 
            : filemtime($core);
        wp_enqueue_style('pf-core-editor', $uri . '/assets/css/pf-core.css', [], $version);
    }

    // Landing
    if ($screen->post_type === 'page') {
        $f = $base . '/assets/css/pf-landing.css';
        if (file_exists($f)) {
            $version = (function_exists('wp_get_environment_type') && wp_get_environment_type() === 'production') 
                ? wp_get_theme()->get('Version') 
                : filemtime($f);
            wp_enqueue_style('pf-landing-editor', $uri . '/assets/css/pf-landing.css', ['pf-core-editor'], $version);
        }
    }

    // Workflows
    if ($screen->post_type === 'workflows') {
        $f = $base . '/assets/css/pf-workflows.css';
        if (file_exists($f)) {
            $version = (function_exists('wp_get_environment_type') && wp_get_environment_type() === 'production') 
                ? wp_get_theme()->get('Version') 
                : filemtime($f);
            wp_enqueue_style('pf-workflows-editor', $uri . '/assets/css/pf-workflows.css', ['pf-core-editor'], $version);
        }
    }

    // Blog
    if ($screen->post_type === 'post') {
        $f = $base . '/assets/css/pf-blog.css';
        if (file_exists($f)) {
            $version = (function_exists('wp_get_environment_type') && wp_get_environment_type() === 'production') 
                ? wp_get_theme()->get('Version') 
                : filemtime($f);
            wp_enqueue_style('pf-blog-editor', $uri . '/assets/css/pf-blog.css', ['pf-core-editor'], $version);
        }
    }

});


/* =====================================================
   AJAX Workflow Rating
===================================================== */
add_action('wp_ajax_pf_rate_workflow', 'pf_rate_workflow_cb');
add_action('wp_ajax_nopriv_pf_rate_workflow', 'pf_rate_workflow_cb');

function pf_rate_workflow_cb(){
    try {
        // Enhanced security check
        if (!wp_verify_nonce($_POST['nonce'], 'pf-rate-nonce')) {
            wp_send_json_error(['message' => 'Security check failed'], 403);
        }

        // Rate limiting with improved IP detection
        $user_ip = pf_get_client_ip();
        $rate_limit_key = 'pf_rate_limit_' . md5($user_ip);
        if (get_transient($rate_limit_key)) {
            wp_send_json_error(['message' => 'Rate limit exceeded. Please wait before rating again.'], 429);
        }

        // Input validation and sanitization
        $post_id = isset($_POST['post_id']) ? (int) $_POST['post_id'] : 0;
        $rating  = isset($_POST['rating'])  ? (int) $_POST['rating']  : 0;

        // Validate inputs
        if (!$post_id || $rating < PF_MIN_RATING || $rating > PF_MAX_RATING) {
            wp_send_json_error(['message' => 'Invalid rating data'], 400);
        }

        if (get_post_type($post_id) !== 'workflows') {
            wp_send_json_error(['message' => 'Invalid workflow'], 404);
        }

        // Set rate limit
        set_transient($rate_limit_key, 1, PF_RATE_LIMIT_DURATION);

    } catch (Exception $e) {
        error_log('[PF Error] Rating error: ' . $e->getMessage());
        wp_send_json_error(['message' => 'An unexpected error occurred'], 500);
    }

    // ---- Dupes blocken
    $already = false;

    if ( is_user_logged_in() ) {
        $user_id = get_current_user_id();
        $flag_key = 'pf_rated_' . $post_id;
        if ( get_user_meta($user_id, $flag_key, true) ) {
            $already = true;
        } else {
            update_user_meta($user_id, $flag_key, current_time('mysql'));
        }
    } else {
        // IP-basiert 24h sperren (für Gäste)
        $ip = pf_get_client_ip();
        $transient_key = 'pf_rated_' . $post_id . '_' . md5($ip);
        if ( get_transient($transient_key) ) {
            $already = true;
        } else {
            set_transient($transient_key, 1, DAY_IN_SECONDS);
        }
    }

    if ( $already ) {
        // Auch in diesem Fall aktuelle Werte zurückgeben
        $sum   = (int) get_post_meta($post_id, 'pf_rating_sum', true);
        $count = (int) get_post_meta($post_id, 'pf_rating_count', true);
        $avg   = $count ? round($sum / $count, 1) : 0;
        wp_send_json_error(['message' => 'already_rated', 'avg' => $avg, 'count' => $count], 409);
    }

    // ---- Wertung speichern
    $sum   = (int) get_post_meta($post_id, 'pf_rating_sum', true);
    $count = (int) get_post_meta($post_id, 'pf_rating_count', true);
    $sum   += $rating;
    $count += 1;

    update_post_meta($post_id, 'pf_rating_sum', $sum);
    update_post_meta($post_id, 'pf_rating_count', $count);

    $avg = round($sum / $count, 1);

    // UX: optional Cookie setzen (nur Komfort)
    setcookie('pf_rated_' . $post_id, '1', time() + DAY_IN_SECONDS, COOKIEPATH, COOKIE_DOMAIN);

    wp_send_json_success(['avg' => $avg, 'count' => $count]);
}
/* =====================================================
   Gating for LoggedIn Users
===================================================== */
// Note: pf_user_has_access() function is already defined above in Helper Functions section


/* =====================================================
   Pricing Page Assets
===================================================== */
add_action('wp_enqueue_scripts', function () {
    if (!is_page('pricing')) return;

    $base_dir = get_stylesheet_directory();
    $base_uri = get_stylesheet_directory_uri();

    $core_css = $base_dir . '/assets/css/pf-core.css';
    if (file_exists($core_css)) {
        $version = (function_exists('wp_get_environment_type') && wp_get_environment_type() === 'production') 
            ? wp_get_theme()->get('Version') 
            : filemtime($core_css);
        wp_enqueue_style('pf-core', $base_uri . '/assets/css/pf-core.css', [], $version);
    }

    // Reuse workflow visual language
    $wf_css = $base_dir . '/assets/css/pf-workflows.css';
    if (file_exists($wf_css)) {
        wp_enqueue_style('pf-workflows', $base_uri . '/assets/css/pf-workflows.css', ['pf-core'], filemtime($wf_css));
    }

    $landing_css = $base_dir . '/assets/css/pf-landing.css';
    if (file_exists($landing_css)) {
        wp_enqueue_style('pf-landing', $base_uri . '/assets/css/pf-landing.css', ['pf-core'], filemtime($landing_css));
    }

    $pricing_css = $base_dir . '/assets/css/pf-pricing.css';
    if (file_exists($pricing_css)) {
        $version = (function_exists('wp_get_environment_type') && wp_get_environment_type() === 'production') 
            ? wp_get_theme()->get('Version') 
            : filemtime($pricing_css);
        wp_enqueue_style('pf-pricing-css', $base_uri . '/assets/css/pf-pricing.css', ['pf-core'], $version);
    }

    // Pricing JS (includes Lemon Squeezy loader)
    $pricing_js = $base_dir . '/assets/js/pf-pricing.js';
    if (file_exists($pricing_js)) {
        $version = (function_exists('wp_get_environment_type') && wp_get_environment_type() === 'production') 
            ? wp_get_theme()->get('Version') 
            : filemtime($pricing_js);
        wp_enqueue_script('pf-pricing-js', $base_uri . '/assets/js/pf-pricing.js', [], $version, true);
    }
}, 110);

/* =====================================================
   Logo from Customizer
===================================================== */

add_action('after_setup_theme', function () {
  add_theme_support('custom-logo', [
    'height'      => 48,
    'width'       => 200,
    'flex-width'  => true,
    'flex-height' => true,
  ]);
  add_theme_support('title-tag');
});

/* =====================================================
   Admin Columns for Workflows – Extended Overview
===================================================== */
add_filter('manage_workflows_posts_columns', function ($columns) {
    // Bestehende Reihenfolge beibehalten, neue Spalten anhängen
    $columns['pf_version']        = __('Version', 'prompt-finder');
    $columns['pf_last_updated']   = __('Last Update', 'prompt-finder');
    $columns['pf_access_mode']    = __('Access', 'prompt-finder');
    $columns['pf_free_steps']     = __('Free Steps', 'prompt-finder');
    $columns['pf_login_required'] = __('Login (Deprecated)', 'prompt-finder'); // DEPRECATED
    $columns['pf_access_tier']    = __('Tier (Deprecated)', 'prompt-finder'); // DEPRECATED
    $columns['pf_status']         = __('Status', 'prompt-finder');
    $columns['pf_license']        = __('License', 'prompt-finder');
    $columns['pf_owner']          = __('Owner', 'prompt-finder');

    $columns['pf_steps']          = __('Steps', 'prompt-finder');
    $columns['pf_time_saved']     = __('Time Saved (min)', 'prompt-finder');
    $columns['pf_difficulty']     = __('Difficulty w/o AI', 'prompt-finder');

    $columns['pf_use_case']       = __('Use Case', 'prompt-finder');
    $columns['pf_expected']       = __('Expected Outcome', 'prompt-finder');
    $columns['pf_pain']           = __('Pain Points', 'prompt-finder');

    $columns['pf_rating']         = __('Rating', 'prompt-finder');
    return $columns;
});

add_action('manage_workflows_posts_custom_column', function ($column, $post_id) {
    // Helper zum Kürzen langer Texte
    $short = function ($text, $len = 80) {
        $t = trim((string)$text);
        return (mb_strlen($t) > $len) ? mb_substr($t, 0, $len - 1) . '…' : $t;
    };

    switch ($column) {
        case 'pf_version':
            echo esc_html(function_exists('get_field') ? (get_field('version', $post_id) ?: '–') : '–');
            break;

        case 'pf_last_updated':
            echo esc_html(get_field('last_update', $post_id) ?: '–');
            break;

        case 'pf_access_mode':
            echo esc_html(ucfirst(get_field('access_mode', $post_id) ?: 'free'));
            break;

        case 'pf_free_steps':
            $n = get_field('free_step_limit', $post_id);
            echo esc_html($n === '' || $n === null ? '–' : (string)$n);
            break;

        case 'pf_login_required':
            // DEPRECATED: login_required field is deprecated, use access_mode instead
            // Show access_mode for backward compatibility
            $mode = get_field('access_mode', $post_id);
            if ($mode === 'signin' || $mode === 'pro') {
                echo 'Yes (via access_mode)';
            } else {
                echo 'No (via access_mode)';
            }
            break;

        case 'pf_access_tier':
            echo esc_html(ucfirst(get_field('access_tier', $post_id) ?: 'free'));
            break;

        case 'pf_status':
            echo esc_html(ucfirst(get_field('status', $post_id) ?: 'draft'));
            break;

        case 'pf_license':
            echo esc_html(get_field('license', $post_id) ?: '–');
            break;

        case 'pf_owner':
            echo esc_html(get_field('owner', $post_id) ?: '–');
            break;

        case 'pf_steps':
            $steps = get_field('steps', $post_id);
            echo is_array($steps) ? count($steps) : 0;
            break;

        case 'pf_time_saved':
            $v = get_field('time_saved_min', $post_id);
            echo esc_html($v === '' || $v === null ? '–' : (string)(int)$v);
            break;

        case 'pf_difficulty':
            $v = get_field('difficulty_without_ai', $post_id);
            echo esc_html($v === '' || $v === null ? '–' : (string)(int)$v);
            break;

        case 'pf_use_case':
            echo esc_html($short(get_field('use_case', $post_id)));
            break;

        case 'pf_expected':
            echo esc_html($short(get_field('expected_outcome', $post_id)));
            break;

        case 'pf_pain':
            echo esc_html($short(get_field('pain_points', $post_id)));
            break;

        case 'pf_rating':
            $sum   = (int) get_post_meta($post_id, 'pf_rating_sum', true);
            $count = (int) get_post_meta($post_id, 'pf_rating_count', true);
            if ($count > 0) {
                $avg = round($sum / $count, 1);
                echo esc_html("★ {$avg} ({$count})");
            } else {
                echo '–';
            }
            break;
    }
}, 10, 2);

/* Sortierbare Spalten */
add_filter('manage_edit-workflows_sortable_columns', function ($columns) {
    $columns['pf_version']      = 'pf_version';
    $columns['pf_last_updated'] = 'pf_last_updated';
    $columns['pf_access_mode']  = 'pf_access_mode';
    $columns['pf_steps']        = 'pf_steps';        // Hinweis: wird nur rudimentär sortiert (s. pre_get_posts)
    $columns['pf_time_saved']   = 'pf_time_saved';
    $columns['pf_difficulty']   = 'pf_difficulty';
    return $columns;
});

/* Sorting-Logik für ACF/Meta-Felder */
add_action('pre_get_posts', function ($query) {
    if (!is_admin() || !$query->is_main_query()) return;
    if ($query->get('post_type') !== 'workflows') return;

    $orderby = $query->get('orderby');

    // Mapping: Orderby → Meta-Key + Type
    $map = [
        'pf_version'      => ['key' => 'version',               'type' => 'CHAR'],
        'pf_last_updated' => ['key' => 'last_update',        'type' => 'CHAR'], // als String (Datumformat je nach ACF)
        'pf_access_mode'  => ['key' => 'access_mode',           'type' => 'CHAR'],
        'pf_time_saved'   => ['key' => 'time_saved_min',        'type' => 'NUMERIC'],
        'pf_difficulty'   => ['key' => 'difficulty_without_ai', 'type' => 'NUMERIC'],
    ];

    if ($orderby === 'pf_steps') {
        // Einfacher Fallback: nach Titel sortieren, da Steps ein Repeater ist (Count nicht direkt sortierbar ohne JOIN)
        $query->set('orderby', 'title');
        return;
    }

    if (isset($map[$orderby])) {
        $meta_key = $map[$orderby]['key'];
        $type     = $map[$orderby]['type'];

        $query->set('meta_key', $meta_key);
        $query->set('orderby', $type === 'NUMERIC' ? 'meta_value_num' : 'meta_value');
    }
});

/* ============ Favorites (MVP) ============ */
// NOTE: Favorites functionality is not yet implemented in new system
// When implemented, use 'pf-workflows' as script handle (single orchestrator)
add_action('wp_enqueue_scripts', function(){
  if ( is_singular('workflows') || is_post_type_archive('workflows') ) {
    // Localize to workflow script when favorites are implemented
    // wp_localize_script('pf-workflows', 'PF_FAVS', [
    //   'ajax_url'   => admin_url('admin-ajax.php'),
    //   'nonce'      => wp_create_nonce('pf-fav-nonce'),
    //   'logged_in'  => is_user_logged_in(),
    //   'txt_added'  => 'Saved to favorites',
    //   'txt_removed'=> 'Removed from favorites',
    //   'txt_login'  => 'Please log in to save favorites',
    //   'txt_denied' => 'Favorites are for paying users',
    // ]);
  }
}, 111);

/* =====================================================
   Integrated Core Functions (from pf-core.php)
===================================================== */

/**
 * Frontend enhancements (replaces pf-core.php plugin functionality)
 */
add_action('wp_enqueue_scripts', function() {
    try {
        // Add custom CSS for admin users
        if (is_user_logged_in() && current_user_can('manage_options')) {
            wp_add_inline_style('pf-core', '
                .pf-debug { 
                    border: 1px dashed #0073aa; 
                    background: #f0f8ff; 
                    padding: 10px; 
                    margin: 10px 0; 
                }
            ');
        }
    } catch (Exception $e) {
        error_log('[PF Theme] Frontend enhancements error: ' . $e->getMessage());
    }
}, 112);

/* =====================================================
   FORCE CORRECT ASSET URLS (Debug/Fix for Parent Theme Override)
===================================================== */

/**
 * Force correct asset URLs - override any parent theme interference
 */
// SIMPLE APPROACH: No WordPress enqueue complexity - assets loaded directly in header.php/footer.php

/* Helper: darf dieser User favorisieren? */
function pf_user_can_favorite(): bool {
  if ( ! is_user_logged_in() ) return false;
  // MVP: alle eingeloggten dürfen
  // Für zahlende Kunden nur:
  // return current_user_can('pf_can_favorite'); // Capability via Membership/Role setzen
  return true;
}

/* AJAX: Toggle Favorite */
add_action('wp_ajax_pf_toggle_favorite', 'pf_toggle_favorite_cb');
function pf_toggle_favorite_cb(){
  try {
    // Enhanced security check
    if (!wp_verify_nonce($_POST['nonce'], 'pf-fav-nonce')) {
      wp_send_json_error(['message' => 'Security check failed'], 403);
    }

    // Rate limiting for favorites
    $user_ip = pf_get_client_ip();
    $rate_limit_key = 'pf_fav_limit_' . md5($user_ip);
    if (get_transient($rate_limit_key)) {
      wp_send_json_error(['message' => 'Rate limit exceeded. Please wait before adding more favorites.'], 429);
    }

    if (!pf_user_can_favorite()) {
      wp_send_json_error(['message' => 'Access denied'], 403);
    }

    $post_id = isset($_POST['post_id']) ? (int) $_POST['post_id'] : 0;
    if (!$post_id || get_post_type($post_id) !== 'workflows') {
      wp_send_json_error(['message' => 'Invalid workflow'], 400);
    }

    // Set rate limit
    set_transient($rate_limit_key, 1, PF_FAV_LIMIT_DURATION);

  } catch (Exception $e) {
    error_log('[PF Error] Favorite error: ' . $e->getMessage());
    wp_send_json_error(['message' => 'An unexpected error occurred'], 500);
  }

  $user_id = get_current_user_id();
  $key = 'pf_favs';
  $favs = get_user_meta($user_id, $key, true);
  if ( ! is_array($favs) ) $favs = [];

  $added = false;
  if ( in_array($post_id, $favs, true) ) {
    // remove
    $favs = array_values(array_diff($favs, [$post_id]));
  } else {
    // add
    $favs[] = $post_id;
    $favs = array_values(array_unique($favs));
    $added = true;
  }
  update_user_meta($user_id, $key, $favs);

  wp_send_json_success([
    'added' => $added,
    'count' => count($favs),
  ]);
}

/* (Optional) AJAX: Liste abrufen. */
add_action('wp_ajax_pf_get_favorites', 'pf_get_favorites_cb');
function pf_get_favorites_cb(){
  try {
    // Enhanced security check
    if (!wp_verify_nonce($_POST['nonce'], 'pf-fav-nonce')) {
      wp_send_json_error(['message' => 'Security check failed'], 403);
    }

    if (!is_user_logged_in()) {
      wp_send_json_success(['ids' => []]);
    }

    $favs = get_user_meta(get_current_user_id(), 'pf_favs', true);
    if (!is_array($favs)) {
      $favs = [];
    }

    wp_send_json_success(['ids' => array_map('intval', $favs)]);

  } catch (Exception $e) {
    error_log('[PF Error] Get favorites error: ' . $e->getMessage());
    wp_send_json_error(['message' => 'An unexpected error occurred'], 500);
  }
}

/* ============================================================================
   DEBUG TOOL - Variables Inspector (WordPress Admin)
   ============================================================================ */

add_action('admin_menu', 'pf_debug_variables_menu');

function pf_debug_variables_menu() {
    add_submenu_page(
        'tools.php',
        'PF Variables Debug',
        'PF Variables Debug',
        'manage_options',
        'pf-variables-debug',
        'pf_show_variables_debug'
    );
}

function pf_show_variables_debug() {
    if (!current_user_can('manage_options')) {
        wp_die('Access denied');
    }
    
    $workflows = get_posts([
        'post_type' => 'workflows',
        'numberposts' => -1,
        'post_status' => 'publish'
    ]);
    
    ?>
    <div class="wrap">
        <h1>🔍 Prompt Finder - Variables Debug</h1>
        
        <?php
        if (empty($workflows)) {
            echo '<p style="color: red;">❌ Keine Workflows gefunden!</p>';
            return;
        }
        
        echo '<p style="color: green; font-weight: bold;">✅ ' . count($workflows) . ' Workflow(s) gefunden</p>';
        
        foreach ($workflows as $workflow) {
            ?>
            <div style="background: white; padding: 20px; margin: 20px 0; border: 1px solid #ccc; border-radius: 8px;">
                <h2>📄 <?php echo esc_html($workflow->post_title); ?> (ID: <?php echo $workflow->ID; ?>)</h2>
                
                <h3>🆕 Workflow Variables:</h3>
                <?php
                $variables_workflow = get_field('variables_workflow', $workflow->ID);
                if (!empty($variables_workflow) && is_array($variables_workflow)) {
                    echo '<p style="color: green;"><strong>✅ variables_workflow: ' . count($variables_workflow) . ' Variable(n)</strong></p>';
                    echo '<pre style="background: #f5f5f5; padding: 10px; overflow-x: auto; max-height: 300px;">' . esc_html(print_r($variables_workflow, true)) . '</pre>';
                } else {
                    echo '<p style="color: orange;">⚠️ variables_workflow: LEER</p>';
                }
                
                $pf_variables = get_field('pf_variables', $workflow->ID);
                if (!empty($pf_variables) && is_array($pf_variables)) {
                    echo '<p style="color: green;"><strong>✅ pf_variables (ALT): ' . count($pf_variables) . ' Variable(n)</strong></p>';
                    echo '<pre style="background: #f5f5f5; padding: 10px; overflow-x: auto; max-height: 300px;">' . esc_html(print_r($pf_variables, true)) . '</pre>';
                } else {
                    echo '<p style="color: orange;">⚠️ pf_variables (ALT): LEER</p>';
                }
                
                $steps = get_field('steps', $workflow->ID);
                if (!empty($steps) && is_array($steps)) {
                    echo '<h3>📋 Steps (' . count($steps) . '):</h3>';
                    
                    foreach ($steps as $i => $step) {
                        $idx = $i + 1;
                        echo '<h4>Step ' . $idx . ': ' . esc_html($step['title'] ?? 'Untitled') . '</h4>';
                        
                        $variables_step = $step['variables_step'] ?? [];
                        if (!empty($variables_step) && is_array($variables_step)) {
                            echo '<p style="color: green;"><strong>✅ variables_step: ' . count($variables_step) . ' Variable(n)</strong></p>';
                            echo '<pre style="background: #f5f5f5; padding: 10px; overflow-x: auto; max-height: 200px;">' . esc_html(print_r($variables_step, true)) . '</pre>';
                        } else {
                            echo '<p style="color: orange;">⚠️ variables_step: LEER</p>';
                        }
                        
                        $variables = $step['variables'] ?? [];
                        if (!empty($variables) && is_array($variables)) {
                            echo '<p style="color: green;"><strong>✅ variables (ALT): ' . count($variables) . ' Variable(n)</strong></p>';
                            echo '<pre style="background: #f5f5f5; padding: 10px; overflow-x: auto; max-height: 200px;">' . esc_html(print_r($variables, true)) . '</pre>';
                        } else {
                            echo '<p style="color: orange;">⚠️ variables (ALT): LEER</p>';
                        }
                        
                        echo '<hr>';
                    }
                }
                ?>
            </div>
            <?php
        }
        ?>
        
        <hr>
        <h2>📝 Zusammenfassung:</h2>
        <ul>
            <li>Wenn <strong>variables_workflow</strong> UND <strong>pf_variables</strong> LEER sind → Keine Workflow Variables in der Datenbank</li>
            <li>Wenn <strong>variables_step</strong> UND <strong>variables</strong> LEER sind → Keine Step Variables in der Datenbank</li>
            <li>Der Code unterstützt BEIDE Feldnamen (alt + neu) automatisch</li>
        </ul>
    </div>
    <?php
}

/**
 * Version Helper: Get filemtime for cache-busting
 */
if (!function_exists('pf_ver')) {
  function pf_ver($rel_path) {
    $abs = get_stylesheet_directory() . $rel_path;
    if (file_exists($abs)) {
      return filemtime($abs);
    }
    // Fallback (avoid hardcoded "1.0.0")
    return time();
  }
}

/**
 * Enqueue PF Assets (Single Bundle System)
 * All assets versioned with filemtime() for deterministic cache-busting
 * Deregisters all handles first to prevent duplicates
 */
add_action('wp_enqueue_scripts', function () {
  $dir = get_stylesheet_directory();
  $uri = get_stylesheet_directory_uri();

  // --- Safety: remove legacy/duplicate enqueues ---
  $all_styles = [
    'pf-child', 'pf-core', 'pf-workflows-main',
    'pf-workflow-header', 'pf-workflow-sidebar',
    'pf-workflow-sections', 'pf-workflow-variables', 'pf-workflow-steps',
    'pf-workflows' // old CSS
  ];
  foreach ($all_styles as $h) { 
    wp_dequeue_style($h); 
    wp_deregister_style($h); 
  }

  $all_scripts = [
    'pf-navigation-js', 'pf-workflows', 'pf-workflows-new',
    'pf-module-storage', 'pf-module-variables', 'pf-module-navigation', 
    'pf-module-copy', 'pf-module-progress', 'pf-module-steps', 'pf-module-keyboard',
    'pf-workflows-js', 'pf-workflow-navigation-js', 'pf-learn-use-mode-js'
  ];
  foreach ($all_scripts as $h) { 
    wp_dequeue_script($h); 
    wp_deregister_script($h); 
  }

  // --- Styles ---
  wp_enqueue_style(
    'pf-child',
    get_stylesheet_uri(),
    [],
    pf_ver('/style.css')
  );

  wp_enqueue_style(
    'pf-core',
    $uri . '/assets/css/pf-core.css',
    ['pf-child'],
    pf_ver('/assets/css/pf-core.css')
  );

  wp_enqueue_style(
    'pf-workflows-main',
    $uri . '/assets/css/pf-workflows-main.css',
    ['pf-core'],
    pf_ver('/assets/css/pf-workflows-main.css')
  );

  $components = [
    'workflow-header',
    'workflow-sidebar',
    'workflow-sections',
    'workflow-variables',
    'workflow-steps',
    'fast-track-toggle',
    'fast-track-content',
    // Modern namespace styles (scoped to `.pf-ui-modern`)
    'workflow-header-modern',
    'workflow-sidebar-modern',
    'workflow-info-modern',
    'workflow-variables-modern',
    'workflow-steps-modern',
  ];
  foreach ($components as $c) {
    wp_enqueue_style(
      "pf-$c",
      $uri . "/assets/css/components/$c.css",
      ['pf-workflows-main'],
      pf_ver("/assets/css/components/$c.css")
    );
  }

  // --- Scripts ---
  $nav_rel = '/assets/js/pf-navigation.js';
  $nav_abs = $dir . $nav_rel;
  $nav_deps = [];
  if (file_exists($nav_abs)) {
    $src = @file_get_contents($nav_abs);
    if ($src !== false && (strpos($src, '$(') !== false || strpos($src, 'jQuery(') !== false)) {
      $nav_deps[] = 'jquery';
    }
  }
  wp_enqueue_script(
    'pf-navigation-js',
    $uri . $nav_rel,
    $nav_deps,
    pf_ver($nav_rel),
    true
  );

  wp_enqueue_script(
    'pf-workflows',
    $uri . '/assets/js/pf-workflows.js',
    ['jquery'],
    pf_ver('/assets/js/pf-workflows.js'),
    true
  );
  
  // Tracking module (Fast Track Mode) - no jQuery dependency
  wp_enqueue_script(
    'pf-tracking',
    $uri . '/assets/js/modules/tracking.js',
    [],
    pf_ver('/assets/js/modules/tracking.js'),
    true
  );
  
  // Tracking init (auto-track visit on page load) - must load AFTER tracking module
  wp_enqueue_script(
    'pf-tracking-init',
    $uri . '/assets/js/pf-tracking-init.js',
    ['pf-tracking'],
    pf_ver('/assets/js/pf-tracking-init.js'),
    true
  );
  
  // Fast Track module (toggle & content adaptation) - must load AFTER tracking
  wp_enqueue_script(
    'pf-fast-track',
    $uri . '/assets/js/modules/fast-track.js',
    ['pf-tracking'],
    pf_ver('/assets/js/modules/fast-track.js'),
    true
  );
  
  // Localize workflow data (only on workflow pages)
  if (is_singular('workflows')) {
    wp_localize_script('pf-workflows', 'workflowData', [
      'postId' => get_the_ID(),
      'ajaxUrl' => admin_url('admin-ajax.php'),
      'nonce' => wp_create_nonce('workflow_actions')
    ]);
  }
}, 20);

/* =====================================================
   PF DEBUG PANEL - Enqueue Debugger
===================================================== */
/**
 * Display debug panel showing all enqueued PF assets
 * Accessible to admins via ?pfdebug=1
 */
function pf_debug_enqueues_panel() {
    // Only for admins with ?pfdebug=1
    if (!current_user_can('manage_options') || !isset($_GET['pfdebug'])) {
        return;
    }
    
    global $wp_styles, $wp_scripts;
    
    $pf_styles = array();
    $pf_scripts = array();
    
    // Collect PF styles
    if (!empty($wp_styles->queue)) {
        foreach ($wp_styles->queue as $handle) {
            if (strpos($handle, 'pf-') === 0 || strpos($handle, 'pf_') === 0) {
                $style = $wp_styles->registered[$handle] ?? null;
                if ($style) {
                    $pf_styles[] = array(
                        'handle' => $handle,
                        'src' => $style->src,
                        'ver' => $style->ver,
                        'deps' => !empty($style->deps) ? implode(', ', $style->deps) : '(none)'
                    );
                }
            }
        }
    }
    
    // Collect PF scripts
    if (!empty($wp_scripts->queue)) {
        foreach ($wp_scripts->queue as $handle) {
            if (strpos($handle, 'pf-') === 0 || strpos($handle, 'pf_') === 0) {
                $script = $wp_scripts->registered[$handle] ?? null;
                if ($script) {
                    $pf_scripts[] = array(
                        'handle' => $handle,
                        'src' => $script->src,
                        'ver' => $script->ver,
                        'deps' => !empty($script->deps) ? implode(', ', $script->deps) : '(none)'
                    );
                }
            }
        }
    }
    
    // Output debug panel
    ?>
    <div id="pf-debug-panel" style="position:fixed;bottom:0;left:0;right:0;max-height:40vh;overflow:auto;background:rgba(0,0,0,0.95);color:#0f0;font-family:monospace;font-size:12px;padding:20px;z-index:999999;border-top:3px solid lime;box-shadow:0 -4px 20px rgba(0,255,0,0.3);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
            <h3 style="margin:0;color:lime;font-size:16px;font-weight:bold;">
                🔍 PF DEBUG PANEL - Enqueued Assets
            </h3>
            <button onclick="this.parentElement.parentElement.remove()" style="background:lime;color:#000;border:none;padding:5px 12px;cursor:pointer;font-weight:bold;border-radius:3px;">
                CLOSE [X]
            </button>
        </div>
        
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
            <!-- STYLES -->
            <div>
                <h4 style="color:#0ff;margin:0 0 10px 0;border-bottom:1px solid #0ff;padding-bottom:5px;">
                    📦 STYLES (<?php echo count($pf_styles); ?>)
                </h4>
                <?php if (empty($pf_styles)): ?>
                    <p style="color:#ff0;margin:5px 0;">⚠️ No PF styles found!</p>
                <?php else: ?>
                    <table style="width:100%;border-collapse:collapse;">
                        <thead>
                            <tr style="background:rgba(0,255,0,0.1);">
                                <th style="text-align:left;padding:5px;border:1px solid #0f0;">Handle</th>
                                <th style="text-align:left;padding:5px;border:1px solid #0f0;">Ver</th>
                                <th style="text-align:left;padding:5px;border:1px solid #0f0;">Deps</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($pf_styles as $style): ?>
                                <tr>
                                    <td style="padding:5px;border:1px solid #333;color:#0f0;">
                                        <strong><?php echo esc_html($style['handle']); ?></strong><br>
                                        <small style="color:#888;"><?php echo esc_html($style['src']); ?></small>
                                    </td>
                                    <td style="padding:5px;border:1px solid #333;color:#ff0;">
                                        <?php echo esc_html($style['ver'] ?? 'none'); ?>
                                    </td>
                                    <td style="padding:5px;border:1px solid #333;color:#0ff;">
                                        <small><?php echo esc_html($style['deps']); ?></small>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                <?php endif; ?>
            </div>
            
            <!-- SCRIPTS -->
            <div>
                <h4 style="color:#0ff;margin:0 0 10px 0;border-bottom:1px solid #0ff;padding-bottom:5px;">
                    ⚡ SCRIPTS (<?php echo count($pf_scripts); ?>)
                </h4>
                <?php if (empty($pf_scripts)): ?>
                    <p style="color:#ff0;margin:5px 0;">⚠️ No PF scripts found!</p>
                <?php else: ?>
                    <table style="width:100%;border-collapse:collapse;">
                        <thead>
                            <tr style="background:rgba(0,255,0,0.1);">
                                <th style="text-align:left;padding:5px;border:1px solid #0f0;">Handle</th>
                                <th style="text-align:left;padding:5px;border:1px solid #0f0;">Ver</th>
                                <th style="text-align:left;padding:5px;border:1px solid #0f0;">Deps</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($pf_scripts as $script): ?>
                                <tr>
                                    <td style="padding:5px;border:1px solid #333;color:#0f0;">
                                        <strong><?php echo esc_html($script['handle']); ?></strong><br>
                                        <small style="color:#888;"><?php echo esc_html($script['src']); ?></small>
                                    </td>
                                    <td style="padding:5px;border:1px solid #333;color:#ff0;">
                                        <?php echo esc_html($script['ver'] ?? 'none'); ?>
                                    </td>
                                    <td style="padding:5px;border:1px solid #333;color:#0ff;">
                                        <small><?php echo esc_html($script['deps']); ?></small>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                <?php endif; ?>
            </div>
        </div>
        
        <div style="margin-top:15px;padding-top:10px;border-top:1px solid #333;color:#888;font-size:11px;">
            💡 Tip: Check "Ver" column for cache-busting (should show filemtime timestamps). 
            Reload page to see changes. URL: <code style="color:#0ff;"><?php echo esc_url(add_query_arg('pfdebug', '1')); ?></code>
        </div>
    </div>
    <?php
}
add_action('wp_footer', 'pf_debug_enqueues_panel', 999);

add_action('wp_enqueue_scripts', function(){
    if (!is_singular('workflows')) {
        return;
    }
    wp_localize_script('pf-workflows', 'PF_API', [
        'base'  => esc_url_raw(rest_url('pf/v1/')),
        'nonce' => wp_create_nonce('wp_rest'),
    ]);
}, 21);

/* ========================================
   HEAD CLEANUP & FALLBACKS
   ======================================== */

/**
 * Ensure single viewport meta tag
 * Prevents duplicate viewport tags from theme/plugins
 * Priority 0 runs early to catch duplicates
 */
add_action('wp_head', function () {
    // WordPress core and most themes/plugins add viewport at priority 10
    // If your theme or a plugin adds a second viewport, you can prevent your own duplicate.
    // Do not echo another viewport here if Rank Math/core already emitted one.
    // This is a placeholder for future cleanup if needed - WordPress core handles viewport by default.
}, 0);

/**
 * Preconnect for Google Fonts
 * Priority 1 runs early for performance
 */
add_action('wp_head', function() {
    echo '<link rel="preconnect" href="https://fonts.googleapis.com">' . "\n";
    echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' . "\n";
}, 1);

/**
 * Force correct html lang for workflows CPT
 * Since this is an international site, we use en-US for workflows
 */
add_filter('language_attributes', function($output) {
    if (is_singular('workflows')) {
        // Force en-US for workflows (international content)
        $output = preg_replace('/lang="[^"]*"/', 'lang="en-US"', $output);
    }
    return $output;
});

/**
 * Rank Math fallbacks (only if plugin is active)
 * Check for Rank Math using multiple methods for compatibility
 */
if (class_exists('RankMath') || class_exists('RankMath\Plugin') || defined('RANK_MATH_VERSION')) {
    // Description fallback for single workflows
    add_filter('rank_math/frontend/description', function($desc) {
        if (!$desc && is_singular('workflows')) {
            $desc = get_field('summary', get_the_ID());
            if (!$desc) {
                $desc = __('This workflow tests all available ACF fields and guides you step by step.', 'prompt-finder');
            }
        }
        return $desc;
    });
    
    // OG/Twitter descriptions mirror the same fallback
    add_filter('rank_math/opengraph/facebook/og_description', function($d) {
        return $d ?: apply_filters('rank_math/frontend/description', '');
    });
    
    add_filter('rank_math/opengraph/twitter/description', function($d) {
        return $d ?: apply_filters('rank_math/frontend/description', '');
    });
    
    // Site name typo guard (if any)
    add_filter('rank_math/opengraph/facebook/site_name', function($name) {
        if ($name) {
            // Fix common typo: "rompt Finder" -> "Prompt Finder"
            $name = str_replace('rompt Finder', 'Prompt Finder', $name);
            // Also fix any case variations
            $name = str_replace('rompt finder', 'Prompt Finder', $name);
            $name = str_replace('ROMPT FINDER', 'Prompt Finder', $name);
        } else {
            $name = 'Prompt Finder';
        }
        return $name;
    });
    
    // Twitter site name fallback
    add_filter('rank_math/opengraph/twitter/site', function($site) {
        if (!$site) {
            $site = '@promptfinder'; // Adjust to your actual Twitter handle
        }
        return $site;
    });
}

/**
 * Fallback og:site_name meta tag (for non-Rank Math setups)
 * Only outputs if SEO plugin didn't set it correctly or it's malformed
 * Priority 99 runs late so SEO plugins can override if correct
 */
add_action('wp_head', function () {
    // Skip if Rank Math is active (it handles this)
    $rank_math_active = class_exists('RankMath') || class_exists('RankMath\Plugin') || defined('RANK_MATH_VERSION');
    if ($rank_math_active) {
        return;
    }
    
    // Check if og:site_name already exists in output buffer
    // Note: We can't easily check existing output, so this is a safe fallback
    // that SEO plugins can override if they output it earlier
    
    $site_name = get_bloginfo('name');
    if (empty($site_name)) {
        return; // Don't output empty site name
    }
    
    // Fix potential typo
    $site_name = str_replace('rompt Finder', 'Prompt Finder', $site_name);
    
    // Output og:site_name as fallback
    // SEO plugins (Rank Math, Yoast, etc.) should output this earlier and correctly
    // This ensures it's always present even if plugin fails or outputs malformed data
    echo "\n" . '<meta property="og:site_name" content="' . esc_attr($site_name) . '">' . "\n";
}, 99);

// Prompt Finder autoload + variables localize bootstrap
require_once __DIR__ . '/app/bootstrap/pf-autoload.php';
require_once __DIR__ . '/app/bootstrap/pf-variables-localize.php';


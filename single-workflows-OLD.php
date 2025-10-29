<?php
declare(strict_types=1);

/**
 * Single Template: Workflows
 * 
 * @package PromptFinder
 * @since 1.0.0
 * 
 * Features:
 * - Uses ACF fields for workflow content
 * - Reads PF_CONFIG (JSON) for feature flags & copy strings (server-side)
 * - Improved variables UX (labels, descriptions, required, first-time hint)
 * - Clean step header (badge via CSS, time chip on the right)
 * - Enhanced security and error handling
 * - Optimized performance with caching
 */

get_header();
the_post();

/* -------------------------------------------------------
   Load PF_CONFIG using optimized helper function
-------------------------------------------------------- */
try {
    $PF_CONFIG = pf_load_config();
    $PF_FLAGS = $PF_CONFIG['feature_flags'] ?? [];
    $PF_COPY = $PF_CONFIG['copy'] ?? [];
} catch (Exception $e) {
    error_log('[PF Single] Config loading error: ' . $e->getMessage());
    $PF_CONFIG = [];
    $PF_FLAGS = [];
    $PF_COPY = [];
}

/* -------------------------------------------------------
   Load from optimized table (primary source)
   All new workflows are saved directly to the optimized table
-------------------------------------------------------- */
$optimized_workflow = null;
if (class_exists('PromptFinderCore')) {
    try {
        $pf_core = new PromptFinderCore();
        $optimized_workflow = $pf_core->get_optimized_workflow(get_the_ID());
        
        if ($optimized_workflow) {
            error_log('[PF Single] Using optimized workflow data for post ID: ' . get_the_ID());
        } else {
            error_log('[PF Single] No optimized workflow data found for post ID: ' . get_the_ID() . ' - using ACF fallback');
        }
    } catch (Exception $e) {
        error_log('[PF Single] Optimized workflow loading error: ' . $e->getMessage());
    }
}

/* -------------------------------------------------------
   ACF fields (content per workflow) - with error handling
   Use optimized table if available, fallback to ACF
-------------------------------------------------------- */
try {
    if ($optimized_workflow) {
        // Use optimized table data
        $summary = $optimized_workflow['summary'] ?? '';
        $use_case = function_exists('get_field') ? get_field('use_case') : ''; // Not in optimized table yet
        $version = $optimized_workflow['version'] ?? '';
        $latest_update = $optimized_workflow['latest_update'] ?? '';
        $steps = $optimized_workflow['steps'] ?? [];
        $has_steps = is_array($steps) && count($steps) > 0;
        $total_steps = $has_steps ? count($steps) : 0;
        
        // New ACF fields
        $stable_version = function_exists('get_field') ? get_field('is_stable') : false;
        $auto_update_allowed = function_exists('get_field') ? get_field('auto_update_allowed') : false;
        $changelog = function_exists('get_field') ? get_field('changelog') : '';
        $changelog_json = function_exists('get_field') ? get_field('changelog_json') : '';
        
        // Update usage count from optimized table
        $usage_count = $optimized_workflow['usage_count'] ?? 0;
    } else {
        // Fallback to ACF fields
        $summary = function_exists('get_field') ? get_field('summary') : '';
        $use_case = function_exists('get_field') ? get_field('use_case') : '';
        $version = function_exists('get_field') ? get_field('version') : '';
        $latest_update = function_exists('get_field') ? get_field('last_update') : ''; // returns d/m/Y per ACF
        $steps = function_exists('get_field') ? get_field('steps') : []; // repeater
        $has_steps = is_array($steps) && count($steps) > 0;
        $total_steps = $has_steps ? count($steps) : 0;
        
        // New ACF fields
        $stable_version = function_exists('get_field') ? get_field('is_stable') : false;
        $auto_update_allowed = function_exists('get_field') ? get_field('auto_update_allowed') : false;
        $changelog = function_exists('get_field') ? get_field('changelog') : '';
        $changelog_json = function_exists('get_field') ? get_field('changelog_json') : '';
        
        $usage_count = 0;
    }
} catch (Exception $e) {
    error_log('[PF Single] ACF fields error: ' . $e->getMessage());
    $summary = '';
    $use_case = '';
    $version = '';
    $latest_update = '';
    $steps = [];
    $has_steps = false;
    $total_steps = 0;
    $stable_version = false;
    $auto_update_allowed = false;
    $changelog = '';
    $changelog_json = '';
    $usage_count = 0;
}

/* New workflow fields - with error handling */
try {
    $inputs_prerequisites = function_exists('get_field') ? get_field('inputs_prerequisites') : '';
    $requires_source_content = function_exists('get_field') ? get_field('requires_source_content') : false;
} catch (Exception $e) {
    error_log('[PF Single] New workflow fields error: ' . $e->getMessage());
    $inputs_prerequisites = '';
    $requires_source_content = false;
}

/* Workflow Variables (Global) - with error handling */
/* Support BOTH old and new field names for backward compatibility */
try {
    $workflow_variables = [];
    
    // Try new field name first
    if (function_exists('get_field')) {
        $new_vars = get_field('variables_workflow');
        if (!empty($new_vars) && is_array($new_vars)) {
            $workflow_variables = $new_vars;
        } else {
            // Fallback to old field name 'pf_variables'
            $old_vars = get_field('pf_variables');
            if (!empty($old_vars) && is_array($old_vars)) {
                $workflow_variables = $old_vars;
            }
        }
    }
} catch (Exception $e) {
    error_log('[PF Single] Workflow variables error: ' . $e->getMessage());
    $workflow_variables = [];
}

/* Value-Highlights - with error handling */
try {
    $pain_point = function_exists('get_field') ? get_field('pain_points') : '';
    $expected_outcome = function_exists('get_field') ? get_field('expected_outcome') : '';
    $time_saved_min = function_exists('get_field') ? get_field('time_saved_min') : 0; // int
    $difficulty_wo_ai = function_exists('get_field') ? get_field('difficulty_without_ai') : 0; // 1–5
    $difficulty_level = (int) ($difficulty_wo_ai ?: 0);
    $difficulty_level = max(0, min($difficulty_level, 5));
} catch (Exception $e) {
    error_log('[PF Single] Value highlights error: ' . $e->getMessage());
    $pain_point = '';
    $expected_outcome = '';
    $time_saved_min = 0;
    $difficulty_wo_ai = 0;
    $difficulty_level = 0;
}

/* -------------------------------------------------------
   GATING – robuste Priorität & Hilfsfunktionen
   Priorität: ACF > PF_CONFIG > Defaults
   Felder:
   - access_mode: 'free' | 'half_locked' | 'pro'
   - free_step_limit: int (ab welchem Step gelockt wird, Standard 1)
   - login_required: bool (bei half_locked: Login notwendig?)
-------------------------------------------------------- */

// 1) ACF
$acf_access_mode     = is_string(get_field('access_mode')) ? trim(strtolower(get_field('access_mode'))) : '';
$acf_free_step_limit = get_field('free_step_limit');
$acf_free_step_limit = is_numeric($acf_free_step_limit) ? (int)$acf_free_step_limit : null;
$acf_login_required  = (bool) get_field('login_required');

// 2) PF_CONFIG Defaults (optional)
$cfg_defaults = $PF_CONFIG['workflow_defaults'] ?? [];
$cfg_access_mode     = isset($cfg_defaults['access_mode']) ? trim(strtolower((string)$cfg_defaults['access_mode'])) : '';
$cfg_free_step_limit = isset($cfg_defaults['free_step_limit']) ? (int)$cfg_defaults['free_step_limit'] : null;
$cfg_login_required  = isset($cfg_defaults['login_required']) ? (bool)$cfg_defaults['login_required'] : false;

// 3) Harte Defaults
$def_access_mode     = 'free';
$def_free_step_limit = 1;
$def_login_required  = false;

// 4) Effektive Werte (ACF > CFG > DEF)
$ACCESS_MODE     = $acf_access_mode ?: ($cfg_access_mode ?: $def_access_mode);
$FREE_STEP_LIMIT = ($acf_free_step_limit !== null) ? $acf_free_step_limit
                  : (($cfg_free_step_limit !== null) ? $cfg_free_step_limit : $def_free_step_limit);
$LOGIN_REQUIRED  = ($acf_login_required !== null) ? (bool)$acf_login_required
                  : ($cfg_login_required ?? $def_login_required);

// 5) User-Plan - using function from functions.php
$USER_PLAN = pf_get_user_plan();
$viewer_logged_in  = is_user_logged_in();
$is_pro_user       = ($USER_PLAN === 'pro');

/**
 * Step-Lock-Helper (1-basiert)
 * 
 * @since 1.0.0
 * @param int $idx Step index (1-based)
 * @param string $mode Access mode ('free', 'half_locked', 'pro')
 * @param string $userPlan User plan ('guest', 'free', 'pro')
 * @param int $limit Free step limit
 * @param bool $loginRequired Login required for locked steps
 * @param bool $loggedIn User is logged in
 * @return bool True if step is locked
 */
function pf_step_is_locked(int $idx, string $mode, string $userPlan, int $limit, bool $loginRequired, bool $loggedIn): bool {
    try {
        // Validate inputs
        if ($idx < 1) return false;
        
        if ($mode === 'free') return false;                 // alles frei
        if ($userPlan === 'pro') return false;              // Pro sieht alles
        if ($mode === 'pro') return true;                   // komplette Paywall (früher Abbruch, hier fallback)
        
        if ($mode === 'half_locked') {
            $limit = max(1, $limit);
            if ($idx <= $limit) return false;                 // innerhalb der freien Steps immer frei
            // ab dem ersten gelockten Step:
            if ($loginRequired) {
                // Login ist Pflicht – gelockt, solange nicht eingeloggt
                return !$loggedIn;
            }
            // kein Login zwingend – gelockt für alle außer Pro (oben abgefangen)
            return true;
        }
        
        // Unbekannter Modus → nichts sperren
        return false;
    } catch (Exception $e) {
        error_log('[PF Single] Step lock check error: ' . $e->getMessage());
        return false; // Fail open for safety
    }
}

/* -------------------------------------------------------
   Favoriten-Status - with error handling
-------------------------------------------------------- */
$is_fav = false;
try {
    if (is_user_logged_in()) {
        $f = get_user_meta(get_current_user_id(), 'pf_favs', true);
        $is_fav = is_array($f) && in_array(get_the_ID(), $f, true);
    }
} catch (Exception $e) {
    error_log('[PF Single] Favorites check error: ' . $e->getMessage());
    $is_fav = false;
}
?>
<?php
// Get new ACF fields
$tagline = function_exists('get_field') ? get_field('tagline') : '';
$workflow_id = function_exists('get_field') ? get_field('workflow_id') : '';
$estimated_time = function_exists('get_field') ? get_field('estimated_time_min') : '';

/* ===== Mode-Label vorbereiten (MUSS vor dem Badge passieren) ===== */
$mode_label = 'Free';
$mode_sub   = '';
if ($ACCESS_MODE === 'pro') {
  $mode_label = 'Pro';
  $mode_sub   = $PF_COPY['badge_pro_sub'] ?? 'Members only';
} elseif ($ACCESS_MODE === 'half_locked') {
  $mode_label = $PF_COPY['badge_limited'] ?? 'Limited';
  $free_txt = ($FREE_STEP_LIMIT === 1)
    ? ($PF_COPY['badge_limited_1'] ?? '1 step free')
    : str_replace('{n}', (string)$FREE_STEP_LIMIT, ($PF_COPY['badge_limited_n'] ?? '{n} steps free'));
  if (!empty($LOGIN_REQUIRED)) {
    $login_txt = $PF_COPY['badge_login_needed'] ?? 'Login needed';
    $mode_sub  = $free_txt . ' • ' . $login_txt;
  } else {
    $mode_sub  = $free_txt;
  }
} else {
  $mode_label = $PF_COPY['badge_free'] ?? 'Free';
  $mode_sub   = $PF_COPY['badge_free_sub'] ?? 'All steps unlocked';
}
?>

<div class="pf-workflows" data-mode="learn" data-workflow-id="<?php echo esc_attr($workflow_id); ?>">
  <div class="pf-wrap">
    <header class="pf-header">
    <!-- Title Section with Workflow ID -->
    <div class="pf-title-section">
      <div class="pf-title-row">
        <h1 class="pf-title"><?php the_title(); ?></h1>
        <?php if (!empty($workflow_id)): ?>
          <span class="pf-workflow-id">#<?php echo esc_html($workflow_id); ?></span>
        <?php endif; ?>
      </div>
    </div>

    <!-- Tagline directly under title -->
    <?php if (!empty($tagline)): ?>
      <div class="pf-tagline">
        <p><?php echo wp_kses_post($tagline); ?></p>
      </div>
    <?php endif; ?>

    <!-- Use Case under tagline -->
    <?php if (!empty($use_case)): ?>
      <div class="pf-use-case">
        <p><?php echo wp_kses_post($use_case); ?></p>
      </div>
    <?php endif; ?>

    <!-- Info Chips: Version, Last Update, Estimated Time, Time Saved, Difficulty -->
    <?php if ($version || $latest_update || $estimated_time || $time_saved_min || $difficulty_wo_ai): ?>
      <div class="pf-info-chips">
        <?php if ($version): ?>
          <span class="pf-chip pf-chip--version">
            <span class="pf-chip-icon">🏷️</span>
            <span class="pf-chip-text"><?php echo esc_html($version); ?></span>
          </span>
        <?php endif; ?>
        
        <?php if ($latest_update): ?>
          <span class="pf-chip pf-chip--update">
            <span class="pf-chip-icon">🕒</span>
            <span class="pf-chip-text">Updated: <?php echo esc_html($latest_update); ?></span>
          </span>
        <?php endif; ?>
        
        <?php if ($estimated_time): ?>
          <span class="pf-chip pf-chip--time">
            <span class="pf-chip-icon">⏱️</span>
            <span class="pf-chip-text"><?php echo esc_html($estimated_time); ?> min</span>
          </span>
        <?php endif; ?>
        
        <?php if ($time_saved_min && $time_saved_min > 0): ?>
          <span class="pf-chip pf-chip--saved">
            <span class="pf-chip-icon">⚡</span>
            <span class="pf-chip-text">Saves <?php echo esc_html($time_saved_min); ?> min</span>
          </span>
        <?php endif; ?>
        
        <?php if ($difficulty_wo_ai && $difficulty_wo_ai > 0): ?>
          <span class="pf-chip pf-chip--difficulty">
            <span class="pf-chip-icon">🎯</span>
            <span class="pf-chip-text">Without AI: <?php echo esc_html($difficulty_level); ?>/5</span>
          </span>
        <?php endif; ?>
      </div>
    <?php endif; ?>

    <!-- Action Bar: Mode Toggle + CTA + Badges -->
    <div class="pf-action-bar">
      <!-- Left: Access Badge -->
      <div class="pf-action-left">
        <div class="pf-modebadge" data-mode="<?php echo esc_attr($ACCESS_MODE); ?>" data-tooltip="<?php echo esc_attr($mode_sub ? $mode_label . ': ' . $mode_sub : $mode_label); ?>">
          <span class="pf-modebadge__label"><?php echo esc_html($mode_label); ?></span>
          <?php if ($mode_sub): ?>
            <span class="pf-modebadge__sub"><?php echo esc_html($mode_sub); ?></span>
          <?php endif; ?>
        </div>
      </div>

      <!-- Center: Mode Toggle -->
      <div class="pf-action-center">
        <div class="pf-mode-toggle">
          <button class="pf-toggle-btn pf-toggle-learn active" data-mode="learn">
            <span class="pf-toggle-icon">📚</span>
            <span class="pf-toggle-text">Learn</span>
          </button>
          <button class="pf-toggle-btn pf-toggle-use" data-mode="use">
            <span class="pf-toggle-icon">⚡</span>
            <span class="pf-toggle-text">Use</span>
          </button>
        </div>
      </div>

      <!-- Right: Quick Action CTA -->
      <div class="pf-action-right">
        <!-- Jump to first step button removed -->
      </div>
    </div>

	  
<?php
/* Optional: Legende schalten – akzeptiere beide Keys */
$show_legend = !empty($PF_FLAGS['mode_legend']) || !empty($PF_FLAGS['gating']);
?>

<!-- ===== Favorites Bar ===== -->
<div class="pf-favorites-bar">
  <div class="pf-favorites-content">
    <button class="pf-fav-btn <?php echo $is_fav ? 'is-on' : ''; ?>"
            data-post-id="<?php echo esc_attr(get_the_ID()); ?>"
            aria-pressed="<?php echo $is_fav ? 'true' : 'false'; ?>">
      <span class="pf-fav-ico">♥</span>
      <span class="pf-fav-label"><?php echo $is_fav ? 'Saved' : 'Save'; ?></span>
    </button>
  </div>
</div>


    <?php if (!empty($PF_CONFIG['layout']['show_info_pills'])): ?>
      <!-- Old chips removed - now using Learn/Use Mode system -->
    <?php endif; ?>

    <?php if ($changelog && !empty($PF_FLAGS['show_changelog'])): ?>
      <details class="pf-changelog pf-tile" style="margin-top: 1rem;">
        <summary>
          <strong><?php echo esc_html($PF_COPY['changelog_title'] ?? 'What\'s new in this version'); ?></strong>
        </summary>
        <div class="pf-changelog-content">
          <?php echo nl2br(esc_html($changelog)); ?>
        </div>
      </details>
    <?php endif; ?>

    <?php if (!empty($PF_CONFIG['layout']['show_thumbnail']) && has_post_thumbnail()): ?>
      <div class="pf-thumb"><?php the_post_thumbnail('large'); ?></div>
    <?php endif; ?>

    <!-- Old value panel removed - now using Learn/Use Mode system -->
	  

    <?php if ($total_steps > 1 && !empty($PF_FLAGS['howto_box'])): ?>
      <?php $howto_pref_key = 'pf_hide_howto_' . get_the_ID(); ?>
      <details class="pf-howto pf-tile" data-pref-key="<?php echo esc_attr($howto_pref_key); ?>" open>
        <summary>
          <?php echo esc_html($PF_COPY['howto_title'] ?? 'How to use this workflow:'); ?>
        </summary>

        <?php $items = $PF_COPY['howto_items'] ?? []; if ($items && is_array($items)): ?>
          <ol>
            <?php foreach ($items as $item): ?>
              <li><?php echo wp_kses_post($item); ?></li>
            <?php endforeach; ?>
          </ol>
        <?php endif; ?>

        <button type="button" class="pf-howto-hide" data-action="hide-howto">
          Don’t show again
        </button>
      </details>
    <?php endif; ?>

    <?php if ( current_user_can('manage_options') ): ?>
      <details class="pf-debug" style="margin:1rem 0;padding:1rem;border:1px dashed #bbb;border-radius:12px;">
        <summary style="cursor:pointer;font-weight:600;">Workflow Gate – Debug</summary>
        <div style="font-family:ui-monospace, SFMono-Regular, Menlo, monospace; font-size:.9rem; line-height:1.5;">
          <strong>Effective:</strong>
          <pre><?php echo esc_html(print_r([
            'ACCESS_MODE' => $ACCESS_MODE,
            'FREE_STEP_LIMIT' => $FREE_STEP_LIMIT,
            'LOGIN_REQUIRED' => $LOGIN_REQUIRED,
            'USER_PLAN' => $USER_PLAN,
          ], true)); ?></pre>

          <strong>ACF Raw:</strong>
          <pre><?php echo esc_html(print_r([
            'access_mode' => get_field('access_mode'),
            'free_step_limit' => get_field('free_step_limit'),
            'login_required' => get_field('login_required'),
          ], true)); ?></pre>

          <strong>PF_CONFIG Defaults:</strong>
          <pre><?php echo esc_html(print_r($cfg_defaults, true)); ?></pre>
        </div>
      </details>
    <?php endif; ?>

  </header>

  <!-- Inputs Prerequisites (if set) -->
  <?php if (!empty($inputs_prerequisites)): ?>
    <div class="pf-prerequisites pf-tile">
      <div class="pf-prerequisites-header">
        <span class="pf-prerequisites-icon">📝</span>
        <h3 class="pf-prerequisites-title"><?php esc_html_e('What you need before starting', 'prompt-finder'); ?></h3>
      </div>
      <div class="pf-prerequisites-content">
        <?php echo wp_kses_post(nl2br($inputs_prerequisites)); ?>
      </div>
      <?php if ($requires_source_content): ?>
        <div class="pf-prerequisites-warning">
          <span class="pf-warning-icon">🔒</span>
          <strong><?php esc_html_e('Privacy Note:', 'prompt-finder'); ?></strong>
          <?php esc_html_e('You will paste your content directly into ChatGPT, not into Prompt Finder. Remove any personal names, email addresses, salaries, or confidential information first.', 'prompt-finder'); ?>
        </div>
      <?php endif; ?>
    </div>
  <?php endif; ?>

  <!-- Workflow Variables (Global) -->
  <?php if (!empty($workflow_variables)): ?>
    <div class="pf-workflow-variables">
      <div class="pf-workflow-vars-card">
        <div class="pf-workflow-vars-card-header">
          <div class="pf-workflow-vars-icon">🎯</div>
          <div>
            <h3 class="pf-workflow-vars-title">Customize this workflow</h3>
            <p class="pf-workflow-vars-subtitle">Set your preferences once. They'll apply to all steps.</p>
          </div>
        </div>
        
        <div class="pf-workflow-vars-list">
          <?php foreach ($workflow_variables as $wf_var):
            // Support BOTH old and new field names for backward compatibility
            $var_key = $wf_var['workflow_var_key'] ?? ($wf_var['var_key'] ?? '');
            $var_label = $wf_var['workflow_var_label'] ?? ($wf_var['label'] ?? '');
            $var_placeholder = $wf_var['workflow_var_placeholder'] ?? ($wf_var['placeholder'] ?? '');
            $var_hint = $wf_var['workflow_var_hint'] ?? ($wf_var['hint'] ?? '');
            $var_required = !empty($wf_var['workflow_var_required'] ?? $wf_var['required'] ?? false);
            $var_default = $wf_var['workflow_var_default_value'] ?? ($wf_var['default_value'] ?? '');
            $var_prefer_system = !empty($wf_var['workflow_var_prefer_system'] ?? $wf_var['prefer_profile_value'] ?? false);
            
            if (empty($var_label)) {
              $var_label = ucwords(str_replace(['_', '-'], ' ', $var_key));
            }
          ?>
            <div class="pf-workflow-var-item">
              <label class="pf-workflow-var-label">
                <?php echo esc_html($var_label); ?>
                <?php if ($var_required): ?>
                  <span class="pf-req-mark" title="Required">*</span>
                <?php endif; ?>
                <?php if ($var_prefer_system): ?>
                  <span class="pf-system-link" title="Can use system default">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 1L9.293 4.293L13.586 4.586L10.293 7.879L11 12.293L7 10.586L3 12.293L3.707 7.879L0.414 4.586L4.707 4.293L7 1Z" stroke="currentColor" stroke-width="1.2" fill="none" stroke-linecap="round"/>
                    </svg>
                  </span>
                <?php endif; ?>
              </label>
              
              <?php if ($var_hint): ?>
                <p class="pf-workflow-var-hint"><?php echo esc_html($var_hint); ?></p>
              <?php endif; ?>
              
              <input type="text"
                     class="pf-workflow-var-input"
                     id="<?php echo esc_attr('pf-wf-var-' . sanitize_title($var_key)); ?>"
                     name="<?php echo esc_attr('pf_wf_var_' . sanitize_title($var_key)); ?>"
                     data-var-key="<?php echo esc_attr($var_key); ?>"
                     data-var-type="workflow"
                     placeholder="<?php echo esc_attr($var_placeholder); ?>"
                     value="<?php echo esc_attr($var_default); ?>"
                     <?php if ($var_required): ?>required aria-required="true"<?php endif; ?>>
            </div>
          <?php endforeach; ?>
        </div>
      </div>
    </div>
  <?php endif; ?>

  <!-- Learn Mode: Show more details -->
  <div class="pf-learn-content">
    <?php if ($summary): ?>
      <div class="pf-info-card pf-info-card--summary">
        <div class="pf-info-card-header">
          <div class="pf-info-card-icon">📋</div>
          <h3 class="pf-info-card-title">Summary</h3>
        </div>
        <div class="pf-info-card-content">
          <p><?php echo wp_kses_post($summary); ?></p>
        </div>
      </div>
    <?php endif; ?>
    
    <?php if ($expected_outcome): ?>
      <div class="pf-info-card pf-info-card--outcome">
        <div class="pf-info-card-header">
          <div class="pf-info-card-icon">🎯</div>
          <h3 class="pf-info-card-title">Expected Outcome</h3>
        </div>
        <div class="pf-info-card-content">
          <div class="pf-outcome-content"><?php echo wp_kses_post($expected_outcome); ?></div>
        </div>
      </div>
    <?php endif; ?>
    
    <?php if ($pain_point): ?>
      <div class="pf-info-card pf-info-card--pain">
        <div class="pf-info-card-header">
          <div class="pf-info-card-icon">⚠️</div>
          <h3 class="pf-info-card-title">Pain Points</h3>
        </div>
        <div class="pf-info-card-content">
          <div class="pf-pain-content"><?php echo wp_kses_post($pain_point); ?></div>
        </div>
      </div>
    <?php endif; ?>
  </div>
  
  <!-- Use Mode: Show minimal details -->
  <div class="pf-use-content" style="display: none;">
    <?php if ($expected_outcome): ?>
      <div class="pf-info-card pf-info-card--outcome pf-info-card--compact">
        <div class="pf-info-card-header">
          <div class="pf-info-card-icon">🎯</div>
          <h3 class="pf-info-card-title">Expected Outcome</h3>
        </div>
        <div class="pf-info-card-content">
          <div class="pf-outcome-content"><?php echo wp_kses_post($expected_outcome); ?></div>
        </div>
      </div>
    <?php endif; ?>
  </div>

  <!-- Sticky Quick-Access Bar (Use Mode only) -->
  <div class="pf-sticky-quickbar" style="display: none;">
    <div class="pf-quickbar-content">
      <div class="pf-quickbar-actions">
        <?php if ($has_steps && count($steps) > 1): ?>
          <button class="pf-quickbar-btn pf-btn--primary" data-action="show-step-navigation">
            <span class="pf-quickbar-icon">📋</span>
            <span class="pf-quickbar-text">Step list</span>
          </button>
        <?php endif; ?>
      </div>
      <div class="pf-quickbar-progress">
        <span class="pf-quickbar-progress-text">Ready to start</span>
      </div>
    </div>
  </div>

  <?php
  /* -------------------------------------------------------
     FULL-LOCK (Pro): zentrale Paywall und Steps nicht rendern
     - Pro-User sehen alles
  -------------------------------------------------------- */
  if ($ACCESS_MODE === 'pro' && !$is_pro_user): ?>
    <section class="pf-locked-all">
      <div class="pf-lock-box">
        <strong><?php esc_html_e('Pro workflow', 'prompt-finder'); ?></strong>
        <p class="pf-sub"><?php esc_html_e('Upgrade to unlock all steps of this workflow.', 'prompt-finder'); ?></p>
        <div class="pf-lock-actions">
          <a class="pf-btn pf-btn--primary" href="/pricing"><?php esc_html_e('View plans', 'prompt-finder'); ?></a>
          <a class="pf-btn" href="/login"><?php esc_html_e('Log in', 'prompt-finder'); ?></a>
        </div>
      </div>
    </section>
  <?php
    get_footer();
    return;
  endif;
  ?>

  <div class="pf-content">
    <?php if (!$has_steps): ?>
      <p class="pf-empty"><?php _e('No steps defined for this workflow yet.', 'prompt-finder'); ?></p>
    <?php else: ?>
      <ol class="pf-steps" id="pf-steps">
        <?php foreach ($steps as $i => $s):
          $idx        = $i + 1;
          $step_id    = $s['step_id'] ?? '';
          $step_title = $s['title'] ?? '';
          $objective  = $s['objective'] ?? '';
          $prompt     = $s['prompt'] ?? '';
          
          // Step Variables (renamed from 'variables' to 'variables_step')
          // Support BOTH old and new field names for backward compatibility
          $step_variables = [];
          if (isset($s['variables_step']) && is_array($s['variables_step']) && !empty($s['variables_step'])) {
              $step_variables = $s['variables_step'];
          } elseif (isset($s['variables']) && is_array($s['variables']) && !empty($s['variables'])) {
              // Fallback to old field name 'variables' for backward compatibility
              $step_variables = $s['variables'];
          }
          
          $example_output = $s['example_output'] ?? '';
          $step_checklist = (isset($s['step_checklist']) && is_array($s['step_checklist'])) ? $s['step_checklist'] : [];
          $estimated_time_min = isset($s['estimated_time_min']) ? (int)$s['estimated_time_min'] : 0;
          
          // New ACF fields from v1.7
          $step_type = $s['step_type'] ?? 'prompt';
          $prompt_mode = $s['prompt_mode'] ?? 'main';
          $uses_global_vars = !empty($s['uses_global_vars']);
          $consumes_previous_output = !empty($s['consumes_previous_output']);
          $paste_guidance = $s['paste_guidance'] ?? '';
          $step_body = $s['step_body'] ?? '';
          $review_hint = $s['review_hint'] ?? '';

          $needs_prev = (stripos(($prompt ?? ''), '{previous_output}') !== false);
          $step_anchor = 'step-'.$idx;

          // Lock-Entscheidung
          $locked = pf_step_is_locked($idx, $ACCESS_MODE, $USER_PLAN, (int)$FREE_STEP_LIMIT, (bool)$LOGIN_REQUIRED, (bool)$viewer_logged_in);

          $li_classes = 'pf-step pf-step-card' . ($locked ? ' pf-step--locked' : '') . ' pf-step--' . esc_attr($step_type);
        ?>
        <li class="<?php echo esc_attr($li_classes); ?>" id="<?php echo esc_attr($step_anchor); ?>" data-step-id="<?php echo esc_attr($step_id ?: 'step-' . $idx); ?>"<?php echo $locked ? ' data-no-snippet="true"' : ''; ?>>

          <div class="pf-step-meta">
            <?php /* optional ID anzeigen
            if ($step_id): ?><span class="pf-step-id"><?php echo esc_html__('ID', 'prompt-finder'); ?>: <?php echo esc_html($step_id); ?></span><?php endif;
            */ ?>
            <?php if (!empty($PF_FLAGS['lock_badges']) && $needs_prev && $idx > 1): ?>
              <span class="pf-badge"><?php printf(esc_html__('uses output from Step %d', 'prompt-finder'), $idx - 1); ?></span>
            <?php endif; ?>
          </div>

          <div class="pf-step-head">
            <h3 class="pf-step-title">
              <?php echo esc_html($step_title ?: __('Untitled', 'prompt-finder')); ?>
            </h3>
            <div class="pf-step-head-meta">
              <?php if ($estimated_time_min): ?>
                <span class="pf-step-time" title="Estimated time to complete this step">⏱ <?php echo (int)$estimated_time_min; ?> min</span>
              <?php endif; ?>
            </div>
          </div>

          <!-- Step Type & Mode Badges -->
          <div class="pf-step-badges">
            <?php if ($locked): ?>
              <span class="pf-chip pf-chip--lock" title="<?php esc_attr_e('This step is locked', 'prompt-finder'); ?>">
                🔒 <?php echo esc_html($PF_COPY['chip_locked'] ?? 'Locked'); ?>
              </span>
            <?php endif; ?>
            
            <?php if ($step_type === 'prompt' && $prompt_mode): ?>
              <span class="pf-chip pf-chip--prompt-mode pf-chip--<?php echo esc_attr($prompt_mode); ?>" title="Prompt Mode: <?php echo esc_attr(ucfirst(str_replace('_', ' ', $prompt_mode))); ?>">
                <?php 
                  $mode_icons = [
                    'context_stage' => '🎬',
                    'main' => '⚡',
                    'optimizer' => '✨'
                  ];
                  $mode_labels = [
                    'context_stage' => 'Context',
                    'main' => 'Main',
                    'optimizer' => 'Optimizer'
                  ];
                  echo esc_html($mode_icons[$prompt_mode] ?? '📝') . ' ' . esc_html($mode_labels[$prompt_mode] ?? ucfirst($prompt_mode));
                ?>
              </span>
            <?php endif; ?>
            
            <?php if ($step_type === 'guide'): ?>
              <span class="pf-chip pf-chip--guide" title="Guide Step">
                📖 <?php esc_html_e('Guide', 'prompt-finder'); ?>
              </span>
            <?php endif; ?>
            
            <?php if ($step_type === 'review'): ?>
              <span class="pf-chip pf-chip--review" title="Review Step">
                ✅ <?php esc_html_e('Review', 'prompt-finder'); ?>
              </span>
            <?php endif; ?>
            
            <?php if ($uses_global_vars): ?>
              <span class="pf-chip pf-chip--uses-global" title="Uses workflow settings">
                ⚙️ <?php esc_html_e('Uses settings', 'prompt-finder'); ?>
              </span>
            <?php endif; ?>
            
            <?php if ($consumes_previous_output): ?>
              <span class="pf-chip pf-chip--prev-output" title="Improves previous output">
                🔄 <?php esc_html_e('Improves previous', 'prompt-finder'); ?>
              </span>
            <?php endif; ?>
          </div>

          <?php if ($objective): ?>
            <p class="pf-sub"><?php echo nl2br(esc_html($objective)); ?></p>
          <?php endif; ?>

          <!-- Body-Wrapper nur für Lock-Blur -->
          <div class="<?php echo $locked ? 'pf-blur' : ''; ?>">

          <?php if (!empty($step_variables)): ?>
            <div class="pf-vars" aria-label="Step Variables">
              <?php if ($idx === 1): // einmalige, ausblendbare Mini-Hilfe oben bei Step 1 ?>
                <div class="pf-vars-hint pf-tile" data-vars-hint>
                  <strong>Customize:</strong> Fill the fields — the prompt updates live.
                  <button type="button" class="pf-hint-hide" data-action="hide-vars-hint">Don't show again</button>
                </div>
              <?php endif; ?>

              <?php foreach ($step_variables as $v):
                // Support BOTH old and new field names for backward compatibility
                $var_name = trim($v['step_var_name'] ?? ($v['var_name'] ?? ''));
                $var_desc = trim($v['step_var_description'] ?? ($v['var_description'] ?? ''));
                $var_example = trim($v['step_var_example_value'] ?? ($v['example_value'] ?? ''));
                $var_required = !empty($v['step_var_required'] ?? $v['required'] ?? false);
                
                // Skip if no variable name found
                if (empty($var_name)) {
                    continue;
                }

                // Create label from variable name
                $label = ucwords(str_replace(['_','-'], ' ', $var_name));
                $label = str_replace(['{', '}'], '', $label);
                
                // Use example value as placeholder if available, otherwise use description or generic placeholder
                if (!empty($var_example)) {
                    $placeholder = $var_example;
                } elseif (!empty($var_desc)) {
                    $placeholder = $var_desc;
                } else {
                    $placeholder = 'Enter ' . strtolower($label);
                }
              ?>
                <div class="pf-step-var-item">
                  <label class="pf-step-var-label">
                    <?php echo esc_html($label); ?>
                    <?php if ($var_required): ?>
                      <span class="pf-req-mark" title="Required">*</span>
                    <?php endif; ?>
                  </label>

                  <?php if ($var_desc): ?>
                    <p class="pf-step-var-hint"><?php echo esc_html($var_desc); ?></p>
                  <?php endif; ?>

                  <input type="text"
                         class="pf-step-var-input"
                         id="<?php echo esc_attr('pf-var-' . $idx . '-' . sanitize_title($var_name)); ?>"
                         name="<?php echo esc_attr('pf_var_' . sanitize_title($var_name)); ?>"
                         data-var-name="<?php echo esc_attr($var_name); ?>"
                         <?php if ($var_example) echo 'data-example="'.esc_attr($var_example).'"'; ?>
                         placeholder="<?php echo esc_attr($placeholder); ?>"
                         <?php if ($var_required): ?>required aria-required="true"<?php endif; ?>>
                </div>
              <?php endforeach; ?>
            </div>
          <?php endif; ?>

          <?php /* === PASTE GUIDANCE (for all steps) === */ ?>
          <?php if (!empty($paste_guidance) && !$locked): ?>
            <div class="pf-paste-guidance pf-tile pf-tile--info">
              <span class="pf-paste-guidance-icon">💡</span>
              <div class="pf-paste-guidance-content">
                <?php echo wp_kses_post(nl2br($paste_guidance)); ?>
              </div>
            </div>
          <?php endif; ?>

          <?php /* === STEP TYPE: PROMPT === */ ?>
          <?php if ($step_type === 'prompt' && !$locked): ?>
            <label class="pf-prompt-label" for="<?php echo esc_attr('pf-prompt-'.$idx); ?>">
              <?php echo esc_html($PF_COPY['prompt_label'] ?? __('Prompt', 'prompt-finder')); ?>
            </label>
            <?php
              // Inject global context if context requirements exist
              $enhanced_prompt = $prompt;
              if (!empty($context_requirements) && function_exists('pf_inject_global_context')) {
                $enhanced_prompt = pf_inject_global_context($prompt, $context_requirements);
              }
            ?>
            <div id="<?php echo esc_attr('pf-prompt-'.$idx); ?>"
                 class="pf-prompt pf-prompt-editable"
                      data-prompt-template
                      data-base="<?php echo esc_attr($enhanced_prompt); ?>"
                 contenteditable="true"
                 spellcheck="false"><?php echo esc_html($enhanced_prompt); ?></div>

            <div class="pf-cta">
              <button class="pf-copy" data-action="copy-prompt">
                <?php echo esc_html($PF_COPY['copy_prompt'] ?? __('Copy prompt', 'prompt-finder')); ?>
              </button>
              <span class="pf-help-inline">→ <?php echo esc_html($PF_COPY['paste_hint'] ?? __('Paste into the same chat and run.', 'prompt-finder')); ?></span>
            </div>
          <?php endif; ?>

          <?php /* === STEP TYPE: GUIDE === */ ?>
          <?php if ($step_type === 'guide' && !empty($step_body) && !$locked): ?>
            <div class="pf-guide-body pf-tile">
              <div class="pf-guide-body-header">
                <span class="pf-guide-icon">📖</span>
                <h4><?php esc_html_e('Instructions', 'prompt-finder'); ?></h4>
              </div>
              <div class="pf-guide-body-content">
                <?php echo wp_kses_post(nl2br($step_body)); ?>
              </div>
            </div>
          <?php endif; ?>

          <?php /* === STEP TYPE: REVIEW === */ ?>
          <?php if ($step_type === 'review' && !empty($step_checklist) && !$locked): ?>
            <div class="pf-review-checklist pf-tile">
              <div class="pf-review-checklist-header">
                <span class="pf-review-icon">✅</span>
                <h4><?php esc_html_e('Review Checklist', 'prompt-finder'); ?></h4>
              </div>
              <ul class="pf-review-checklist-list">
                <?php foreach ($step_checklist as $check): ?>
                  <li>
                    <label class="pf-review-check-item">
                      <input type="checkbox" class="pf-review-checkbox">
                      <span class="pf-review-check-text"><?php echo esc_html($check['check_item'] ?? ''); ?></span>
                    </label>
                  </li>
                <?php endforeach; ?>
              </ul>
              <?php if (!empty($review_hint)): ?>
                <div class="pf-review-hint">
                  <span class="pf-review-hint-icon">💡</span>
                  <div class="pf-review-hint-content">
                    <?php echo wp_kses_post(nl2br($review_hint)); ?>
                  </div>
                </div>
              <?php endif; ?>
            </div>
          <?php endif; ?>

          <?php /* === LOCKED STEP TEASER === */ ?>
          <?php if ($locked): ?>
            <div class="pf-prompt-teaser">
              <div class="pf-prompt-teaser-content">
                <h4><?php echo esc_html($step_title ?: __('Untitled Step', 'prompt-finder')); ?></h4>
                <p class="pf-teaser-objective"><?php echo esc_html($objective ?: __('Complete the previous steps to unlock this content.', 'prompt-finder')); ?></p>
                <div class="pf-teaser-benefits">
                  <ul>
                    <li>✓ <?php echo $step_type === 'prompt' ? esc_html__('Professional AI prompt', 'prompt-finder') : esc_html__('Step-by-step guidance', 'prompt-finder'); ?></li>
                    <li>✓ <?php echo $step_type === 'review' ? esc_html__('Quality checklist', 'prompt-finder') : esc_html__('Detailed instructions', 'prompt-finder'); ?></li>
                    <li>✓ <?php esc_html_e('Privacy-safe workflow', 'prompt-finder'); ?></li>
                  </ul>
                </div>
              </div>
            </div>
          <?php endif; ?>

          <?php if (!empty($example_output)): ?>
            <details class="pf-example">
              <summary><?php _e('Show example output', 'prompt-finder'); ?></summary>
              <pre><?php echo esc_html($example_output); ?></pre>
            </details>
          <?php endif; ?>

          <?php if ($idx < $total_steps): ?>
            <?php
              $next            = $steps[$i + 1] ?? null;
              $next_title      = $next['title'] ?? ('Step '.($idx+1));
              $next_prompt     = $next['prompt'] ?? '';
              $next_needs_prev = (stripos($next_prompt, '{previous_output}') !== false);
            ?>
            <?php if (!empty($PF_FLAGS['next_panel'])): ?>
              <div class="pf-next pf-tile" style="margin-top:.75rem;">
                <strong><?php echo esc_html($PF_COPY['up_next_title'] ?? 'Up next:'); ?></strong>
                <div class="pf-next-text pf-sub" style="margin:.25rem 0 .5rem;">
                  <?php if ($next_needs_prev): ?>
                    <?php
                      $txt = $PF_COPY['uses_prev_hint'] ?? 'Use this step’s output as {previous_output} in the next prompt.';
                      echo wp_kses_post($txt);
                    ?>
                  <?php else: ?>
                    <?php
                      $tpl  = $PF_COPY['continue_hint'] ?? 'Continue to <em>Step {n}: {title}</em>.';
                      $html = str_replace(['{n}','{title}'], [($idx+1), esc_html($next_title)], $tpl);
                      echo wp_kses_post($html);
                    ?>
                  <?php endif; ?>
                </div>
                <div class="pf-next-actions">
                  <a class="pf-btn" href="#<?php echo esc_attr('step-'.($idx+1)); ?>">
                    <?php
                      $btn = $PF_COPY['go_to_step'] ?? 'Go to Step {n}';
                      echo esc_html(str_replace('{n}', ($idx+1), $btn));
                    ?>
                  </a>
                </div>
              </div>
            <?php endif; ?>
          <?php else: ?>
            <div class="pf-next pf-tile" style="margin-top:.75rem;">
              <strong><?php echo esc_html($PF_COPY['done_title'] ?? 'Done:'); ?></strong>
              <div class="pf-next-text pf-sub" style="margin:.25rem 0 0;">
                <?php echo esc_html($PF_COPY['done_text'] ?? 'You’ve completed all steps. Review the result and save it to your process/tool.'); ?>
              </div>
            </div>
          <?php endif; ?>

          </div><!-- /pf-blur wrapper -->

          <?php if ($locked): ?>
            <div class="pf-step-cta">
              <?php if ($ACCESS_MODE === 'half_locked' && !$viewer_logged_in): ?>
                <p class="pf-sub"><?php esc_html_e('Create a free account to continue with this step.', 'prompt-finder'); ?></p>
                <a class="pf-btn pf-btn--primary" href="/login"><?php esc_html_e('Log in / Sign up', 'prompt-finder'); ?></a>
              <?php else: ?>
                <p class="pf-sub"><?php esc_html_e('Unlock to continue this workflow.', 'prompt-finder'); ?></p>
                <a class="pf-btn pf-btn--primary" href="/pricing"><?php esc_html_e('Upgrade to Pro', 'prompt-finder'); ?></a>
              <?php endif; ?>
            </div>
          <?php endif; ?>

        </li>
        <?php endforeach; ?>
      </ol>
    <?php endif; ?>
  </div>

  <?php if (!empty($PF_CONFIG['layout']['three_grid_under_steps'])): ?>
    <div class="pf-3grid" style="margin-top:18px;">
      <?php if (!empty($PF_FLAGS['share'])): ?>
        <section class="pf-share pf-tile">
          <strong><?php echo esc_html($PF_COPY['share_title'] ?? 'Share'); ?>:</strong>
          <a href="#" class="pf-share-btn" data-action="copy-link"><?php echo esc_html($PF_COPY['copy_link'] ?? 'Copy link'); ?></a>
        </section>
      <?php endif; ?>

      <?php if (!empty($PF_FLAGS['rating'])): ?>
        <?php
          $post_id = get_the_ID();
          $sum     = (int) get_post_meta($post_id, 'pf_rating_sum', true);
          $count   = (int) get_post_meta($post_id, 'pf_rating_count', true);
          $avg     = $count ? round($sum / $count, 1) : 0;
        ?>
        <section class="pf-rating pf-tile"
                 data-post-id="<?php echo esc_attr($post_id); ?>"
                 data-avg="<?php echo esc_attr($avg); ?>"
                 data-count="<?php echo esc_attr($count); ?>">
          <p class="pf-rating-title">
            <?php echo esc_html($PF_COPY['rating_title'] ?? 'How helpful was this workflow?'); ?>
          </p>

          <div class="pf-stars" role="radiogroup" aria-label="<?php esc_attr_e('Rate this workflow', 'prompt-finder'); ?>">
            <button class="pf-star" data-value="1" role="radio" aria-checked="false" title="<?php esc_attr_e('1 = Not helpful','prompt-finder'); ?>"></button>
            <button class="pf-star" data-value="2" role="radio" aria-checked="false" title="<?php esc_attr_e('2 = Needs work','prompt-finder'); ?>"></button>
            <button class="pf-star" data-value="3" role="radio" aria-checked="false" title="<?php esc_attr_e('3 = Okay','prompt-finder'); ?>"></button>
            <button class="pf-star" data-value="4" role="radio" aria-checked="false" title="<?php esc_attr_e('4 = Helpful','prompt-finder'); ?>"></button>
            <button class="pf-star" data-value="5" role="radio" aria-checked="false" title="<?php esc_attr_e('5 = Excellent','prompt-finder'); ?>"></button>
          </div>

          <div class="pf-rating-meta">
            <span class="pf-rating-avg"><?php echo $avg ? esc_html($avg) : '–'; ?></span>
            <span class="pf-rating-count">(<?php echo (int)$count; ?>)</span>
            <span class="pf-rating-msg pf-sub"><?php echo esc_html($PF_COPY['rating_hint'] ?? 'Click a star to rate'); ?></span>
          </div>
        </section>
      <?php endif; ?>

      <?php /* TIP-BOX ENTFERNT */ ?>
    </div>
  <?php endif; ?>
  </div> <!-- /.pf-wrap -->
</div>

<!-- Variable system now handled by external pf-workflows.js -->

<?php get_footer(); ?>

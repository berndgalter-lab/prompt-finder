<?php

/**
 * Localize PF_USER_VARS for the workflow page.
 * - Include sys_* always
 * - Include user globals only if:
 *   (a) user is logged in AND
 *   (b) current workflow has use_profile_defaults = 1
 */
function pf_localize_user_vars_for_workflow(string $script_handle, int $workflow_id): void {
  $vars = [];

  // Always provide system keys
  $vars['sys_today']         = wp_date('Y-m-d');
  $vars['sys_now']           = wp_date('c');
  $vars['sys_user_timezone'] = wp_timezone_string();

  // Gate profile globals
  $allow_globals = is_user_logged_in() && (int) get_field('use_profile_defaults', $workflow_id) === 1;
  if ($allow_globals) {
    $wpId = get_current_user_id();
    if ($wpId) {
      $uid   = PF_UserUidMap::userUidFromWpId($wpId);
      $store = new PF_UserVarsStoreWp();
      $payload = $store->getByUserUid($uid);
      if (!empty($payload['data']) && is_array($payload['data'])) {
        // Merge profile on top of sys_ (profile may override none of the sys_* keys)
        foreach ($payload['data'] as $k => $v) {
          if ($k === 'sys_today' || $k === 'sys_now' || $k === 'sys_user_timezone') continue;
          $vars[$k] = is_scalar($v) || $v === null ? $v : wp_json_encode($v);
        }
      }
    }
  }

  // Allow extensions to adjust vars (e.g., org_/client_ in the future)
  $vars = apply_filters('pf_user_vars_localized', $vars, $workflow_id);

  wp_localize_script($script_handle, 'PF_USER_VARS', $vars);
}


/**
 * Hook localization on single workflow pages and ensure the JS handle exists.
 * Adjust the $script_handle to your actual handle if different.
 */
function pf_hook_localize_user_vars() {
  if (!is_singular('workflows')) return;

  // Register or reference your workflows JS
  $script_handle = 'pf-workflows';
  if (!wp_script_is($script_handle, 'registered')) {
    wp_register_script(
      $script_handle,
      get_stylesheet_directory_uri() . '/assets/js/pf-workflows.js',
      ['jquery'],
      null,
      true
    );
  }
  wp_enqueue_script($script_handle);

  $workflow_id = get_queried_object_id();
  pf_localize_user_vars_for_workflow($script_handle, (int)$workflow_id);
}
add_action('wp_enqueue_scripts', 'pf_hook_localize_user_vars', 20);



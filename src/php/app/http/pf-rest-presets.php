<?php

/**
 * REST API for server-side presets
 * Namespace: pf/v1
 */
add_action('rest_api_init', function(){
  register_rest_route('pf/v1', '/presets', [
    [
      'methods'  => WP_REST_Server::READABLE,
      'callback' => 'pf_rest_presets_list',
      'permission_callback' => 'pf_rest_auth',
      'args' => [
        'workflow_id' => ['required' => true, 'type' => 'integer'],
        'include'     => ['required' => false, 'type' => 'string', 'enum' => ['data']],
      ],
    ],
    [
      'methods'  => WP_REST_Server::CREATABLE,
      'callback' => 'pf_rest_presets_put',
      'permission_callback' => 'pf_rest_auth',
      'args' => [
        'workflow_id' => ['required' => true, 'type' => 'integer'],
        'name'        => ['required' => true, 'type' => 'string'],
        'data'        => ['required' => true],
      ],
    ],
    [
      'methods'  => WP_REST_Server::DELETABLE,
      'callback' => 'pf_rest_presets_delete',
      'permission_callback' => 'pf_rest_auth',
      'args' => [
        'workflow_id' => ['required' => true, 'type' => 'integer'],
        'name'        => ['required' => true, 'type' => 'string'],
      ],
    ],
  ]);

  register_rest_route('pf/v1', '/presets/(?P<name>[^/]+)', [
    'methods'  => WP_REST_Server::READABLE,
    'callback' => 'pf_rest_presets_get',
    'permission_callback' => 'pf_rest_auth',
    'args' => [
      'workflow_id' => ['required' => true, 'type' => 'integer'],
      'name'        => ['required' => true, 'type' => 'string'],
    ],
  ]);

  register_rest_route('pf/v1', '/presets/import', [
    'methods'  => WP_REST_Server::CREATABLE,
    'callback' => 'pf_rest_presets_import',
    'permission_callback' => 'pf_rest_auth',
    'args' => [
      'workflow_id' => ['required' => true, 'type' => 'integer'],
      'presets'     => ['required' => true, 'type' => 'object'],
    ],
  ]);

  register_rest_route('pf/v1', '/presets/export', [
    'methods'  => WP_REST_Server::READABLE,
    'callback' => 'pf_rest_presets_export',
    'permission_callback' => 'pf_rest_auth',
    'args' => [
      'workflow_id' => ['required' => true, 'type' => 'integer'],
    ],
  ]);
});


function pf_rest_auth() {
  return is_user_logged_in();
}

function pf_rest_store(): PF_UserPresetsStore {
  return new PF_UserPresetsStoreWp();
}

function pf_rest_user_uid(): string {
  return PF_UserUidMap::userUidFromWpId(get_current_user_id());
}


function pf_rest_presets_list(WP_REST_Request $req){
  $uid = pf_rest_user_uid();
  $wf  = (int) $req->get_param('workflow_id');
  $include = (string) $req->get_param('include');
  $list = pf_rest_store()->listForWorkflow($uid, $wf);
  if ($include === 'data') {
    return new WP_REST_Response($list, 200);
  }
  $lite = [];
  foreach ($list as $name => $meta) {
    $lite[$name] = ['ts' => (int)($meta['ts'] ?? 0)];
  }
  return new WP_REST_Response($lite, 200);
}


function pf_rest_presets_get(WP_REST_Request $req){
  $uid = pf_rest_user_uid();
  $wf  = (int) $req->get_param('workflow_id');
  $name= (string) $req->get_param('name');
  $one = pf_rest_store()->get($uid, $wf, $name);
  if (!$one) {
    return new WP_Error('pf_not_found', 'Preset not found', ['status' => 404]);
  }
  return new WP_REST_Response($one, 200);
}


function pf_rest_presets_put(WP_REST_Request $req){
  $uid = pf_rest_user_uid();
  $wf  = (int) $req->get_param('workflow_id');
  $name= (string) $req->get_param('name');
  $data= (array) $req->get_param('data');
  $ok = pf_rest_store()->put($uid, $wf, $name, $data);
  return $ok
    ? new WP_REST_Response(['ok' => true], 200)
    : new WP_Error('pf_write_failed', 'Write failed', ['status' => 500]);
}


function pf_rest_presets_delete(WP_REST_Request $req){
  $uid = pf_rest_user_uid();
  $wf  = (int) $req->get_param('workflow_id');
  $name= (string) $req->get_param('name');
  $ok = pf_rest_store()->delete($uid, $wf, $name);
  return $ok
    ? new WP_REST_Response(['ok' => true], 200)
    : new WP_Error('pf_delete_failed', 'Delete failed', ['status' => 500]);
}


function pf_rest_presets_import(WP_REST_Request $req){
  $uid = pf_rest_user_uid();
  $wf  = (int) $req->get_param('workflow_id');
  $presets = (array) $req->get_param('presets');
  $count = pf_rest_store()->import($uid, $wf, $presets);
  return new WP_REST_Response(['written' => $count], 200);
}


function pf_rest_presets_export(WP_REST_Request $req){
  $uid = pf_rest_user_uid();
  $wf  = (int) $req->get_param('workflow_id');
  $all = pf_rest_store()->export($uid, $wf);
  return new WP_REST_Response($all, 200);
}



<?php

final class PF_UserVarsStoreWp implements PF_UserVarsStore {
  private const META_KEY = 'pf_user_vars_v1';


  public function getByUserUid(string $userUid): array {
    $wpId = PF_UserUidMap::wpIdFromUserUid($userUid);
    if (!$wpId) {
      return ['schema_version'=>1,'data'=>[],'updated_at'=>gmdate('c')];
    }
    $raw = get_user_meta($wpId, self::META_KEY, true);
    $arr = is_array($raw) ? $raw : (json_decode((string)$raw, true) ?: []);
    $schema = (int)($arr['schema_version'] ?? 1);
    $data   = (array)($arr['data'] ?? (is_array($arr) ? $arr : []));
    $updated= (string)($arr['updated_at'] ?? gmdate('c'));

    // Harden: only scalars/strings to localize safely later
    foreach ($data as $k => $v) {
      if (is_array($v) || is_object($v)) {
        $data[$k] = wp_json_encode($v);
      } elseif (!is_scalar($v) && $v !== null) {
        $data[$k] = (string) $v;
      }
    }
    return ['schema_version'=>$schema,'data'=>$data,'updated_at'=>$updated];
  }


  public function setByUserUid(string $userUid, array $payload): bool {
    $wpId = PF_UserUidMap::wpIdFromUserUid($userUid);
    if (!$wpId) return false;
    $payload['schema_version'] = (int)($payload['schema_version'] ?? 1);
    $payload['updated_at'] = gmdate('c');
    return (bool) update_user_meta($wpId, self::META_KEY, $payload);
  }
}



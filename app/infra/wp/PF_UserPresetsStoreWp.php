<?php

final class PF_UserPresetsStoreWp implements PF_UserPresetsStore {
  private const META_KEY = 'pf_user_presets_v1';


  /** @return array */
  private function readAll(int $wpId): array {
    $raw = get_user_meta($wpId, self::META_KEY, true);
    $arr = is_array($raw) ? $raw : (json_decode((string)$raw, true) ?: []);
    $arr['schema_version'] = (int)($arr['schema_version'] ?? 1);
    $arr['workflows'] = (array)($arr['workflows'] ?? []);
    return $arr;
  }


  private function writeAll(int $wpId, array $all): bool {
    $all['schema_version'] = (int)($all['schema_version'] ?? 1);
    return (bool) update_user_meta($wpId, self::META_KEY, $all);
  }


  /** @return array{wpId:int, all:array} */
  private function ensureUser(string $userUid): array {
    $wpId = PF_UserUidMap::wpIdFromUserUid($userUid);
    if (!$wpId) {
      return ['wpId' => 0, 'all' => ['schema_version' => 1, 'workflows' => []]];
    }
    $all = $this->readAll($wpId);
    return ['wpId' => $wpId, 'all' => $all];
  }


  public function listForWorkflow(string $userUid, int $workflowId): array {
    $ctx = $this->ensureUser($userUid);
    $wfKey = (string) $workflowId;
    return (array) ($ctx['all']['workflows'][$wfKey] ?? []);
  }


  public function get(string $userUid, int $workflowId, string $name): ?array {
    $list = $this->listForWorkflow($userUid, $workflowId);
    return $list[$name] ?? null;
  }


  public function put(string $userUid, int $workflowId, string $name, array $data): bool {
    $ctx = $this->ensureUser($userUid);
    $wpId = (int) $ctx['wpId'];
    if (!$wpId) return false;

    $all = $ctx['all'];
    $wfKey = (string) $workflowId;

    $flat = [];
    foreach ($data as $k => $v) {
      if (is_array($v) || is_object($v)) {
        $v = wp_json_encode($v);
      }
      $flat[(string) $k] = is_scalar($v) || $v === null ? (string) $v : '';
    }

    if (!isset($all['workflows'][$wfKey])) {
      $all['workflows'][$wfKey] = [];
    }

    $all['workflows'][$wfKey][$name] = [
      'ts'   => time(),
      'data' => $flat,
    ];

    return $this->writeAll($wpId, $all);
  }


  public function delete(string $userUid, int $workflowId, string $name): bool {
    $ctx = $this->ensureUser($userUid);
    $wpId = (int) $ctx['wpId'];
    if (!$wpId) return false;

    $all = $ctx['all'];
    $wfKey = (string) $workflowId;

    if (isset($all['workflows'][$wfKey][$name])) {
      unset($all['workflows'][$wfKey][$name]);
      return $this->writeAll($wpId, $all);
    }

    return true;
  }


  public function import(string $userUid, int $workflowId, array $presets): int {
    $count = 0;
    foreach ($presets as $name => $meta) {
      if (!is_array($meta) || !isset($meta['data'])) continue;
      $ok = $this->put($userUid, $workflowId, (string) $name, (array) $meta['data']);
      if ($ok) $count++;
    }
    return $count;
  }


  public function export(string $userUid, int $workflowId): array {
    return $this->listForWorkflow($userUid, $workflowId);
  }
}



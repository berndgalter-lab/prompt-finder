<?php

interface PF_UserPresetsStore {

  /** @return array<string, array{ts:int, data:array}> map of presetName => meta */
  public function listForWorkflow(string $userUid, int $workflowId): array;


  /** @return array{ts:int, data:array}|null */
  public function get(string $userUid, int $workflowId, string $name): ?array;


  /** Create or overwrite a preset */
  public function put(string $userUid, int $workflowId, string $name, array $data): bool;


  /** Delete a preset by name */
  public function delete(string $userUid, int $workflowId, string $name): bool;


  /** Merge many presets; @return int number of presets written */
  public function import(string $userUid, int $workflowId, array $presets): int;


  /** Export all presets for a workflow; same shape as listForWorkflow */
  public function export(string $userUid, int $workflowId): array;
}



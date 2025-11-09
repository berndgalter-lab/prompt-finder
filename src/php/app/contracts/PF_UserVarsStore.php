<?php

interface PF_UserVarsStore {

  /**
   * Returns a payload like:
   * ['schema_version'=>1,'data'=>[],'updated_at'=>'ISO-8601']
   */
  public function getByUserUid(string $userUid): array;


  /**
   * Accepts a payload like:
   * ['schema_version'=>1,'data'=>[]]
   * Implementations must add/refresh 'updated_at'.
   */
  public function setByUserUid(string $userUid, array $payload): bool;
}



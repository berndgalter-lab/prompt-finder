<?php

final class PF_UserUidMap {
  private const UID_META = 'pf_user_uid';


  public static function userUidFromWpId(int $wpId): string {
    $uid = get_user_meta($wpId, self::UID_META, true);
    if (!$uid) {
      if (function_exists('wp_generate_uuid4')) {
        $uid = wp_generate_uuid4();
      } else {
        $uid = sprintf(
          '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
          mt_rand(0, 0xffff), mt_rand(0, 0xffff),
          mt_rand(0, 0xffff),
          mt_rand(0, 0x0fff) | 0x4000,
          mt_rand(0, 0x3fff) | 0x8000,
          mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
      }
      update_user_meta($wpId, self::UID_META, $uid);
    }
    return (string) $uid;
  }


  public static function wpIdFromUserUid(string $uid): int {
    $users = get_users([
      'meta_key'   => self::UID_META,
      'meta_value' => $uid,
      'fields'     => 'ID',
      'number'     => 1
    ]);
    return $users ? (int) $users[0] : 0;
  }
}



<?php

// Minimal autoloader for PF classes used before composer is introduced.
require_once __DIR__ . '/../contracts/PF_UserVarsStore.php';
require_once __DIR__ . '/../infra/map/PF_UserUidMap.php';
require_once __DIR__ . '/../infra/wp/PF_UserVarsStoreWp.php';
require_once __DIR__ . '/../contracts/PF_UserPresetsStore.php';
require_once __DIR__ . '/../infra/wp/PF_UserPresetsStoreWp.php';
require_once __DIR__ . '/../http/pf-rest-presets.php';



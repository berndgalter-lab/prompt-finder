# ACF Actual Structure vs. Current Code - PRECISE MAPPING

## 🎯 Based on: acf-export-2025-10-25.json

---

## 1. WORKFLOW META FIELDS

### ✅ PERFECT MATCH (No changes needed)
| ACF Field Name | Current PHP Variable | Line in Code | Status |
|----------------|---------------------|--------------|--------|
| `workflow_id` | `$workflow_id` | single-workflows.php:226 | ✅ Perfect |
| `tagline` | `$tagline` | single-workflows.php:225 | ✅ Perfect |
| `summary` | `$summary` | single-workflows.php:63,81 | ✅ Perfect |
| `use_case` | `$use_case` | single-workflows.php:64,82 | ✅ Perfect |
| `pain_points` | `$pain_point` | single-workflows.php:115 | ✅ Perfect |
| `expected_outcome` | `$expected_outcome` | single-workflows.php:116 | ✅ Perfect |
| `time_saved_min` | `$time_saved_min` | single-workflows.php:117 | ✅ Perfect |
| `difficulty_without_ai` | `$difficulty_wo_ai` | single-workflows.php:118 | ✅ Perfect |
| `version` | `$version` | single-workflows.php:65,83 | ✅ Perfect |
| `last_update` | `$lastest_update` | single-workflows.php:66,84 | ⚠️ TYPO (see below) |
| `is_stable` | `$stable_version` | single-workflows.php:72,90 | ✅ Perfect |
| `auto_update_allowed` | `$auto_update_allowed` | single-workflows.php:73,91 | ✅ Perfect |
| `changelog` | `$changelog` | single-workflows.php:74,92 | ✅ Perfect |
| `changelog_json` | `$changelog_json` | single-workflows.php:75,93 | ✅ Perfect |
| `inputs_prerequisites` | - | - | 🆕 MISSING |
| `requires_source_content` | - | - | 🆕 MISSING |

### ❌ TYPO TO FIX
| ACF Field | Current Variable | Issue | Fix |
|-----------|-----------------|-------|-----|
| `last_update` | `$lastest_update` | Typo: "lastest" should be "latest" | Rename to `$latest_update` |

### 🆕 NEW FIELDS TO ADD
1. **`inputs_prerequisites`** (textarea) - Line 152 in ACF
2. **`requires_source_content`** (true_false) - Line 381 in ACF

### ❓ EXTRA FIELDS IN ACF (not in v1.7 spec, but exist)
- `use_profile_defaults` (true_false) - Line 444 in ACF
- `status` (select) - Line 736 in ACF
- `access_tier` (select) - Line 767 in ACF
- `license` (select) - Line 798 in ACF
- `owner` (text) - Line 828 in ACF

**DECISION:** Keep these for internal/admin use.

---

## 2. GLOBAL VARIABLES (`pf_variables`)

### ✅ ACF STRUCTURE (Line 173-377)
```
pf_variables (repeater)
├── var_key (text)
├── label (text)
├── placeholder (text)
├── required (true_false)
├── default_value (text)
├── prefer_profile_value (true_false)
├── hint (textarea)
└── injection_mode (select: direct/conditional)
```

### ❌ CURRENT CODE PROBLEM
**Current code does NOT use global `pf_variables`!**

Current code only uses **per-step variables** (line 553 in single-workflows.php):
```php
$vars = (isset($s['variables']) && is_array($s['variables'])) ? $s['variables'] : [];
```

**ACTION NEEDED:**
1. Add support for global `pf_variables` repeater
2. Display global variables at workflow level (before steps)
3. Keep per-step variables for backward compatibility OR migrate fully

---

## 3. STEPS REPEATER (`steps`)

### ✅ CORRECT STEP FIELDS (Match ACF perfectly)
| ACF Field Name | Current PHP Variable | Status |
|----------------|---------------------|--------|
| `step_id` | `$step_id` | ✅ Perfect (but see note below) |
| `step_type` | - | 🆕 MISSING |
| `prompt_mode` | - | 🆕 MISSING |
| `title` | `$title` | ✅ Perfect |
| `objective` | `$objective` | ✅ Perfect |
| `prompt` | `$prompt` | ✅ Perfect |
| `uses_global_vars` | - | 🆕 MISSING |
| `consumes_previous_output` | - | 🆕 MISSING |
| `variables` (repeater) | `$vars` | ✅ Perfect |
| `example_output` | `$example` | ⚠️ Different name |
| `estimated_time_min` | `$eta` | ⚠️ Unclear abbreviation |
| `paste_guidance` | - | 🆕 MISSING |
| `step_body` | - | 🆕 MISSING |
| `step_checklist` (repeater) | `$checklist` | ⚠️ Different name |
| `review_hint` | - | 🆕 MISSING |

### ❌ ISSUES TO FIX

#### 1. Variable Name Mismatches
| ACF Field | Current Variable | Fix |
|-----------|-----------------|-----|
| `example_output` | `$example` | Rename to `$example_output` |
| `step_checklist` | `$checklist` | Rename to `$step_checklist` |
| `estimated_time_min` | `$eta` | Rename to `$estimated_time_min` |

#### 2. Code Bug: `step_id_` has extra underscore
**Line 549 in single-workflows.php:**
```php
$step_id = $s['step_id_'] ?? '';  // ❌ WRONG: extra underscore
```
**Should be:**
```php
$step_id = $s['step_id'] ?? '';   // ✅ CORRECT
```

### 🆕 NEW FIELDS TO ADD
1. **`step_type`** (select: prompt/guide/review) - Line 933 in ACF
2. **`prompt_mode`** (select: context_stage/main/optimizer) - Line 964 in ACF
3. **`uses_global_vars`** (true_false) - Line 1099 in ACF
4. **`consumes_previous_output`** (true_false) - Line 1128 in ACF
5. **`paste_guidance`** (text) - Line 1330 in ACF
6. **`step_body`** (textarea) - Line 1367 in ACF
7. **`review_hint`** (text) - Line 1451 in ACF

### ❓ EXTRA FIELDS IN ACF (not in current code)
- `inputs_prerequisites` (textarea) - Line 1077 in ACF (duplicate of workflow-level field?)
- `check_item` (text) - Line 911 in ACF (seems misplaced, should be in step_checklist)

---

## 4. PER-STEP VARIABLES (`variables` repeater)

### ✅ ACF STRUCTURE (Line 1164-1280)
```
variables (repeater, inside steps)
├── var_name (text)
├── var_description (textarea)
├── example_value (text)
└── required (true_false)
```

### ✅ CURRENT CODE MATCHES PERFECTLY
| ACF Field | Current Variable | Status |
|-----------|-----------------|--------|
| `var_name` | `$name` | ✅ Perfect |
| `var_description` | `$desc` | ✅ Perfect |
| `example_value` | `$exampleV` | ✅ Perfect |
| `required` | `$required` | ✅ Perfect |

**NO CHANGES NEEDED** for per-step variables structure.

---

## 5. STEP CHECKLIST (`step_checklist` repeater)

### ✅ ACF STRUCTURE (Line 1398-1447)
```
step_checklist (repeater, inside steps)
└── check_item (text)
```

### ✅ CURRENT CODE MATCHES
Current code uses:
```php
$checklist = (isset($s['checklist']) && is_array($s['checklist'])) ? $s['checklist'] : [];
```

**ACTION:** Rename `$checklist` → `$step_checklist` for consistency.

---

## 6. ACCESS CONTROL FIELDS

### ✅ PERFECT MATCH
| ACF Field | Current Variable | Status |
|-----------|-----------------|--------|
| `access_mode` | `$ACCESS_MODE` | ✅ Perfect |
| `free_step_limit` | `$FREE_STEP_LIMIT` | ✅ Perfect |
| `login_required` | `$LOGIN_REQUIRED` | ✅ Perfect |
| `status` | - | ✅ Admin only |
| `access_tier` | - | ✅ Admin only |
| `license` | - | ✅ Admin only |
| `owner` | - | ✅ Admin only |

**NO CHANGES NEEDED** for access control.

---

## 7. FIELDS NOT IN ACF (Remove from code?)

### ❌ THESE FIELDS DON'T EXIST IN ACF
| Current Variable | Used in | Status | Recommendation |
|------------------|---------|--------|----------------|
| `$checkpoint_required` | single-workflows.php:559 | ❌ Not in ACF | Remove |
| `$checkpoint_message` | single-workflows.php:560 | ❌ Not in ACF | Remove |
| `$selection_key` | single-workflows.php:561 | ❌ Not in ACF | Remove |
| `$context_requirements` | single-workflows.php:562 | ❌ Not in ACF | Remove |

**These are legacy fields that should be removed.**

---

## 📋 SUMMARY OF REQUIRED CHANGES

### 🔴 CRITICAL FIXES (Must do immediately)

#### 1. Fix Variable Names (4 changes)
```php
// single-workflows.php

// Line 66, 84: Fix typo
$lastest_update → $latest_update

// Line 549: Fix step_id bug
$step_id = $s['step_id_'] → $step_id = $s['step_id']

// Line 554: Rename for consistency
$example → $example_output

// Line 555: Rename for consistency
$checklist → $step_checklist

// Line 556: Rename for clarity
$eta → $estimated_time_min
```

#### 2. Add Missing Workflow Fields (2 fields)
```php
// After line 82 in single-workflows.php
$inputs_prerequisites = function_exists('get_field') ? get_field('inputs_prerequisites') : '';
$requires_source_content = function_exists('get_field') ? get_field('requires_source_content') : false;
```

#### 3. Add Global Variables Support
```php
// After line 111 in single-workflows.php
$global_variables = function_exists('get_field') ? get_field('pf_variables') : [];
```

#### 4. Add Missing Step Fields (7 fields)
```php
// In step loop, after line 556
$step_type = $s['step_type'] ?? 'prompt';
$prompt_mode = $s['prompt_mode'] ?? 'main';
$uses_global_vars = !empty($s['uses_global_vars']);
$consumes_previous_output = !empty($s['consumes_previous_output']);
$paste_guidance = $s['paste_guidance'] ?? '';
$step_body = $s['step_body'] ?? '';
$review_hint = $s['review_hint'] ?? '';
```

#### 5. Remove Legacy Fields (4 fields)
```php
// Remove these lines from single-workflows.php:
// Line 559: $checkpoint_required
// Line 560: $checkpoint_message
// Line 561: $selection_key
// Line 562: $context_requirements
```

---

## 🎯 NEXT STEPS - PHASE 1

### Step 1: Variable Renaming (30 min)
1. Fix `$lastest_update` → `$latest_update`
2. Fix `$step_id_` → `$step_id`
3. Rename `$example` → `$example_output`
4. Rename `$checklist` → `$step_checklist`
5. Rename `$eta` → `$estimated_time_min`

### Step 2: Add Missing Fields (1 hour)
1. Add `inputs_prerequisites` and `requires_source_content`
2. Add global `pf_variables` support
3. Add new step fields (`step_type`, `prompt_mode`, etc.)

### Step 3: Remove Legacy Code (15 min)
1. Remove checkpoint system
2. Remove selection system
3. Remove old context requirements

### Step 4: Display New Fields (2 hours)
1. Display `inputs_prerequisites` in frontend
2. Display global variables UI
3. Display new step fields based on `step_type`

---

## ✅ VERIFICATION CHECKLIST

After changes, verify:
- [ ] All ACF field names match code variable names
- [ ] No typos in variable names
- [ ] Global variables are loaded and displayed
- [ ] New step fields are loaded
- [ ] Legacy fields are removed
- [ ] Frontend displays correctly
- [ ] No PHP errors in error log

---

**Generated:** 2025-10-26
**Source:** acf-export-2025-10-25.json
**Status:** Ready for implementation


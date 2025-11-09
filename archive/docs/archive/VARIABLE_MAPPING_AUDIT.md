# Variable Mapping Audit - ACF v1.7 vs. Current Code

## 🎯 Purpose
Compare ACF Field Reference (v1.7) with current implementation to identify:
- ❌ Variables with wrong names
- ❌ Variables that don't exist in v1.7
- ✅ Variables that are correct
- 🆕 Variables missing in current code

---

## 1. WORKFLOW META FIELDS

### ✅ CORRECT (Keep as-is)
| ACF v1.7 Field | Current PHP Variable | Status | Location |
|----------------|---------------------|--------|----------|
| `workflow_id` | `$workflow_id` | ✅ Correct | single-workflows.php:226 |
| `workflow_title` | Post Title | ✅ Correct | single-workflows.php:258 |
| `tagline` | `$tagline` | ✅ Correct | single-workflows.php:225 |
| `summary` | `$summary` | ✅ Correct | single-workflows.php:63,81 |
| `pain_points` | `$pain_point` | ✅ Correct | single-workflows.php:115 |
| `expected_outcome` | `$expected_outcome` | ✅ Correct | single-workflows.php:116 |
| `estimated_time_min` | `$estimated_time` | ✅ Correct | single-workflows.php:227 |
| `time_saved_min` | `$time_saved_min` | ✅ Correct | single-workflows.php:117 |
| `difficulty_without_ai` | `$difficulty_wo_ai` | ✅ Correct | single-workflows.php:118 |
| `use_case` | `$use_case` | ✅ Correct | single-workflows.php:64,82 |
| `tags` | - | 🆕 Missing | - |

### ❌ WRONG NAME (Need to fix)
| ACF v1.7 Field | Current PHP Variable | Issue | Fix |
|----------------|---------------------|-------|-----|
| `last_update` | `$lastest_update` | Typo: "lastest" | Rename to `$latest_update` |

### 🆕 MISSING IN CURRENT CODE (Need to add)
| ACF v1.7 Field | Type | Purpose |
|----------------|------|---------|
| `inputs_prerequisites` | textarea | What user needs ready before starting |
| `requires_source_content` | true/false | Does workflow need long source text? |

### ❌ NOT IN v1.7 (Consider removing)
| Current Variable | Used in | Status | Action |
|------------------|---------|--------|--------|
| `$version` | single-workflows.php:65,83 | ❓ Not in v1.7 | Keep for versioning? |
| `$stable_version` | single-workflows.php:72,90 | ❓ Not in v1.7 | Keep for versioning? |
| `$auto_update_allowed` | single-workflows.php:73,91 | ❓ Not in v1.7 | Keep for versioning? |
| `$changelog` | single-workflows.php:74,92 | ❓ Not in v1.7 | Keep for versioning? |
| `$changelog_json` | single-workflows.php:75,93 | ❓ Not in v1.7 | Keep for versioning? |
| `$usage_count` | single-workflows.php:78,95 | ❓ Not in v1.7 | Keep for analytics? |

---

## 2. GLOBAL VARIABLES (`pf_variables`)

### 🆕 NEW STRUCTURE IN v1.7
ACF v1.7 introduces a **repeater field** `pf_variables` with these subfields:
- `var_key` (machine name)
- `label` (friendly label)
- `placeholder` (example value)
- `hint` (instruction + privacy warning)
- `default_value`
- `required` (true/false)
- `injection_mode` (direct/conditional)
- `prefer_profile_value` (true/false)

### ❌ CURRENT CODE USES OLD STRUCTURE
Current code in single-workflows.php:553 uses:
```php
$vars = (isset($s['variables']) && is_array($s['variables'])) ? $s['variables'] : [];
```

This is the **old per-step variables** structure, not the new global `pf_variables`.

**ACTION NEEDED:**
1. Add support for global `pf_variables` repeater
2. Keep per-step variables for backward compatibility?
3. Or migrate fully to global variables?

---

## 3. STEPS (`pf_steps`)

### ✅ CORRECT STEP FIELDS
| ACF v1.7 Field | Current PHP Variable | Status |
|----------------|---------------------|--------|
| `step_id` | `$step_id` | ✅ Correct |
| `step_title` | `$title` | ⚠️ Generic name |
| `step_objective` | `$objective` | ✅ Correct |
| `estimated_time_min` | `$eta` | ⚠️ Unclear abbreviation |
| `sample_output` | `$example` | ⚠️ Different name |

### 🆕 NEW FIELDS IN v1.7 (Missing in current code)
| ACF v1.7 Field | Type | Purpose |
|----------------|------|---------|
| `step_type` | select | prompt/guide/review |
| `prompt_mode` | select | context_stage/main/optimizer |
| `uses_global_vars` | true/false | Uses pf_variables? |
| `consumes_previous_output` | true/false | Uses previous step output? |
| `paste_guidance` | textarea | Where to paste, what to send |
| `step_body` | textarea | For guide steps |
| `step_checklist` | repeater | For review steps |
| `review_hint` | textarea | For review steps |

### ❌ OLD FIELDS IN CURRENT CODE (Not in v1.7)
| Current Variable | Used in | Status | Action |
|------------------|---------|--------|--------|
| `$step_id_` | single-workflows.php:549 | ❓ Typo? | Should be `step_id` |
| `$prompt` | single-workflows.php:552 | ⚠️ Should be `step_prompt` | Rename |
| `$example_output` | single-workflows.php:554 | ⚠️ Should be `sample_output` | Rename |
| `$checklist` | single-workflows.php:555 | ⚠️ Should be `step_checklist` | Rename |
| `$checkpoint_required` | single-workflows.php:559 | ❓ Not in v1.7 | Remove? |
| `$checkpoint_message` | single-workflows.php:560 | ❓ Not in v1.7 | Remove? |
| `$selection_key` | single-workflows.php:561 | ❓ Not in v1.7 | Remove? |
| `$context_requirements` | single-workflows.php:562 | ❓ Not in v1.7 | Remove? |

---

## 4. ACCESS CONTROL / GATING

### ✅ CURRENT IMPLEMENTATION (Keep)
| Current Variable | Source | Purpose |
|------------------|--------|---------|
| `$ACCESS_MODE` | ACF `access_mode` | free/half_locked/pro |
| `$FREE_STEP_LIMIT` | ACF `free_step_limit` | Number of free steps |
| `$LOGIN_REQUIRED` | ACF `login_required` | Login needed? |

**STATUS:** Not in v1.7 spec, but needed for business logic. **KEEP.**

---

## 5. ADMIN COLUMNS (functions.php)

### ❌ FIELDS NOT IN v1.7
These admin columns reference fields not in v1.7:
- `pf_version` (line 589)
- `pf_last_updated` (line 590)
- `pf_access_mode` (line 591)
- `pf_free_steps` (line 592)
- `pf_login_required` (line 593)
- `pf_access_tier` (line 594)
- `pf_status` (line 595)
- `pf_license` (line 596)
- `pf_owner` (line 597)

**ACTION:** Decide which to keep for internal use vs. remove.

---

## 📋 SUMMARY & RECOMMENDATIONS

### 🔴 CRITICAL FIXES (Must do)
1. ✅ Rename `$lastest_update` → `$latest_update`
2. ✅ Rename `$prompt` → `$step_prompt`
3. ✅ Rename `$example_output` → `$sample_output`
4. ✅ Rename `$checklist` → `$step_checklist`
5. ✅ Fix `$step_id_` → `$step_id`
6. ✅ Rename `$title` → `$step_title`
7. ✅ Rename `$eta` → `$estimated_time_min`

### 🟡 IMPORTANT ADDITIONS (Should add)
1. 🆕 Add `inputs_prerequisites` field
2. 🆕 Add `requires_source_content` field
3. 🆕 Add `tags` field
4. 🆕 Add new step fields: `step_type`, `prompt_mode`, `paste_guidance`, etc.
5. 🆕 Add global `pf_variables` repeater support

### 🟢 DECISIONS NEEDED (Discuss)
1. ❓ Keep versioning fields? (`version`, `stable_version`, `changelog`)
2. ❓ Keep analytics fields? (`usage_count`)
3. ❓ Keep checkpoint system? (`checkpoint_required`, `checkpoint_message`)
4. ❓ Keep context requirements? (`context_requirements`)
5. ❓ Keep admin-only fields? (`status`, `license`, `owner`)

---

## 🎯 NEXT STEPS

### Step 1: Variable Renaming
Create a migration script to rename all variables in:
- `single-workflows.php`
- `functions.php`
- Any JavaScript files

### Step 2: Add Missing Fields
Update templates to display:
- `inputs_prerequisites`
- `requires_source_content`
- `tags`
- New step fields

### Step 3: Remove Unused Fields
After confirming, remove:
- Checkpoint system (if not needed)
- Selection system (if not needed)
- Old context requirements (if replaced by global variables)

---

**Generated:** 2025-10-26
**Status:** Draft - Awaiting decisions on optional fields


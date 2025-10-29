# ACF Current Structure - Workflow Definition

**Date:** 26. Oktober 2025  
**Field Group:** Workflow Definition (group_68a082f7ac4d6)  
**Post Type:** workflows

---

## 📁 **FILE LOCATION**

- **ACF JSON File:** `wp-content/themes/generatepress-child/acf-json/group_68a082f7ac4d6.json`
- **Backup File:** `docs/acf-schema/acf-export-workflow-BACKUP-2025-10-26.json`
- **Original Export:** `docs/acf-schema/acf-export-2025-10-26.json`

---

## 📋 **TAB STRUCTURE**

Die Field Group hat **5 Tabs:**

1. **General** (field_68ac52ca018d6)
2. **Value** (field_68ac555bb04ab)
3. **Access** (field_68ac56b2b04b0)
4. **Steps** (field_68ac54be4046b)

---

## 📊 **FELD-ÜBERSICHT NACH TAB**

### **TAB 1: General** (field_68ac52ca018d6)

| Feld-Name | Field Key | Type | Conditional Logic |
|-----------|-----------|------|-------------------|
| workflow_id | field_68cd6c4ed5b35 | text | - |
| use_case | field_68a0838c2d124 | text | - |
| tagline | field_68cd6c3ad5b34 | text | - |
| is_stable | field_68bc42e4e6c78 | true_false | - |
| auto_update_allowed | field_68bc4312e6c79 | true_false | - |
| summary | field_68a082f72d122 | textarea | - |
| inputs_prerequisites | field_68fb10844ef9b | textarea | - |
| **pf_variables** ⚠️ | field_68eb3a4f267f5 | repeater | - |
| requires_source_content | field_68fb6bc3f61c9 | true_false | - |
| version | field_68a083482d123 | text | - |
| changelog | field_68bc370b632d4 | textarea | - |
| use_profile_defaults | field_68eb380f7dbd0 | true_false | - |
| changelog_json | field_68bc447be6c7b | textarea | - |
| last_update | field_68a084842d125 | date_picker | - |

#### **pf_variables Subfields:**
- **var_key** (field_68eb3aaa267f6) - text
- **label** (field_68eb3b04267f7) - text
- **placeholder** (field_68eb3b1d267f8) - text
- **required** (field_68eb3b2b267f9) - true_false
- **default_value** (field_68eb3b56267fa) - text
- **prefer_profile_value** (field_68eb3b76267fb) - true_false
- **hint** (field_68eb3bb6267fc) - textarea
- **injection_mode** (field_68fb87cc862d4) - select (direct/conditional)

---

### **TAB 2: Value** (field_68ac555bb04ab)

| Feld-Name | Field Key | Type | Conditional Logic |
|-----------|-----------|------|-------------------|
| pain_points | field_68ac5571b04ac | textarea | - |
| expected_outcome | field_68ac559cb04ad | text | - |
| estimated_time_min | field_68cd6c5fd5b36 | number | - |
| time_saved_min | field_68ac55c5b04ae | number | - |
| difficulty_without_ai | field_68ac55ecb04af | select (1-5) | - |

---

### **TAB 3: Access** (field_68ac56b2b04b0)

| Feld-Name | Field Key | Type | Conditional Logic |
|-----------|-----------|------|-------------------|
| access_mode | field_68ac5715b04b1 | select | - |
| free_step_limit | field_68ac5871b04b2 | number | - |
| login_required | field_68ac599fb04b4 | true_false | - |
| status | field_68ac5e05b04b5 | select | - |
| access_tier | field_68ac5892b04b3 | select | - |
| license | field_68ac5e99b04b6 | select | - |
| owner | field_68ad262f303b9 | text | - |

---

### **TAB 4: Steps** (field_68ac54be4046b)

| Feld-Name | Field Key | Type | Conditional Logic |
|-----------|-----------|------|-------------------|
| **steps** (Repeater) | field_68a084c92d126 | repeater | - |

#### **Steps Subfields:**

| Feld-Name | Field Key | Type | Conditional Logic |
|-----------|-----------|------|-------------------|
| step_id | field_68a085502d127 | text | - |
| **check_item** ⚠️ | field_68a089bdc06b8 | text | - |
| **step_type** | field_68eb3e294d642 | select (prompt/guide/review) | - |
| **prompt_mode** | field_68eb3ecf4d643 | select (context_stage/main/optimizer) | ✅ IF step_type == "prompt" |
| title | field_68a085ba2d128 | text | - |
| objective | field_68a086502d129 | textarea | - |
| **prompt** | field_68a0867f2d12a | textarea | ✅ IF step_type == "prompt" |
| inputs_prerequisites | field_68fb0f8a4ef9a | textarea | - |
| **uses_global_vars** | field_68eb40db4d644 | true_false | ✅ IF step_type == "prompt" |
| **consumes_previous_output** | field_68eb41554d645 | true_false | ✅ IF step_type == "prompt" AND prompt_mode == "optimizer" |
| **variables** (Repeater) ⚠️ | field_68a086922d12b | repeater | ✅ IF step_type == "prompt" |
| example_output | field_68a089582d12e | textarea | - |
| estimated_time_min | field_68a089d6c06b9 | number | - |
| **paste_guidance** | field_68eb422794f34 | text | ✅ IF step_type == "prompt" OR "guide" |
| **step_body** | field_68eb426894f35 | textarea | ✅ IF step_type == "guide" |
| **step_checklist** (Repeater) | field_68eb42a93a7af | repeater | ✅ IF step_type == "review" |
| **review_hint** | field_68eb436f3a7b1 | text | ✅ IF step_type == "review" |

#### **Variables Subfields (OLD NAME - wird zu variables_step):**
- **var_name** (field_68a087d32d12c) - text
- **var_description** (field_68a087e92d12d) - textarea
- **example_value** (field_68cd49a1320d8) - text
- **required** (field_68cd49af320d9) - true_false

#### **Step Checklist Subfields:**
- **check_item** (field_68eb42dd3a7b0) - text

---

## 🔍 **WICHTIGE HINWEISE:**

### ⚠️ **FIELD NAME MISMATCHES:**

1. **pf_variables** (Workflow Variables)
   - **Field Name:** `pf_variables` (ALT)
   - **Sollte sein:** `variables_workflow` (NEU)
   - **Status:** ❌ Alte Feldnamen noch aktiv

2. **variables** (Step Variables)
   - **Field Name:** `variables` (ALT)
   - **Sollte sein:** `variables_step` (NEU)
   - **Status:** ❌ Alte Feldnamen noch aktiv

3. **check_item** (im Repeater root)
   - **Field Key:** field_68a089bdc06b8
   - **Status:** ⚠️ Außerhalb des Repeaters - vermutlich Fehler

---

## 📝 **CONDITIONAL LOGIC ÜBERSICHT:**

### **TAB 4: Steps - Conditional Logic:**

1. **prompt_mode:**
   - Sichtbar IF: `step_type == "prompt"`

2. **prompt:**
   - Sichtbar IF: `step_type == "prompt"`

3. **uses_global_vars:**
   - Sichtbar IF: `step_type == "prompt"`

4. **consumes_previous_output:**
   - Sichtbar IF: `step_type == "prompt"` AND `prompt_mode == "optimizer"`

5. **variables:**
   - Sichtbar IF: `step_type == "prompt"`

6. **paste_guidance:**
   - Sichtbar IF: `step_type == "prompt"` OR `step_type == "guide"`

7. **step_body:**
   - Sichtbar IF: `step_type == "guide"`

8. **step_checklist:**
   - Sichtbar IF: `step_type == "review"`

9. **review_hint:**
   - Sichtbar IF: `step_type == "review"`

---

## 🔧 **CUSTOM CSS/JS:**

### **ACF Admin Styling:**
- **CSS:** Nicht vorhanden
- **JavaScript:** Nicht vorhanden
- **Custom Admin Functions:** Nicht vorhanden

### **Wo sollte Custom Admin CSS/JS hin?**
- `functions.php` mit `acf/input/admin_head` Hook
- Separate Datei: `assets/css/acf-admin.css`
- Separate Datei: `assets/js/acf-admin.js`

---

## ✅ **STRUKTUR IST KORREKT:**

- ✅ Tabs sind logisch gruppiert
- ✅ Conditional Logic ist korrekt
- ✅ Repeater Fields sind korrekt verschachtelt
- ✅ Subfields haben korrekte parent_repeater Keys

---

## ⚠️ **PROBLEME ZU BEHEBEN:**

1. **Feldnamen-Mismatch:**
   - `pf_variables` → sollte `variables_workflow` sein
   - `variables` → sollte `variables_step` sein
   - Subfields haben noch alte Namen (var_name, var_key, etc.)

2. **Orphaned Field:**
   - `check_item` (field_68a089bdc06b8) ist außerhalb des Repeaters
   - Sollte nur in step_checklist repeater sein

3. **Fehlende Instructions:**
   - Viele Felder haben keine Instructions
   - UX könnte verbessert werden

---

## 📊 **STATISTIKEN:**

- **Total Fields:** ~40+ (inkl. Subfields)
- **Tabs:** 4
- **Repeaters:** 3 (pf_variables, steps, variables)
- **Conditional Logic Fields:** 9
- **Select Fields:** 5
- **True/False Fields:** 8

---

## 🎯 **NÄCHSTE SCHRITTE:**

1. ✅ Backup erstellt
2. ✅ Struktur dokumentiert
3. ⏭️ Feldnamen-Neubenennung planen
4. ⏭️ Orphaned Field entfernen
5. ⏭️ Instructions hinzufügen
6. ⏭️ Custom Admin CSS/JS erstellen

---

**Status:** 📋 Dokumentation abgeschlossen  
**Backup:** ✅ Erstellt  
**Bereit für:** UX-Verbesserungen


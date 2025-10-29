# Field Names Audit - Komplette Überprüfung

## ✅ WORKFLOW-LEVEL FELDER

### Basis-Felder (unverändert)
- ✅ `summary` - Zeile 81
- ✅ `use_case` - Zeile 82
- ✅ `version` - Zeile 83
- ✅ `last_update` - Zeile 84
- ✅ `steps` - Zeile 85
- ✅ `pain_points` - Zeile 148
- ✅ `expected_outcome` - Zeile 149
- ✅ `time_saved_min` - Zeile 150
- ✅ `difficulty_without_ai` - Zeile 151
- ✅ `tagline` - Zeile 258
- ✅ `workflow_id` - Zeile 259
- ✅ `estimated_time_min` - Zeile 260

### Neue Felder (v1.7)
- ✅ `inputs_prerequisites` - Zeile 115
- ✅ `requires_source_content` - Zeile 116

### Workflow Variables (mit Backward Compatibility)
- ✅ `variables_workflow` (NEU) - Zeile 130
- ✅ `pf_variables` (ALT, Fallback) - Zeile 135

---

## ✅ STEP-LEVEL FELDER

### Basis-Felder (unverändert)
- ✅ `step_id` - Zeile 647
- ✅ `title` - Zeile 648 (wird zu `$step_title`)
- ✅ `objective` - Zeile 649
- ✅ `prompt` - Zeile 650
- ✅ `example_output` - Zeile 662
- ✅ `step_checklist` - Zeile 663
- ✅ `estimated_time_min` - Zeile 664

### Step Variables (mit Backward Compatibility)
- ✅ `variables_step` (NEU) - Zeile 655-656
- ✅ `variables` (ALT, Fallback) - Zeile 657-659

### Neue Step-Felder (v1.7)
- ✅ `step_type` - Zeile 667
- ✅ `prompt_mode` - Zeile 668
- ✅ `uses_global_vars` - Zeile 669
- ✅ `consumes_previous_output` - Zeile 670
- ✅ `paste_guidance` - Zeile 671
- ✅ `step_body` - Zeile 672
- ✅ `review_hint` - Zeile 673

---

## ✅ WORKFLOW VARIABLE SUBFIELDS (mit Backward Compatibility)

### In der Anzeige (Zeile 507-516):
- ✅ `workflow_var_key` → Fallback zu `var_key`
- ✅ `workflow_var_label` → Fallback zu `label`
- ✅ `workflow_var_placeholder` → Fallback zu `placeholder`
- ✅ `workflow_var_hint` → Fallback zu `hint`
- ✅ `workflow_var_required` → Fallback zu `required`
- ✅ `workflow_var_default_value` → Fallback zu `default_value`
- ✅ `workflow_var_prefer_system` → Fallback zu `prefer_profile_value`

---

## ✅ STEP VARIABLE SUBFIELDS (mit Backward Compatibility)

### In der Anzeige (Zeile 773-777):
- ✅ `step_var_name` → Fallback zu `var_name`
- ✅ `step_var_description` → Fallback zu `var_description`
- ✅ `step_var_example_value` → Fallback zu `example_value`
- ✅ `step_var_required` → Fallback zu `required`

---

## 🔍 MÖGLICHE PROBLEME

### Problem 1: Leere Variablennamen
**Code:** Zeile 780-782
```php
if (empty($var_name)) {
    continue; // Skip if no variable name
}
```
✅ **GELÖST:** Leere Variablen werden übersprungen

### Problem 2: Fehlende Platzhalter
**Code:** Zeile 789-796
```php
if (!empty($var_example)) {
    $placeholder = $var_example;
} elseif (!empty($var_desc)) {
    $placeholder = $var_desc;
} else {
    $placeholder = 'Enter ' . strtolower($label);
}
```
✅ **GELÖST:** Dreistufiger Fallback für Platzhalter

### Problem 3: Fehlende Labels
**Code:** Zeile 785-787
```php
$label = ucwords(str_replace(['_','-'], ' ', $var_name));
$label = str_replace(['{', '}'], '', $label);
```
✅ **GELÖST:** Label wird aus `var_name` generiert

---

## 🎯 ZUSAMMENFASSUNG

### ✅ ALLES KORREKT:
1. ✅ Alle Workflow-Level Felder gemappt
2. ✅ Alle Step-Level Felder gemappt
3. ✅ Backward Compatibility für `pf_variables` → `variables_workflow`
4. ✅ Backward Compatibility für `variables` → `variables_step`
5. ✅ Alle Subfield-Namen mit Fallbacks
6. ✅ Platzhalter-Fallback-Logik
7. ✅ Label-Generierung aus var_name

### ❓ MÖGLICHE URSACHEN FÜR FEHLENDE ANZEIGE:

1. **Variablen sind in ACF leer**
   - Lösung: Debug-Script ausführen

2. **Alte Feldnamen sind anders als erwartet**
   - Lösung: Debug-Script zeigt exakte Struktur

3. **Browser-Cache**
   - Lösung: Hard Refresh (Cmd+Shift+R)

4. **PHP-Fehler**
   - Lösung: WordPress Debug-Log prüfen

---

## 🔧 NÄCHSTE SCHRITTE:

1. **Debug-Script ausführen:**
   ```
   https://prompt-finder.de/wp-content/themes/generatepress-child/debug-variables.php
   ```

2. **Exakte Feldnamen identifizieren**

3. **Falls nötig: Weitere Fallbacks hinzufügen**

---

**Status:** ✅ Code ist vollständig und korrekt gemappt!


# PromptFinder Workflow Variables - Gesamtübersicht

## Workflow-Hauptfelder (ACF)

| ACF Feldname | PHP Variable | Template Verwendung | Beschreibung | Typ |
|---------------|--------------|---------------------|--------------|-----|
| `summary` | `$summary` | `<?php echo nl2br(esc_html($summary)); ?>` | Workflow-Zusammenfassung | textarea |
| `use_case` | `$use_case` | Info-Pill: Use Case | Anwendungsfall | text |
| `version` | `$version` | Info-Pill: Version | Versionsnummer | text |
| `last_update` | `$lastest_update` | Info-Pill: Updated | Letztes Update | date_picker |
| `changelog` | `$changelog` | Changelog-Section | Änderungsprotokoll | textarea |
| `is_stable` | `$stable_version` | Stable-Badge | Ist stabile Version | true_false |
| `auto_update_allowed` | `$auto_update_allowed` | Auto-Update-Flag | Automatische Updates erlaubt | true_false |

## Value-Highlights (ACF)

| ACF Feldname | PHP Variable | Template Verwendung | Beschreibung | Typ |
|---------------|--------------|---------------------|--------------|-----|
| `pain_points` | `$pain_point` | Value-Panel: Pain Points | Schmerzpunkte | textarea |
| `expected_outcome` | `$expected_outcome` | Value-Panel: Expected Outcome | Erwartetes Ergebnis | text |
| `time_saved_min` | `$time_saved_min` | Value-Panel: Time Saved | Zeitersparnis in Minuten | number |
| `difficulty_without_ai` | `$difficulty_wo_ai` | Value-Panel: Difficulty | Schwierigkeit ohne AI (1-5) | select |

## Access Control (ACF)

| ACF Feldname | PHP Variable | Template Verwendung | Beschreibung | Typ |
|---------------|--------------|---------------------|--------------|-----|
| `access_mode` | `pf_workflow_mode($post_id)` | Mode-Badge (Free/Sign-in/Pro) | Zugriffsmodus (free/signin/pro), Default: pro | select |
| `free_step_limit` | `pf_free_step_limit($post_id)` | Lock-Logic | Anzahl freier Steps im Preview, Default: 0 (HARDLOCK) | number |
| `status` | `$status` | Admin-Column | Workflow-Status (draft/pending/approved/archived) | select |
| `license` | `$license` | Admin-Column | Lizenz-Typ | select |
| `owner` | `$owner` | Admin-Column | Workflow-Besitzer | text |

**Deprecated Felder (nicht mehr verwenden):**
- ~~`login_required`~~ → Ersetzt durch `access_mode` (signin/pro)
- ~~`access_tier`~~ → Ersetzt durch `access_mode`

## Steps (ACF Repeater)

| ACF Feldname | PHP Variable | Template Verwendung | Beschreibung | Typ |
|---------------|--------------|---------------------|--------------|-----|
| `step_id` | `$step_id` | Step-Meta (optional) | Eindeutige Step-ID | text |
| `title` | `$title` | Step-Header | Step-Titel | text |
| `objective` | `$objective` | Step-Description | Step-Ziel | textarea |
| `prompt` | `$prompt` | Prompt-Textarea | AI-Prompt | textarea |
| `example_output` | `$example` | Example-Section | Beispiel-Ausgabe | textarea |
| `estimated_time_min` | `$eta` | Time-Chip | Geschätzte Zeit | number |
| `checkpoint_required` | `$checkpoint_required` | Checkpoint-Section | Checkpoint erforderlich | true_false |
| `checkpoint_title` | `$checkpoint_title` | Checkpoint-Header | Checkpoint-Titel | text |
| `checkpoint_message` | `$checkpoint_message` | Checkpoint-Content | Checkpoint-Nachricht | textarea |

## Variables (ACF Repeater in Steps)

| ACF Feldname | PHP Variable | Template Verwendung | Beschreibung | Typ |
|---------------|--------------|---------------------|--------------|-----|
| `var_name` | `$name` | `data-var-name` | Variablenname | text |
| `var_description` | `$desc` | Variable-Help | Variablenbeschreibung | textarea |
| `example_value` | `$exampleV` | `placeholder` | Beispielwert | text |
| `required` | `$required` | `aria-required` | Pflichtfeld | true_false |

## Context Requirements (ACF Repeater in Steps)

| ACF Feldname | PHP Variable | Template Verwendung | Beschreibung | Typ |
|---------------|--------------|---------------------|--------------|-----|
| `context_type` | `$req['context_type']` | Context-Requirements | Kontext-Typ (business/icp/tone/examples) | select |
| `required` | `$req['required']` | Context-Requirements | Kontext erforderlich | true_false |
| `source` | `$req['source']` | Context-Requirements | Kontext-Quelle | select |
| `default_value` | `$req['default_value']` | Context-Requirements | Standardwert | text |

## Selection System (ACF Repeater in Steps)

| ACF Feldname | PHP Variable | Template Verwendung | Beschreibung | Typ |
|---------------|--------------|---------------------|--------------|-----|
| `selection_mode` | `$selection_mode` | Selection-Logic | Auswahlmodus (none/single/multi) | select |
| `selection_key` | `$selection_key` | Selection-Logic | Auswahlschlüssel | text |
| `selection_display_label` | `$selection_display_label` | Selection-Logic | Anzeigelabel | text |
| `selection_min` | `$selection_min` | Selection-Logic | Mindestauswahl | number |
| `selection_max` | `$selection_max` | Selection-Logic | Maximalauswahl | number |

## Selection Options (ACF Repeater in Selection System)

| ACF Feldname | PHP Variable | Template Verwendung | Beschreibung | Typ |
|---------------|--------------|---------------------|--------------|-----|
| `option_label` | `$option['option_label']` | Selection-Options | Option-Label | text |
| `option_value` | `$option['option_value']` | Selection-Options | Option-Wert | text |
| `option_hint` | `$option['option_hint']` | Selection-Options | Option-Hinweis | text |

## Business Context (ACF Repeater in Steps)

| ACF Feldname | PHP Variable | Template Verwendung | Beschreibung | Typ |
|---------------|--------------|---------------------|--------------|-----|
| `use_business` | `$use_business` | Context-Injection | Business-Kontext verwenden | true_false |
| `use_icp` | `$use_icp` | Context-Injection | ICP-Kontext verwenden | true_false |
| `use_tone_of_voice` | `$use_tone_of_voice` | Context-Injection | Tone-of-Voice verwenden | true_false |

## JavaScript Variables

| JavaScript Variable | Verwendung | Beschreibung |
|---------------------|------------|--------------|
| `window.PF_VARS` | Globale Variable-Speicher | Hauptobjekt für Variablen |
| `window.PF_VARS.store` | Variable-Werte | Key-Value Store |
| `window.PF_VARS.get(varName)` | Variable abrufen | Holt Variable-Wert |
| `window.PF_VARS.set(varName, value)` | Variable setzen | Setzt Variable-Wert |
| `window.PF_VARS.updateAllPrompts()` | Prompt aktualisieren | Ersetzt alle Platzhalter |
| `window.copyToClipboard()` | Copy-Funktion | Kopiert Prompt in Zwischenablage |

## Template-Attribute

| HTML Attribut | Verwendung | Beschreibung |
|----------------|------------|--------------|
| `data-var-name` | Variable-Input | Verknüpft Input mit Variable |
| `data-prompt-template` | Prompt-Textarea | Markiert Prompt-Textarea |
| `data-base` | Prompt-Template | Ursprünglicher Prompt-Text |
| `data-action="copy-prompt"` | Copy-Button | Copy-Button-Identifikation |
| `data-example` | Variable-Input | Beispielwert für Placeholder |
| `data-mode` | Steps-Section | Access-Mode (free/signin/pro) |
| `data-total-steps` | Steps-Section | Gesamtanzahl Steps |
| `data-visible-steps` | Steps-Section | Anzahl sichtbarer Steps für aktuellen User |
| `aria-disabled="true"` | Locked Step | Markiert gesperrten Step (nur Header sichtbar) |
| `role="region"` | Locked Step | Accessibility-Attribut für Locked Steps |

## Platzhalter-Syntax

| Platzhalter | Verwendung | Beispiel |
|-------------|------------|----------|
| `{variable_name}` | Standard-Variable | `{company_name}` |
| `{previous_output}` | Vorherige Step-Ausgabe | `{previous_output}` |
| `{selected_item}` | Ausgewählte Option | `{selected_item}` |

## Access Control Helper-Funktionen

| Funktion | Verwendung | Rückgabewert | Beschreibung |
|----------|------------|--------------|--------------|
| `pf_user_is_logged_in()` | Template/Logic | `bool` | Prüft ob User eingeloggt ist |
| `pf_user_has_pro(?int $user_id)` | Template/Logic | `bool` | Prüft Pro-Zugriff (Capability oder User Meta) |
| `pf_workflow_mode(int $post_id)` | Template/Logic | `string` | Gibt Access-Mode zurück (free/signin/pro), Default: pro |
| `pf_free_step_limit(int $post_id)` | Template/Logic | `int` | Gibt Free Step Limit zurück (≥0), Default: 0 |
| `pf_can_view_all(int $post_id)` | Template/Logic | `bool` | Prüft ob User alle Steps sehen kann |
| `pf_visible_steps_count(int $post_id, int $total_steps)` | Template/Logic | `int` | Berechnet Anzahl sichtbarer Steps |
| `pf_mode_badge_text(string $mode)` | Template | `string` | Badge-Text für Access-Mode (Free/Sign-in/Pro) |
| `pf_mode_badge_css(string $mode)` | Template | `string` | CSS-Klasse für Badge (pf-badge--free/signin/pro) |
| `pf_get_access_cta(int $post_id)` | Template | `array\|null` | CTA-Info für Locked-Workflows (URL + Text) |

**Access-Mode Logik:**
- `free`: Alle Steps sichtbar für alle User
- `signin`: Alle Steps sichtbar für eingeloggte User, sonst nur `free_step_limit` Steps
- `pro`: Alle Steps sichtbar für eingeloggte User mit Pro, sonst nur `free_step_limit` Steps

**Security:**
- Server-seitiges Gating: Gesperrte Steps enthalten keinen vertraulichen Inhalt im HTML
- Locked Placeholder: Nur Header sichtbar, kein Prompt/Body-Content im DOM

## Datei-Zuordnung

| Datei | Zweck | Wichtige Variablen |
|-------|-------|-------------------|
| `single-workflows.php` | Workflow-Template | Alle PHP-Variablen |
| `functions.php` | Theme-Funktionen | Admin-Columns, AJAX |
| `inc/pf-access.php` | Access-Control Helper | Alle `pf_*()` Access-Funktionen |
| `src/php/template-parts/workflow/header.php` | Workflow-Header | Access-Mode Badge |
| `src/php/template-parts/workflow/section-steps.php` | Steps-Rendering | Access-Control Logic, Locked Placeholders |
| `pf-workflows.js` | JavaScript-Logic | `window.PF_VARS`, Copy-Funktionen |
| `pf-workflows.css` | Styling | CSS-Klassen für UI |
| `assets/css/components/workflow-header.css` | Header Styles | Badge-Styles (Free/Sign-in/Pro) |
| `assets/css/components/workflow-steps.css` | Steps Styles | Locked Steps, Access CTA |
| `group_68a082f7ac4d6.json` | ACF-Definition | Alle ACF-Felder |

## Debug-Informationen

| Debug-Ausgabe | Quelle | Zweck |
|---------------|--------|-------|
| `console.log('PF: Script starting to load...')` | JavaScript | Script-Loading |
| `console.log('PF: Found X variable inputs')` | JavaScript | Input-Erkennung |
| `console.log('PF: Variable changed: varName = value')` | JavaScript | Variable-Updates |
| `console.log('PF: Replacing {var} with value')` | JavaScript | Platzhalter-Ersetzung |
| `error_log('[PF Single] ...')` | PHP | Server-Side Debugging |

## Wichtige Konstanten

| Konstante | Wert | Verwendung |
|-----------|------|-----------|
| `PF_MIN_RATING` | 1 | Mindestbewertung |
| `PF_MAX_RATING` | 5 | Maximalbewertung |
| `PF_DEFAULT_FREE_STEPS` | 1 | Standard freie Steps (Deprecated - nutze ACF `free_step_limit`) |
| `PF_RATE_LIMIT_DURATION` | 60 | Rate-Limit in Sekunden |
| `PF_FAV_LIMIT_DURATION` | 60 | Favoriten-Rate-Limit |
| `PF_CACHE_DURATION` | 3600 | Cache-Dauer in Sekunden |

## CSS-Klassen für Access Control

| CSS-Klasse | Verwendung | Beschreibung |
|------------|------------|--------------|
| `.pf-meta-chip--free`, `.pf-badge--free` | Header Badge | Free-Mode Badge (grün) |
| `.pf-meta-chip--signin`, `.pf-badge--signin` | Header Badge | Sign-in-Mode Badge (gelb) |
| `.pf-meta-chip--pro`, `.pf-badge--pro` | Header Badge | Pro-Mode Badge (gelb) |
| `.pf-step--locked` | Locked Step | Gesperrter Step (nur Header sichtbar) |
| `.pf-step-locked` | Locked Placeholder | Lock-Placeholder-Inhalt |
| `.pf-access-cta` | Access CTA | CTA-Box für Login/Upgrade |
| `.pf-access-cta-text` | CTA Text | Text innerhalb CTA |
| `.pf-access-cta-btn` | CTA Button | Button innerhalb CTA |

---

## Änderungsprotokoll

### Access Control System (Update)
- ✅ **Neu**: Einheitliches `access_mode` System (free/signin/pro)
- ✅ **Neu**: Helper-Funktionen in `inc/pf-access.php`
- ✅ **Neu**: Server-seitiges Gating mit Locked Placeholders
- ❌ **Deprecated**: `login_required` → Nutze `access_mode` (signin/pro)
- ❌ **Deprecated**: `access_tier` → Nutze `access_mode`
- ⚠️ **Wichtig**: `access_mode` leer/unbekannt → Verhält sich wie 'pro' (HARDLOCK)
- ⚠️ **Wichtig**: `free_step_limit` leer → Treated als 0 (HARDLOCK)

---

**Hinweis:** Diese Übersicht zeigt alle Variablen und deren Zusammenhänge im PromptFinder Workflow-System. Jede Variable ist mit ihrem ACF-Feldnamen, PHP-Variablen-Namen und Template-Verwendung verknüpft.

**Access Control:** Das System verwendet serverseitiges Gating. Gesperrte Steps enthalten keinen vertraulichen Inhalt im HTML-DOM. Die Lock-Logik wird über Helper-Funktionen in `inc/pf-access.php` zentralisiert.

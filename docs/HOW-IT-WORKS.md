# How It Works

## 1. User Flow (Endbenutzer)

1. **Workflow wählen** – Nutzer öffnet `/workflows/{slug}` (Single Template).  
2. **Überblick lesen** – Header zeigt Titel, Meta, Progress-Leiste. Overview/Prerequisites erklären Kontext.  
3. **Variablen ausfüllen** – Globales Formular (Workflow Variables) nimmt Inputs entgegen. Validierung erfolgt live.  
4. **Status prüfen** – Variable-Status-Bar zeigt „X of Y inputs filled“. Fast Track kann (nach Trigger) eingeschaltet werden.  
5. **Steps durchlaufen** – Jede Step-Card lässt sich öffnen, Prompt kopieren, Step-spezifische Inputs ausfüllen.  
6. **Completion** – Checkbox / Progress aktualisiert sich; bei Fast Track werden Steps automatisch expanded.  
7. **Pricing / Checkout** – Bei Bedarf geht der Nutzer auf `/pricing`, wählt Plan und löst Lemon Squeezy Checkout aus.

## 2. Code Flow (High Level)

```
single-workflows.php
 ├─ src/php/template-parts/workflow/header.php
 ├─ src/php/template-parts/workflow/section-variable-status.php
 ├─ src/php/template-parts/workflow/section-fast-track-toggle.php
 ├─ src/php/template-parts/workflow/section-overview.php
 ├─ src/php/template-parts/workflow/section-prerequisites.php
 ├─ src/php/template-parts/workflow/section-variables.php
 └─ src/php/template-parts/workflow/section-steps.php

functions.php
 ├─ Enqueues pf-core.css, pf-workflows-main.css, Komponenten CSS
 ├─ Enqueues pf-workflows.js, tracking.js, fast-track.js, pf-tracking-init.js
 └─ Localized Data via pf-variables-localize (app/bootstrap)

pf-workflows.js
 ├─ Initialisiert PF Namespace (Stores, Resolver)
 ├─ Rendert Workflow-/Step-Formulare
 ├─ Bindet Events (copy, validation, toggles)
 └─ Aktualisiert Status, Progress, Fast Track States

modules/tracking.js + pf-tracking-init.js
 ├─ REST/LocalStorage Tracking (Visits)
 ├─ Trigger pf:threshold-met Event
 └─ Setzt pf-fast-track-active Klasse

modules/fast-track.js
 ├─ Handhabt Toggle UI + Tooltip
 ├─ Aktiviert Fast Track Layout (Overview collapsed, Steps expanded)
 └─ Meldet UI-Status (Custom Events)
```

## 3. Event Handling

| Event | Quelle | Wirkung |
| --- | --- | --- |
| `DOMContentLoaded` | Browser | `pf-workflows.js` init, `pf-tracking-init.js` ⇒ `PF.Tracking.trackVisit` |
| `pf:threshold-met` | `pf-tracking-init.js` | Fast Track Toggle einblenden |
| `pf:fast-track-enabled` / `pf:fast-track-disabled` | `fast-track.js` | DOM-Updates (Overview collapse, Steps expand) |
| `click` / `input` | Form Controls | `pf-workflows.js` speichert Werte, aktualisiert Status |
| `copy` Button | Prompt | Kopiert Prompt in Clipboard, toggelt „is-copied“ State |
| REST `POST /pf/v1/track-visit` | Tracking | Inkrementiert User Visits (User Meta) |
| REST `POST /pf/v1/fast-track-preference` | Tracking | Speichert Toggle-Status |

## 4. State Management

- **PF_FORM_STORE** (`pf-workflows.js`) – In-Memory-Map der aktuellen Formularwerte.  
- **LocalStorage** – Anonyme Besucher: `pf_workflow_visits`, `pf_fast_track_enabled`, `pf_fast_track_preference`.  
- **User Meta** (`PF_User_Tracking` PHP) – Eingeloggt: Visit-Counter, Fast Track Preference.  
- **Dataset Attributes** – DOM-Elemente (z. B. `[data-wf-form]`, `[data-pf-step]`) speichern statische Informationen (IDs, Hinweise, Step-JSON).  
- **ACF** – Backend: Workflow- und Step-Konfiguration (Variables, Prompts, Access Mode).

## 5. API Calls

| Endpoint | Methode | Zweck |
| --- | --- | --- |
| `/wp-json/pf/v1/track-visit` | POST | Besucherzählung (User Meta) |
| `/wp-json/pf/v1/tracking-data` | GET | Sync LocalStorage ↔ User Meta |
| `/wp-json/pf/v1/fast-track-preference` | POST | Speichert Fast Track Toggle Status |
| Lemon Squeezy Script (`https://app.lemonsqueezy.com/js/lemon.js`) | GET (Script) | Pricing Checkout |

Alle REST-Endpoints werden in `src/php/inc/class-pf-user-tracking.php` registriert. Auf Pricing-Seite werden zusätzlich externe Daten (Plan-Konfiguration) via Inline JSON (`#pf-pricing-config`) übergeben und von `pf-pricing.js` konsumiert.



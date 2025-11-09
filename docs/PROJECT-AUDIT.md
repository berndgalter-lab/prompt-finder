# Project Audit — 9 Nov 2025

## 1. Datei-Inventar

**Legende:** Größe in KB (gerundet), Datum = letzte Änderung (Systemzeit).

### PHP / Templates

| Datei | Größe | Datum |
| --- | --- | --- |
| `functions.php` | 54.7 KB | 2025-11-08 |
| `single-workflows.php` | 2.6 KB | 2025-11-08 |
| `page-pricing.php` | 17.1 KB | 2025-11-04 |
| `header.php`, `footer.php`, `style.css`, `index.php` | 9.1 / 13.7 / 10.2 / 0.0 KB | 2025-11-01…10-25 |
| `src/php/inc/*.php` (Access, Tracking) | 1.0–9.8 KB | 2025-11-08 |
| `src/php/app/**/*.php` (Bootstrap, Contracts, Infra, REST) | 0.4–4.5 KB | 2025-11-06 |
| `src/php/template-parts/workflow/*.php` | 0.2–22.3 KB | 2025-11-08 |
| `docs/MIGRATION_SCRIPT.php` | 6.5 KB | 2025-10-26 |

### CSS

| Datei | Größe | Datum |
| --- | --- | --- |
| `src/styles/core/pf-core.css` | 23.3 KB | 2025-11-08 |
| `src/styles/workflows/base.css` | 3.4 KB | 2025-11-08 |
| `src/styles/workflows/legacy/workflow-*.css` | 3–25 KB | 2025-11-08 |
| `src/styles/workflows/legacy/pf-workflows.css` | 59.6 KB | 2025-11-08 |
| `src/styles/workflows/modern/workflow-*.css` | 4.5–9.8 KB | 2025-11-08 |
| `src/styles/workflows/modern/fast-track-{content,toggle}.css` | 6.1 / 7.5 KB | 2025-11-08 |
| `style.css`, `src/styles/pages/{pf-landing,pf-pricing,pf-blog}.css` | 7.8–10.5 KB | 2025-11-08…10-25 |
| `archive/styles/pf-components.css` | 5.4 KB | 2025-10-25 |

### JavaScript

| Datei | Größe | Datum |
| --- | --- | --- |
| `src/scripts/workflows/pf-workflows.js` | 64.9 KB | 2025-11-08 |
| `src/scripts/workflows/modules/{fast-track,tracking}.js` | 11.0 / 6.2 KB | 2025-11-08 |
| `src/scripts/workflows/entry/pf-tracking-init.js` | 2.1 KB | 2025-11-08 |
| `src/scripts/pages/pricing.js` | 4.1 KB | 2025-11-03 |
| `assets/js/pf-navigation.js` | 2.8 KB | 2025-10-25 |
| `archive/scripts/{pf-analytics.js,pf-core.js,pf-learn-use-mode.js,pf-workflow-navigation.js}` | 1.9–7.3 KB | 2025-10-25 |

### JSON / Config

| Datei | Größe | Datum |
| --- | --- | --- |
| `acf-json/acf-export-2025-11-08.json` | 66.9 KB | 2025-11-08 |
| `app/acf-export-2025-11-08.json` | 68.6 KB | 2025-11-08 |
| `docs/acf-schema/*.json` (Backups) | 49–57 KB | 2025-10-26…27 |
| `assets/pf-config.json` | 2.7 KB | 2025-10-29 |

### Markdown / Dokumentation

| Datei | Größe | Datum |
| --- | --- | --- |
| `docs/README.md` | 4.8 KB | 2025-10-26 |
| `docs/FIELD_NAMES_AUDIT.md` | 4.0 KB | 2025-10-29 |
| `archive/docs/archive/FIELD_NAMES_AUDIT.md` | 4.0 KB | 2025-10-26 |
| `docs/ADMIN_FEATURES_ROADMAP.md` | 7.0 KB | 2025-10-26 |
| `docs/acf-current-structure.md` | 7.8 KB | 2025-10-27 |
| `docs/blueprints/Prompt Finder — Workflow Blueprint (v1.7).md` | 11.7 KB | 2025-10-25 |
| `docs/deployment/*.md` | 5.5–6.6 KB | 2025-10-26 |
| `archive/docs/archive/*.md` | 7.6–10.1 KB | 2025-10-26 |
| `docs/acf-schema/Prompt Finder — ACF Field Reference …` | 15.0 KB | 2025-10-25 |
| `docs/dev-notes/FAST-TRACK-MODE-SPEC-v1.md` | 15.0 KB | 2025-11-08 |
| `docs/dev-notes/pf-ui-modern-plan.md` | 2.9 KB | 2025-11-08 |
| `WORKFLOW_VARIABLES_OVERVIEW.md` | 12.4 KB | 2025-11-01 |

### Sonstiges

| Datei | Beschreibung |
| --- | --- |
| `.cursorrules`, `.gitignore` | Projekt-Policies / Git-Ignore |
| `docs/dev-notes/` | temporäre Spezifikationen/Pläne |

---

## 2. CSS-Analyse

### Enqueue-/Import-Matrix

| Datei | Quelle | Status |
| --- | --- | --- |
| `style.css` | Theme Header (WordPress Core) | ✅ Basis-Styles |
| `src/styles/core/pf-core.css` | `functions.php` (global) | ✅ Token + Utility Layer |
| `src/styles/workflows/base.css` | `functions.php` | ✅ Wrapper/Layout für Workflowseiten |
| `src/styles/workflows/legacy/workflow-{header,sidebar,sections,variables,steps}.css` | `functions.php` | ✅ Legacy Komponenten (werden weiterhin mitgeladen) |
| `src/styles/workflows/modern/workflow-*.css` | `functions.php` | ✅ Neue Modern-Layer (parallel zu Legacy geladen) |
| `src/styles/workflows/modern/fast-track-{toggle,content}.css` | `functions.php` | ✅ Fast-Track UI |
| `src/styles/workflows/legacy/pf-workflows.css` | `functions.php` (Archive/Taxonomie Hooks) | ✅ Für Workflow-Archive |
| `src/styles/pages/pf-landing.css` | `functions.php` (Landing Hooks) | ✅ Landing Pages |
| `src/styles/pages/pf-pricing.css` | `functions.php` (Pricing Hook) | ✅ Pricing Page |
| `src/styles/pages/pf-blog.css` | `functions.php` (Blog Hook + Editor) | ✅ Blog Layout |
| `archive/styles/pf-components.css` | archiviert | ⚠️ prüfen/entfernen |

### Auffälligkeiten

- Legacy- und Modern-Komponenten werden parallel enqueued → doppelte Selektoren (z. B. `.pf-step`) zwischen `legacy/` und `modern/`.  
- `src/styles/workflows/legacy/pf-workflows.css` enthält alte Layout-Regeln; moderne Varianten sollten schrittweise übernehmen.  
- Token-Layer (`src/styles/core/pf-core.css`) sollte als Single Source gelten; Seiten-Styles mit Fallback-Variablen angleichen.  
- Archivierte Styles (`archive/styles/pf-components.css`) final prüfen und ggf. entfernen.  
- Header- und Sidebar-Modernvarianten sind jetzt in den Legacy-Dateien integriert; entsprechende `*-modern.css` wurden archiviert.  
- Variablen-/Status-Styling (`workflow-variables.css`, Fast-Track-Toggle) bündelt jetzt Basis + `.pf-ui-modern` Enhancements; `workflow-variables-modern.css` und `fast-track-toggle.css` liegen im Archiv.  
- Schritt-Layout (`workflow-steps.css`) liefert nun Base + Modern in einem File; `workflow-steps-modern.css` wurde archiviert, Enqueue entfernt.  

---

## 3. JavaScript-Analyse

### Enqueue-/Ladepfade

| Datei | Ladeort | Zweck | Status |
| --- | --- | --- | --- |
| `src/scripts/workflows/pf-workflows.js` | `functions.php` (global) | Hauptorchestrator (PF Namespace) | ✅ |
| `src/scripts/workflows/modules/tracking.js` | `functions.php` | Stellt `PF.Tracking` bereit | ✅ |
| `src/scripts/workflows/entry/pf-tracking-init.js` | `functions.php` | Auto-Tracking beim Laden | ✅ (benötigt `PF.Tracking`) |
| `src/scripts/workflows/modules/fast-track.js` | `functions.php` | UI-Verhalten Fast Track | ✅ (setzt `PF.Tracking` voraus) |
| `assets/js/pf-navigation.js` | `functions.php` | Header/Nav Interaktionen | ✅ (Legacy-Pfad) |
| `src/scripts/pages/pricing.js` | `functions.php` (Pricing-Hook) | Pricing Toggle & Lemon Loader | ✅ |
| `archive/scripts/pf-analytics.js` | kein Enqueue gefunden | Legacy |
| `archive/scripts/pf-core.js` | kein Enqueue gefunden | Legacy |
| `archive/scripts/pf-learn-use-mode.js` | kein Enqueue gefunden | Legacy „Learn/Use“-Modus |
| `archive/scripts/pf-workflow-navigation.js` | kein Enqueue gefunden | Alte Navigation |

### Import-/Modul-Beziehungen

- Es gibt kein ES6-Importsystem; alle Dateien sind IIFEs und schreiben in das globale `PF` Objekt.  
- `pf-tracking-init.js` und `modules/fast-track.js` konsumieren `PF.Tracking` aus `modules/tracking.js`.  
- `pf-workflows.js` kapselt zahlreiche Hilfsfunktionen (Resolver, Status-Bar Updates, DOM Renderer).  
- `pf-navigation.js`, `pf-pricing.js` laufen standalone (DOM-Presence-Checks).  
- Unreferenzierte Dateien (`pf-analytics.js`, `pf-core.js`, `pf-learn-use-mode.js`, `pf-workflow-navigation.js`) definieren Funktionen, die nirgendwo mehr registriert werden → klare Lösch-/Archiv-Kandidaten.

### Unbenutzte Funktionen

- In den aktiven Dateien konnten keine offensichtlichen „dead code“ Funktionen identifiziert werden – die meisten Helper werden innerhalb desselben IIFE verwendet.  
- Die Legacy-Dateien (⚠️) enthalten eigenständige Logik (Analytics-Init, Onboarding) ohne aktuelle Abnehmer → gesamter Codeblock gilt als ungenutzt.

---

## 4. Dokumentations-Analyse

| Datei | Inhalt / Zweck | Konsolidierungs-Idee |
| --- | --- | --- |
| `docs/README.md` | Überblick über Ordner & Skripte | Behalten (zentraler Einstieg) |
| `docs/FIELD_NAMES_AUDIT.md` & `docs/archive/FIELD_NAMES_AUDIT.md` | Feld-Mapping Analyse (duplicated) | Zusammenführen, Archiv-Version löschen |
| `docs/ADMIN_FEATURES_ROADMAP.md` | Backlog/Features | In neues „Product Roadmap“ Kapitel integrieren |
| `docs/acf-current-structure.md` | Aktuelle ACF Felder | Kann mit `docs/acf-schema/...` verlinkt werden |
| `docs/blueprints/Prompt Finder — Workflow Blueprint (v1.7).md` | UX Blueprint v1.7 | Prüfen, ob `assets/dev/pf-ui-modern-plan.md` integriert werden kann |
| `docs/deployment/DEPLOYMENT.md` | Aktuelle Deployment-Anleitung | Behalten (ersetzt alte Einzel-Dokumente) |
| `docs/archive/*.md` | Alte Audits | Nur behalten, wenn Historie benötigt; sonst archiv/zip |
| `docs/acf-schema/*.json/.md` | Export + Referenzen | Belassen (Referenzen) |
| `docs/dev-notes/FAST-TRACK-MODE-SPEC-v1.md` | Spez Fast Track | Inhalte ggf. in HOW-IT-WORKS integrieren |
| `docs/dev-notes/pf-ui-modern-plan.md` | UI Modern Plan | Mit Blueprint zusammenführen |
| `WORKFLOW_VARIABLES_OVERVIEW.md` | Übersicht über ACF Variablen | In neue Architektur-Doku referenzieren |

**Empfehlung:**  
- Neue Kern-Dokumente (`ARCHITECTURE.md`, `HOW-IT-WORKS.md`, `CHANGELOG.md`) als „Single Source of Truth“.  
- Historische Analysen in `/docs/archive/` belassen oder verdichten.  
- `assets/dev` ausschließlich für temporäre Arbeitsnotizen verwenden – langfristige Inhalte in `docs/`.

---

### Zusammenfassung der Auffälligkeiten

- **Doppelte Styles**: Legacy + Modern CSS laufen parallel → Risiko von Konflikten.  
- **Unbenutzte Assets**: Archivierte Skripte/Styles können nach Validierung gelöscht werden.  
- **Dokumentation**: Viele historische `.md`; klare Struktur und Konsolidierung empfohlen.  
- **Nächste Schritte**: PHP-Struktur migrieren, Legacy-CSS reduzieren, Docs vereinheitlichen.



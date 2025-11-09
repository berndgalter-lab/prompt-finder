# Projekt-Architektur

## Übersicht
Prompt Finder ist ein WordPress-Child-Theme (GeneratePress) für interaktive KI-Workflows. Es rendert Workflow-Seiten mit variablen Eingaben, Status-Tracking, Fast-Track-Modus und Step-by-Step-Anleitungen. Zusätzlich existieren Landing-/Pricing-Seiten und Blog-Layouts.

## Datei-Struktur (Ist-Zustand)

```
/
├── functions.php                # zentrale Theme-Logik (Enqueues, Hooks)
├── style.css                    # Theme Header + Grundstyles
├── header.php / footer.php      # Theme Header/Footer
├── single-workflows.php         # Workflow Detail Template
├── page-pricing.php             # Pricing Seite
├── src/
│   ├── php/
│   │   ├── inc/                 # PHP-Helfer (Access Control, Tracking)
│   │   ├── app/                 # ACF/REST Contracts & Infrastruktur
│   │   └── template-parts/workflow/  # UI Teilschablonen (Header, Steps, Sidebar, Footer)
│   ├── styles/
│   │   ├── core/                # Token Layer (pf-core.css)
│   │   ├── workflows/
│   │   │   ├── modern/          # Neue Workflow Komponenten (& Fast Track)
│   │   │   └── legacy/          # Alte Workflow Styles
│   │   └── pages/               # Landing, Pricing, Blog
│   └── scripts/
│       ├── workflows/           # pf-workflows.js + Module + Entry
│       └── pages/               # pricing.js etc.
├── archive/                     # ausgelagerte Legacy-Assets (CSS/JS/Docs)
├── assets/
│   ├── dev/                     # temporäre Spezifikationen/Pläne
│   └── pf-config.json           # Konfigurationswerte / ggf. weitere Assets (Legacy)
├── docs/                        # Dokumentation (ACF, Deployment, Audit, etc.)
├── acf-json/                    # ACF Field Exports (für Versionierung)
└── WORKFLOW_VARIABLES_OVERVIEW.md
```

## Entry Points

- **HTML**: WordPress rendert `single-workflows.php` (Workflows), `page-pricing.php`, `index.php`, `page.php`.  
- **JavaScript**: `src/scripts/workflows/pf-workflows.js` (global orchestrator) + `src/scripts/workflows/modules/{tracking,fast-track}.js`, `src/scripts/workflows/entry/pf-tracking-init.js`.  
- **CSS**: `style.css` → `src/styles/core/pf-core.css` → `src/styles/workflows/base.css` + Komponenten.

## Aktive Dateien (✅ in Nutzung)

- `functions.php`, `single-workflows.php`, `src/php/template-parts/workflow/*.php`  
- `src/styles/core/pf-core.css`, `src/styles/workflows/base.css`  
- `src/styles/workflows/{legacy,modern}/workflow-*.css`  
- `src/styles/workflows/modern/fast-track-{content,toggle}.css`  
- `src/scripts/workflows/pf-workflows.js`, `src/scripts/workflows/modules/{tracking.js,fast-track.js}`, `src/scripts/workflows/entry/pf-tracking-init.js`  
- `src/scripts/pages/pricing.js` (Pricing Page)  
- `src/php/inc/pf-access.php`, `src/php/inc/class-pf-user-tracking.php`  
- ACF Exporte (`acf-json`, `app/acf-export-*.json`)  
- Docs: `docs/PROJECT-AUDIT.md`, `docs/PROPOSED-STRUCTURE.md`, `docs/ARCHITECTURE.md`, `docs/HOW-IT-WORKS.md` (in Arbeit), etc.

## Deprecated / Unsicher (⚠️ prüfen)

- CSS: `archive/styles/pf-components.css` (Legacy, kann entfernt werden)  
- JS: `archive/scripts/{pf-analytics.js,pf-core.js,pf-learn-use-mode.js,pf-workflow-navigation.js}`  
- Dokumente: `archive/docs/archive/*.md`, `docs/deployment/*.md` (veraltet; konsolidieren)

## Datenfluss

1. Beim Seitenaufruf lädt WordPress das Template (`single-workflows.php`).  
2. PHP localized Data (z. B. Variablen, Steps, Fast-Track-Flags) via `pf-variables-localize`.  
3. `pf-workflows.js` orchestriert:  
   - Baut Forms (Workflow + Steps)  
   - Registriert Resolver (Step>Workflow>Profile)  
   - Aktualisiert Status-Bar & Progress  
4. `tracking.js` + `pf-tracking-init.js`:  
   - Speichern Besuchs-Counter (LocalStorage/UserMeta via REST)  
   - Meldet Schwellenwerte, toggelt Fast Track UI  
5. `fast-track.js`:  
   - Bindet Toggle, filtert DOM (Overview/Steps)  
6. Interaktionen (copy buttons, validation) laufen über DOM-Events in `pf-workflows.js`.

- **Workflow Header (`src/php/template-parts/workflow/header.php`)**: Titel, Meta, Progress.  
- **Variables (`src/php/template-parts/workflow/section-variables.php`)**: Workflow-Input-Formular (Global Inputs).  
- **Steps (`src/php/template-parts/workflow/section-steps.php`)**: Step-by-Step Cards, Toggle, Prompt, Example.  
- **Fast Track Toggle (`src/php/template-parts/workflow/section-fast-track-toggle.php`)**: UI Card, Switch → JS in `modules/fast-track.js`.  
- **Tracking (`src/php/inc/class-pf-user-tracking.php`, `src/scripts/workflows/modules/tracking.js`)**: REST + LocalStorage Visits.  
- **ACF Contracts (`app/**`)**: Strukturiert Zugriff auf benutzerdefinierte Felder.  
- **Pricing (`page-pricing.php`, `src/styles/pages/pf-pricing.css`, `src/scripts/pages/pricing.js`)**: Separate Seite mit Lemon Squeezy Anbindung.



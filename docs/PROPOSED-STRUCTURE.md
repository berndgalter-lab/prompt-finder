# Proposed Project Structure (Draft — 9 Nov 2025)

> **Status-Update (09.11.2025):** Styles, Scripts und Workflow-Template-Parts liegen bereits unter `/src/**`; Archiv-Ordner sind angelegt. Dokumenten-Konsolidierung (teilweise) läuft weiter.

## 1. Zielstruktur (High Level)

```
/archive/                  # für Legacy/unused assets (keine Produktiv-Nutzung)
/docs/                     # zentrale Dokumentation
  ARCHITECTURE.md
  HOW-IT-WORKS.md
  CHANGELOG.md
  ...
/src/                      # aktive Quell-Dateien
  /php/                    # Theme-PHP (Templates, Inc, App)
    /inc/
    /template-parts/
    /app/
  /styles/                 # CSS
    core/                  # Token Layer (pf-core.css)
    workflows/             # Workflow-spezifische Styles (modern)
    legacy/                # Alte Komponenten (falls noch benötigt)
    pages/                 # Landing, Pricing, Blog …
  /scripts/                # JS
    workflows/             # pf-workflows.js + Module
    pages/                 # pf-pricing.js etc.
  /config/                 # JSON-Konfigurationen, ACF-Exports

/public/                   # Von WP geladene Dateien (header.php, footer.php, style.css)
/assets/ (alias)           # Falls notwendig, weitergeleitet auf /src/ oder nur Medien
```

## 2. Migration-Plan (Datei → Neuer Pfad)

| Aktuell | Vorschlag | Kommentar |
| --- | --- | --- |
| `functions.php`, `header.php`, `footer.php`, `style.css`, `index.php` | `/public/` (oder im Root belassen, aber dokumentieren) | WP benötigt bestimmte Namen im Theme-Root – nur organisieren, nicht verschieben |
| `inc/` | `/src/php/inc/` | reine PHP-Helfer |
| *(ALT)* `template-parts/workflow/` | `src/php/template-parts/workflow/` | ✅ Verschoben (2025-11-09) – Struktur unverändert |
| `app/**` | `/src/php/app/**` | Backend-Funktionen/ACF |
| `assets/css/pf-core.css` | `/src/styles/core/pf-core.css` | Token Layer |
| `assets/css/pf-workflows-main.css` | `/src/styles/workflows/base.css` | Struktur neu benennen |
| `assets/css/components/workflow-*.css` | `/src/styles/workflows/legacy/*.css` | Altbestand |
| `assets/css/components/workflow-*-modern.css` | `/src/styles/workflows/modern/*.css` | Aktiv |
| `assets/css/components/fast-track-*.css` | `/src/styles/workflows/modern/fast-track/*.css` | Gruppieren |
| `assets/css/pf-workflows.css` | `/src/styles/workflows/legacy/pf-workflows.css` | Legacy |
| `assets/css/pf-landing.css`, `pf-pricing.css`, `pf-blog.css` | `/src/styles/pages/**` | Page-spezifisch |
| `assets/js/pf-workflows.js` | `/src/scripts/workflows/pf-workflows.js` | Haupt-Orchestrator |
| `assets/js/modules/{tracking,fast-track}.js` | `/src/scripts/workflows/modules/**` | Unterordner |
| `assets/js/pf-tracking-init.js` | `/src/scripts/workflows/entry/` | Bootstrapping |
| `assets/js/pf-pricing.js` | `/src/scripts/pages/pricing.js` | Seitenmodule |
| `assets/dev/*.md` | `/docs/dev-notes/` oder `archive/dev/` | In Doc-Bereich integrieren |
| `docs/archive/*.md` | `/archive/docs/` | Klar als Historie kennzeichnen |
| `assets/js/pf-analytics.js`, `pf-core.js`, `pf-learn-use-mode.js`, `pf-workflow-navigation.js` | `/archive/scripts/` | aktuell ungenutzt |
| `assets/css/pf-components.css` | `/archive/styles/` | ungenutzt |

## 3. Lösch-/Archiv-Kandidaten

| Datei | Grund |
| --- | --- |
| `.DS_Store` | OS-Metadatei → löschen |
| `assets/css/pf-components.css` | keine Enqueue, Legacy |
| `assets/js/pf-analytics.js`, `pf-core.js`, `pf-learn-use-mode.js`, `pf-workflow-navigation.js` | keine aktuelle Einbindung |
| `docs/archive/FIELD_NAMES_AUDIT.md` (Duplikat) | mit aktueller Version zusammenführen |
| `docs/deployment/*` | ✅ Konsolidiert → `docs/deployment/DEPLOYMENT.md` |
| `assets/dev/pf-ui-modern-plan.md` (nach Übernahme in Architektur-Doku) | optional |
| `assets/dev/FAST-TRACK-MODE-SPEC-v1.md` (wenn Inhalte in HOW-IT-WORKS einfließen) | optional |
| `docs/MIGRATION_SCRIPT.php` (falls Migration abgeschlossen) | archivieren oder löschen |

**Hinweis:** Vor Verschiebungen immer sicherstellen, dass WordPress weiterhin die erwarteten Theme-Dateien im Root findet (`style.css`, `functions.php`, `index.php`). Eine sanfte Migration wäre:

1. Neue Zielordner anlegen (`src/styles/...`, `src/scripts/...`).  
2. Dateien kopieren/verschieben und `functions.php` Enqueues anpassen.  
3. Tests (Frontend, WP Admin) durchführen.  
4. Legacy-Dateien nach `/archive/` verschieben und später löschen, sobald verifiziert.



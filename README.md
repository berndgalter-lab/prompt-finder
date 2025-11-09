# Prompt Finder — GeneratePress Child Theme

Prompt Finder erweitert GeneratePress um interaktive KI-Workflows. Nutzer können Variablen ausfüllen, Schritt-für-Schritt-Anleitungen folgen, Fast-Track-Modi nutzen und Pricing-Seiten aufrufen. Das Theme bündelt alle ACF-Felder, REST-Endpoints und Frontend-Interaktionen an einem Ort.

## Schnellstart

1. **Installieren**  
   - Repository als Theme in `wp-content/themes/generatepress-child/` ablegen.  
   - Sicherstellen, dass GeneratePress (Parent) aktiv ist.
2. **Aktivieren**  
   - Im WordPress-Backend „Design → Themes“ das Child-Theme aktivieren.
3. **ACF Felder importieren**  
   - `acf-json/acf-export-2025-11-08.json` oder `app/acf-export-2025-11-08.json` in ACF importieren.
4. **Build/Assets**  
   - Keine Build-Pipeline nötig (reines PHP/CSS/JS).  
   - Änderungen an CSS/JS werden direkt aus `assets/` geladen.

## Projekt-Struktur (Ist-Zustand)

```
functions.php, style.css, header.php, footer.php
src/php/inc/                 # PHP-Helfer (Access, Tracking)
src/php/app/                 # ACF/REST Contracts, Bootstrap
src/php/template-parts/workflow/   # Workflow Template Parts (Header, Sections, Sidebar)
src/styles/                  # CSS (core, workflows/{modern,legacy}, pages)
src/scripts/                 # JS (workflows modules, entry, pages)
archive/                     # Abgelegte Legacy-Assets (Styles/Scripts/Docs)
docs/                        # Dokumentation, Audits, Blueprints
docs/dev-notes/              # Laufende Spezifikationen/Pläne
acf-json/                    # ACF Exports für Versionierung
assets/js/pf-navigation.js   # (noch im Legacy-Pfad, folgt Migration)
```

> Geplante Umstrukturierung siehe `docs/PROPOSED-STRUCTURE.md`.

## Dokumentation

- `docs/ARCHITECTURE.md` – Gesamtarchitektur & Komponentenüberblick  
- `docs/HOW-IT-WORKS.md` – User-/Code-Flow, Events, API Calls  
- `docs/PROJECT-AUDIT.md` – Inventar & Analyse (Stand 09.11.2025)  
- `docs/PROPOSED-STRUCTURE.md` – Zielstruktur & Migration  
- `CLEANUP-PLAN.md` – Konkrete Schritte für die Umorganisation  
- Weitere Infos: `docs/dev-notes/`, `docs/deployment/DEPLOYMENT.md`, `archive/docs/archive/`

## Entwicklung

- **Haupt-JS:** `src/scripts/workflows/pf-workflows.js`, `src/scripts/workflows/modules/{tracking,fast-track}.js`  
- **Haupt-CSS:** `src/styles/core/pf-core.css`, `src/styles/workflows/base.css` + Komponenten  
- **REST Hooks:** `src/php/inc/class-pf-user-tracking.php`, `src/php/app/http/pf-rest-presets.php`  
- **Page-spezifische Assets:** `src/styles/pages/pf-pricing.css`, `src/scripts/pages/pricing.js`

### Workflows

- `single-workflows.php` bindet alle Workflow-Partials ein.  
- Data-Layer (`pf-variables-localize.php`) stellt ACF-Werte/Settings bereit.  
- Fast Track Mode: Toggle → Tracking → DOM-Anpassung (`modules/fast-track.js`).

### Praxis-Tipps

- Nach Änderungen an CSS/JS Browser-Cache leeren (`?ver=filemtime`).  
- Vor jedem Commit `CLEANUP-PLAN.md` & `.cursorrules` berücksichtigen.  
- Für größere Umbauten (Ordnerstruktur) erst Plan aus `docs/PROPOSED-STRUCTURE.md` prüfen.

---
*Letzte Aktualisierung: 09.11.2025*


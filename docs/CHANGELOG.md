# Changelog

## [Aktuell] - 2025-11-09

### Projekt-Aufräumaktion
- ✅ Projekt-Audit durchgeführt (`docs/PROJECT-AUDIT.md`)
- ✅ Struktur-Vorschlag dokumentiert (`docs/PROPOSED-STRUCTURE.md`)
- ✅ Architektur- und Logik-Dokumentation erstellt (`docs/ARCHITECTURE.md`, `docs/HOW-IT-WORKS.md`)
- ✅ Aufräum-Plan erarbeitet (`CLEANUP-PLAN.md`)
- ✅ Styles/Scripts nach `/src/` migriert, Legacy-Assets archiviert
- ✅ README aktualisiert
- ✨ Breadcrumb-Navigation visuell & hinsichtlich Accessibility modernisiert (`src/styles/workflows/legacy/workflow-header.css`)
- ✨ Workflow-Header überarbeitet (klare Kontraste, einheitliche Tokens, Progress-Karte) (`src/styles/workflows/legacy/workflow-header.css`)
- ✅ **Komplette Entfernung aller `.pf-ui-modern` Styles** – Sauberer Neustart für zukünftiges Design-System
  - Entfernt aus: `workflow-header.css`, `workflow-sidebar.css`, `workflow-variables.css`, `pf-core.css`
  - Gelöscht: `workflow-info-modern.css`, `fast-track-content.css`
- ⏳ Noch zu tun: PHP-Struktur & Dokumenten-Konsolidierung (siehe CLEANUP-PLAN)

### Aktive Dateien identifiziert
- `functions.php` – Theme Hooks & Enqueues
- `single-workflows.php` – Workflow Template
- `assets/css/pf-core.css`, `assets/css/pf-workflows-main.css`
- `assets/js/pf-workflows.js`, `assets/js/modules/{tracking.js,fast-track.js}`
- `src/php/template-parts/workflow/*.php` – Header, Variables, Steps, Fast Track Toggle
- `src/php/inc/class-pf-user-tracking.php`, `src/php/inc/pf-access.php`
- Dokumentation: `docs/ARCHITECTURE.md`, `docs/HOW-IT-WORKS.md`, `docs/PROJECT-AUDIT.md`

### In Archiv verschoben
- Noch keine (siehe CLEANUP-PLAN für Kandidaten)


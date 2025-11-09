# Changelog

## [Aktuell] - 2025-11-09

### 🚀 UX Overhaul: Hero Value & Sticky Progress
- ✅ **Hero Value Section** – Above-the-fold Value Proposition für SEO-Traffic
  - Zeigt `expected_outcome`, `time_saved_min`, `difficulty_without_ai`, `pain_points`
  - Moderne Glassmorphism-Optik mit Accent-Gradients
  - Expandable Details für Pain Points
  - Conversion-optimiert nach AIDA-Modell
- ✅ **Compact Progress Bar** – Platzsparende Progress-Anzeige
  - Kombiniert Step-Progress + Input-Status in einer Zeile
  - Responsive Grid-Layout (Mobile: Stack, Desktop: Inline)
- ✅ **Sticky Progress Bar** – Kontexterhalt beim Scrollen
  - Erscheint nach 200px Scroll
  - Zeigt Workflow-Titel + Step + Progress + Inputs
  - Smooth Transitions mit RAF-Throttling
  - Backdrop-Filter für moderne Glassmorphism
- ✅ **Removed `.pf-ui-modern`** – Cleanup für saubere Codebase
- ✅ **Neue Dateien**:
  - PHP: `hero-value.php`, `progress-compact.php`
  - CSS: `workflow-hero.css`, `workflow-progress-compact.css`
  - JS: `sticky-progress.js`
- ✅ **Psychologie & Best Practices**:
  - F-Pattern Reading berücksichtigt
  - Jobs-to-be-Done Framework
  - Progressive Disclosure (expandable pain points)
  - Gamification (Progress-Visualisierung)

### CSS Token-Konsolidierung
- ✅ **Design Tokens konsolidiert** – `style.css` ist jetzt Single Source of Truth
  - Alle Tokens (Spacing, Colors, Shadows, Typography, etc.) zentral in `style.css` definiert
  - `pf-core.css`: Token-Duplikate entfernt, nur noch Komponenten + Legacy-Aliases
  - `base.css`: Token-Duplikate entfernt, nur noch Workflow-Layouts + Overrides
- ✅ **`base.css` korrekt enqueued** – Kritischer Fix für Workflow-Layout
  - `pf-workflows-base` wird jetzt in `functions.php` geladen (vor `pf-workflows`)
  - Betrifft: Frontend, Editor, Archives/Taxonomies
  - Ohne diese Datei funktionierten `.pf-workflow-container`, `.pf-status-cluster`, `.pf-workflow-layout` nicht!

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
- ✅ **Access-Level Chip implementiert** (Free/Sign-In/Pro) mit passenden Icons und Farbgebung
- ✅ **UX-Optimierung: Hierarchie Progress Hero vs. Variable Status** (Option A)
  - Variable Status: Sekundäres Design (subtile Farben, auto-hide bei 100%)
  - Progress Hero: Prominentes Design (Accent-Gradient, größere Schrift, immer sichtbar)
  - Micro-Celebration: Success-Message + Animation bei 100% Input-Completion
  - Status Cluster: Responsive Grid-Layout (Desktop: 1.4fr + 1fr, Mobile: Stack)
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


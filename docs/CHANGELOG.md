# Changelog

## [Aktuell] - 2025-11-11

### 🗑️ Cleanup: Sidebar Navigation entfernt
- ✅ **Sidebar gelöscht** – Keine redundante Navigation mehr
  - Sidebar-Template nicht mehr geladen in `single-workflows.php`
  - Grid-Layout entfernt aus `base.css` (→ Single-Column)
  - Full-width Content für bessere Lesbarkeit
- ✅ **Gründe**:
  - Compact Progress macht Sidebar überflüssig (zeigt Step & Progress)
  - "Overview" Link war broken (Section gelöscht)
  - Mehr Platz für Workflow-Content
  - Mobile-first Approach (konsistent über alle Devices)
  - Modern 2025 Best Practice (Notion, Linear, Coda Style)
- ℹ️ **Sidebar-Files bleiben** – Für mögliche zukünftige Nutzung

### 🎨 UX Overhaul: Prerequisites Section modernisiert
- ✅ **Spacing optimiert (Option A)**:
  - Top-Margin reduziert: 16-20px (vorher 24-32px)
  - Kompakterer Flow zwischen Hero und Prerequisites
  - Margins konsistent mit Hero Value (aligned)
- ✅ **Conditional Rendering**:
  - Section wird komplett ausgeblendet wenn `inputs_prerequisites` leer ist
  - Kein unnötiger Empty State mehr
  - Cleaner Page-Flow
- ✅ **Neues Design** – Konsistent mit Hero Value Section
  - Icon-basiert für schnelles Scannen
  - Checkmark-Icons für jeden Punkt
  - Clean Card-Design mit Accent-Border
  - Hover-Effekte für bessere Interaktivität
- ✅ **Eigenes CSS-File** – `workflow-prerequisites.css` (modular & wartbar)
- ✅ **Verbesserte Struktur**:
  - Automatisches Splitting von Zeilenumbrüchen zu List-Items
  - Empty State mit positiver Message
  - Header mit Icon
  - Accessibility-optimiert (ARIA, role)
- ✅ **Responsive Design** – Mobile-optimiert, Dark Mode Support
- ✅ **Wiederverwendbares Pattern** – Template für Steps Section
- ℹ️ **Alte Styles entfernt** – aus `workflow-sections.css` (deprecated)

### 🗑️ Cleanup: Overview Section komplett entfernt
- ✅ **Template gelöscht** – `section-overview.php` war vollständig redundant
- ✅ **CSS bereinigt** – Alle `.pf-overview-*` und `.pf-metric-inline` Styles entfernt (~300 Zeilen)
- ✅ **single-workflows.php** – Template-Part Aufruf entfernt
- ℹ️ **Grund** – 100% Redundanz mit Hero Value Section:
  - Summary → jetzt expandable in Hero Value
  - Expected Outcome → prominent in Hero Value
  - Pain Points → sichtbar als Chips in Hero Value
  - Time saved + Without AI → als Benefits in Hero Value
- ℹ️ **Fast Track Mode** – Bleibt unberührt, kann später frei konfiguriert werden

### 🧠 UX Psychology: Setup A - Conversion-optimierte Hero Value Hierarchie
- ✅ **Pain Points SICHTBAR** – Jetzt als Chips direkt unter Expected Outcome (nicht mehr collapsed!)
  - Max. 4 Pain Points für optimales Scanning (F-Pattern)
  - Chip-Design mit Checkmarks und Hover-Effekten
  - Label "Solves:" macht Kontext sofort klar
  - Psychologie: 70% kaufen wegen Pain Avoidance > Gain Seeking
- ✅ **Summary EXPANDABLE** – Jetzt als "About this workflow" Details-Element
  - Reduziert Clutter im Above-the-Fold Bereich
  - Bleibt im DOM für SEO (Crawlbar!)
  - Neues Info-Icon statt Question-Icon
- ✅ **Neue Hierarchie nach AIDA**:
  1. Expected Outcome (Desire)
  2. Pain Points visible (Emotional Trigger)
  3. Benefits (Rational Proof)
  4. Summary expandable (Optional Context)
- ✅ **Mobile-optimiert** – Pain Chips stacken vertikal, 100% Breite
- ℹ️ **Tagline wird emotional genutzt** (Text-Anpassung erfolgt in ACF)

## [2025-11-09]

### 🎯 SEO: Summary prominent im Hero Value integriert
- ✅ **Summary ganz oben** – Wichtiger SEO-Text jetzt prominent platziert
- ✅ **Neue Summary Box** – Subtil hervorgehoben mit Accent-Background
- ✅ **Hierarchie optimiert** – Summary → Expected Outcome → Benefits → Pain Points
- ✅ **Responsive Design** – Flüssige Schrift- und Abstandsgrößen
- ℹ️ **SEO-Vorteil** – Summary erscheint früh im DOM für besseres Crawling

### 🧹 Cleanup: Workflow Info Accordion entfernt
- ✅ **Template gelöscht** – `section-workflow-info-accordion.php` war redundant
- ✅ **JavaScript bereinigt** – Accordion-Code aus `fast-track.js` entfernt
- ✅ **single-workflows.php** – Template-Part Aufruf entfernt
- ℹ️ **Grund** – Duplikat zur neuen Hero Value Section (zeigt bereits Overview, Pain Points, Expected Outcome)

### 🎨 Visual Flow: Unified Card Design (Breadcrumbs + Header + Hero + Progress)
- ✅ **Einheitlicher Gradient** – Breadcrumbs, Header, Hero und Progress teilen denselben Accent-Gradient Background
- ✅ **Eine zusammenhängende Card** – Alle vier Bereiche wirken als eine Einheit
- ✅ **Breadcrumbs**: Top-Radius, Gradient-Background, oberster Teil der Card
- ✅ **Header**: Transparent Background, keine eigene Border, subtile Top-Trennung
- ✅ **Hero Value**: Transparent Background, keine eigene Border, subtile Top-Trennung
- ✅ **Compact Progress**: Bottom-Radius, integriert in die Card, nicht separat
- ✅ **Gemeinsamer Shadow** – Einheitlicher Schatten für die gesamte Card
- ✅ **Moderne UX** – Unified Card Pattern wie bei Notion, Linear, Stripe
- ✅ **Kein visueller Bruch** – Nahtloser Flow von ganz oben bis ganz unten

### 🧹 Cleanup: Redundante Komponenten entfernt
- ✅ **Progress Hero entfernt** – War redundant, ersetzt durch Compact Progress
- ✅ **Variable Status entfernt** – Input-Status jetzt in Compact Progress integriert
- ✅ **Status Cluster vereinfacht** – Nur noch Fast Track Toggle, kein Grid mehr nötig
- ✅ **CSS als deprecated markiert** – Alte Styles bleiben für Backward Compatibility
  - `.pf-progress-hero` → `display: none !important`
  - `.pf-variable-status` → `display: none !important`
  - `.pf-status-cluster` → Removed

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


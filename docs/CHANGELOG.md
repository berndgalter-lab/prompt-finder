# Changelog

## [Aktuell] - 2025-11-12

### 🎨 UX Overhaul: Workflow Steps Modernization ⭐

#### ✅ **Phase 1: Quick Wins** (Information Overload reduziert)
- ❌ **Progress Counter entfernt** – Redundant mit Master Progress Bar
- ❌ **Type Badge entfernt** ("Prompt"/"Guide"/"Review") – User sieht es im Content
- ❌ **"Uses Vars" Icon entfernt** – Technische Detail, nicht User-relevant
- ❌ **"Consumes Output" Icon entfernt** – Technische Detail, nicht User-relevant
- ✅ **Time Badge behalten** – Einzige wirklich relevante Meta-Info für User
- 🎯 **Ergebnis**: Von 6+ Badges auf 1 reduziert
- 💡 **Begründung**: User braucht nur: Nummer, Titel, Zeit, Status
- 🎨 **Design-Prinzip**: "Weniger ist mehr" – Konsistent mit Variables Section

#### ✅ **Phase 2: Checkmark Consistency** (Visuell konsistent mit Variables)
- ✅ **Großes Checkmark Icon links** – 28px SVG, prominent wie Variables Section
  - ○ Empty Circle = Not completed
  - ✓ Filled Checkmark = Completed
  - Clickable für direktes Toggling
- ✅ **Border-Color Status** – Konsistent mit Variables Section
  - 2px Gray = Neutral/Not started
  - 3px Blue = Active (current step)
  - 4px Green = Completed
- ❌ **Kleines Checkbox rechts entfernt** – Ersetzt durch großes Icon links
- 🎯 **Ergebnis**: Steps sehen aus wie Variables (konsistentes Pattern)
- 💡 **Begründung**: User erkennt Pattern wieder, muss nicht neu lernen
- 🎨 **Design-Prinzip**: Consistency across components
- 🛠️ **JavaScript**: `updateStepCheckmarkIcon()` mit Click-Handler
- 📦 **CSS**: ~60 Zeilen für Icon + Border States

#### ✅ **Phase 3: Content Hierarchy** (Klare Struktur)
- ✅ **Section Labels** – "Your Prompt", "Step Inputs" mit Icons
  - 📝 Edit Icon für Step Inputs
  - 💬 Chat Icon für Your Prompt
  - 📚 Book Icon für Example Output
- ✅ **Visual Dividers** – Subtile Border-Top zwischen Sections
  - Klare Trennung ohne visuellen Overload
  - Erste Section ohne Border (seamless Start)
- ✅ **Collapsible Content** – Paste Guidance + Example Output collapsed by default
  - `<details>` Elements für native Accessibility
  - Hover-Effekte für besseres Feedback
  - SVG Icons mit Rotate-Animation
- 🎯 **Ergebnis**: User versteht sofort "Was ist Primary?" vs. "Was ist Optional?"
- 💡 **Begründung**: Progressive Disclosure = weniger Overwhelm
- 🎨 **Design-Prinzip**: Hierarchie durch Spacing + Labels + Collapse-State
- 📦 **CSS**: ~80 Zeilen für Sections, Labels, Collapsibles

#### ✅ **Phase 4: Polish** (Final touches)
- ✅ **Animations** – Smooth, delightful interactions
  - fadeIn Animation für Sections (0.4s)
  - checkmarkPop bei Completion (Micro-Celebration!)
  - Smooth border transitions (0.3s)
  - Hover micro-interaction (translateY)
- ✅ **Mobile Optimization** – Touch-friendly, responsive
  - Reduced padding auf schmalen Screens
  - Larger touch targets (32px auf Mobile)
  - Stack Time Badge vertikal
  - Extra compact auf <480px
- ✅ **Accessibility** – WCAG 2.1 AA konform
  - ARIA labels auf Checkmark Icon (role="img")
  - ARIA labels auf Collapsibles (aria-label)
  - Region roles für expandable Content
  - Keyboard-navigable (tabindex)
  - `prefers-reduced-motion` Support
- 🎯 **Ergebnis**: Smooth, accessible, mobile-ready
- 💡 **Begründung**: Polish = Professioneller Eindruck
- 🎨 **Design-Prinzip**: Delight without distraction
- 📦 **CSS**: ~100 Zeilen für Animations + Media Queries

### 📊 **Zusammenfassung: Steps Modernization**
- **Reduziert**: Von 10+ visuellen Elementen auf 4 essentials
- **Konsistent**: Variables = Steps (gleiches Pattern)
- **Hierarchie**: Primary vs. Secondary Content klar
- **Modern**: 2025 SaaS Best Practices
- **Total**: ~300 Zeilen CSS, ~50 Zeilen JS, ~100 Zeilen PHP
- **Inspiration**: Linear, Notion, Airtable, Stripe

### 🧹 UX Cleanup: Source Badges entfernt
- ✅ **"✓ From Workflow" Badges entfernt** – Redundante Information für User
- ✅ **"⧗ Unresolved" Badges entfernt** – Status ist durch Border-Color sichtbar
- ✅ **Cleaner UI** – Weniger visueller Noise, besserer Focus
- ✅ **Best Practice** – Konsistent mit modernen SaaS Apps (Notion, Linear, Airtable)
- 🎯 **Warum**: User interessiert sich für den Wert, nicht die Quelle
  - Input-Wert ist sichtbar → Badge redundant
  - Status durch visuelle Feedback (Border-Color, Checkmark)
  - Keine technischen Details im UI nötig
- 🗑️ **Code entfernt**:
  - `updateVariableSourceIndicator()` Funktion
  - `ensureStaticBadge()` Funktion
  - `.pf-var-source-badge` CSS (~30 Zeilen)
- ℹ️ **Exceptions**: Source-Badges nur noch für Admin/Debug-Views sinnvoll

### 🎯 Feature: Master Progress Bar (Option C - Hybrid) ⭐⭐⭐
- ✅ **Master Progress Bar** erstellt (Sticky, Overall Completion)
  - Zeigt Gesamtfortschritt: "3 of 4 completed (75%)"
  - Smooth animated Progress Bar mit Shimmer-Effekt
  - Section Status Pills mit Icons (○ pending, ⚠️ partial, ✓ complete)
  - Sticky positioning (bleibt beim Scrollen sichtbar)
  - Glassmorphism (backdrop-filter: blur)
- ✅ **PHP Template**: `master-progress.php` (140 Zeilen)
  - Zählt WF + Step Variables
  - Rendert Status Pills pro Section
  - JSON Data für JavaScript
- ✅ **CSS**: `workflow-master-progress.css` (401 Zeilen)
  - Visuell konsistent mit Hero/Prerequisites
  - Responsive (Desktop, Tablet, Mobile)
  - Dark Mode Support
  - Accessibility (Focus, Reduced Motion, ARIA)
- ✅ **JavaScript**: 3 neue Funktionen (160 Zeilen)
  - `updateMasterProgress()`: Master calculation
  - `updateSectionStatusIcons()`: Status per section
  - `setStatusIcon()`: Icon rendering
- ✅ **Integration**: Automatische Updates bei jedem Input Change
- ✅ **Section Counter**: `data-variables-scope="workflow"` für Klarheit
- ✅ **Code Cleanup**: Debug Console Logs entfernt (Production Ready)
- 🐛 **Bugfix**: Section Counter zählte fälschlicherweise alle Variablen (WF + Steps), jetzt nur noch Variablen innerhalb des eigenen Containers (scoped mit `.closest()`)
- 🎮 **Gamification**: Overall Progress motiviert zum Weitermachen
- 💎 **Modern SaaS Pattern**: Wie Linear, Notion, Airtable
- ℹ️ **Total**: ~700 Zeilen Code (PHP + CSS + JS)

## [Aktuell] - 2025-11-11

### 🎨 UX Overhaul: Variables Section (Checklist-Style) ⭐
- ✅ **Komplett neu designed** – Konsistent mit Prerequisites/Hero Style
  - Checklist-Style mit Checkmarks (✓ filled, ○ empty)
  - Color-coded borders für Status-Feedback:
    - 🔴 Red (4px) = Required & Empty (Urgent!)
    - 🟢 Green (4px) = Required & Filled (Done!)
    - 🔵 Blue (3px) = Optional & Filled (Bonus!)
    - ⚫ Gray (2px) = Optional & Empty (Nice-to-have)
  - Badges: "REQUIRED" (red) / "optional" (gray)
  - Hint text mit 💡 Icon
  - Auto-updating checkmarks on input
- ✅ **Eigenes CSS-File** – `workflow-variables-modern.css`
- ✅ **JavaScript Enhanced**:
  - Auto-update Status beim Eintippen
  - Auto-update Counter (X of Y completed)
  - Live checkmark animation
  - Visual feedback ohne Page Reload
- ✅ **Modern SaaS Design** – Wie Notion, Airtable, Linear
- ✅ **Responsive & Accessible** – Mobile-optimiert, ARIA labels
- 🐛 **Bugfixes**:
  - Erzwungenes Column-Layout (`!important`) für vertikale Liste (1-8 Variablen)
  - Redundanter Progress-Text versteckt (nur numeric Counter: "2 / 5")
  - Grid-Konflikt mit alter `workflow-variables.css` behoben
- 🐛 **Critical Bugfixes (v2.5 - BREAKING BUG FIX)**:
  - ✅ **CRITICAL**: `validation is not defined` Error behoben
  - ✅ **ROOT CAUSE**: Beim Refactoring `validation` Element entfernt, aber `applyState()` nutzte es noch
  - ✅ **IMPACT**: Variables wurden gar nicht gerendert (JavaScript Crash)
  - ✅ **FIX**: Alle `validation.*` Referenzen aus `applyState()` entfernt
  - ℹ️ **Why it failed**: JS Error stoppt komplettes Rendering → keine Variables, kein Status-Update
- 🧹 **Cleanup: 404 Errors behoben**:
  - ✅ **Removed**: `workflow-info-modern.css` aus `functions.php` (File existiert nicht mehr)
  - ✅ **Removed**: `fast-track-content.css` aus `functions.php` (File existiert nicht mehr)
  - ✅ **Reason**: Diese Files wurden während Refactoring gelöscht/konsolidiert
  - ✅ **Impact**: Keine 404 Errors mehr, schnelleres Page Load
- 🐛 **Critical Bugfixes (v2.4 - Final)**:
  - ✅ **Status Colors Fix**: `updateVarStatus()` wird jetzt **initial** aufgerufen (setTimeout nach Render)
  - ✅ **CSS Specificity Fix**: `!important` auf alle `data-status` Border/Background Colors
  - ✅ **Browser Consistency**: Farben ändern sich jetzt korrekt (rot → grün) in allen Browsern
  - ✅ **Initial State**: Checkmark + Border-Color sind ab dem ersten Render korrekt
  - ℹ️ **Problem**: `data-status` wurde gesetzt, aber CSS hatte nicht genug Spezifität
- 🐛 **Critical Bugfixes (v2.3)**:
  - ✅ **ROOT CAUSE GEFUNDEN**: `renderWorkflowForm()` fügte alte Utility-Klassen hinzu!
  - ✅ **Doppelrahmen Fix**: `classList.remove('pf-card', 'pf-stack', 'pf-grid-2')` in `renderWorkflowForm()` und `renderStepForm()`
  - ✅ **Optionale Variablen Fix**: Alle Variablen werden jetzt gerendert (vorher: nur wenn im Map)
  - ✅ **Counter Fix**: `updateVariablesCounter()` wird jetzt nach jedem Change aufgerufen
  - ✅ **Inkonsistente Farben**: Alte Utility-Klassen überschrieben moderne Styles (rot vs grün)
  - ✅ **Kompakteres Design**: Reduziertes Padding (var(--pf-space-3)), kleinere Gaps
  - ℹ️ **Lessons Learned**: Utility-Klassen wurden dynamisch im JS hinzugefügt, nicht im PHP!
- 🎯 **UX/UI Best Practice Update (v2.1)**:
  - **Badge-Hierarchie optimiert**:
    - "REQUIRED" = Prominent, red, uppercase, bold, shadow
    - "optional" = Subtle, gray, lowercase, transparent, 60% opacity
  - **Saubere Struktur** (Best Practice Reihenfolge):
    1. Label Row: Label (links) + Badge (rechts aligned)
    2. Input Field: Placeholder IM Input (nicht daneben!)
    3. Hint: Unter Input mit Icon (💡 Lightbulb SVG)
    4. Meta Info: Default Value mit Icon (↻ nur wenn leer)
    5. Error: ARIA live region (hidden by default)
  - **Redundanzen entfernt**:
    - ❌ Asterisk `*` bei Label (Badge reicht)
    - ❌ "From Workflow" Status (verwirrt User)
    - ❌ Checkmark rechts vom Input (gehört zu Icon-Spalte)
  - **Smart Features**:
    - Meta-Section versteckt sich automatisch wenn User eingibt
    - Default Value nur sichtbar wenn Input leer
    - Hint mit professionellem Lightbulb-Icon (nicht Emoji)
  - **Inspiration**: Linear, Stripe, Notion, GitHub, Airtable
- ℹ️ **Total Lines Changed**: ~150 (JS + CSS)

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
- ✅ **Breiten-Fix**:
  - `.pf-workflow-main` Padding entfernt (war 2rem)
  - Prerequisites jetzt gleich breit wie Hero Value
  - Konsistente Content-Breite über alle Sections
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


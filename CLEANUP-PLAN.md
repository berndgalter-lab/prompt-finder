# Aufräum-Plan

## Sofort machbar (ohne Code zu brechen)

### Ordner vorbereiten
- [x] Erstelle `/src/styles/core`, `/src/styles/workflows/{modern,legacy}`, `/src/styles/pages`
- [x] Erstelle `/src/scripts/{workflows,pages}` und `/src/scripts/workflows/{modules,entry}`
- [x] Erstelle `/archive/{styles,scripts,docs}`

### Dateien verschieben
- [x] Verschiebe `assets/css/pf-core.css` → `/src/styles/core/pf-core.css`
- [x] Verschiebe `assets/css/pf-workflows-main.css` → `/src/styles/workflows/base.css`
- [x] Verschiebe `assets/css/components/workflow-*-modern.css`, `fast-track-*.css` → `/src/styles/workflows/modern/`
- [x] Verschiebe `assets/css/components/workflow-*.css` (legacy) → `/src/styles/workflows/legacy/`
- [x] Verschiebe `assets/css/pf-workflows.css` → `/src/styles/workflows/legacy/`
- [x] Verschiebe `assets/css/pf-landing.css`, `pf-pricing.css`, `pf-blog.css` → `/src/styles/pages/`
- [x] Verschiebe `assets/js/pf-workflows.js` → `/src/scripts/workflows/pf-workflows.js`
- [x] Verschiebe `assets/js/modules/{tracking.js,fast-track.js}` → `/src/scripts/workflows/modules/`
- [x] Verschiebe `assets/js/pf-tracking-init.js` → `/src/scripts/workflows/entry/pf-tracking-init.js`
- [x] Verschiebe `assets/js/pf-pricing.js` → `/src/scripts/pages/pricing.js`
- [x] Verschiebe `assets/dev/*.md` → `/docs/dev-notes/`
- [x] Verschiebe `template-parts/workflow/*.php` → `/src/php/template-parts/workflow/`

### Dateien umbenennen / Referenzen
- [x] Aktualisiere Enqueue-Pfade in `functions.php` gemäß neuer Struktur
- [x] Passe `require`/`include` in PHP an (inc/app → src/php/…)

### Archive
- [x] Verschiebe `assets/css/pf-components.css` → `/archive/styles/`
- [x] Verschiebe `assets/js/{pf-analytics.js,pf-core.js,pf-learn-use-mode.js,pf-workflow-navigation.js}` → `/archive/scripts/`
- [x] Verschiebe `docs/archive/*.md` → `/archive/docs/`
- [x] Entferne `.DS_Store`

## Vorsichtig angehen (könnte Code brechen)

- [ ] Konsolidierung der Workflow-CSS: Legacy (`workflow-*.css`) mit Modern Layer zusammenführen, doppelte Selektoren entfernen
- [ ] Überprüfung, ob `pf-workflows.css` noch benötigt wird (Archive/Taxonomie styling) → ggf. konsolidieren
- [ ] Refaktor `pf-workflows.js` in Module (ESM oder strukturierte Namespaces)
- [ ] Entferne doppelte ACF-Dokumentation (`FIELD_NAMES_AUDIT` etc.)
- [ ] Überführe `app/bootstrap/pf-variables-localize.php` in Klassenstruktur (Dependency Injection)

## Dokumentation aufräumen

- [x] Konsolidiere Deployment-Dokumente (`docs/deployment/*.md`) zu einer aktuellen Anleitung
- [ ] Entscheide über Historien-Dateien in `docs/archive/` (behalten oder archivieren)
- [ ] Prüfe `assets/dev/FAST-TRACK-MODE-SPEC-v1.md` und `pf-ui-modern-plan.md` → Inhalte in `ARCHITECTURE.md` / `HOW-IT-WORKS.md` integrieren
- [ ] Aktualisiere `docs/README.md` nach Strukturmigration
- [ ] Pflegen eines zentralen `CHANGELOG.md`


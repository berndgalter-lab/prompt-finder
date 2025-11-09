# PF UI Modernization Plan

**Date:** November 8, 2025  
**Owner:** GPT-5 Codex (Cursor)  
**Status:** Draft – v0.1

---

## 1. Objectives
- Bring the workflow experience to a "modern SaaS" quality bar
- Maintain full accessibility, responsiveness, and performance
- Avoid regressions by scoping styles behind a dedicated namespace (`.pf-ui-modern`)
- Keep legacy markup and logic untouched wherever possible

---

## 2. Design Pillars
- **Clarity:** strong hierarchy, generous spacing, consistent typography
- **Confidence:** subtle gradients, depth via shadows, polished controls
- **Momentum:** micro-interactions and progress cues that encourage completion
- **Accessibility:** WCAG AA contrast, keyboard support, reduced-motion fallbacks

---

## 3. Architecture
1. Apply `.pf-ui-modern` to the root workflow container (`.pf-workflow-container`)
2. All new rules live under `.pf-ui-modern { ... }`
3. Layer structure:
   - Tokens → Layout → Components → States → Utilities
4. Components to modernize (in order):
   1. Header & status bar
   2. Sidebar navigation
   3. Workflow info (overview + prerequisites)
   4. Variable card
   5. Step list & prompt cards
   6. Footer / meta elements

---

## 4. Token Additions (pf-core.css)
- **Color scale:** slate (50-900), brand gradients (indigo/purple, blue, green, amber)
- **Spacing:** 4/8/12/16/20/24/32/40 px ramp
- **Radius:** 8, 12, 16, 20, 24 px
- **Shadows:** soft (`sm`), lifted (`md`), floating (`lg`), glow (`xl`)
- **Transitions:** `fast (120ms)`, `base (180ms)`, `slow (240ms)`

Tokens must reuse existing names where possible; new names follow `--pf-` prefix.

---

## 5. Implementation Roadmap
1. **Token update** – extend `:root` in `pf-core.css`
2. **Namespace scaffold** – append `.pf-ui-modern` base styles (typography, spacing)
3. **Header module** – integriere `.pf-ui-modern` Varianten direkt in `workflow-header.css`
4. **Sidebar module** – `.pf-ui-modern` Varianten in `workflow-sidebar.css`, Legacy & Modern zusammenführen
5. **Info module** – `workflow-info-modern.css`
6. **Variables module** – integriert in bestehendes `workflow-variables.css` (inkl. Fast-Track Toggle)
7. **Steps module** – in `workflow-steps.css` (modern layer integriert)
8. **Animations** – optional `pf-animations-modern.css` (namespaced, reduced motion aware)
9. **Template opt-in** – add `.pf-ui-modern` class in PHP templates after CSS ready
10. **QA** – cross-browser, responsive, accessibility regression check

Each stage delivered with screenshots or screencasts before advancing.

---

## 6. Acceptance Checklist
- [ ] No unmanaged global overrides (all under `.pf-ui-modern`)
- [ ] Works on 320px – 1440px (Chrome, Safari, Firefox, Edge)
- [ ] Keyboard navigation & focus states verified
- [ ] `?pfdebug=1` shows expected enqueues (original handles + new `*-modern` handles)
- [ ] Lighthouse Performance ≥ 90, Accessibility ≥ 95
- [ ] Reduced motion preference disables animations

---

## 7. Next Step
> Extend the token palette in `pf-core.css` and scaffold `.pf-ui-modern` base styles.

# Fast Track Mode — Specification v1.0
**Prompt Finder Project**  
**Date:** November 8, 2025  
**Status:** Design Complete – Ready for Implementation

---

## Executive Summary

Fast Track Mode is a progressive UX enhancement for power users that minimizes "training wheel" content (Overview, Prerequisites, Objectives, Examples) while maintaining full SEO visibility and freemium conversion opportunities.

**Key Principles:**
- **SEO-First:** All content remains in DOM for crawlers
- **Freemium-Aware:** Paywalls appear even in Fast Track Mode
- **Progressive:** Unlocked based on usage (hybrid trigger)
- **Reversible:** Users can toggle back to full mode
- **Mobile-Parity:** Same logic applies on mobile devices

---

## 1. User Types & Priorities

| Priority | User Type | Needs | Fast Track? |
|----------|-----------|-------|-------------|
| 1 | **Pro User** | Maximum efficiency, skip explanations | Yes |
| 2 | **First-Time Visitor** | Context, guidance, trust signals | No |
| 3 | **Free User** | Balance efficiency with conversion prompts | After trigger |
| 4 | **Power User** (Anon) | Speed, familiarity-based shortcuts | After trigger |
| 5 | **Returning Anon** | Gradually less guidance | After trigger |

---

## 2. Content Visibility Strategy

### Default Mode (New Users)
**Section Order:**
1. Header (Title, Tagline, Meta-chips)
2. Overview (with Summary)
3. Prerequisites
4. Variables (Workflow-level)
5. Steps (with Objectives & Example Output visible)

**Characteristics:**
- All educational content visible
- Step Objectives: Full multi-line text
- Example Output: Fully visible
- Steps: Collapsed by default (accordion)

### Fast Track Mode (Experienced Users)
**Section Order:**
1. Header (same)
2. **Workflow Info** (Collapsible accordion containing Overview + Prerequisites)
3. Variables (same)
4. Steps (streamlined)

**Characteristics:**
- Overview + Prerequisites combined into single collapsible "Workflow Info"
- Step Objectives: Minimized to 1 line (expandable via "Read more")
- Example Output: Hidden
- Steps: **ALL expanded** (no accordion)
- No Summary section moved/duplicated

---

## 3. Freemium & Paywall Logic

### Access Modes (Existing ACF)
- `access_mode`: `free` | `signin` | `pro`
- `free_step_limit`: Number (e.g., 2) — controls how many steps are freely accessible

### Paywall Behavior
**Mode: `free`**
- First N steps (defined by `free_step_limit`) are fully visible
- Remaining steps show:
  - **First line of objective** (teaser)
  - **CTA:** "Continue with free account"
  - **Action:** Trigger signup modal/redirect

**Mode: `signin`**
- Logged-out users see teaser + CTA: "Continue with free account"
- Logged-in free users see full content

**Mode: `pro`**
- Free users see teaser + CTA: "Unlock with Pro"
- Pro users see full content

### Fast Track & Paywall Interaction
- Paywalls appear **identically** in both Default and Fast Track Mode
- Teaser line is always shown (first line of objective)
- Fast Track only affects **free/accessible** content presentation

---

## 4. Fast Track Trigger Logic

### Hybrid Trigger (Option D: Auto after X visits)
**Rule:**
```
IF (user visited THIS workflow ≥ 2 times)
   OR (user visited ANY workflow ≥ 5 times)
THEN
   Offer Fast Track Mode
```

**Implementation:**
- Track visits via LocalStorage (anonymous) or User-Meta (logged-in)
- Increment counter on workflow page load
- Check threshold on each page load
- Persist preference once enabled

### Tracking Data Structure

**LocalStorage (Anonymous):**
```json
{
  "pf_workflow_visits": {
    "workflow_123": 2,
    "workflow_456": 1,
    "workflow_789": 3
  },
  "pf_fast_track_enabled": true,
  "pf_fast_track_preference": "auto" // or "manual"
}
```

**User-Meta (Logged-In):**
```php
// Meta keys
'pf_workflow_visits' => array( 'workflow_123' => 2, ... )
'pf_fast_track_enabled' => true
'pf_fast_track_preference' => 'auto'
```

### DSGVO Compliance
- **No consent required:** Tracking is purely functional (UX optimization)
- **No personal data:** Only workflow IDs + counts
- **User control:** Manual toggle always available
- **Data portability:** Logged-in users can export/delete via WordPress privacy tools

---

## 5. UI Components

### A) Fast Track Toggle
**Position:** Above Variables Section (Option B)  
**Visual:** Toggle switch with label  
**Label:** "Fast Track Mode" + info icon (tooltip: "Hide beginner guidance")

**States:**
- **Hidden:** Before trigger threshold reached
- **Visible (Off):** After trigger, user has not enabled
- **Visible (On):** User has enabled Fast Track Mode

**Mobile:** Same position and logic as desktop

---

### B) Workflow Info Accordion (Fast Track Only)
**Label:** "Workflow Info"  
**Icon:** Chevron (right = collapsed, down = expanded)  
**Contains:** Overview + Prerequisites  
**Default State:** Collapsed

**Markup Example:**
```html
<div class="pf-workflow-info-accordion">
  <button class="pf-accordion-toggle" aria-expanded="false">
    <svg class="pf-chevron">...</svg>
    <span>Workflow Info</span>
  </button>
  <div class="pf-accordion-content" hidden>
    <!-- Overview content -->
    <!-- Prerequisites content -->
  </div>
</div>
```

---

### C) Minimized Step Objectives (Fast Track Only)
**Default:** Show first line only  
**Expandable:** "Read more" link  
**Behavior:** Toggle between 1-line and full text

**Markup Example:**
```html
<div class="pf-step-objective">
  <p class="pf-objective-text is-minimized">
    First line of objective text...
  </p>
  <button class="pf-objective-expand" aria-expanded="false">
    Read more
  </button>
</div>
```

---

### D) Variable Status Bar (Current Design)
**Type:** Single-tier display  
**Content:** "X of Y inputs filled"  
**Icon:** Checkmark (green when complete)  
**Info Button:** Tooltip explaining what counts as input

**No changes needed** — current implementation already supports both workflow + step variables.

---

## 6. ACF Field Additions

### New Fields Required

#### A) Workflow Level
**Field Group:** `pf_workflow_settings`

```php
// 1. Fast Track Trigger Threshold
[
  'key' => 'field_ft_trigger_this_workflow',
  'name' => 'ft_trigger_this_workflow',
  'label' => 'Fast Track: Visits (This Workflow)',
  'type' => 'number',
  'default_value' => 2,
  'min' => 1,
  'instructions' => 'Number of visits to THIS workflow before offering Fast Track Mode'
]

[
  'key' => 'field_ft_trigger_any_workflow',
  'name' => 'ft_trigger_any_workflow',
  'label' => 'Fast Track: Visits (Any Workflow)',
  'type' => 'number',
  'default_value' => 5,
  'min' => 1,
  'instructions' => 'Number of total workflow visits before offering Fast Track Mode'
]

// 2. Existing field to keep
// access_mode: 'free' | 'signin' | 'pro'
// free_step_limit: number (already exists)
```

#### B) Global Settings (Optional)
**Field Group:** `pf_global_settings` (theme options page)

```php
// Defaults for all workflows
[
  'key' => 'field_ft_default_trigger_this',
  'name' => 'ft_default_trigger_this',
  'label' => 'Default: Fast Track Trigger (This)',
  'type' => 'number',
  'default_value' => 2
]

[
  'key' => 'field_ft_default_trigger_any',
  'name' => 'ft_default_trigger_any',
  'label' => 'Default: Fast Track Trigger (Any)',
  'type' => 'number',
  'default_value' => 5
]
```

---

## 7. Technical Implementation Roadmap

### Phase 1: Tracking Foundation
**Files:**
- `assets/js/modules/tracking.js` (new)
- `inc/class-pf-user-tracking.php` (new)

**Tasks:**
1. Create `PF_Tracking` JS module
   - LocalStorage read/write for anon users
   - REST API calls for logged-in users
2. Create `PF_User_Tracking` PHP class
   - User-meta CRUD methods
   - REST endpoint: `POST /pf/v1/track-visit`
3. Hook into workflow page load to increment counters
4. Add threshold check function

**Acceptance:**
- Visit counter increments on each page load
- Data persists across sessions (LS for anon, user-meta for logged-in)
- Threshold check returns boolean

---

### Phase 2: Fast Track Toggle UI
**Files:**
- `template-parts/workflow/section-fast-track-toggle.php` (new)
- `assets/css/components/fast-track-toggle.css` (new)
- `assets/js/modules/fast-track.js` (new)

**Tasks:**
1. Create toggle component (above Variables section)
2. Show/hide based on threshold check
3. Toggle stores preference (LS + user-meta)
4. On toggle, reload page or apply class to body (`pf-fast-track-active`)

**Acceptance:**
- Toggle appears after threshold met
- Preference persists across sessions
- Body class applied when active

---

### Phase 3: Content Adaptation (Fast Track Mode)
**Files:**
- `template-parts/workflow/section-overview.php` (modify)
- `template-parts/workflow/section-prerequisites.php` (modify)
- `assets/css/components/workflow-sections.css` (modify)
- `assets/js/modules/fast-track.js` (expand)

**Tasks:**
1. Wrap Overview + Prerequisites in accordion component
   - Only visible when `pf-fast-track-active` is set
   - Default collapsed
2. Minimize Step Objectives to 1 line
   - Add "Read more" toggle
3. Hide Example Output in Fast Track Mode
4. Expand all steps (remove accordion collapse)

**Markup Strategy:**
- Keep all content in DOM (SEO)
- Use CSS classes to hide/minimize:
  - `.pf-fast-track-active .pf-overview-full { display: none; }`
  - `.pf-fast-track-active .pf-workflow-info-accordion { display: block; }`
  - `.pf-fast-track-active .pf-step-objective { -webkit-line-clamp: 1; }`
  - `.pf-fast-track-active .pf-example-output { display: none; }`
  - `.pf-fast-track-active .pf-step { /* force expanded */ }`

**Acceptance:**
- Default mode: all content visible as before
- Fast Track mode: Overview + Prerequisites in collapsed accordion, objectives minimized, examples hidden, steps expanded
- SEO: all content still in DOM

---

### Phase 4: Paywall Integration (No Changes Needed)
**Files:**
- Existing paywall logic (already implemented)

**Tasks:**
- Verify paywalls appear identically in both modes
- Test with `access_mode=free`, `signin`, `pro`
- Confirm teaser line + CTA display correctly

**Acceptance:**
- Paywalls unchanged by Fast Track Mode
- Free step limit respected in both modes

---

### Phase 5: Mobile Optimization
**Files:**
- Same CSS/JS as desktop

**Tasks:**
- Ensure toggle is mobile-friendly (touch target ≥ 44px)
- Test accordion on mobile (easy to tap)
- Verify minimized objectives readable on small screens

**Acceptance:**
- Fast Track Mode works identically on mobile
- No layout breaks
- Touch interactions smooth

---

## 8. User Flows

### Flow A: First-Time Visitor (Default Mode)
```
1. Land on workflow page
2. See full Header → Overview → Prerequisites → Variables → Steps
3. Steps are collapsed (accordion)
4. Read Overview/Prerequisites to understand context
5. Fill in Variables
6. Expand each step as needed
7. Complete workflow

Tracking: Visit count = 1 (stored in LS)
```

---

### Flow B: Returning User (Threshold Met)
```
1. Land on workflow page (3rd visit to any workflow)
2. See banner/toggle: "Enable Fast Track Mode?"
3. User clicks toggle → ON
4. Page updates/reloads:
   - Overview + Prerequisites collapse into "Workflow Info" accordion
   - Step Objectives minimized to 1 line
   - Example Outputs hidden
   - All steps expanded
5. User completes workflow faster

Tracking: Preference saved (LS + user-meta if logged in)
```

---

### Flow C: Pro User (Fast Track + Full Access)
```
1. Land on workflow page (already has Fast Track enabled)
2. See streamlined view (Workflow Info collapsed, minimal text)
3. All steps expanded and accessible
4. Complete workflow in <60 seconds

Tracking: All interactions logged for analytics
```

---

### Flow D: Free User (Fast Track + Paywall)
```
1. Land on workflow page (Fast Track enabled)
2. See Workflow Info collapsed
3. Steps 1-2 expanded and accessible (free_step_limit=2)
4. Step 3 shows:
   - First line of objective (teaser)
   - "Continue with free account" CTA
5. User clicks CTA → signup modal
6. After signup: All steps unlocked

Tracking: Conversion event logged
```

---

## 9. Testing Checklist

### Functional Tests
- [ ] Visit counter increments correctly (anon + logged-in)
- [ ] Threshold check triggers toggle visibility
- [ ] Toggle switches between Default ↔ Fast Track Mode
- [ ] Preference persists across sessions
- [ ] Accordion (Workflow Info) works (collapse/expand)
- [ ] Step Objectives minimize/expand correctly
- [ ] Example Outputs hidden in Fast Track Mode
- [ ] All steps expand in Fast Track Mode
- [ ] Paywalls appear correctly in both modes
- [ ] Free step limit respected

### UX Tests
- [ ] New user sees full guidance (Default Mode)
- [ ] Returning user sees toggle after threshold
- [ ] Pro user completes workflow in <60s (Fast Track Mode)
- [ ] Mobile: Toggle and accordion work smoothly
- [ ] Tooltips/hints explain features clearly

### SEO Tests
- [ ] All content in DOM regardless of mode
- [ ] `display:none` used (not `visibility:hidden` or removal)
- [ ] Crawlers see full text (test with Google Search Console)

### Performance Tests
- [ ] No layout shift when toggling modes
- [ ] LocalStorage operations <10ms
- [ ] REST API calls <200ms (tracking)

---

## 10. Content & Copy

### Toggle Label
**English:** "Fast Track Mode"  
**Tooltip:** "Hide beginner guidance and show all steps at once"

### Workflow Info Accordion
**Label:** "Workflow Info"  
**Tooltip:** "Overview and prerequisites (click to expand)"

### Step Objective Expand
**Label:** "Read more" / "Show less"

### Paywall CTAs
**Free Mode:** "Continue with free account"  
**Signin Mode:** "Continue with free account"  
**Pro Mode:** "Unlock with Pro"

### Info Tooltips
**Variable Status:** "This shows all required and optional inputs you can fill in this workflow, including settings that apply to all steps and inputs for individual steps."

**Fast Track Toggle:** "Fast Track Mode minimizes explanatory text and expands all steps for experienced users. You can toggle this anytime."

---

## 11. Future Enhancements (Out of Scope v1)

### Phase 2 Ideas
- **Analytics Dashboard:** Show users their workflow completion stats
- **Smart Defaults:** Pre-fill variables based on past usage
- **Keyboard Shortcuts:** Power-user accelerators (e.g., `Cmd+Enter` to submit)
- **Custom Profiles:** Save multiple variable presets per workflow
- **Collaboration:** Share filled-out workflows with team members

### Internationalization
- All copy strings moved to translatable functions (`__()`, `_e()`)
- Create `.pot` file for translation
- Support for RTL languages

---

## 12. Open Questions / Decisions Needed

- [ ] **Analytics Integration:** Track Fast Track Mode usage? (GA4 event?)
- [ ] **A/B Testing:** Test different trigger thresholds (2 vs 3 visits)?
- [ ] **Onboarding:** Add first-time tooltip explaining Fast Track toggle?
- [ ] **Accessibility:** Ensure screen readers announce mode changes?

---

## 13. Sign-Off

**Design Approved By:** [User]  
**Date:** November 8, 2025  

**Ready for Development:** ✅  
**Estimated Effort:** 4-6 dev days  
**Target Release:** v1.8

---

## Appendix A: Wireframes
*(To be added: Visual mockups of Default vs Fast Track Mode)*

## Appendix B: User Flow Diagram
*(To be added: Visual flowchart of user journeys)*

---

**End of Specification**


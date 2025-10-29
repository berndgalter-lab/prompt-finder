# Frontend Current Structure - Workflow Display

**Date:** 26. Oktober 2025  
**Template:** `single-workflows.php`  
**Status:** 🟡 **ANALYSIS COMPLETE - READY FOR REDESIGN**

---

## 📁 **FILE STRUCTURE**

### **PHP Template:**
- **File:** `wp-content/themes/generatepress-child/single-workflows.php` (1044 Zeilen)
- **Backup:** `single-workflows-BACKUP-2025-10-26.php` ✅

### **CSS Files:**
- **Primary:** `assets/css/pf-workflows.css` (2424 Zeilen)
- **Backup:** `pf-workflows-BACKUP-2025-10-26.css` ✅
- **Other:** `pf-blog.css`, `pf-core.css`, `pf-components.css`, `pf-landing.css`, `pf-pricing.css`

### **JavaScript Files:**
- **Main:** `assets/js/pf-workflows.js` (26 Zeilen - Minimal!)
- **Related:** `pf-core.js`, `pf-navigation.js`, `pf-learn-use-mode.js`, `pf-workflow-navigation.js`, `pf-analytics.js`, `pf-pricing.js`

---

## 📊 **ACF FIELDS ANALYSIS**

### ✅ **FIELDS CURRENTLY DISPLAYED:**

#### **Workflow-Level:**
1. ✅ `summary` - Summary section (Learn Mode)
2. ✅ `use_case` - Use case information
3. ✅ `version` - Version number
4. ✅ `last_update` / `latest_update` - Last update date
5. ✅ `steps` - Steps repeater (Main Content)
6. ✅ `pain_points` - Pain points section (Learn Mode)
7. ✅ `expected_outcome` - Expected outcome (Learn Mode)
8. ✅ `time_saved_min` - Time saved (Value Panel)
9. ✅ `difficulty_without_ai` - Difficulty level (Info Chips)
10. ✅ `tagline` - Tagline below title
11. ✅ `workflow_id` - Workflow ID badge
12. ✅ `inputs_prerequisites` - Prerequisites section
13. ✅ `requires_source_content` - Privacy warning

#### **Workflow Variables (Global):**
14. ✅ `pf_variables` / `variables_workflow` - Global variables (NEW!)

#### **Steps Repeater:**
15. ✅ `step_id` - Step identifier
16. ✅ `title` - Step title
17. ✅ `objective` - Step objective
18. ✅ `prompt` - Main prompt content
19. ✅ `variables` / `variables_step` - Step variables (NEW!)
20. ✅ `example_output` - Example output (details)
21. ✅ `estimated_time_min` - Time per step
22. ✅ `step_checklist` - Checklist for review steps
23. ✅ `step_type` - Step type badge (NEW!)
24. ✅ `prompt_mode` - Prompt mode badge (NEW!)
25. ✅ `uses_global_vars` - Global vars badge (NEW!)
26. ✅ `consumes_previous_output` - Previous output badge (NEW!)
27. ✅ `paste_guidance` - Paste guidance info (NEW!)
28. ✅ `step_body` - Guide body content (NEW!)
29. ✅ `review_hint` - Review hint (NEW!)

### ❌ **FIELDS NOT DISPLAYED:**

- `is_stable` - Stable version flag
- `auto_update_allowed` - Auto-update flag
- `changelog` - Changelog text
- `changelog_json` - Changelog JSON
- `use_profile_defaults` - Profile defaults flag
- `access_mode` - Access mode (but used for gating logic!)
- `free_step_limit` - Free step limit (but used for gating logic!)
- `login_required` - Login required (but used for gating logic!)
- `status` - Workflow status
- `access_tier` - Access tier
- `license` - License information
- `owner` - Owner field

---

## 🏗️ **HTML STRUCTURE**

### **Main Container:**
```html
<div class="pf-workflow">
  <!-- Header Section -->
  <header class="pf-header">
    <!-- Title, Badges, Actions -->
  </header>
  
  <!-- Prerequisites Section -->
  <?php if (!empty($inputs_prerequisites)): ?>
    <div class="pf-prerequisites">
      <!-- Content -->
    </div>
  <?php endif; ?>
  
  <!-- Workflow Variables (Global) -->
  <?php if (!empty($workflow_variables)): ?>
    <div class="pf-workflow-variables">
      <div class="pf-workflow-vars-card">
        <!-- Variables list -->
      </div>
    </div>
  <?php endif; ?>
  
  <!-- Learn Mode Content -->
  <div class="pf-learn-content">
    <!-- Summary, Outcome, Pain Points -->
  </div>
  
  <!-- Steps List -->
  <div class="pf-content">
    <ol class="pf-steps">
      <?php foreach ($steps as $step): ?>
        <li class="pf-step pf-step-card">
          <!-- Step content -->
        </li>
      <?php endforeach; ?>
    </ol>
  </div>
  
  <!-- Footer -->
  <footer class="pf-footer">
    <!-- Actions, Rating, etc. -->
  </footer>
</div>
```

---

## 🎨 **CSS CLASSES (SELECTION)**

### **Workflow Container:**
- `.pf-workflow` - Main container
- `.pf-header` - Header section
- `.pf-content` - Steps container
- `.pf-footer` - Footer section

### **Title Section:**
- `.pf-title-section` - Title container
- `.pf-title-row` - Title + workflow_id
- `.pf-title` - Main title (H1)
- `.pf-workflow-id` - ID badge
- `.pf-tagline` - Tagline text

### **Info Chips:**
- `.pf-chips` - Chips container
- `.pf-chip` - Individual chip
- `.pf-chip-text` - Chip text
- `.pf-chip--lock` - Lock chip

### **Workflow Variables (Global):**
- `.pf-workflow-variables` - Container
- `.pf-workflow-vars-card` - Card container
- `.pf-workflow-vars-card-header` - Header with icon
- `.pf-workflow-vars-title` - Title
- `.pf-workflow-vars-subtitle` - Subtitle
- `.pf-workflow-vars-list` - Variables list
- `.pf-workflow-var-item` - Individual variable
- `.pf-workflow-var-label` - Label
- `.pf-workflow-var-input` - Input field
- `.pf-workflow-var-hint` - Hint text

### **Step Cards:**
- `.pf-step` - Step list item
- `.pf-step-card` - Step card
- `.pf-step-head` - Step header
- `.pf-step-title` - Step title (H3)
- `.pf-step-head-meta` - Meta (time, badges)
- `.pf-step-badges` - Badges container
- `.pf-step-time` - Time chip

### **Step Variables:**
- `.pf-vars` - Variables container
- `.pf-step-var-item` - Variable item
- `.pf-step-var-label` - Label
- `.pf-step-var-hint` - Hint text
- `.pf-step-var-input` - Input field

### **Step Content:**
- `.pf-prompt` - Prompt container
- `.pf-prompt-editable` - Editable prompt
- `.pf-guide-body` - Guide instructions
- `.pf-review-checklist` - Review checklist
- `.pf-example` - Example output (details)

### **Step Type Badges:**
- `.pf-chip--context_stage` - Context badge
- `.pf-chip--main` - Main prompt badge
- `.pf-chip--optimizer` - Optimizer badge
- `.pf-chip--guide` - Guide badge
- `.pf-chip--review` - Review badge
- `.pf-chip--uses-global` - Uses global vars badge
- `.pf-chip--prev-output` - Previous output badge

---

## ⚙️ **JAVASCRIPT ANALYSIS**

### **pf-workflows.js:**
- **Lines:** 26
- **Functionality:** Minimal - Legacy compatibility only
- **Functions:**
  - `copyToClipboard()` - Copy functionality (legacy)
  - `PF_VARS` - Global variables storage (legacy)
  - Console logs for debugging

### **Other JS Files:**
- `pf-core.js` - Core functionality
- `pf-navigation.js` - Navigation logic
- `pf-learn-use-mode.js` - Learn/Use mode toggle
- `pf-workflow-navigation.js` - Step navigation
- `pf-analytics.js` - Analytics tracking
- `pf-pricing.js` - Pricing functionality

**Note:** JavaScript is minimal - Most functionality is PHP-based!

---

## 🎨 **CSS DESIGN SYSTEM**

### **CSS Variables:**
```css
--pf-text: #1a1a1a;
--pf-text-dim: #666;
--pf-accent: #6366f1;
--pf-bg: #ffffff;
--pf-surface: #f9fafb;
--pf-border: #e5e7eb;
```

### **Color Palette:**
- **Primary:** Blue (#3b82f6, #6366f1)
- **Success:** Green (#4caf50)
- **Warning:** Yellow (#ffc107)
- **Danger:** Red (#ef4444)
- **Info:** Cyan (#00bcd4)

### **Spacing System:**
- 0.5rem (8px)
- 1rem (16px)
- 1.5rem (24px)
- 2rem (32px)
- 3rem (48px)

### **Border Radius:**
- Small: 8px
- Medium: 12px
- Large: 16px
- Rounded: 24px

### **Typography:**
- **Title:** clamp(2.5rem, 6vw, 4rem) - Bold 900
- **H2:** 1.5rem - Bold 700
- **H3:** 1.125rem - Bold 600
- **Body:** 1rem
- **Small:** 0.875rem
- **Caption:** 0.75rem

---

## 📋 **MAIN SECTIONS**

### **1. Header (Lines 150-290)**
- Title + Workflow ID
- Tagline
- Info chips (version, time, difficulty)
- Mode toggle (Learn/Use)
- Favorite button
- Share button

### **2. Prerequisites (Lines 464-491)**
- Description
- Privacy warning (if requires_source_content)

### **3. Workflow Variables (Lines 493-553)**
- Card layout
- List of global variables
- Labels, hints, inputs

### **4. Learn Mode Content (Lines 555-567)**
- Summary
- Expected outcome
- Pain points
- (Only shown in Learn Mode)

### **5. Steps List (Lines 648-932)**
- Numbered list `<ol>`
- Each step is `<li class="pf-step">`
- Step header with title, badges, time
- Step variables (if any)
- Step content (prompt/guide/review)
- Example output
- Next panel (DISABLED via config)

### **6. Footer (Lines 983-1044)**
- Actions
- Rating
- Related workflows

---

## ⚠️ **PROBLEMS IDENTIFIED**

### **1. Code Organization:**
- ❌ Monolithic file (1044 lines!)
- ❌ Mixed logic and presentation
- ❌ Complex conditional rendering
- ❌ Hard to maintain

### **2. Field Name Inconsistency:**
- ❌ Code uses BOTH `pf_variables` (OLD) AND `variables_workflow` (NEW)
- ❌ Code uses BOTH `variables` (OLD) AND `variables_step` (NEW)
- ❌ Backward compatibility makes code complex

### **3. Missing UX Features:**
- ❌ No visual hierarchy for step types
- ❌ No collapse/expand for steps
- ❌ Variables not interactive (no auto-fill)
- ❌ No step navigation
- ❌ No progress indicator

### **4. Performance:**
- ⚠️ Large CSS file (2424 lines)
- ⚠️ No CSS minification
- ⚠️ No JavaScript optimization

### **5. Accessibility:**
- ⚠️ Missing ARIA labels
- ⚠️ Keyboard navigation not optimized
- ⚠️ Screen reader support could be better

---

## ✅ **CURRENT STRENGTHS**

1. ✅ Modern, clean design
2. ✅ Responsive CSS
3. ✅ Good semantic HTML
4. ✅ Error handling implemented
5. ✅ Security (escape functions)
6. ✅ Learn/Use mode toggle
7. ✅ Step badges and visuals
8. ✅ Mobile-friendly

---

## 🎯 **RECOMMENDATIONS FOR REDESIGN**

### **High Priority:**
1. **Modularize Template**
   - Split into separate template parts
   - Header, Variables, Steps, Footer as includes

2. **Simplify Variable Logic**
   - Remove backward compatibility after migration
   - Use ONLY new field names

3. **Add Interactive Features**
   - Variable auto-fill
   - Step navigation
   - Progress indicator
   - Keyboard shortcuts

4. **Improve UX**
   - Collapse/expand steps
   - Visual step progress
   - Better mobile experience

### **Medium Priority:**
5. **Performance Optimization**
   - Minify CSS/JS
   - Lazy load images
   - Cache optimized

6. **Accessibility**
   - Add ARIA labels
   - Keyboard navigation
   - Screen reader support

### **Low Priority:**
7. **Code Cleanup**
   - Remove unused CSS
   - Consolidate JS files
   - Better documentation

---

## 📊 **STATISTICS**

### **File Sizes:**
- `single-workflows.php`: 1044 lines
- `pf-workflows.css`: 2424 lines
- `pf-workflows.js`: 26 lines

### **Code Distribution:**
- PHP: ~80%
- CSS: ~19%
- JavaScript: ~1%

### **Complexity:**
- Nested conditionals: High
- Repeater loops: 3 levels
- Template functions: ~10
- ACF field calls: ~30

---

## 🎨 **DESIGN ANALYSIS**

### **Current Visual Style:**
- **Modern SAAS design** ✅
- **Card-based layout** ✅
- **Clean typography** ✅
- **Subtle gradients** ✅
- **Minimal borders** ✅
- **Professional color scheme** ✅

### **Layout Pattern:**
```
┌─────────────────────────────┐
│  Header (Title, Badges)     │
├─────────────────────────────┤
│  Prerequisites              │
├─────────────────────────────┤
│  Workflow Variables (Card)  │
├─────────────────────────────┤
│  Learn Mode Content         │
├─────────────────────────────┤
│  Step 1 (Full Width)        │
├─────────────────────────────┤
│  Step 2 (Full Width)        │
├─────────────────────────────┤
│  Step 3 (Full Width)        │
├─────────────────────────────┤
│  Footer (Actions, Rating)   │
└─────────────────────────────┘
```

---

## 📋 **CHECKLIST FOR REDESIGN**

### **Analysis:**
- [x] Identify all files
- [x] Create backups
- [x] Document current structure
- [x] Identify problems
- [x] List improvements needed

### **Next Steps:**
- [ ] User flow mapping
- [ ] Wireframe creation
- [ ] Component breakdown
- [ ] Implementation plan
- [ ] Testing strategy

---

**Status:** ✅ **ANALYSIS COMPLETE**  
**Backups:** ✅ **CREATED**  
**Ready for:** Redesign & Implementation


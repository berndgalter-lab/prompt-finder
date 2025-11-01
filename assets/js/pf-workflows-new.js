/**
 * Workflow Frontend JavaScript - NEW VERSION
 * Main JS File - Imports all modules
 */

(function() {
  'use strict';
  
  // Import modules (will be loaded via separate files)
  // - navigation.js
  // - progress.js
  // - variables.js
  // - steps.js
  // - storage.js
  // - copy.js
  // - keyboard.js
  
  console.log('🚀 Workflow Frontend loading...');
  
  // Init on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  /**
   * Slugify helper: Convert string to URL-safe slug
   * @param {string} str - Input string
   * @returns {string} Normalized slug
   */
  function slugify(str = '') {
    return String(str)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  /**
   * Normalize step IDs and sidebar anchor links to ensure they match
   * Fixes issues with ACF data having typos, uppercase, spaces, etc.
   */
  function normalizeStepAnchors() {
    const steps = Array.from(document.querySelectorAll('.pf-steps-list .pf-step'));
    const byIndex = new Map();
    
    // Normalize all step IDs
    steps.forEach(step => {
      const idx = step.getAttribute('data-step-number') || step.getAttribute('data-step-index');
      const title = step.querySelector('.pf-step-title')?.textContent || '';
      let id = step.id || step.getAttribute('data-step-id') || title;
      
      // Normalize the ID
      id = slugify(id);
      
      // If still empty, generate from index
      if (!id) {
        id = `step-${idx || 'x'}`;
      }
      
      // Update step ID
      step.id = id;
      
      // Store mapping by index for fallback matching
      if (idx) {
        byIndex.set(String(idx), id);
      }
    });

    // Normalize all sidebar step links
    const links = document.querySelectorAll('.pf-sidebar-link--step');
    links.forEach(a => {
      const idx = a.getAttribute('data-step-index') || 
                  a.querySelector('.pf-step-number')?.textContent?.trim();
      const title = a.querySelector('.pf-step-title-text')?.textContent || '';
      const existingHref = (a.getAttribute('href') || '').replace(/^#/, '');
      const targetText = existingHref || title;
      
      // Prefer index-based matching if available (most reliable)
      // This ensures links match step IDs even if ACF data has typos
      let normalized;
      if (idx && byIndex.has(String(idx))) {
        // Use the normalized step ID from the map (most reliable)
        normalized = byIndex.get(String(idx));
      } else {
        // Fallback: slugify the existing href or title
        normalized = slugify(targetText);
      }
      
      // Update href
      a.setAttribute('href', `#${normalized}`);
    });
  }

  /**
   * Mark decorative SVGs for accessibility
   * Adds aria-hidden="true" and focusable="false" to SVGs that don't have aria-label
   */
  function markDecorativeSVGs() {
    const container = document.querySelector('.pf-workflow-container');
    if (!container) return;
    
    const svgs = container.querySelectorAll('svg');
    let markedCount = 0;
    
    svgs.forEach(svg => {
      // Skip if already has aria-label (meaningful icon)
      if (svg.hasAttribute('aria-label') || svg.closest('[aria-label]')) {
        return;
      }
      
      // Skip if inside a button/link that already has aria-label
      const parentButton = svg.closest('button, a');
      if (parentButton && (parentButton.hasAttribute('aria-label') || parentButton.hasAttribute('title'))) {
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');
        markedCount++;
        return;
      }
      
      // Mark as decorative
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');
      markedCount++;
    });
    
    if (markedCount > 0) {
      console.log('✅ Marked', markedCount, 'decorative SVGs for accessibility');
    }
  }

  function init() {
    // Normalize step anchors first (before other modules initialize)
    // Note: WorkflowSteps.synchronizeStepIds() will handle the actual ID synchronization
    // This function is kept for backward compatibility
    try {
      normalizeStepAnchors();
    } catch (e) {
      console.warn('Failed to normalize step anchors:', e);
    }
    
    // Mark decorative SVGs for accessibility
    try {
      markDecorativeSVGs();
    } catch (e) {
      console.warn('Failed to mark decorative SVGs:', e);
    }
    
    // Ensure modules are initialized after DOM is ready
    // Steps module will call synchronizeStepIds() during its init
    // Progress module will call updateProgress() during its init and on checkbox changes
    
    console.log('✅ Workflow Frontend initialized');
    console.log('📦 Modules loaded:', {
      storage: typeof window.WorkflowStorage !== 'undefined',
      navigation: typeof window.WorkflowNavigation !== 'undefined',
      variables: typeof window.WorkflowVariables !== 'undefined',
      steps: typeof window.WorkflowSteps !== 'undefined',
      copy: typeof window.WorkflowCopy !== 'undefined',
      progress: typeof window.WorkflowProgress !== 'undefined'
    });
  }
  
})();

// === PF Intro Panel (compact) ===============================================
// Builds a compact Intro panel from existing "Overview" + "Value" content,
// adds a persistent Hide/Show toggle, and hides the old sections.
//
// Persistence key: `pf:intro:hidden:<postId>`
//
// Assumes `workflowData.postId` is available (already enqueued in this theme).

(function () {
  if (!document || !('querySelector' in document)) return;

  // Wait for DOM to be fully ready
  function initIntroPanel() {
    const postId = (typeof workflowData !== 'undefined' && workflowData.postId) ? workflowData.postId : null;
    const lsKey = postId ? `pf:intro:hidden:${postId}` : null;

    const overview = document.querySelector('#overview.pf-section--overview');
    const value = document.querySelector('#value.pf-section--value');
    const before = document.querySelector('#prerequisites.pf-section--prerequisites') || document.querySelector('.pf-section--prerequisites');

    // Collect source fragments (graceful fallbacks)
    // Try new compact layout first, then fallback to old layout
    const summaryEl = overview?.querySelector('.pf-overview-summary p') || 
                      overview?.querySelector('.pf-info-card--summary .pf-info-card-content p');
    
    const problemsEl = value?.querySelector('.pf-value-mini--problems .pf-value-card-text') ||
                       value?.querySelector('.pf-value-card--warning .pf-value-card-text');
    
    const outcomeEl = value?.querySelector('.pf-value-mini--outcome .pf-value-card-text') ||
                     value?.querySelector('.pf-value-card--success .pf-value-card-text');

    // Optional: Without-AI note (if present somewhere in overview/value; make it robust)
    let withoutAiText = '';
    const withoutAiCandidate = overview?.querySelector('.pf-overview-note') ||
                               overview?.querySelector('.pf-without-ai, .pf-withoutai, [data-without-ai]') || 
                               value?.querySelector('.pf-without-ai, .pf-withoutai, [data-without-ai]');
    if (withoutAiCandidate) withoutAiText = withoutAiCandidate.textContent.trim();

    // If there's nothing to build from, do nothing.
    const hasAny = summaryEl || problemsEl || outcomeEl || withoutAiText;
    if (!hasAny || !before) return;

    // Build Intro DOM
    const intro = document.createElement('section');
    intro.className = 'pf-intro';
    intro.setAttribute('role', 'region');
    intro.setAttribute('aria-label', 'Workflow introduction');

    // Collapsed state from storage
    const hiddenByUser = lsKey ? (localStorage.getItem(lsKey) === '1') : false;
    if (hiddenByUser) intro.classList.add('is-collapsed');

    const introId = `pf-intro-content-${postId || 'x'}`;

    // Get text content safely
    const summaryText = (summaryEl?.textContent || '').trim();
    const problemsText = (problemsEl?.innerHTML || problemsEl?.textContent || '').trim();
    const outcomeText = (outcomeEl?.innerHTML || outcomeEl?.textContent || '').trim();

    intro.innerHTML = `
      <div class="pf-intro-bar">
        <p class="pf-intro-summary">${summaryText}</p>
        <button class="pf-intro-toggle" type="button"
                aria-controls="${introId}"
                aria-expanded="${hiddenByUser ? 'false' : 'true'}"
                aria-pressed="${hiddenByUser ? 'true' : 'false'}"
                data-action="toggle-intro">
          ${hiddenByUser ? 'Show intro' : 'Hide intro'}
        </button>
      </div>

      <div class="pf-intro-content" id="${introId}" ${hiddenByUser ? 'hidden' : ''}>
        <div class="pf-intro-grid">
          <div class="pf-intro-col pf-intro-problems" ${problemsEl ? '' : 'hidden'}>
            <h3 class="pf-intro-h3">Problems this solves</h3>
            <div class="pf-intro-text">${problemsText}</div>
          </div>
          <div class="pf-intro-col pf-intro-outcome" ${outcomeEl ? '' : 'hidden'}>
            <h3 class="pf-intro-h3">What you'll get</h3>
            <div class="pf-intro-text">${outcomeText}</div>
          </div>
        </div>
        ${withoutAiText ? `<p class="pf-intro-note">${withoutAiText}</p>` : ''}
      </div>
    `;

    // Insert Intro before "Before you start"
    before.parentNode.insertBefore(intro, before);

    // Hide old sections to avoid duplication (keep DOM for SEO if desired)
    if (overview) overview.classList.add('pf-hidden');
    if (value) value.classList.add('pf-hidden');

    // Toggle handlers
    const toggleBtn = intro.querySelector('[data-action="toggle-intro"]');
    const contentEl = intro.querySelector('.pf-intro-content');

    function setCollapsed(collapsed) {
      if (!contentEl || !toggleBtn) return;
      
      if (collapsed) {
        intro.classList.add('is-collapsed');
        contentEl.hidden = true;
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.setAttribute('aria-pressed', 'true');
        toggleBtn.textContent = 'Show intro';
        if (lsKey) localStorage.setItem(lsKey, '1');
      } else {
        intro.classList.remove('is-collapsed');
        contentEl.hidden = false;
        toggleBtn.setAttribute('aria-expanded', 'true');
        toggleBtn.setAttribute('aria-pressed', 'false');
        toggleBtn.textContent = 'Hide intro';
        if (lsKey) localStorage.setItem(lsKey, '0');
      }
    }

    toggleBtn?.addEventListener('click', () => {
      const nowCollapsed = !contentEl || !contentEl.hidden ? true : false;
      setCollapsed(nowCollapsed);
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIntroPanel);
  } else {
    initIntroPanel();
  }
})();

// === PF Overview Toggle (per-post persistence) ===============================================
// Adds collapse/expand toggle for the Overview section with localStorage persistence.
// Persistence key: `pf_overview_collapsed_<postId>`

(function() {
  const section = document.querySelector('#overview.pf-section--overview');
  const btn = section ? section.querySelector('.pf-overview-toggle') : null;
  if (!section || !btn) return;

  // Get post ID (try workflowData first, then data attribute, fallback to 'unknown')
  const postId = (typeof workflowData !== 'undefined' && workflowData.postId) 
    ? workflowData.postId 
    : (section.getAttribute('data-post-id') || 
       document.querySelector('[data-post-id]')?.getAttribute('data-post-id') || 
       'unknown');
  const key = `pf_overview_collapsed_${postId}`;

  const card = section.querySelector('.pf-overview-card');
  if (!card) return;

  // Initial state from localStorage
  const saved = localStorage.getItem(key);
  if (saved === '1') {
    section.classList.add('is-collapsed');
    btn.setAttribute('aria-expanded', 'false');
    btn.textContent = 'Show overview';
  } else {
    btn.setAttribute('aria-expanded', 'true');
    btn.textContent = 'Hide overview';
  }

  // Toggle handler
  btn.addEventListener('click', () => {
    const collapsed = section.classList.toggle('is-collapsed');
    btn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    btn.textContent = collapsed ? 'Show overview' : 'Hide overview';
    localStorage.setItem(key, collapsed ? '1' : '0');
  });
})();


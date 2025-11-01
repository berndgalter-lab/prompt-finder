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


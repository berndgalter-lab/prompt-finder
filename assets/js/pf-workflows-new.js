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
   * Inject HowTo Schema.org structured data
   * Builds schema from DOM elements (works even if ACF varies)
   */
  function injectHowToSchema() {
    try {
      // Find all steps
      const stepElements = Array.from(document.querySelectorAll('.pf-steps-list .pf-step'));
      
      if (!stepElements.length) {
        console.warn('HowTo Schema: No steps found');
        return;
      }
      
      // Build step array
      const steps = stepElements.map((el, i) => {
        // Get step name from title
        const name = el.querySelector('.pf-step-title')?.textContent?.trim() || `Step ${i + 1}`;
        
        // Get step text (try multiple sources in order of preference)
        let text = '';
        
        // 1. Try objective preview (always visible in header)
        const objectivePreview = el.querySelector('.pf-step-objective-preview')?.textContent?.trim();
        if (objectivePreview) {
          text = objectivePreview;
        } else {
          // 2. Try objective in content (might be collapsed)
          const objective = el.querySelector('.pf-step-objective')?.textContent?.trim();
          if (objective) {
            // Remove "Goal:" prefix if present
            text = objective.replace(/^Goal:\s*/i, '').trim();
          } else {
            // 3. Try prompt text (for prompt steps)
            const promptText = el.querySelector('.pf-prompt-text')?.textContent?.trim();
            if (promptText) {
              // Truncate if too long (max 500 chars for schema)
              text = promptText.length > 500 ? promptText.substring(0, 500) + '...' : promptText;
            } else {
              // 4. Fallback: use step title
              text = name;
            }
          }
        }
        
        return {
          "@type": "HowToStep",
          "position": i + 1,
          "name": name,
          "text": text || name // Ensure text is never empty
        };
      });
      
      // Get workflow name (remove ID badge if present)
      const titleEl = document.querySelector('.pf-header-title');
      let workflowName = '';
      if (titleEl) {
        // Clone to avoid modifying original
        const clone = titleEl.cloneNode(true);
        // Remove ID badge span
        const idBadge = clone.querySelector('.pf-header-id');
        if (idBadge) {
          idBadge.remove();
        }
        workflowName = clone.textContent?.trim() || document.title;
      } else {
        workflowName = document.title;
      }
      
      // Get total time from metrics (look for "Estimated Time" label)
      let totalTime = 'PT10M'; // Default fallback
      const metricCards = Array.from(document.querySelectorAll('.pf-metric-card'));
      const timeCard = metricCards.find(card => {
        const label = card.querySelector('.pf-metric-label')?.textContent?.trim();
        return label && label.toLowerCase().includes('estimated time');
      });
      
      if (timeCard) {
        const timeValue = timeCard.querySelector('.pf-metric-value')?.textContent?.trim();
        if (timeValue) {
          // Extract number (e.g., "10 min" -> 10)
          const match = timeValue.match(/(\d+)/);
          if (match) {
            const minutes = parseInt(match[1], 10);
            if (minutes > 0) {
              totalTime = `PT${minutes}M`;
            }
          }
        }
      }
      
      // Build schema
      const schema = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": workflowName,
        "description": document.querySelector('.pf-info-card--summary')?.textContent?.trim() 
          || "Step-by-step workflow.",
        "totalTime": totalTime,
        "estimatedCost": {
          "@type": "MonetaryAmount",
          "currency": "EUR",
          "value": "0"
        },
        "tool": [
          {
            "@type": "HowToTool",
            "name": "ChatGPT or compatible LLM"
          }
        ],
        "step": steps
      };
      
      // Check if PHP schema already exists (server-side generation is preferred)
      const existing = document.querySelector('script[type="application/ld+json"]');
      if (existing && existing.textContent?.includes('"@type":"HowTo"')) {
        // PHP schema already exists, don't inject duplicate
        console.log('ℹ️ HowTo Schema already exists (server-side), skipping JavaScript injection');
        return;
      }
      
      // Only inject if no schema exists (fallback for dynamic content or SPAs)
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(schema, null, 2);
      document.head.appendChild(script);
      
      console.log('✅ HowTo Schema injected (JavaScript fallback):', schema);
      
    } catch (e) {
      console.error('Failed to inject HowTo Schema:', e);
    }
  }

  function init() {
    // Normalize step anchors first (before other modules initialize)
    try {
      normalizeStepAnchors();
    } catch (e) {
      console.warn('Failed to normalize step anchors:', e);
    }
    
    // Inject HowTo Schema after DOM is ready
    try {
      injectHowToSchema();
    } catch (e) {
      console.warn('Failed to inject HowTo Schema:', e);
    }
    
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


function sanitizeKey(name) {
  return (name || '')
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '')
    .replace(/^_+|_+$/g, '')
    .slice(0, 32);
}

function renderStepVarItem(item, stepId) {
  const type = (item.step_var_type || 'text').toLowerCase();
  const key = sanitizeKey(item.step_var_name || item.step_var_label || 'var');
  const label = item.step_var_label || key;
  const placeholder = item.step_var_placeholder || '';
  const required = !!item.step_var_required;
  const hint = item.step_var_hint || '';
  const defaultVal = item.step_var_default || '';

  const wrap = document.createElement('div');
  wrap.className = 'pf-var-item';
  wrap.dataset.varKey = key;
  if (required) wrap.dataset.varRequired = 'true';

  const lab = document.createElement('label');
  lab.className = 'pf-var-label';
  lab.setAttribute('for', `pf-step-${stepId}-var-input-${key}`);
  lab.innerHTML = `${label}${required ? ' <span class="pf-var-required" aria-label="Required">*</span>' : ''}`;

  let input;
  if (type === 'select' && item.step_var_options_json) {
    input = document.createElement('select');
    try {
      const opts = JSON.parse(item.step_var_options_json);
      const empty = document.createElement('option');
      empty.value = '';
      empty.textContent = placeholder || '— choose —';
      input.appendChild(empty);
      (opts || []).forEach(o => {
        const opt = document.createElement('option');
        if (typeof o === 'string') { opt.value = o; opt.textContent = o; }
        else { opt.value = o.value ?? o.key ?? ''; opt.textContent = o.label ?? o.value ?? ''; }
        input.appendChild(opt);
      });
    } catch(e) {
      input = document.createElement('input');
      input.type = 'text';
    }
  }
  if (!input) {
    input = document.createElement('input');
    input.type = type === 'number' ? 'number' : 'text';
  }

  input.id = `pf-step-${stepId}-var-input-${key}`;
  input.className = 'pf-var-input';
  input.dataset.varKey = key;
  if (placeholder) input.placeholder = placeholder;
  if (required) {
    input.required = true;
    input.setAttribute('aria-required', 'true');
  }
  input.value = defaultVal;

  let hintEl = null;
  if (hint) {
    hintEl = document.createElement('p');
    hintEl.className = 'pf-var-hint';
    hintEl.textContent = hint;
  }

  wrap.appendChild(lab);
  wrap.appendChild(input);
  if (hintEl) wrap.appendChild(hintEl);

  input.addEventListener('input', () => {
    if (required) wrap.classList.toggle('pf-var--invalid', !input.value.trim());
  });

  return wrap;
}
/**
 * Workflow Module: Steps
 * Handles step toggle, completion, and variable injection
 */

(function() {
  'use strict';
  
  const WorkflowSteps = {
    
    // Elements
    steps: [],
    postId: null,
    storageKey: null,
    stickyActionsBar: null,
    
    // State
    collapsedSteps: [],
    completedSteps: [],
    
    /**
     * Slugify helper: Convert string to URL-safe slug
     * @param {string} s - Input string
     * @returns {string} Normalized slug
     */
    slugify: function(s) {
      return String(s)
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    },
    
    /**
     * Synchronize step IDs with sidebar links
     * Sets 1-based indexing and ensures anchors match
     */
    synchronizeStepIds: function() {
      const steps = Array.from(document.querySelectorAll('.pf-steps-list > .pf-step'));
      
      steps.forEach((step, i) => {
        // 1-based index
        const stepIndex = i + 1;
        
        // Get title and clean it
        const titleEl = step.querySelector('.pf-step-title');
        if (!titleEl) return;
        
        let titleText = titleEl.textContent || '';
        // Remove leading spaces
        titleText = titleText.trim().replace(/^\s+/, '');
        
        // Slugify title
        const slug = this.slugify(titleText);
        
        // Set step data attributes and ID
        step.dataset.stepIndex = String(stepIndex);
        step.id = `step-${stepIndex}-${slug}`;
        
        // Update matching sidebar link
        const sidebarLink = document.querySelector(`.pf-sidebar-link--step[data-step-index="${stepIndex}"]`);
        if (sidebarLink) {
          sidebarLink.href = '#' + step.id;
          sidebarLink.setAttribute('aria-controls', step.id);
        }
        
        // Ensure checkbox has proper aria-label
        const checkbox = step.querySelector('.pf-step-checkbox');
        if (checkbox) {
          checkbox.setAttribute('aria-label', `Step ${stepIndex} als erledigt markieren`);
        }
      });
      
      console.log('WorkflowSteps: Synchronized', steps.length, 'step IDs with sidebar links');
    },
    
    /**
     * Initialize the steps module
     */
    init: function() {
      this.postId = window.WorkflowStorage.getPostId();
      if (!this.postId) {
        console.warn('WorkflowSteps: Could not determine post ID');
        return;
      }
      
      this.storageKey = window.WorkflowStorage.getCollapsedKey(this.postId);
      this.steps = document.querySelectorAll('.pf-step');
      
      if (this.steps.length === 0) {
        console.warn('WorkflowSteps: No steps found');
        return;
      }
      
      // Synchronize step IDs with sidebar links (must be first)
      this.synchronizeStepIds();
      
      // Refresh steps NodeList after ID synchronization
      this.steps = document.querySelectorAll('.pf-step');
      
      // Load saved state
      this.loadProgress();
      
      // Setup ARIA attributes for toggles
      this.bindStepToggles();
      
      // Setup event listeners
      this.setupToggle();
      this.setupCompletion();
      
      this.pruneVarsBadge();
      
      // Auto-expand first incomplete step
      this.autoExpandFirstIncomplete();
      
      // Setup mobile action bar
      this.setupMobileActionBar();
      
      console.log('WorkflowSteps: Initialized for', this.steps.length, 'steps');
    },
    
    /**
     * Bind ARIA attributes to step toggle buttons
     */
    bindStepToggles: function() {
      this.steps.forEach((step, i) => {
        const btn = step.querySelector('.pf-step-toggle') || step.querySelector('.pf-step-header');
        const content = step.querySelector('.pf-step-content');
        
        if (!btn || !content) return;
        
        // Ensure content has an ID
        const cid = content.id || (step.id ? step.id + '-content' : 'step-' + (i + 1) + '-content');
        if (!content.id) {
          content.id = cid;
        }
        
        // Set ARIA attributes on toggle button
        if (btn.tagName === 'BUTTON' || btn.getAttribute('role') === 'button') {
          btn.setAttribute('aria-controls', cid);
          btn.setAttribute('aria-expanded', step.classList.contains('is-collapsed') ? 'false' : 'true');
        } else {
          // If header is clickable, ensure it has proper attributes
          btn.setAttribute('role', 'button');
          btn.setAttribute('tabindex', '0');
          btn.setAttribute('aria-controls', cid);
          btn.setAttribute('aria-expanded', step.classList.contains('is-collapsed') ? 'false' : 'true');
        }
      });
    },
    
    /**
     * Setup toggle functionality
     */
    setupToggle: function() {
      this.steps.forEach(step => {
        const header = step.querySelector('.pf-step-header');
        if (!header) return;
        
        // Click on header to toggle
        header.addEventListener('click', (e) => {
          // Don't toggle if clicking checkbox or copy button
          if (e.target.closest('.pf-step-checkbox') || 
              e.target.closest('.pf-btn-copy') ||
              e.target.closest('.pf-btn')) {
            return;
          }
          
          this.toggleStep(step);
        });
      });
    },
    
    /**
     * Toggle step collapse/expand
     */
    toggleStep: function(stepElement) {
      const stepId = stepElement.dataset.stepId;
      const btn = stepElement.querySelector('.pf-step-toggle') || stepElement.querySelector('.pf-step-header');
      const content = stepElement.querySelector('.pf-step-content');
      
      const isCollapsed = stepElement.classList.contains('is-collapsed');
      
      if (isCollapsed) {
        stepElement.classList.remove('is-collapsed');
        this.collapsedSteps = this.collapsedSteps.filter(id => id !== stepId);
      } else {
        stepElement.classList.add('is-collapsed');
        if (!this.collapsedSteps.includes(stepId)) {
          this.collapsedSteps.push(stepId);
        }
      }
      
      // Update ARIA attributes
      if (btn && content) {
        const isOpen = !stepElement.classList.contains('is-collapsed');
        btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      }
      
      // Save state
      this.saveProgress();
    },
    
    /**
     * Setup completion checkboxes
     */
    setupCompletion: function() {
      this.steps.forEach(step => {
        const checkbox = step.querySelector('.pf-step-checkbox');
        if (!checkbox) return;
        
        checkbox.addEventListener('change', () => {
          this.toggleCompletion(step);
        });
      });
    },
    
    /**
     * Toggle step completion
     */
    toggleCompletion: function(stepElement) {
      const checkbox = stepElement.querySelector('.pf-step-checkbox');
      const stepId = stepElement.dataset.stepId;
      
      if (checkbox.checked) {
        stepElement.classList.add('is-completed');
        if (!this.completedSteps.includes(stepId)) {
          this.completedSteps.push(stepId);
        }
      } else {
        stepElement.classList.remove('is-completed');
        this.completedSteps = this.completedSteps.filter(id => id !== stepId);
      }
      
      // Save state
      this.saveProgress();
      
      // Update progress bar
      window.WorkflowProgress?.update();
      
      // Trigger event
      document.dispatchEvent(new CustomEvent('stepCompleted', {
        detail: { stepId, completed: checkbox.checked }
      }));
    },
    
    /**
     * Load progress from localStorage
     */
    loadProgress: function() {
      // Load collapsed steps
      const collapsed = window.WorkflowStorage.get(this.storageKey);
      if (collapsed && Array.isArray(collapsed)) {
        this.collapsedSteps = collapsed;
        
        this.steps.forEach(step => {
          const stepId = step.dataset.stepId;
          if (this.collapsedSteps.includes(stepId)) {
            step.classList.add('is-collapsed');
          }
        });
      }
      
      // Load completed steps
      const completed = window.WorkflowStorage.get('workflow_completed_' + this.postId);
      if (completed && Array.isArray(completed)) {
        this.completedSteps = completed;
        
        this.steps.forEach(step => {
          const checkbox = step.querySelector('.pf-step-checkbox');
          const stepId = step.dataset.stepId;
          
          if (this.completedSteps.includes(stepId)) {
            checkbox.checked = true;
            step.classList.add('is-completed');
          }
        });
      }
    },
    
    /**
     * Save progress to localStorage
     */
    saveProgress: function() {
      // Save collapsed steps
      window.WorkflowStorage.set(this.storageKey, this.collapsedSteps);
      
      // Save completed steps
      window.WorkflowStorage.set('workflow_completed_' + this.postId, this.completedSteps);
    },
    
    renderStepVariables: function() {
      // handled by pf-workflows.js (Variables v1)
    },

    pruneVarsBadge: function() {
      document.querySelectorAll('[data-pf-step]').forEach(stepEl => {
        const hasStepVars = !!stepEl.getAttribute('data-step-vars') && stepEl.getAttribute('data-step-vars') !== '[]';
        const promptEl = stepEl.querySelector('[data-prompt-template]');
        const promptHasTokens = promptEl && /\{[^}]+\}/.test(promptEl.dataset.base || promptEl.dataset.originalText || '');
        if (hasStepVars || promptHasTokens) return;
        const badge = stepEl.querySelector('.pf-step-badge--vars');
        if (badge && badge.parentNode) badge.parentNode.removeChild(badge);
      });
    },
    
    /**
     * Auto-expand first incomplete step
     */
    autoExpandFirstIncomplete: function() {
      for (let step of this.steps) {
        if (!step.classList.contains('is-completed')) {
          // Expand if collapsed
          if (step.classList.contains('is-collapsed')) {
            this.toggleStep(step);
          }
          
          // Scroll to step
          setTimeout(() => {
            const headerOffset = 120;
            const elementPosition = step.offsetTop;
            const offsetPosition = elementPosition - headerOffset;
            
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }, 300);
          
          break;
        }
      }
    },
    
    /**
     * Re-inject variables (called when variables change)
     */
    reInjectVariables: function() {
      this.injectVariables();
    },
    
    /**
     * Setup mobile action bar (sticky bottom bar)
     */
    setupMobileActionBar: function() {
      // Create action bar if it doesn't exist
      if (!this.stickyActionsBar) {
        this.stickyActionsBar = document.createElement('div');
        this.stickyActionsBar.className = 'pf-sticky-actions';
        this.stickyActionsBar.setAttribute('role', 'toolbar');
        this.stickyActionsBar.setAttribute('aria-label', 'Step actions');
        
        // Back button
        const backBtn = document.createElement('button');
        backBtn.className = 'pf-btn pf-btn--secondary pf-btn-prev';
        backBtn.type = 'button';
        backBtn.setAttribute('aria-label', 'Previous step');
        backBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          <span>Back</span>
        `;
        backBtn.addEventListener('click', () => this.goPrev());
        
        // Copy button
        const copyBtn = document.createElement('button');
        copyBtn.className = 'pf-btn pf-btn--secondary pf-btn-copy-sticky';
        copyBtn.type = 'button';
        copyBtn.setAttribute('aria-label', 'Copy prompt');
        copyBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <span>Copy</span>
        `;
        copyBtn.addEventListener('click', () => this.copyCurrentPrompt(copyBtn));
        
        // Next button
        const nextBtn = document.createElement('button');
        nextBtn.className = 'pf-btn pf-btn--primary pf-btn-next';
        nextBtn.type = 'button';
        nextBtn.setAttribute('aria-label', 'Next step');
        nextBtn.innerHTML = `
          <span>Next</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        `;
        nextBtn.addEventListener('click', () => this.goNext());
        
        // Append buttons to bar
        this.stickyActionsBar.appendChild(backBtn);
        this.stickyActionsBar.appendChild(copyBtn);
        this.stickyActionsBar.appendChild(nextBtn);
        
        // Append to body
        document.body.appendChild(this.stickyActionsBar);
      }
      
      // Show/hide based on screen size
      this.updateMobileActionBarVisibility();
      
      // Update button states on scroll/resize
      window.addEventListener('scroll', () => this.updateMobileActionBarButtons());
      window.addEventListener('resize', () => {
        this.updateMobileActionBarVisibility();
        this.updateMobileActionBarButtons();
      });
      
      // Initial update
      this.updateMobileActionBarButtons();
    },
    
    /**
     * Show/hide mobile action bar based on screen size
     */
    updateMobileActionBarVisibility: function() {
      if (!this.stickyActionsBar) return;
      
      const isMobile = window.matchMedia('(max-width: 767px)').matches;
      this.stickyActionsBar.style.display = isMobile ? 'flex' : 'none';
    },
    
    /**
     * Update mobile action bar button states
     */
    updateMobileActionBarButtons: function() {
      if (!this.stickyActionsBar) return;
      
      const currentStep = this.getCurrentStep();
      const prevBtn = this.stickyActionsBar.querySelector('.pf-btn-prev');
      const copyBtn = this.stickyActionsBar.querySelector('.pf-btn-copy-sticky');
      const nextBtn = this.stickyActionsBar.querySelector('.pf-btn-next');
      
      // Get step index
      const currentIndex = currentStep ? this.getStepIndex(currentStep) : 1;
      const totalSteps = this.steps.length;
      
      // Update Back button
      if (prevBtn) {
        const hasPrev = currentIndex > 1;
        prevBtn.disabled = !hasPrev;
        prevBtn.setAttribute('aria-disabled', String(!hasPrev));
        if (hasPrev) {
          prevBtn.classList.remove('pf-btn--disabled');
        } else {
          prevBtn.classList.add('pf-btn--disabled');
        }
      }
      
      // Update Copy button (only show if current step has prompt)
      if (copyBtn) {
        const hasPrompt = currentStep && currentStep.querySelector('.pf-prompt-text');
        copyBtn.style.display = hasPrompt ? 'flex' : 'none';
      }
      
      // Update Next button
      if (nextBtn) {
        const hasNext = currentIndex < totalSteps;
        nextBtn.disabled = !hasNext;
        nextBtn.setAttribute('aria-disabled', String(!hasNext));
        if (hasNext) {
          nextBtn.classList.remove('pf-btn--disabled');
        } else {
          nextBtn.classList.add('pf-btn--disabled');
        }
      }
    },
    
    /**
     * Get current step (last expanded step, or first on load)
     */
    getCurrentStep: function() {
      // Find all expanded steps
      const expandedSteps = Array.from(this.steps).filter(step => 
        !step.classList.contains('is-collapsed')
      );
      
      // Return the last expanded step (or first step if none)
      if (expandedSteps.length > 0) {
        // Get the step that's most visible (closest to viewport center)
        let current = expandedSteps[0];
        const viewportCenter = window.innerHeight / 2 + window.scrollY;
        let minDistance = Math.abs(current.offsetTop - viewportCenter);
        
        expandedSteps.forEach(step => {
          const distance = Math.abs(step.offsetTop - viewportCenter);
          if (distance < minDistance) {
            minDistance = distance;
            current = step;
          }
        });
        
        return current;
      }
      
      // Fallback: return first step
      return this.steps[0] || null;
    },
    
    /**
     * Get step index (1-based)
     */
    getStepIndex: function(stepElement) {
      const index = Array.from(this.steps).indexOf(stepElement);
      return index >= 0 ? index + 1 : 1;
    },
    
    /**
     * Go to previous step
     */
    goPrev: function() {
      const currentStep = this.getCurrentStep();
      if (!currentStep) return;
      
      const currentIndex = Array.from(this.steps).indexOf(currentStep);
      if (currentIndex <= 0) return;
      
      const prevStep = this.steps[currentIndex - 1];
      this.navigateToStep(prevStep);
    },
    
    /**
     * Go to next step
     */
    goNext: function() {
      const currentStep = this.getCurrentStep();
      if (!currentStep) return;
      
      const currentIndex = Array.from(this.steps).indexOf(currentStep);
      if (currentIndex >= this.steps.length - 1) return;
      
      const nextStep = this.steps[currentIndex + 1];
      this.navigateToStep(nextStep);
    },
    
    /**
     * Navigate to a specific step (expand and scroll into view)
     */
    navigateToStep: function(stepElement) {
      if (!stepElement) return;
      
      // Expand if collapsed
      if (stepElement.classList.contains('is-collapsed')) {
        this.toggleStep(stepElement);
      }
      
      // Scroll into view with offset for sticky header
      setTimeout(() => {
        const headerOffset = 120;
        const elementPosition = stepElement.offsetTop;
        const offsetPosition = elementPosition - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }, 100);
      
      // Update button states
      this.updateMobileActionBarButtons();
    },
    
    /**
     * Copy current step's prompt
     */
    copyCurrentPrompt: function(button) {
      const currentStep = this.getCurrentStep();
      if (!currentStep) return;
      
      const promptText = currentStep.querySelector('.pf-prompt-text');
      if (!promptText) {
        console.warn('WorkflowSteps: No prompt text found in current step');
        return;
      }
      
      // Get text content (without HTML)
      const textToCopy = promptText.innerText || promptText.textContent || '';
      
      // Use WorkflowCopy module if available
      if (window.WorkflowCopy && window.WorkflowCopy.copyToClipboard) {
        window.WorkflowCopy.copyToClipboard(textToCopy, button);
      } else {
        // Fallback: use Clipboard API directly
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(textToCopy)
            .then(() => {
              if (button) {
                button.classList.add('is-copied');
                button.querySelector('span').textContent = 'Copied!';
                setTimeout(() => {
                  button.classList.remove('is-copied');
                  button.querySelector('span').textContent = 'Copy';
                }, 2000);
              }
            })
            .catch(err => {
              console.error('WorkflowSteps: Failed to copy text', err);
            });
        }
      }
    }
  };
  
  // Helper: Escape regex special characters
  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  
  // Helper: Escape HTML
  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  // Helper: Render a single variable item for the UI
  function renderStepVarItem(item, stepId) {
    const varItem = document.createElement('div');
    varItem.className = 'pf-var-item';
    varItem.setAttribute('data-var-key', item.key);

    const varKeySpan = document.createElement('span');
    varKeySpan.className = 'pf-var-key';
    varKeySpan.textContent = item.key;
    varItem.appendChild(varKeySpan);

    const varValueInput = document.createElement('input');
    varValueInput.type = 'text';
    varValueInput.className = 'pf-step-var-input';
    varValueInput.setAttribute('data-var-key', item.key);
    varValueInput.value = item.value || '';
    varItem.appendChild(varValueInput);

    const varRemoveBtn = document.createElement('button');
    varRemoveBtn.className = 'pf-btn pf-btn--icon pf-btn--small pf-btn--danger';
    varRemoveBtn.type = 'button';
    varRemoveBtn.setAttribute('aria-label', 'Remove variable');
    varRemoveBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" x2="6" y1="6" y2="18"></line>
        <line x1="6" x2="18" y1="6" y2="18"></line>
      </svg>
    `;
    varRemoveBtn.addEventListener('click', () => {
      varItem.remove();
      // Update the data-step-vars attribute on the parent step
      const stepEl = document.querySelector(`[data-pf-step][data-step-id="${stepId}"]`);
      if (stepEl) {
        const newSchema = JSON.parse(stepEl.getAttribute('data-step-vars') || '[]');
        newSchema.splice(newSchema.findIndex(i => i.key === item.key), 1);
        stepEl.setAttribute('data-step-vars', JSON.stringify(newSchema));
      }
    });
    varItem.appendChild(varRemoveBtn);

    return varItem;
  }
  
  // Listen for variable updates
  document.addEventListener('variablesUpdated', () => {
    WorkflowSteps.reInjectVariables();
  });
  
  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      WorkflowSteps.init();
    });
  } else {
    WorkflowSteps.init();
  }
  
  // Export for global access
  window.WorkflowSteps = WorkflowSteps;
  
})();

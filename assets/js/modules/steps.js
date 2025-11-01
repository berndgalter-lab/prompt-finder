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
      
      // Inject variables into prompts
      this.injectVariables();
      
      // Auto-expand first incomplete step
      this.autoExpandFirstIncomplete();
      
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
    
    /**
     * Inject variables into prompts
     */
    injectVariables: function() {
      const variablesKey = window.WorkflowStorage.getVariablesKey(this.postId);
      const savedVariables = window.WorkflowStorage.get(variablesKey);
      
      if (!savedVariables || typeof savedVariables !== 'object') {
        console.log('WorkflowSteps: No variables saved yet');
        return;
      }
      
      // Find all prompt texts
      const promptTexts = document.querySelectorAll('.pf-prompt-text');
      
      promptTexts.forEach(textElement => {
        const originalText = textElement.dataset.originalText;
        if (!originalText) return;
        
        let processedText = originalText;
        
        // Replace {{var_key}} with actual values
        Object.keys(savedVariables).forEach(varKey => {
          const varValue = savedVariables[varKey];
          const placeholder = '{{' + varKey + '}}';
          const regex = new RegExp(escapeRegExp(placeholder), 'g');
          
          if (varValue && varValue.trim().length > 0) {
            processedText = processedText.replace(regex, '<span class="pf-var-injected">' + escapeHtml(varValue) + '</span>');
          } else {
            processedText = processedText.replace(regex, '<span class="pf-var-empty">' + placeholder + '</span>');
          }
        });
        
        // Also replace user-supplied values from step variables
        const stepNumber = textElement.closest('.pf-step')?.dataset?.stepNumber;
        if (stepNumber) {
          const stepInputs = textElement.closest('.pf-step')?.querySelectorAll('.pf-step-var-input');
          
          if (stepInputs) {
            stepInputs.forEach(input => {
              const varKey = input.dataset.varKey;
              const varValue = input.value.trim();
              const placeholder = '{{' + varKey + '}}';
              const regex = new RegExp(escapeRegExp(placeholder), 'g');
              
              if (varValue.length > 0) {
                processedText = processedText.replace(regex, '<span class="pf-var-injected">' + escapeHtml(varValue) + '</span>');
              }
            });
          }
        }
        
        // Update text (only if it changed to avoid flickering)
        if (processedText !== originalText) {
          textElement.innerHTML = processedText;
        } else {
          textElement.textContent = originalText;
        }
      });
      
      console.log('WorkflowSteps: Variables injected');
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

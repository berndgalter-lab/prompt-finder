/**
 * Workflow Module: Variables
 * Handles input fields, validation, and localStorage
 */

(function() {
  'use strict';
  
  const WorkflowVariables = {
    
    // Elements
    section: null,
    inputs: [],
    counter: null,
    saveBtn: null,
    clearBtn: null,
    
    // State
    debounceTimer: null,
    postId: null,
    storageKey: null,
    
    /**
     * Initialize the variables module
     */
    init: function() {
      this.section = document.querySelector('.pf-section--variables');
      
      if (!this.section) {
        console.warn('WorkflowVariables: Variables section not found');
        return;
      }
      
      // Get post ID
      this.postId = window.WorkflowStorage.getPostId();
      if (!this.postId) {
        console.error('WorkflowVariables: Could not determine post ID');
        return;
      }
      
      // Generate storage key
      this.storageKey = window.WorkflowStorage.getVariablesKey(this.postId);
      
      // Get elements
      this.inputs = this.section.querySelectorAll('.pf-var-input');
      this.counter = this.section.querySelector('.pf-variables-counter');
      this.saveBtn = this.section.querySelector('[data-action="save-variables"]');
      this.clearBtn = this.section.querySelector('[data-action="clear-variables"]');
      
      if (this.inputs.length === 0) {
        console.warn('WorkflowVariables: No input fields found');
        return;
      }
      
      // Load saved values
      this.loadFromStorage();
      
      // Setup event listeners
      this.setupListeners();
      
      // Update initial state
      this.updateCounter();
      
      console.log('WorkflowVariables: Initialized for post ID', this.postId);
    },
    
    /**
     * Setup event listeners
     */
    setupListeners: function() {
      // Listen to input changes
      this.inputs.forEach(input => {
        input.addEventListener('input', (e) => {
          this.onInputChange(e.target);
        });
      });
      
      // Save button click
      if (this.saveBtn) {
        this.saveBtn.addEventListener('click', () => {
          this.saveToStorage(true);
        });
      }
      
      // Clear button click
      if (this.clearBtn) {
        this.clearBtn.addEventListener('click', () => {
          this.clearAll();
        });
      }
    },
    
    /**
     * Handle input change (debounced)
     */
    onInputChange: function(input) {
      // Update visual state immediately
      this.updateInputState(input);
      
      // Debounce save to localStorage
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.saveToStorage(false);
      }, 500);
      
      // Update counter
      this.updateCounter();
    },
    
    /**
     * Update visual state of input
     */
    updateInputState: function(input) {
      const value = input.value.trim();
      const isRequired = input.hasAttribute('required');
      
      // Remove all state classes
      input.classList.remove('is-filled', 'is-error', 'is-required');
      
      if (value.length > 0) {
        input.classList.add('is-filled');
      } else if (isRequired) {
        input.classList.add('is-required');
      }
    },
    
    /**
     * Load values from localStorage
     */
    loadFromStorage: function() {
      const saved = window.WorkflowStorage.get(this.storageKey);
      
      if (!saved || typeof saved !== 'object') {
        return;
      }
      
      // Populate inputs
      this.inputs.forEach(input => {
        const varKey = input.dataset.varKey;
        if (saved[varKey]) {
          input.value = saved[varKey];
          this.updateInputState(input);
        }
      });
    },
    
    /**
     * Save values to localStorage
     * @param {boolean} showFeedback - Show visual feedback
     */
    saveToStorage: function(showFeedback) {
      const data = {};
      
      this.inputs.forEach(input => {
        const varKey = input.dataset.varKey;
        const value = input.value.trim();
        data[varKey] = value;
      });
      
      // Save to localStorage
      const success = window.WorkflowStorage.set(this.storageKey, data);
      
      if (showFeedback && success) {
        this.showFeedback('✓ Saved!');
      }
      
      return success;
    },
    
    /**
     * Clear all inputs
     */
    clearAll: function() {
      if (!confirm('Are you sure you want to clear all variables?')) {
        return;
      }
      
      // Clear inputs
      this.inputs.forEach(input => {
        input.value = '';
        this.updateInputState(input);
      });
      
      // Clear localStorage
      window.WorkflowStorage.remove(this.storageKey);
      
      // Update counter
      this.updateCounter();
      
      console.log('WorkflowVariables: Cleared all values');
    },
    
    /**
     * Update counter badge
     */
    updateCounter: function() {
      if (!this.counter) return;
      
      let filledCount = 0;
      
      this.inputs.forEach(input => {
        if (input.value.trim().length > 0) {
          filledCount++;
        }
      });
      
      const total = parseInt(this.counter.dataset.variablesTotal, 10);
      const counterNumber = this.counter.querySelector('.pf-counter-number');
      
      if (counterNumber) {
        counterNumber.textContent = filledCount;
      }
      
      // Update data attribute
      this.counter.dataset.variablesFilled = filledCount;
      
      // Animate counter
      if (filledCount > 0) {
        this.counter.style.transform = 'scale(1.05)';
        setTimeout(() => {
          this.counter.style.transform = 'scale(1)';
        }, 200);
      }
    },
    
    /**
     * Show visual feedback
     */
    showFeedback: function(message) {
      if (!this.saveBtn) return;
      
      const originalText = this.saveBtn.innerHTML;
      this.saveBtn.innerHTML = message;
      this.saveBtn.style.background = '#10b981';
      
      setTimeout(() => {
        this.saveBtn.innerHTML = originalText;
        this.saveBtn.style.background = '';
      }, 2000);
    },
    
    /**
     * Get all variable values
     * @returns {object} Key-value pairs of variables
     */
    getValues: function() {
      const data = {};
      
      this.inputs.forEach(input => {
        const varKey = input.dataset.varKey;
        const value = input.value.trim();
        data[varKey] = value;
      });
      
      return data;
    },
    
    /**
     * Validate all required fields
     * @returns {boolean} True if all required fields are filled
     */
    validate: function() {
      let isValid = true;
      
      this.inputs.forEach(input => {
        if (input.hasAttribute('required') && input.value.trim().length === 0) {
          isValid = false;
          input.classList.add('is-error');
        } else {
          input.classList.remove('is-error');
        }
      });
      
      return isValid;
    }
  };
  
  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      WorkflowVariables.init();
    });
  } else {
    WorkflowVariables.init();
  }
  
  // Export for global access
  window.WorkflowVariables = WorkflowVariables;
  
})();

/**
 * Workflow Module: Variables
 * Handles input fields, validation, and localStorage
 */

(function() {
  'use strict';
  
  /**
   * Humanize a variable key (e.g., "var_1" → "Var 1")
   * Format: key.replace(/_/g,' ').replace(/\b\w/g,m=>m.toUpperCase())
   * @param {string} key - Variable key
   * @returns {string} Humanized label
   */
  function humanize(key = '') {
    return String(key)
      .replace(/_/g, ' ')
      .replace(/\b\w/g, m => m.toUpperCase())
      .trim() || 'Value';
  }
  
  const WorkflowVariables = {
    
    // Elements
    section: null,
    card: null,
    items: [],
    inputs: [],
    counter: null,
    saveBtn: null,
    clearBtn: null,
    
    // State
    debounceTimer: null,
    postId: null,
    storageKey: null,
    requiredCount: 0,
    
    /**
     * Initialize the variables module
     */
    init: function() {
      this.section = document.querySelector('.pf-section--variables');
      
      if (!this.section) {
        console.warn('WorkflowVariables: Variables section not found');
        return;
      }
      
      // Get card container
      this.card = this.section.querySelector('.pf-variables-card');
      if (!this.card) {
        console.warn('WorkflowVariables: Variables card not found');
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
      
      // Get all variable items
      this.items = Array.from(this.card.querySelectorAll('.pf-var-item'));
      
      if (this.items.length === 0) {
        console.warn('WorkflowVariables: No variable items found');
        return;
      }
      
      // Initialize UI (labels, required fields, etc.)
      this.initVariablesUI();
      
      // Get elements after UI initialization
      this.inputs = this.card.querySelectorAll('.pf-var-input');
      this.counter = this.card.querySelector('.pf-variables-counter');
      this.saveBtn = this.card.querySelector('.pf-btn--save, [data-action="save-variables"]');
      this.clearBtn = this.card.querySelector('[data-action="clear-variables"]');
      
      // Load saved values
      this.loadFromStorage();
      
      // Setup event listeners
      this.setupListeners();
      
      // Validate and update initial state (counter + button)
      this.validate();
      
      console.log('WorkflowVariables: Initialized for post ID', this.postId);
    },
    
    /**
     * Initialize variables UI: auto-fill labels, placeholders, mark required fields
     */
    initVariablesUI: function() {
      let requiredCount = 0;
      
      this.items.forEach(item => {
        const key = item.getAttribute('data-var-key') || '';
        const required = (item.getAttribute('data-var-required') || 'false') === 'true';
        const labelEl = item.querySelector('.pf-var-label');
        const input = item.querySelector('.pf-var-input');
        
        if (!input) {
          console.warn('WorkflowVariables: Input not found for item', key);
          return;
        }
        
        // Auto-fill empty label from key using exact format: key.replace(/_/g,' ').replace(/\b\w/g,m=>m.toUpperCase())
        if (labelEl && !labelEl.textContent.trim()) {
          const labelText = humanize(key);
          // Remove any existing asterisk before setting new text
          const asterisk = labelEl.querySelector('.pf-var-required');
          if (asterisk) {
            asterisk.remove();
          }
          labelEl.textContent = labelText;
          // Re-add asterisk if required
          if (required) {
            labelEl.insertAdjacentHTML('beforeend', ' <span class="pf-var-required" aria-hidden="true">*</span>');
          }
        }
        
        // Set placeholder if empty
        if (!input.placeholder || input.placeholder.trim() === '') {
          input.placeholder = 'Wert eingeben';
        }
        
        // Mark required fields
        if (required) {
          requiredCount++;
          input.required = true;
          input.setAttribute('aria-required', 'true');
          
          // Add asterisk to label if not already present
          if (labelEl) {
            const existingAsterisk = labelEl.querySelector('.pf-var-required, [aria-hidden="true"]');
            if (!existingAsterisk) {
              labelEl.insertAdjacentHTML('beforeend', ' <span class="pf-var-required" aria-hidden="true">*</span>');
            }
          }
        }
      });
      
      this.requiredCount = requiredCount;
    },
    
    /**
     * Setup event listeners
     */
    setupListeners: function() {
      // Listen to input changes (using event delegation for better performance)
      this.card.addEventListener('input', (e) => {
        if (e.target.matches('.pf-var-input')) {
          this.onInputChange(e.target);
        }
      });
      
      // Save button click
      if (this.saveBtn) {
        this.saveBtn.addEventListener('click', (e) => {
          // If disabled, prevent default and focus first invalid field
          if (this.saveBtn.disabled) {
            e.preventDefault();
            const firstInvalid = this.card.querySelector('.pf-var-input:required:invalid, .pf-var-input[aria-required="true"]:not(.is-filled)');
            if (firstInvalid) {
              firstInvalid.focus();
              firstInvalid.classList.add('is-error');
            }
            return;
          }
          
          // Validate before saving
          if (this.validate()) {
            this.saveToStorage(true);
          }
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
      
      // Validate and update state (counter + button)
      this.validate();
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
      this.items.forEach(item => {
        const input = item.querySelector('.pf-var-input');
        if (!input) return;
        
        const varKey = item.getAttribute('data-var-key') || input.dataset.varKey;
        if (saved[varKey]) {
          input.value = saved[varKey];
          this.updateInputState(input);
        }
      });
      
      // Validate and update state after loading (counter + button)
      this.validate();
    },
    
    /**
     * Save values to localStorage
     * @param {boolean} showFeedback - Show visual feedback
     */
    saveToStorage: function(showFeedback) {
      const data = {};
      
      this.items.forEach(item => {
        const input = item.querySelector('.pf-var-input');
        if (!input) return;
        
        const varKey = item.getAttribute('data-var-key') || input.dataset.varKey;
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
      this.items.forEach(item => {
        const input = item.querySelector('.pf-var-input');
        if (input) {
          input.value = '';
          this.updateInputState(input);
        }
      });
      
      // Clear localStorage
      window.WorkflowStorage.remove(this.storageKey);
      
      // Validate and update state
      this.validate();
      
      console.log('WorkflowVariables: Cleared all values');
    },
    
    /**
     * Update state: counter + save button enabled/disabled
     * This is now called by validate() to keep things in sync
     */
    updateState: function() {
      // Count required fields that are filled
      const requiredFilled = this.items.filter(item => {
        const required = (item.getAttribute('data-var-required') || 'false') === 'true';
        if (!required) return false;
        
        const input = item.querySelector('.pf-var-input');
        if (!input) return false;
        
        const value = input.value.trim();
        return !!value;
      }).length;
      
      // Count all filled fields (only when value is actually present)
      const filled = this.items.filter(item => {
        const input = item.querySelector('.pf-var-input');
        if (!input) return false;
        const value = input.value.trim();
        return value !== '';
      }).length;
      
      // Update counter
      if (this.counter) {
        const counterNumber = this.counter.querySelector('.pf-counter-number');
        const counterTotal = this.counter.querySelector('.pf-counter-total');
        
        if (counterNumber) {
          counterNumber.textContent = String(filled);
        }
        
        if (counterTotal) {
          const total = parseInt(this.counter.dataset.variablesTotal, 10) || this.items.length;
          counterTotal.textContent = String(total);
        }
        
        // Update data attribute
        this.counter.dataset.variablesFilled = filled;
        
        // Animate counter when it changes
        if (filled > 0) {
          this.counter.style.transform = 'scale(1.05)';
          setTimeout(() => {
            this.counter.style.transform = 'scale(1)';
          }, 200);
        }
      }
      
      // Enable/disable save button based on required fields
      if (this.saveBtn) {
        const allRequiredDone = requiredFilled === this.requiredCount && this.requiredCount > 0;
        
        this.saveBtn.disabled = !allRequiredDone;
        this.saveBtn.setAttribute('aria-disabled', String(!allRequiredDone));
        
        // Add visual class for disabled state
        if (allRequiredDone) {
          this.saveBtn.classList.remove('pf-btn--disabled');
        } else {
          this.saveBtn.classList.add('pf-btn--disabled');
        }
      }
    },
    
    /**
     * Update counter badge (legacy - now handled by updateState)
     */
    updateCounter: function() {
      this.updateState();
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
      
      this.items.forEach(item => {
        const input = item.querySelector('.pf-var-input');
        if (!input) return;
        
        const varKey = item.getAttribute('data-var-key') || input.dataset.varKey;
        const value = input.value.trim();
        data[varKey] = value;
      });
      
      return data;
    },
    
    /**
     * Validate all fields and update counter + save button state
     * @returns {boolean} True if all required fields are filled
     */
    validate: function() {
      // Count total = items.length
      const total = this.items.length;
      
      // Count filled: items where value.trim() !== ""
      const filled = this.items.filter(item => {
        const input = item.querySelector('.pf-var-input');
        if (!input) return false;
        const value = input.value.trim();
        return value !== '';
      }).length;
      
      // Count required fields that are filled
      const requiredFilled = this.items.filter(item => {
        const required = (item.getAttribute('data-var-required') || 'false') === 'true';
        if (!required) return false;
        
        const input = item.querySelector('.pf-var-input');
        if (!input) return false;
        
        const value = input.value.trim();
        return value !== '';
      }).length;
      
      // Update counter
      if (this.counter) {
        const counterNumber = this.counter.querySelector('.pf-counter-number');
        const counterTotal = this.counter.querySelector('.pf-counter-total');
        
        if (counterNumber) {
          counterNumber.textContent = String(filled);
        }
        
        if (counterTotal) {
          counterTotal.textContent = String(total);
        }
        
        // Update data attribute
        this.counter.dataset.variablesFilled = filled;
        this.counter.dataset.variablesTotal = total;
        
        // Animate counter when it changes
        if (filled > 0) {
          this.counter.style.transform = 'scale(1.05)';
          setTimeout(() => {
            this.counter.style.transform = 'scale(1)';
          }, 200);
        }
      }
      
      // Validate required fields and mark errors
      let isValid = true;
      this.items.forEach(item => {
        const required = (item.getAttribute('data-var-required') || 'false') === 'true';
        if (!required) return;
        
        const input = item.querySelector('.pf-var-input');
        if (!input) return;
        
        const value = input.value.trim();
        if (value === '') {
          isValid = false;
          input.classList.add('is-error');
          input.classList.add('pf-var-input--error');
        } else {
          input.classList.remove('is-error');
          input.classList.remove('pf-var-input--error');
        }
      });
      
      // Enable/disable save button based on required fields
      // If no required fields exist, button is always enabled
      if (this.saveBtn) {
        const hasRequired = this.requiredCount > 0;
        const allRequiredDone = hasRequired ? (requiredFilled === this.requiredCount) : true;
        
        this.saveBtn.disabled = !allRequiredDone;
        this.saveBtn.setAttribute('aria-disabled', String(!allRequiredDone));
        
        // Add visual class for disabled state
        if (allRequiredDone) {
          this.saveBtn.classList.remove('pf-btn--disabled');
        } else {
          this.saveBtn.classList.add('pf-btn--disabled');
        }
      }
      
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

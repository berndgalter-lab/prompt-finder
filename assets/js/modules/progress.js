/**
 * Workflow Module: Progress
 * Updates progress bar based on completed steps
 */

(function() {
  'use strict';
  
  const WorkflowProgress = {
    
    // Elements
    progressBar: null,
    progressFill: null,
    section: null,
    
    // State
    totalSteps: 0,
    
    /**
     * Initialize the progress module
     */
    init: function() {
      this.progressBar = document.querySelector('.pf-progress-bar');
      this.progressFill = document.querySelector('.pf-progress-fill');
      this.section = document.querySelector('.pf-section--steps');
      
      if (!this.progressBar || !this.progressFill) {
        console.warn('WorkflowProgress: Progress bar elements not found');
        return;
      }
      
      // Get total steps
      if (this.section && this.section.dataset.totalSteps) {
        this.totalSteps = parseInt(this.section.dataset.totalSteps, 10);
      } else {
        const steps = document.querySelectorAll('.pf-step');
        this.totalSteps = steps.length;
      }
      
      // Initial update
      this.update();
      
      // Listen for step completion events
      document.addEventListener('stepCompleted', () => {
        this.update();
      });
      
      // Listen for checkbox changes directly
      document.addEventListener('change', (e) => {
        if (e.target.classList.contains('pf-step-checkbox')) {
          this.update();
        }
      });
      
      // Listen for reset progress button
      document.addEventListener('click', (e) => {
        const resetBtn = e.target.closest('[data-action="reset-progress"]');
        if (resetBtn) {
          e.preventDefault();
          
          // Uncheck all checkboxes
          const checkboxes = document.querySelectorAll('.pf-step-checkbox');
          checkboxes.forEach(cb => {
            cb.checked = false;
            // Remove is-completed class from parent step
            const step = cb.closest('.pf-step');
            if (step) {
              step.classList.remove('is-completed');
            }
          });
          
          // Update progress
          this.update();
          
          // Clear localStorage if WorkflowSteps is available
          if (window.WorkflowSteps) {
            window.WorkflowSteps.completedSteps = [];
            window.WorkflowSteps.saveProgress();
          }
          
          console.log('WorkflowProgress: Progress reset');
        }
      });
      
      console.log('WorkflowProgress: Initialized for', this.totalSteps, 'steps');
    },
    
    /**
     * Update progress bar
     * Counts checked checkboxes and updates progress bar with aria-valuenow
     */
    update: function() {
      // Count checked checkboxes (not just is-completed class)
      const checkedBoxes = document.querySelectorAll('.pf-step-checkbox:checked');
      const checked = checkedBoxes.length;
      
      // Calculate percentage
      const pct = this.totalSteps > 0 ? Math.round((checked / this.totalSteps) * 100) : 0;
      
      // Update progress bar aria-valuenow
      if (this.progressBar) {
        this.progressBar.setAttribute('aria-valuenow', String(pct));
      }
      
      // Update fill width
      if (this.progressFill) {
        this.progressFill.style.width = pct + '%';
        this.progressFill.dataset.progress = String(pct);
      }
      
      // Set aria-valuetext
      if (this.progressBar) {
        const label = checked + ' of ' + this.totalSteps + ' steps completed';
        this.progressBar.setAttribute('aria-valuetext', label);
      }
      
      console.log('WorkflowProgress: Updated to', pct + '% (' + checked + ' of ' + this.totalSteps + ')');
    },
    
    /**
     * Set progress with ARIA attributes for accessibility
     * @param {number} pct - Percentage (0-100)
     * @param {string} label - Optional label for screen readers
     */
    setProgress: function(pct = 0, label) {
      const bar = this.progressBar;
      const fill = this.progressFill;
      
      if (!bar || !fill) {
        console.warn('WorkflowProgress: Progress bar elements not found');
        return;
      }
      
      // Set width on fill element
      fill.style.width = pct + '%';
      
      // Set ARIA attributes on progress bar container
      const roundedPct = Math.round(pct);
      bar.setAttribute('aria-valuenow', String(roundedPct));
      bar.setAttribute('aria-valuemin', '0');
      bar.setAttribute('aria-valuemax', '100');
      
      // Set aria-valuetext with custom label or default
      if (label) {
        bar.setAttribute('aria-valuetext', label);
      } else {
        bar.setAttribute('aria-valuetext', roundedPct + '% complete');
      }
      
      // Update data attribute
      fill.dataset.progress = roundedPct;
      
      console.log('WorkflowProgress: Updated to', roundedPct + '% (' + label + ')');
    },
    
    /**
     * Get completed steps
     * @returns {NodeList} List of completed step elements
     */
    getCompletedSteps: function() {
      return document.querySelectorAll('.pf-step.is-completed');
    },
    
    /**
     * Get total steps
     * @returns {number} Total number of steps
     */
    getTotalSteps: function() {
      return this.totalSteps;
    },
    
    /**
     * Get progress percentage
     * @returns {number} Progress percentage (0-100)
     */
    getPercentage: function() {
      const completed = this.getCompletedSteps().length;
      return this.totalSteps > 0 ? (completed / this.totalSteps) * 100 : 0;
    }
  };
  
  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      WorkflowProgress.init();
    });
  } else {
    WorkflowProgress.init();
  }
  
  // Export for global access
  window.WorkflowProgress = WorkflowProgress;
  
})();

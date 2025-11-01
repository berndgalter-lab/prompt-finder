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
      
      console.log('WorkflowProgress: Initialized for', this.totalSteps, 'steps');
    },
    
    /**
     * Update progress bar
     */
    update: function() {
      const completed = this.getCompletedSteps().length;
      const percentage = this.totalSteps > 0 ? (completed / this.totalSteps) * 100 : 0;
      
      // Use setProgress with proper ARIA attributes
      this.setProgress(percentage, completed + ' of ' + this.totalSteps + ' steps completed');
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

/**
 * Workflow Module: Progress
 * Updates progress bar based on completed steps
 */

(function() {
  'use strict';
  
  const WorkflowProgress = {
    
    // Elements
    progressBar: null,
    section: null,
    
    // State
    totalSteps: 0,
    
    /**
     * Initialize the progress module
     */
    init: function() {
      this.progressBar = document.querySelector('.pf-progress-fill');
      this.section = document.querySelector('.pf-section--steps');
      
      if (!this.progressBar) {
        console.warn('WorkflowProgress: Progress bar not found');
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
      
      // Animate progress bar
      this.progressBar.style.width = percentage + '%';
      this.progressBar.setAttribute('aria-valuenow', Math.round(percentage));
      this.progressBar.dataset.progress = Math.round(percentage);
      
      console.log('WorkflowProgress: Updated to', Math.round(percentage) + '% (' + completed + '/' + this.totalSteps + ')');
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

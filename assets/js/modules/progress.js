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
    progressLabel: null,
    progressSummary: null,
    progressInfoSummary: null,
    progressInfoElapsed: null,
    largeProgressBar: null,
    largeProgressFill: null,
    progressStepLabel: null,
    timeTracker: null,
    timeElapsedEl: null,
    startedAt: null,
    timeIntervalId: null,
    visibilityHandler: null,
    
    // State
    totalSteps: 0,
    
    /**
     * Initialize the progress module
     */
    init: function() {
      this.progressBar = document.querySelector('.pf-progress-bar');
      this.progressFill = document.querySelector('.pf-progress-fill');
      this.section = document.querySelector('.pf-section--steps');
      this.progressLabel = document.querySelector('[data-progress-label]');
      this.progressSummary = document.querySelector('[data-progress-summary]');
      this.timeTracker = document.querySelector('[data-workflow-start]');
      this.timeElapsedEl = this.timeTracker ? this.timeTracker.querySelector('[data-time-elapsed]') : null;
      this.progressInfoSummary = document.querySelector('.pf-progress-info [data-progress-summary]');
      this.progressInfoElapsed = document.querySelector('.pf-progress-info [data-time-elapsed]');
      this.largeProgressBar = document.querySelector('.pf-progress-bar-large');
      this.largeProgressFill = document.querySelector('.pf-progress-fill-large');
      this.progressStepLabel = document.querySelector('[data-progress-step]');

      if (!this.progressBar && this.largeProgressBar) {
        this.progressBar = this.largeProgressBar;
      }
      if (!this.progressFill && this.largeProgressFill) {
        this.progressFill = this.largeProgressFill;
      }
      
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
      
      // Setup time tracking indicator
      this.setupTimeTracking();

      // Initial update
      this.update();

      document.addEventListener('activeStepChange', () => {
        this.updateStepIndicator();
      });

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
      const summaryText = this.totalSteps > 0 ? `${checked} of ${this.totalSteps} steps completed` : `${pct}% complete`;

      if (this.progressBar) {
        this.progressBar.setAttribute('aria-valuenow', String(pct));
        this.progressBar.setAttribute('aria-valuetext', summaryText);
      }
      if (this.largeProgressBar) {
        this.largeProgressBar.setAttribute('aria-valuenow', String(pct));
        this.largeProgressBar.setAttribute('aria-valuetext', summaryText);
      }
      
      // Update fill width
      if (this.progressFill) {
        this.progressFill.style.width = pct + '%';
        this.progressFill.dataset.progress = String(pct);
      }
      if (this.largeProgressFill) {
        this.largeProgressFill.style.width = pct + '%';
        this.largeProgressFill.dataset.progress = String(pct);
      }
      
      this.updateMeta(pct, checked);
      this.updateStepIndicator();
      
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
      if (this.largeProgressBar) {
        this.largeProgressBar.setAttribute('aria-valuenow', String(roundedPct));
      }
      
      // Set aria-valuetext with custom label or default
      const ariaText = label || `${roundedPct}% complete`;
      if (bar) {
        bar.setAttribute('aria-valuetext', ariaText);
      }
      if (this.largeProgressBar) {
        this.largeProgressBar.setAttribute('aria-valuetext', ariaText);
      }
      
      // Update data attribute
      fill.dataset.progress = roundedPct;
      if (this.largeProgressFill) {
        this.largeProgressFill.style.width = roundedPct + '%';
        this.largeProgressFill.dataset.progress = roundedPct;
      }
      
      this.updateMeta(roundedPct, null, label);
      this.updateStepIndicator();

      console.log('WorkflowProgress: Updated to', roundedPct + '% (' + (label || 'manual update') + ')');
    },
    
    updateMeta: function(pct, completed, label) {
      var clampedPct = Math.max(0, Math.min(100, Math.round(pct)));

      if (this.progressLabel) {
        this.progressLabel.textContent = clampedPct + '%';
      }

      var summaryText = null;
      if (typeof completed === 'number' && this.totalSteps > 0) {
        summaryText = completed + ' of ' + this.totalSteps + ' steps completed';
      } else if (label) {
        summaryText = label;
      }

      if (summaryText) {
        if (this.progressSummary) {
          this.progressSummary.textContent = summaryText;
        }
        if (this.progressInfoSummary) {
          this.progressInfoSummary.textContent = summaryText;
        }
      }
    },

    updateStepIndicator: function() {
      if (!this.progressStepLabel) {
        return;
      }

      if (!this.totalSteps || this.totalSteps <= 0) {
        this.progressStepLabel.textContent = 'Progress: Step 0 of 0';
        return;
      }

      let activeStep = document.querySelector('.pf-step.pf-step--active');
      if (!activeStep) {
        activeStep = document.querySelector('.pf-step:not(.pf-step--locked)');
      }

      let stepNumber = activeStep ? activeStep.getAttribute('data-step-number') : null;
      if (!stepNumber && activeStep) {
        const steps = Array.from(document.querySelectorAll('.pf-step'));
        const idx = steps.indexOf(activeStep);
        if (idx >= 0) {
          stepNumber = String(idx + 1);
        }
      }

      if (!stepNumber) {
        const fallback = this.totalSteps > 0 ? Math.min((this.getCompletedSteps()?.length || 0) + 1, this.totalSteps) : 0;
        stepNumber = String(fallback);
      }

      this.progressStepLabel.textContent = `Progress: Step ${stepNumber} of ${this.totalSteps}`;
    },

    setupTimeTracking: function() {
      if (!this.timeTracker) {
        return;
      }

      var raw = parseInt(this.timeTracker.getAttribute('data-workflow-start'), 10);
      if (isNaN(raw)) {
        return;
      }

      this.startedAt = raw * 1000; // convert to milliseconds
      this.updateTimeElapsed();

      if (this.timeIntervalId) {
        window.clearInterval(this.timeIntervalId);
      }

      this.timeIntervalId = window.setInterval(() => {
        this.updateTimeElapsed();
      }, 60000);

      if (!this.visibilityHandler) {
        this.visibilityHandler = () => {
          if (document.visibilityState === 'visible') {
            this.updateTimeElapsed();
          }
        };
        document.addEventListener('visibilitychange', this.visibilityHandler);
      }
    },

    updateTimeElapsed: function() {
      if (!this.startedAt) {
        return;
      }

      var now = Date.now();
      var diff = Math.max(0, now - this.startedAt);
      var minutesTotal = Math.round(diff / 60000);
      var label = 'just now';

      if (minutesTotal >= 60 * 24) {
        var days = Math.floor(minutesTotal / (60 * 24));
        var hours = Math.floor((minutesTotal % (60 * 24)) / 60);
        label = days + 'd';
        if (hours > 0) {
          label += ' ' + hours + 'h';
        }
        label += ' ago';
      } else if (minutesTotal >= 60) {
        var hoursOnly = Math.floor(minutesTotal / 60);
        var minutesRemainder = minutesTotal % 60;
        label = hoursOnly + ' hr';
        if (hoursOnly > 1) {
          label += 's';
        }
        if (minutesRemainder > 0) {
          label += ' ' + minutesRemainder + ' min';
        }
        label += ' ago';
      } else if (minutesTotal >= 1) {
        label = minutesTotal + ' min ago';
      }

      if (this.timeElapsedEl) {
        this.timeElapsedEl.textContent = label;
      }
      if (this.progressInfoElapsed) {
        this.progressInfoElapsed.textContent = label;
      }
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

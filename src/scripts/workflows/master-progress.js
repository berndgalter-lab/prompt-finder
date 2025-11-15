/**
 * File Name: master-progress.js
 * Purpose: Workflow Progress Toolbar - Step-based progress tracking and smooth scrolling
 * Used in: Workflow single pages
 * Last Modified: 2025-11-15
 * 
 * Dependencies: None (vanilla JS)
 */

(function() {
  'use strict';

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    initSmoothScrolling();
    initProgressTracking();
  }

  /**
   * Initialize smooth scrolling for all navigation pills
   */
  function initSmoothScrolling() {
    var pills = document.querySelectorAll('[data-scroll-to]');
    
    pills.forEach(function(pill) {
      pill.addEventListener('click', function(e) {
        e.preventDefault();
        
        var targetId = pill.getAttribute('data-scroll-to');
        var targetElement = null;
        
        // Handle different target formats
        if (targetId === 'variables') {
          targetElement = document.getElementById('pf-variables');
        } else if (targetId.startsWith('step-')) {
          targetElement = document.getElementById('pf-' + targetId);
        }
        
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  /**
   * Initialize progress tracking based on steps
   */
  function initProgressTracking() {
    // Get progress data
    var progressDataEl = document.getElementById('pf-master-progress-data');
    if (!progressDataEl) return;
    
    var progressData = JSON.parse(progressDataEl.textContent);
    var totalSteps = progressData.totalSteps || 0;
    
    // Track step completion (for now, we'll use a simple localStorage-based system)
    var completedSteps = getCompletedSteps();
    var currentStepIndex = findCurrentStep(completedSteps, totalSteps);
    
    // Update UI
    updateProgressBar(completedSteps.length, totalSteps);
    updateStepPills(completedSteps, currentStepIndex);
    updateVariablesPill();
  }

  /**
   * Get completed steps from localStorage
   */
  function getCompletedSteps() {
    try {
      var workflowId = document.querySelector('[data-post-id]').getAttribute('data-post-id');
      var key = 'pf_completed_steps_' + workflowId;
      var stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Find the current step (first non-completed step)
   */
  function findCurrentStep(completedSteps, totalSteps) {
    for (var i = 1; i <= totalSteps; i++) {
      if (completedSteps.indexOf(i) === -1) {
        return i;
      }
    }
    return totalSteps; // All completed, current is last
  }

  /**
   * Update progress bar and header text
   */
  function updateProgressBar(completed, total) {
    var percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Update text
    var completedEl = document.querySelector('[data-master-completed]');
    if (completedEl) {
      completedEl.textContent = completed;
    }
    
    // Update percentage
    var percentageEl = document.querySelector('[data-master-percentage]');
    if (percentageEl) {
      percentageEl.textContent = percentage + '%';
    }
    
    // Update progress bar fill
    var fillEl = document.querySelector('[data-master-progress-fill]');
    if (fillEl) {
      fillEl.style.width = percentage + '%';
    }
    
    // Update aria attributes
    var barEl = document.querySelector('.pf-master-progress-bar');
    if (barEl) {
      barEl.setAttribute('aria-valuenow', percentage);
    }
  }

  /**
   * Update step pills with status indicators
   */
  function updateStepPills(completedSteps, currentStepIndex) {
    var stepPills = document.querySelectorAll('.pf-progress-section--step');
    
    stepPills.forEach(function(pill) {
      var stepIndex = parseInt(pill.getAttribute('data-step-index'));
      var statusIcon = pill.querySelector('[data-step-status]');
      
      // Reset classes
      pill.classList.remove('pf-progress-section--current');
      
      if (completedSteps.indexOf(stepIndex) !== -1) {
        // Completed
        pill.setAttribute('data-step-completed', 'true');
        if (statusIcon) {
          var icon = statusIcon.querySelector('.pf-status-icon');
          if (icon) {
            icon.classList.remove('pf-status-icon--open', 'pf-status-icon--current');
            icon.classList.add('pf-status-icon--complete');
            // Change to checkmark icon
            icon.innerHTML = '<polyline points="20 6 9 17 4 12"></polyline>';
          }
        }
      } else if (stepIndex === currentStepIndex) {
        // Current step
        pill.classList.add('pf-progress-section--current');
        if (statusIcon) {
          var icon = statusIcon.querySelector('.pf-status-icon');
          if (icon) {
            icon.classList.remove('pf-status-icon--open', 'pf-status-icon--complete');
            icon.classList.add('pf-status-icon--current');
          }
        }
      }
    });
  }

  /**
   * Update variables pill based on filled required variables
   */
  function updateVariablesPill() {
    var variablesPill = document.querySelector('.pf-progress-section--variables');
    if (!variablesPill) return;
    
    var requiredVars = parseInt(variablesPill.getAttribute('data-required-vars')) || 0;
    var filledVars = countFilledRequiredVariables();
    
    variablesPill.setAttribute('data-filled-vars', filledVars);
    
    if (filledVars >= requiredVars && requiredVars > 0) {
      variablesPill.setAttribute('data-all-required-filled', 'true');
      
      // Update icon to checkmark
      var statusIcon = variablesPill.querySelector('[data-variables-status] .pf-status-icon');
      if (statusIcon) {
        statusIcon.classList.remove('pf-status-icon--pending');
        statusIcon.classList.add('pf-status-icon--complete');
        statusIcon.innerHTML = '<polyline points="20 6 9 17 4 12"></polyline>';
      }
    }
  }

  /**
   * Count filled required workflow variables
   */
  function countFilledRequiredVariables() {
    var count = 0;
    var inputs = document.querySelectorAll('[data-pf-workflow-var][data-var-required="true"]');
    
    inputs.forEach(function(input) {
      var value = input.value || input.textContent;
      if (value && value.trim() !== '') {
        count++;
      }
    });
    
    return count;
  }

  // Listen for variable changes to update the pill
  document.addEventListener('input', function(e) {
    if (e.target.hasAttribute('data-pf-workflow-var')) {
      updateVariablesPill();
    }
  });

})();

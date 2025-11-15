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
    console.log('[PF Master Progress] Initializing...');
    initSmoothScrolling();
    initProgressTracking();
    initStepCompletionTracking();
    
    // Initial update after a short delay to ensure DOM is ready
    setTimeout(function() {
      console.log('[PF Master Progress] Running initial update...');
      updateVariablesPill();
    }, 500);
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
    if (!variablesPill) {
      console.log('[PF Master Progress] Variables pill not found');
      return;
    }
    
    var requiredVars = parseInt(variablesPill.getAttribute('data-required-vars')) || 0;
    var filledVars = countFilledRequiredVariables();
    
    console.log('[PF Master Progress] Variables check:', {
      required: requiredVars,
      filled: filledVars
    });
    
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
      
      console.log('[PF Master Progress] Variables pill marked as complete');
    } else {
      // Reset if not all filled
      variablesPill.setAttribute('data-all-required-filled', 'false');
      var statusIcon = variablesPill.querySelector('[data-variables-status] .pf-status-icon');
      if (statusIcon) {
        statusIcon.classList.remove('pf-status-icon--complete');
        statusIcon.classList.add('pf-status-icon--pending');
        statusIcon.innerHTML = '<circle cx="12" cy="12" r="10"></circle>';
      }
    }
  }

  /**
   * Count filled required workflow variables
   */
  function countFilledRequiredVariables() {
    var count = 0;
    var foundInputs = [];
    
    // Find all inputs in the variables section
    var variablesSection = document.getElementById('pf-variables');
    if (!variablesSection) {
      console.log('[PF Master Progress] Variables section not found');
      return 0;
    }
    
    // Find all input elements in the variables section
    var allInputs = variablesSection.querySelectorAll('input, textarea, select');
    
    console.log('[PF Master Progress] Found inputs in variables section:', allInputs.length);
    
    allInputs.forEach(function(input) {
      // Skip hidden inputs, buttons, etc.
      if (input.type === 'hidden' || input.type === 'button' || input.type === 'submit') {
        return;
      }
      
      // Check if this input is required
      var isRequired = input.hasAttribute('required') || 
                      input.getAttribute('data-required') === 'true' ||
                      input.getAttribute('data-var-required') === 'true';
      
      if (isRequired) {
        foundInputs.push({
          name: input.name || input.id || 'unnamed',
          value: input.value,
          filled: !!(input.value && input.value.trim() !== '')
        });
        
        if (input.value && input.value.trim() !== '') {
          count++;
        }
      }
    });
    
    console.log('[PF Master Progress] Required variables:', foundInputs);
    
    return count;
  }

  /**
   * Track step completion when copy buttons are clicked
   */
  function initStepCompletionTracking() {
    console.log('[PF Master Progress] Initializing step completion tracking');
    
    // Listen for copy button clicks in steps
    document.addEventListener('click', function(e) {
      // Try multiple selectors for copy buttons
      var copyBtn = e.target.closest('[data-copy-prompt]') ||
                    e.target.closest('.pf-copy-btn') ||
                    e.target.closest('.pf-step-copy-btn') ||
                    e.target.closest('button[class*="copy"]');
      
      if (!copyBtn) return;
      
      console.log('[PF Master Progress] Copy button clicked:', copyBtn);
      
      // Find the step this button belongs to
      var stepEl = copyBtn.closest('[data-pf-step]');
      if (!stepEl) {
        console.log('[PF Master Progress] No step element found for copy button');
        return;
      }
      
      var stepIndex = parseInt(stepEl.getAttribute('data-step-number'));
      if (!stepIndex) {
        console.log('[PF Master Progress] No step number found:', stepEl);
        return;
      }
      
      console.log('[PF Master Progress] Marking step as completed:', stepIndex);
      
      // Mark this step as completed
      markStepCompleted(stepIndex);
    }, true); // Use capture phase
  }

  /**
   * Mark a step as completed and update UI
   */
  function markStepCompleted(stepIndex) {
    try {
      var workflowId = document.querySelector('[data-post-id]').getAttribute('data-post-id');
      var key = 'pf_completed_steps_' + workflowId;
      
      // Get current completed steps
      var completedSteps = getCompletedSteps();
      
      // Add this step if not already completed
      if (completedSteps.indexOf(stepIndex) === -1) {
        completedSteps.push(stepIndex);
        completedSteps.sort(function(a, b) { return a - b; });
        
        // Save to localStorage
        localStorage.setItem(key, JSON.stringify(completedSteps));
        
        // Update UI
        var progressDataEl = document.getElementById('pf-master-progress-data');
        if (progressDataEl) {
          var progressData = JSON.parse(progressDataEl.textContent);
          var totalSteps = progressData.totalSteps || 0;
          var currentStepIndex = findCurrentStep(completedSteps, totalSteps);
          
          updateProgressBar(completedSteps.length, totalSteps);
          updateStepPills(completedSteps, currentStepIndex);
        }
      }
    } catch (e) {
      console.error('Error marking step as completed:', e);
    }
  }

  // Listen for variable changes to update the pill
  document.addEventListener('input', function(e) {
    var target = e.target;
    
    console.log('[PF Master Progress] Input event detected:', target.tagName, target.className);
    
    // Check if this is a workflow variable input
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
      var isWorkflowVar = target.closest('.pf-var') || 
                          target.closest('.pf-workflow-vars-card') ||
                          target.closest('#pf-variables') ||
                          target.hasAttribute('data-pf-workflow-var');
      
      console.log('[PF Master Progress] Is workflow var?', isWorkflowVar);
      
      if (isWorkflowVar) {
        // Debounce the update
        clearTimeout(window.pfVarUpdateTimeout);
        window.pfVarUpdateTimeout = setTimeout(function() {
          console.log('[PF Master Progress] Updating variables pill after input...');
          updateVariablesPill();
        }, 300);
      }
    }
  }, true); // Use capture phase to catch all events
  
  // Also listen for change events (for checkboxes, selects, etc.)
  document.addEventListener('change', function(e) {
    var target = e.target;
    
    console.log('[PF Master Progress] Change event detected:', target.tagName, target.className);
    
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
      var isWorkflowVar = target.closest('.pf-var') || 
                          target.closest('.pf-workflow-vars-card') ||
                          target.closest('#pf-variables');
      
      console.log('[PF Master Progress] Is workflow var (change)?', isWorkflowVar);
      
      if (isWorkflowVar) {
        console.log('[PF Master Progress] Updating variables pill after change...');
        updateVariablesPill();
      }
    }
  }, true); // Use capture phase
  
  // Debug: Log when script loads
  console.log('[PF Master Progress] Script loaded and initialized');

})();

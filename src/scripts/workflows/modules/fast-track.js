/**
 * PF Fast Track Module
 * 
 * Handles Fast Track Mode toggle and content adaptation
 * 
 * @package Prompt Finder
 * @since 1.8.0
 */

(function() {
  'use strict';

  let toggleWrapper = null;
  let toggleButton = null;
  let infoButton = null;
  let infoTooltip = null;
  let container = null;

  /**
   * Initialize Fast Track Module
   */
  function init() {
    // Get DOM elements
    toggleWrapper = document.querySelector('.pf-fast-track-toggle-wrapper');
    toggleButton = document.querySelector('.pf-toggle-switch[data-toggle-target="fast-track"]');
    infoButton = document.querySelector('.pf-ft-info-btn');
    infoTooltip = document.querySelector('.pf-ft-info-tooltip');
    container = document.querySelector('.pf-workflow-container');

    if (!toggleWrapper || !toggleButton || !container) {
      console.warn('[PF Fast Track] Required elements not found');
      return;
    }

    // Check if Fast Track is already enabled (server-side)
    const isFTActive = container.classList.contains('pf-fast-track-active');
    
    if (isFTActive) {
      toggleButton.classList.add('is-active');
      toggleButton.setAttribute('aria-checked', 'true');
      showToggle(); // Show toggle if already active
    }
    
    // Initialize step objectives (add "Read more" buttons)
    initStepObjectives();
    
    // If Fast Track is active, ensure accordion is functional
    if (isFTActive) {
      enableFastTrackFeatures();
    }

    // Listen for threshold-met event from tracking init
    document.addEventListener('pf:threshold-met', handleThresholdMet);

    // Toggle button click
    toggleButton.addEventListener('click', handleToggleClick);
    
    // Listen for Fast Track enable/disable events
    document.addEventListener('pf:fast-track-enabled', enableFastTrackFeatures);
    document.addEventListener('pf:fast-track-disabled', disableFastTrackFeatures);

    // Info button toggle
    if (infoButton && infoTooltip) {
      infoButton.addEventListener('click', toggleInfoTooltip);
      
      // Close tooltip when clicking outside
      document.addEventListener('click', (e) => {
        if (!infoButton.contains(e.target) && !infoTooltip.contains(e.target)) {
          hideInfoTooltip();
        }
      });
      
      // Close tooltip on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !infoTooltip.hidden) {
          hideInfoTooltip();
          infoButton.focus();
        }
      });
    }

    console.log('[PF Fast Track] Module initialized');
  }

  /**
   * Handle threshold met event
   */
  function handleThresholdMet(event) {
    console.log('[PF Fast Track] Threshold met:', event.detail);
    showToggle();
  }

  /**
   * Show toggle (with smooth animation)
   */
  function showToggle() {
    if (!toggleWrapper) return;
    
    toggleWrapper.hidden = false;
    
    // Small delay to ensure CSS transition works
    setTimeout(() => {
      toggleWrapper.dataset.ftReady = 'true';
    }, 50);
  }

  /**
   * Hide toggle
   */
  function hideToggle() {
    if (!toggleWrapper) return;
    
    toggleWrapper.dataset.ftReady = 'false';
    
    setTimeout(() => {
      toggleWrapper.hidden = true;
    }, 300); // Match CSS transition duration
  }

  /**
   * Handle toggle button click
   */
  async function handleToggleClick(event) {
    event.preventDefault();
    
    const isActive = toggleButton.classList.contains('is-active');
    const newState = !isActive;

    // Disable button during transition
    toggleButton.disabled = true;

    try {
      // Update preference via API or LocalStorage
      if (typeof window.PF !== 'undefined' && typeof window.PF.Tracking !== 'undefined') {
        await window.PF.Tracking.updateFTPreference(newState, 'manual');
      }

      // Update UI
      updateToggleState(newState);

      // Apply Fast Track Mode
      applyFastTrackMode(newState);

      console.log('[PF Fast Track] Mode changed:', newState ? 'ON' : 'OFF');
    } catch (err) {
      console.error('[PF Fast Track] Failed to update preference:', err);
    } finally {
      // Re-enable button
      toggleButton.disabled = false;
    }
  }

  /**
   * Update toggle button state
   */
  function updateToggleState(isActive) {
    if (!toggleButton) return;

    if (isActive) {
      toggleButton.classList.add('is-active');
      toggleButton.setAttribute('aria-checked', 'true');
    } else {
      toggleButton.classList.remove('is-active');
      toggleButton.setAttribute('aria-checked', 'false');
    }
  }

  /**
   * Apply Fast Track Mode (add/remove body class and trigger content changes)
   */
  function applyFastTrackMode(enabled) {
    if (!container) return;

    if (enabled) {
      container.classList.add('pf-fast-track-active');
      
      // Trigger custom event for content adaptation
      document.dispatchEvent(new CustomEvent('pf:fast-track-enabled'));
      
      // Smooth scroll to top to show the change
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      container.classList.remove('pf-fast-track-active');
      
      // Trigger custom event for content restoration
      document.dispatchEvent(new CustomEvent('pf:fast-track-disabled'));
    }
  }

  /**
   * Toggle info tooltip
   */
  function toggleInfoTooltip(event) {
    event.stopPropagation();
    
    if (infoTooltip.hidden) {
      showInfoTooltip();
    } else {
      hideInfoTooltip();
    }
  }

  /**
   * Show info tooltip
   */
  function showInfoTooltip() {
    if (!infoTooltip) return;
    infoTooltip.hidden = false;
  }

  /**
   * Hide info tooltip
   */
  function hideInfoTooltip() {
    if (!infoTooltip) return;
    infoTooltip.hidden = true;
  }


  /**
   * Initialize Step Objectives (add "Read more" buttons)
   */
  function initStepObjectives() {
    const steps = document.querySelectorAll('.pf-step');
    
    steps.forEach(step => {
      // Find objective text
      const objectiveEl = step.querySelector('[class*="objective"]');
      if (!objectiveEl) return;
      
      // Check if it has multiple lines (height > line-height * 1.5)
      const lineHeight = parseInt(window.getComputedStyle(objectiveEl).lineHeight, 10);
      const height = objectiveEl.scrollHeight;
      
      if (height > lineHeight * 1.5) {
        // Add classes and expand button
        objectiveEl.classList.add('pf-objective-text');
        
        // Create wrapper if it doesn't exist
        let wrapper = objectiveEl.closest('.pf-step-objective');
        if (!wrapper) {
          wrapper = document.createElement('div');
          wrapper.className = 'pf-step-objective';
          objectiveEl.parentNode.insertBefore(wrapper, objectiveEl);
          wrapper.appendChild(objectiveEl);
        }
        
        // Add "Read more" button if it doesn't exist
        let expandBtn = wrapper.querySelector('.pf-objective-expand');
        if (!expandBtn) {
          expandBtn = document.createElement('button');
          expandBtn.type = 'button';
          expandBtn.className = 'pf-objective-expand';
          expandBtn.textContent = 'Read more';
          expandBtn.setAttribute('aria-expanded', 'false');
          expandBtn.addEventListener('click', toggleObjective);
          wrapper.appendChild(expandBtn);
        }
      }
    });
    
    console.log('[PF Fast Track] Step objectives initialized');
  }

  /**
   * Toggle step objective expand/collapse
   */
  function toggleObjective(event) {
    event.preventDefault();
    
    const button = event.currentTarget;
    const wrapper = button.closest('.pf-step-objective');
    const text = wrapper.querySelector('.pf-objective-text');
    
    if (!text) return;
    
    const isExpanded = button.getAttribute('aria-expanded') === 'true';
    
    if (isExpanded) {
      text.classList.remove('is-expanded');
      button.setAttribute('aria-expanded', 'false');
      button.textContent = 'Read more';
    } else {
      text.classList.add('is-expanded');
      button.setAttribute('aria-expanded', 'true');
      button.textContent = 'Show less';
    }
  }

  /**
   * Enable Fast Track features
   */
  function enableFastTrackFeatures() {
    console.log('[PF Fast Track] Enabling Fast Track features');
    
    // Expand all steps (remove collapse/accordion behavior)
    expandAllSteps();
  }

  /**
   * Disable Fast Track features
   */
  function disableFastTrackFeatures() {
    console.log('[PF Fast Track] Disabling Fast Track features');
    
    // Restore step accordion behavior
    restoreStepAccordion();
  }

  /**
   * Expand all steps (remove accordion behavior)
   */
  function expandAllSteps() {
    const steps = document.querySelectorAll('.pf-step');
    
    steps.forEach(step => {
      const body = step.querySelector('.pf-step-body');
      if (body) {
        body.style.maxHeight = 'none';
        body.style.overflow = 'visible';
        body.setAttribute('aria-hidden', 'false');
      }
      
      const header = step.querySelector('.pf-step-header');
      if (header) {
        header.setAttribute('aria-expanded', 'true');
      }
    });
  }

  /**
   * Restore step accordion behavior
   */
  function restoreStepAccordion() {
    const steps = document.querySelectorAll('.pf-step');
    
    steps.forEach((step, index) => {
      const body = step.querySelector('.pf-step-body');
      if (body) {
        // Collapse all except first step
        if (index !== 0) {
          body.style.maxHeight = '0';
          body.style.overflow = 'hidden';
          body.setAttribute('aria-hidden', 'true');
        }
      }
      
      const header = step.querySelector('.pf-step-header');
      if (header) {
        header.setAttribute('aria-expanded', index === 0 ? 'true' : 'false');
      }
    });
  }

  /**
   * Check if Fast Track is currently active
   */
  function isActive() {
    return container && container.classList.contains('pf-fast-track-active');
  }

  // ========================================
  // Public API
  // ========================================

  window.PF = window.PF || {};
  window.PF.FastTrack = {
    init,
    isActive,
    showToggle,
    hideToggle,
    applyFastTrackMode
  };

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  console.log('[PF Fast Track] Module loaded');

})();


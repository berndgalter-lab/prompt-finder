/**
 * PF Tracking Init
 * 
 * Automatically tracks workflow visits on page load
 * Must load AFTER tracking.js module
 * 
 * @package Prompt Finder
 * @since 1.8.0
 */

(function() {
  'use strict';

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  async function init() {
    // Check if we're on a workflow page
    const container = document.querySelector('.pf-workflow-container[data-post-id]');
    if (!container) {
      return; // Not a workflow page
    }

    const workflowId = parseInt(container.dataset.postId, 10);
    if (!workflowId || workflowId <= 0) {
      console.warn('[PF Tracking Init] Invalid workflow ID');
      return;
    }

    // Check if tracking module is loaded
    if (typeof window.PF === 'undefined' || typeof window.PF.Tracking === 'undefined') {
      console.error('[PF Tracking Init] Tracking module not loaded');
      return;
    }

    try {
      // Track the visit
      const result = await window.PF.Tracking.trackVisit(workflowId);
      
      if (result) {
        console.log('[PF Tracking Init] Visit tracked:', {
          source: result.source,
          workflowId: result.workflowId,
          visitCount: result.visitCount,
          totalVisits: result.totalVisits,
          thresholdMet: result.thresholdMet,
          ftEnabled: result.ftEnabled
        });

        // If threshold is met but Fast Track is not enabled, show toggle
        if (result.thresholdMet && !result.ftEnabled && !container.classList.contains('pf-fast-track-active')) {
          // Trigger custom event that toggle component can listen to
          document.dispatchEvent(new CustomEvent('pf:threshold-met', {
            detail: { workflowId: result.workflowId }
          }));
        }

        // If Fast Track is enabled, ensure body class is set
        if (result.ftEnabled && !container.classList.contains('pf-fast-track-active')) {
          container.classList.add('pf-fast-track-active');
        }
      }
    } catch (err) {
      console.error('[PF Tracking Init] Failed to track visit:', err);
    }
  }

})();


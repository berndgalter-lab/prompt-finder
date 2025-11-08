/**
 * PF Tracking Module
 * 
 * Handles workflow visit tracking for Fast Track Mode
 * - Anonymous users: LocalStorage
 * - Logged-in users: WordPress User Meta (via REST API)
 * 
 * @package Prompt Finder
 * @since 1.8.0
 */

(function() {
  'use strict';

  // Constants
  const LS_KEY_VISITS = 'pf_workflow_visits';
  const LS_KEY_FT_ENABLED = 'pf_fast_track_enabled';
  const LS_KEY_FT_PREFERENCE = 'pf_fast_track_preference';
  
  const API_BASE = '/wp-json/pf/v1';

  /**
   * Get current user's visit data
   * Returns data from API (logged-in) or LocalStorage (anonymous)
   */
  async function getTrackingData() {
    // Try API first (for logged-in users)
    try {
      const response = await fetch(`${API_BASE}/tracking-data`, {
        method: 'GET',
        credentials: 'same-origin'
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.logged_in) {
          return {
            source: 'api',
            visits: data.visits || {},
            totalVisits: data.total_visits || 0,
            ftEnabled: data.ft_enabled || false,
            ftPreference: data.ft_preference || 'manual'
          };
        }
      }
    } catch (err) {
      console.warn('[PF Tracking] API call failed, using LocalStorage fallback:', err);
    }
    
    // Fallback: LocalStorage (anonymous users)
    return {
      source: 'localStorage',
      visits: getLocalVisits(),
      totalVisits: getTotalLocalVisits(),
      ftEnabled: getLocalFTEnabled(),
      ftPreference: getLocalFTPreference()
    };
  }

  /**
   * Track a workflow visit
   */
  async function trackVisit(workflowId) {
    workflowId = parseInt(workflowId, 10);
    
    if (!workflowId || workflowId <= 0) {
      console.error('[PF Tracking] Invalid workflow ID:', workflowId);
      return null;
    }

    // Try API first (for logged-in users)
    try {
      const response = await fetch(`${API_BASE}/track-visit`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ workflow_id: workflowId })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.tracked !== false) {
          // Successfully tracked via API
          return {
            source: 'api',
            workflowId: workflowId,
            visitCount: data.visit_count,
            totalVisits: data.total_visits,
            thresholdMet: data.threshold_met,
            ftEnabled: data.ft_enabled
          };
        }
      }
    } catch (err) {
      console.warn('[PF Tracking] API tracking failed, using LocalStorage:', err);
    }
    
    // Fallback: LocalStorage (anonymous users)
    const visits = getLocalVisits();
    visits[workflowId] = (visits[workflowId] || 0) + 1;
    localStorage.setItem(LS_KEY_VISITS, JSON.stringify(visits));
    
    const totalVisits = getTotalLocalVisits();
    const thresholdMet = checkLocalThreshold(workflowId);
    
    return {
      source: 'localStorage',
      workflowId: workflowId,
      visitCount: visits[workflowId],
      totalVisits: totalVisits,
      thresholdMet: thresholdMet,
      ftEnabled: getLocalFTEnabled()
    };
  }

  /**
   * Update Fast Track preference
   */
  async function updateFTPreference(enabled, preference = 'manual') {
    // Try API first (logged-in users)
    try {
      const response = await fetch(`${API_BASE}/fast-track-preference`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          enabled: enabled,
          preference: preference
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return { source: 'api', enabled: data.enabled, preference: data.preference };
        }
      }
    } catch (err) {
      console.warn('[PF Tracking] API preference update failed, using LocalStorage:', err);
    }
    
    // Fallback: LocalStorage
    localStorage.setItem(LS_KEY_FT_ENABLED, enabled ? 'true' : 'false');
    localStorage.setItem(LS_KEY_FT_PREFERENCE, preference);
    
    return { source: 'localStorage', enabled: enabled, preference: preference };
  }

  /**
   * Check if Fast Track threshold is met (client-side check for anonymous users)
   */
  function checkLocalThreshold(workflowId) {
    // Get thresholds from data attributes (set by PHP from ACF fields)
    const container = document.querySelector('[data-post-id]');
    if (!container) return false;
    
    const thresholdThis = parseInt(container.dataset.ftTriggerThis || '2', 10);
    const thresholdAny = parseInt(container.dataset.ftTriggerAny || '5', 10);
    
    const visits = getLocalVisits();
    const thisCount = visits[workflowId] || 0;
    const totalCount = getTotalLocalVisits();
    
    // Hybrid logic: THIS workflow ≥ X OR ANY workflow ≥ Y
    return (thisCount >= thresholdThis) || (totalCount >= thresholdAny);
  }

  // ========================================
  // LocalStorage Helper Functions
  // ========================================

  function getLocalVisits() {
    try {
      const raw = localStorage.getItem(LS_KEY_VISITS);
      return raw ? JSON.parse(raw) : {};
    } catch (err) {
      console.error('[PF Tracking] Failed to parse visits from LocalStorage:', err);
      return {};
    }
  }

  function getTotalLocalVisits() {
    const visits = getLocalVisits();
    return Object.values(visits).reduce((sum, count) => sum + count, 0);
  }

  function getLocalFTEnabled() {
    return localStorage.getItem(LS_KEY_FT_ENABLED) === 'true';
  }

  function getLocalFTPreference() {
    const pref = localStorage.getItem(LS_KEY_FT_PREFERENCE);
    return ['auto', 'manual'].includes(pref) ? pref : 'manual';
  }

  // ========================================
  // Public API
  // ========================================

  window.PF = window.PF || {};
  window.PF.Tracking = {
    getTrackingData,
    trackVisit,
    updateFTPreference,
    
    // Exposed for debugging
    _getLocalVisits: getLocalVisits,
    _getTotalLocalVisits: getTotalLocalVisits,
    _checkLocalThreshold: checkLocalThreshold
  };

  console.log('[PF Tracking] Module loaded');

})();


/**
 * Workflow Module: Storage
 * Helper functions for localStorage operations
 */

(function() {
  'use strict';
  
  const WorkflowStorage = {
    
    /**
     * Set a value in localStorage
     * @param {string} key - Storage key
     * @param {any} value - Value to store (will be JSON stringified)
     * @returns {boolean} Success status
     */
    set: function(key, value) {
      try {
        const jsonValue = JSON.stringify(value);
        localStorage.setItem(key, jsonValue);
        return true;
      } catch (error) {
        console.warn('WorkflowStorage: Failed to save to localStorage', error);
        return false;
      }
    },
    
    /**
     * Get a value from localStorage
     * @param {string} key - Storage key
     * @returns {any|null} Parsed value or null
     */
    get: function(key) {
      try {
        const item = localStorage.getItem(key);
        if (item === null) return null;
        return JSON.parse(item);
      } catch (error) {
        console.warn('WorkflowStorage: Failed to read from localStorage', error);
        return null;
      }
    },
    
    /**
     * Remove a specific key from localStorage
     * @param {string} key - Storage key
     * @returns {boolean} Success status
     */
    remove: function(key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        console.warn('WorkflowStorage: Failed to remove from localStorage', error);
        return false;
      }
    },
    
    /**
     * Clear all workflow-related data from localStorage
     * @returns {boolean} Success status
     */
    clear: function() {
      try {
        // Remove all workflow_ prefixed items
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('workflow_')) {
            localStorage.removeItem(key);
          }
        });
        return true;
      } catch (error) {
        console.warn('WorkflowStorage: Failed to clear localStorage', error);
        return false;
      }
    },
    
    /**
     * Get current post ID from page
     * @returns {number|null} Post ID or null
     */
    getPostId: function() {
      // Try body data attribute first
      const body = document.body;
      if (body && body.dataset && body.dataset.postId) {
        return parseInt(body.dataset.postId, 10);
      }
      
      // Try section data attribute
      const section = document.querySelector('.pf-section--variables');
      if (section && section.dataset && section.dataset.postId) {
        return parseInt(section.dataset.postId, 10);
      }
      
      // Try to extract from URL
      const urlMatch = window.location.pathname.match(/\/workflow\/(\d+)/);
      if (urlMatch) {
        return parseInt(urlMatch[1], 10);
      }
      
      console.warn('WorkflowStorage: Could not determine post ID');
      return null;
    },
    
    /**
     * Generate storage key for variables
     * @param {number} postId - Post ID
     * @returns {string} Storage key
     */
    getVariablesKey: function(postId) {
      return 'workflow_variables_' + postId;
    },
    
    /**
     * Generate storage key for steps progress
     * @param {number} postId - Post ID
     * @returns {string} Storage key
     */
    getStepsKey: function(postId) {
      return 'workflow_steps_' + postId;
    },
    
    /**
     * Generate storage key for collapsed states
     * @param {number} postId - Post ID
     * @returns {string} Storage key
     */
    getCollapsedKey: function(postId) {
      return 'workflow_collapsed_' + postId;
    }
  };
  
  // Export for global access
  window.WorkflowStorage = WorkflowStorage;
  
  console.log('WorkflowStorage: Initialized');
  
})();

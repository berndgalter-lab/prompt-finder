/**
 * PromptFinder - Main Workflow System
 * Legacy compatibility and initialization
 */

console.log('PF Workflows: Main system loaded');

// Legacy compatibility - ensure global functions are available
if (typeof window.copyToClipboard === 'undefined') {
    window.copyToClipboard = function(promptElement, button) {
        console.warn('PF Workflows: copyToClipboard called but core module not loaded');
    };
}

// Ensure PF_VARS is available
if (typeof window.PF_VARS === 'undefined') {
    window.PF_VARS = {
        store: {},
        get: function(varName) { return this.store[varName] || ''; },
        set: function(varName, value) { this.store[varName] = value; },
        getAll: function() { return this.store; },
        updateAllPrompts: function() { console.log('PF_VARS: updateAllPrompts called'); }
    };
}

console.log('PF Workflows: Legacy compatibility ensured');
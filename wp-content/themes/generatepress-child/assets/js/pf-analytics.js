/**
 * PromptFinder - Analytics Event Tracking
 * Handles all analytics events and tracking functionality
 */

console.log('PF Analytics: Loading...');

// Analytics Event Tracking System
window.PF_ANALYTICS = {
    trackEvent: function(eventName, data) {
        // Analytics event tracking
        const eventData = {
            event: eventName,
            workflow_id: document.querySelector('.pf-workflows')?.getAttribute('data-workflow-id') || 'unknown',
            timestamp: new Date().toISOString(),
            ...data
        };
        
        // Dispatch custom event for analytics
        document.dispatchEvent(new CustomEvent('pfAnalytics', { 
            detail: eventData 
        }));
        
        // Console log for debugging
        console.log('PF Analytics:', eventData);
        
        // Future: Send to analytics service
        // if (window.gtag) {
        //     gtag('event', eventName, eventData);
        // }
    },
    
    // Specific event tracking functions
    trackModeToggle: function(mode) {
        this.trackEvent('mode_toggled', { mode: mode });
    },
    
    trackJumpClicked: function(action, stepId) {
        this.trackEvent('jump_clicked', { 
            action: action,
            step_id: stepId
        });
    },
    
    trackFirstInputFocused: function(stepId) {
        this.trackEvent('first_input_focused', { 
            step_id: stepId
        });
    },
    
    trackLockedCTAClicked: function(action, href) {
        this.trackEvent('locked_cta_clicked', {
            action: action,
            href: href
        });
    },
    
    trackAccordionOpened: function(section) {
        this.trackEvent('accordion_opened', {
            section: section
        });
    },
    
    trackStepAnchorNavigated: function(stepId) {
        this.trackEvent('step_anchor_navigated', {
            step_id: stepId
        });
    }
};

console.log('PF Analytics: Loaded successfully');

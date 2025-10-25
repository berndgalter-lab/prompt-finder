/**
 * PromptFinder - Learn/Use Mode Toggle System
 * Handles mode switching, sticky quickbar, and mode-specific functionality
 */

console.log('PF Learn/Use Mode: Loading...');

// Learn/Use Mode Toggle System
window.PF_MODE = {
    current: 'learn',
    
    init: function() {
        console.log('PF Learn/Use Mode: Initializing mode toggle system');
        
        // Load saved preference
        const savedMode = localStorage.getItem('pf_mode_preference');
        if (savedMode && (savedMode === 'learn' || savedMode === 'use')) {
            this.current = savedMode;
        }
        
        // Set initial mode
        this.setMode(this.current);
        
        // Bind toggle events
        this.bindToggleEvents();
        
        // Bind scroll to first step
        this.bindScrollToFirstStep();
        
        // Bind quickbar actions
        this.bindQuickbarActions();
        
        // Bind analytics events
        this.bindAnalyticsEvents();
    },
    
    setMode: function(mode) {
        console.log('PF Learn/Use Mode: Switching to', mode, 'mode');
        
        const workflow = document.querySelector('.pf-workflows');
        const learnContent = document.querySelectorAll('.pf-learn-content');
        const useContent = document.querySelectorAll('.pf-use-content');
        const stickyQuickbar = document.querySelector('.pf-sticky-quickbar');
        const toggleLearn = document.querySelector('.pf-toggle-learn');
        const toggleUse = document.querySelector('.pf-toggle-use');
        
        if (!workflow) return;
        
        // Update data attribute
        workflow.setAttribute('data-mode', mode);
        
        // Show/hide content
        learnContent.forEach(function(element) {
            element.style.display = mode === 'learn' ? 'block' : 'none';
        });
        
        useContent.forEach(function(element) {
            element.style.display = mode === 'use' ? 'block' : 'none';
        });
        
        // Show/hide sticky quickbar in Use mode
        if (stickyQuickbar) {
            stickyQuickbar.style.display = mode === 'use' ? 'block' : 'none';
        }
        
        // Update toggle buttons
        if (toggleLearn && toggleUse) {
            toggleLearn.classList.toggle('active', mode === 'learn');
            toggleUse.classList.toggle('active', mode === 'use');
        }
        
        // Save preference
        localStorage.setItem('pf_mode_preference', mode);
        this.current = mode;
        
        // Trigger custom event
        document.dispatchEvent(new CustomEvent('pfModeChanged', { 
            detail: { mode: mode } 
        }));
        
        // Analytics event
        if (window.PF_ANALYTICS) {
            window.PF_ANALYTICS.trackEvent('mode_toggled', { mode: mode });
        }
    },
    
    bindToggleEvents: function() {
        const toggleButtons = document.querySelectorAll('.pf-toggle-btn');
        
        toggleButtons.forEach(function(button) {
            button.addEventListener('click', function() {
                const mode = this.getAttribute('data-mode');
                if (mode && (mode === 'learn' || mode === 'use')) {
                    window.PF_MODE.setMode(mode);
                }
            });
        });
    },
    
    bindScrollToFirstStep: function() {
        const scrollButtons = document.querySelectorAll('[data-action="scroll-to-first-step"]');
        
        scrollButtons.forEach(function(button) {
            button.addEventListener('click', function() {
                const firstStep = document.querySelector('.pf-step');
                if (firstStep) {
                    firstStep.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                    });
                    
                    // Focus first input after scroll completes
                    setTimeout(function() {
                        const firstInput = firstStep.querySelector('input[data-var-name]');
                        if (firstInput) {
                            firstInput.focus();
                            // Analytics event
                            if (window.PF_ANALYTICS) {
                                window.PF_ANALYTICS.trackEvent('first_input_focused', { 
                                    step_id: firstStep.getAttribute('data-step-id') || 'step-1'
                                });
                            }
                        }
                    }, 500);
                    
                    // Analytics event
                    if (window.PF_ANALYTICS) {
                        window.PF_ANALYTICS.trackEvent('jump_clicked', { 
                            action: 'scroll_to_first_step',
                            step_id: firstStep.getAttribute('data-step-id') || 'step-1'
                        });
                    }
                }
            });
        });
    },
    
    bindQuickbarActions: function() {
        // Bind step navigation toggle
        const stepNavButtons = document.querySelectorAll('[data-action="show-step-navigation"]');
        stepNavButtons.forEach(function(button) {
            button.addEventListener('click', function() {
                // Toggle step list visibility or show step navigation
                const stepsList = document.querySelector('.pf-steps');
                if (stepsList) {
                    stepsList.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                    });
                }
            });
        });
    },
    
    bindAnalyticsEvents: function() {
        // Track accordion/collapsible opens
        const collapsibles = document.querySelectorAll('.pf-collapsible');
        collapsibles.forEach(function(collapsible) {
            collapsible.addEventListener('toggle', function() {
                if (this.open && window.PF_ANALYTICS) {
                    window.PF_ANALYTICS.trackEvent('accordion_opened', {
                        section: this.className.replace('pf-collapsible ', '')
                    });
                }
            });
        });
        
        // Track locked CTA clicks
        const lockedCTAs = document.querySelectorAll('.pf-step-cta a');
        lockedCTAs.forEach(function(cta) {
            cta.addEventListener('click', function() {
                if (window.PF_ANALYTICS) {
                    window.PF_ANALYTICS.trackEvent('locked_cta_clicked', {
                        action: this.textContent.trim(),
                        href: this.href
                    });
                }
            });
        });
        
        // Track step anchor navigation
        const stepAnchors = document.querySelectorAll('a[href^="#step-"]');
        stepAnchors.forEach(function(anchor) {
            anchor.addEventListener('click', function() {
                const stepId = this.href.split('#')[1];
                if (window.PF_ANALYTICS) {
                    window.PF_ANALYTICS.trackEvent('step_anchor_navigated', {
                        step_id: stepId
                    });
                }
            });
        });
    }
};

// Initialize mode system when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        window.PF_MODE.init();
    });
} else {
    window.PF_MODE.init();
}

console.log('PF Learn/Use Mode: Loaded successfully');

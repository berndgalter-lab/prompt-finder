/**
 * PromptFinder - Navigation Functions
 * Additional navigation and scroll functionality
 */

console.log('PF Navigation: Loading...');

// Navigation System
window.PF_NAVIGATION = {
    // Smooth scroll to element with offset
    scrollToElement: function(element, offset = 80) {
        if (!element) return;
        
        const elementPosition = element.offsetTop - offset;
        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        });
    },
    
    // Scroll to step by ID
    scrollToStep: function(stepId) {
        const stepElement = document.getElementById(stepId) || document.querySelector(`[data-step-id="${stepId}"]`);
        if (stepElement) {
            this.scrollToElement(stepElement);
            
            // Analytics tracking
            if (window.PF_ANALYTICS) {
                window.PF_ANALYTICS.trackStepAnchorNavigated(stepId);
            }
        }
    },
    
    // Get current step from scroll position
    getCurrentStep: function() {
        const steps = document.querySelectorAll('.pf-step');
        let currentStep = null;
        
        steps.forEach(function(step) {
            const rect = step.getBoundingClientRect();
            if (rect.top <= 100 && rect.bottom >= 100) {
                currentStep = step;
            }
        });
        
        return currentStep;
    },
    
    // Update progress indicator
    updateProgress: function() {
        const currentStep = this.getCurrentStep();
        const progressElement = document.querySelector('.pf-quickbar-progress-text');
        
        if (currentStep && progressElement) {
            const stepId = currentStep.getAttribute('data-step-id') || currentStep.id;
            progressElement.textContent = `Currently on: ${stepId}`;
        }
    },
    
    // Initialize scroll spy
    initScrollSpy: function() {
        let ticking = false;
        
        const updateScrollSpy = () => {
            this.updateProgress();
            ticking = false;
        };
        
        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollSpy);
                ticking = true;
            }
        };
        
        window.addEventListener('scroll', requestTick);
    },
    
    // Initialize navigation
    init: function() {
        console.log('PF Navigation: Initializing...');
        
        // Initialize scroll spy
        this.initScrollSpy();
        
        // Bind hash change events
        window.addEventListener('hashchange', (event) => {
            const hash = event.newURL.split('#')[1];
            if (hash && hash.startsWith('step-')) {
                this.scrollToStep(hash);
            }
        });
        
        console.log('PF Navigation: Initialized successfully');
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        window.PF_NAVIGATION.init();
    });
} else {
    window.PF_NAVIGATION.init();
}

console.log('PF Navigation: Loaded successfully');
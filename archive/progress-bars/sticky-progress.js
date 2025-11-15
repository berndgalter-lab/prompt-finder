/**
 * Dateiname: sticky-progress.js
 * Zweck: Sticky progress bar that appears when scrolling
 * Genutzt in: single-workflows.php
 * Letzte Änderung: 2025-11-09
 */

(function() {
    'use strict';

    // Configuration
    const SCROLL_THRESHOLD = 200; // Show sticky bar after scrolling 200px
    const DEBOUNCE_DELAY = 10;

    // State
    let stickyBar = null;
    let isVisible = false;
    let ticking = false;

    /**
     * Initialize sticky progress bar
     */
    function init() {
        stickyBar = document.querySelector('[data-sticky-progress]');
        
        if (!stickyBar) {
            return;
        }

        // Listen to scroll events
        window.addEventListener('scroll', handleScroll, { passive: true });

        // Listen to progress updates from main workflow script
        document.addEventListener('pf:progress:update', handleProgressUpdate);
        document.addEventListener('pf:inputs:update', handleInputsUpdate);

        // Initial check
        checkScrollPosition();
    }

    /**
     * Handle scroll events with RAF throttling
     */
    function handleScroll() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                checkScrollPosition();
                ticking = false;
            });
            ticking = true;
        }
    }

    /**
     * Check scroll position and toggle sticky bar
     */
    function checkScrollPosition() {
        const scrollY = window.scrollY || window.pageYOffset;
        const shouldShow = scrollY > SCROLL_THRESHOLD;

        if (shouldShow !== isVisible) {
            isVisible = shouldShow;
            toggleStickyBar(shouldShow);
        }
    }

    /**
     * Toggle sticky bar visibility
     * @param {boolean} show - Whether to show the bar
     */
    function toggleStickyBar(show) {
        if (!stickyBar) return;

        if (show) {
            stickyBar.classList.add('is-visible');
            stickyBar.setAttribute('aria-hidden', 'false');
        } else {
            stickyBar.classList.remove('is-visible');
            stickyBar.setAttribute('aria-hidden', 'true');
        }
    }

    /**
     * Handle progress updates from main workflow
     * @param {CustomEvent} event - Progress update event
     */
    function handleProgressUpdate(event) {
        if (!stickyBar) return;

        const { currentStep, totalSteps, progressPercent } = event.detail;

        // Update step text
        const stepText = stickyBar.querySelector('[data-sticky-step]');
        if (stepText) {
            stepText.textContent = `Step ${currentStep}/${totalSteps}`;
        }

        // Update progress bar
        const progressFill = stickyBar.querySelector('[data-sticky-fill]');
        const progressBar = progressFill?.parentElement;
        
        if (progressFill && progressBar) {
            progressFill.style.width = `${progressPercent}%`;
            progressBar.setAttribute('aria-valuenow', progressPercent);
        }
    }

    /**
     * Handle input completion updates
     * @param {CustomEvent} event - Input update event
     */
    function handleInputsUpdate(event) {
        if (!stickyBar) return;

        const { filledCount, totalCount } = event.detail;

        // Update inputs text
        const inputsText = stickyBar.querySelector('[data-sticky-inputs]');
        if (inputsText) {
            inputsText.textContent = `${filledCount}/${totalCount}`;
        }
    }

    /**
     * Cleanup on page unload
     */
    function cleanup() {
        window.removeEventListener('scroll', handleScroll);
        document.removeEventListener('pf:progress:update', handleProgressUpdate);
        document.removeEventListener('pf:inputs:update', handleInputsUpdate);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', cleanup);

})();


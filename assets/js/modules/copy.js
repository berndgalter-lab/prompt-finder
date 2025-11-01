/**
 * Workflow Module: Copy
 * Handles copy to clipboard functionality
 */

(function() {
  'use strict';
  
  // Create aria-live region for screen reader announcements
  let liveRegion = null;
  
  function createLiveRegion() {
    if (liveRegion) return liveRegion;
    
    liveRegion = document.getElementById('pf-live');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'pf-live';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'pf-sr-only';
      document.body.appendChild(liveRegion);
    }
    return liveRegion;
  }
  
  function announce(message) {
    const live = createLiveRegion();
    // Clear previous message
    live.textContent = '';
    // Set new message after small delay to ensure screen reader picks it up
    setTimeout(() => {
      live.textContent = message;
    }, 10);
  }
  
  const WorkflowCopy = {
    
    /**
     * Initialize the copy module
     */
    init: function() {
      // Create aria-live region
      createLiveRegion();
      
      this.setupCopyButtons();
      this.setupActionButtons();
      console.log('WorkflowCopy: Initialized');
    },
    
    /**
     * Setup copy button listeners
     */
    setupCopyButtons: function() {
      const copyButtons = document.querySelectorAll('[data-copy-target]');
      
      copyButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          
          const targetId = button.dataset.copyTarget;
          const targetElement = document.querySelector('[data-prompt-id="' + targetId + '"]');
          
          if (!targetElement) {
            console.warn('WorkflowCopy: Target element not found for', targetId);
            return;
          }
          
          // Get text content (without HTML tags)
          const textToCopy = this.getTextContent(targetElement);
          
          this.copyToClipboard(textToCopy, button);
        });
      });
    },
    
    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @param {HTMLElement} button - Button element for feedback
     */
    copyToClipboard: function(text, button) {
      // Try modern Clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text)
          .then(() => {
            this.showFeedback(button);
            announce('Copied to clipboard.');
            console.log('WorkflowCopy: Successfully copied to clipboard');
          })
          .catch(err => {
            console.error('WorkflowCopy: Clipboard API failed', err);
            this.fallbackCopy(text, button);
          });
      } else {
        // Fallback to older method
        this.fallbackCopy(text, button);
      }
    },
    
    /**
     * Fallback copy method (for older browsers or non-secure contexts)
     * @param {string} text - Text to copy
     * @param {HTMLElement} button - Button element for feedback
     */
    fallbackCopy: function(text, button) {
      // Create temporary textarea
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-999999px';
      textarea.style.top = '-999999px';
      document.body.appendChild(textarea);
      
      try {
        textarea.focus();
        textarea.select();
        const successful = document.execCommand('copy');
        
        if (successful) {
          this.showFeedback(button);
          announce('Copied to clipboard.');
          console.log('WorkflowCopy: Successfully copied using fallback method');
        } else {
          throw new Error('execCommand failed');
        }
      } catch (err) {
        console.error('WorkflowCopy: Copy failed', err);
        alert('Copy failed. Please select and copy manually.');
      } finally {
        document.body.removeChild(textarea);
      }
    },
    
    /**
     * Get plain text content from element (removes HTML)
     * @param {HTMLElement} element - Element to get text from
     * @returns {string} Plain text content
     */
    getTextContent: function(element) {
      // Clone the element to avoid modifying the original
      const clone = element.cloneNode(true);
      
      // Remove spans with injected variables to get clean prompt
      clone.querySelectorAll('.pf-var-injected, .pf-var-empty').forEach(span => {
        const parent = span.parentNode;
        parent.replaceChild(document.createTextNode(span.textContent), span);
      });
      
      return clone.textContent || clone.innerText || '';
    },
    
    /**
     * Show visual feedback on button
     * @param {HTMLElement} button - Button element
     */
    showFeedback: function(button) {
      // Add class for CSS ::after styling
      button.classList.add('is-copied');
      
      // Set aria-live for screen reader feedback
      button.setAttribute('aria-live', 'polite');
      
      // Set data-feedback for temporary visual feedback
      button.dataset.feedback = 'Copied';
      
      // Announce to screen readers
      announce('Copied to clipboard.');
      
      // Remove feedback after 1.5 seconds
      setTimeout(() => {
        button.classList.remove('is-copied');
        button.removeAttribute('aria-live');
        delete button.dataset.feedback;
      }, 1500);
    },
    
    /**
     * Setup action buttons (Favorite, Share, Reset)
     */
    setupActionButtons: function() {
      // Favorite button
      const favoriteBtn = document.querySelector('.pf-action-btn--favorite');
      if (favoriteBtn) {
        // Initialize aria-pressed if not already set
        if (!favoriteBtn.hasAttribute('aria-pressed')) {
          favoriteBtn.setAttribute('aria-pressed', 'false');
        }
        
        favoriteBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.handleFavorite(favoriteBtn);
        });
      }
      
      // Share button
      const shareBtn = document.querySelector('.pf-action-btn--share');
      if (shareBtn) {
        shareBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.handleShare(shareBtn);
        });
      }
      
      // Reset button - handled by progress.js, but ensure it also triggers updateProgress()
      const resetBtn = document.querySelector('[data-action="reset-progress"]');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          // Progress.js handles the reset, but we ensure updateProgress() is called
          setTimeout(() => {
            if (window.WorkflowProgress && window.WorkflowProgress.update) {
              window.WorkflowProgress.update();
            }
          }, 100);
        });
      }
    },
    
    /**
     * Handle favorite button click
     * @param {HTMLElement} button - Favorite button element
     */
    handleFavorite: function(button) {
      const isPressed = button.getAttribute('aria-pressed') === 'true';
      const newState = !isPressed;
      
      // Toggle aria-pressed
      button.setAttribute('aria-pressed', String(newState));
      
      // Update aria-label
      const label = newState ? 'Remove from favorites' : 'Add to favorites';
      button.setAttribute('aria-label', label);
      
      // TODO: Implement actual favorite functionality (AJAX call, localStorage, etc.)
      console.log('WorkflowCopy: Favorite toggled to', newState);
    },
    
    /**
     * Handle share button click
     * @param {HTMLElement} button - Share button element
     */
    handleShare: function(button) {
      // Try native Web Share API first
      if (navigator.share) {
        navigator.share({
          title: document.title,
          url: window.location.href
        })
        .then(() => {
          console.log('WorkflowCopy: Successfully shared');
        })
        .catch(err => {
          // User cancelled or share failed, fall back to clipboard
          if (err.name !== 'AbortError') {
            this.copyUrlToClipboard(button);
          }
        });
      } else {
        // Fallback: Copy URL to clipboard
        this.copyUrlToClipboard(button);
      }
    },
    
    /**
     * Copy URL to clipboard and show feedback
     * @param {HTMLElement} button - Button element (usually share button)
     */
    copyUrlToClipboard: function(button) {
      const url = window.location.href;
      
      // Use the same copy logic as prompt copy
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(url)
          .then(() => {
            // Show feedback using the same mechanism as copy button
            this.showFeedback(button);
            announce('Link copied to clipboard.');
          })
          .catch(() => {
            // Fallback to execCommand
            this.fallbackCopy(url, button);
          });
      } else {
        this.fallbackCopy(url, button);
      }
    }
  };
  
  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      WorkflowCopy.init();
    });
  } else {
    WorkflowCopy.init();
  }
  
  // Export for global access
  window.WorkflowCopy = WorkflowCopy;
  
})();

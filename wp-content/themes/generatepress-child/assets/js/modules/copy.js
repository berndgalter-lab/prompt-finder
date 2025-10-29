/**
 * Workflow Module: Copy
 * Handles copy to clipboard functionality
 */

(function() {
  'use strict';
  
  const WorkflowCopy = {
    
    /**
     * Initialize the copy module
     */
    init: function() {
      this.setupCopyButtons();
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
      const originalHTML = button.innerHTML;
      const originalText = button.textContent.trim();
      
      // Change button
      button.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Copied!';
      button.classList.add('is-copied');
      
      // Reset after 2 seconds
      setTimeout(() => {
        button.innerHTML = originalHTML;
        button.classList.remove('is-copied');
      }, 2000);
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

/**
 * PromptFinder - Core Functionality
 * Variable System, Copy Functions, and Basic Initialization
 */

console.log('PF Core: Loading...');

// Simple global variable store
window.PF_VARS = {
    store: {},
    
    get: function(varName) {
        return this.store[varName] || '';
    },
    
    set: function(varName, value) {
        console.log('PF Core: Setting variable', varName, '=', value);
        this.store[varName] = value;
        console.log('PF Core: Store after set:', this.store);
        this.updateAllPrompts();
    },
    
    getAll: function() {
        return this.store;
    },
    
    updateAllPrompts: function() {
        console.log('PF Core: updateAllPrompts called with vars:', this.store);
        
        const promptTextareas = document.querySelectorAll('[data-prompt-template]');
        console.log('PF Core: Found', promptTextareas.length, 'prompt textareas');
        
        if (promptTextareas.length === 0) {
            console.warn('PF Core: No textareas found with data-prompt-template attribute');
            return;
        }
        
        promptTextareas.forEach(function(textarea) {
            let baseTemplate = textarea.getAttribute('data-base');
            
            // Fallback: Use current value if data-base is missing
            if (!baseTemplate) {
                baseTemplate = textarea.value;
                console.log('PF Core: Using textarea value as template fallback');
            }
            
            if (!baseTemplate) {
                console.warn('PF Core: Textarea has no template or value');
                return;
            }
            
            let updatedPrompt = baseTemplate;
            
            // Replace all {variable} patterns
            const variablePattern = /\{([^}]+)\}/g;
            let match;
            
            console.log('PF Core: Processing template:', baseTemplate);
            
            while ((match = variablePattern.exec(baseTemplate)) !== null) {
                const varName = match[1].trim().toLowerCase().replace(/[{}]/g, ''); // Normalize: trim + lowercase + remove {}
                const varValue = window.PF_VARS.get(varName);
                
                console.log('PF Core: Found placeholder:', match[1], '-> normalized:', varName, 'value:', varValue);
                
                // Only replace if we have a value, otherwise keep placeholder visible
                if (varValue && varValue.trim() !== '') {
                    console.log('PF Core: Replacing', match[1], '->', varName, 'with', varValue);
                    // Wrap the replaced value with a span for highlighting
                    const highlightedValue = `<span class="pf-variable-highlight">${varValue}</span>`;
                    updatedPrompt = updatedPrompt.replace(match[0], highlightedValue);
                } else {
                    console.log('PF Core: Keeping placeholder visible:', match[1], '(no value yet)');
                }
            }
            
            textarea.innerHTML = updatedPrompt;
            console.log('PF Core: Updated textarea');
        });
    }
};

console.log('PF Core: Variable store initialized');

// Copy function functionality
function initCopyButtons() {
    const copyButtons = document.querySelectorAll('[data-action="copy-prompt"]');
    console.log('PF Core: Found', copyButtons.length, 'copy buttons');
    
    copyButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            // Find the prompt element in the same step
            const step = this.closest('.pf-step');
            const promptElement = step ? step.querySelector('[data-prompt-template]') : null;
            
            if (promptElement) {
                copyToClipboard(promptElement, this);
            } else {
                console.warn('PF Core: No prompt element found for copy button');
            }
        });
    });
}

// Enhanced copy function with button feedback
function copyToClipboard(promptElement, button) {
    if (!promptElement) return;
    
    // Get the text content (without HTML tags)
    const textContent = promptElement.textContent || promptElement.innerText;
    
    // Use modern clipboard API if available
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(textContent).then(function() {
            showCopyFeedback(button);
        }).catch(function(err) {
            console.warn('PF Core: Clipboard API failed:', err);
            fallbackCopy(textContent, button);
        });
    } else {
        fallbackCopy(textContent, button);
    }
}

function fallbackCopy(text, button) {
    // Create a temporary textarea for copying
    const tempTextarea = document.createElement('textarea');
    tempTextarea.value = text;
    tempTextarea.style.position = 'fixed';
    tempTextarea.style.opacity = '0';
    document.body.appendChild(tempTextarea);
    
    try {
        tempTextarea.select();
        tempTextarea.setSelectionRange(0, 99999);
        const successful = document.execCommand('copy');
        if (successful) {
            showCopyFeedback(button);
        } else {
            console.warn('PF Core: Copy command failed');
        }
    } catch (err) {
        console.warn('PF Core: Copy failed:', err);
    } finally {
        document.body.removeChild(tempTextarea);
    }
}

function showCopyFeedback(button) {
    const originalText = button.textContent;
    button.textContent = 'Copied!';
    button.style.backgroundColor = 'var(--pf-success)';
    button.style.color = 'white';
    
    setTimeout(function() {
        button.textContent = originalText;
        button.style.backgroundColor = '';
        button.style.color = '';
    }, 2000);
}

// Core initialization function
function initPFCore() {
    console.log('PF Core: Initializing...');
    
    // Initialize variable inputs
    const variableInputs = document.querySelectorAll('input[data-var-name]');
    console.log('PF Core: Found', variableInputs.length, 'variable inputs');
    
    variableInputs.forEach(function(input) {
        const varName = input.getAttribute('data-var-name');
        const normalizedVarName = varName ? varName.trim().toLowerCase().replace(/[{}]/g, '') : '';
        
        if (!normalizedVarName) {
            console.warn('PF Core: Input without valid data-var-name:', input);
            return;
        }
        
        console.log('PF Core: Setting up input for variable:', varName, '->', normalizedVarName);
        
        input.addEventListener('input', function() {
            console.log('PF Core: Variable changed:', normalizedVarName, '=', input.value);
            window.PF_VARS.set(normalizedVarName, input.value);
        });
        
        // Also listen for keyup to catch all changes
        input.addEventListener('keyup', function() {
            console.log('PF Core: Variable keyup:', normalizedVarName, '=', input.value);
            window.PF_VARS.set(normalizedVarName, input.value);
        });
    });
    
    // Initialize copy buttons
    initCopyButtons();
    
    console.log('PF Core: Initialization complete');
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPFCore);
} else {
    initPFCore();
}

console.log('PF Core: Loaded successfully');

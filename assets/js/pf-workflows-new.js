/**
 * Workflow Frontend JavaScript - NEW VERSION
 * Main JS File - Imports all modules
 */

(function() {
  'use strict';
  
  // Import modules (will be loaded via separate files)
  // - navigation.js
  // - progress.js
  // - variables.js
  // - steps.js
  // - storage.js
  // - copy.js
  // - keyboard.js
  
  console.log('🚀 Workflow Frontend loading...');
  
  // Init on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  function init() {
    console.log('✅ Workflow Frontend initialized');
    console.log('📦 Modules loaded:', {
      storage: typeof window.WorkflowStorage !== 'undefined',
      navigation: typeof window.WorkflowNavigation !== 'undefined',
      variables: typeof window.WorkflowVariables !== 'undefined',
      steps: typeof window.WorkflowSteps !== 'undefined',
      copy: typeof window.WorkflowCopy !== 'undefined',
      progress: typeof window.WorkflowProgress !== 'undefined'
    });
  }
  
})();


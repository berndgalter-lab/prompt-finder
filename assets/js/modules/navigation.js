/**
 * Workflow Module: Navigation
 * Handles smooth scrolling, active state tracking, and mobile toggle
 */

(function() {
  'use strict';
  
  const WorkflowNavigation = {
    
    // DOM Elements
    sidebar: null,
    toggle: null,
    links: [],
    sections: [],
    
    // State
    currentSection: null,
    isScrolling: false,
    
    /**
     * Initialize the navigation module
     */
    init: function() {
      this.sidebar = document.querySelector('.pf-workflow-sidebar');
      this.toggle = document.querySelector('.pf-sidebar-toggle');
      this.links = document.querySelectorAll('.pf-sidebar-link');
      
      if (!this.sidebar || this.links.length === 0) {
        console.warn('WorkflowNavigation: Required elements not found');
        return;
      }
      
      // Setup event listeners
      this.setupLinks();
      this.setupToggle();
      this.setupScrollListener();
      
      console.log('WorkflowNavigation: Initialized successfully');
    },
    
    /**
     * Setup click handlers for navigation links
     */
    setupLinks: function() {
      this.links.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          
          const href = link.getAttribute('href');
          if (!href || !href.startsWith('#')) return;
          
          const targetId = href.substring(1);
          const targetElement = document.getElementById(targetId);
          
          if (targetElement) {
            this.scrollToSection(targetElement);
            this.updateActiveLink(link);
            this.closeMobileSidebar();
          }
        });
      });
    },
    
    /**
     * Setup mobile toggle button
     */
    setupToggle: function() {
      if (!this.toggle) return;
      
      this.toggle.addEventListener('click', () => {
        this.toggleSidebar();
      });
      
      // Close sidebar when clicking outside (mobile only)
      document.addEventListener('click', (e) => {
        if (window.innerWidth >= 1024) return;
        
        if (this.sidebar && this.sidebar.classList.contains('is-open')) {
          const isClickInsideSidebar = this.sidebar.contains(e.target);
          const isClickOnToggle = this.toggle.contains(e.target);
          
          if (!isClickInsideSidebar && !isClickOnToggle) {
            this.closeMobileSidebar();
          }
        }
      });
    },
    
    /**
     * Setup scroll listener for active state
     */
    setupScrollListener: function() {
      let ticking = false;
      
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            this.updateActiveSection();
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
      
      // Initial check
      this.updateActiveSection();
    },
    
    /**
     * Scroll to a section with offset
     */
    scrollToSection: function(element) {
      const headerOffset = 104; // Height of sticky header (including progress bar)
      const elementPosition = element.offsetTop;
      const offsetPosition = elementPosition - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    },
    
    /**
     * Update active link based on current scroll position
     */
    updateActiveSection: function() {
      if (this.isScrolling) return;
      
      const headerOffset = 104;
      const scrollY = window.scrollY + headerOffset;
      
      // Find which section is currently visible
      const sections = document.querySelectorAll('[data-section], [id^="step-"]');
      let currentSection = null;
      
      sections.forEach((section, index) => {
        const top = section.offsetTop;
        const bottom = top + section.offsetHeight;
        
        if (scrollY >= top && scrollY < bottom) {
          currentSection = section;
        }
      });
      
      if (currentSection && currentSection !== this.currentSection) {
        this.currentSection = currentSection;
        this.updateActiveLinkForSection(currentSection);
      }
    },
    
    /**
     * Update active state of navigation link
     */
    updateActiveLink: function(activeLink) {
      this.links.forEach(link => link.classList.remove('active'));
      if (activeLink) {
        activeLink.classList.add('active');
      }
    },
    
    /**
     * Find and update the link for the current section
     */
    updateActiveLinkForSection: function(section) {
      const sectionId = section.getAttribute('id');
      if (!sectionId) return;
      
      const correspondingLink = Array.from(this.links).find(link => {
        const href = link.getAttribute('href');
        return href && href === `#${sectionId}`;
      });
      
      if (correspondingLink) {
        this.updateActiveLink(correspondingLink);
      }
    },
    
    /**
     * Toggle sidebar (mobile)
     */
    toggleSidebar: function() {
      if (!this.sidebar || !this.toggle) return;
      
      const isOpen = this.sidebar.classList.contains('is-open');
      
      if (isOpen) {
        this.closeMobileSidebar();
      } else {
        this.openMobileSidebar();
      }
    },
    
    /**
     * Open sidebar (mobile)
     */
    openMobileSidebar: function() {
      if (!this.sidebar || !this.toggle) return;
      
      this.sidebar.classList.add('is-open');
      this.toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    },
    
    /**
     * Close sidebar (mobile)
     */
    closeMobileSidebar: function() {
      if (!this.sidebar || !this.toggle) return;
      
      this.sidebar.classList.remove('is-open');
      this.toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  };
  
  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      WorkflowNavigation.init();
    });
  } else {
    WorkflowNavigation.init();
  }
  
  // Export for global access
  window.WorkflowNavigation = WorkflowNavigation;
  
})();

/**
 * BINA AI - Accessible Website Scripts
 * Enhanced with accessibility features and smooth interactions
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize all features
  initSmoothScrolling();
  initCardAnimations();
  initAccessibilityFeatures();
  initKeyboardNavigation();
  enhanceTableAccessibility();
});

/**
 * Smooth scrolling for anchor links
 */
function initSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));

      if (target) {
        // Announce to screen readers
        const announcement = `Navigating to ${target.querySelector('h2, h3, h4, h5, h6')?.textContent || 'section'}`;
        announceToScreenReader(announcement);

        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });

        // Set focus to target for keyboard users
        target.setAttribute('tabindex', '-1');
        target.focus();

        // Remove tabindex after focus
        setTimeout(() => {
          target.removeAttribute('tabindex');
        }, 1000);
      }
    });
  });
}

/**
 * Card animations with intersection observer
 */
function initCardAnimations() {
  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    return; // Skip animations if user prefers reduced motion
  }

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';

        // Add a slight delay for staggered animation
        const delay = Array.from(entry.target.parentNode.children).indexOf(entry.target) * 100;
        entry.target.style.transitionDelay = `${delay}ms`;

        // Unobserve after animation
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe benefit cards and other animated elements
  document.querySelectorAll('.benefit-card, .links-section').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
  });
}

/**
 * Enhanced accessibility features
 */
function initAccessibilityFeatures() {
  // Enhance table accessibility
  enhanceTableAccessibility();

  // Add ARIA labels to interactive elements
  enhanceARIALabels();

  // Handle focus management
  improveFocusManagement();
}

/**
 * Enhance table accessibility and responsive features
 */
function enhanceTableAccessibility() {
  const tableWrapper = document.querySelector('.table-wrapper');
  const table = document.querySelector('.comparison-table');

  if (tableWrapper && table) {
    // Add ARIA attributes for accessibility
    tableWrapper.setAttribute('role', 'region');
    tableWrapper.setAttribute('aria-label', 'Tabel perbandingan fitur BINA AI');
    tableWrapper.setAttribute('tabindex', '0');

    // Add scroll indicators and keyboard support
    tableWrapper.addEventListener('keydown', function(e) {
      const scrollStep = 50;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.scrollLeft -= scrollStep;
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.scrollLeft += scrollStep;
      } else if (e.key === 'Home') {
        e.preventDefault();
        this.scrollLeft = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        this.scrollLeft = this.scrollWidth - this.clientWidth;
      }
    });

    // Add visual feedback for scroll position
    function updateScrollIndicator() {
      const isAtStart = tableWrapper.scrollLeft === 0;
      const isAtEnd = tableWrapper.scrollLeft >= (tableWrapper.scrollWidth - tableWrapper.clientWidth - 5);

      tableWrapper.classList.toggle('scroll-start', isAtStart);
      tableWrapper.classList.toggle('scroll-end', isAtEnd);
    }

    tableWrapper.addEventListener('scroll', updateScrollIndicator);
    updateScrollIndicator(); // Initial check

    // Add focus management for table cells
    const tableCells = table.querySelectorAll('th, td');
    tableCells.forEach(cell => {
      cell.addEventListener('focus', function() {
        // Ensure the focused cell is visible
        const cellRect = this.getBoundingClientRect();
        const wrapperRect = tableWrapper.getBoundingClientRect();

        if (cellRect.left < wrapperRect.left) {
          tableWrapper.scrollLeft -= (wrapperRect.left - cellRect.left + 10);
        } else if (cellRect.right > wrapperRect.right) {
          tableWrapper.scrollLeft += (cellRect.right - wrapperRect.right + 10);
        }
      });
    });
  }
}

/**
 * Add screen reader only class for captions
 */
function addScreenReaderOnlyStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Enhance ARIA labels
 */
function enhanceARIALabels() {
  // Add ARIA labels to benefit cards
  document.querySelectorAll('.benefit-card').forEach((card, index) => {
    const title = card.querySelector('h4')?.textContent;
    if (title) {
      card.setAttribute('aria-labelledby', `benefit-title-${index}`);
      card.querySelector('h4').id = `benefit-title-${index}`;
    }
  });

  // Enhance video container
  const videoContainer = document.querySelector('.video-container');
  if (videoContainer) {
    videoContainer.setAttribute('role', 'region');
    videoContainer.setAttribute('aria-label', 'BINA AI demonstration video');
  }

  // Add landmarks
  const header = document.querySelector('header');
  if (header) {
    header.setAttribute('role', 'banner');
  }

  const footer = document.querySelector('footer');
  if (footer) {
    footer.setAttribute('role', 'contentinfo');
  }
}

/**
 * Improve focus management
 */
function improveFocusManagement() {
  // Enhance focus indicators for custom elements
  document.querySelectorAll('.benefit-card, .cta-button').forEach(element => {
    element.addEventListener('focus', function() {
      this.setAttribute('data-focused', 'true');
    });

    element.addEventListener('blur', function() {
      this.removeAttribute('data-focused');
    });
  });

  // Add focus styles
  const focusStyle = document.createElement('style');
  focusStyle.textContent = `
    [data-focused="true"] {
      outline: 3px solid var(--color-primary);
      outline-offset: 2px;
    }
  `;
  document.head.appendChild(focusStyle);
}

/**
 * Enhanced keyboard navigation
 */
function initKeyboardNavigation() {
  // Add keyboard navigation for cards
  document.querySelectorAll('.benefit-card').forEach(card => {
    // Make cards focusable
    card.setAttribute('tabindex', '0');

    // Add keyboard interaction
    card.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();

        // Find any link within the card and activate it
        const link = this.querySelector('a');
        if (link) {
          link.click();
        } else {
          // Announce card content to screen reader
          const title = this.querySelector('h4')?.textContent;
          const description = this.querySelector('p')?.textContent;
          if (title && description) {
            announceToScreenReader(`${title}: ${description}`);
          }
        }
      }
    });
  });

  // Escape key to return to top
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      const skipLink = document.querySelector('.skip-link');
      if (skipLink) {
        skipLink.focus();
        announceToScreenReader('Returned to top of page');
      }
    }
  });
}

/**
 * Announce messages to screen readers
 */
function announceToScreenReader(message) {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Handle responsive behavior
 */
function handleResponsiveFeatures() {
  // Add mobile-specific enhancements
  if (window.innerWidth <= 768) {
    // Improve touch targets
    document.querySelectorAll('.cta-button, .benefit-card').forEach(element => {
      element.style.minHeight = '44px'; // WCAG touch target minimum
    });
  }
}

/**
 * Initialize when DOM is ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    addScreenReaderOnlyStyles();
    handleResponsiveFeatures();
  });
} else {
  addScreenReaderOnlyStyles();
  handleResponsiveFeatures();
}

// Handle window resize
window.addEventListener('resize', handleResponsiveFeatures);

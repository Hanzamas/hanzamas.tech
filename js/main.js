/**
 * Main.js - Application Initialization & Coordination
 * ==================================================
 * Coordinates all modules and handles global initialization
 */

// Import all modules
import { initCore } from './core.js';
import { initNavigation } from './navigation.js';
import { initAnimations } from './animations.js';
import { initComponents } from './components.js';

// ==============================================
// GLOBAL INITIALIZATION
// ==============================================

/**
 * Initialize the entire application
 */
function initApp() {
    console.log('🚀 Hanzamas.tech Portfolio Initializing...');
    
    // Initialize core functionality first
    initCore();
    
    // Initialize other modules
    initNavigation();
    initAnimations();
    initComponents();
    
    // Additional global setup
    setupGlobalEventListeners();
    setupAccessibility();
    setupPerformanceOptimizations();
    
    // Ensure content is visible - fallback for broken animations
    setTimeout(() => {
        ensureContentVisible();
    }, 1000);
    
    console.log('✅ Application initialized successfully!');
}

/**
 * Fallback function to ensure content is visible
 */
function ensureContentVisible() {
    // Make sure all sections are visible
    const allSections = document.querySelectorAll('section');
    allSections.forEach(section => {
        section.classList.add('visible', 'loaded');
        section.style.opacity = '1';
        section.style.transform = 'translateY(0)';
        section.style.visibility = 'visible';
    });

    // Make sure all animated elements are visible
    const animatedElements = document.querySelectorAll('[data-aos], .section-header, .service-card, .portfolio-item, .skill-category-card, .testimonial-card, .about-text, .about-image, .contact-info, .contact-form');
    animatedElements.forEach(element => {
        element.classList.add('visible', 'loaded');
        element.style.opacity = '1';
        element.style.transform = 'translateY(0) translateX(0) scale(1)';
        element.style.visibility = 'visible';
    });

    // Make sure hero content is visible
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.opacity = '1';
        heroContent.style.transform = 'translateY(0)';
        heroContent.style.visibility = 'visible';
    }

    // Add loaded class to body to trigger any CSS that depends on it
    document.body.classList.add('loaded', 'content-visible');

    console.log('🔍 Content visibility ensured with aggressive approach');
}

/**
 * Setup global event listeners
 */
function setupGlobalEventListeners() {
    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Trigger resize handlers
            window.dispatchEvent(new CustomEvent('optimizedResize'));
        }, 250);
    });

    // Handle visibility change (for performance optimization)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Pause expensive animations when tab is not visible
            document.body.classList.add('paused');
        } else {
            // Resume animations when tab becomes visible
            document.body.classList.remove('paused');
        }
    });

    // Handle online/offline status
    window.addEventListener('online', () => {
        console.log('🌐 Connection restored');
        document.body.classList.remove('offline');
    });

    window.addEventListener('offline', () => {
        console.log('📡 Connection lost');
        document.body.classList.add('offline');
    });
}

/**
 * Setup accessibility features
 */
function setupAccessibility() {
    // Respect user's motion preferences
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.body.classList.add('reduced-motion');
        console.log('♿ Reduced motion enabled');
    }

    // Respect user's color scheme preference
    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        document.body.classList.add('light-mode');
        console.log('☀️ Light mode detected');
    }

    // High contrast mode
    if (window.matchMedia('(prefers-contrast: high)').matches) {
        document.body.classList.add('high-contrast');
        console.log('🔆 High contrast mode enabled');
    }

    // Focus management for keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });

    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
    });
}

/**
 * Setup performance optimizations
 */
function setupPerformanceOptimizations() {
    // Lazy load images when they're about to enter viewport
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // Service worker registration for PWA capabilities (if service worker exists)
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', async () => {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('🔧 Service worker registered:', registration);
            } catch (error) {
                console.log('Service worker registration failed (normal if not implemented)');
            }
        });
    }
}

/**
 * Handle uncaught errors gracefully
 */
function setupErrorHandling() {
    window.addEventListener('error', (event) => {
        console.error('Global error caught:', event.error);
        
        // Don't break the user experience for minor errors
        event.preventDefault();
        
        // You could send error reports to a logging service here
        // logErrorToService(event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        
        // Prevent the default browser error handling
        event.preventDefault();
    });
}

/**
 * Setup development helpers (only in development)
 */
function setupDevelopmentHelpers() {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        // Add development utilities
        window.hanzamasDebug = {
            showBoundingBoxes: () => {
                document.body.classList.toggle('debug-boxes');
            },
            
            showPerformanceStats: () => {
                console.log('Performance timing:', performance.getEntriesByType('navigation')[0]);
            },
            
            testAnimations: () => {
                document.body.classList.add('test-animations');
                setTimeout(() => {
                    document.body.classList.remove('test-animations');
                }, 3000);
            }
        };
        
        console.log('🛠️ Development helpers available: window.hanzamasDebug');
    }
}

// ==============================================
// INITIALIZATION SEQUENCE
// ==============================================

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    // DOM is already ready
    initApp();
}

// Setup error handling immediately
setupErrorHandling();

// Setup development helpers
setupDevelopmentHelpers();

// Export for potential external use
export { initApp };

/**
 * Core.js - DOM Elements, Utilities & Configuration
 * ================================================
 * Manages all DOM element references and core utilities
 */

// ==============================================
// DOM ELEMENTS
// ==============================================
export const DOM = {
    // Navigation
    loadingScreen: document.getElementById('loadingScreen'),
    navbar: document.getElementById('navbar'),
    hamburger: document.getElementById('hamburger'),
    navMenu: document.getElementById('navMenu'),
    navLinks: document.querySelectorAll('.nav-link'),

    // Hero Section
    typingText: document.getElementById('typingText'),
    particles: document.getElementById('particles'),
    characterImg: document.getElementById('characterImg'),

    // Forms & Interactions
    contactForm: document.getElementById('contactForm'),
    portfolioFilters: document.querySelectorAll('.filter-btn'),
    portfolioItems: document.querySelectorAll('.portfolio-item'),

    // Sections
    sections: document.querySelectorAll('section'),
    animatedElements: document.querySelectorAll('[data-aos]')
};

// ==============================================
// CONFIGURATION
// ==============================================
export const CONFIG = {
    // Animation settings
    loadingDuration: 800, // Reduced from 1500 to 800ms
    typingSpeed: 100,
    particleCount: 50,
    
    // Scroll settings
    scrollOffset: 100,
    
    // Observer settings
    observerOptions: {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    },
    
    // Typing texts
    typingTexts: [
        'Hello, I\'m Hanzamas',
        'Junior IT Professional',
        'Full Stack Developer', 
        'Mobile App Developer',
        'Cybersecurity Enthusiast'
    ]
};

// ==============================================
// UTILITY FUNCTIONS
// ==============================================

/**
 * Throttle function calls
 */
export function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

/**
 * Debounce function calls
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Show notification to user
 */
export function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        background: ${type === 'success' ? 'var(--gradient-primary)' : 'linear-gradient(135deg, #ff4757, #ff3838)'};
        color: white;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-primary);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

/**
 * Get random number between min and max
 */
export function random(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Check if element is in viewport
 */
export function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Wait for specified time
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ==============================================
// INITIALIZATION
// ==============================================
export function initCore() {
    console.log('🚀 Core module initialized');
    
    // Preload critical images
    preloadImages();
    
    // Set up global error handling
    window.addEventListener('error', (e) => {
        console.error('Global error:', e.error);
    });
}

/**
 * Preload important images
 */
function preloadImages() {
    const images = [
        'assets/character.png',
        'assets/character.svg'
    ];
    
    images.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

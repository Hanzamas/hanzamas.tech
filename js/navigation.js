/**
 * Navigation.js - Navigation & Scrolling Logic
 * ============================================
 * Handles mobile menu, smooth scrolling, navbar effects
 */

import { DOM, CONFIG, throttle } from './core.js';

// ==============================================
// NAVIGATION FUNCTIONS
// ==============================================

/**
 * Initialize mobile navigation
 */
export function initMobileNav() {
    if (!DOM.hamburger || !DOM.navMenu) return;

    // Toggle mobile menu
    DOM.hamburger.addEventListener('click', () => {
        DOM.hamburger.classList.toggle('active');
        DOM.navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    DOM.navLinks.forEach(link => {
        link.addEventListener('click', () => {
            DOM.hamburger.classList.remove('active');
            DOM.navMenu.classList.remove('active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!DOM.navbar.contains(e.target)) {
            DOM.hamburger.classList.remove('active');
            DOM.navMenu.classList.remove('active');
        }
    });
}

/**
 * Initialize smooth scrolling
 */
export function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Initialize navbar scroll effects
 */
export function initNavbarEffects() {
    if (!DOM.navbar) return;

    const handleScroll = throttle(() => {
        if (window.scrollY > CONFIG.scrollOffset) {
            DOM.navbar.classList.add('scrolled');
        } else {
            DOM.navbar.classList.remove('scrolled');
        }
        
        // Update active nav link
        updateActiveNavLink();
    }, 16);

    window.addEventListener('scroll', handleScroll);
}

/**
 * Update active navigation link based on scroll position
 */
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 150;
        const sectionHeight = section.offsetHeight;
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

/**
 * Initialize scroll progress indicator
 */
export function initScrollProgress() {
    // Create scroll progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.innerHTML = '<div class="scroll-progress-bar"></div>';
    document.body.appendChild(progressBar);

    const progressFill = progressBar.querySelector('.scroll-progress-bar');

    const updateProgress = throttle(() => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        
        progressFill.style.width = `${Math.min(scrollPercent, 100)}%`;
    }, 16);

    window.addEventListener('scroll', updateProgress);
}

/**
 * Initialize scroll indicator (scroll down arrow)
 */
export function initScrollIndicator() {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (!scrollIndicator) return;

    // Hide scroll indicator when user scrolls
    const handleScroll = throttle(() => {
        if (window.scrollY > 100) {
            scrollIndicator.style.opacity = '0';
        } else {
            scrollIndicator.style.opacity = '1';
        }
    }, 16);

    window.addEventListener('scroll', handleScroll);

    // Click to scroll to next section
    scrollIndicator.addEventListener('click', () => {
        const aboutSection = document.querySelector('#about');
        if (aboutSection) {
            aboutSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

/**
 * Initialize parallax effects
 */
export function initParallax() {
    const parallaxElements = document.querySelectorAll('.parallax-element');
    
    if (parallaxElements.length === 0) return;

    const handleScroll = throttle(() => {
        const scrollTop = window.pageYOffset;
        
        parallaxElements.forEach(element => {
            const speed = element.dataset.speed || 0.5;
            const yPos = -(scrollTop * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    }, 16);

    window.addEventListener('scroll', handleScroll);
}

// ==============================================
// INITIALIZATION
// ==============================================
export function initNavigation() {
    console.log('🧭 Navigation module initialized');
    
    initMobileNav();
    initSmoothScroll();
    initNavbarEffects();
    initScrollProgress();
    initScrollIndicator();
    initParallax();
}

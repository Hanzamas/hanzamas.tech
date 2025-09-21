/**
 * Animations.js - All Animation Effects & Visual Enhancements
 * ===========================================================
 * Handles loading screen, typing effects, particles, character animations
 */

import { DOM, CONFIG, random, sleep } from './core.js';

// ==============================================
// LOADING SCREEN ANIMATION
// ==============================================

/**
 * Initialize enhanced loading screen
 */
export function initLoadingScreen() {
    if (!DOM.loadingScreen) return;
    
    console.log('🎬 Loading screen started');

    const progressBar = DOM.loadingScreen.querySelector('.loading-progress');
    let progress = 0;

    // Animate progress bar quickly
    const progressInterval = setInterval(() => {
        progress += random(10, 25);
        if (progressBar) {
            progressBar.style.width = `${Math.min(progress, 100)}%`;
        }
        
        if (progress >= 100) {
            clearInterval(progressInterval);
            console.log('📊 Progress bar completed');
        }
    }, 20);

    // Function to hide loading screen
    const hideLoadingScreen = () => {
        console.log('🎭 Hiding loading screen');
        DOM.loadingScreen.classList.add('hidden');
        
        // Initialize welcome effects after loading
        setTimeout(() => {
            initWelcomeEffects();
            // Ensure all content is visible
            document.body.classList.add('loaded');
            makeAllContentVisible();
            console.log('✨ Welcome effects initialized');
        }, 200);
    };

    // Hide loading screen quickly
    setTimeout(hideLoadingScreen, 600);
}

/**
 * Ensure all content is visible
 */
function makeAllContentVisible() {
    // Add visible class to all sections and animated elements
    const allSections = document.querySelectorAll('section');
    const allAnimatedElements = document.querySelectorAll('[data-aos], .section-header, .service-card, .portfolio-item, .skill-category-card, .testimonial-card');
    
    allSections.forEach(section => {
        section.classList.add('visible', 'loaded');
    });
    
    allAnimatedElements.forEach(element => {
        element.classList.add('visible', 'loaded');
    });
    
    console.log('👁️ All content made visible');
}

/**
 * Welcome effects after loading
 */
function initWelcomeEffects() {
    // Create welcome sparkles around character
    if (DOM.characterImg) {
        createWelcomeSparkles();
    }

    // Start typing animation
    initTypewriterEffect();
}

// ==============================================
// TYPEWRITER EFFECT
// ==============================================

/**
 * Enhanced typewriter effect
 */
export function initTypewriterEffect() {
    if (!DOM.typingText) return;

    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const texts = CONFIG.typingTexts;

    function typeWriter() {
        const currentText = texts[textIndex];
        
        if (isDeleting) {
            DOM.typingText.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
        } else {
            DOM.typingText.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
        }

        let typeSpeed = isDeleting ? 50 : CONFIG.typingSpeed;

        if (!isDeleting && charIndex === currentText.length) {
            typeSpeed = 2000; // Pause at end
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            typeSpeed = 200; // Pause before next text
        }

        setTimeout(typeWriter, typeSpeed);
    }

    typeWriter();
}

// ==============================================
// PARTICLE SYSTEM
// ==============================================

/**
 * Create floating particles
 */
export function initParticles() {
    if (!DOM.particles) return;

    for (let i = 0; i < CONFIG.particleCount; i++) {
        createParticle();
    }
}

function createParticle() {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random positioning
    particle.style.left = random(0, 100) + '%';
    particle.style.top = random(0, 100) + '%';
    
    // Random animation delay
    particle.style.animationDelay = random(0, 6) + 's';
    
    // Random size
    const size = random(2, 6);
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    
    DOM.particles.appendChild(particle);
}

// ==============================================
// CHARACTER ANIMATIONS
// ==============================================

/**
 * Initialize character interactions
 */
export function initCharacterAnimations() {
    if (!DOM.characterImg) return;

    let clickCount = 0;
    let clickTimer = null;

    // Enhanced hover effects
    DOM.characterImg.addEventListener('mouseenter', () => {
        DOM.characterImg.style.transform = 'scale(1.05) rotateY(5deg)';
        createCharacterSparkles();
    });

    DOM.characterImg.addEventListener('mouseleave', () => {
        DOM.characterImg.style.transform = 'scale(1) rotateY(0deg)';
    });

    // Double click for special effect
    DOM.characterImg.addEventListener('click', () => {
        clickCount++;
        
        if (clickTimer) clearTimeout(clickTimer);
        
        clickTimer = setTimeout(() => {
            if (clickCount === 1) {
                characterPulseEffect();
            } else if (clickCount === 2) {
                characterDanceEffect();
            } else if (clickCount >= 3) {
                activatePartyMode();
                clickCount = 0;
            }
            clickCount = 0;
        }, 300);
    });

    // Secret key combination
    let keySequence = [];
    document.addEventListener('keydown', (e) => {
        if (DOM.characterImg.matches(':hover')) {
            keySequence.push(e.key.toLowerCase());
            if (keySequence.join('') === 'magic') {
                activateSecretMode();
                keySequence = [];
            }
            if (keySequence.length > 5) keySequence.shift();
        }
    });
}

/**
 * Create sparkles around character
 */
function createCharacterSparkles() {
    const container = DOM.characterImg.parentElement;
    
    for (let i = 0; i < 6; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'character-sparkle';
        sparkle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: var(--accent-color);
            border-radius: 50%;
            pointer-events: none;
            left: ${random(10, 90)}%;
            top: ${random(10, 90)}%;
            animation: sparkleFloat 2s ease-out forwards;
        `;
        
        container.appendChild(sparkle);
        
        setTimeout(() => sparkle.remove(), 2000);
    }
}

/**
 * Character pulse effect
 */
function characterPulseEffect() {
    DOM.characterImg.style.animation = 'none';
    setTimeout(() => {
        DOM.characterImg.style.animation = 'kawaiiPulse 0.6s ease-in-out';
    }, 10);
}

/**
 * Character dance effect
 */
function characterDanceEffect() {
    DOM.characterImg.parentElement.classList.add('dancing');
    
    setTimeout(() => {
        DOM.characterImg.parentElement.classList.remove('dancing');
    }, 2000);
}

/**
 * Party mode activation
 */
function activatePartyMode() {
    const body = document.body;
    body.classList.add('party-mode');
    
    // Create rainbow particles
    for (let i = 0; i < 20; i++) {
        createRainbowParticle();
    }
    
    setTimeout(() => {
        body.classList.remove('party-mode');
    }, 5000);
}

/**
 * Secret mode activation
 */
function activateSecretMode() {
    DOM.characterImg.parentElement.classList.add('ultra-kawaii');
    showSecretMessage('✨ Ultra Kawaii Mode Activated! ✨');
    
    setTimeout(() => {
        DOM.characterImg.parentElement.classList.remove('ultra-kawaii');
    }, 3000);
}

/**
 * Create rainbow particle
 */
function createRainbowParticle() {
    const particle = document.createElement('div');
    const colors = ['#ff6b9d', '#c44569', '#f8b500', '#667eea', '#764ba2'];
    
    particle.style.cssText = `
        position: fixed;
        width: 6px;
        height: 6px;
        background: ${colors[Math.floor(random(0, colors.length))]};
        border-radius: 50%;
        pointer-events: none;
        left: ${random(0, 100)}%;
        top: ${random(0, 100)}%;
        animation: partyFloat 3s ease-out forwards;
        z-index: 1000;
    `;
    
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 3000);
}

/**
 * Show secret message
 */
function showSecretMessage(message) {
    const messageEl = document.createElement('div');
    messageEl.className = 'secret-message';
    messageEl.textContent = message;
    messageEl.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--gradient-primary);
        color: white;
        padding: 1rem 2rem;
        border-radius: 20px;
        font-size: 1.2rem;
        font-weight: 600;
        z-index: 10000;
        animation: secretMessageAnim 3s ease-in-out forwards;
    `;
    
    document.body.appendChild(messageEl);
    setTimeout(() => messageEl.remove(), 3000);
}

/**
 * Welcome sparkles effect
 */
function createWelcomeSparkles() {
    if (!DOM.characterImg) return;
    
    const container = DOM.characterImg.parentElement;
    
    for (let i = 0; i < 12; i++) {
        setTimeout(() => {
            const sparkle = document.createElement('div');
            sparkle.className = 'welcome-sparkle';
            sparkle.style.cssText = `
                position: absolute;
                width: 6px;
                height: 6px;
                background: var(--accent-color);
                border-radius: 50%;
                pointer-events: none;
                left: ${random(0, 100)}%;
                top: ${random(0, 100)}%;
                animation: welcomeSparkle 2s ease-out forwards;
            `;
            
            container.appendChild(sparkle);
            setTimeout(() => sparkle.remove(), 2000);
        }, i * 200);
    }
}

// ==============================================
// INTERSECTION OBSERVER ANIMATIONS
// ==============================================

/**
 * Initialize scroll-based animations
 */
export function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '50px 0px -50px 0px'
    };

    // Main section observer
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 50);
            }
        });
    }, observerOptions);

    // Observe all sections
    DOM.sections.forEach(section => {
        sectionObserver.observe(section);
        // Make sure hero is immediately visible
        if (section.id === 'home') {
            section.classList.add('visible', 'loaded');
        }
    });

    // Observe animated elements
    DOM.animatedElements.forEach(element => {
        sectionObserver.observe(element);
    });

    // Immediately make content visible for elements in viewport
    const makeVisibleIfInViewport = () => {
        const allElementsToAnimate = [...DOM.sections, ...DOM.animatedElements];
        allElementsToAnimate.forEach(element => {
            const rect = element.getBoundingClientRect();
            const isInViewport = rect.top < window.innerHeight * 0.8 && rect.bottom > 0;
            if (isInViewport) {
                element.classList.add('visible', 'loaded');
            }
        });
    };

    // Run immediately and after short delay
    makeVisibleIfInViewport();
    setTimeout(makeVisibleIfInViewport, 100);
    setTimeout(makeVisibleIfInViewport, 500);
}

/**
 * Counter animation for stats
 */
export function initCounterAnimations() {
    const counters = document.querySelectorAll('.stat-number');
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-count'));
                animateCounter(entry.target, target);
                counterObserver.unobserve(entry.target);
            }
        });
    });

    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}

/**
 * Animate counter to target value
 */
function animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 40);
}

// ==============================================
// INITIALIZATION
// ==============================================
export function initAnimations() {
    console.log('✨ Animation module initialized');
    
    initLoadingScreen();
    initParticles();
    initCharacterAnimations();
    initScrollAnimations();
    initCounterAnimations();
}

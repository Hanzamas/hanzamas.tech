/**
 * App.js - Landing Page Application Core
 * =====================================
 * Consolidated JavaScript for optimized landing page performance
 * Includes: main, core, navigation, contact functionality
 */

// ==============================================
// CONFIGURATION & CONSTANTS
// ==============================================

const CONFIG = {
    // Typing animation texts
    typingTexts: [
        'Junior IT Professional',
        'Mobile Developer',
        'Frontend Developer', 
        'Backend Developer',
        'Network Engineer',
        'System Administrator',
        'IT Consultant',
        'IoT Engineer'
    ],
    
    // Animation settings
    typingSpeed: 100,
    deletingSpeed: 50,
    delayBetweenWords: 2000,
    
    // Scroll settings
    scrollThreshold: 100,
    
    // Performance settings
    throttleDelay: 16,
    debounceDelay: 250
};

// ==============================================
// DOM ELEMENTS CACHE
// ==============================================
const DOM = {
    // Core elements
    loadingScreen: document.getElementById('loadingScreen'),
    navbar: document.getElementById('navbar'),
    hamburger: document.getElementById('hamburger'),
    navMenu: document.getElementById('navMenu'),
    navLinks: document.querySelectorAll('.nav-link'),
    
    // Hero section
    typingText: document.getElementById('typingText'),
    particles: document.getElementById('particles'),
    characterImg: document.getElementById('characterImg'),
    
    // Forms & interactions
    contactForm: document.getElementById('contactForm'),
    portfolioFilters: document.querySelectorAll('.filter-btn'),
    portfolioItems: document.querySelectorAll('.portfolio-item'),
    
    // Sections
    sections: document.querySelectorAll('section'),
    animatedElements: document.querySelectorAll('[data-aos]')
};

// ==============================================
// UTILITY FUNCTIONS
// ==============================================

/**
 * Throttle function execution
 */
function throttle(func, delay) {
    let timeoutId;
    let lastExecTime = 0;
    return function (...args) {
        const currentTime = Date.now();
        
        if (currentTime - lastExecTime > delay) {
            func.apply(this, args);
            lastExecTime = currentTime;
        } else {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
                lastExecTime = Date.now();
            }, delay - (currentTime - lastExecTime));
        }
    };
}

/**
 * Debounce function execution
 */
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * Check if element is in viewport
 */
function isInViewport(element, threshold = 0) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    return rect.top <= windowHeight * (1 - threshold) && rect.bottom >= 0;
}

/**
 * Generate random number between min and max
 */
function random(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Show notification
 */
function showNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto hide
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, duration);
}

// ==============================================
// LOADING SCREEN
// ==============================================
class LoadingScreen {
    constructor() {
        this.loadingScreen = DOM.loadingScreen;
        this.progress = 0;
        this.init();
    }
    
    init() {
        if (!this.loadingScreen) return;
        
        this.simulateLoading();
    }
    
    simulateLoading() {
        const progressBar = this.loadingScreen.querySelector('.loading-progress');
        if (!progressBar) return;
        
        const interval = setInterval(() => {
            this.progress += random(5, 15);
            if (this.progress >= 100) {
                this.progress = 100;
                clearInterval(interval);
                setTimeout(() => this.hide(), 500);
            }
            progressBar.style.width = this.progress + '%';
        }, random(100, 300));
    }
    
    hide() {
        if (!this.loadingScreen) return;
        
        this.loadingScreen.classList.add('hidden');
        document.body.classList.add('loaded');
        
        // Ensure content visibility
        setTimeout(() => {
            this.ensureContentVisible();
        }, 1000);
    }
    
    ensureContentVisible() {
        // Fallback to ensure all content is visible
        const elements = document.querySelectorAll('section, .section-header, .service-card, .portfolio-item, .skill-category-card, .testimonial-card');
        elements.forEach(element => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
            element.style.visibility = 'visible';
        });
    }
}

// ==============================================
// TYPING ANIMATION
// ==============================================
class TypingAnimation {
    constructor() {
        this.element = DOM.typingText;
        this.texts = CONFIG.typingTexts;
        this.currentTextIndex = 0;
        this.currentCharIndex = 0;
        this.isDeleting = false;
        
        if (this.element) {
            this.init();
        }
    }
    
    init() {
        this.type();
    }
    
    type() {
        const currentText = this.texts[this.currentTextIndex];
        
        if (this.isDeleting) {
            this.element.textContent = currentText.substring(0, this.currentCharIndex - 1);
            this.currentCharIndex--;
        } else {
            this.element.textContent = currentText.substring(0, this.currentCharIndex + 1);
            this.currentCharIndex++;
        }
        
        let typeSpeed = this.isDeleting ? CONFIG.deletingSpeed : CONFIG.typingSpeed;
        
        if (!this.isDeleting && this.currentCharIndex === currentText.length) {
            typeSpeed = CONFIG.delayBetweenWords;
            this.isDeleting = true;
        } else if (this.isDeleting && this.currentCharIndex === 0) {
            this.isDeleting = false;
            this.currentTextIndex = (this.currentTextIndex + 1) % this.texts.length;
        }
        
        setTimeout(() => this.type(), typeSpeed);
    }
}

// ==============================================
// NAVIGATION
// ==============================================
class Navigation {
    constructor() {
        this.navbar = DOM.navbar;
        this.hamburger = DOM.hamburger;
        this.navMenu = DOM.navMenu;
        this.navLinks = DOM.navLinks;
        this.init();
    }
    
    init() {
        this.setupScrollBehavior();
        this.setupMobileToggle();
        this.setupSmoothScroll();
        this.setupActiveLinks();
    }
    
    setupScrollBehavior() {
        const handleScroll = throttle(() => {
            if (window.scrollY > CONFIG.scrollThreshold) {
                this.navbar?.classList.add('scrolled');
            } else {
                this.navbar?.classList.remove('scrolled');
            }
        }, CONFIG.throttleDelay);
        
        window.addEventListener('scroll', handleScroll);
    }
    
    setupMobileToggle() {
        this.hamburger?.addEventListener('click', () => {
            this.hamburger.classList.toggle('active');
            this.navMenu?.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.navbar?.contains(e.target)) {
                this.hamburger?.classList.remove('active');
                this.navMenu?.classList.remove('active');
            }
        });
    }
    
    setupSmoothScroll() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const offsetTop = targetElement.offsetTop - 80; // Account for navbar
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
                
                // Close mobile menu
                this.hamburger?.classList.remove('active');
                this.navMenu?.classList.remove('active');
            });
        });
    }
    
    setupActiveLinks() {
        const handleScroll = throttle(() => {
            const sections = DOM.sections;
            const scrollPos = window.scrollY + 100;
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');
                
                if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                    this.navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${sectionId}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, CONFIG.throttleDelay);
        
        window.addEventListener('scroll', handleScroll);
    }
}

// ==============================================
// PARTICLES ANIMATION
// ==============================================
class ParticlesAnimation {
    constructor() {
        this.container = DOM.particles;
        this.particles = [];
        this.animationId = null;
        
        if (this.container) {
            this.init();
        }
    }
    
    init() {
        this.createParticles();
        this.animate();
    }
    
    createParticles() {
        const particleCount = window.innerWidth < 768 ? 30 : 50;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const size = random(2, 8);
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            particle.style.left = random(0, 100) + '%';
            particle.style.top = random(0, 100) + '%';
            particle.style.animationDelay = random(0, 5) + 's';
            particle.style.animationDuration = random(3, 8) + 's';
            
            this.container.appendChild(particle);
            this.particles.push({
                element: particle,
                x: parseFloat(particle.style.left),
                y: parseFloat(particle.style.top),
                vx: random(-0.5, 0.5),
                vy: random(-0.5, 0.5)
            });
        }
    }
    
    animate() {
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Wrap around screen
            if (particle.x < 0) particle.x = 100;
            if (particle.x > 100) particle.x = 0;
            if (particle.y < 0) particle.y = 100;
            if (particle.y > 100) particle.y = 0;
            
            particle.element.style.left = particle.x + '%';
            particle.element.style.top = particle.y + '%';
        });
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.particles.forEach(particle => {
            if (particle.element.parentNode) {
                particle.element.parentNode.removeChild(particle.element);
            }
        });
    }
}

// ==============================================
// PORTFOLIO FILTERS
// ==============================================
class PortfolioFilter {
    constructor() {
        this.filterButtons = DOM.portfolioFilters;
        this.portfolioItems = DOM.portfolioItems;
        this.init();
    }
    
    init() {
        this.filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const filter = e.target.getAttribute('data-filter');
                this.filterPortfolio(filter);
                this.updateActiveButton(e.target);
            });
        });
    }
    
    filterPortfolio(filter) {
        this.portfolioItems.forEach(item => {
            const category = item.getAttribute('data-category');
            
            if (filter === 'all' || category === filter) {
                item.classList.remove('hidden');
                item.style.opacity = '1';
                item.style.transform = 'scale(1)';
            } else {
                item.classList.add('hidden');
                item.style.opacity = '0';
                item.style.transform = 'scale(0.8)';
            }
        });
    }
    
    updateActiveButton(activeButton) {
        this.filterButtons.forEach(button => {
            button.classList.remove('active');
        });
        activeButton.classList.add('active');
    }
}

// ==============================================
// CONTACT FORM
// ==============================================
class ContactForm {
    constructor() {
        this.form = DOM.contactForm;
        if (this.form) {
            this.init();
        }
    }
    
    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
    
    async handleSubmit(event) {
        event.preventDefault();
        
        const submitButton = this.form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        
        // Get form data
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData);
        
        // Validate form
        if (!this.validateForm(data)) {
            return;
        }
        
        try {
            // Show loading state
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitButton.disabled = true;
            
            // Simulate form submission (replace with actual API call)
            await this.submitForm(data);
            
            // Show success message
            this.showSuccessMessage();
            this.form.reset();
            
        } catch (error) {
            console.error('Form submission error:', error);
            this.showErrorMessage('Failed to send message. Please try again.');
        } finally {
            // Reset button
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
        }
    }
    
    validateForm(data) {
        const { name, email, subject, message } = data;
        
        if (!name.trim()) {
            this.showFieldError('name', 'Name is required');
            return false;
        }
        
        if (!this.isValidEmail(email)) {
            this.showFieldError('email', 'Please enter a valid email');
            return false;
        }
        
        if (!subject.trim()) {
            this.showFieldError('subject', 'Subject is required');
            return false;
        }
        
        if (!message.trim()) {
            this.showFieldError('message', 'Message is required');
            return false;
        }
        
        return true;
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    async submitForm(data) {
        // Replace this with your actual form submission logic
        // For now, we'll simulate a successful submission
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Form submitted:', data);
                resolve();
            }, 1000);
        });
    }
    
    showFieldError(fieldName, message) {
        const field = this.form.querySelector(`[name="${fieldName}"]`);
        const formGroup = field.closest('.form-group');
        
        // Remove existing error
        const existingError = formGroup.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Add error class
        formGroup.classList.add('error');
        
        // Create error message
        const errorElement = document.createElement('span');
        errorElement.className = 'error-message show';
        errorElement.textContent = message;
        
        field.parentNode.appendChild(errorElement);
        
        // Focus the field
        field.focus();
        
        // Remove error on input
        field.addEventListener('input', () => {
            formGroup.classList.remove('error');
            if (errorElement.parentNode) {
                errorElement.remove();
            }
        }, { once: true });
    }
    
    showSuccessMessage() {
        showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
    }
    
    showErrorMessage(message) {
        showNotification(message, 'error');
    }
}

// ==============================================
// SCROLL ANIMATIONS
// ==============================================
class ScrollAnimations {
    constructor() {
        this.animatedElements = DOM.animatedElements;
        this.init();
    }
    
    init() {
        this.setupIntersectionObserver();
        this.setupScrollProgress();
        this.setupStatCounters();
    }
    
    setupIntersectionObserver() {
        if (!('IntersectionObserver' in window)) {
            // Fallback for older browsers
            this.fallbackAnimations();
            return;
        }
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    // Trigger stat counting if it's a stat number
                    if (entry.target.classList.contains('stat-number')) {
                        this.animateCounter(entry.target);
                    }
                    
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        // Observe all animated elements
        this.animatedElements.forEach(element => {
            observer.observe(element);
        });
        
        // Also observe sections
        DOM.sections.forEach(section => {
            observer.observe(section);
        });
    }
    
    fallbackAnimations() {
        // Simple fallback for browsers without IntersectionObserver
        const handleScroll = throttle(() => {
            this.animatedElements.forEach(element => {
                if (isInViewport(element, 0.1)) {
                    element.classList.add('visible');
                }
            });
        }, CONFIG.throttleDelay);
        
        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Check initial state
    }
    
    setupScrollProgress() {
        let progressBar = document.querySelector('.scroll-progress-bar');
        
        if (!progressBar) {
            // Create scroll progress bar
            const progressContainer = document.createElement('div');
            progressContainer.className = 'scroll-progress';
            progressBar = document.createElement('div');
            progressBar.className = 'scroll-progress-bar';
            progressContainer.appendChild(progressBar);
            document.body.appendChild(progressContainer);
        }
        
        const updateProgress = throttle(() => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            progressBar.style.width = scrollPercent + '%';
        }, CONFIG.throttleDelay);
        
        window.addEventListener('scroll', updateProgress);
    }
    
    setupStatCounters() {
        const statNumbers = document.querySelectorAll('.stat-number');
        this.statNumbers = Array.from(statNumbers);
    }
    
    animateCounter(element) {
        const target = parseInt(element.getAttribute('data-count'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const counter = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(counter);
            }
            element.textContent = Math.floor(current);
        }, 16);
    }
}

// ==============================================
// ACCESSIBILITY & PERFORMANCE
// ==============================================
class AccessibilityManager {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupKeyboardNavigation();
        this.setupReducedMotion();
        this.setupFocusManagement();
    }
    
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });
        
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }
    
    setupReducedMotion() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('reduced-motion');
        }
    }
    
    setupFocusManagement() {
        // Skip link for screen readers
        const skipLink = document.createElement('a');
        skipLink.href = '#main';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'sr-only';
        skipLink.style.position = 'absolute';
        skipLink.style.top = '-40px';
        skipLink.style.left = '6px';
        skipLink.style.zIndex = '10000';
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
    }
}

// ==============================================
// APPLICATION INITIALIZATION
// ==============================================
class App {
    constructor() {
        this.components = {};
        this.init();
    }
    
    init() {
        console.log('🚀 Hanzamas.tech Landing Page Initializing...');
        
        // Initialize core components
        this.components.loadingScreen = new LoadingScreen();
        this.components.typingAnimation = new TypingAnimation();
        this.components.navigation = new Navigation();
        this.components.particlesAnimation = new ParticlesAnimation();
        this.components.portfolioFilter = new PortfolioFilter();
        this.components.contactForm = new ContactForm();
        this.components.scrollAnimations = new ScrollAnimations();
        this.components.accessibilityManager = new AccessibilityManager();
        
        // Setup global event listeners
        this.setupGlobalEvents();
        
        console.log('✅ Landing Page Application initialized successfully!');
    }
    
    setupGlobalEvents() {
        // Handle window resize
        const handleResize = debounce(() => {
            // Reinitialize particles if needed
            if (this.components.particlesAnimation) {
                this.components.particlesAnimation.destroy();
                this.components.particlesAnimation = new ParticlesAnimation();
            }
        }, CONFIG.debounceDelay);
        
        window.addEventListener('resize', handleResize);
        
        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                document.body.classList.add('paused');
            } else {
                document.body.classList.remove('paused');
            }
        });
        
        // Handle online/offline
        window.addEventListener('online', () => {
            document.body.classList.remove('offline');
            showNotification('Connection restored', 'success', 3000);
        });
        
        window.addEventListener('offline', () => {
            document.body.classList.add('offline');
            showNotification('Connection lost', 'error', 3000);
        });
    }
}

// ==============================================
// INITIALIZATION
// ==============================================

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.hanzamasApp = new App();
    });
} else {
    // DOM is already ready
    window.hanzamasApp = new App();
}

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { App, CONFIG, DOM };
}
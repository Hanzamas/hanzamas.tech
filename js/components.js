/**
 * Components.js - Interactive Components
 * =====================================
 * Handles contact forms, portfolio filters, testimonials, etc.
 */

import { DOM, showNotification, debounce } from './core.js';

// Import config
import { getApiUrl, getOrderStatusUrl } from './config.js';
import paymentStore from './payment-store.js';

// ==============================================
// PORTFOLIO FILTER
// ==============================================

/**
 * Initialize portfolio filtering
 */
export function initPortfolioFilter() {
    const filterButtons = DOM.portfolioFilters;
    const portfolioItems = DOM.portfolioItems;
    
    if (filterButtons.length === 0 || portfolioItems.length === 0) return;

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Filter items
            const filter = button.getAttribute('data-filter');
            
            portfolioItems.forEach((item, index) => {
                const category = item.getAttribute('data-category');
                const shouldShow = filter === 'all' || category === filter;
                
                setTimeout(() => {
                    if (shouldShow) {
                        item.style.display = 'block';
                        setTimeout(() => {
                            item.classList.add('visible');
                        }, 50);
                    } else {
                        item.classList.remove('visible');
                        setTimeout(() => {
                            item.style.display = 'none';
                        }, 300);
                    }
                }, index * 50);
            });
        });
    });
}

// ==============================================
// CONTACT FORM
// ==============================================

/**
 * Initialize contact form with animations and validation
 */
export function initContactForm() {
    const contactForm = DOM.contactForm;
    if (!contactForm) return;

    const inputs = contactForm.querySelectorAll('input, textarea');
    const submitBtn = contactForm.querySelector('button[type="submit"]');

    // Add focus animations to form inputs
    inputs.forEach((input, index) => {
        const formGroup = input.closest('.form-group');
        
        // Staggered appearance animation
        setTimeout(() => {
            if (formGroup) {
                formGroup.style.opacity = '1';
                formGroup.style.transform = 'translateY(0)';
            }
        }, index * 100);

        // Focus effects
        input.addEventListener('focus', () => {
            if (formGroup) {
                formGroup.classList.add('focused');
            }
        });

        input.addEventListener('blur', () => {
            if (formGroup) {
                formGroup.classList.remove('focused');
            }
            validateField(input);
        });

        // Real-time validation
        input.addEventListener('input', debounce(() => {
            validateField(input);
        }, 500));
    });

    // Submit button hover effect
    if (submitBtn) {
        submitBtn.addEventListener('mouseenter', () => {
            submitBtn.style.transform = 'translateY(-2px)';
        });

        submitBtn.addEventListener('mouseleave', () => {
            submitBtn.style.transform = 'translateY(0)';
        });
    }

    // Form submission
    contactForm.addEventListener('submit', handleFormSubmit);
}

/**
 * Validate individual form field
 */
function validateField(input) {
    const formGroup = input.closest('.form-group');
    if (!formGroup) return;

    let errorMessage = formGroup.querySelector('.error-message');
    
    // Remove existing error
    if (errorMessage) {
        errorMessage.remove();
    }
    formGroup.classList.remove('error', 'success');

    // Validation rules
    const value = input.value.trim();
    let isValid = true;
    let message = '';

    if (input.required && !value) {
        isValid = false;
        message = `${input.placeholder || 'This field'} is required`;
    } else if (input.type === 'email' && value && !isValidEmail(value)) {
        isValid = false;
        message = 'Please enter a valid email address';
    } else if (input.minLength && value.length < input.minLength) {
        isValid = false;
        message = `Minimum ${input.minLength} characters required`;
    }

    // Apply validation styling
    if (!isValid) {
        formGroup.classList.add('error');
        showFieldError(formGroup, message);
    } else if (value) {
        formGroup.classList.add('success');
    }

    return isValid;
}

/**
 * Show field error message
 */
function showFieldError(formGroup, message) {
    const errorEl = document.createElement('div');
    errorEl.className = 'error-message';
    errorEl.textContent = message;
    formGroup.appendChild(errorEl);
    
    setTimeout(() => {
        errorEl.classList.add('show');
    }, 10);
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Handle form submission
 */
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const inputs = form.querySelectorAll('input, textarea');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Validate all fields
    let isFormValid = true;
    inputs.forEach(input => {
        if (!validateField(input)) {
            isFormValid = false;
        }
    });

    if (!isFormValid) {
        showNotification('Please fix the errors in the form', 'error');
        return;
    }

    // Show loading state
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

    try {
        // Simulate form submission (replace with actual API call)
        await simulateFormSubmission(new FormData(form));
        
        showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
        form.reset();
        
        // Reset form styling
        inputs.forEach(input => {
            const formGroup = input.closest('.form-group');
            if (formGroup) {
                formGroup.classList.remove('success', 'error');
            }
        });
        
    } catch (error) {
        console.error('Form submission error:', error);
        showNotification('Failed to send message. Please try again.', 'error');
    } finally {
        // Reset button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

/**
 * Simulate form submission (replace with actual implementation)
 */
function simulateFormSubmission(formData) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate random success/failure for demo
            if (Math.random() > 0.1) {
                resolve();
            } else {
                reject(new Error('Network error'));
            }
        }, 2000);
    });
}

// ==============================================
// TESTIMONIALS CAROUSEL
// ==============================================

/**
 * Initialize testimonials interactions
 */
export function initTestimonials() {
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    
    testimonialCards.forEach((card, index) => {
        // Staggered animation
        setTimeout(() => {
            card.classList.add('visible');
        }, index * 200);

        // Hover effects
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px) scale(1.02)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// ==============================================
// SERVICE CARDS
// ==============================================

/**
 * Initialize service card interactions
 */
export function initServiceCards() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach((card, index) => {
        // Staggered animation
        setTimeout(() => {
            card.classList.add('visible');
        }, index * 150);

        // Enhanced hover effects
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-15px)';
            
            // Create hover sparkles
            createCardSparkles(card);
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
}

/**
 * Create sparkles on card hover
 */
function createCardSparkles(card) {
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const sparkle = document.createElement('div');
            sparkle.className = 'card-sparkle';
            sparkle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: var(--accent-color);
                border-radius: 50%;
                pointer-events: none;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: sparkleFloat 1s ease-out forwards;
            `;
            
            card.style.position = 'relative';
            card.appendChild(sparkle);
            
            setTimeout(() => sparkle.remove(), 1000);
        }, i * 100);
    }
}

// ==============================================
// SKILLS PROGRESS
// ==============================================

/**
 * Initialize skills progress animations
 */
export function initSkillsProgress() {
    const skillCards = document.querySelectorAll('.skill-card');
    
    const skillsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progressCircles = entry.target.querySelectorAll('.circle-progress circle:last-child');
                
                progressCircles.forEach(circle => {
                    const percentage = circle.getAttribute('data-percentage') || 0;
                    const circumference = 2 * Math.PI * 36; // radius = 36
                    const offset = circumference - (percentage / 100) * circumference;
                    
                    setTimeout(() => {
                        circle.style.strokeDashoffset = offset;
                    }, 200);
                });
                
                skillsObserver.unobserve(entry.target);
            }
        });
    });

    skillCards.forEach(card => {
        skillsObserver.observe(card);
    });
}

// ==============================================
// DUITKU CHECKOUT (if present)
// ==============================================

/**
 * Initialize Duitku checkout buttons
 */
export function initDuitkuCheckout() {
    const buyButtons = document.querySelectorAll('.btn-buy-duitku');
    
    buyButtons.forEach(button => {
        button.addEventListener('click', handleDuitkuCheckout);
    });
}

/**
 * Handle Duitku checkout process
 */
async function handleDuitkuCheckout(event) {
    event.preventDefault();
    
    const button = event.currentTarget;
    const originalText = button.innerHTML;
    
    // Show loading state
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    
    try {
        // Get product data from button attributes
        const productName = button.getAttribute('data-name');
        const price = button.getAttribute('data-price');
        
        if (!productName || !price) {
            throw new Error('Data produk tidak lengkap');
        }
        
        // Prepare payload for backend API
        const payload = {
            productName: productName,
            price: parseInt(price)
        };
        
        // Call backend API to create payment
        const response = await fetch(getApiUrl('CREATE_PAYMENT'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Gagal membuat pembayaran');
        }
        
        const data = await response.json();
        
        if (data.paymentUrl) {
            // Store payment URL and order ID in payment store
            if (data.merchantOrderId) {
                paymentStore.setCurrentOrderId(data.merchantOrderId);
                paymentStore.setDuitkuPaymentUrl(data.paymentUrl);
                
                // Show notification with expiration information
                const expiryMinutes = Math.floor(paymentStore.getDuitkuPaymentUrlRemainingTime() / 60);
                showNotification(`Link pembayaran valid selama ${expiryMinutes} menit`, 'info');
            }
            
            // Redirect to Duitku payment page after a short delay to show notification
            showNotification('Mengarahkan ke halaman pembayaran...', 'success');
            setTimeout(() => {
                window.location.href = data.paymentUrl;
            }, 1000);
        } else {
            throw new Error('URL pembayaran tidak ditemukan');
        }
        
    } catch (error) {
        console.error('Checkout error:', error);
        showNotification(error.message || 'Terjadi kesalahan saat checkout. Silakan coba lagi.', 'error');
    } finally {
        // Reset button
        button.disabled = false;
        button.innerHTML = originalText;
    }
}

/**
 * Simulate checkout process
 */
function simulateCheckout(productData) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('Checkout for:', productData);
            resolve();
        }, 1500);
    });
}

/**
 * Check if there's a pending order and show status tracking option
 */
function checkPendingOrder() {
    const currentOrderId = localStorage.getItem('currentOrderId');
    if (currentOrderId) {
        // Add status tracking option to navbar
        addStatusTrackingToNavbar(currentOrderId);
        
        // Start periodic status checking
        setInterval(autoCheckOrderStatus, 30000); // Check every 30 seconds
    }
}

/**
 * Add order status tracking link to navbar
 */
function addStatusTrackingToNavbar(orderId) {
    const navbar = document.querySelector('.navbar .nav-links');
    if (!navbar || navbar.querySelector('.order-status-link')) return;
    
    const statusLink = document.createElement('li');
    statusLink.innerHTML = `
        <a href="payment-status?merchantOrderId=${orderId}" class="nav-link order-status-link">
            <i class="fas fa-receipt"></i>
            <span>Cek Status</span>
        </a>
    `;
    statusLink.classList.add('order-status-item');
    
    // Insert before Digital Store link
    const digitalStoreLink = navbar.querySelector('li:last-child');
    navbar.insertBefore(statusLink, digitalStoreLink);
    
    // Add notification badge
    const badge = document.createElement('span');
    badge.className = 'status-badge';
    badge.textContent = '!';
    badge.style.cssText = `
        position: absolute;
        top: -5px;
        right: -10px;
        background: #ff4757;
        color: white;
        border-radius: 50%;
        width: 18px;
        height: 18px;
        font-size: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
    `;
    statusLink.querySelector('.nav-link').style.position = 'relative';
    statusLink.querySelector('.nav-link').appendChild(badge);
}

/**
 * Remove order status tracking from navbar
 */
function removeStatusTrackingFromNavbar() {
    const statusItem = document.querySelector('.order-status-item');
    if (statusItem) {
        statusItem.remove();
    }
    localStorage.removeItem('currentOrderId');
}

/**
 * Auto-check order status periodically
 */
async function autoCheckOrderStatus() {
    const currentOrderId = localStorage.getItem('currentOrderId');
    if (!currentOrderId) return;
    
    try {
        const response = await fetch(getOrderStatusUrl(currentOrderId));
        if (response.ok) {
            const data = await response.json();
            
            if (data.found && (data.status === 'SUCCESS' || data.status === 'FAILED')) {
                // Order completed, show notification and remove tracking
                showOrderCompletionNotification(data);
                removeStatusTrackingFromNavbar();
            }
        }
    } catch (error) {
        console.error('Auto-check error:', error);
    }
}

/**
 * Show order completion notification
 */
function showOrderCompletionNotification(orderData) {
    const message = orderData.status === 'SUCCESS' 
        ? 'Pembayaran Anda telah berhasil!' 
        : 'Pembayaran Anda gagal. Silakan coba lagi.';
    
    const type = orderData.status === 'SUCCESS' ? 'success' : 'error';
    
    showNotification(message, type, 5000);
    
    if (orderData.status === 'SUCCESS') {
        // Show fulfillment notification
        setTimeout(() => {
            const fulfillmentLink = ` <a href="fulfillment.html?merchantOrderId=${orderData.merchantOrderId}" style="color: white; text-decoration: underline;">Lihat Pengiriman Produk</a>`;
            showNotification('Produk Anda siap untuk dikirim!' + fulfillmentLink, 'success', 10000);
        }, 1000);
    } else {
        // Show error notification
        setTimeout(() => {
            const detailLink = ` <a href="payment-status?merchantOrderId=${orderData.merchantOrderId}" style="color: white; text-decoration: underline;">Lihat Detail</a>`;
            showNotification(message + detailLink, type, 10000);
        }, 1000);
    }
}

// ==============================================
// INITIALIZATION
// ==============================================
export function initComponents() {
    console.log('🧩 Components module initialized');
    
    initPortfolioFilter();
    initContactForm();
    initTestimonials();
    initServiceCards();
    initSkillsProgress();
    initDuitkuCheckout();
    
    // Check for pending orders
    checkPendingOrder();
}

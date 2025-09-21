/**
 * Contact Form Handler for Hanzamas.tech
 * This module handles the contact form submission to Netlify functions
 */

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactFormSubmit);
    }
});

/**
 * Handle the contact form submission
 * @param {Event} event - The form submit event
 */
async function handleContactFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    
    // Get form data
    const name = form.querySelector('[name="name"]').value;
    const email = form.querySelector('[name="email"]').value;
    const subject = form.querySelector('[name="subject"]').value;
    const message = form.querySelector('[name="message"]').value;
    
    // Validate form
    if (!name || !email || !message) {
        showFormMessage('error', 'Please fill all required fields');
        return;
    }
    
    // Email validation
    if (!validateEmail(email)) {
        showFormMessage('error', 'Please enter a valid email address');
        return;
    }
    
    // Update button state
    submitButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Sending...`;
    submitButton.disabled = true;
    
    try {
        // Get netlify function URL - works in both dev and production
        const functionUrl = '/.netlify/functions/send-contact';
        
        console.log('Submitting form to:', functionUrl);
        
        // Submit to serverless function
        const response = await fetch(functionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                email,
                subject,
                message
            })
        });
        
        // Handle HTTP errors properly
        if (!response.ok) {
            const contentType = response.headers.get("content-type");
            
            if (contentType && contentType.includes("application/json")) {
                // If response is JSON, try to parse error message
                const errorData = await response.json();
                throw new Error(errorData.error || `Server error: ${response.status}`);
            } else {
                // If response is not JSON (e.g., HTML error page), throw a generic error
                console.error('Non-JSON error response:', await response.text());
                throw new Error(`Server error (${response.status}): Function might not be deployed correctly`);
            }
        }
        
        // Show success message
        showFormMessage('success', 'Your message has been sent successfully!');
        
        // Reset the form
        form.reset();
        
    } catch (error) {
        console.error("Error submitting contact form:", error);
        showFormMessage('error', error.message || 'An error occurred. Please try again later.');
    } finally {
        // Restore button state
        submitButton.innerHTML = originalButtonText;
        submitButton.disabled = false;
    }
}

/**
 * Display form submission message
 * @param {string} type - 'success' or 'error'
 * @param {string} message - The message to display
 */
function showFormMessage(type, message) {
    // Find or create message element
    let messageEl = document.getElementById('formMessage');
    
    if (!messageEl) {
        messageEl = document.createElement('div');
        messageEl.id = 'formMessage';
        const contactForm = document.getElementById('contactForm');
        contactForm.parentNode.insertBefore(messageEl, contactForm.nextSibling);
    }
    
    // Set message content and style
    messageEl.className = `form-message ${type}`;
    messageEl.innerHTML = `
        <div class="message-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            ${message}
        </div>
    `;
    
    // Scroll to message
    messageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Auto-hide after some time for success messages
    if (type === 'success') {
        setTimeout(() => {
            messageEl.style.opacity = '0';
            setTimeout(() => {
                messageEl.remove();
            }, 500);
        }, 5000);
    }
}

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} - Whether email is valid
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Contact Form Handler
 * ==================
 * Handles contact form submission with API integration
 */

class ContactForm {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.responseMessage = document.getElementById('responseMessage');
        this.submitBtn = this.form.querySelector('.btn-submit');
        this.btnText = this.submitBtn.querySelector('.btn-text');
        this.apiUrl = 'https://be.hanzamas.tech/api/payment/contact-form';
        
        this.init();
    }
    
    init() {
        console.log('ContactForm init called');
        if (this.form) {
            console.log('Contact form found, adding event listener');
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        } else {
            console.error('Contact form not found!');
        }
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());
        
        // Remove empty optional fields
        if (!data.phone) delete data.phone;
        if (!data.subject) delete data.subject;
        
        console.log('Form data:', data);
        
        // Validation
        if (!this.validateForm(data)) {
            return;
        }
        
        // Show loading state
        this.setLoading(true);
        
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('API Response:', result);
            
            if (result.status === 'success') {
                this.showMessage(result.message || 'Your message has been sent successfully. We will get back to you soon!', 'success');
                this.form.reset();
            } else {
                this.showMessage(result.message || 'Failed to send message. Please try again.', 'error');
            }
            
        } catch (error) {
            console.error('Error submitting form:', error);
            
            // More specific error messages
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                this.showMessage('Unable to connect to server. Please check your internet connection and try again.', 'error');
            } else if (error.message.includes('CORS')) {
                this.showMessage('CORS error. Please contact the administrator.', 'error');
            } else {
                this.showMessage('An error occurred while sending your message. Please try again or contact us directly via email.', 'error');
            }
        } finally {
            this.setLoading(false);
        }
    }
    
    validateForm(data) {
        // Check required fields
        if (!data.name || !data.email || !data.message) {
            this.showMessage('Please fill in all required fields (Name, Email, Message).', 'error');
            return false;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            this.showMessage('Please enter a valid email address.', 'error');
            return false;
        }
        
        // Validate message length
        if (data.message.length < 10) {
            this.showMessage('Please enter a message with at least 10 characters.', 'error');
            return false;
        }
        
        return true;
    }
    
    showMessage(message, type) {
        this.responseMessage.textContent = message;
        this.responseMessage.className = `response-message ${type}`;
        this.responseMessage.style.display = 'block';
        
        // Scroll to message
        this.responseMessage.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
        
        // Auto-hide success messages after 8 seconds
        if (type === 'success') {
            setTimeout(() => {
                this.hideMessage();
            }, 8000);
        }
    }
    
    hideMessage() {
        this.responseMessage.style.display = 'none';
    }
    
    setLoading(loading) {
        if (loading) {
            this.submitBtn.disabled = true;
            this.submitBtn.classList.add('loading');
            this.btnText.textContent = 'Sending...';
        } else {
            this.submitBtn.disabled = false;
            this.submitBtn.classList.remove('loading');
            this.btnText.textContent = 'Send Message';
        }
    }
}

// Initialize contact form when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Contact form initializing...');
    new ContactForm();
});

// Also handle if script loads after DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ContactForm();
    });
} else {
    new ContactForm();
}
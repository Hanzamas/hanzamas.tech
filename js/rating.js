/**
 * Customer Rating System for Hanzamas.tech
 * This module handles customer ratings for completed orders
 */

// Rating utility functions
const ratingUtils = {
    /**
     * Submit a rating for a completed order
     * @param {string} orderId - The order ID
     * @param {number} rating - Rating value (1-5)
     * @param {string} productName - The product name
     * @param {string} comment - Optional customer feedback
     * @returns {Promise} - Resolution of the rating submission
     */
    submitRating: async function(orderId, rating, productName, comment = "") {
        if (!orderId || !rating) {
            throw new Error("Order ID and rating are required");
        }
        
        // Validate rating value
        const ratingValue = parseInt(rating);
        if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
            throw new Error("Rating must be a number between 1 and 5");
        }
        
        try {
            // Get netlify function URL - works in both dev and production
            const functionUrl = '/.netlify/functions/save-rating';
            
            // Submit to serverless function
            const response = await fetch(functionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orderId: orderId,
                    rating: ratingValue,
                    productName: productName,
                    comment: comment
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to submit rating');
            }
            
            return await response.json();
        } catch (error) {
            console.error("Error submitting rating:", error);
            throw error;
        }
    },
    
    /**
     * Initialize rating widgets in the page
     */
    initRatingWidgets: function() {
        // Find all rating widgets
        const ratingWidgets = document.querySelectorAll('.rating-widget');
        
        ratingWidgets.forEach(widget => {
            const stars = widget.querySelectorAll('.star');
            const ratingInput = widget.querySelector('input[type="hidden"]');
            const orderId = widget.dataset.orderId;
            const productName = widget.dataset.productName;
            const submitButton = widget.querySelector('.submit-rating');
            const commentField = widget.querySelector('.rating-comment');
            
            // Handle star selection
            stars.forEach((star, index) => {
                star.addEventListener('click', function() {
                    const ratingValue = index + 1;
                    
                    // Update visual state
                    stars.forEach((s, i) => {
                        s.classList.toggle('active', i < ratingValue);
                    });
                    
                    // Update hidden input
                    if (ratingInput) {
                        ratingInput.value = ratingValue;
                    }
                });
                
                // Hover effects
                star.addEventListener('mouseenter', function() {
                    const ratingValue = index + 1;
                    stars.forEach((s, i) => {
                        s.classList.toggle('hover', i < ratingValue);
                    });
                });
                
                star.addEventListener('mouseleave', function() {
                    stars.forEach(s => s.classList.remove('hover'));
                });
            });
            
            // Handle submission
            if (submitButton) {
                submitButton.addEventListener('click', async function(e) {
                    e.preventDefault();
                    
                    const ratingValue = ratingInput ? parseInt(ratingInput.value) : 0;
                    const comment = commentField ? commentField.value : "";
                    
                    if (!ratingValue) {
                        alert("Please select a rating before submitting");
                        return;
                    }
                    
                    try {
                        submitButton.disabled = true;
                        submitButton.textContent = "Submitting...";
                        
                        await ratingUtils.submitRating(
                            orderId, 
                            ratingValue, 
                            productName, 
                            comment
                        );
                        
                        // Show success message
                        widget.innerHTML = `
                            <div class="rating-success">
                                <h3>Thank You!</h3>
                                <p>Your rating has been submitted successfully.</p>
                                <div class="final-rating">
                                    ${'★'.repeat(ratingValue)}${'☆'.repeat(5-ratingValue)}
                                </div>
                            </div>
                        `;
                        
                        // Save rating to localStorage to prevent multiple submissions
                        localStorage.setItem(`rating_${orderId}`, ratingValue);
                        
                    } catch (error) {
                        alert(`Error submitting rating: ${error.message}`);
                        submitButton.disabled = false;
                        submitButton.textContent = "Submit Rating";
                    }
                });
            }
            
            // Check if user already submitted a rating
            const existingRating = localStorage.getItem(`rating_${orderId}`);
            if (existingRating) {
                const ratingValue = parseInt(existingRating);
                
                // Show readonly rating
                widget.innerHTML = `
                    <div class="rating-success">
                        <h3>Thank You!</h3>
                        <p>You've already rated this order.</p>
                        <div class="final-rating">
                            ${'★'.repeat(ratingValue)}${'☆'.repeat(5-ratingValue)}
                        </div>
                    </div>
                `;
            }
        });
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize rating widgets if any exist on the page
    if (document.querySelector('.rating-widget')) {
        ratingUtils.initRatingWidgets();
    }
});

// Export for use in other modules
if (typeof exports !== 'undefined') {
    exports.ratingUtils = ratingUtils;
}

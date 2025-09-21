// Configuration for API endpoints
export const API_CONFIG = {
    // Update this URL with your actual backend URL when deployed
    BACKEND_URL: 'https://be.hanzamas.tech',
    
    // API endpoints
    ENDPOINTS: {
        CREATE_PAYMENT: '/api/create_payment',
        CHECK_PAYMENT: '/api/check_payment',
        ORDER_STATUS: '/api/order_status',  // Get order status by ID
        CALLBACK: '/api/callback',
        SIMULATE_CALLBACK: '/api/simulate_callback', // Added for testing
        FULFILLMENT: '/api/fulfillment',  // Get fulfillment status
        FULFILLMENT_UPDATE: '/api/fulfillment/update'  // Update fulfillment status
    },
    
    // Frontend URLs - Sudah digunakan di backend
    FRONTEND: {
        RETURN_URL: 'https://hanzamas.tech/payment-status',
        SUCCESS_URL: 'https://hanzamas.tech/payment-success', 
        FAILURE_URL: 'https://hanzamas.tech/payment-failure',
        HOME_URL: 'https://hanzamas.tech',
        FULFILLMENT_URL: 'https://hanzamas.tech/fulfillment.html' // URL untuk halaman fulfillment
    }
};

// Helper function to get full API URL
export function getApiUrl(endpoint) {
    return API_CONFIG.BACKEND_URL + API_CONFIG.ENDPOINTS[endpoint];
}

// Helper function to get order status URL
export function getOrderStatusUrl(merchantOrderId) {
    return `${API_CONFIG.BACKEND_URL}${API_CONFIG.ENDPOINTS.ORDER_STATUS}/${merchantOrderId}`;
}

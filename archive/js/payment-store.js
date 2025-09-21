/**
 * Payment Store - Central storage for payment-related data
 * Provides a more reliable alternative to localStorage for storing payment URLs
 * and other payment-related information.
 */

// Module-level storage that persists between page loads within the same session
let paymentStore = {
  // Default empty state
  duitkuPaymentUrl: null,
  duitkuPaymentExpiry: null,
  currentOrderId: null,
  
  // Initialize store from localStorage if available (for backwards compatibility)
  init() {
    try {
      // Try to load existing data from localStorage
      const lastPaymentData = JSON.parse(localStorage.getItem('lastPaymentData') || '{}');
      if (lastPaymentData.url && lastPaymentData.expiry) {
        this.duitkuPaymentUrl = lastPaymentData.url;
        this.duitkuPaymentExpiry = lastPaymentData.expiry;
      }
      
      const orderId = localStorage.getItem('currentOrderId');
      if (orderId) {
        this.currentOrderId = orderId;
      }
    } catch (error) {
      console.error('Failed to initialize payment store from localStorage:', error);
    }
  },
  
  // Set Duitku payment URL with expiration
  setDuitkuPaymentUrl(url, expiryMinutes = 30) {
    this.duitkuPaymentUrl = url;
    this.duitkuPaymentExpiry = new Date().getTime() + (expiryMinutes * 60 * 1000);
    
    // Also update localStorage for backwards compatibility
    try {
      const paymentData = {
        url: this.duitkuPaymentUrl,
        expiry: this.duitkuPaymentExpiry
      };
      localStorage.setItem('lastPaymentData', JSON.stringify(paymentData));
    } catch (error) {
      console.error('Failed to save payment URL to localStorage:', error);
    }
  },
  
  // Get Duitku payment URL if not expired
  getDuitkuPaymentUrl() {
    // If URL is expired or doesn't exist, return null
    if (!this.duitkuPaymentUrl || !this.duitkuPaymentExpiry || new Date().getTime() > this.duitkuPaymentExpiry) {
      return null;
    }
    
    return this.duitkuPaymentUrl;
  },
  
  // Check if Duitku payment URL is expired
  isDuitkuPaymentUrlExpired() {
    return !this.duitkuPaymentUrl || !this.duitkuPaymentExpiry || new Date().getTime() > this.duitkuPaymentExpiry;
  },
  
  // Get remaining time in seconds until URL expiration
  getDuitkuPaymentUrlRemainingTime() {
    if (!this.duitkuPaymentExpiry) {
      return 0;
    }
    
    const remainingMs = this.duitkuPaymentExpiry - new Date().getTime();
    return Math.max(0, Math.floor(remainingMs / 1000));
  },
  
  // Set current order ID
  setCurrentOrderId(orderId) {
    this.currentOrderId = orderId;
    
    // Update localStorage for backwards compatibility
    try {
      localStorage.setItem('currentOrderId', orderId);
    } catch (error) {
      console.error('Failed to save order ID to localStorage:', error);
    }
  },
  
  // Get current order ID
  getCurrentOrderId() {
    return this.currentOrderId;
  },
  
  // Clear all payment data
  clearPaymentData() {
    this.duitkuPaymentUrl = null;
    this.duitkuPaymentExpiry = null;
    this.currentOrderId = null;
    
    // Clear localStorage for backwards compatibility
    try {
      localStorage.removeItem('lastPaymentData');
      localStorage.removeItem('currentOrderId');
    } catch (error) {
      console.error('Failed to clear payment data from localStorage:', error);
    }
  }
};

// Initialize store when module is loaded
paymentStore.init();

export default paymentStore;

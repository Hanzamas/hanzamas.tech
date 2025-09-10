/**
 * Order Management System
 * ======================
 * Handles order tracking, storage, and fulfillment without a database
 * Uses Netlify functions for processing and local storage for client-side tracking
 */

import { getApiUrl } from './config.js';
import { showNotification } from './core.js';

// Storage keys
const STORAGE_KEYS = {
    ORDERS: 'hanzamas_orders',
    CURRENT_ORDER: 'currentOrderId',
    USER_EMAIL: 'user_email',
    USER_NAME: 'user_name'
};

/**
 * Order statuses
 */
export const ORDER_STATUS = {
    PENDING: 'PENDING',
    PAID: 'PAID', 
    PROCESSING: 'PROCESSING',
    FULFILLED: 'FULFILLED',
    FAILED: 'FAILED'
};

/**
 * Save order to local storage
 */
export function saveOrder(orderData) {
    try {
        // Get existing orders or initialize empty array
        const existingOrders = getOrders();
        
        // Add new order
        existingOrders.push({
            ...orderData,
            createdAt: new Date().toISOString(),
            status: ORDER_STATUS.PENDING
        });
        
        // Save back to storage
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(existingOrders));
        
        return true;
    } catch (error) {
        console.error('Error saving order:', error);
        return false;
    }
}

/**
 * Get all orders from local storage
 */
export function getOrders() {
    try {
        const orders = localStorage.getItem(STORAGE_KEYS.ORDERS);
        return orders ? JSON.parse(orders) : [];
    } catch (error) {
        console.error('Error getting orders:', error);
        return [];
    }
}

/**
 * Get specific order by ID
 */
export function getOrderById(orderId) {
    try {
        const orders = getOrders();
        return orders.find(order => order.merchantOrderId === orderId);
    } catch (error) {
        console.error('Error getting order by ID:', error);
        return null;
    }
}

/**
 * Update order status
 */
export function updateOrderStatus(orderId, newStatus, additionalData = {}) {
    try {
        const orders = getOrders();
        const orderIndex = orders.findIndex(order => order.merchantOrderId === orderId);
        
        if (orderIndex === -1) return false;
        
        // Update order
        orders[orderIndex] = {
            ...orders[orderIndex],
            status: newStatus,
            lastUpdated: new Date().toISOString(),
            ...additionalData
        };
        
        // Save back to storage
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
        
        return true;
    } catch (error) {
        console.error('Error updating order status:', error);
        return false;
    }
}

/**
 * Save user information for order
 */
export function saveUserInfo(name, email) {
    try {
        localStorage.setItem(STORAGE_KEYS.USER_NAME, name);
        localStorage.setItem(STORAGE_KEYS.USER_EMAIL, email);
        return true;
    } catch (error) {
        console.error('Error saving user info:', error);
        return false;
    }
}

/**
 * Get user information
 */
export function getUserInfo() {
    try {
        return {
            name: localStorage.getItem(STORAGE_KEYS.USER_NAME) || '',
            email: localStorage.getItem(STORAGE_KEYS.USER_EMAIL) || ''
        };
    } catch (error) {
        console.error('Error getting user info:', error);
        return { name: '', email: '' };
    }
}

/**
 * Send order fulfillment request to admin
 */
export async function requestOrderFulfillment(orderId) {
    try {
        const order = getOrderById(orderId);
        if (!order) throw new Error('Order not found');
        
        const userInfo = getUserInfo();
        
        // Update fulfillment status di backend
        const fulfillmentResponse = await fetch(getApiUrl('BACKEND_URL') + '/api/fulfillment/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                merchantOrderId: orderId,
                status: 'PROCESSING',
                customerEmail: userInfo.email,
                customerName: userInfo.name
            })
        });
        
        // Jika backend bermasalah, gunakan fallback ke Netlify function
        if (!fulfillmentResponse.ok) {
            console.warn('Backend fulfillment update failed, using Netlify function fallback');
            
            // Fallback: Send email notification to admin using Netlify function
            const response = await fetch('/.netlify/functions/notify-admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orderId: order.merchantOrderId,
                    productName: order.productName,
                    amount: order.amount,
                    customerName: userInfo.name,
                    customerEmail: userInfo.email,
                    paymentMethod: order.paymentMethod || 'Unknown'
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to notify admin');
            }
        }
        
        // Update order status di localStorage
        updateOrderStatus(orderId, ORDER_STATUS.PROCESSING);
        
        return true;
    } catch (error) {
        console.error('Error requesting fulfillment:', error);
        return false;
    }
}

/**
 * Display order fulfillment UI
 */
export function displayOrderFulfillment(containerId, orderId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const order = getOrderById(orderId);
    if (!order) {
        container.innerHTML = `
            <div class="fulfillment-error">
                <i class="fas fa-exclamation-circle"></i>
                <p>Order not found. Please contact support with your order ID.</p>
            </div>
        `;
        return;
    }
    
    let fulfillmentHtml = '';
    
    switch(order.status) {
        case ORDER_STATUS.PAID:
            // Pre-fill user info if available
            const userInfo = getUserInfo();
            
            fulfillmentHtml = `
                <div class="fulfillment-step">
                    <div class="fulfillment-icon paid">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="fulfillment-content">
                        <h3>Pembayaran Berhasil</h3>
                        <p>Pembayaran untuk ${order.productName} telah berhasil.</p>
                        <div class="user-info-form fulfillment-form">
                            <h4>Masukkan Informasi Kontak</h4>
                            <p style="color: #ffffff; margin-bottom: 20px; text-align: center;">Kami memerlukan informasi kontak Anda untuk mengirimkan produk.</p>
                            <div class="form-group">
                                <label for="fullName">Nama Lengkap</label>
                                <input type="text" id="fullName" placeholder="Masukkan nama lengkap" value="${userInfo.name || ''}">
                            </div>
                            <div class="form-group">
                                <label for="email">Email</label>
                                <input type="email" id="email" placeholder="Masukkan email" value="${userInfo.email || ''}">
                            </div>
                            <button id="submitUserInfo" class="btn-action btn-primary">
                                <i class="fas fa-paper-plane"></i> Kirim & Mulai Proses
                            </button>
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case ORDER_STATUS.PROCESSING:
            fulfillmentHtml = `
                <div class="fulfillment-step">
                    <div class="fulfillment-icon processing">
                        <i class="fas fa-cog fa-spin"></i>
                    </div>
                    <div class="fulfillment-content">
                        <h3>Dalam Proses</h3>
                        <p>Pesanan Anda sedang diproses. Admin akan menghubungi Anda melalui email yang telah disediakan.</p>
                        <div class="fulfillment-details">
                            <div class="detail-item">
                                <span class="detail-label">Estimasi Waktu</span>
                                <span class="detail-value">1-2 hari kerja</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Email</span>
                                <span class="detail-value">${getUserInfo().email}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case ORDER_STATUS.FULFILLED:
            fulfillmentHtml = `
                <div class="fulfillment-step">
                    <div class="fulfillment-icon fulfilled">
                        <i class="fas fa-gift"></i>
                    </div>
                    <div class="fulfillment-content">
                        <h3>Produk Telah Dikirim</h3>
                        <p>Produk Anda telah dikirim ke email terdaftar. Silakan cek inbox atau folder spam Anda.</p>
                        <div class="fulfillment-details">
                            <div class="detail-item">
                                <span class="detail-label">Tanggal Pengiriman</span>
                                <span class="detail-value">${new Date(order.lastUpdated).toLocaleDateString('id-ID')}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Email</span>
                                <span class="detail-value">${getUserInfo().email}</span>
                            </div>
                        </div>
                        <div class="feedback-section">
                            <h4>Bagaimana pengalaman Anda?</h4>
                            <div class="rating-stars">
                                <i class="far fa-star" data-rating="1"></i>
                                <i class="far fa-star" data-rating="2"></i>
                                <i class="far fa-star" data-rating="3"></i>
                                <i class="far fa-star" data-rating="4"></i>
                                <i class="far fa-star" data-rating="5"></i>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            break;
            
        default:
            fulfillmentHtml = `
                <div class="fulfillment-step">
                    <div class="fulfillment-icon pending">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="fulfillment-content">
                        <h3>Menunggu Konfirmasi</h3>
                        <p>Kami sedang menunggu konfirmasi pembayaran dari Duitku. Harap tunggu.</p>
                        <button id="checkStatus" class="btn-action btn-secondary">
                            <i class="fas fa-sync-alt"></i> Periksa Status
                        </button>
                    </div>
                </div>
            `;
    }
    
    container.innerHTML = `
        <div class="fulfillment-container">
            <h2 class="fulfillment-title">Status Pesanan #${order.merchantOrderId}</h2>
            ${fulfillmentHtml}
        </div>
    `;
    
    // Add event listeners
    initFulfillmentEvents(container, order);
}

/**
 * Initialize fulfillment UI event listeners
 */
function initFulfillmentEvents(container, order) {
    // Ensure form is fully visible and not hidden by any CSS
    const userInfoForm = container.querySelector('.user-info-form');
    if (userInfoForm) {
        console.log('Form found, ensuring visibility');
        userInfoForm.style.display = 'block';
        userInfoForm.style.visibility = 'visible';
        userInfoForm.style.opacity = '1';
        userInfoForm.style.background = 'rgba(255, 255, 255, 0.2)';
        userInfoForm.style.border = '2px solid rgba(255, 255, 255, 0.4)';
        userInfoForm.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
        userInfoForm.style.borderRadius = '10px';
        userInfoForm.style.padding = '20px';
        userInfoForm.style.zIndex = '100';
    }
    
    // Submit user info button
    const submitBtn = container.querySelector('#submitUserInfo');
    if (submitBtn) {
        console.log('Submit button found, adding event listener');
        submitBtn.addEventListener('click', async () => {
            const nameInput = container.querySelector('#fullName');
            const emailInput = container.querySelector('#email');
            
            console.log('Inputs found:', nameInput, emailInput);
            
            // Validate
            if (!nameInput || !emailInput || !nameInput.value || !emailInput.value) {
                showNotification('Mohon isi semua field', 'error');
                return;
            }
            
            // Save user info
            saveUserInfo(nameInput.value, emailInput.value);
            
            // Show loading
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
            
            // Request fulfillment
            const success = await requestOrderFulfillment(order.merchantOrderId);
            
            if (success) {
                showNotification('Informasi Anda telah disimpan. Admin akan segera menghubungi Anda.', 'success');
                // Refresh fulfillment UI
                displayOrderFulfillment(container.id, order.merchantOrderId);
            } else {
                showNotification('Gagal mengirim informasi. Silakan coba lagi.', 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Kirim & Mulai Proses';
            }
        });
    }
    
    // Check status button
    const checkStatusBtn = container.querySelector('#checkStatus');
    if (checkStatusBtn) {
        checkStatusBtn.addEventListener('click', async () => {
            // Show loading
            checkStatusBtn.disabled = true;
            checkStatusBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memeriksa...';
            
            try {
                // Call backend to check status (menggunakan format GET yang benar)
                const response = await fetch(`${getApiUrl('BACKEND_URL')}/api/order_status/${order.merchantOrderId}`);
                
                if (response.ok) {
                    const data = await response.json();
                    
                    if (data.found && data.status === 'SUCCESS') {
                        updateOrderStatus(order.merchantOrderId, ORDER_STATUS.PAID, {
                            reference: data.reference,
                            paymentMethod: data.paymentMethod,
                            amount: data.amount,
                            productName: data.productDetail || order.productName
                        });
                        
                        showNotification('Pembayaran telah dikonfirmasi!', 'success');
                        // Refresh UI
                        displayOrderFulfillment(container.id, order.merchantOrderId);
                    } else {
                        showNotification('Pembayaran belum dikonfirmasi. Harap tunggu.', 'info');
                    }
                } else {
                    // Fallback to old endpoint jika yang baru tidak berhasil
                    const legacyResponse = await fetch(getApiUrl('CHECK_PAYMENT') + '?merchantOrderId=' + order.merchantOrderId, {
                        method: 'GET'
                    });
                    
                    if (legacyResponse.ok) {
                        const legacyData = await legacyResponse.json();
                        if (legacyData.statusCode === '00') {
                            updateOrderStatus(order.merchantOrderId, ORDER_STATUS.PAID, {
                                reference: legacyData.reference,
                                amount: legacyData.amount
                            });
                            
                            showNotification('Pembayaran telah dikonfirmasi!', 'success');
                            // Refresh UI
                            displayOrderFulfillment(container.id, order.merchantOrderId);
                        } else {
                            showNotification('Pembayaran belum dikonfirmasi. Harap tunggu.', 'info');
                        }
                    } else {
                        throw new Error('Semua endpoint status gagal merespon');
                    }
                }
            } catch (error) {
                console.error('Error checking status:', error);
                showNotification('Gagal memeriksa status. Silakan coba lagi.', 'error');
            } finally {
                // Reset button
                checkStatusBtn.disabled = false;
                checkStatusBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Periksa Status';
            }
        });
    }
    
    // Rating stars
    const ratingStars = container.querySelectorAll('.rating-stars i');
    if (ratingStars.length) {
        ratingStars.forEach(star => {
            star.addEventListener('mouseover', () => {
                const rating = parseInt(star.dataset.rating);
                
                // Highlight stars
                ratingStars.forEach((s, index) => {
                    if (index < rating) {
                        s.classList.remove('far');
                        s.classList.add('fas');
                    } else {
                        s.classList.remove('fas');
                        s.classList.add('far');
                    }
                });
            });
            
            star.addEventListener('click', async () => {
                const rating = parseInt(star.dataset.rating);
                
                try {
                    // Send rating to backend
                    await fetch('/.netlify/functions/save-rating', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            orderId: order.merchantOrderId,
                            rating: rating
                        })
                    });
                    
                    showNotification('Terima kasih atas penilaian Anda!', 'success');
                } catch (error) {
                    console.error('Error saving rating:', error);
                }
            });
        });
        
        // Reset on mouse out
        const ratingContainer = container.querySelector('.rating-stars');
        ratingContainer.addEventListener('mouseout', () => {
            ratingStars.forEach(s => {
                s.classList.remove('fas');
                s.classList.add('far');
            });
        });
    }
}

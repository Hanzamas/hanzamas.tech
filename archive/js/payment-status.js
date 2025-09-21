// Payment Status Page JavaScript with Real-time Polling
// This file handles the payment status display logic with real-time polling

import { API_CONFIG, getOrderStatusUrl } from './config.js';
import paymentStore from './payment-store.js';

// Status polling configuration
const POLLING_CONFIG = {
    INTERVAL: 3000, // Poll every 3 seconds
    MAX_ATTEMPTS: 20, // Stop after 60 seconds (20 * 3)
    RETRY_DELAY: 5000 // Retry delay after failed attempts
};

let pollCount = 0;
let pollInterval = null;

/**
 * Get URL parameter value
 */
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

/**
 * Format rupiah currency
 */
function formatRupiah(amount) {
    if (!amount) return '';
    return 'Rp ' + parseInt(amount).toLocaleString('id-ID');
}

/**
 * Show loading status with polling indication
 */
function showLoadingStatus(merchantOrderId) {
    const statusContent = document.getElementById('statusContent');
    statusContent.innerHTML = `
        <div class="status-icon pending">
            <i class="fas fa-sync-alt fa-spin"></i>
        </div>
        <h1 class="status-title">Mengecek Status Pembayaran...</h1>
        <p class="status-message">
            Mohon tunggu, kami sedang memverifikasi pembayaran Anda.
        </p>
        <div class="reference-info">
            <div class="reference-label">Order ID</div>
            <div class="reference-value">${merchantOrderId}</div>
        </div>
        <div class="polling-indicator">
            <div class="polling-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
            <p>Checking payment status... (${pollCount}/${POLLING_CONFIG.MAX_ATTEMPTS})</p>
        </div>
        <div class="action-buttons">
            <button id="stopCheckingBtn" class="btn-action btn-secondary">
                <i class="fas fa-stop"></i>
                Stop Checking
            </button>
        </div>
        <div class="sandbox-testing">
            <h3 class="sandbox-title">Sandbox Testing</h3>
            <p class="sandbox-description">Simulasikan callback untuk testing:</p>
            <div class="sandbox-buttons">
                <button id="simulateSuccessBtn" class="btn-action btn-success">
                    <i class="fas fa-check-circle"></i>
                    Simulasi Sukses
                </button>
                <button id="simulateFailureBtn" class="btn-action btn-danger">
                    <i class="fas fa-times-circle"></i>
                    Simulasi Gagal
                </button>
            </div>
        </div>
    `;
    
    // Attach event listeners to new buttons
    document.getElementById('stopCheckingBtn').addEventListener('click', function() {
        stopPolling();
        showNotification('Status checking stopped', 'info');
    });
    
    document.getElementById('simulateSuccessBtn').addEventListener('click', function() {
        simulateCallback(merchantOrderId, '00');
    });
    
    document.getElementById('simulateFailureBtn').addEventListener('click', function() {
        simulateCallback(merchantOrderId, '02');
    });
}

/**
 * Poll order status from backend
 */
async function pollOrderStatus(merchantOrderId) {
    try {
        pollCount++;
        showLoadingStatus(merchantOrderId);
        
        const response = await fetch(getOrderStatusUrl(merchantOrderId), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.found) {
                // Order status found, stop polling and display result
                stopPolling();
                displayOrderStatus(data);
                return true;
            }
        }
        
        // Continue polling if order not found or no definitive status
        if (pollCount >= POLLING_CONFIG.MAX_ATTEMPTS) {
            stopPolling();
            displayTimeoutStatus(merchantOrderId);
            return false;
        }
        
        return false;
        
    } catch (error) {
        console.error('Polling error:', error);
        
        if (pollCount >= POLLING_CONFIG.MAX_ATTEMPTS) {
            stopPolling();
            displayErrorStatus(merchantOrderId, error.message);
            return false;
        }
        
        return false;
    }
}

/**
 * Start polling for order status
 */
function startPolling(merchantOrderId) {
    pollCount = 0;
    
    // Initial poll
    pollOrderStatus(merchantOrderId);
    
    // Set up interval polling
    pollInterval = setInterval(() => {
        pollOrderStatus(merchantOrderId);
    }, POLLING_CONFIG.INTERVAL);
}

/**
 * Stop polling
 */
function stopPolling() {
    if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
    }
}

/**
 * Display order status from backend storage
 */
function displayOrderStatus(orderData) {
    const statusContent = document.getElementById('statusContent');
    let statusHtml = '';
    
    switch(orderData.status) {
        case 'SUCCESS':
            statusHtml = `
                <div class="status-icon success">
                    <i class="fas fa-check"></i>
                </div>
                <h1 class="status-title">Pembayaran Berhasil!</h1>
                <p class="status-message">
                    Terima kasih! Pembayaran Anda telah berhasil diproses dan dikonfirmasi.
                </p>
                <div class="reference-info">
                    <div class="reference-label">Nomor Referensi</div>
                    <div class="reference-value">${orderData.reference || 'N/A'}</div>
                </div>
                <div class="reference-info">
                    <div class="reference-label">Jumlah Pembayaran</div>
                    <div class="reference-value">${formatRupiah(orderData.amount)}</div>
                </div>
                <div class="reference-info">
                    <div class="reference-label">Metode Pembayaran</div>
                    <div class="reference-value">${orderData.paymentMethod || 'N/A'}</div>
                </div>
                <div class="action-buttons">
                    <a href="fulfillment.html?merchantOrderId=${orderData.merchantOrderId}" class="btn-action btn-primary">
                        <i class="fas fa-box-open"></i>
                        Pengiriman Produk
                    </a>
                    <a href="index.html" class="btn-action btn-secondary">
                        <i class="fas fa-home"></i>
                        Kembali ke Beranda
                    </a>
                </div>
            `;
            break;
            
        case 'FAILED':
            statusHtml = `
                <div class="status-icon failed">
                    <i class="fas fa-times"></i>
                </div>
                <h1 class="status-title">Pembayaran Gagal</h1>
                <p class="status-message">
                    Maaf, pembayaran Anda tidak dapat diproses. ${orderData.statusMessage || ''}
                </p>
                <div class="reference-info">
                    <div class="reference-label">Order ID</div>
                    <div class="reference-value">${orderData.merchantOrderId}</div>
                </div>
                ${orderData.reference ? `
                <div class="reference-info">
                    <div class="reference-label">Nomor Referensi</div>
                    <div class="reference-value">${orderData.reference}</div>
                </div>
                ` : ''}
                <div class="action-buttons">
                    <button class="btn-action btn-primary return-to-duitku-btn" onclick="returnToDuitkuPayment()">
                        <i class="fas fa-credit-card"></i>
                        Kembali ke Halaman Pembayaran
                    </button>
                    <a href="index.html#store" class="btn-action btn-secondary">
                        <i class="fas fa-redo"></i>
                        Pilih Produk Lain
                    </a>
                    <a href="index.html#contact" class="btn-action btn-secondary">
                        <i class="fas fa-headset"></i>
                        Hubungi Dukungan
                    </a>
                </div>
            `;
            break;
            
        case 'PENDING':
        default:
            statusHtml = `
                <div class="status-icon pending">
                    <i class="fas fa-clock"></i>
                </div>
                <h1 class="status-title">Pembayaran Sedang Diproses</h1>
                <p class="status-message">
                    ${orderData.statusMessage || 'Pembayaran Anda sedang dalam proses verifikasi.'}
                </p>
                <div class="reference-info">
                    <div class="reference-label">Order ID</div>
                    <div class="reference-value">${orderData.merchantOrderId}</div>
                </div>
                ${orderData.reference ? `
                <div class="reference-info">
                    <div class="reference-label">Nomor Referensi</div>
                    <div class="reference-value">${orderData.reference}</div>
                </div>
                ` : ''}
                <div class="action-buttons">
                    <button id="returnToDuitkuBtn" class="btn-action btn-primary">
                        <i class="fas fa-credit-card"></i>
                        Kembali ke Halaman Pembayaran
                    </button>
                    <button onclick="location.reload()" class="btn-action btn-secondary">
                        <i class="fas fa-sync-alt"></i>
                        Refresh Status
                    </button>
                    <a href="index.html" class="btn-action btn-secondary">
                        <i class="fas fa-home"></i>
                        Kembali ke Beranda
                    </a>
                    <h3 class="sandbox-title">Sandbox Testing</h3>
                    <div class="sandbox-buttons">
                        <button id="simulateSuccessBtn" class="btn-action btn-success">
                            <i class="fas fa-check-circle"></i>
                            Simulasi Sukses
                        </button>
                        <button id="simulateFailureBtn" class="btn-action btn-danger">
                            <i class="fas fa-times-circle"></i>
                            Simulasi Gagal
                        </button>
                    </div>
                </div>
                </div>
            `;
            
            // Setup simulation buttons after they're added to DOM
            setTimeout(() => {
                const simulateSuccessBtn = document.getElementById('simulateSuccessBtn');
                const simulateFailureBtn = document.getElementById('simulateFailureBtn');
                
                if (simulateSuccessBtn) {
                    simulateSuccessBtn.addEventListener('click', function() {
                        simulateCallback(orderData.merchantOrderId, '00');
                    });
                }
                
                if (simulateFailureBtn) {
                    simulateFailureBtn.addEventListener('click', function() {
                        simulateCallback(orderData.merchantOrderId, '02');
                    });
                }
            }, 100);
            
            break;
    }
    
    statusContent.innerHTML = statusHtml;
    addFadeInAnimation();
}

/**
 * Display timeout status when polling exceeds maximum attempts
 */
function displayTimeoutStatus(merchantOrderId) {
    const statusContent = document.getElementById('statusContent');
    statusContent.innerHTML = `
        <div class="status-icon pending">
            <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h1 class="status-title">Tidak Dapat Memverifikasi Status</h1>
        <p class="status-message">
            Kami tidak dapat memverifikasi status pembayaran Anda saat ini. 
            Pembayaran mungkin masih dalam proses atau mengalami keterlambatan.
        </p>
        <div class="reference-info">
            <div class="reference-label">Order ID</div>
            <div class="reference-value">${merchantOrderId}</div>
        </div>
        <div class="action-buttons">
            <button id="returnToDuitkuBtnTimeout" class="btn-action btn-primary">
                <i class="fas fa-credit-card"></i>
                Kembali ke Halaman Pembayaran
            </button>
            <button onclick="location.reload()" class="btn-action btn-secondary">
                <i class="fas fa-sync-alt"></i>
                Coba Lagi
            </button>
            <a href="index.html#contact" class="btn-action btn-secondary">
                <i class="fas fa-headset"></i>
                Hubungi Dukungan
            </a>
        </div>
    `;
    addFadeInAnimation();
}

/**
 * Display error status when polling encounters an error
 */
function displayErrorStatus(merchantOrderId, errorMessage) {
    const statusContent = document.getElementById('statusContent');
    statusContent.innerHTML = `
        <div class="status-icon failed">
            <i class="fas fa-exclamation-circle"></i>
        </div>
        <h1 class="status-title">Terjadi Kesalahan</h1>
        <p class="status-message">
            Terjadi kesalahan saat mengecek status pembayaran. Silakan coba lagi.
        </p>
        <div class="reference-info">
            <div class="reference-label">Order ID</div>
            <div class="reference-value">${merchantOrderId}</div>
        </div>
        <div class="reference-info">
            <div class="reference-label">Error</div>
            <div class="reference-value">${errorMessage}</div>
        </div>
        <div class="action-buttons">
            <button id="returnToDuitkuBtnError" class="btn-action btn-primary">
                <i class="fas fa-credit-card"></i>
                Kembali ke Halaman Pembayaran
            </button>
            <button onclick="location.reload()" class="btn-action btn-secondary">
                <i class="fas fa-redo"></i>
                Coba Lagi
            </button>
            <a href="index.html#contact" class="btn-action btn-secondary">
                <i class="fas fa-headset"></i>
                Hubungi Dukungan
            </a>
        </div>
    `;
    addFadeInAnimation();
}

/**
 * Add fade-in animation to status content
 */
function addFadeInAnimation() {
    const statusContent = document.getElementById('statusContent');
    statusContent.style.opacity = '0';
    setTimeout(() => {
        statusContent.style.transition = 'opacity 0.5s ease-in';
        statusContent.style.opacity = '1';
    }, 100);
}

/**
 * Setup return to Duitku payment button
 */
function setupReturnToDuitkuButtons() {
    // Setup main button
    const returnToDuitkuBtn = document.getElementById('returnToDuitkuBtn');
    if (returnToDuitkuBtn) {
        returnToDuitkuBtn.addEventListener('click', returnToDuitkuPayment);
    }
    
    // Setup timeout scenario button
    const returnToDuitkuBtnTimeout = document.getElementById('returnToDuitkuBtnTimeout');
    if (returnToDuitkuBtnTimeout) {
        returnToDuitkuBtnTimeout.addEventListener('click', returnToDuitkuPayment);
    }
    
    // Setup error scenario button
    const returnToDuitkuBtnError = document.getElementById('returnToDuitkuBtnError');
    if (returnToDuitkuBtnError) {
        returnToDuitkuBtnError.addEventListener('click', returnToDuitkuPayment);
    }
}

/**
 * Return to Duitku payment page
 */
function returnToDuitkuPayment() {
    // Import payment store dynamically
    import('./payment-store.js').then(module => {
        const paymentStore = module.default;
        const paymentUrl = paymentStore.getDuitkuPaymentUrl();
        
        if (paymentUrl) {
            // Valid payment URL found, redirect to it
            window.location.href = paymentUrl;
        } else {
            // Payment URL expired or not found
            paymentStore.clearPaymentData(); // Clear any expired data
            
            // Fallback if URL not found or expired
            showNotification('URL pembayaran telah kadaluarsa atau tidak ditemukan. Silakan coba bayar ulang dari beranda.', 'error');
            setTimeout(() => {
                window.location.href = '/index.html#store';
            }, 3000);
        }
    }).catch(error => {
        console.error('Failed to import payment store:', error);
        
        // Fallback to traditional localStorage if module import fails
        const lastPaymentData = JSON.parse(localStorage.getItem('lastPaymentData') || '{}');
        const { url: lastPaymentUrl, expiry } = lastPaymentData;
        
        // Check if URL exists and is not expired (expiry > current time)
        if (lastPaymentUrl && expiry && new Date().getTime() < expiry) {
            window.location.href = lastPaymentUrl;
        } else {
            // Clear expired data
            if (lastPaymentUrl) {
                localStorage.removeItem('lastPaymentData');
            }
            
            // Fallback if URL not found or expired
            showNotification('URL pembayaran telah kadaluarsa atau tidak ditemukan. Silakan coba bayar ulang dari beranda.', 'error');
            setTimeout(() => {
                window.location.href = '/index.html#store';
            }, 3000);
        }
    });
}

/**
 * Display notification message
 */
function showNotification(message, type = 'info') {
    // Check if we already have a notification container
    let notificationContainer = document.getElementById('notificationContainer');
    
    // If not, create one
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notificationContainer';
        notificationContainer.style.position = 'fixed';
        notificationContainer.style.top = '20px';
        notificationContainer.style.right = '20px';
        notificationContainer.style.zIndex = '9999';
        document.body.appendChild(notificationContainer);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">×</button>
    `;
    
    // Style the notification
    notification.style.backgroundColor = 
        type === 'success' ? 'rgba(76, 175, 80, 0.95)' : 
        type === 'error' ? 'rgba(244, 67, 54, 0.95)' : 
        'rgba(33, 150, 243, 0.95)';
    notification.style.color = 'white';
    notification.style.padding = '12px 16px';
    notification.style.marginBottom = '10px';
    notification.style.borderRadius = '4px';
    notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    notification.style.display = 'flex';
    notification.style.justifyContent = 'space-between';
    notification.style.alignItems = 'center';
    notification.style.width = '300px';
    notification.style.maxWidth = '100%';
    notification.style.animation = 'slideIn 0.3s ease-out forwards';
    
    // Add click handler for close button
    const closeButton = notification.querySelector('.notification-close');
    closeButton.style.border = 'none';
    closeButton.style.background = 'none';
    closeButton.style.color = 'white';
    closeButton.style.fontSize = '20px';
    closeButton.style.cursor = 'pointer';
    closeButton.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => {
            notificationContainer.removeChild(notification);
        }, 300);
    });
    
    // Add to container
    notificationContainer.appendChild(notification);
    
    // Auto remove after some time
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notificationContainer.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
    
    // Add animation styles if not already present
    if (!document.getElementById('notificationAnimations')) {
        const style = document.createElement('style');
        style.id = 'notificationAnimations';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Simulate callback for testing purposes
 */
async function simulateCallback(merchantOrderId, resultCode) {
    try {
        // Stop any ongoing polling
        stopPolling();
        
        // Show loading state
        const simulateSuccessBtn = document.getElementById('simulateSuccessBtn');
        const simulateFailureBtn = document.getElementById('simulateFailureBtn');
        
        if (simulateSuccessBtn) simulateSuccessBtn.disabled = true;
        if (simulateFailureBtn) simulateFailureBtn.disabled = true;
        
        // Create URL for the callback simulation endpoint
        const simulateUrl = API_CONFIG.BACKEND_URL + API_CONFIG.ENDPOINTS.SIMULATE_CALLBACK;
        
        showNotification(`Simulating ${resultCode === '00' ? 'success' : 'failure'} callback...`, 'info');
        
        // Call the API to simulate a callback
        const response = await fetch(simulateUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                merchantOrderId: merchantOrderId,
                resultCode: resultCode
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification(`Callback simulation successful: ${data.message || 'Status updated'}`, 'success');
            
            // Wait a moment, then check the status
            setTimeout(() => {
                pollOrderStatus(merchantOrderId);
            }, 1000);
        } else {
            showNotification(`Error: ${data.error || 'Failed to simulate callback'}`, 'error');
            
            // Re-enable buttons
            if (simulateSuccessBtn) simulateSuccessBtn.disabled = false;
            if (simulateFailureBtn) simulateFailureBtn.disabled = false;
        }
    } catch (error) {
        console.error('Error simulating callback:', error);
        showNotification(`Error: ${error.message || 'Failed to simulate callback'}`, 'error');
        
        // Re-enable buttons
        const simulateSuccessBtn = document.getElementById('simulateSuccessBtn');
        const simulateFailureBtn = document.getElementById('simulateFailureBtn');
        if (simulateSuccessBtn) simulateSuccessBtn.disabled = false;
        if (simulateFailureBtn) simulateFailureBtn.disabled = false;
    }
}

/**
 * Initialize payment status page
 */
function initializePaymentStatus() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const statusContent = document.getElementById('statusContent');
    
    // Hide loading spinner and show content
    loadingSpinner.style.display = 'none';
    statusContent.style.display = 'block';
    
    // Check if we have a merchant order ID
    const merchantOrderId = getUrlParameter('merchantOrderId') || getUrlParameter('reference');
    
    if (merchantOrderId) {
        // Start polling for order status
        startPolling(merchantOrderId);
    } else {
        // Fallback to old status display method for backwards compatibility
        displayFallbackStatus();
    }
}

/**
 * Fallback status display for backwards compatibility
 */
function displayFallbackStatus() {
    const resultCode = getUrlParameter('resultCode');
    const reference = getUrlParameter('reference');
    const amount = getUrlParameter('amount');
    
    const statusContent = document.getElementById('statusContent');
    let statusHtml = '';
    
    switch(resultCode) {
        case '00':
            statusHtml = `
                <div class="status-icon success">
                    <i class="fas fa-check"></i>
                </div>
                <h1 class="status-title">Pembayaran Berhasil!</h1>
                <p class="status-message">
                    Terima kasih! Pembayaran Anda telah berhasil diproses.
                </p>
                ${reference ? `
                <div class="reference-info">
                    <div class="reference-label">Nomor Referensi</div>
                    <div class="reference-value">${reference}</div>
                </div>
                ` : ''}
                ${amount ? `
                <div class="reference-info">
                    <div class="reference-label">Jumlah Pembayaran</div>
                    <div class="reference-value">${formatRupiah(amount)}</div>
                </div>
                ` : ''}
                <div class="action-buttons">
                    <a href="fulfillment.html?merchantOrderId=${reference}" class="btn-action btn-primary">
                        <i class="fas fa-box-open"></i>
                        Pengiriman Produk
                    </a>
                    <a href="index.html" class="btn-action btn-secondary">
                        <i class="fas fa-home"></i>
                        Kembali ke Beranda
                    </a>
                </div>
            `;
            break;
            
        case '01':
            statusHtml = `
                <div class="status-icon failed">
                    <i class="fas fa-times"></i>
                </div>
                <h1 class="status-title">Pembayaran Gagal</h1>
                <p class="status-message">
                    Maaf, terjadi masalah saat memproses pembayaran Anda.
                </p>
                <div class="action-buttons">
                    <a href="index.html#store" class="btn-action btn-primary">
                        <i class="fas fa-redo"></i>
                        Coba Bayar Lagi
                    </a>
                </div>
            `;
            break;
            
        default:
            statusHtml = `
                <div class="status-icon pending">
                    <i class="fas fa-clock"></i>
                </div>
                <h1 class="status-title">Status Tidak Diketahui</h1>
                <p class="status-message">
                    Tidak dapat menentukan status pembayaran. Silakan hubungi dukungan.
                </p>
                <div class="action-buttons">
                    <a href="index.html#contact" class="btn-action btn-primary">
                        <i class="fas fa-headset"></i>
                        Hubungi Dukungan
                    </a>
                </div>
            `;
            break;
    }
    
    statusContent.innerHTML = statusHtml;
    addFadeInAnimation();
}

// Global functions for button actions
window.stopPolling = stopPolling;
window.returnToDuitkuPayment = returnToDuitkuPayment;
window.simulateCallback = simulateCallback;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializePaymentStatus();
    
    // Setup additional UI interactions after content is loaded and displayed
    setTimeout(() => {
        setupReturnToDuitkuButtons();
    }, 1000);
});

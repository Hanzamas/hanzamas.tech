/**
 * Simple Client-Side Router for Clean URLs
 * =======================================
 * Handles routing without .html extensions for development and production
 */

class SimpleRouter {
    constructor() {
        this.routes = {
            '/': 'index.html',
            '/payment-success': 'payment-success.html',
            '/payment-failure': 'payment-failure.html', 
            '/payment-status': 'payment-status.html'
        };
        
        this.init();
    }

    init() {
        // Handle initial page load
        this.handleRoute();
        
        // Handle browser back/forward
        window.addEventListener('popstate', () => {
            this.handleRoute();
        });
        
        // Intercept link clicks for SPA-like navigation
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && this.shouldIntercept(link)) {
                e.preventDefault();
                this.navigate(link.getAttribute('href'));
            }
        });
    }

    shouldIntercept(link) {
        const href = link.getAttribute('href');
        return href && 
               href.startsWith('/') && 
               !href.includes('.') && 
               link.origin === window.location.origin;
    }

    handleRoute() {
        const path = window.location.pathname;
        const targetFile = this.routes[path];
        
        if (targetFile && targetFile !== this.getCurrentPageFile()) {
            // Only redirect if we're not already on the target page
            if (!window.location.href.includes(targetFile)) {
                window.location.replace(targetFile + window.location.search + window.location.hash);
            }
        }
    }

    getCurrentPageFile() {
        const fileName = window.location.pathname.split('/').pop();
        return fileName || 'index.html';
    }

    navigate(path) {
        const targetFile = this.routes[path];
        if (targetFile) {
            window.history.pushState({}, '', path);
            window.location.replace(targetFile);
        }
    }
}

// Initialize router only if we're in development or need client-side routing
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Development mode - use client-side routing
    new SimpleRouter();
} else {
    // Production mode - rely on server-side routing (.htaccess or _redirects)
    console.log('🚀 Production mode - server-side routing active');
}

export default SimpleRouter;

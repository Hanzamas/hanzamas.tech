# Hanzamas.tech - Website Portfolio & Digital Store

## Deployment & Fulfillment Instructions

### 1. File Structure Overview

```
/
├── index.html            # Main landing page
├── payment-status.html   # Payment status page
├── payment-success.html  # Payment success page
├── payment-failure.html  # Payment failure page
├── fulfillment.html      # NEW: Product delivery page
├── product_fulfillment.md # Documentation for fulfillment flow
├── duitku_integration.md # Duitku integration guide
├── netlify.toml          # Netlify configuration
├── netlify/
│   └── functions/        # Serverless functions
│       ├── notify-admin.js  # Email notification function
│       └── save-rating.js   # Rating function
└── js/
    ├── components.js     # UI components including Duitku checkout
    ├── config.js         # API endpoints configuration
    ├── order-management.js # NEW: Order tracking system
    └── payment-status.js # Payment status handling
```

### 2. Deployment Steps

#### A. Netlify Setup

1. **Connect to GitHub Repository**
   - Push your codebase to GitHub
   - Connect Netlify to your repository

2. **Configure Build Settings in Netlify**
   - Build command: Leave blank (no build required)
   - Publish directory: `.` (root directory)

3. **Environment Variables**
   - Go to Site settings > Environment variables
   - Add the following variables:

   ```
   DUITKU_MERCHANT_CODE=your_merchant_code
   DUITKU_MERCHANT_KEY=your_merchant_key
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   ADMIN_EMAIL=your_admin_email@example.com
   ```

#### B. Update Configuration

1. **Edit `js/config.js`**
   - Update `BACKEND_URL` with your Netlify URL

   ```javascript
   BACKEND_URL: 'https://your-netlify-site.netlify.app/.netlify/functions',
   ```

2. **Update Frontend URLs**

   ```javascript
   FRONTEND: {
       RETURN_URL: 'https://your-site.com/payment-status',
       SUCCESS_URL: 'https://your-site.com/payment-success',
       FAILURE_URL: 'https://your-site.com/payment-failure',
       HOME_URL: 'https://your-site.com'
   }
   ```

### 3. Testing Instructions

1. **Local Testing Before Deployment**
   ```bash
   npm install
   npm start
   ```

2. **Test Payment Flow**
   - Confirm Digital Store products display correctly
   - Click "Beli Sekarang" on a product
   - Complete sandbox payment
   - Verify redirect to success page
   - Check fulfillment page works correctly

3. **Test Order Management**
   - Complete a purchase
   - Go to fulfillment page
   - Enter customer details
   - Verify admin notification email is sent

### 4. Email Setup for Gmail

To use Gmail for sending emails from Netlify functions:

1. **Create App Password**
   - Go to Google Account > Security
   - Enable 2-Step Verification if not already enabled
   - Create an App Password for "Mail"
   - Use this password in your SMTP_PASS environment variable

2. **Common Issues:**
   - If emails aren't being sent, check Netlify Function logs
   - Ensure environment variables are set correctly
   - Gmail might block "less secure apps" - use App Passwords instead

### 5. Manual Order Processing

Since we're using a database-free approach with Netlify hosting:

1. **Order Notification via Email**
   - Admin receives email when customer completes purchase
   - Email contains all order details

2. **Product Delivery**
   - Follow steps in product_fulfillment.md
   - Manually email digital products to customers
   - Track orders via your admin email

3. **Backup Option**
   - Periodically check Netlify Function logs for any missed orders
   - Build a simple admin panel if needed later

### 6. Troubleshooting

**Common Issues:**

1. **Payment Not Redirecting**
   - Check config.js has correct URLs
   - Verify Duitku merchant code and key

2. **Netlify Functions Not Working**
   - Check function logs in Netlify dashboard
   - Verify dependencies are installed correctly

3. **Email Notifications Not Sending**
   - Check SMTP credentials
   - Verify email service is not blocking automated emails

For additional support, contact: support@hanzamas.tech

---

## Maintenance Guide

### Monthly Tasks

1. **Test Payment Flow**
   - Complete a test purchase monthly
   - Verify all pages and emails work correctly

2. **Check Environment Variables**
   - Ensure API keys haven't expired
   - Rotate SMTP passwords periodically

3. **Update Dependencies**
   - Check for nodemailer updates
   - Test after any dependency updates

### Security Considerations

- Never expose Duitku merchant key in frontend code
- Use environment variables for all sensitive information
- Implement CORS headers in netlify.toml
- Use HTTPS for all URLs

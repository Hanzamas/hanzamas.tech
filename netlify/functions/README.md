# Netlify Serverless Functions

This directory contains serverless functions that handle various aspects of the e-commerce flow and website interactions without requiring a database.

## Available Functions

### 1. `send-contact.js`

Processes contact form submissions and sends notifications to administrators and auto-replies to users.

**Environment Variables Required:**
- Same SMTP variables as other functions
- `ADMIN_EMAIL`: Email address to send contact form notifications to

**Request Format:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "subject": "Project Inquiry",
  "message": "I'd like to discuss a potential project with you."
}
```

**Response:**
```json
{
  "message": "Contact form submitted successfully",
  "timestamp": "2023-11-25T12:34:56.789Z"
}
```

### 2. `notify-admin.js`

Sends notifications to administrators when a new order is placed and needs fulfillment.

**Environment Variables Required:**
- `SMTP_HOST`: SMTP server host (default: smtp.gmail.com)
- `SMTP_PORT`: SMTP server port (default: 587)
- `SMTP_SECURE`: Whether to use SSL/TLS (default: false)
- `SMTP_USER`: SMTP username/email
- `SMTP_PASS`: SMTP password or app password
- `ADMIN_EMAIL`: Email address to send admin notifications to

**Request Format:**
```json
{
  "orderId": "ORDER123",
  "productName": "Digital Product Name",
  "amount": 99000,
  "paymentMethod": "QRIS",
  "customerName": "Customer Name",
  "customerEmail": "customer@example.com",
  "notes": "Optional notes"
}
```

**Response:**
```json
{
  "message": "Notifications sent successfully",
  "orderId": "ORDER123",
  "timestamp": "2023-11-25T12:34:56.789Z",
  "status": "PROCESSING"
}
```

### 2. `save-rating.js`

Records customer ratings and feedback for products.

**Environment Variables Required:**
- Same SMTP variables as `notify-admin.js` (for sending rating notifications)
- `ADMIN_EMAIL`: Email address to send rating notifications to

**Request Format:**
```json
{
  "orderId": "ORDER123",
  "rating": 5,
  "productName": "Digital Product Name",
  "comment": "Optional customer feedback"
}
```

**Response:**
```json
{
  "message": "Rating saved successfully",
  "orderId": "ORDER123",
  "rating": 5,
  "timestamp": "2023-11-25T12:34:56.789Z"
}
```

## Setup Instructions

1. Add the required environment variables in the Netlify Dashboard:
   - Go to Site settings > Environment variables
   - Add each variable listed above

2. Deploy the functions:
   - Functions are automatically deployed when pushing to Netlify
   - Make sure `netlify.toml` properly configures the functions directory

3. Testing locally:
   - Use Netlify CLI: `netlify dev`
   - Test endpoints with Postman or cURL

## Error Handling

All functions include proper error handling and will return:
- 400 status for invalid input
- 405 for unsupported HTTP methods
- 500 for server-side errors with descriptive messages

## Security Notes

- All endpoints should be called from authenticated client-side code
- Consider adding additional validation layers in production
- Use Netlify's environment variables feature for storing sensitive credentials

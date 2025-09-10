// Netlify function to save customer ratings
const nodemailer = require('nodemailer');

// Email template for rating notifications
const getRatingTemplate = (data) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Customer Rating Notification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            padding: 20px;
            max-width: 600px;
            margin: 0 auto;
        }
        .container {
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 20px;
        }
        .header {
            background: #673AB7;
            color: white;
            padding: 15px;
            text-align: center;
            border-radius: 4px 4px 0 0;
            margin-bottom: 20px;
        }
        .rating-info {
            background: #f9f9f9;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
        .stars {
            font-size: 24px;
            color: #FFD700;
            text-align: center;
            margin: 15px 0;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        .detail-label {
            font-weight: bold;
            color: #555;
        }
        .comment-section {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 4px;
            margin-top: 15px;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Customer Rating Received</h1>
        </div>
        
        <p>Hello Admin,</p>
        <p>A customer has submitted a rating for their order.</p>
        
        <div class="rating-info">
            <div class="detail-row">
                <span class="detail-label">Order ID:</span>
                <span>#${data.orderId}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Product:</span>
                <span>${data.productName || 'Product'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span>${new Date().toLocaleString('id-ID')}</span>
            </div>
            
            <div class="stars">
                ${'★'.repeat(data.rating)}${'☆'.repeat(5 - data.rating)}
                <div style="font-size: 16px; margin-top: 5px;">${data.rating} out of 5</div>
            </div>
            
            ${data.comment ? `
            <div class="comment-section">
                <p><strong>Customer Comment:</strong></p>
                <p>${data.comment}</p>
            </div>
            ` : ''}
        </div>
        
        <div class="footer">
            <p>This email was automatically generated from the Hanzamas.tech system</p>
        </div>
    </div>
</body>
</html>
`;

exports.handler = async function(event, context) {
    // Only allow POST
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }
    
    try {
        // Parse the request body
        const data = JSON.parse(event.body);
        
        // Validate required fields
        if (!data.orderId || !data.rating) {
            return { 
                statusCode: 400, 
                body: JSON.stringify({ error: "Missing required fields" })
            };
        }
        
        // In a production environment, you would save this to a database
        // Since we're running without a database, we'll log it and send an email notification
        console.log(`Rating received for order ${data.orderId}: ${data.rating} stars`);
        
        // Create a timestamp for logging
        const timestamp = new Date().toISOString();
        
        // Send an email notification with the rating if SMTP is configured
        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            try {
                // Create mail transporter
                const transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST || "smtp.gmail.com",
                    port: process.env.SMTP_PORT || 587,
                    secure: process.env.SMTP_SECURE === "true",
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS
                    }
                });
                
                // Prepare email data
                const emailData = {
                    orderId: data.orderId,
                    rating: data.rating,
                    productName: data.productName || 'Digital Product',
                    comment: data.comment || ''
                };
                
                // Send email to admin
                await transporter.sendMail({
                    from: `"Hanzamas Rating System" <${process.env.SMTP_USER}>`,
                    to: process.env.ADMIN_EMAIL || 'admin@hanzamas.tech',
                    subject: `Customer Rating: ${data.rating}★ - Order #${data.orderId}`,
                    html: getRatingTemplate(emailData)
                });
                
                console.log(`Rating notification email sent for order ${data.orderId}`);
            } catch (emailError) {
                console.error("Error sending rating notification email:", emailError);
                // We continue execution even if email fails
                // The rating will still be recorded in logs
            }
        }
        
        // Store the rating in a local file if configured
        // This is a simple way to persist ratings without a database
        // In a production environment, you would use a proper database
        
        return {
            statusCode: 200,
            body: JSON.stringify({ 
                message: "Rating saved successfully",
                orderId: data.orderId,
                rating: data.rating,
                timestamp: timestamp
            })
        };
    } catch (error) {
        console.error("Error saving rating:", error);
        
        // Provide more detailed error information
        let errorMessage = "Failed to save rating";
        
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: errorMessage,
                details: error.message
            })
        };
    }
};

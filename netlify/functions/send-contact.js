// Netlify function to handle contact form submissions
const nodemailer = require('nodemailer');

// Email template for contact form notifications
const getContactTemplate = (data) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Form Submission</title>
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
        .contact-details {
            background: #f9f9f9;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        .detail-row:last-child {
            border-bottom: none;
        }
        .detail-label {
            font-weight: bold;
            color: #555;
        }
        .message-box {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 4px;
            margin-top: 20px;
            border-left: 4px solid #673AB7;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #777;
        }
        .button {
            display: inline-block;
            padding: 10px 15px;
            background-color: #673AB7;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Pesan Baru dari Kontak Website</h1>
        </div>
        
        <p>Halo Admin,</p>
        <p>Anda telah menerima pesan baru dari formulir kontak website Hanzamas.tech.</p>
        
        <div class="contact-details">
            <div class="detail-row">
                <span class="detail-label">Nama:</span>
                <span>${data.name}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span>${data.email}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Subjek:</span>
                <span>${data.subject}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Tanggal:</span>
                <span>${new Date().toLocaleString('id-ID')}</span>
            </div>
        </div>
        
        <div class="message-box">
            <p><strong>Pesan:</strong></p>
            <p>${data.message.replace(/\n/g, '<br>')}</p>
        </div>
        
        <div style="text-align: center;">
            <a href="mailto:${data.email}" class="button">Balas Email</a>
        </div>
        
        <div class="footer">
            <p>Email ini dibuat otomatis dari sistem Hanzamas.tech</p>
        </div>
    </div>
</body>
</html>
`;

// Auto-reply template to send to the user
const getAutoReplyTemplate = (data) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>We've Received Your Message</title>
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
        .message-summary {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
            font-style: italic;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #777;
        }
        .social-links {
            text-align: center;
            margin-top: 20px;
        }
        .social-link {
            display: inline-block;
            margin: 0 10px;
            color: #673AB7;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Terima Kasih atas Pesan Anda</h1>
        </div>
        
        <p>Halo ${data.name},</p>
        <p>Terima kasih telah menghubungi Hanzamas.tech. Kami telah menerima pesan Anda dan akan meninjau serta meresponsnya segera mungkin.</p>
        
        <div class="message-summary">
            <p><strong>Subjek:</strong> ${data.subject}</p>
            <p><strong>Pesan Anda:</strong><br>${data.message.substring(0, 150)}${data.message.length > 150 ? '...' : ''}</p>
        </div>
        
        <p>Kami biasanya merespons dalam waktu 1-2 hari kerja. Jika ada pertanyaan mendesak, Anda dapat menghubungi kami di nomor +62 838 4055 7309.</p>
        
        <div class="social-links">
            <a href="https://github.com/hanzamatech" class="social-link">GitHub</a>
            <a href="https://linkedin.com/in/hanzamatech" class="social-link">LinkedIn</a>
            <a href="https://twitter.com/hanzamatech" class="social-link">Twitter</a>
            <a href="https://instagram.com/hanzamatech" class="social-link">Instagram</a>
        </div>
        
        <div class="footer">
            <p>Pesan ini dibuat otomatis. Mohon tidak membalas email ini.</p>
            <p>© ${new Date().getFullYear()} Hanzamas.tech. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

exports.handler = async function(event, context) {
    // Log that the function was invoked
    console.log('Send contact function invoked');
    
    // Only allow POST
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
    }
    
    try {
        // Parse the request body
        const data = JSON.parse(event.body);
        
        // Validate required fields
        if (!data.name || !data.email || !data.message) {
            return { 
                statusCode: 400, 
                body: JSON.stringify({ error: "Missing required fields" })
            };
        }
        
        // Set default subject if not provided
        const subject = data.subject || "Contact Form Inquiry";
        
        // Log the contact form submission
        console.log(`Contact form submission from: ${data.name} <${data.email}>`);
        
        // Create mail transporter
        console.log(`Setting up email transporter with host: ${process.env.SMTP_HOST || "smtp.gmail.com"}`);
        
        // Check if SMTP credentials are available
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.warn('SMTP credentials not found in environment variables');
            // For development, let's return a success response without actually sending
            if (process.env.NODE_ENV === 'development') {
                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        message: "Contact form submission simulated (SMTP not configured)",
                        timestamp: new Date().toISOString()
                    })
                };
            }
        }
        
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
            name: data.name,
            email: data.email,
            subject: subject,
            message: data.message
        };
        
        // Send email to admin
        await transporter.sendMail({
            from: `"Hanzamas Contact Form" <${process.env.SMTP_USER}>`,
            to: process.env.ADMIN_EMAIL || 'admin@hanzamas.tech', // Fallback email
            subject: `New Contact: ${subject}`,
            html: getContactTemplate(emailData)
        });
        
        // Send auto-reply to user
        await transporter.sendMail({
            from: `"Hanzamas Tech" <${process.env.SMTP_USER}>`,
            to: data.email,
            subject: `We've received your message - Hanzamas.tech`,
            html: getAutoReplyTemplate(emailData)
        });
        
        // Record timestamp
        const timestamp = new Date().toISOString();
        
        return {
            statusCode: 200,
            body: JSON.stringify({ 
                message: "Contact form submitted successfully",
                timestamp: timestamp
            })
        };
    } catch (error) {
        console.error("Error processing contact form:", error);
        
        // Provide more detailed error information
        let errorMessage = "Failed to process contact form";
        if (error.code === 'EAUTH') {
            errorMessage = "Email authentication failed. Please check SMTP credentials.";
        } else if (error.code === 'ESOCKET') {
            errorMessage = "Connection to email server failed. Please check your network.";
        }
        
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: errorMessage,
                details: error.message
            })
        };
    }
};

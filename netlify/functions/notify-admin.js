// Netlify function to notify admin about new orders
const nodemailer = require('nodemailer');

// Email templates
const getOrderTemplate = (data) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Order Notification</title>
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
        .order-details {
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
            <h1>Pesanan Baru Diterima</h1>
        </div>
        
        <p>Halo Admin,</p>
        <p>Anda telah menerima pesanan baru yang memerlukan proses fulfillment manual.</p>
        
        <div class="order-details">
            <div class="detail-row">
                <span class="detail-label">Order ID:</span>
                <span>${data.orderId}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Produk:</span>
                <span>${data.productName}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Jumlah:</span>
                <span>Rp ${parseInt(data.amount).toLocaleString('id-ID')}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Metode Pembayaran:</span>
                <span>${data.paymentMethod}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Nama Pelanggan:</span>
                <span>${data.customerName}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Email Pelanggan:</span>
                <span>${data.customerEmail}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Tanggal Order:</span>
                <span>${new Date().toLocaleString('id-ID')}</span>
            </div>
        </div>
        
        <p><strong>Petunjuk Fulfillment:</strong></p>
        <ul>
            <li>Siapkan produk digital sesuai pesanan</li>
            <li>Kirim email konfirmasi ke pelanggan</li>
            <li>Pastikan proses pengiriman sesuai alur di product_fulfillment.md</li>
        </ul>
        
        <div style="text-align: center;">
            <a href="mailto:${data.customerEmail}" class="button">Balas Ke Pelanggan</a>
        </div>
        
        <div class="footer">
            <p>Email ini dibuat otomatis dari sistem Hanzamas.tech</p>
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
        if (!data.orderId || !data.productName || !data.customerEmail) {
            return { 
                statusCode: 400, 
                body: JSON.stringify({ error: "Missing required fields" })
            };
        }
        
        // Prepare customer data
        const customerName = data.userInfo?.fullName || data.customerName || 'Pelanggan';
        const customerEmail = data.userInfo?.email || data.customerEmail;
        
        // Create mail transporter
        // Note: In production, use environment variables for these credentials
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
        
        // Prepare email data with fallbacks
        const emailData = {
            orderId: data.orderId,
            productName: data.orderDetails?.productName || data.productName || 'Produk Digital',
            amount: data.orderDetails?.amount || data.amount || 0,
            paymentMethod: data.orderDetails?.paymentMethod || data.paymentMethod || 'Pembayaran Online',
            customerName: customerName,
            customerEmail: customerEmail,
            notes: data.userInfo?.notes || data.notes || ''
        };
        
        // Log request for debugging
        console.log('Sending fulfillment notification for order:', emailData.orderId);
        
        // Send email to admin
        await transporter.sendMail({
            from: `"Hanzamas Order System" <${process.env.SMTP_USER}>`,
            to: process.env.ADMIN_EMAIL || 'admin@hanzamas.tech', // Fallback email
            subject: `New Order: ${emailData.productName} - #${emailData.orderId}`,
            html: getOrderTemplate(emailData)
        });
        
        // Send confirmation to customer
        await transporter.sendMail({
            from: `"Hanzamas Tech" <${process.env.SMTP_USER}>`,
            to: customerEmail,
            subject: `Pesanan Anda Sedang Diproses - ${emailData.productName}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #673AB7;">Pesanan Diterima</h1>
                    <p>Halo ${customerName},</p>
                    <p>Terima kasih atas pesanan Anda. Berikut detail pesanan:</p>
                    <ul>
                        <li>Produk: ${emailData.productName}</li>
                        <li>Order ID: #${emailData.orderId}</li>
                        <li>Status: Sedang Diproses</li>
                    </ul>
                    <p>Kami akan segera memproses pesanan Anda dan mengirimkan produk ke email ini dalam waktu 24 jam kerja.</p>
                    <p>Jika Anda memiliki pertanyaan, silakan balas email ini atau hubungi kami di <a href="https://hanzamas.tech/#contact">halaman kontak</a>.</p>
                    <p>Salam,<br>Tim Hanzamas.tech</p>
                </div>
            `
        });
        
        // Update order status in database (in future implementation)
        // For now, we're just returning success
        
        // Record fulfillment request timestamp
        const timestamp = new Date().toISOString();
        
        return {
            statusCode: 200,
            body: JSON.stringify({ 
                message: "Notifications sent successfully",
                orderId: data.orderId,
                timestamp: timestamp,
                status: "PROCESSING"
            })
        };
    } catch (error) {
        console.error("Error sending notifications:", error);
        
        // Provide more detailed error information
        let errorMessage = "Failed to send notifications";
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

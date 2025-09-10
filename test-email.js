// Test file for nodemailer configuration
// Run with: node test-email.js
require('dotenv').config();
const nodemailer = require('nodemailer');

// Display current email configuration
console.log('Current Email Configuration:');
console.log('---------------------------');
console.log(`SMTP_HOST: ${process.env.SMTP_HOST || 'smtp.gmail.com (default)'}`);
console.log(`SMTP_PORT: ${process.env.SMTP_PORT || '587 (default)'}`);
console.log(`SMTP_SECURE: ${process.env.SMTP_SECURE === 'true' ? 'true' : 'false (default)'}`);
console.log(`SMTP_USER: ${process.env.SMTP_USER ? '****' + process.env.SMTP_USER.substring(4) : 'NOT SET (required)'}`);
console.log(`SMTP_PASS: ${process.env.SMTP_PASS ? '********' : 'NOT SET (required)'}`);
console.log(`ADMIN_EMAIL: ${process.env.ADMIN_EMAIL || 'admin@hanzamas.tech (default)'}`);
console.log('---------------------------');

// Check if required configuration is available
if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.error('\n❌ ERROR: SMTP_USER and SMTP_PASS are required!');
  console.error('Please set these environment variables in your .env file or Netlify dashboard.\n');
  console.error('For Gmail, you need to create an App Password:');
  console.error('1. Go to https://myaccount.google.com/security');
  console.error('2. Enable 2-Step Verification if not already enabled');
  console.error('3. Go to App passwords');
  console.error('4. Create a new app password for "Mail" and "Other (Hanzamas)"');
  console.error('5. Use the generated 16-character password as SMTP_PASS\n');
  process.exit(1);
}

// Create a test message
async function sendTestEmail() {
  try {
    console.log('Creating transporter...');
    
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

    console.log('Verifying connection...');
    
    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection successful!');
    
    console.log('Sending test email...');
    
    // Send test email
    const info = await transporter.sendMail({
      from: `"Hanzamas Test" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
      subject: "Email Configuration Test - Hanzamas.tech",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 5px;">
          <h1 style="color: #673AB7;">Email Configuration Test</h1>
          <p>This is a test email to verify your SMTP configuration for Hanzamas.tech.</p>
          <p><strong>Date/Time:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Configuration:</strong></p>
          <ul>
            <li>SMTP Host: ${process.env.SMTP_HOST || 'smtp.gmail.com (default)'}</li>
            <li>SMTP Port: ${process.env.SMTP_PORT || '587 (default)'}</li>
            <li>SMTP Secure: ${process.env.SMTP_SECURE === 'true' ? 'true' : 'false (default)'}</li>
          </ul>
          <p style="margin-top: 30px; color: #666; font-size: 12px;">If you received this email, your email configuration is working correctly!</p>
        </div>
      `
    });
    
    console.log('✅ Test email sent successfully!');
    console.log(`Message ID: ${info.messageId}`);
    console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    
  } catch (error) {
    console.error('❌ ERROR:', error);
    
    // Provide troubleshooting help based on error code
    if (error.code === 'EAUTH') {
      console.error('\nAuthentication failed. Please check your SMTP_USER and SMTP_PASS values.');
      console.error('If using Gmail, make sure you\'re using an App Password, not your regular password.\n');
    } else if (error.code === 'ESOCKET') {
      console.error('\nConnection failed. Please check your SMTP_HOST and SMTP_PORT values.');
      console.error('Also check your network connection and firewall settings.\n');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('\nConnection timed out. Your network might be blocking SMTP connections.');
    }
  }
}

// Run the test
sendTestEmail();

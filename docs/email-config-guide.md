# Email Configuration Guide for Hanzamas.tech

This guide explains how to set up email functionality for the Netlify serverless functions in the Hanzamas.tech website. These functions use email to send notifications for orders, ratings, and contact form submissions.

## Required Environment Variables

The following environment variables must be configured for email functionality to work properly:

### SMTP Settings

| Variable      | Description                                   | Example Value        | Default      |
|---------------|-----------------------------------------------|----------------------|--------------|
| `SMTP_HOST`   | SMTP server hostname                          | `smtp.gmail.com`     | smtp.gmail.com |
| `SMTP_PORT`   | SMTP server port                              | `587`                | 587          |
| `SMTP_SECURE` | Whether to use SSL/TLS (true/false)           | `false`              | false        |
| `SMTP_USER`   | SMTP username/email address                   | `your@gmail.com`     | (required)   |
| `SMTP_PASS`   | SMTP password or app password                 | `your-password`      | (required)   |

### Email Addresses

| Variable       | Description                                  | Example Value        | Default         |
|----------------|----------------------------------------------|----------------------|-----------------|
| `ADMIN_EMAIL`  | Email address to receive admin notifications | `admin@hanzamas.tech`| admin@hanzamas.tech |

## Setting Up in Netlify

To add these environment variables to your Netlify project:

1. Log in to your Netlify account and select your project.
2. Go to **Site settings** > **Environment variables**.
3. Click **Add variable** and add each variable listed above.
4. After adding all variables, deploy your site again to apply the changes.

![Netlify Environment Variables](https://docs.netlify.com/images/configure-builds-environment-variables.png)

## Using Gmail as Your SMTP Provider

If you're using Gmail as your SMTP provider, you'll need to:

1. Enable "Less secure app access" or
2. Create an "App Password" (recommended if you have 2-Factor Authentication enabled)

### Creating a Gmail App Password

1. Go to your Google Account settings: https://myaccount.google.com/
2. Select **Security** from the left menu
3. Under "Signing in to Google," select **App passwords**
   (Note: This option only appears if 2-Step Verification is enabled)
4. Select **Mail** as the app and **Other (Custom name)** as the device
5. Enter "Hanzamas Website" as the name
6. Click **Generate**
7. Copy the 16-character password and use it as your `SMTP_PASS` value

## Testing Your Email Configuration

After setting up the environment variables, you can test if emails are working properly:

1. Deploy your site with the new environment variables
2. Submit a test contact form on your website
3. Place a test order to trigger the order notification
4. Check both the specified admin email and your server logs for any errors

## Troubleshooting Email Issues

If emails aren't being sent:

1. Check Netlify function logs for error messages
2. Verify that all environment variables are correctly set
3. Ensure your SMTP credentials are correct
4. Check if your email provider has any sending limits
5. Make sure your IP is not blacklisted by the SMTP provider

Common error codes:

- `EAUTH`: Authentication failed (check username and password)
- `ESOCKET`: Connection failed (check host and port)
- `ETIMEDOUT`: Connection timed out (check network/firewall)

## Local Development Setup

For testing email functionality in local development:

1. Create a `.env` file in the root of your project (add it to .gitignore)
2. Add the environment variables listed above to this file
3. Install the `dotenv` package if not already installed
4. When running locally, the functions will use these variables

Example `.env` file:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
ADMIN_EMAIL=admin@hanzamas.tech
```

## Security Considerations

- Never commit email credentials to your Git repository
- Consider using a dedicated email account for your website
- Regularly rotate your SMTP password for enhanced security
- Use environment variables instead of hardcoding credentials
- Set up email alerts for failed authentication attempts

## Functions Using Email

The following Netlify functions rely on these email settings:

1. `notify-admin.js` - Sends notifications when new orders are placed
2. `save-rating.js` - Sends notifications when customers submit ratings
3. `send-contact.js` - Sends notifications and auto-replies for contact form submissions

Each function has built-in fallbacks for missing environment variables, but for full functionality, all variables should be properly configured.

# Setting up SMTP for Gmail in Netlify

This guide walks you through setting up your Gmail SMTP credentials for use with the Netlify functions.

## Step 1: Generate an App Password for Gmail

1. Go to your Google Account settings: https://myaccount.google.com/
2. Select **Security** from the left menu
3. Under "Signing in to Google," select **App passwords**
   (Note: This option only appears if 2-Step Verification is enabled)
4. Select **Mail** as the app and **Other (Custom name)** as the device
5. Enter "Hanzamas Website" as the name
6. Click **Generate**
7. Copy the 16-character password that Google generates for you

## Step 2: Add Environment Variables in Netlify

1. Log in to your Netlify account
2. Select your site from the dashboard
3. Go to **Site settings** > **Environment variables**
4. Add the following variables:

| Key | Value |
|-----|-------|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_SECURE` | `false` |
| `SMTP_USER` | `your.email@gmail.com` (your Gmail address) |
| `SMTP_PASS` | `abcd efgh ijkl mnop` (the app password you generated) |
| `ADMIN_EMAIL` | `your.email@gmail.com` (where to receive notifications) |

5. Click **Save** after adding each variable

## Step 3: Redeploy Your Site

After setting the environment variables, redeploy your site to apply the changes:

1. Go to the **Deploys** tab in Netlify
2. Click **Trigger deploy** > **Deploy site**

## Testing Locally

To test your email functionality locally:

1. Create a `.env` file in the root of your project with the same variables as above
2. Run `node test-email.js` to verify your SMTP configuration
3. To simulate serverless functions locally, run `node mock-server.js`

## Troubleshooting

If emails aren't being sent:

1. Check if your Gmail App Password is correct
2. Verify all environment variables are set correctly in Netlify
3. Look at function logs in Netlify (Site settings > Functions > Logs)
4. Test with the `test-email.js` script locally

## Security Note

Never commit your SMTP password or any sensitive credentials to your Git repository. Always use environment variables for secrets.

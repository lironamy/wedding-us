# EmailJS Setup Guide

EmailJS allows you to send emails directly from your client-side code without needing a backend server.

## Step 1: Create EmailJS Account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account (allows 200 emails/month)
3. Verify your email address

## Step 2: Add Email Service

1. In your EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider:
   - **Gmail** (recommended for testing)
   - **Outlook**
   - Or any other supported provider
4. Follow the connection instructions
5. Copy the **Service ID** (e.g., `service_abc123`)

## Step 3: Create Email Template

1. Go to **Email Templates**
2. Click **Create New Template**
3. Use this template structure:

### Template Name
`wedding_platform_email`

### Template Content
```
Subject: {{subject}}

To: {{to_name}} <{{to_email}}>

{{message}}
```

### Template Variables
- `to_email` - Recipient email
- `to_name` - Recipient name
- `subject` - Email subject
- `message` - Email body content

4. Click **Save**
5. Copy the **Template ID** (e.g., `template_xyz789`)

## Step 4: Get Your Public Key

1. Go to **Account** → **General**
2. Find your **Public Key** (also called API key)
3. Copy it (e.g., `abcdef123456`)

## Step 5: Update Environment Variables

Add these to your `.env.local` file:

```env
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_abc123
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_xyz789
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=abcdef123456
```

Replace with your actual values from EmailJS dashboard.

## Step 6: Test the Configuration

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Go to: http://localhost:3000/forgot-password

3. Enter a test email address

4. Check if the email was sent in your EmailJS dashboard under **Email History**

## Email Types in the Platform

The platform uses EmailJS for these emails:

1. **Password Reset** - When user forgets password
2. **Welcome Email** - When new user registers (optional)
3. **RSVP Confirmation** - When guest confirms attendance (optional)

## EmailJS Free Tier Limits

- 200 emails/month
- 2 email templates
- Basic analytics
- Email history for 2 months

## Upgrading EmailJS

If you need more emails:
- **Personal Plan**: $7/month - 1,000 emails
- **Professional Plan**: $15/month - 5,000 emails

## Important Security Notes

1. **Public Key is Safe**: The EmailJS public key can be exposed in client-side code
2. **No Sensitive Data**: EmailJS is designed for client-side use
3. **Rate Limiting**: EmailJS has built-in rate limiting to prevent abuse
4. **Domain Restrictions**: You can restrict which domains can use your EmailJS account

## Configure Domain Restrictions (Recommended)

1. In EmailJS dashboard, go to **Settings** → **Security**
2. Add allowed domains:
   - `localhost:3000` (for development)
   - `yourdomain.com` (for production)
3. This prevents others from using your EmailJS account

## Alternative Email Template (Hebrew)

If you want a Hebrew-styled template:

```
נושא: {{subject}}

שלום {{to_name}},

{{message}}

---
פלטפורמת חתונות
{{to_email}}
```

## Troubleshooting

### Emails not sending?
1. Check EmailJS dashboard for error logs
2. Verify all environment variables are correct
3. Make sure service is connected in EmailJS dashboard
4. Check spam folder in recipient email

### "Invalid template" error?
- Verify template ID matches exactly
- Check template variables are correct
- Ensure template is published (not draft)

### Rate limit exceeded?
- Check EmailJS usage in dashboard
- Consider upgrading plan
- Implement client-side rate limiting

## Next Steps

After setting up EmailJS:
1. Test password reset functionality
2. Optionally enable welcome emails
3. Configure RSVP confirmation emails
4. Monitor usage in EmailJS dashboard

---

**Need Help?**
- EmailJS Documentation: https://www.emailjs.com/docs/
- EmailJS Support: https://www.emailjs.com/support/

# SendGrid Email Collection Setup

## Quick Start (5 minutes)

### 1. Get Your SendGrid API Key
1. Log into [SendGrid Dashboard](https://app.sendgrid.com)
2. Go to Settings → [API Keys](https://app.sendgrid.com/settings/api_keys)
3. Click "Create API Key"
4. Name it "WorkspaceOS Waitlist"
5. Select "Full Access" (or "Restricted Access" with Mail Send permissions)
6. Copy the API key (starts with `SG.`)

### 2. Verify a Sender Email
1. Go to Settings → [Sender Authentication](https://app.sendgrid.com/settings/sender_auth)
2. Choose "Single Sender Verification" (easier) or "Domain Authentication" (better)
3. For Single Sender: Add an email like `noreply@tryworkspaceos.com`
4. Verify the email address

### 3. Deploy the Serverless Function

#### Option A: Netlify (Recommended)
1. Connect your GitHub repo to Netlify
2. Set environment variables in Netlify Dashboard:
   - Go to Site Settings → Environment Variables
   - Add:
     ```
     SENDGRID_API_KEY=SG.your-key-here
     SENDGRID_SENDER_EMAIL=noreply@tryworkspaceos.com
     NOTIFICATION_EMAIL=your-email@example.com
     SEND_WELCOME_EMAIL=true
     ```
3. Deploy the site
4. Your endpoint will be: `https://your-site.netlify.app/.netlify/functions/waitlist-simple`

#### Option B: Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in your project directory
3. Add environment variables in Vercel Dashboard
4. Your endpoint will be: `https://your-site.vercel.app/api/waitlist-simple`

### 4. Update the Frontend
Update the API endpoint in `script.js`:

```javascript
// Change this line:
const response = await fetch('https://api.tryworkspaceos.com/waitlist', {

// To your actual endpoint:
const response = await fetch('https://your-site.netlify.app/.netlify/functions/waitlist-simple', {
```

## What Happens When Someone Signs Up

1. User enters email on website
2. JavaScript sends POST request to your serverless function
3. Function validates the email
4. SendGrid sends YOU a notification email with the signup details
5. Optionally sends the USER a welcome email
6. Returns success to the frontend

## Storing Emails Long-term

The simple setup just emails you notifications. For proper storage, consider:

1. **Google Sheets**: Use Zapier to auto-add SendGrid emails to a spreadsheet
2. **Airtable**: Direct API integration for structured data
3. **Database**: Add Supabase/Firebase to store emails properly
4. **SendGrid Contacts**: Use the Marketing API (requires paid plan)

## Testing

1. Test locally first:
```bash
# Install dependencies
npm install @sendgrid/mail

# Test the function
netlify dev
```

2. Submit a test email through your form
3. Check your notification email inbox
4. Check SendGrid Activity Feed for sent emails

## Troubleshooting

**"Unauthorized" error**: 
- Check your API key is correct
- Ensure it has Mail Send permissions

**"Sender not verified"**: 
- Complete sender verification in SendGrid
- Use the exact email in SENDGRID_SENDER_EMAIL

**CORS errors**: 
- Make sure the function returns proper CORS headers
- Check your frontend is using the correct endpoint URL

## Cost

- SendGrid Free Tier: 100 emails/day forever
- Netlify Functions: 125,000 requests/month free
- Total cost for most sites: $0

## Security Notes

- Never commit your `.env` file (it's in `.gitignore`)
- Use environment variables in production
- Consider rate limiting if you get spam signups
- Add reCAPTCHA if needed
# WorkspaceOS Waitlist Setup Guide

## Overview
This guide walks through setting up the waitlist functionality with Supabase backend for the WorkspaceOS website.

## Features Implemented
- ✅ Email collection with validation
- ✅ GDPR consent tracking (required)
- ✅ Marketing consent (optional)
- ✅ Rate limiting (5 submissions per IP/hour)
- ✅ Variant tracking (dev, ai, vision, default)
- ✅ UTM parameter tracking
- ✅ Loading states and error handling
- ✅ Analytics integration (dataLayer events)
- ✅ Duplicate email handling

## Quick Start

### 1. Set Up Supabase Project

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key from Settings → API

### 2. Create Database Tables

1. Go to SQL Editor in Supabase dashboard
2. Run the schema from `waitlist-schema.sql`:

```sql
-- Copy and paste the entire contents of waitlist-schema.sql
```

This creates:
- `waitlist` table for storing signups
- `waitlist_rate_limit` table for rate limiting
- Helper functions for validation and stats
- Row-level security policies

### 3. Configure Frontend

Edit `waitlist.js` and add your Supabase credentials:

```javascript
// Line 7-8 in waitlist.js
this.supabaseUrl = 'https://YOUR_PROJECT.supabase.co';
this.supabaseAnonKey = 'YOUR_ANON_KEY';
```

### 4. Test the Integration

1. Start local server:
```bash
python3 -m http.server 3000
```

2. Test each variant:
- http://localhost:3000/?user=dev
- http://localhost:3000/?user=ai
- http://localhost:3000/?user=vision
- http://localhost:3000/

3. Verify in Supabase:
- Check Table Editor → waitlist table
- Verify entries are being created with correct variant

## Testing Checklist

### Form Validation
- [ ] Empty email shows browser validation
- [ ] Invalid email format rejected
- [ ] GDPR consent required
- [ ] Marketing consent optional

### Submission States
- [ ] Loading spinner appears during submission
- [ ] Success message shows after submission
- [ ] Error message shows on failure
- [ ] Form resets after successful submission

### Tracking
- [ ] Variant tracked correctly from URL
- [ ] UTM parameters captured
- [ ] Browser metadata collected
- [ ] DataLayer events fire

### Rate Limiting
- [ ] 5 submissions allowed per hour
- [ ] 6th submission shows rate limit error
- [ ] Resets after 1 hour

## Analytics Events

The following events are tracked:

```javascript
// Form view
{
  event: 'waitlist_form_view',
  variant: 'dev|ai|vision|default'
}

// Successful signup
{
  event: 'waitlist_signup',
  variant: 'dev|ai|vision|default',
  existing_user: true|false,
  marketing_consent: true|false
}

// Error
{
  event: 'waitlist_error',
  error_message: 'error description',
  variant: 'dev|ai|vision|default'
}
```

## Database Queries

### View Waitlist Stats
```sql
SELECT * FROM get_waitlist_stats();
```

### View Recent Signups
```sql
SELECT email, variant, created_at, utm_campaign
FROM waitlist
ORDER BY created_at DESC
LIMIT 20;
```

### View Signups by Variant
```sql
SELECT variant, COUNT(*) as count
FROM waitlist
GROUP BY variant
ORDER BY count DESC;
```

### Export Emails for Marketing
```sql
SELECT email
FROM waitlist
WHERE marketing_consent = true
  AND status = 'confirmed';
```

## Environment Variables (Optional)

For production, consider using environment variables:

```javascript
// waitlist.js
this.supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
this.supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';
```

## Security Considerations

1. **Anon Key is Public**: The anon key is safe to expose in frontend code
2. **RLS Enabled**: Row-level security prevents unauthorized access
3. **Rate Limiting**: Prevents spam submissions
4. **Input Validation**: Server-side validation in Supabase function
5. **GDPR Compliance**: Explicit consent required and tracked

## Deployment

### GitHub Pages
The current setup works with GitHub Pages. Supabase credentials are included in the JavaScript.

### Netlify/Vercel
For these platforms, you can use environment variables:

1. Add env vars in platform dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

2. Use a build step to inject them:
```bash
# netlify.toml or vercel.json
[build.environment]
  SUPABASE_URL = "your-url"
  SUPABASE_ANON_KEY = "your-key"
```

## Troubleshooting

### "Too many submissions" error
- Rate limit triggered (5 per hour per IP)
- Wait 1 hour or test from different IP

### Email not saving
- Check browser console for errors
- Verify Supabase credentials
- Check Supabase dashboard logs

### CORS errors
- Supabase should handle CORS automatically
- Check if URL is correct (https not http)

### Form not appearing
- Check if waitlist.js is loaded
- Verify no JavaScript errors in console

## Future Enhancements

- [ ] Email confirmation flow
- [ ] Welcome email automation (SendGrid/Resend)
- [ ] Admin dashboard for viewing signups
- [ ] Export to CRM integration
- [ ] A/B test different form copies
- [ ] Progressive disclosure (ask for more info after email)

## Support

For issues with:
- **Supabase**: Check their [docs](https://supabase.com/docs)
- **Implementation**: Review this guide and code comments
- **Analytics**: Verify dataLayer is defined before waitlist.js loads

---

*Last Updated: January 2025*
# Complete Supabase Setup Guide for WorkspaceOS

This guide covers everything you need to configure in Supabase for the WorkspaceOS website and alpha testing system.

## 📋 Complete Setup Checklist

### 1. ✅ Authentication Setup

#### Enable Email Authentication
1. Go to **Authentication → Providers**
2. Enable **Email** provider
3. Configure settings:
   - ✅ Enable email confirmations: `ON`
   - ✅ Confirm email: `ON` (require email verification)
   - ✅ Secure email change: `ON`
   - ✅ Enable double confirm email: `ON` (for security)

#### Configure OAuth Providers

##### Apple Sign In
1. In **Authentication → Providers**, find **Apple**
2. Toggle to enable
3. You'll need (from Apple Developer Account):
   - **Service ID**: `com.triglavis.workspaceos.web`
   - **Team ID**: Your Apple Team ID
   - **Key ID**: Your Sign in with Apple Key ID
   - **Private Key**: Your `.p8` private key content
4. Add redirect URL: `https://vdopqkfhoxmzyoofjhnm.supabase.co/auth/v1/callback`

##### Google OAuth
1. In **Authentication → Providers**, find **Google**
2. Toggle to enable
3. Get credentials from [Google Cloud Console](https://console.cloud.google.com/):
   - Create new OAuth 2.0 Client ID
   - **Authorized JavaScript origins**: 
     - `https://tryworkspaceos.com`
     - `http://localhost:3000` (for testing)
   - **Authorized redirect URIs**:
     - `https://vdopqkfhoxmzyoofjhnm.supabase.co/auth/v1/callback`
4. Add **Client ID** and **Client Secret** to Supabase

##### GitHub OAuth
1. In **Authentication → Providers**, find **GitHub**
2. Toggle to enable
3. Create OAuth App in [GitHub Settings](https://github.com/settings/developers):
   - **Application name**: WorkspaceOS
   - **Homepage URL**: `https://tryworkspaceos.com`
   - **Authorization callback URL**: `https://vdopqkfhoxmzyoofjhnm.supabase.co/auth/v1/callback`
4. Add **Client ID** and **Client Secret** to Supabase

### 2. 📊 Database Setup (Alpha Testing Logs)

#### Run SQL Schema
1. Go to **SQL Editor**
2. Create new query
3. Paste the entire contents of `supabase-schema.sql`
4. Click **Run** to create:
   - `app_logs` table
   - `crash_reports` table
   - `app_metrics` table
   - All indexes and policies

#### Enable Realtime
1. Go to **Database → Replication**
2. Find `app_logs` table
3. Toggle **Enable Realtime** to ON
4. This allows secure log access via CLI tools

### 3. 🔗 URL Configuration

#### Set Site URL and Redirect URLs
1. Go to **Authentication → URL Configuration**
2. Set **Site URL**: `https://tryworkspaceos.com`
3. Add to **Redirect URLs**:
   ```
   https://tryworkspaceos.com/auth.html
   https://tryworkspaceos.com/
   http://localhost:3000/auth.html
   http://localhost:3000/
   ```

### 4. 📧 Email Templates

#### Customize Email Templates
1. Go to **Authentication → Email Templates**
2. Update each template:

**Confirm Signup Template:**
```html
<h2>Welcome to WorkspaceOS!</h2>
<p>Please confirm your email address by clicking the link below:</p>
<p><a href="{{ .ConfirmationURL }}">Verify Email Address</a></p>
<p>This link will expire in 24 hours.</p>
<p>If you didn't create an account, you can safely ignore this email.</p>
```

**Reset Password Template:**
```html
<h2>Reset Your WorkspaceOS Password</h2>
<p>Click the link below to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>This link will expire in 1 hour.</p>
<p>If you didn't request this, please ignore this email.</p>
```

**Magic Link Template:**
```html
<h2>Your WorkspaceOS Login Link</h2>
<p>Click the link below to sign in to your account:</p>
<p><a href="{{ .ConfirmationURL }}">Sign In to WorkspaceOS</a></p>
<p>This link will expire in 1 hour and can only be used once.</p>
```

### 5. 👤 Create Admin Users

#### Set Up Admin Role
1. Go to **Authentication → Users**
2. For each admin user, click on their entry
3. Edit **User metadata**
4. Add to `raw_user_meta_data`:
```json
{
  "role": "admin"
}
```
5. Admin users can view all logs via CLI tools (see LOG_CLI_README.md)

### 6. 🔐 Security Settings

#### Configure Auth Settings
1. Go to **Authentication → Settings**
2. Configure:
   - **JWT Expiry**: 3600 (1 hour)
   - **Refresh Token Rotation**: `ON`
   - **Reuse Interval**: 10 seconds
   - **Enable Manual Linking**: `OFF` (prevent account takeover)

#### Rate Limiting
1. Go to **Authentication → Rate Limits**
2. Set appropriate limits:
   - **Sign up**: 5 per hour
   - **Sign in**: 10 per hour
   - **Password recovery**: 3 per hour
   - **Email/SMS OTP**: 5 per hour

### 7. 🌍 CORS Configuration

If you encounter CORS issues:
1. Go to **Settings → API**
2. Add to **Additional Allowed Origins**:
   ```
   https://tryworkspaceos.com
   http://localhost:3000
   ```

### 8. 🚀 Edge Functions (Optional)

For custom email sending or advanced features:
1. Go to **Edge Functions**
2. Deploy custom functions for:
   - Custom email templates
   - Webhook handlers
   - Data processing

### 9. 📊 Storage (Future)

When you need file storage:
1. Go to **Storage**
2. Create bucket: `user-files`
3. Set policies for user file access
4. Configure max file size limits

### 10. 🔄 Backup Configuration

1. Go to **Settings → Backups**
2. Enable **Point-in-time Recovery**
3. Set retention period (7-30 days recommended)

## 🧪 Testing Your Setup

### Test Authentication Flow
```bash
# Test signup
curl -X POST https://vdopqkfhoxmzyoofjhnm.supabase.co/auth/v1/signup \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }'
```

### Test Log Insertion
```bash
# Test log entry (requires auth token)
curl -X POST https://vdopqkfhoxmzyoofjhnm.supabase.co/rest/v1/app_logs \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "your-user-id",
    "session_id": "test-session",
    "log_level": "info",
    "message": "Test log entry",
    "app_version": "0.5.7",
    "os_name": "macOS",
    "module": "test"
  }'
```

## 🚨 Common Issues & Solutions

### Issue: OAuth redirect not working
**Solution**: Make sure redirect URLs in Supabase match exactly with your OAuth provider settings

### Issue: Emails not being sent
**Solution**: Check **Authentication → Settings → SMTP Settings** if using custom SMTP

### Issue: Can't fetch logs via CLI
**Solution**: 
- Verify your email and password are correct
- Check that your account exists in Supabase
- Ensure RLS policies are enabled
- Verify your user has the correct role for viewing logs

### Issue: CORS errors
**Solution**: Add your domain to allowed origins in API settings

## 📝 Environment Variables for Local Development

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://vdopqkfhoxmzyoofjhnm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🔗 Important URLs

- **Supabase Dashboard**: https://app.supabase.com/project/vdopqkfhoxmzyoofjhnm
- **Live Site**: https://tryworkspaceos.com
- **Auth Page**: https://tryworkspaceos.com/auth.html
- **CLI Tools Documentation**: See LOG_CLI_README.md for fetching logs
- **API Documentation**: See LOG_API_DOCUMENTATION.md for API endpoints

## 📞 Support

If you encounter issues:
1. Check Supabase logs in **Logs → API**
2. Review Auth logs in **Logs → Auth**
3. Contact support@workspaceos.com

---

**Last Updated**: January 2025
**Supabase Project**: vdopqkfhoxmzyoofjhnm
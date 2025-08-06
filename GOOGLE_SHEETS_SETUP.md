# Google Sheets Email Collection Setup (Free & Simple)

## Quick Setup (10 minutes)

### Step 1: Create Your Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet called "WorkspaceOS Waitlist"
3. In row 1, add these headers:
   - Column A: `Email`
   - Column B: `Timestamp`
   - Column C: `Source`

### Step 2: Create Google Apps Script Web App

1. In your Google Sheet, click **Extensions → Apps Script**
2. Delete any existing code
3. Copy the **complete code** from `google-apps-script.js` file (includes validation & duplicate prevention)

Or copy this enhanced version here:

```javascript
// Email validation function
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;
  
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  
  const [localPart, domain] = parts;
  
  // Check local part
  if (localPart.startsWith('.') || localPart.endsWith('.')) return false;
  if (localPart.includes('..')) return false;
  
  // Check domain
  const domainParts = domain.split('.');
  if (domainParts.length < 2) return false;
  if (domainParts.some(part => part.length === 0)) return false;
  
  // Check TLD is at least 2 characters
  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2) return false;
  
  return true;
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Validate email format
    if (!data.email || !isValidEmail(data.email)) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'Invalid email address format'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Normalize email (lowercase for consistency)
    const normalizedEmail = data.email.toLowerCase().trim();
    
    // Open the spreadsheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Check for duplicates
    const existingData = sheet.getDataRange().getValues();
    const emailExists = existingData.some(row => {
      return row[0] && row[0].toString().toLowerCase().trim() === normalizedEmail;
    });
    
    if (emailExists) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          message: 'Already on the list',
          duplicate: true
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Add the new row
    sheet.appendRow([
      normalizedEmail,
      new Date().toISOString(),
      data.source || 'website'
    ]);
    
    // Optional: Send notification email to yourself
    // MailApp.sendEmail({
    //   to: 'your-email@example.com',
    //   subject: 'New WorkspaceOS Waitlist Signup',
    //   body: `New signup: ${normalizedEmail}\nTotal: ${sheet.getLastRow() - 1}`
    // });
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Successfully added to waitlist',
        totalSignups: sheet.getLastRow() - 1
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Test endpoint
function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const signupCount = sheet.getActiveSheet().getLastRow() - 1;
  
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'Working!',
      sheet: sheet.getName(),
      totalSignups: signupCount > 0 ? signupCount : 0
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. Click **Save** (💾 icon) and name it "Waitlist Handler"

### Step 3: Deploy as Web App

1. Click **Deploy → New Deployment**
2. Click the gear icon ⚙️ → **Web app**
3. Configure:
   - **Description**: "WorkspaceOS Waitlist"
   - **Execute as**: "Me"
   - **Who has access**: "Anyone" (required for public form)
4. Click **Deploy**
5. **IMPORTANT**: Copy the Web App URL (looks like: `https://script.google.com/macros/s/AKfycb.../exec`)
6. Click **Done**

### Step 4: Update Your Website

In your `script.js` file, update the form submission:

```javascript
// Replace this line:
const response = await fetch('https://api.tryworkspaceos.com/waitlist', {

// With your Google Apps Script URL:
const response = await fetch('https://script.google.com/macros/s/YOUR-SCRIPT-ID/exec', {
```

## That's it! 🎉

### Testing Your Setup

1. Go to your website
2. Enter a test email
3. Check your Google Sheet - the email should appear instantly

### What You Get

- ✅ **Free forever** - No limits, no charges
- ✅ **Real-time updates** - See signups instantly in Google Sheets
- ✅ **Easy export** - Download as CSV anytime
- ✅ **Shareable** - Share the sheet with your team
- ✅ **No maintenance** - Google handles everything

### Features Already Included

The code above already includes:

✅ **Email Validation**
- Checks email format (must have @ and valid domain)
- Validates no consecutive dots
- Ensures valid TLD (at least 2 characters)
- Prevents invalid characters at start/end

✅ **Duplicate Prevention**
- Normalizes emails to lowercase for consistent checking
- Prevents the same email from being added twice
- Returns friendly message if email already exists

✅ **Data Normalization**
- Trims whitespace from emails
- Converts to lowercase for consistency
- Ensures clean data in your spreadsheet

#### Get Email Notifications
Add this to get notified of new signups:

```javascript
// After appendRow in doPost:
MailApp.sendEmail({
  to: 'your-email@example.com',
  subject: 'New WorkspaceOS Waitlist Signup',
  body: `New signup: ${data.email}\nTotal signups: ${sheet.getLastRow() - 1}`
});
```

### Troubleshooting

**"CORS error" or "Failed to fetch"**
- Make sure you deployed as "Anyone" can access
- Use the `/exec` URL, not `/dev`
- Check the URL is copied correctly

**"Script error"**
- Check the Google Apps Script editor for errors
- Make sure the sheet headers are in row 1
- Verify the script is saved and deployed

**Testing the endpoint**
- Visit your Web App URL in a browser
- You should see: `{"status":"Working!","sheet":"WorkspaceOS Waitlist"}`

### Viewing Your Data

1. Open your Google Sheet anytime
2. Use filters to sort by date
3. Create charts to visualize signups
4. Export as CSV: File → Download → CSV

### Security Notes

- The Web App URL is public but only accepts POST requests
- Only you can see the actual spreadsheet data
- Google handles all security and scaling
- No API keys or passwords needed

## Why This is Better Than SendGrid

- **100% Free** - No surprise charges
- **No API limits** - Unlimited signups
- **Simple** - No API keys, no configuration
- **Visual** - See and edit data in familiar spreadsheet
- **Reliable** - Google's infrastructure
- **Shareable** - Easy to share with team
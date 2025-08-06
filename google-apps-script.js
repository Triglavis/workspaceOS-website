// Google Apps Script Code for WorkspaceOS Waitlist
// Copy this entire file into Google Apps Script Editor

// Email validation function
function isValidEmail(email) {
  // Check basic format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return false;
  }
  
  // Additional validation
  // - No consecutive dots
  // - No special characters at start/end
  // - Valid domain extension
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
    // Parse the incoming data
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
      // Check first column (email column) and normalize for comparison
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
    
    // Add the new row with normalized email
    sheet.appendRow([
      normalizedEmail,
      new Date().toISOString(),
      data.source || 'website',
      data.userAgent || '',
      data.referrer || ''
    ]);
    
    // Optional: Send yourself an email notification
    // Uncomment and update the email address below
    /*
    MailApp.sendEmail({
      to: 'your-email@example.com',
      subject: 'New WorkspaceOS Waitlist Signup',
      body: `New signup: ${data.email}\nTimestamp: ${new Date().toISOString()}\nTotal signups: ${sheet.getLastRow() - 1}`
    });
    */
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Successfully added to waitlist',
        totalSignups: sheet.getLastRow() - 1
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Log error for debugging
    console.error('Error:', error);
    
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Test function to verify the web app is working
function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const signupCount = sheet.getActiveSheet().getLastRow() - 1; // Subtract header row
  
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'Working!',
      sheet: sheet.getName(),
      totalSignups: signupCount > 0 ? signupCount : 0,
      message: 'POST to this URL to add emails'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Manual function to view stats (run this in the script editor)
function getStats() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  // Skip header row
  const emails = data.slice(1);
  
  console.log('Total signups:', emails.length);
  console.log('Latest signup:', emails[emails.length - 1]);
  
  // Count by source
  const sources = {};
  emails.forEach(row => {
    const source = row[2] || 'unknown';
    sources[source] = (sources[source] || 0) + 1;
  });
  
  console.log('Signups by source:', sources);
}
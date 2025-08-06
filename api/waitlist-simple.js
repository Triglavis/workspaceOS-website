// Simple Netlify/Vercel Function - Just sends you an email notification
// This is easier to set up and doesn't require SendGrid Marketing features

exports.handler = async (event, context) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    const { email, source, timestamp } = JSON.parse(event.body);

    // Validate email
    if (!email || !email.includes('@')) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid email address' })
      };
    }

    // Send notification email to yourself using SendGrid API
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: process.env.NOTIFICATION_EMAIL }] // Your email
        }],
        from: {
          email: process.env.SENDGRID_SENDER_EMAIL,
          name: 'WorkspaceOS Waitlist'
        },
        subject: `New Waitlist Signup: ${email}`,
        content: [{
          type: 'text/html',
          value: `
            <h2>New WorkspaceOS Waitlist Signup</h2>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Source:</strong> ${source || 'website'}</p>
            <p><strong>Timestamp:</strong> ${timestamp || new Date().toISOString()}</p>
            <hr>
            <p>Total signups can be tracked in your database or spreadsheet.</p>
          `
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`SendGrid API error: ${response.status}`);
    }

    // Optional: Also send a welcome email to the user
    if (process.env.SEND_WELCOME_EMAIL === 'true') {
      await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: email }]
          }],
          from: {
            email: process.env.SENDGRID_SENDER_EMAIL,
            name: 'WorkspaceOS'
          },
          subject: 'Welcome to WorkspaceOS Waitlist',
          content: [{
            type: 'text/html',
            value: `
              <h2>You're on the list!</h2>
              <p>Thanks for your interest in WorkspaceOS. We'll notify you as soon as we're ready to onboard new users.</p>
              <p>In the meantime, follow us for updates.</p>
              <p>Best,<br>The WorkspaceOS Team</p>
            `
          }]
        })
      });
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Successfully added to waitlist' 
      })
    };

  } catch (error) {
    console.error('Error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to add to waitlist',
        details: error.message 
      })
    };
  }
};
// Netlify/Vercel Serverless Function for SendGrid Email Collection
// Deploy this to Netlify Functions or Vercel

const sgMail = require('@sendgrid/mail');

// Initialize SendGrid with your API key
// Set this as an environment variable SENDGRID_API_KEY
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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

    // Add to SendGrid contacts list
    const addContactRequest = {
      method: 'PUT',
      url: '/v3/marketing/contacts',
      body: {
        list_ids: [process.env.SENDGRID_LIST_ID], // Optional: specific list ID
        contacts: [{
          email: email,
          custom_fields: {
            source: source || 'website',
            signup_date: timestamp || new Date().toISOString()
          }
        }]
      }
    };

    // If you want to use SendGrid's Marketing API to add contacts
    await sgMail.request(addContactRequest);

    // Send welcome email (optional)
    if (process.env.SENDGRID_WELCOME_TEMPLATE_ID) {
      const welcomeEmail = {
        to: email,
        from: process.env.SENDGRID_SENDER_EMAIL, // Your verified sender
        templateId: process.env.SENDGRID_WELCOME_TEMPLATE_ID,
        dynamicTemplateData: {
          email: email
        }
      };
      
      await sgMail.send(welcomeEmail);
    }

    // Log to console (you can also save to a database here)
    console.log(`New waitlist signup: ${email} from ${source}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Successfully added to waitlist' 
      })
    };

  } catch (error) {
    console.error('SendGrid error:', error);
    
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
// Supabase Configuration
const SUPABASE_URL = 'https://vdopqkfhoxmzyoofjhnm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkb3Bxa2Zob3htenlvb2ZqaG5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NzQwMjAsImV4cCI6MjA3MTA1MDAyMH0.OVNaThLvkvlxE_N-pN_x58zNV2fOLHstiOXCBqFvxj0';

// Initialize Supabase client
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements
const signinForm = document.getElementById('signin-form');
const signupForm = document.getElementById('signup-form');
const resetForm = document.getElementById('reset-form');
const authMessage = document.getElementById('auth-message');
const authTabs = document.querySelectorAll('.auth-tab');
const authForms = document.querySelectorAll('.auth-form');
const forgotPassword = document.querySelector('.forgot-password');
const backToSignin = document.querySelector('.back-to-signin');
const successModal = document.getElementById('success-modal');
const successClose = document.querySelector('.success-close');

// OAuth buttons
const appleAuth = document.getElementById('apple-auth');
const googleAuth = document.getElementById('google-auth');
const githubAuth = document.getElementById('github-auth');

// Privacy link handler
const privacyAuthLink = document.getElementById('privacy-auth-link');
if (privacyAuthLink) {
    privacyAuthLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '/#privacy';
    });
}

// Tab switching
authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;
        
        // Update active tab
        authTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Show corresponding form
        authForms.forEach(form => {
            form.classList.remove('active');
            if (form.id === `${targetTab}-form`) {
                form.classList.add('active');
            }
        });
        
        // Clear messages
        hideMessage();
    });
});

// Forgot password link
if (forgotPassword) {
    forgotPassword.addEventListener('click', (e) => {
        e.preventDefault();
        authForms.forEach(form => form.classList.remove('active'));
        resetForm.classList.add('active');
        hideMessage();
    });
}

// Back to sign in link
if (backToSignin) {
    backToSignin.addEventListener('click', (e) => {
        e.preventDefault();
        authForms.forEach(form => form.classList.remove('active'));
        signinForm.classList.add('active');
        authTabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === 'signin') {
                tab.classList.add('active');
            }
        });
        hideMessage();
    });
}

// Success modal close
if (successClose) {
    successClose.addEventListener('click', () => {
        successModal.classList.remove('active');
    });
}

// Message display functions
function showMessage(message, type = 'error') {
    authMessage.textContent = message;
    authMessage.className = `auth-message ${type}`;
    authMessage.style.display = 'block';
}

function hideMessage() {
    authMessage.style.display = 'none';
    authMessage.textContent = '';
}

function showSuccessModal() {
    successModal.classList.add('active');
}

// Loading state
function setLoading(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        const originalContent = button.innerHTML;
        button.dataset.originalContent = originalContent;
        button.innerHTML = '<span class="spinner"></span> Processing...';
    } else {
        button.disabled = false;
        button.innerHTML = button.dataset.originalContent || button.innerHTML;
    }
}

// Sign In Handler
signinForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessage();
    
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;
    const rememberMe = document.getElementById('remember-me').checked;
    const submitButton = signinForm.querySelector('.auth-submit');
    
    setLoading(submitButton, true);
    
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password,
        });
        
        if (error) throw error;
        
        // Store session preference
        if (rememberMe) {
            localStorage.setItem('workspaceos_remember', 'true');
        }
        
        showMessage('Sign in successful! Redirecting...', 'success');
        
        // Redirect to main page after successful sign in
        setTimeout(() => {
            // Check if there's a redirect URL
            const urlParams = new URLSearchParams(window.location.search);
            const redirectTo = urlParams.get('redirect') || '/';
            window.location.href = redirectTo;
        }, 1500);
        
    } catch (error) {
        showMessage(error.message || 'Failed to sign in. Please try again.');
    } finally {
        setLoading(submitButton, false);
    }
});

// Sign Up Handler
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessage();
    
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm').value;
    const agreeTerms = document.getElementById('agree-terms').checked;
    const submitButton = signupForm.querySelector('.auth-submit');
    
    // Validation
    if (password !== confirmPassword) {
        showMessage('Passwords do not match');
        return;
    }
    
    if (!agreeTerms) {
        showMessage('Please agree to the Terms and Privacy Policy');
        return;
    }
    
    if (password.length < 8) {
        showMessage('Password must be at least 8 characters');
        return;
    }
    
    setLoading(submitButton, true);
    
    try {
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/auth.html?verified=true`,
                data: {
                    signup_date: new Date().toISOString(),
                    source: 'website'
                }
            }
        });
        
        if (error) throw error;
        
        // Show success modal
        showSuccessModal();
        
        // Clear form
        signupForm.reset();
        
    } catch (error) {
        showMessage(error.message || 'Failed to create account. Please try again.');
    } finally {
        setLoading(submitButton, false);
    }
});

// Password Reset Handler
resetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessage();
    
    const email = document.getElementById('reset-email').value;
    const submitButton = resetForm.querySelector('.auth-submit');
    
    setLoading(submitButton, true);
    
    try {
        const { data, error } = await supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth.html?reset=true`,
        });
        
        if (error) throw error;
        
        showMessage('Password reset link sent! Check your email.', 'success');
        
        // Clear form
        resetForm.reset();
        
    } catch (error) {
        showMessage(error.message || 'Failed to send reset link. Please try again.');
    } finally {
        setLoading(submitButton, false);
    }
});

// OAuth Handlers
appleAuth.addEventListener('click', async () => {
    try {
        const { data, error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'apple',
            options: {
                redirectTo: `${window.location.origin}/`
            }
        });
        
        if (error) throw error;
        
    } catch (error) {
        showMessage('Failed to sign in with Apple. Please try again.');
    }
});

googleAuth.addEventListener('click', async () => {
    try {
        const { data, error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/`
            }
        });
        
        if (error) throw error;
        
    } catch (error) {
        showMessage('Failed to sign in with Google. Please try again.');
    }
});

githubAuth.addEventListener('click', async () => {
    try {
        const { data, error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: `${window.location.origin}/`
            }
        });
        
        if (error) throw error;
        
    } catch (error) {
        showMessage('Failed to sign in with GitHub. Please try again.');
    }
});

// Check for email verification or password reset
window.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check if user just verified their email
    if (urlParams.get('verified') === 'true') {
        showMessage('Email verified! You can now sign in.', 'success');
        // Clear URL params
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Check if user is resetting password
    if (urlParams.get('reset') === 'true') {
        // Show password reset form
        authForms.forEach(form => form.classList.remove('active'));
        
        // You would typically show a new password form here
        showMessage('Please check your email for the password reset link.', 'success');
        
        // Clear URL params
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Check if user is already logged in
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        // Redirect to home page if already logged in
        window.location.href = '/';
    }
});

// Listen for auth state changes
supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event);
    
    if (event === 'SIGNED_IN' && session) {
        console.log('User signed in:', session.user.email);
    }
    
    if (event === 'SIGNED_OUT') {
        console.log('User signed out');
    }
    
    if (event === 'PASSWORD_RECOVERY') {
        // Show password reset form
        console.log('Password recovery mode');
    }
});
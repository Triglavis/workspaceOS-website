// WorkspaceOS Waitlist Form Handler with Supabase Integration

class WaitlistManager {
    constructor() {
        // Initialize with public anon key (safe to expose)
        // Replace with your actual Supabase URL and anon key
        this.supabaseUrl = 'YOUR_SUPABASE_URL';
        this.supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
        
        // Check if running locally for testing
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('🔧 Waitlist: Running in development mode');
        }
        
        this.form = null;
        this.emailInput = null;
        this.submitButton = null;
        this.gdprCheckbox = null;
        this.marketingCheckbox = null;
        this.formNote = null;
        
        this.init();
    }
    
    init() {
        // Find form elements
        this.form = document.querySelector('.early-access-form');
        if (!this.form) return;
        
        this.emailInput = this.form.querySelector('.email-input');
        this.submitButton = this.form.querySelector('.btn-primary');
        
        // Create GDPR consent UI
        this.createConsentUI();
        
        // Attach submit handler
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Track form visibility for analytics
        this.trackFormImpression();
    }
    
    createConsentUI() {
        // Create consent container
        const consentContainer = document.createElement('div');
        consentContainer.className = 'consent-container';
        consentContainer.innerHTML = `
            <label class="consent-label gdpr-required">
                <input type="checkbox" class="consent-checkbox" id="gdpr-consent" required>
                <span>I agree to the <a href="#" class="privacy-link consent-link">Privacy Policy</a> <span class="required">*</span></span>
            </label>
            <label class="consent-label">
                <input type="checkbox" class="consent-checkbox" id="marketing-consent">
                <span>Send me product updates and news (optional)</span>
            </label>
        `;
        
        // Insert before the form note
        this.formNote = document.querySelector('.form-note');
        if (this.formNote) {
            this.formNote.parentNode.insertBefore(consentContainer, this.formNote);
        } else {
            this.form.parentNode.appendChild(consentContainer);
        }
        
        // Store references
        this.gdprCheckbox = document.getElementById('gdpr-consent');
        this.marketingCheckbox = document.getElementById('marketing-consent');
        
        // Add styles
        this.injectStyles();
    }
    
    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .consent-container {
                margin-top: 16px;
                margin-bottom: 12px;
            }
            
            .consent-label {
                display: flex;
                align-items: flex-start;
                margin-bottom: 10px;
                font-size: 13px;
                color: rgba(255, 255, 255, 0.7);
                cursor: pointer;
                user-select: none;
            }
            
            .consent-checkbox {
                margin-right: 8px;
                margin-top: 2px;
                cursor: pointer;
                width: 16px;
                height: 16px;
                accent-color: #6a6a6a;
            }
            
            .consent-label:hover {
                color: rgba(255, 255, 255, 0.9);
            }
            
            .consent-link {
                color: inherit;
                text-decoration: underline;
                text-underline-offset: 2px;
            }
            
            .consent-link:hover {
                color: #fff;
            }
            
            .required {
                color: #ff6b6b;
                margin-left: 2px;
            }
            
            /* Loading state */
            .btn-primary.loading {
                position: relative;
                color: transparent;
                pointer-events: none;
            }
            
            .btn-primary.loading::after {
                content: '';
                position: absolute;
                width: 16px;
                height: 16px;
                top: 50%;
                left: 50%;
                margin-left: -8px;
                margin-top: -8px;
                border: 2px solid #ffffff;
                border-radius: 50%;
                border-top-color: transparent;
                animation: spinner 0.6s linear infinite;
            }
            
            @keyframes spinner {
                to { transform: rotate(360deg); }
            }
            
            /* Success state */
            .btn-primary.success {
                background: #10b981;
                border-color: #10b981;
                pointer-events: none;
            }
            
            .btn-primary.success span {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }
            
            /* Error state */
            .form-error {
                color: #ff6b6b;
                font-size: 13px;
                margin-top: 8px;
                display: none;
            }
            
            .form-error.show {
                display: block;
                animation: shake 0.3s ease;
            }
            
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
        `;
        document.head.appendChild(style);
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        // Validate inputs
        const email = this.emailInput.value.trim();
        if (!email) return;
        
        if (!this.gdprCheckbox.checked) {
            this.showError('Please accept the privacy policy to continue');
            this.gdprCheckbox.focus();
            return;
        }
        
        // Get tracking data
        const trackingData = this.getTrackingData();
        
        // Show loading state
        this.setLoadingState(true);
        
        try {
            // Submit to Supabase
            const result = await this.submitToSupabase(email, trackingData);
            
            if (result.success) {
                this.handleSuccess(result.message, result.existing);
            } else {
                this.handleError(result.message);
            }
        } catch (error) {
            console.error('Waitlist submission error:', error);
            this.handleError('Something went wrong. Please try again.');
        } finally {
            this.setLoadingState(false);
        }
    }
    
    async submitToSupabase(email, trackingData) {
        // If Supabase is not configured, use mock response
        if (!this.supabaseUrl || this.supabaseUrl === 'YOUR_SUPABASE_URL') {
            console.log('📧 Waitlist submission (mock):', { email, ...trackingData });
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Mock successful response
            return {
                success: true,
                message: "You're on the list! Check your email for confirmation.",
                existing: false
            };
        }
        
        // Make actual Supabase call
        try {
            const response = await fetch(`${this.supabaseUrl}/rest/v1/rpc/add_to_waitlist`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.supabaseAnonKey,
                    'Authorization': `Bearer ${this.supabaseAnonKey}`
                },
                body: JSON.stringify({
                    p_email: email,
                    p_variant: trackingData.variant,
                    p_gdpr_consent: this.gdprCheckbox.checked,
                    p_marketing_consent: this.marketingCheckbox.checked,
                    p_utm_source: trackingData.utm_source,
                    p_utm_medium: trackingData.utm_medium,
                    p_utm_campaign: trackingData.utm_campaign,
                    p_utm_content: trackingData.utm_content,
                    p_utm_term: trackingData.utm_term,
                    p_referrer: trackingData.referrer,
                    p_user_agent: trackingData.user_agent,
                    p_browser_language: trackingData.browser_language,
                    p_screen_resolution: trackingData.screen_resolution
                })
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Supabase error:', error);
            throw error;
        }
    }
    
    getTrackingData() {
        const params = new URLSearchParams(window.location.search);
        
        // Get variant from URL or default
        const userParam = params.get('user');
        const utmCampaign = params.get('utm_campaign');
        const variant = userParam || utmCampaign || 'default';
        
        return {
            variant: variant.toLowerCase(),
            utm_source: params.get('utm_source') || null,
            utm_medium: params.get('utm_medium') || null,
            utm_campaign: params.get('utm_campaign') || null,
            utm_content: params.get('utm_content') || null,
            utm_term: params.get('utm_term') || null,
            referrer: document.referrer || null,
            user_agent: navigator.userAgent,
            browser_language: navigator.language,
            screen_resolution: `${screen.width}x${screen.height}`
        };
    }
    
    setLoadingState(loading) {
        if (loading) {
            this.submitButton.classList.add('loading');
            this.emailInput.disabled = true;
            this.gdprCheckbox.disabled = true;
            this.marketingCheckbox.disabled = true;
        } else {
            this.submitButton.classList.remove('loading');
            this.emailInput.disabled = false;
            this.gdprCheckbox.disabled = false;
            this.marketingCheckbox.disabled = false;
        }
    }
    
    handleSuccess(message, isExisting) {
        // Update button to success state
        this.submitButton.classList.remove('loading');
        this.submitButton.classList.add('success');
        this.submitButton.innerHTML = '<span>✓ ' + (isExisting ? "You're already on the list!" : "You're on the list!") + '</span>';
        
        // Track conversion
        this.trackConversion(isExisting);
        
        // Clear form
        this.emailInput.value = '';
        this.gdprCheckbox.checked = false;
        this.marketingCheckbox.checked = false;
        
        // Reset button after delay
        setTimeout(() => {
            this.submitButton.classList.remove('success');
            this.submitButton.innerHTML = '<span>Join waitlist</span><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7 10H13M13 10L10 7M13 10L10 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        }, 5000);
    }
    
    handleError(message) {
        // Remove loading state
        this.setLoadingState(false);
        
        // Show error message
        this.showError(message);
        
        // Track error
        this.trackError(message);
    }
    
    showError(message) {
        // Check if error element exists
        let errorEl = this.form.querySelector('.form-error');
        if (!errorEl) {
            errorEl = document.createElement('div');
            errorEl.className = 'form-error';
            this.form.appendChild(errorEl);
        }
        
        errorEl.textContent = message;
        errorEl.classList.add('show');
        
        // Hide after delay
        setTimeout(() => {
            errorEl.classList.remove('show');
        }, 5000);
    }
    
    trackFormImpression() {
        // Track that form was shown
        if (window.dataLayer) {
            const trackingData = this.getTrackingData();
            window.dataLayer.push({
                event: 'waitlist_form_view',
                variant: trackingData.variant
            });
        }
    }
    
    trackConversion(isExisting) {
        // Track successful signup
        if (window.dataLayer) {
            const trackingData = this.getTrackingData();
            window.dataLayer.push({
                event: 'waitlist_signup',
                variant: trackingData.variant,
                existing_user: isExisting,
                marketing_consent: this.marketingCheckbox.checked
            });
        }
        
        // Log for debugging
        console.log('✅ Waitlist signup tracked:', {
            variant: this.getTrackingData().variant,
            existing: isExisting
        });
    }
    
    trackError(errorMessage) {
        // Track form errors
        if (window.dataLayer) {
            window.dataLayer.push({
                event: 'waitlist_error',
                error_message: errorMessage,
                variant: this.getTrackingData().variant
            });
        }
    }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.waitlistManager = new WaitlistManager();
    });
} else {
    window.waitlistManager = new WaitlistManager();
}
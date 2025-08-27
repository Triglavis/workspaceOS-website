// Enhanced Waitlist Form Handler with GDPR Consent and Variant Tracking
// This enhances the existing Google Sheets integration

class EnhancedWaitlistManager {
    constructor() {
        // Google Apps Script endpoint (existing)
        this.gasEndpoint = 'https://script.google.com/macros/s/AKfycbwRnCz5tPNwQnf1gIDZJ1PnHRcqJQ2P2vUqPbdXDvIgshXJOw-YzCfSxhfCvFOSzFhBFA/exec';
        
        this.form = null;
        this.emailInput = null;
        this.submitButton = null;
        this.gdprCheckbox = null;
        this.marketingCheckbox = null;
        this.formNote = null;
        this.consentContainer = null;
        
        this.init();
    }
    
    init() {
        // Find form elements
        this.form = document.querySelector('.early-access-form');
        if (!this.form) return;
        
        // Check if we already have the original handler
        const existingHandler = this.form.dataset.handlerAttached;
        if (existingHandler) {
            // Enhance existing handler instead of replacing
            this.enhanceExistingForm();
            return;
        }
        
        this.emailInput = this.form.querySelector('.email-input');
        this.submitButton = this.form.querySelector('.btn-primary');
        
        // Create GDPR consent UI
        this.createConsentUI();
        
        // Track form visibility for analytics
        this.trackFormImpression();
    }
    
    enhanceExistingForm() {
        // Just add consent UI without changing submission logic
        this.emailInput = this.form.querySelector('.email-input');
        this.submitButton = this.form.querySelector('.btn-primary');
        this.createConsentUI();
        
        // Modify existing form submission
        const originalSubmit = this.form.onsubmit;
        this.form.onsubmit = null;
        
        this.form.addEventListener('submit', (e) => {
            // Check GDPR consent
            if (this.gdprCheckbox && !this.gdprCheckbox.checked) {
                e.preventDefault();
                this.showError('Please accept the privacy policy to continue');
                this.gdprCheckbox.focus();
                return false;
            }
            
            // Track consent and variant
            this.trackSubmission();
            
            // Continue with original submission if consent is given
            if (originalSubmit) {
                return originalSubmit.call(this.form, e);
            }
        });
    }
    
    createConsentUI() {
        // Check if consent UI already exists
        if (document.querySelector('.consent-container')) return;
        
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
        this.consentContainer = consentContainer;
        
        // Add styles
        this.injectStyles();
    }
    
    injectStyles() {
        // Check if styles already exist
        if (document.querySelector('#waitlist-enhanced-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'waitlist-enhanced-styles';
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
            
            /* Error message for consent */
            .consent-error {
                color: #ff6b6b;
                font-size: 12px;
                margin-top: 4px;
                display: none;
            }
            
            .consent-error.show {
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
            gdpr_consent: this.gdprCheckbox ? this.gdprCheckbox.checked : false,
            marketing_consent: this.marketingCheckbox ? this.marketingCheckbox.checked : false
        };
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
    
    trackSubmission() {
        // Track successful signup with consent data
        const trackingData = this.getTrackingData();
        
        if (window.dataLayer) {
            window.dataLayer.push({
                event: 'waitlist_signup',
                variant: trackingData.variant,
                gdpr_consent: trackingData.gdpr_consent,
                marketing_consent: trackingData.marketing_consent,
                utm_source: trackingData.utm_source,
                utm_medium: trackingData.utm_medium,
                utm_campaign: trackingData.utm_campaign
            });
        }
        
        // Also store variant data for Google Sheets submission
        // Enhance the form data that gets sent
        if (window.FormHandler && window.FormHandler.instance) {
            const handler = window.FormHandler.instance;
            handler.additionalData = trackingData;
        }
    }
    
    showError(message) {
        // Check if error element exists
        let errorEl = this.consentContainer.querySelector('.consent-error');
        if (!errorEl) {
            errorEl = document.createElement('div');
            errorEl.className = 'consent-error';
            this.consentContainer.appendChild(errorEl);
        }
        
        errorEl.textContent = message;
        errorEl.classList.add('show');
        
        // Hide after delay
        setTimeout(() => {
            errorEl.classList.remove('show');
        }, 5000);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.enhancedWaitlistManager = new EnhancedWaitlistManager();
    });
} else {
    // DOM already loaded
    window.enhancedWaitlistManager = new EnhancedWaitlistManager();
}
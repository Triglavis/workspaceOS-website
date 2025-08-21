-- WorkspaceOS Waitlist Schema
-- Run this in your Supabase SQL Editor (Database → SQL Editor)

-- Create waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Contact information
    email TEXT NOT NULL UNIQUE,
    
    -- Tracking information
    variant TEXT NOT NULL DEFAULT 'default',
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_content TEXT,
    utm_term TEXT,
    referrer TEXT,
    
    -- Consent tracking
    gdpr_consent BOOLEAN NOT NULL DEFAULT false,
    gdpr_consent_timestamp TIMESTAMPTZ,
    marketing_consent BOOLEAN DEFAULT false,
    
    -- Metadata
    ip_address INET,
    user_agent TEXT,
    browser_language TEXT,
    screen_resolution TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Status tracking
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'unsubscribed', 'bounced')),
    confirmed_at TIMESTAMPTZ,
    unsubscribed_at TIMESTAMPTZ,
    
    -- Welcome email tracking
    welcome_email_sent BOOLEAN DEFAULT false,
    welcome_email_sent_at TIMESTAMPTZ,
    
    -- Notes for internal use
    internal_notes TEXT
);

-- Create indexes for performance
CREATE INDEX idx_waitlist_email ON waitlist(email);
CREATE INDEX idx_waitlist_created_at ON waitlist(created_at DESC);
CREATE INDEX idx_waitlist_variant ON waitlist(variant);
CREATE INDEX idx_waitlist_status ON waitlist(status);
CREATE INDEX idx_waitlist_utm_campaign ON waitlist(utm_campaign);

-- Rate limiting table
CREATE TABLE IF NOT EXISTS waitlist_rate_limit (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address INET NOT NULL,
    attempt_count INTEGER DEFAULT 1,
    window_start TIMESTAMPTZ DEFAULT NOW(),
    last_attempt TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(ip_address)
);

-- Create index for rate limiting
CREATE INDEX idx_rate_limit_ip ON waitlist_rate_limit(ip_address);
CREATE INDEX idx_rate_limit_window ON waitlist_rate_limit(window_start);

-- Function to check rate limit (5 submissions per hour per IP)
CREATE OR REPLACE FUNCTION check_waitlist_rate_limit(
    p_ip_address INET
)
RETURNS BOOLEAN AS $$
DECLARE
    v_count INTEGER;
    v_window_start TIMESTAMPTZ;
BEGIN
    -- Get current rate limit info
    SELECT attempt_count, window_start
    INTO v_count, v_window_start
    FROM waitlist_rate_limit
    WHERE ip_address = p_ip_address;
    
    -- If no record exists, allow and create one
    IF NOT FOUND THEN
        INSERT INTO waitlist_rate_limit (ip_address, attempt_count, window_start, last_attempt)
        VALUES (p_ip_address, 1, NOW(), NOW());
        RETURN TRUE;
    END IF;
    
    -- If window has expired (1 hour), reset
    IF v_window_start < NOW() - INTERVAL '1 hour' THEN
        UPDATE waitlist_rate_limit
        SET attempt_count = 1,
            window_start = NOW(),
            last_attempt = NOW()
        WHERE ip_address = p_ip_address;
        RETURN TRUE;
    END IF;
    
    -- Check if under limit
    IF v_count < 5 THEN
        UPDATE waitlist_rate_limit
        SET attempt_count = attempt_count + 1,
            last_attempt = NOW()
        WHERE ip_address = p_ip_address;
        RETURN TRUE;
    END IF;
    
    -- Rate limit exceeded
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to add email to waitlist with validation
CREATE OR REPLACE FUNCTION add_to_waitlist(
    p_email TEXT,
    p_variant TEXT DEFAULT 'default',
    p_gdpr_consent BOOLEAN DEFAULT false,
    p_marketing_consent BOOLEAN DEFAULT false,
    p_utm_source TEXT DEFAULT NULL,
    p_utm_medium TEXT DEFAULT NULL,
    p_utm_campaign TEXT DEFAULT NULL,
    p_utm_content TEXT DEFAULT NULL,
    p_utm_term TEXT DEFAULT NULL,
    p_referrer TEXT DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_browser_language TEXT DEFAULT NULL,
    p_screen_resolution TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
    v_existing_email TEXT;
BEGIN
    -- Validate email format
    IF p_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'invalid_email',
            'message', 'Please provide a valid email address'
        );
    END IF;
    
    -- Check GDPR consent
    IF p_gdpr_consent = false THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'consent_required',
            'message', 'Please accept the privacy policy to continue'
        );
    END IF;
    
    -- Check rate limit if IP provided
    IF p_ip_address IS NOT NULL THEN
        IF NOT check_waitlist_rate_limit(p_ip_address) THEN
            RETURN jsonb_build_object(
                'success', false,
                'error', 'rate_limit',
                'message', 'Too many submissions. Please try again later.'
            );
        END IF;
    END IF;
    
    -- Check if email already exists
    SELECT email INTO v_existing_email
    FROM waitlist
    WHERE LOWER(email) = LOWER(p_email);
    
    IF v_existing_email IS NOT NULL THEN
        -- Update existing record with new information
        UPDATE waitlist
        SET 
            variant = p_variant,
            utm_source = COALESCE(p_utm_source, utm_source),
            utm_medium = COALESCE(p_utm_medium, utm_medium),
            utm_campaign = COALESCE(p_utm_campaign, utm_campaign),
            utm_content = COALESCE(p_utm_content, utm_content),
            utm_term = COALESCE(p_utm_term, utm_term),
            referrer = COALESCE(p_referrer, referrer),
            marketing_consent = p_marketing_consent,
            updated_at = NOW()
        WHERE LOWER(email) = LOWER(p_email);
        
        RETURN jsonb_build_object(
            'success', true,
            'message', 'You''re already on the list! We''ll notify you when we launch.',
            'existing', true
        );
    END IF;
    
    -- Insert new email
    INSERT INTO waitlist (
        email,
        variant,
        gdpr_consent,
        gdpr_consent_timestamp,
        marketing_consent,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_content,
        utm_term,
        referrer,
        ip_address,
        user_agent,
        browser_language,
        screen_resolution
    ) VALUES (
        LOWER(p_email),
        p_variant,
        p_gdpr_consent,
        NOW(),
        p_marketing_consent,
        p_utm_source,
        p_utm_medium,
        p_utm_campaign,
        p_utm_content,
        p_utm_term,
        p_referrer,
        p_ip_address,
        p_user_agent,
        p_browser_language,
        p_screen_resolution
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'You''re on the list! Check your email for confirmation.',
        'existing', false
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'server_error',
            'message', 'Something went wrong. Please try again.'
        );
END;
$$ LANGUAGE plpgsql;

-- Function to get waitlist statistics
CREATE OR REPLACE FUNCTION get_waitlist_stats()
RETURNS JSONB AS $$
DECLARE
    v_stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_signups', COUNT(*),
        'confirmed', COUNT(*) FILTER (WHERE status = 'confirmed'),
        'pending', COUNT(*) FILTER (WHERE status = 'pending'),
        'by_variant', (
            SELECT jsonb_object_agg(variant, count)
            FROM (
                SELECT variant, COUNT(*) as count
                FROM waitlist
                GROUP BY variant
            ) t
        ),
        'by_utm_campaign', (
            SELECT jsonb_object_agg(COALESCE(utm_campaign, 'direct'), count)
            FROM (
                SELECT utm_campaign, COUNT(*) as count
                FROM waitlist
                GROUP BY utm_campaign
            ) t
        ),
        'last_24h', COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours'),
        'last_7d', COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days'),
        'last_30d', COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days')
    ) INTO v_stats
    FROM waitlist;
    
    RETURN v_stats;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) Policies
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist_rate_limit ENABLE ROW LEVEL SECURITY;

-- Public can insert to waitlist (through function)
CREATE POLICY "Public can add to waitlist" ON waitlist
    FOR INSERT WITH CHECK (true);

-- Only admins can view waitlist
CREATE POLICY "Admins can view waitlist" ON waitlist
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.uid() = id
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Only admins can update waitlist
CREATE POLICY "Admins can update waitlist" ON waitlist
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.uid() = id
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Clean up old rate limit records (older than 24 hours)
CREATE OR REPLACE FUNCTION clean_old_rate_limits()
RETURNS void AS $$
BEGIN
    DELETE FROM waitlist_rate_limit
    WHERE window_start < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to clean rate limits (requires pg_cron)
-- SELECT cron.schedule('clean-rate-limits', '0 */6 * * *', 'SELECT clean_old_rate_limits();');

-- Add comments for documentation
COMMENT ON TABLE waitlist IS 'Stores email waitlist signups for WorkspaceOS';
COMMENT ON TABLE waitlist_rate_limit IS 'Rate limiting for waitlist submissions';
COMMENT ON FUNCTION add_to_waitlist IS 'Adds an email to the waitlist with validation and rate limiting';
COMMENT ON FUNCTION get_waitlist_stats IS 'Returns statistics about waitlist signups';
COMMENT ON FUNCTION check_waitlist_rate_limit IS 'Checks if IP address has exceeded rate limit';
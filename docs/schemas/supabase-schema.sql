-- WorkspaceOS Alpha Testing Logs Schema
-- Run this in your Supabase SQL Editor (Database → SQL Editor)

-- Create logs table for alpha testers
CREATE TABLE IF NOT EXISTS app_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT,
    session_id TEXT NOT NULL,
    
    -- Log metadata
    log_level TEXT NOT NULL CHECK (log_level IN ('debug', 'info', 'warn', 'error', 'fatal')),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    
    -- Log content
    message TEXT NOT NULL,
    context JSONB,
    
    -- App information
    app_version TEXT,
    os_name TEXT,
    os_version TEXT,
    device_id TEXT,
    
    -- Performance metrics
    memory_usage BIGINT, -- in bytes
    cpu_usage FLOAT, -- percentage
    
    -- Error specific fields
    error_stack TEXT,
    error_code TEXT,
    
    -- Categorization
    module TEXT, -- which part of the app (capture, analyze, act, etc.)
    action TEXT, -- what action was being performed
    
    -- Indexing for search
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(message, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(error_stack, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(module, '')), 'C')
    ) STORED
);

-- Create indexes for performance
CREATE INDEX idx_app_logs_user_id ON app_logs(user_id);
CREATE INDEX idx_app_logs_timestamp ON app_logs(timestamp DESC);
CREATE INDEX idx_app_logs_log_level ON app_logs(log_level);
CREATE INDEX idx_app_logs_session_id ON app_logs(session_id);
CREATE INDEX idx_app_logs_module ON app_logs(module);
CREATE INDEX idx_app_logs_search ON app_logs USING GIN(search_vector);

-- Create crash reports table for critical errors
CREATE TABLE IF NOT EXISTS crash_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT,
    
    -- Crash metadata
    crash_id TEXT UNIQUE NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    
    -- Crash details
    crash_type TEXT NOT NULL,
    crash_message TEXT NOT NULL,
    stack_trace TEXT NOT NULL,
    
    -- System state at crash
    system_info JSONB,
    app_state JSONB,
    
    -- App information
    app_version TEXT NOT NULL,
    os_name TEXT,
    os_version TEXT,
    device_id TEXT,
    
    -- Analysis
    resolved BOOLEAN DEFAULT FALSE,
    resolution_notes TEXT,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES auth.users(id)
);

-- Create indexes for crash reports
CREATE INDEX idx_crash_reports_user_id ON crash_reports(user_id);
CREATE INDEX idx_crash_reports_timestamp ON crash_reports(timestamp DESC);
CREATE INDEX idx_crash_reports_resolved ON crash_reports(resolved);
CREATE INDEX idx_crash_reports_crash_type ON crash_reports(crash_type);

-- Create aggregated metrics table for performance tracking
CREATE TABLE IF NOT EXISTS app_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Time window
    hour_bucket TIMESTAMPTZ NOT NULL,
    
    -- Aggregated metrics
    total_logs INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    warn_count INTEGER DEFAULT 0,
    avg_memory_mb FLOAT,
    max_memory_mb FLOAT,
    avg_cpu_percent FLOAT,
    max_cpu_percent FLOAT,
    
    -- Pattern metrics
    patterns_detected INTEGER DEFAULT 0,
    patterns_executed INTEGER DEFAULT 0,
    automation_success_rate FLOAT,
    
    -- Feature usage
    features_used JSONB,
    
    UNIQUE(user_id, hour_bucket)
);

-- Create index for metrics queries
CREATE INDEX idx_app_metrics_user_hour ON app_metrics(user_id, hour_bucket DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE app_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE crash_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_metrics ENABLE ROW LEVEL SECURITY;

-- Users can only insert their own logs
CREATE POLICY "Users can insert own logs" ON app_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can view their own logs
CREATE POLICY "Users can view own logs" ON app_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Admin role for viewing all logs (you'll need to set up admin users)
CREATE POLICY "Admins can view all logs" ON app_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.uid() = id
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Similar policies for crash_reports
CREATE POLICY "Users can insert own crash reports" ON crash_reports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own crash reports" ON crash_reports
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all crash reports" ON crash_reports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.uid() = id
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Policies for metrics
CREATE POLICY "Users can view own metrics" ON app_metrics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert metrics" ON app_metrics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to clean old logs (keeps last 30 days)
CREATE OR REPLACE FUNCTION clean_old_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM app_logs 
    WHERE timestamp < NOW() - INTERVAL '30 days'
    AND log_level IN ('debug', 'info');
    
    -- Keep errors and warnings for 90 days
    DELETE FROM app_logs
    WHERE timestamp < NOW() - INTERVAL '90 days'
    AND log_level IN ('warn', 'error');
    
    -- Never auto-delete fatal logs or crash reports
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean logs (requires pg_cron extension)
-- Run this if you have pg_cron enabled:
-- SELECT cron.schedule('clean-old-logs', '0 2 * * *', 'SELECT clean_old_logs();');

-- Function to get log statistics
CREATE OR REPLACE FUNCTION get_log_stats(
    p_user_id UUID DEFAULT NULL,
    p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '24 hours',
    p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
    log_level TEXT,
    count BIGINT,
    percentage FLOAT
) AS $$
BEGIN
    RETURN QUERY
    WITH total_logs AS (
        SELECT COUNT(*) as total
        FROM app_logs
        WHERE (p_user_id IS NULL OR user_id = p_user_id)
        AND timestamp BETWEEN p_start_date AND p_end_date
    )
    SELECT 
        l.log_level,
        COUNT(*) as count,
        ROUND((COUNT(*) * 100.0 / NULLIF(t.total, 0))::numeric, 2)::float as percentage
    FROM app_logs l
    CROSS JOIN total_logs t
    WHERE (p_user_id IS NULL OR l.user_id = p_user_id)
    AND l.timestamp BETWEEN p_start_date AND p_end_date
    GROUP BY l.log_level, t.total
    ORDER BY 
        CASE l.log_level
            WHEN 'fatal' THEN 1
            WHEN 'error' THEN 2
            WHEN 'warn' THEN 3
            WHEN 'info' THEN 4
            WHEN 'debug' THEN 5
        END;
END;
$$ LANGUAGE plpgsql;

-- Add comment for documentation
COMMENT ON TABLE app_logs IS 'Stores all logs from WorkspaceOS alpha testers';
COMMENT ON TABLE crash_reports IS 'Stores crash reports with full stack traces';
COMMENT ON TABLE app_metrics IS 'Aggregated performance metrics per user per hour';
COMMENT ON FUNCTION get_log_stats IS 'Returns log level statistics for a given time period';
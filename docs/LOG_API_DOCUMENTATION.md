# WorkspaceOS Log Collection API Documentation

## Overview
This document describes how the WorkspaceOS desktop application should send logs to the Supabase backend for alpha testing telemetry.

## Authentication

First, authenticate the user and obtain a session token:

```rust
// Example in Rust
use reqwest;
use serde_json::json;

const SUPABASE_URL: &str = "https://vdopqkfhoxmzyoofjhnm.supabase.co";
const SUPABASE_ANON_KEY: &str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

// Sign in user
async fn authenticate(email: &str, password: &str) -> Result<String, Error> {
    let client = reqwest::Client::new();
    let response = client
        .post(&format!("{}/auth/v1/token?grant_type=password", SUPABASE_URL))
        .header("apikey", SUPABASE_ANON_KEY)
        .header("Content-Type", "application/json")
        .json(&json!({
            "email": email,
            "password": password
        }))
        .send()
        .await?;
    
    let data: serde_json::Value = response.json().await?;
    Ok(data["access_token"].as_str().unwrap().to_string())
}
```

## Sending Logs

### Single Log Entry

Send individual log entries as they occur:

```rust
#[derive(Serialize)]
struct LogEntry {
    user_id: String,           // User's UUID from auth
    user_email: String,
    session_id: String,        // Unique session identifier
    log_level: String,         // "debug" | "info" | "warn" | "error" | "fatal"
    timestamp: String,         // ISO 8601 format
    message: String,
    context: Option<Value>,    // JSON object with additional context
    app_version: String,       // e.g., "0.5.7"
    os_name: String,          // e.g., "macOS"
    os_version: String,       // e.g., "14.0"
    device_id: String,        // Unique device identifier
    memory_usage: Option<i64>, // In bytes
    cpu_usage: Option<f32>,   // Percentage (0-100)
    error_stack: Option<String>,
    error_code: Option<String>,
    module: Option<String>,   // "capture" | "analyze" | "act" | "p2p" | etc.
    action: Option<String>,   // What action was being performed
}

async fn send_log(token: &str, log: LogEntry) -> Result<(), Error> {
    let client = reqwest::Client::new();
    client
        .post(&format!("{}/rest/v1/app_logs", SUPABASE_URL))
        .header("apikey", SUPABASE_ANON_KEY)
        .header("Authorization", format!("Bearer {}", token))
        .header("Content-Type", "application/json")
        .json(&log)
        .send()
        .await?;
    Ok(())
}
```

### Batch Logs

For better performance, batch multiple logs together:

```rust
async fn send_logs_batch(token: &str, logs: Vec<LogEntry>) -> Result<(), Error> {
    let client = reqwest::Client::new();
    client
        .post(&format!("{}/rest/v1/app_logs", SUPABASE_URL))
        .header("apikey", SUPABASE_ANON_KEY)
        .header("Authorization", format!("Bearer {}", token))
        .header("Content-Type", "application/json")
        .header("Prefer", "return=minimal") // Don't return inserted rows
        .json(&logs)
        .send()
        .await?;
    Ok(())
}
```

### Crash Reports

Send crash reports to a separate table for critical errors:

```rust
#[derive(Serialize)]
struct CrashReport {
    user_id: String,
    user_email: String,
    crash_id: String,         // Unique crash identifier
    timestamp: String,
    crash_type: String,       // e.g., "panic", "segfault", "out_of_memory"
    crash_message: String,
    stack_trace: String,      // Full stack trace
    system_info: Value,       // JSON with system state
    app_state: Value,         // JSON with app state at crash
    app_version: String,
    os_name: String,
    os_version: String,
    device_id: String,
}

async fn send_crash_report(token: &str, report: CrashReport) -> Result<(), Error> {
    let client = reqwest::Client::new();
    client
        .post(&format!("{}/rest/v1/crash_reports", SUPABASE_URL))
        .header("apikey", SUPABASE_ANON_KEY)
        .header("Authorization", format!("Bearer {}", token))
        .header("Content-Type", "application/json")
        .json(&report)
        .send()
        .await?;
    Ok(())
}
```

## Implementation in WorkspaceOS

### 1. Add to Cargo.toml
```toml
[dependencies]
reqwest = { version = "0.11", features = ["json"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
uuid = { version = "1.0", features = ["v4"] }
```

### 2. Create Telemetry Module

Create `src/telemetry.rs`:

```rust
use anyhow::Result;
use serde::Serialize;
use std::sync::Arc;
use tokio::sync::Mutex;
use tokio::time::{interval, Duration};

pub struct TelemetryClient {
    token: Arc<Mutex<String>>,
    session_id: String,
    device_id: String,
    batch: Arc<Mutex<Vec<LogEntry>>>,
    batch_size: usize,
    flush_interval: Duration,
}

impl TelemetryClient {
    pub fn new(token: String) -> Self {
        let session_id = uuid::Uuid::new_v4().to_string();
        let device_id = get_device_id(); // Implement device ID generation
        
        let client = Self {
            token: Arc::new(Mutex::new(token)),
            session_id,
            device_id,
            batch: Arc::new(Mutex::new(Vec::new())),
            batch_size: 50,
            flush_interval: Duration::from_secs(30),
        };
        
        // Start background flush task
        client.start_flush_task();
        client
    }
    
    pub async fn log(&self, level: LogLevel, message: String, module: Option<String>) {
        let entry = LogEntry {
            session_id: self.session_id.clone(),
            log_level: level.to_string(),
            timestamp: chrono::Utc::now().to_rfc3339(),
            message,
            module,
            app_version: env!("CARGO_PKG_VERSION").to_string(),
            os_name: std::env::consts::OS.to_string(),
            os_version: get_os_version(),
            device_id: self.device_id.clone(),
            memory_usage: Some(get_memory_usage()),
            cpu_usage: Some(get_cpu_usage()),
            // ... other fields
        };
        
        let mut batch = self.batch.lock().await;
        batch.push(entry);
        
        // Flush if batch is full
        if batch.len() >= self.batch_size {
            self.flush().await;
        }
    }
    
    async fn flush(&self) {
        let mut batch = self.batch.lock().await;
        if batch.is_empty() {
            return;
        }
        
        let logs = batch.drain(..).collect::<Vec<_>>();
        let token = self.token.lock().await;
        
        // Send logs in background
        let token_clone = token.clone();
        tokio::spawn(async move {
            if let Err(e) = send_logs_batch(&token_clone, logs).await {
                eprintln!("Failed to send telemetry: {}", e);
            }
        });
    }
    
    fn start_flush_task(&self) {
        let batch = self.batch.clone();
        let token = self.token.clone();
        
        tokio::spawn(async move {
            let mut interval = interval(Duration::from_secs(30));
            loop {
                interval.tick().await;
                // Flush any pending logs
                // Implementation here
            }
        });
    }
}

#[derive(Debug, Clone)]
pub enum LogLevel {
    Debug,
    Info,
    Warn,
    Error,
    Fatal,
}
```

### 3. Integration Points

Add telemetry calls at key points in your application:

```rust
// In main.rs
let telemetry = TelemetryClient::new(auth_token);

// Log startup
telemetry.log(
    LogLevel::Info,
    "WorkspaceOS started".to_string(),
    Some("main".to_string())
).await;

// In capture module
telemetry.log(
    LogLevel::Debug,
    format!("Captured screen with {} patterns detected", pattern_count),
    Some("capture".to_string())
).await;

// In error handlers
telemetry.log(
    LogLevel::Error,
    format!("Failed to execute pattern: {}", error),
    Some("act".to_string())
).await;

// On crash
std::panic::set_hook(Box::new(move |panic_info| {
    // Send crash report
    let crash_report = CrashReport {
        crash_type: "panic".to_string(),
        crash_message: panic_info.to_string(),
        stack_trace: std::backtrace::Backtrace::capture().to_string(),
        // ... other fields
    };
    // Send crash report synchronously before exit
}));
```

## Best Practices

1. **Batch logs** - Don't send every log immediately. Batch them and send every 30 seconds or when batch size reaches 50.

2. **Use appropriate log levels**:
   - `debug`: Detailed information for debugging
   - `info`: General informational messages
   - `warn`: Warning messages that don't prevent operation
   - `error`: Errors that affect functionality
   - `fatal`: Critical errors that cause crashes

3. **Include context** - Always include relevant context like module, action, and any relevant IDs.

4. **Handle failures gracefully** - If telemetry fails, don't crash the app. Log to local file as fallback.

5. **Respect privacy** - Don't log sensitive information like passwords, personal data, or file contents.

6. **Rate limiting** - Implement client-side rate limiting to avoid overwhelming the server.

## Rate Limits

- Maximum 1000 logs per minute per user
- Maximum batch size: 100 logs
- Maximum log message size: 10KB
- Maximum context JSON size: 50KB

## Error Handling

If you receive these HTTP status codes:
- `401`: Authentication token expired - re-authenticate
- `429`: Rate limit exceeded - implement exponential backoff
- `413`: Payload too large - reduce batch size
- `500`: Server error - retry with exponential backoff

## Privacy Considerations

1. **User Consent** - Always get user consent before sending telemetry
2. **Opt-out** - Provide easy way to disable telemetry
3. **Data Minimization** - Only send necessary data
4. **Anonymization** - Hash or remove personally identifiable information
5. **Local Storage** - Store logs locally if user opts out of telemetry

## Testing

Test telemetry integration:

```bash
# Send test log
curl -X POST https://vdopqkfhoxmzyoofjhnm.supabase.co/rest/v1/app_logs \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user-id",
    "session_id": "test-session",
    "log_level": "info",
    "message": "Test log from WorkspaceOS",
    "app_version": "0.5.7",
    "os_name": "macOS",
    "module": "test"
  }'
```

## Dashboard Access

Alpha testers and admins can view logs at:
https://tryworkspaceos.com/logs.html

## Support

For issues with telemetry integration, contact:
- Email: telemetry@workspaceos.com
- GitHub Issues: https://github.com/workspaceos/core/issues
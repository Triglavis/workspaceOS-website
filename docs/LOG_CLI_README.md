# WorkspaceOS Log CLI Tools

Secure command-line tools for fetching alpha tester logs from Supabase without exposing a web dashboard.

## Why CLI Instead of Web Dashboard?

- **Security**: No public-facing dashboard that could be compromised
- **Integration**: Works directly in your terminal or with Claude Code
- **Efficiency**: Faster to query and filter logs programmatically
- **Privacy**: Logs stay in your terminal, not in browser history

## Available Tools

### 1. Node.js Version (`scripts/fetch-logs.js`)
Simple and fast, works with just Node.js installed.

### 2. Python Version (`scripts/fetch_logs.py`)
More features, better formatting, and statistical analysis.

## Installation

### For Node.js version:
```bash
# No installation needed, just Node.js
node scripts/fetch-logs.js --help
```

### For Python version:
```bash
# Install dependencies
pip install requests python-dateutil

# Make executable (already done)
chmod +x scripts/fetch_logs.py

# Run directly
./scripts/fetch_logs.py --help
```

## Quick Start

### View Recent Logs
```bash
# Node.js
node scripts/fetch-logs.js -e admin@workspaceos.com -p yourpassword

# Python (will prompt for password)
./scripts/fetch_logs.py -e admin@workspaceos.com
```

### Filter by Log Level
```bash
# Only show errors and fatals
./scripts/fetch_logs.py -e admin@workspaceos.com -l error

# Show warnings from last 48 hours
./scripts/fetch_logs.py -e admin@workspaceos.com -l warn -H 48
```

### Search Logs
```bash
# Search for pattern detection logs
./scripts/fetch_logs.py -e admin@workspaceos.com -s "pattern detection"

# Search for specific module
./scripts/fetch_logs.py -e admin@workspaceos.com -m capture
```

### Follow Logs in Real-Time (Tail Mode)
```bash
# Follow all logs
./scripts/fetch_logs.py -e admin@workspaceos.com --tail

# Follow only errors
./scripts/fetch_logs.py -e admin@workspaceos.com --tail -l error
```

### View Statistics
```bash
# Show log statistics for last 24 hours
./scripts/fetch_logs.py -e admin@workspaceos.com --stats

# Stats for last week
./scripts/fetch_logs.py -e admin@workspaceos.com --stats -H 168
```

### Export Logs
```bash
# Export to JSON
./scripts/fetch_logs.py -e admin@workspaceos.com --export logs.json

# Export with filters
./scripts/fetch_logs.py -e admin@workspaceos.com -l error -H 72 --export errors.json
```

## Using with Claude Code

When working with Claude Code, you can pipe logs directly:

```bash
# Get recent errors for analysis
./scripts/fetch_logs.py -e admin@workspaceos.com -l error --json | head -50

# Search for specific issues
./scripts/fetch_logs.py -e admin@workspaceos.com -s "memory" --limit 200

# Get statistics summary
./scripts/fetch_logs.py -e admin@workspaceos.com --stats
```

## Security Best Practices

1. **Never commit credentials** - Use environment variables:
   ```bash
   export SUPABASE_EMAIL="admin@workspaceos.com"
   export SUPABASE_PASSWORD="yourpassword"
   ./scripts/fetch_logs.py -e $SUPABASE_EMAIL -p $SUPABASE_PASSWORD
   ```

2. **Use password prompt** - Don't pass password as argument:
   ```bash
   ./scripts/fetch_logs.py -e admin@workspaceos.com  # Will prompt for password
   ```

3. **Limit access** - Only share credentials with trusted team members

4. **Rotate passwords** - Change Supabase password regularly

## Advanced Usage

### Filter by Multiple Criteria
```bash
# Errors from capture module in last 12 hours
./scripts/fetch_logs.py -e admin@workspaceos.com -l error -m capture -H 12

# Search for user-specific logs (admin only)
./scripts/fetch_logs.py -e admin@workspaceos.com -u user@example.com
```

### Combine with Unix Tools
```bash
# Count errors by module
./scripts/fetch_logs.py -e admin@workspaceos.com -l error --json | \
  jq -r '.[] | .module' | sort | uniq -c | sort -rn

# Get unique error messages
./scripts/fetch_logs.py -e admin@workspaceos.com -l error --json | \
  jq -r '.[] | .message' | sort -u

# Monitor error rate
watch -n 60 './scripts/fetch_logs.py -e admin@workspaceos.com --stats | grep "Error Rate"'
```

### Create Aliases
Add to your `.bashrc` or `.zshrc`:

```bash
alias wslogs='./scripts/fetch_logs.py -e admin@workspaceos.com'
alias wserrors='./scripts/fetch_logs.py -e admin@workspaceos.com -l error'
alias wstail='./scripts/fetch_logs.py -e admin@workspaceos.com --tail'
alias wsstats='./scripts/fetch_logs.py -e admin@workspaceos.com --stats'
```

## Output Formats

### Standard Output (Colored)
```
ERROR [2025-01-17 14:23:45] [capture   ] [alice   ] Failed to capture screen
WARN  [2025-01-17 14:23:40] [analyze   ] [bob     ] Pattern confidence below threshold
INFO  [2025-01-17 14:23:35] [act       ] [charlie ] Command executed successfully
```

### JSON Output
```bash
./scripts/fetch_logs.py -e admin@workspaceos.com --json
```

### No Color (for piping)
```bash
./scripts/fetch_logs.py -e admin@workspaceos.com --no-color | grep ERROR
```

## Troubleshooting

### Authentication Failed
- Check email and password are correct
- Ensure your account exists in Supabase
- Verify you have the correct permissions

### No Logs Found
- Check time range with `-H` flag
- Remove filters to see all logs
- Verify logs are being sent from WorkspaceOS

### Connection Errors
- Check internet connection
- Verify Supabase service is up
- Try again after a few seconds

## Setting Up Admin Access

To view all users' logs (not just your own), you need admin role:

1. Sign in to Supabase Dashboard
2. Go to Authentication → Users
3. Find your user account
4. Edit user metadata
5. Add to `raw_user_meta_data`:
   ```json
   {
     "role": "admin"
   }
   ```

## Support

For issues or questions:
- Email: support@workspaceos.com
- Check Supabase logs: Authentication → Logs
- Verify table exists: Database → Tables → app_logs

---

Remember: These CLI tools provide the same functionality as a web dashboard but with better security and integration with your development workflow.

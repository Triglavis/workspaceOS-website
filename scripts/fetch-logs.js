#!/usr/bin/env node

/**
 * WorkspaceOS Log Fetcher CLI
 * 
 * A secure CLI tool for fetching alpha tester logs from Supabase
 * Use this with Claude Code or any terminal to view logs without a web dashboard
 * 
 * Usage:
 *   node scripts/fetch-logs.js --email your@email.com --password yourpassword
 *   node scripts/fetch-logs.js --email your@email.com --password yourpassword --level error
 *   node scripts/fetch-logs.js --email your@email.com --password yourpassword --search "pattern detection"
 *   node scripts/fetch-logs.js --email your@email.com --password yourpassword --export logs.json
 */

const https = require('https');
const fs = require('fs');
const readline = require('readline');

// Supabase configuration
const SUPABASE_URL = 'https://vdopqkfhoxmzyoofjhnm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkb3Bxa2Zob3htenlvb2ZqaG5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NzQwMjAsImV4cCI6MjA3MTA1MDAyMH0.OVNaThLvkvlxE_N-pN_x58zNV2fOLHstiOXCBqFvxj0';

// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        email: null,
        password: null,
        level: null,
        module: null,
        search: null,
        limit: 100,
        hours: 24,
        export: null,
        follow: false,
        user: null, // For admin to filter by user
        stats: false
    };
    
    for (let i = 0; i < args.length; i++) {
        switch(args[i]) {
            case '--email':
            case '-e':
                options.email = args[++i];
                break;
            case '--password':
            case '-p':
                options.password = args[++i];
                break;
            case '--level':
            case '-l':
                options.level = args[++i];
                break;
            case '--module':
            case '-m':
                options.module = args[++i];
                break;
            case '--search':
            case '-s':
                options.search = args[++i];
                break;
            case '--limit':
            case '-n':
                options.limit = parseInt(args[++i]);
                break;
            case '--hours':
            case '-h':
                options.hours = parseInt(args[++i]);
                break;
            case '--export':
                options.export = args[++i];
                break;
            case '--follow':
            case '-f':
                options.follow = true;
                break;
            case '--user':
            case '-u':
                options.user = args[++i];
                break;
            case '--stats':
                options.stats = true;
                break;
            case '--help':
                showHelp();
                process.exit(0);
        }
    }
    
    return options;
}

// Show help message
function showHelp() {
    console.log(`
WorkspaceOS Log Fetcher CLI

Usage:
  node scripts/fetch-logs.js --email <email> --password <password> [options]

Options:
  -e, --email <email>      Your Supabase account email (required)
  -p, --password <pass>    Your Supabase account password (required)
  -l, --level <level>      Filter by log level (debug|info|warn|error|fatal)
  -m, --module <module>    Filter by module (capture|analyze|act|p2p|patterns)
  -s, --search <term>      Search logs for specific term
  -n, --limit <number>     Number of logs to fetch (default: 100)
  -h, --hours <hours>      Logs from last N hours (default: 24)
  -u, --user <email>       Filter by user email (admin only)
  -f, --follow             Follow mode - show new logs as they arrive
  --export <file>          Export logs to JSON file
  --stats                  Show statistics instead of logs
  --help                   Show this help message

Examples:
  # View last 100 logs
  node scripts/fetch-logs.js -e admin@workspaceos.com -p password123

  # View only errors from last 48 hours
  node scripts/fetch-logs.js -e admin@workspaceos.com -p password123 -l error -h 48

  # Search for pattern detection logs
  node scripts/fetch-logs.js -e admin@workspaceos.com -p password123 -s "pattern detection"

  # Follow logs in real-time
  node scripts/fetch-logs.js -e admin@workspaceos.com -p password123 -f

  # Export logs to file
  node scripts/fetch-logs.js -e admin@workspaceos.com -p password123 --export logs.json

  # View statistics
  node scripts/fetch-logs.js -e admin@workspaceos.com -p password123 --stats
`);
}

// Make HTTPS request to Supabase
function supabaseRequest(path, method = 'GET', body = null, token = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(SUPABASE_URL + path);
        const options = {
            hostname: url.hostname,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Content-Type': 'application/json'
            }
        };
        
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }
        
        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(parsed);
                    } else {
                        reject(new Error(parsed.message || `HTTP ${res.statusCode}`));
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });
        
        req.on('error', reject);
        
        if (body) {
            req.write(JSON.stringify(body));
        }
        
        req.end();
    });
}

// Authenticate with Supabase
async function authenticate(email, password) {
    try {
        const response = await supabaseRequest(
            '/auth/v1/token?grant_type=password',
            'POST',
            { email, password }
        );
        return response.access_token;
    } catch (error) {
        throw new Error(`Authentication failed: ${error.message}`);
    }
}

// Fetch logs from Supabase
async function fetchLogs(token, options) {
    const params = new URLSearchParams();
    
    // Time filter
    const since = new Date(Date.now() - options.hours * 60 * 60 * 1000).toISOString();
    params.append('timestamp', `gte.${since}`);
    
    // Log level filter
    if (options.level) {
        params.append('log_level', `eq.${options.level}`);
    }
    
    // Module filter
    if (options.module) {
        params.append('module', `eq.${options.module}`);
    }
    
    // User filter (admin only)
    if (options.user) {
        params.append('user_email', `eq.${options.user}`);
    }
    
    // Search filter
    if (options.search) {
        params.append('message', `ilike.%${options.search}%`);
    }
    
    // Order and limit
    params.append('order', 'timestamp.desc');
    params.append('limit', options.limit);
    
    // Add select to get count
    params.append('select', '*');
    
    const path = `/rest/v1/app_logs?${params.toString()}`;
    
    try {
        const logs = await supabaseRequest(path, 'GET', null, token);
        return logs;
    } catch (error) {
        throw new Error(`Failed to fetch logs: ${error.message}`);
    }
}

// Fetch statistics
async function fetchStats(token, options) {
    const since = new Date(Date.now() - options.hours * 60 * 60 * 1000).toISOString();
    
    // Get total count
    const countPath = `/rest/v1/app_logs?timestamp=gte.${since}&select=count`;
    const countResponse = await supabaseRequest(countPath, 'GET', null, token);
    const totalCount = countResponse[0]?.count || 0;
    
    // Get counts by level
    const levels = ['debug', 'info', 'warn', 'error', 'fatal'];
    const levelCounts = {};
    
    for (const level of levels) {
        const path = `/rest/v1/app_logs?timestamp=gte.${since}&log_level=eq.${level}&select=count`;
        const response = await supabaseRequest(path, 'GET', null, token);
        levelCounts[level] = response[0]?.count || 0;
    }
    
    // Get unique users
    const usersPath = `/rest/v1/app_logs?timestamp=gte.${since}&select=user_email`;
    const usersResponse = await supabaseRequest(usersPath, 'GET', null, token);
    const uniqueUsers = new Set(usersResponse.map(log => log.user_email)).size;
    
    // Get crash reports count
    const crashPath = `/rest/v1/crash_reports?timestamp=gte.${since}&resolved=eq.false&select=count`;
    const crashResponse = await supabaseRequest(crashPath, 'GET', null, token);
    const crashCount = crashResponse[0]?.count || 0;
    
    return {
        totalLogs: totalCount,
        levelCounts,
        uniqueUsers,
        unresolvedCrashes: crashCount,
        timeRange: options.hours
    };
}

// Format log for display
function formatLog(log) {
    const time = new Date(log.timestamp).toLocaleString();
    const level = log.log_level.toUpperCase().padEnd(5);
    const levelColors = {
        'DEBUG': '\x1b[90m',  // Gray
        'INFO ': '\x1b[36m',   // Cyan
        'WARN ': '\x1b[33m',   // Yellow
        'ERROR': '\x1b[31m',   // Red
        'FATAL': '\x1b[35m'    // Magenta
    };
    const color = levelColors[level] || '\x1b[0m';
    const reset = '\x1b[0m';
    
    const module = (log.module || 'system').padEnd(10);
    const user = log.user_email ? log.user_email.split('@')[0].padEnd(8) : 'unknown ';
    
    return `${color}${level}${reset} [${time}] [${module}] [${user}] ${log.message}`;
}

// Display statistics
function displayStats(stats) {
    console.log('\n📊 WorkspaceOS Log Statistics');
    console.log('═══════════════════════════════════════════');
    console.log(`Time Range:          Last ${stats.timeRange} hours`);
    console.log(`Total Logs:          ${stats.totalLogs}`);
    console.log(`Unique Users:        ${stats.uniqueUsers}`);
    console.log(`Unresolved Crashes:  ${stats.unresolvedCrashes}`);
    console.log('\nLog Levels:');
    console.log(`  Debug:             ${stats.levelCounts.debug}`);
    console.log(`  Info:              ${stats.levelCounts.info}`);
    console.log(`  Warn:              ${stats.levelCounts.warn}`);
    console.log(`  Error:             ${stats.levelCounts.error}`);
    console.log(`  Fatal:             ${stats.levelCounts.fatal}`);
    console.log('═══════════════════════════════════════════\n');
}

// Follow mode - show new logs as they arrive
async function followLogs(token, options) {
    let lastTimestamp = new Date().toISOString();
    
    console.log('📡 Following logs (Ctrl+C to stop)...\n');
    
    const checkNewLogs = async () => {
        const params = new URLSearchParams();
        params.append('timestamp', `gt.${lastTimestamp}`);
        params.append('order', 'timestamp.asc');
        params.append('limit', '10');
        
        if (options.level) {
            params.append('log_level', `eq.${options.level}`);
        }
        if (options.module) {
            params.append('module', `eq.${options.module}`);
        }
        if (options.user) {
            params.append('user_email', `eq.${options.user}`);
        }
        
        const path = `/rest/v1/app_logs?${params.toString()}`;
        
        try {
            const logs = await supabaseRequest(path, 'GET', null, token);
            if (logs.length > 0) {
                logs.forEach(log => {
                    console.log(formatLog(log));
                    lastTimestamp = log.timestamp;
                });
            }
        } catch (error) {
            console.error(`Error fetching new logs: ${error.message}`);
        }
    };
    
    // Check for new logs every 2 seconds
    setInterval(checkNewLogs, 2000);
    
    // Keep process running
    process.stdin.resume();
}

// Main function
async function main() {
    const options = parseArgs();
    
    // Check required arguments
    if (!options.email || !options.password) {
        console.error('Error: Email and password are required');
        console.log('Use --help for usage information');
        process.exit(1);
    }
    
    try {
        // Authenticate
        process.stdout.write('🔐 Authenticating...');
        const token = await authenticate(options.email, options.password);
        console.log(' ✓\n');
        
        // Show statistics
        if (options.stats) {
            const stats = await fetchStats(token, options);
            displayStats(stats);
            return;
        }
        
        // Follow mode
        if (options.follow) {
            await followLogs(token, options);
            return;
        }
        
        // Fetch logs
        process.stdout.write('📥 Fetching logs...');
        const logs = await fetchLogs(token, options);
        console.log(` ✓ (${logs.length} logs)\n`);
        
        // Export if requested
        if (options.export) {
            fs.writeFileSync(options.export, JSON.stringify(logs, null, 2));
            console.log(`✅ Exported ${logs.length} logs to ${options.export}`);
            return;
        }
        
        // Display logs
        if (logs.length === 0) {
            console.log('No logs found matching your criteria');
        } else {
            console.log('═══════════════════════════════════════════════════════════════════\n');
            logs.reverse().forEach(log => {
                console.log(formatLog(log));
            });
            console.log('\n═══════════════════════════════════════════════════════════════════');
            console.log(`Displayed ${logs.length} logs from the last ${options.hours} hours`);
        }
        
    } catch (error) {
        console.error(`\n❌ ${error.message}`);
        process.exit(1);
    }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
    console.log('\n\n👋 Stopped following logs');
    process.exit(0);
});

// Run the CLI
if (require.main === module) {
    main();
}

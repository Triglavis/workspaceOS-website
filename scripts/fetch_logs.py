#!/usr/bin/env python3

"""
WorkspaceOS Log Fetcher CLI (Python Version)

A secure CLI tool for fetching alpha tester logs from Supabase.
Use this with Claude Code or any terminal to view logs without a web dashboard.

Usage:
    python scripts/fetch_logs.py --email your@email.com --password yourpassword
    python scripts/fetch_logs.py -e your@email.com -p yourpassword --level error --tail
    python scripts/fetch_logs.py -e your@email.com -p yourpassword --search "pattern" --json
    
Requirements:
    pip install requests python-dateutil
"""

import json
import sys
import argparse
import getpass
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import time

try:
    import requests
except ImportError:
    print("Error: requests library not found. Install with: pip install requests")
    sys.exit(1)

try:
    from dateutil import parser as date_parser
except ImportError:
    print("Error: python-dateutil not found. Install with: pip install python-dateutil")
    sys.exit(1)

# Supabase configuration
SUPABASE_URL = "https://vdopqkfhoxmzyoofjhnm.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkb3Bxa2Zob3htenlvb2ZqaG5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NzQwMjAsImV4cCI6MjA3MTA1MDAyMH0.OVNaThLvkvlxE_N-pN_x58zNV2fOLHstiOXCBqFvxj0"

# ANSI color codes
COLORS = {
    'DEBUG': '\033[90m',    # Gray
    'INFO': '\033[36m',     # Cyan
    'WARN': '\033[33m',     # Yellow
    'ERROR': '\033[31m',    # Red
    'FATAL': '\033[35m',    # Magenta
    'RESET': '\033[0m',
    'BOLD': '\033[1m',
    'DIM': '\033[2m'
}


class LogFetcher:
    """Main class for fetching and displaying logs from Supabase"""
    
    def __init__(self, email: str, password: str):
        self.email = email
        self.password = password
        self.token = None
        self.session = requests.Session()
        self.session.headers.update({'apikey': SUPABASE_ANON_KEY})
    
    def authenticate(self) -> bool:
        """Authenticate with Supabase and get access token"""
        try:
            response = self.session.post(
                f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
                json={"email": self.email, "password": self.password}
            )
            response.raise_for_status()
            data = response.json()
            self.token = data['access_token']
            self.session.headers.update({'Authorization': f'Bearer {self.token}'})
            return True
        except requests.exceptions.RequestException as e:
            print(f"❌ Authentication failed: {e}")
            return False
    
    def fetch_logs(self, 
                   hours: int = 24,
                   level: Optional[str] = None,
                   module: Optional[str] = None,
                   search: Optional[str] = None,
                   user: Optional[str] = None,
                   limit: int = 100) -> List[Dict[str, Any]]:
        """Fetch logs from Supabase with filters"""
        
        # Build query parameters
        since = (datetime.now() - timedelta(hours=hours)).isoformat()
        params = {
            'timestamp': f'gte.{since}',
            'order': 'timestamp.desc',
            'limit': limit
        }
        
        if level:
            params['log_level'] = f'eq.{level}'
        if module:
            params['module'] = f'eq.{module}'
        if user:
            params['user_email'] = f'eq.{user}'
        if search:
            params['message'] = f'ilike.%{search}%'
        
        try:
            response = self.session.get(
                f"{SUPABASE_URL}/rest/v1/app_logs",
                params=params
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"❌ Failed to fetch logs: {e}")
            return []
    
    def fetch_stats(self, hours: int = 24) -> Dict[str, Any]:
        """Fetch log statistics"""
        since = (datetime.now() - timedelta(hours=hours)).isoformat()
        stats = {
            'time_range': hours,
            'total_logs': 0,
            'level_counts': {},
            'unique_users': 0,
            'unresolved_crashes': 0,
            'top_modules': {},
            'error_rate': 0
        }
        
        # Get total count
        try:
            response = self.session.get(
                f"{SUPABASE_URL}/rest/v1/app_logs",
                params={'timestamp': f'gte.{since}', 'select': 'count'},
                headers={'Prefer': 'count=exact'}
            )
            stats['total_logs'] = int(response.headers.get('content-range', '0-0/0').split('/')[1])
        except:
            pass
        
        # Get counts by level
        for level in ['debug', 'info', 'warn', 'error', 'fatal']:
            try:
                response = self.session.get(
                    f"{SUPABASE_URL}/rest/v1/app_logs",
                    params={'timestamp': f'gte.{since}', 'log_level': f'eq.{level}', 'select': 'count'},
                    headers={'Prefer': 'count=exact'}
                )
                count = int(response.headers.get('content-range', '0-0/0').split('/')[1])
                stats['level_counts'][level] = count
            except:
                stats['level_counts'][level] = 0
        
        # Calculate error rate
        if stats['total_logs'] > 0:
            error_count = stats['level_counts'].get('error', 0) + stats['level_counts'].get('fatal', 0)
            stats['error_rate'] = (error_count / stats['total_logs']) * 100
        
        # Get unique users
        try:
            response = self.session.get(
                f"{SUPABASE_URL}/rest/v1/app_logs",
                params={'timestamp': f'gte.{since}', 'select': 'user_email', 'limit': 1000}
            )
            users = set(log['user_email'] for log in response.json() if log.get('user_email'))
            stats['unique_users'] = len(users)
        except:
            pass
        
        # Get crash reports
        try:
            response = self.session.get(
                f"{SUPABASE_URL}/rest/v1/crash_reports",
                params={'timestamp': f'gte.{since}', 'resolved': 'eq.false', 'select': 'count'},
                headers={'Prefer': 'count=exact'}
            )
            stats['unresolved_crashes'] = int(response.headers.get('content-range', '0-0/0').split('/')[1])
        except:
            pass
        
        return stats
    
    def tail_logs(self, 
                  level: Optional[str] = None,
                  module: Optional[str] = None,
                  user: Optional[str] = None):
        """Follow logs in real-time (tail mode)"""
        last_timestamp = datetime.now().isoformat()
        print("📡 Following logs (Ctrl+C to stop)...\n")
        
        while True:
            try:
                params = {
                    'timestamp': f'gt.{last_timestamp}',
                    'order': 'timestamp.asc',
                    'limit': 10
                }
                
                if level:
                    params['log_level'] = f'eq.{level}'
                if module:
                    params['module'] = f'eq.{module}'
                if user:
                    params['user_email'] = f'eq.{user}'
                
                response = self.session.get(
                    f"{SUPABASE_URL}/rest/v1/app_logs",
                    params=params
                )
                response.raise_for_status()
                logs = response.json()
                
                for log in logs:
                    self.print_log(log)
                    last_timestamp = log['timestamp']
                
                time.sleep(2)  # Check every 2 seconds
                
            except KeyboardInterrupt:
                print("\n\n👋 Stopped tailing logs")
                break
            except Exception as e:
                print(f"Error: {e}")
                time.sleep(5)  # Wait longer on error
    
    @staticmethod
    def print_log(log: Dict[str, Any], use_color: bool = True):
        """Format and print a single log entry"""
        timestamp = date_parser.parse(log['timestamp']).strftime('%Y-%m-%d %H:%M:%S')
        level = log['log_level'].upper()
        module = (log.get('module') or 'system')[:10].ljust(10)
        user = (log.get('user_email', '').split('@')[0] or 'unknown')[:8].ljust(8)
        message = log['message']
        
        if use_color and sys.stdout.isatty():
            color = COLORS.get(level, COLORS['RESET'])
            reset = COLORS['RESET']
            dim = COLORS['DIM']
            print(f"{color}{level:5}{reset} {dim}[{timestamp}]{reset} [{module}] [{user}] {message}")
        else:
            print(f"{level:5} [{timestamp}] [{module}] [{user}] {message}")
    
    @staticmethod
    def print_stats(stats: Dict[str, Any]):
        """Display statistics in a formatted table"""
        print("\n" + "="*60)
        print(f"{COLORS['BOLD']}📊 WorkspaceOS Log Statistics{COLORS['RESET']}")
        print("="*60)
        print(f"Time Range:          Last {stats['time_range']} hours")
        print(f"Total Logs:          {stats['total_logs']:,}")
        print(f"Unique Users:        {stats['unique_users']}")
        print(f"Error Rate:          {stats['error_rate']:.1f}%")
        print(f"Unresolved Crashes:  {stats['unresolved_crashes']}")
        print("\nLog Levels:")
        
        # Create a simple bar chart
        max_count = max(stats['level_counts'].values()) if stats['level_counts'] else 1
        for level, count in stats['level_counts'].items():
            bar_width = int((count / max_count) * 30) if max_count > 0 else 0
            bar = '█' * bar_width
            color = COLORS.get(level.upper(), COLORS['RESET'])
            print(f"  {color}{level:5}{COLORS['RESET']}: {bar} {count:,}")
        
        print("="*60 + "\n")


def main():
    """Main CLI entry point"""
    parser = argparse.ArgumentParser(
        description='WorkspaceOS Log Fetcher - Secure CLI for viewing alpha tester logs'
    )
    
    # Authentication
    parser.add_argument('-e', '--email', required=True, help='Supabase account email')
    parser.add_argument('-p', '--password', help='Supabase account password (will prompt if not provided)')
    
    # Filters
    parser.add_argument('-l', '--level', choices=['debug', 'info', 'warn', 'error', 'fatal'],
                       help='Filter by log level')
    parser.add_argument('-m', '--module', help='Filter by module')
    parser.add_argument('-s', '--search', help='Search logs for term')
    parser.add_argument('-u', '--user', help='Filter by user email (admin only)')
    parser.add_argument('-n', '--limit', type=int, default=100, help='Number of logs to fetch')
    parser.add_argument('-H', '--hours', type=int, default=24, help='Logs from last N hours')
    
    # Output options
    parser.add_argument('--json', action='store_true', help='Output as JSON')
    parser.add_argument('--export', help='Export logs to file')
    parser.add_argument('--no-color', action='store_true', help='Disable colored output')
    
    # Modes
    parser.add_argument('--tail', '-t', action='store_true', help='Follow logs in real-time')
    parser.add_argument('--stats', action='store_true', help='Show statistics instead of logs')
    
    args = parser.parse_args()
    
    # Get password if not provided
    if not args.password:
        args.password = getpass.getpass('Password: ')
    
    # Create fetcher and authenticate
    fetcher = LogFetcher(args.email, args.password)
    
    print("🔐 Authenticating...", end='', flush=True)
    if not fetcher.authenticate():
        print(" ❌")
        sys.exit(1)
    print(" ✅\n")
    
    # Handle different modes
    if args.stats:
        stats = fetcher.fetch_stats(args.hours)
        if args.json:
            print(json.dumps(stats, indent=2))
        else:
            fetcher.print_stats(stats)
    
    elif args.tail:
        fetcher.tail_logs(args.level, args.module, args.user)
    
    else:
        # Fetch logs
        print(f"📥 Fetching logs...", end='', flush=True)
        logs = fetcher.fetch_logs(
            hours=args.hours,
            level=args.level,
            module=args.module,
            search=args.search,
            user=args.user,
            limit=args.limit
        )
        print(f" ✅ ({len(logs)} logs)\n")
        
        # Handle export
        if args.export:
            with open(args.export, 'w') as f:
                json.dump(logs, f, indent=2)
            print(f"✅ Exported {len(logs)} logs to {args.export}")
        
        # Display logs
        elif args.json:
            print(json.dumps(logs, indent=2))
        
        else:
            if not logs:
                print("No logs found matching your criteria")
            else:
                print("="*80)
                for log in reversed(logs):  # Show oldest first
                    fetcher.print_log(log, use_color=not args.no_color)
                print("="*80)
                print(f"\nDisplayed {len(logs)} logs from the last {args.hours} hours")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Goodbye!")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)

# DNS Configuration for tryworkspaceos.com

## Required DNS Records in Cloudflare

### 1. ✅ Root Domain (tryworkspaceos.com) - ALREADY CONFIGURED
Your A records are correctly set up:
- Type: A | Name: @ | Content: 185.199.108.153
- Type: A | Name: @ | Content: 185.199.109.153
- Type: A | Name: @ | Content: 185.199.110.153
- Type: A | Name: @ | Content: 185.199.111.153

### 2. ❌ WWW Subdomain - NEEDS TO BE ADDED
Add this CNAME record:
```
Type: CNAME
Name: www
Content: triglavis.github.io
Proxy: DNS only (gray cloud)
TTL: Auto
```

### 3. ❌ Email Security Records - NEEDS TO BE ADDED
To prevent email spoofing (since you're not using email), add these restrictive records:

**SPF Record (prevents email spoofing):**
```
Type: TXT
Name: @
Content: "v=spf1 -all"
TTL: Auto
```

**DMARC Record (email authentication policy):**
```
Type: TXT
Name: _dmarc
Content: "v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s;"
TTL: Auto
```

**DKIM Record (optional but recommended):**
```
Type: TXT
Name: *._domainkey
Content: "v=DKIM1; p="
TTL: Auto
```

**MX Record (to explicitly show no mail server):**
```
Type: MX
Name: @
Mail server: .
Priority: 0
TTL: Auto
```

## Steps to Complete Setup:

1. **In Cloudflare Dashboard:**
   - Go to DNS settings for tryworkspaceos.com
   - Add the CNAME record for www
   - Add the TXT records for email security

2. **In GitHub Repository Settings:**
   - Go to Settings → Pages
   - Custom domain should show: tryworkspaceos.com
   - Wait for DNS check to complete (can take up to 24 hours)
   - Enable "Enforce HTTPS" once available

3. **Verify Setup:**
   - Visit https://tryworkspaceos.com
   - Visit https://www.tryworkspaceos.com
   - Both should load your site

## DNS Propagation:
- Changes can take 5 minutes to 48 hours to propagate globally
- You can check status at: https://www.whatsmydns.net/

## Troubleshooting:
- If site doesn't load, ensure Cloudflare proxy is OFF for CNAME record
- GitHub Pages doesn't work with Cloudflare proxy for custom domains
- Make sure CNAME file in repository contains exactly: tryworkspaceos.com
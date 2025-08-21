# WorkspaceOS Website - Claude Instructions

## CRITICAL IMPLEMENTATION REQUIREMENTS

### ⚠️ MANDATORY: Follow Exact Instructions
**DO NOT** simplify, replace, or change the implementation approach to claim an issue is "solved". Solutions must:
1. **Implement the exact feature requested** - not a simpler alternative
2. **Maintain the full 3D gravitational vision** - no 2D substitutions
3. **Follow the specific technical approach outlined** - don't pivot to easier solutions
4. **Complete all aspects of the requirement** - partial solutions are not acceptable

### Core Vision: 3D Gravitational Singularity
The website must feature a **full 3D implementation** with:
- **3D gravitational effect** swirling around the WorkspaceOS icon
- **Background distortion** caused by the gravitational pull
- **Work apps orbiting** in 3D space around the singularity
- **Spatial warping effects** that bend the visual space

This is NOT optional or negotiable. Do not replace with 2D animations or simpler effects.

## Project Overview
Marketing/landing page for WorkspaceOS - an ambient intelligence layer that orchestrates tools for knowledge work.

**Live Site**: https://tryworkspaceos.com

## Design Philosophy
- **Monochromatic black aesthetic** - Pure black (#000) with subtle gray gradients
- **3D gravitational singularity** - Full 3D implementation with spatial distortion
- **Ambient intelligence** represented through gravitational effects and orbiting animations
- **Single hero page** - Focus on above-the-fold impact, no scrolling required
- **Minimalist approach** - Let the concept shine through the experience

## Current Implementation Goals

### Required Visual Elements
1. **3D Gravitational Center**: WorkspaceOS as a gravitational singularity with full 3D warping effects
2. **Orbiting App Icons**: Tools orbit in 3D space with proper depth and perspective
3. **Background Distortion**: Gravitational lensing effect that warps the background
4. **Particle System**: Particles pulled into the gravitational field
5. **Central Hub**: WorkspaceOS logo as the gravitational center

### Key Features
- 30-second orbit animation with counter-rotation to keep icons upright
- Hover effects pause rotation and add glow
- Responsive design hides visual on mobile
- Pure HTML/CSS/JS - no frameworks

## Development Commands

### Local Development
```bash
# Start local server
python3 -m http.server 3000
# or
npx http-server -p 3000
```

### Deployment
```bash
# Deploy to GitHub Pages (auto-deploys on push to main)
git push origin main
```

## File Structure
```
/
├── index.html       # Single page HTML
├── styles.css       # Cleaned monochromatic styles
├── script.js        # Particle system & orbit animations
├── CNAME           # Custom domain configuration
└── .github/
    └── workflows/
        └── deploy.yml  # GitHub Pages deployment
```

## Design Decisions

### Why Single Hero?
- Maximum impact without dilution
- Embodies "ambient intelligence" - present but not overwhelming
- Focuses on core value proposition
- Faster load times, better performance

### Why Orbiting Icons?
- Visual metaphor for WorkspaceOS orchestrating tools
- Familiar app icons create immediate connection
- Motion suggests continuous, ambient activity
- Interactive elements engage without overwhelming

## Future Enhancements (Only if requested)

### Potential Additions
- [ ] Real app logos (currently using SVG approximations)
- [ ] More tools in orbit (Jira, Discord, Zoom, etc.)
- [ ] Speed controls for orbit animation
- [ ] Dark/light mode toggle
- [ ] Additional sections below fold
- [ ] Analytics integration
- [ ] Form backend for early access

### Performance Optimizations
- [ ] Lazy load particle system
- [ ] Reduce particle count on low-end devices
- [ ] Optimize animation frame rates
- [ ] Add will-change CSS properties

## Brand Guidelines

### Typography
- Font: Inter (200-900 weights)
- Hero title: 200 weight for elegance
- Body text: 400 weight for readability

### Colors
```css
--black: #000000
--gray-900: #1a1a1a  /* Darkest gray */
--gray-500: #6a6a6a  /* Mid gray */
--gray-100: #eaeaea  /* Light gray */
--white: #ffffff
```

### Animation Timing
- Orbit rotation: 30s (not too fast, not too slow)
- Pulse effects: 2-4s cycles
- Hover transitions: 0.3s ease
- Word reveals: 0.8s with stagger

## Important Notes

### SSH/GitHub Setup
If pushing fails with "Permission denied (publickey)":
```bash
# Add SSH key to agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Test connection
ssh -T git@github.com
```

### DNS Configuration
- A records point to GitHub Pages IPs (185.199.108.153, etc.)
- AAAA records for IPv6 support
- CNAME www → triglavis.github.io
- All records must be "DNS only" in Cloudflare (not proxied)

### HTTPS Certificate
GitHub automatically provisions SSL after DNS verification (can take up to 24 hours).

## Current Milestone: Q1 2025 GTM Preparation

### Milestone Overview
**Goal**: Prepare website for multi-channel go-to-market with targeted messaging
**Timeline**: January 2025
**Status**: IN PROGRESS

### Completed Stories

#### ✅ Story 1: Variant Switching System
**Status**: COMPLETE - PR #4 submitted
**Delivered**:
- URL parameter-based variant switching (?user=dev|ai|vision)
- 4 variants with targeted messaging
- Zero layout shift implementation
- Analytics tracking integration
- Developer console API
- Test harness at /test-variants.html

**Success Criteria Met**:
- ✓ No content flash or layout shifts
- ✓ Rotating bullets preserved
- ✓ Graceful fallback on network errors
- ✓ UTM campaign parameter support
- ✓ DataLayer events for analytics
- ✓ Lighthouse scores unchanged

### In Progress Stories

#### ✅ Story 2: Form Backend Integration
**Status**: COMPLETE
**Priority**: HIGH
**Dependencies**: None
**Delivered**: January 21, 2025

**Acceptance Criteria Met**:
- ✓ Email validation and sanitization (client + server-side)
- ✓ Variant tracking in submissions
- ✓ Rate limiting (5 submissions per IP/hour)
- ✓ Success/error feedback UI with loading states
- ✓ GDPR compliance with required consent checkbox
- ⏳ Automated welcome email (ready for SendGrid/Resend integration)

**Implementation Details**:
- Supabase backend with RLS policies
- `waitlist` and `waitlist_rate_limit` tables
- Server-side validation function `add_to_waitlist()`
- Client-side form handler with loading/success/error states
- GDPR + marketing consent checkboxes
- Full tracking of UTM parameters and browser metadata
- Mock mode for local development

**Files Created**:
- `waitlist-schema.sql` - Database schema and functions
- `waitlist.js` - Client-side form handler
- `WAITLIST_SETUP.md` - Setup and testing guide

#### 📋 Story 3: Analytics & Conversion Tracking
**Status**: NOT STARTED
**Priority**: HIGH
**Dependencies**: Form backend (Story 2)

**Acceptance Criteria**:
- [ ] Google Analytics 4 integration
- [ ] Conversion events for waitlist signups
- [ ] Variant performance tracking
- [ ] Scroll depth tracking
- [ ] Engagement time metrics
- [ ] A/B test framework ready

**Implementation Plan**:
1. Set up GA4 property and data streams
2. Implement gtag.js with consent management
3. Create custom events for variant views
4. Set up conversion tracking for form submissions
5. Create GTM container for marketing team access
6. Document event taxonomy

#### 🎨 Story 4: Visual Polish & Performance
**Status**: NOT STARTED
**Priority**: MEDIUM
**Dependencies**: None

**Acceptance Criteria**:
- [ ] Lighthouse Performance score > 95
- [ ] First Contentful Paint < 1.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] WebGL fallback for unsupported browsers
- [ ] Reduced motion support
- [ ] Image optimization (WebP with fallbacks)

**Implementation Plan**:
1. Audit current performance metrics
2. Implement critical CSS inlining
3. Add WebGL feature detection with canvas fallback
4. Optimize Three.js bundle (tree-shaking)
5. Add prefers-reduced-motion support
6. Convert images to WebP with fallbacks

### Upcoming Stories (Backlog)

#### 📱 Story 5: Mobile Experience Enhancement
**Priority**: MEDIUM
**Estimated Effort**: 3 days
**Dependencies**: Visual Polish (Story 4)

#### 🌍 Story 6: Internationalization Prep
**Priority**: LOW
**Estimated Effort**: 2 days
**Dependencies**: Variant System (Story 1) - COMPLETE

#### 🔒 Story 7: Security & Compliance
**Priority**: HIGH
**Estimated Effort**: 2 days
**Dependencies**: Form Backend (Story 2)

### Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Form backend choice delays implementation | HIGH | Time-boxed decision by Jan 22 |
| GA4 configuration complexity | MEDIUM | Use GTM for flexibility |
| Performance regression from analytics | MEDIUM | Lazy-load analytics after interaction |
| GDPR compliance requirements | HIGH | Legal review before launch |
| Variant system bugs | LOW | Comprehensive test coverage |

### Dependencies Map
```
Story 1 (COMPLETE) → Story 6
Story 2 → Story 3, Story 7
Story 4 → Story 5
```

### Success Metrics
- **Conversion Rate**: >3% waitlist signup (industry avg: 2%)
- **Variant Performance**: Identify winning variant within 2 weeks
- **Page Speed**: Maintain <2s load time
- **Engagement**: >45s average time on page
- **Bounce Rate**: <60%

### Technical Debt & Notes
- Consider migrating to Next.js for better performance and SEO
- Evaluate CDN for Three.js library (currently self-hosted)
- Add error tracking (Sentry) before public launch
- Implement feature flags for gradual rollout

## Contact
For questions about the WorkspaceOS vision or product, the landing page currently uses placeholder emails/links that should be updated when ready.

## Implementation Standards

### When Issues Arise
If implementing the full 3D gravitational effect encounters challenges:
1. **DO NOT** fall back to 2D solutions
2. **DO NOT** remove features to simplify
3. **DO** troubleshoot and fix the actual issue
4. **DO** maintain all requested features
5. **DO** ask for clarification if needed rather than assuming a simpler approach

### Acceptable Technologies
- Three.js for 3D rendering
- WebGL shaders for distortion effects
- GLSL for custom gravitational warping
- Canvas API for particle systems
- CSS 3D transforms only as supplements to full 3D

### Unacceptable Substitutions
- ❌ Replacing 3D with CSS animations
- ❌ Using 2D canvas instead of WebGL
- ❌ Removing gravitational distortion
- ❌ Static orbits without gravitational physics
- ❌ Flat particle systems without depth

---
*Last Updated: 2025-01-05*
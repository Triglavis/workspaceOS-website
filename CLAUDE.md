# WorkspaceOS Website - Claude Instructions

## Project Overview
Marketing/landing page for WorkspaceOS - an ambient intelligence layer that orchestrates tools for knowledge work.

**Live Site**: https://tryworkspaceos.com

## Design Philosophy
- **Monochromatic black aesthetic** - Pure black (#000) with subtle gray gradients
- **Ambient intelligence** represented through particle effects and orbiting animations
- **Single hero page** - Focus on above-the-fold impact, no scrolling required
- **Minimalist approach** - Let the concept shine through the experience

## Current Implementation

### Visual Elements
1. **Orbiting App Icons**: Six popular tools (Figma, VS Code, Slack, Notion, GitHub, Linear) orbit around central WorkspaceOS hub
2. **Particle System**: Interactive particles that respond to mouse movement
3. **Gradient Orbs**: Floating background elements for depth
4. **Central Hub**: Pulsing WorkspaceOS logo with concentric rings

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

## Contact
For questions about the WorkspaceOS vision or product, the landing page currently uses placeholder emails/links that should be updated when ready.

---
*Last Updated: 2025-08-05*
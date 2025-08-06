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
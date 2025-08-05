# WorkspaceOS Website

Modern, monochromatic landing page for WorkspaceOS - The ambient intelligence layer for knowledge work.

## Quick Start

### View the site locally:
```bash
# Using Python (if installed)
python3 -m http.server 3000

# Or using Node.js
npx http-server -p 3000
```
Then open http://localhost:3000

### Connect to GitHub:
Once your SSH key is configured:
```bash
git remote add origin git@github.com:Triglavis/workspaceOS-website.git
git add .
git commit -m "Initial commit: Ambient intelligence landing page"
git branch -M main
git push -u origin main
```

## Features

- **Ambient Particle System**: Interactive particle effects that respond to mouse movement
- **Flow Diagram**: Animated connections showing tool orchestration
- **Monochromatic Design**: Pure black aesthetic with subtle depth through gradients
- **Smooth Animations**: Organic, fluid transitions throughout
- **Interactive Elements**: Hover effects and cursor interactions
- **Responsive Layout**: Works beautifully on all devices

## Design Philosophy

Unlike typical landing pages, this site embodies the "ambient intelligence" concept through:
- Organic, flowing layouts instead of rigid grids
- Subtle particle effects representing intelligence flowing through tools
- Depth through layered shadows and gradients
- Interactive elements that respond to user presence
- Typography that breathes and evolves

## Technologies

- Pure HTML/CSS/JavaScript (no frameworks)
- Canvas API for particle system
- SVG for flow animations
- CSS Grid & Flexbox for layout
- Intersection Observer for scroll effects

## Deployment

Ready for static hosting on:
- GitHub Pages
- Netlify
- Vercel
- Any static web server
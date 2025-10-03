# WorkspaceOS Website

Marketing/landing page for WorkspaceOS - an ambient intelligence layer that orchestrates tools for knowledge work.

🌐 **Live Site**: [https://tryworkspaceos.com](https://tryworkspaceos.com)

## Quick Start

```bash
# Local development
python3 -m http.server 3000
# or
npx http-server -p 3000

# Then open http://localhost:3000
```

## Tech Stack

- Pure HTML/CSS/JavaScript (no frameworks)
- Three.js for 3D gravitational effects
- WebGL for spatial distortion
- GitHub Pages for hosting

## Deployment

Site auto-deploys via GitHub Actions when pushing to `main` branch.

## Cloudflare Analytics

Use the helper script to update the Cloudflare Web Analytics token across all HTML files:

```bash
export CLOUDFLARE_ANALYTICS_TOKEN="your-production-token"
npm run inject:analytics
```

`deploy.sh` runs the same script automatically when the environment variable is present, so set it before deploying to ensure the correct token reaches production.

## Development

See `CLAUDE.md` for detailed implementation requirements and vision.

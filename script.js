// Particle System
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: 0, y: 0 };
        this.init();
        this.animate();
        this.setupEventListeners();
    }

    init() {
        this.resize();
        this.createParticles();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        const particleCount = Math.floor((this.canvas.width * this.canvas.height) / 15000);
        
        for (let i = 0; i < particleCount; i++) {
            const particleType = Math.random();
            
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.8,
                vy: (Math.random() - 0.5) * 0.8,
                radius: particleType < 0.7 ? Math.random() * 1.5 + 0.5 : Math.random() * 3 + 2,
                opacity: particleType < 0.7 ? Math.random() * 0.4 + 0.1 : Math.random() * 0.8 + 0.3,
                type: particleType < 0.7 ? 'dot' : 'star',
                twinkle: Math.random() * Math.PI * 2,
                twinkleSpeed: Math.random() * 0.02 + 0.01,
                blackHoleInfluence: 0
            });
        }
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.resize();
            this.particles = [];
            this.createParticles();
        });

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }

    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Black hole center (approximate center of screen)
        const blackHoleX = this.canvas.width / 2;
        const blackHoleY = this.canvas.height / 2;
        
        this.particles.forEach((particle, i) => {
            // Update twinkle animation
            particle.twinkle += particle.twinkleSpeed;
            
            // Black hole attraction (much stronger than mouse)
            const blackHoleDx = blackHoleX - particle.x;
            const blackHoleDy = blackHoleY - particle.y;
            const blackHoleDistance = Math.sqrt(blackHoleDx * blackHoleDx + blackHoleDy * blackHoleDy);
            
            if (blackHoleDistance < 400) {
                const blackHoleForce = (400 - blackHoleDistance) / 400 * 0.15;
                particle.vx += (blackHoleDx / blackHoleDistance) * blackHoleForce;
                particle.vy += (blackHoleDy / blackHoleDistance) * blackHoleForce;
                particle.blackHoleInfluence = blackHoleForce;
            } else {
                particle.blackHoleInfluence *= 0.95;
            }
            
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Wrap around edges (but less frequently due to black hole)
            if (particle.x < -50) particle.x = this.canvas.width + 50;
            if (particle.x > this.canvas.width + 50) particle.x = -50;
            if (particle.y < -50) particle.y = this.canvas.height + 50;
            if (particle.y > this.canvas.height + 50) particle.y = -50;
            
            // Mouse interaction (weaker now)
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 80) {
                const force = (80 - distance) / 80;
                particle.vx -= (dx / distance) * force * 0.05;
                particle.vy -= (dy / distance) * force * 0.05;
            }
            
            // Damping
            particle.vx *= 0.98;
            particle.vy *= 0.98;
            
            // Calculate dynamic opacity based on twinkle and black hole influence
            const twinkleOpacity = Math.sin(particle.twinkle) * 0.3 + 0.7;
            const dynamicOpacity = particle.opacity * twinkleOpacity * (1 + particle.blackHoleInfluence);
            
            // Draw particle based on type
            if (particle.type === 'star') {
                this.drawStar(particle.x, particle.y, particle.radius, dynamicOpacity);
            } else {
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(255, 255, 255, ${dynamicOpacity})`;
                this.ctx.fill();
            }
            
            // Draw connections (fewer and more subtle)
            if (i % 3 === 0) {
                this.particles.slice(i + 1, i + 5).forEach(other => {
                    const dx = other.x - particle.x;
                    const dy = other.y - particle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 120) {
                        this.ctx.beginPath();
                        this.ctx.moveTo(particle.x, particle.y);
                        this.ctx.lineTo(other.x, other.y);
                        this.ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - distance / 120) * 0.08})`;
                        this.ctx.stroke();
                    }
                });
            }
        });
    }
    
    drawStar(x, y, radius, opacity) {
        const spikes = 4;
        const outerRadius = radius;
        const innerRadius = radius * 0.4;
        
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - outerRadius);
        
        for (let i = 0; i < spikes * 2; i++) {
            const angle = (i * Math.PI) / spikes;
            const r = i % 2 === 0 ? outerRadius : innerRadius;
            const pointX = x + Math.cos(angle - Math.PI / 2) * r;
            const pointY = y + Math.sin(angle - Math.PI / 2) * r;
            this.ctx.lineTo(pointX, pointY);
        }
        
        this.ctx.closePath();
        this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        this.ctx.fill();
    }

    animate() {
        this.drawParticles();
        requestAnimationFrame(() => this.animate());
    }
}

// Orbit System Enhancement
class OrbitSystem {
    constructor() {
        this.icons = document.querySelectorAll('.app-icon');
        this.hub = document.querySelector('.central-hub');
        this.connections = document.querySelector('.orbit-connections');
        this.init();
    }

    init() {
        this.setupHoverEffects();
        this.createConnectionPulses();
    }

    setupHoverEffects() {
        this.icons.forEach(icon => {
            icon.addEventListener('mouseenter', () => {
                // Pause rotation on hover
                icon.style.animationPlayState = 'paused';
                // Add glow to central hub
                this.hub.style.filter = 'drop-shadow(0 0 60px rgba(255, 255, 255, 1))';
                // Draw connection line
                this.drawConnection(icon);
            });
            
            icon.addEventListener('mouseleave', () => {
                // Resume rotation
                icon.style.animationPlayState = 'running';
                // Reset hub glow
                this.hub.style.filter = '';
                // Clear connection
                this.clearConnections();
            });
        });
    }

    drawConnection(icon) {
        const rect = icon.getBoundingClientRect();
        const hubRect = this.hub.getBoundingClientRect();
        const containerRect = this.connections.getBoundingClientRect();
        
        const x1 = (hubRect.left + hubRect.width / 2 - containerRect.left);
        const y1 = (hubRect.top + hubRect.height / 2 - containerRect.top);
        const x2 = (rect.left + rect.width / 2 - containerRect.left);
        const y2 = (rect.top + rect.height / 2 - containerRect.top);
        
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', 'white');
        line.setAttribute('stroke-width', '1');
        line.setAttribute('opacity', '0.5');
        line.classList.add('connection-line');
        
        this.connections.appendChild(line);
    }

    clearConnections() {
        const lines = this.connections.querySelectorAll('.connection-line');
        lines.forEach(line => line.remove());
    }

    createConnectionPulses() {
        // Create subtle pulsing connections
        setInterval(() => {
            if (!document.querySelector('.app-icon:hover')) {
                const randomIcon = this.icons[Math.floor(Math.random() * this.icons.length)];
                this.createPulse(randomIcon);
            }
        }, 3000);
    }

    createPulse(icon) {
        const rect = icon.getBoundingClientRect();
        const hubRect = this.hub.getBoundingClientRect();
        const containerRect = this.connections.getBoundingClientRect();
        
        const x1 = (hubRect.left + hubRect.width / 2 - containerRect.left);
        const y1 = (hubRect.top + hubRect.height / 2 - containerRect.top);
        const x2 = (rect.left + rect.width / 2 - containerRect.left);
        const y2 = (rect.top + rect.height / 2 - containerRect.top);
        
        const pulse = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        pulse.setAttribute('r', '2');
        pulse.setAttribute('fill', 'white');
        pulse.style.opacity = '0.8';
        
        const animateMotion = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion');
        animateMotion.setAttribute('dur', '1s');
        animateMotion.setAttribute('path', `M ${x1} ${y1} L ${x2} ${y2}`);
        animateMotion.setAttribute('fill', 'freeze');
        
        pulse.appendChild(animateMotion);
        this.connections.appendChild(pulse);
        
        setTimeout(() => pulse.remove(), 1000);
    }
}

// Removed scroll effects and navigation - page is now single hero section

// Form Handler
class FormHandler {
    constructor() {
        this.form = document.querySelector('.early-access-form');
        this.init();
    }

    init() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = this.form.querySelector('input[type="email"]').value;
                
                // Animation feedback
                const button = this.form.querySelector('.btn-primary');
                const originalText = button.innerHTML;
                
                button.innerHTML = `
                    <span>Thank you!</span>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M5 10L8 13L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                `;
                
                button.style.background = '#10b981';
                
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.style.background = '';
                    this.form.reset();
                }, 3000);
                
                // Early access form submitted
            });
        }
    }
}

// Ambient Cursor Effect
class AmbientCursor {
    constructor() {
        this.cursor = null;
        this.init();
    }

    init() {
        this.createCursor();
        this.setupEventListeners();
    }

    createCursor() {
        this.cursor = document.createElement('div');
        this.cursor.className = 'ambient-cursor';
        this.cursor.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            transition: transform 0.2s, opacity 0.2s;
            mix-blend-mode: difference;
        `;
        document.body.appendChild(this.cursor);
    }

    setupEventListeners() {
        document.addEventListener('mousemove', (e) => {
            this.cursor.style.left = e.clientX - 10 + 'px';
            this.cursor.style.top = e.clientY - 10 + 'px';
        });

        document.addEventListener('mouseenter', () => {
            this.cursor.style.opacity = '1';
        });

        document.addEventListener('mouseleave', () => {
            this.cursor.style.opacity = '0';
        });

        // Hover effects
        const interactiveElements = document.querySelectorAll('a, button, .tool-node, .feature-card');
        
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                this.cursor.style.transform = 'scale(2)';
                this.cursor.style.borderColor = 'rgba(255, 255, 255, 0.5)';
            });
            
            el.addEventListener('mouseleave', () => {
                this.cursor.style.transform = 'scale(1)';
                this.cursor.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            });
        });
    }
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    // Initialize particle system
    const canvas = document.getElementById('particles');
    if (canvas) {
        new ParticleSystem(canvas);
    }
    
    // Initialize orbit system
    const orbitSystem = document.querySelector('.orbit-system');
    if (orbitSystem) {
        new OrbitSystem();
    }
    
    // Initialize form handler
    new FormHandler();
    
    // Initialize ambient cursor
    new AmbientCursor();
    
    // Add visible class to sections for animation
    const style = document.createElement('style');
    style.textContent = `
        section {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.8s, transform 0.8s;
        }
        
        section.visible {
            opacity: 1;
            transform: translateY(0);
        }
        
        .hero {
            opacity: 1;
            transform: none;
        }
    `;
    document.head.appendChild(style);
});
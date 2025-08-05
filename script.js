// WorkspaceOS Gravitational Pull Effect

class GravitationalField {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.streams = [];
        this.time = 0;
        
        // Center point for gravitational pull (aligned with orbit system)
        this.centerX = 0;
        this.centerY = 0;
        
        this.init();
        this.animate();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // Create particles being pulled toward center
        this.createParticles();
        this.createStreams();
    }

    resize() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        // Center point is slightly left of canvas center to align with orbit
        this.centerX = this.canvas.width * 0.3;
        this.centerY = this.canvas.height * 0.5;
    }

    createParticles() {
        const particleCount = 150;
        
        for (let i = 0; i < particleCount; i++) {
            // Start particles from edges and far distances
            const angle = Math.random() * Math.PI * 2;
            const distance = 300 + Math.random() * 400;
            
            this.particles.push({
                x: this.centerX + Math.cos(angle) * distance,
                y: this.centerY + Math.sin(angle) * distance,
                vx: 0,
                vy: 0,
                size: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.5 + 0.3,
                speed: Math.random() * 0.5 + 0.5,
                angle: angle,
                distance: distance,
                orbiting: false
            });
        }
    }

    createStreams() {
        const streamCount = 8;
        
        for (let i = 0; i < streamCount; i++) {
            const angle = (Math.PI * 2 / streamCount) * i;
            
            this.streams.push({
                angle: angle,
                distance: 500,
                width: Math.random() * 3 + 1,
                speed: Math.random() * 0.3 + 0.2,
                opacity: 0.3
            });
        }
    }

    drawStreams() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;
        
        this.streams.forEach(stream => {
            // Update stream position
            stream.angle += stream.speed * 0.01;
            stream.distance -= stream.speed * 2;
            
            if (stream.distance < 50) {
                stream.distance = 500;
            }
            
            // Draw spiral stream
            this.ctx.beginPath();
            
            for (let i = 0; i < 100; i++) {
                const progress = i / 100;
                const spiralAngle = stream.angle + progress * Math.PI * 4;
                const spiralDistance = stream.distance * (1 - progress * 0.8);
                
                const x = this.centerX + Math.cos(spiralAngle) * spiralDistance;
                const y = this.centerY + Math.sin(spiralAngle) * spiralDistance;
                
                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            
            this.ctx.stroke();
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.time += 0.016;
        
        // Draw streams first (background)
        this.drawStreams();
        
        // Update and draw particles
        this.particles.forEach((particle, index) => {
            // Calculate distance to center
            const dx = this.centerX - particle.x;
            const dy = this.centerY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 30) {
                // Gravitational pull toward center
                const force = (150 / (distance * distance)) * particle.speed;
                const angle = Math.atan2(dy, dx);
                
                // Add spiral motion
                const spiralAngle = angle + this.time * 0.5;
                
                particle.vx += Math.cos(spiralAngle) * force;
                particle.vy += Math.sin(spiralAngle) * force;
                
                // Apply velocity
                particle.vx *= 0.98; // Damping
                particle.vy *= 0.98;
                
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                // Start orbiting when close enough
                if (distance < 150 && !particle.orbiting) {
                    particle.orbiting = true;
                    particle.orbitRadius = distance;
                    particle.orbitAngle = Math.atan2(particle.y - this.centerY, particle.x - this.centerX);
                }
            } else {
                // Reset particle to edge
                const angle = Math.random() * Math.PI * 2;
                const distance = 400 + Math.random() * 300;
                
                particle.x = this.centerX + Math.cos(angle) * distance;
                particle.y = this.centerY + Math.sin(angle) * distance;
                particle.vx = 0;
                particle.vy = 0;
                particle.orbiting = false;
            }
            
            // Handle orbiting particles
            if (particle.orbiting) {
                particle.orbitAngle += 0.02 * particle.speed;
                particle.orbitRadius -= 0.5; // Slowly spiral inward
                
                particle.x = this.centerX + Math.cos(particle.orbitAngle) * particle.orbitRadius;
                particle.y = this.centerY + Math.sin(particle.orbitAngle) * particle.orbitRadius;
                
                if (particle.orbitRadius < 30) {
                    particle.orbiting = false;
                }
            }
            
            // Draw particle
            const fadeDistance = 100;
            let opacity = particle.opacity;
            
            if (distance < fadeDistance) {
                opacity *= (distance / fadeDistance);
            }
            
            this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw motion trail for fast particles
            if (particle.speed > 0.8) {
                this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.3})`;
                this.ctx.lineWidth = particle.size * 0.5;
                this.ctx.beginPath();
                this.ctx.moveTo(particle.x, particle.y);
                this.ctx.lineTo(
                    particle.x - particle.vx * 5,
                    particle.y - particle.vy * 5
                );
                this.ctx.stroke();
            }
        });
        
        // Draw gravitational center glow
        const gradient = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, 200
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        requestAnimationFrame(() => this.animate());
    }
}

// Enhanced Orbit System with 3D feel
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
                icon.style.animationPlayState = 'paused';
                icon.style.transform += ' scale(1.3)';
                this.hub.style.filter = 'drop-shadow(0 0 80px rgba(255, 255, 255, 1))';
                this.drawConnection(icon);
            });
            
            icon.addEventListener('mouseleave', () => {
                icon.style.animationPlayState = 'running';
                icon.style.transform = icon.style.transform.replace(/scale\([^)]*\)/, '');
                this.hub.style.filter = '';
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
        line.setAttribute('stroke-width', '2');
        line.setAttribute('opacity', '0.9');
        line.classList.add('connection-line');
        
        this.connections.appendChild(line);
    }

    clearConnections() {
        const lines = this.connections.querySelectorAll('.connection-line');
        lines.forEach(line => line.remove());
    }

    createConnectionPulses() {
        setInterval(() => {
            if (!document.querySelector('.app-icon:hover')) {
                const randomIcon = this.icons[Math.floor(Math.random() * this.icons.length)];
                this.createPulse(randomIcon);
            }
        }, 1800);
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
        pulse.setAttribute('r', '4');
        pulse.setAttribute('fill', 'white');
        pulse.style.opacity = '0.9';
        
        const animateMotion = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion');
        animateMotion.setAttribute('dur', '1.2s');
        animateMotion.setAttribute('path', `M ${x1} ${y1} L ${x2} ${y2}`);
        animateMotion.setAttribute('fill', 'freeze');
        
        pulse.appendChild(animateMotion);
        this.connections.appendChild(pulse);
        
        setTimeout(() => pulse.remove(), 1200);
    }
}

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
            });
        }
    }
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    // Initialize gravitational field
    const canvas = document.getElementById('particles');
    if (canvas) {
        new GravitationalField(canvas);
    }
    
    // Initialize orbit system
    const orbitSystem = document.querySelector('.orbit-system');
    if (orbitSystem) {
        new OrbitSystem();
    }
    
    // Initialize form handler
    new FormHandler();
});
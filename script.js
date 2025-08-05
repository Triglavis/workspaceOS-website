// WorkspaceOS Gravitational Singularity System - Pure 2D Canvas Implementation

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
        this.add3DEffects();
    }

    add3DEffects() {
        // Add CSS 3D transforms for depth
        this.icons.forEach((icon, index) => {
            icon.style.transformStyle = 'preserve-3d';
            
            // Stagger Z positions for depth
            const zPos = Math.sin(index * 0.5) * 20;
            icon.style.transform += ` translateZ(${zPos}px)`;
            
            // Add subtle parallax on mouse move
            document.addEventListener('mousemove', (e) => {
                const x = (e.clientX / window.innerWidth - 0.5) * 20;
                const y = (e.clientY / window.innerHeight - 0.5) * 20;
                
                icon.style.transform = icon.style.transform.replace(/translateX\([^)]*\)/, '') + ` translateX(${x * (index + 1) * 0.1}px)`;
                icon.style.transform = icon.style.transform.replace(/translateY\([^)]*\)/, '') + ` translateY(${y * (index + 1) * 0.1}px)`;
            });
        });
    }

    setupHoverEffects() {
        this.icons.forEach(icon => {
            icon.addEventListener('mouseenter', () => {
                icon.style.animationPlayState = 'paused';
                icon.style.transform += ' scale(1.2) translateZ(50px)';
                this.hub.style.filter = 'drop-shadow(0 0 60px rgba(255, 255, 255, 1))';
                this.drawConnection(icon);
            });
            
            icon.addEventListener('mouseleave', () => {
                icon.style.animationPlayState = 'running';
                icon.style.transform = icon.style.transform.replace(/scale\([^)]*\)/, '').replace(/translateZ\(50px\)/, '');
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
        line.setAttribute('opacity', '0.8');
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
        }, 2000);
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
        pulse.setAttribute('r', '3');
        pulse.setAttribute('fill', 'white');
        pulse.style.opacity = '0.9';
        
        const animateMotion = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion');
        animateMotion.setAttribute('dur', '1.5s');
        animateMotion.setAttribute('path', `M ${x1} ${y1} L ${x2} ${y2}`);
        animateMotion.setAttribute('fill', 'freeze');
        
        pulse.appendChild(animateMotion);
        this.connections.appendChild(pulse);
        
        setTimeout(() => pulse.remove(), 1500);
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
    console.log('Initializing WorkspaceOS gravitational singularity system');
    
    // Initialize enhanced gravitational particle system
    const canvas = document.getElementById('particles');
    if (canvas) {
        initBasicParticles(canvas);
    }
    
    // Initialize orbit system
    const orbitSystem = document.querySelector('.orbit-system');
    if (orbitSystem) {
        new OrbitSystem();
    }
    
    // Initialize form handler
    new FormHandler();
    
    // Add CSS for 3D effects
    const style = document.createElement('style');
    style.textContent = `
        .orbit-system {
            perspective: 1000px;
            transform-style: preserve-3d;
        }
        
        .app-icon {
            transform-style: preserve-3d;
            transition: transform 0.3s ease;
        }
        
        .hero-visual {
            perspective: 1500px;
        }
        
        #particles {
            pointer-events: none;
        }
    `;
    document.head.appendChild(style);
});

// Enhanced fallback particle system with dramatic gravitational effects
function initBasicParticles(canvas) {
    console.log('Initializing enhanced fallback gravitational system');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 800;
    let time = 0;
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * Math.min(canvas.width, canvas.height) * 0.6 + 200;
        
        particles.push({
            x: canvas.width / 2 + Math.cos(angle) * radius,
            y: canvas.height / 2 + Math.sin(angle) * radius,
            originalX: canvas.width / 2 + Math.cos(angle) * radius,
            originalY: canvas.height / 2 + Math.sin(angle) * radius,
            vx: (Math.random() - 0.5) * 1,
            vy: (Math.random() - 0.5) * 1,
            radius: Math.random() * 2 + 0.5,
            opacity: Math.random() * 0.8 + 0.3,
            type: Math.random() > 0.7 ? 'stream' : 'star',
            phase: Math.random() * Math.PI * 2,
            twinkle: Math.random() * 0.02 + 0.01
        });
    }
    
    function drawStar(x, y, radius, opacity) {
        const spikes = 4;
        const outerRadius = radius * 1.5;
        const innerRadius = radius * 0.6;
        
        ctx.beginPath();
        ctx.moveTo(x, y - outerRadius);
        
        for (let i = 0; i < spikes * 2; i++) {
            const angle = (i * Math.PI) / spikes;
            const r = i % 2 === 0 ? outerRadius : innerRadius;
            const pointX = x + Math.cos(angle - Math.PI / 2) * r;
            const pointY = y + Math.sin(angle - Math.PI / 2) * r;
            ctx.lineTo(pointX, pointY);
        }
        
        ctx.closePath();
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fill();
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        time += 0.016;
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Draw background distortion effect
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 300);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.1)');
        gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.05)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach((particle, index) => {
            // Update twinkle
            particle.phase += particle.twinkle;
            
            // Gravitational pull toward center with spiral motion
            const dx = centerX - particle.x;
            const dy = centerY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 30) {
                // Strong gravitational force
                const force = 300 / (distance * distance + 10);
                const pullX = (dx / distance) * force;
                const pullY = (dy / distance) * force;
                
                // Add spiral motion
                const spiralAngle = time * 0.5 + index * 0.1;
                const spiralStrength = force * 0.3;
                
                particle.vx += pullX * 0.08 + Math.cos(spiralAngle) * spiralStrength * 0.02;
                particle.vy += pullY * 0.08 + Math.sin(spiralAngle) * spiralStrength * 0.02;
                
                // Damping
                particle.vx *= 0.98;
                particle.vy *= 0.98;
            }
            
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Respawn particles that get too close to center
            if (distance < 30) {
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * 300 + 400;
                particle.x = centerX + Math.cos(angle) * radius;
                particle.y = centerY + Math.sin(angle) * radius;
                particle.vx = (Math.random() - 0.5) * 1;
                particle.vy = (Math.random() - 0.5) * 1;
            }
            
            // Wrap around edges
            if (particle.x < -100) particle.x = canvas.width + 100;
            if (particle.x > canvas.width + 100) particle.x = -100;
            if (particle.y < -100) particle.y = canvas.height + 100;
            if (particle.y > canvas.height + 100) particle.y = -100;
            
            // Calculate dynamic opacity with twinkle
            const twinkleOpacity = Math.sin(particle.phase) * 0.3 + 0.7;
            const finalOpacity = particle.opacity * twinkleOpacity;
            
            // Draw particle based on type
            if (particle.type === 'star') {
                drawStar(particle.x, particle.y, particle.radius, finalOpacity);
            } else if (particle.type === 'stream') {
                // Information streams - cyan/blue
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius * 1.2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 200, 255, ${finalOpacity})`;
                ctx.fill();
                
                // Add glow effect for streams
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius * 2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 150, 255, ${finalOpacity * 0.2})`;
                ctx.fill();
            } else {
                // Regular dots
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity})`;
                ctx.fill();
            }
            
            // Draw connection lines occasionally
            if (index % 50 === 0 && distance > 100) {
                ctx.beginPath();
                ctx.moveTo(particle.x, particle.y);
                ctx.lineTo(centerX, centerY);
                ctx.strokeStyle = `rgba(255, 255, 255, ${finalOpacity * 0.1})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        });
        
        // Draw central black hole effect
        const blackHoleGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 100);
        blackHoleGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
        blackHoleGradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.05)');
        blackHoleGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = blackHoleGradient;
        ctx.fillRect(centerX - 100, centerY - 100, 200, 200);
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    // Handle resize
    window.addEventListener('resize', () => {
        const oldWidth = canvas.width;
        const oldHeight = canvas.height;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Adjust particle positions for new canvas size
        const scaleX = canvas.width / oldWidth;
        const scaleY = canvas.height / oldHeight;
        
        particles.forEach(particle => {
            particle.x *= scaleX;
            particle.y *= scaleY;
        });
    });
}
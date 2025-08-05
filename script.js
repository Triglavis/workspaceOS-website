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
        const particleCount = Math.floor((this.canvas.width * this.canvas.height) / 20000);
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.2
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
        
        this.particles.forEach((particle, i) => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Wrap around edges
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
            
            // Mouse interaction
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                const force = (100 - distance) / 100;
                particle.vx -= (dx / distance) * force * 0.1;
                particle.vy -= (dy / distance) * force * 0.1;
            }
            
            // Damping
            particle.vx *= 0.99;
            particle.vy *= 0.99;
            
            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
            this.ctx.fill();
            
            // Draw connections
            this.particles.slice(i + 1).forEach(other => {
                const dx = other.x - particle.x;
                const dy = other.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(other.x, other.y);
                    this.ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - distance / 150) * 0.1})`;
                    this.ctx.stroke();
                }
            });
        });
    }

    animate() {
        this.drawParticles();
        requestAnimationFrame(() => this.animate());
    }
}

// Flow Diagram Animation
class FlowDiagram {
    constructor() {
        this.svg = document.querySelector('.connections');
        this.tools = document.querySelectorAll('.tool-node');
        this.central = document.querySelector('.central-node');
        this.paths = [];
        this.init();
    }

    init() {
        this.createConnections();
        this.animateFlow();
        this.setupHoverEffects();
    }

    createConnections() {
        const centerX = 200;
        const centerY = 200;
        
        const positions = [
            { x: 200, y: 40 },   // top
            { x: 200, y: 360 },  // bottom
            { x: 40, y: 200 },   // left
            { x: 360, y: 200 }   // right
        ];

        positions.forEach((pos, i) => {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const d = `M ${centerX} ${centerY} Q ${(centerX + pos.x) / 2} ${(centerY + pos.y) / 2} ${pos.x} ${pos.y}`;
            
            path.setAttribute('d', d);
            path.setAttribute('stroke', 'url(#flow-gradient)');
            path.setAttribute('stroke-width', '2');
            path.setAttribute('fill', 'none');
            path.setAttribute('opacity', '0');
            path.classList.add('flow-path');
            
            this.svg.appendChild(path);
            this.paths.push(path);
        });
    }

    animateFlow() {
        this.paths.forEach((path, i) => {
            const length = path.getTotalLength();
            path.style.strokeDasharray = length;
            path.style.strokeDashoffset = length;
            
            const animate = () => {
                path.style.opacity = '1';
                path.style.transition = 'stroke-dashoffset 2s ease-in-out';
                path.style.strokeDashoffset = '0';
                
                setTimeout(() => {
                    path.style.transition = 'opacity 0.5s';
                    path.style.opacity = '0';
                    
                    setTimeout(() => {
                        path.style.transition = 'none';
                        path.style.strokeDashoffset = length;
                        setTimeout(animate, Math.random() * 2000 + 1000);
                    }, 500);
                }, 2000);
            };
            
            setTimeout(animate, i * 500);
        });
    }

    setupHoverEffects() {
        this.tools.forEach(tool => {
            tool.addEventListener('mouseenter', () => {
                this.central.style.transform = 'translate(-50%, -50%) scale(1.1)';
            });
            
            tool.addEventListener('mouseleave', () => {
                this.central.style.transform = 'translate(-50%, -50%) scale(1)';
            });
        });
    }
}

// Scroll Effects
class ScrollEffects {
    constructor() {
        this.nav = document.querySelector('.nav-container');
        this.sections = document.querySelectorAll('section');
        this.init();
    }

    init() {
        this.setupScrollListener();
        this.setupIntersectionObserver();
    }

    setupScrollListener() {
        let lastScroll = 0;
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            // Nav background
            if (currentScroll > 50) {
                this.nav.classList.add('scrolled');
            } else {
                this.nav.classList.remove('scrolled');
            }
            
            lastScroll = currentScroll;
        });
    }

    setupIntersectionObserver() {
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, options);

        this.sections.forEach(section => {
            observer.observe(section);
        });
    }
}

// Smooth Scroll for Navigation
class SmoothNavigation {
    constructor() {
        this.links = document.querySelectorAll('.nav-link');
        this.init();
    }

    init() {
        this.links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                
                if (targetId && targetId !== '#') {
                    const target = document.querySelector(targetId);
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });
    }
}

// Form Handler
class FormHandler {
    constructor() {
        this.form = document.querySelector('.cta-form');
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
                
                console.log('Early access requested for:', email);
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
    
    // Initialize flow diagram
    const flowDiagram = document.querySelector('.flow-diagram');
    if (flowDiagram) {
        new FlowDiagram();
    }
    
    // Initialize scroll effects
    new ScrollEffects();
    
    // Initialize smooth navigation
    new SmoothNavigation();
    
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
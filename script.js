// Gravitational Singularity System - Simplified and Reliable
class GravitationalSingularity {
    constructor(canvas) {
        this.canvas = canvas;
        this.mouse = { x: 0, y: 0 };
        this.time = 0;
        this.particles = [];
        
        this.init();
        this.createParticles();
        this.animate();
        this.setupEventListeners();
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas, 
            alpha: true, 
            antialias: true 
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 0);
        
        // Camera position
        this.camera.position.z = 5;
        
        // Singularity center
        this.singularityCenter = new THREE.Vector3(0, 0, 0);
    }

    createParticles() {
        // Create floating stars with gravitational pull
        this.createFloatingStars();
        this.createInformationStreams();
        this.createBackgroundWarp();
    }

    createFloatingStars() {
        const starCount = 500;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);

        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            
            // Distribute particles in 3D space
            const radius = Math.random() * 10 + 3;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
            
            // White to blue gradient
            colors[i3] = 1.0;
            colors[i3 + 1] = 1.0;
            colors[i3 + 2] = 1.0;
            
            sizes[i] = Math.random() * 3 + 1;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        // Use simple point material instead of complex shaders
        const material = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        this.starsSystem = new THREE.Points(geometry, material);
        this.scene.add(this.starsSystem);
        
        // Store reference for animation
        this.starPositions = positions;
        this.starOriginalPositions = positions.slice();
    }

    createInformationStreams() {
        const streamCount = 100;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(streamCount * 3);
        const colors = new Float32Array(streamCount * 3);

        for (let i = 0; i < streamCount; i++) {
            const i3 = i * 3;
            
            // Start from outer edge
            const radius = Math.random() * 8 + 5;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
            
            // Cyan/blue colors for information streams
            colors[i3] = 0.2; // R
            colors[i3 + 1] = 0.8; // G
            colors[i3 + 2] = 1.0; // B
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 3,
            vertexColors: true,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending
        });

        this.streamsSystem = new THREE.Points(geometry, material);
        this.scene.add(this.streamsSystem);
        
        this.streamPositions = positions;
        this.streamOriginalPositions = positions.slice();
    }

    createBackgroundWarp() {
        // Create a subtle background grid that warps toward center
        const gridSize = 20;
        const geometry = new THREE.PlaneGeometry(20, 20, gridSize, gridSize);
        
        const material = new THREE.MeshBasicMaterial({
            color: 0x111111,
            transparent: true,
            opacity: 0.1,
            wireframe: true
        });
        
        this.backgroundGrid = new THREE.Mesh(geometry, material);
        this.backgroundGrid.position.z = -8;
        this.scene.add(this.backgroundGrid);
    }

    updateParticles() {
        const time = this.time;
        
        // Update stars with gravitational pull
        if (this.starPositions) {
            for (let i = 0; i < this.starPositions.length; i += 3) {
                const x = this.starOriginalPositions[i];
                const y = this.starOriginalPositions[i + 1];
                const z = this.starOriginalPositions[i + 2];
                
                // Calculate distance to center
                const dist = Math.sqrt(x * x + y * y + z * z);
                
                // Gravitational pull
                const pullStrength = 1.0 / (dist + 0.5);
                const direction = new THREE.Vector3(-x, -y, -z).normalize();
                
                // Apply spiral motion
                const spiralAngle = time * 0.5 + dist * 0.2;
                const spiralRadius = Math.sin(spiralAngle) * pullStrength * 0.3;
                
                this.starPositions[i] = x + direction.x * pullStrength * 0.5 + Math.cos(spiralAngle) * spiralRadius;
                this.starPositions[i + 1] = y + direction.y * pullStrength * 0.5 + Math.sin(spiralAngle) * spiralRadius;
                this.starPositions[i + 2] = z + direction.z * pullStrength * 0.3;
            }
            
            this.starsSystem.geometry.attributes.position.needsUpdate = true;
        }
        
        // Update information streams
        if (this.streamPositions) {
            for (let i = 0; i < this.streamPositions.length; i += 3) {
                const x = this.streamOriginalPositions[i];
                const y = this.streamOriginalPositions[i + 1];
                const z = this.streamOriginalPositions[i + 2];
                
                const dist = Math.sqrt(x * x + y * y + z * z);
                const pullStrength = 2.0 / (dist + 0.3);
                const direction = new THREE.Vector3(-x, -y, -z).normalize();
                
                // Stronger pull for information streams
                const orbitalMotion = time * (1.0 / dist) + (i / 3) * 0.1;
                
                this.streamPositions[i] = x + direction.x * pullStrength * 0.8 + Math.cos(orbitalMotion) * 0.5;
                this.streamPositions[i + 1] = y + direction.y * pullStrength * 0.8 + Math.sin(orbitalMotion) * 0.5;
                this.streamPositions[i + 2] = z + direction.z * pullStrength * 0.6;
            }
            
            this.streamsSystem.geometry.attributes.position.needsUpdate = true;
        }
        
        // Warp background grid
        if (this.backgroundGrid) {
            const positions = this.backgroundGrid.geometry.attributes.position.array;
            const originalPositions = this.backgroundGrid.geometry.attributes.position.array.slice();
            
            for (let i = 0; i < positions.length; i += 3) {
                const x = originalPositions[i];
                const y = originalPositions[i + 1];
                const z = originalPositions[i + 2];
                
                const dist = Math.sqrt(x * x + y * y);
                const warpFactor = 0.3 / (dist + 1.0);
                
                positions[i] = x * (1 - warpFactor);
                positions[i + 1] = y * (1 - warpFactor);
            }
            
            this.backgroundGrid.geometry.attributes.position.needsUpdate = true;
        }
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });
    }

    animate() {
        this.time += 0.016;
        
        // Update particle systems
        this.updateParticles();
        
        // Subtle camera movement
        this.camera.position.x = Math.sin(this.time * 0.1) * 0.2;
        this.camera.position.y = Math.cos(this.time * 0.15) * 0.1;
        
        // Rotate entire scene slightly
        if (this.starsSystem) {
            this.starsSystem.rotation.y = this.time * 0.1;
        }
        if (this.streamsSystem) {
            this.streamsSystem.rotation.y = this.time * 0.2;
        }
        
        this.renderer.render(this.scene, this.camera);
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
    // Wait for Three.js to load
    const initThreeJS = () => {
        if (typeof THREE !== 'undefined') {
            console.log('Three.js loaded successfully');
            // Initialize Three.js gravitational singularity
            const canvas = document.getElementById('particles');
            if (canvas) {
                try {
                    new GravitationalSingularity(canvas);
                    console.log('Gravitational singularity initialized');
                } catch (error) {
                    console.error('Error initializing gravitational singularity:', error);
                    // Fallback to basic particle system
                    initBasicParticles(canvas);
                }
            }
        } else {
            console.error('Three.js not loaded');
            // Fallback to basic particle system
            const canvas = document.getElementById('particles');
            if (canvas) {
                initBasicParticles(canvas);
            }
        }
    };
    
    // Check if Three.js is already loaded
    if (typeof THREE !== 'undefined') {
        initThreeJS();
    } else {
        // Wait a bit for Three.js to load
        setTimeout(initThreeJS, 100);
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

// Basic fallback particle system
function initBasicParticles(canvas) {
    console.log('Initializing basic fallback particles');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 300;
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            radius: Math.random() * 2 + 1,
            opacity: Math.random() * 0.8 + 0.2,
            type: Math.random() > 0.7 ? 'stream' : 'star'
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        particles.forEach(particle => {
            // Gravitational pull toward center
            const dx = centerX - particle.x;
            const dy = centerY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 50) {
                const force = 200 / (distance * distance);
                particle.vx += (dx / distance) * force * 0.05;
                particle.vy += (dy / distance) * force * 0.05;
            }
            
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Wrap around edges
            if (particle.x < -50) particle.x = canvas.width + 50;
            if (particle.x > canvas.width + 50) particle.x = -50;
            if (particle.y < -50) particle.y = canvas.height + 50;
            if (particle.y > canvas.height + 50) particle.y = -50;
            
            // Draw particle
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            
            if (particle.type === 'stream') {
                ctx.fillStyle = `rgba(0, 200, 255, ${particle.opacity})`;
            } else {
                ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
            }
            ctx.fill();
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    // Handle resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}
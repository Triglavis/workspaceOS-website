// WorkspaceOS 3D Gravitational Singularity System

class GravitationalSingularity3D {
    constructor(canvas) {
        this.canvas = canvas;
        this.mouse = { x: 0, y: 0 };
        this.time = 0;
        
        this.init();
        this.createParticles();
        this.createBackground();
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
        this.camera.position.z = 8;
        
        // Singularity center
        this.singularityCenter = new THREE.Vector3(0, 0, 0);
        
        // Particle systems
        this.particleSystems = [];
    }

    createParticles() {
        this.createFloatingStars();
        this.createInformationStreams();
        this.createQuantumField();
    }

    createFloatingStars() {
        const starCount = 1000;
        const positions = new Float32Array(starCount * 3);
        const velocities = new Float32Array(starCount * 3);
        const phases = new Float32Array(starCount);
        
        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            
            // Distribute in 3D space around singularity
            const radius = Math.random() * 12 + 4;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
            
            velocities[i3] = (Math.random() - 0.5) * 0.02;
            velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
            
            phases[i] = Math.random() * Math.PI * 2;
        }
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));
        
        // Custom shader material for gravitational effects
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                singularityPos: { value: this.singularityCenter },
                singularityStrength: { value: 2.5 }
            },
            vertexShader: `
                attribute vec3 velocity;
                attribute float phase;
                uniform float time;
                uniform vec3 singularityPos;
                uniform float singularityStrength;
                
                varying float vIntensity;
                varying float vTwinkle;
                
                void main() {
                    vec3 pos = position;
                    
                    // Calculate distance to singularity
                    float dist = distance(pos, singularityPos);
                    
                    // Gravitational warping - stronger near center
                    vec3 direction = normalize(singularityPos - pos);
                    float force = singularityStrength / (dist * dist + 0.5);
                    
                    // Warp space-time around singularity
                    pos += direction * force * 0.4;
                    
                    // Add spiral motion in 3D
                    float spiralAngle = time * 0.6 + dist * 0.3;
                    float spiralRadius = sin(spiralAngle) * force * 0.2;
                    
                    // Create 3D spiral using rotation matrices
                    mat3 rotY = mat3(
                        cos(spiralAngle), 0.0, sin(spiralAngle),
                        0.0, 1.0, 0.0,
                        -sin(spiralAngle), 0.0, cos(spiralAngle)
                    );
                    
                    mat3 rotZ = mat3(
                        cos(spiralAngle * 0.5), -sin(spiralAngle * 0.5), 0.0,
                        sin(spiralAngle * 0.5), cos(spiralAngle * 0.5), 0.0,
                        0.0, 0.0, 1.0
                    );
                    
                    pos = rotY * rotZ * pos;
                    
                    // Add some noise for organic movement
                    pos += sin(time * 2.0 + phase) * 0.1 * force;
                    
                    vIntensity = force * 3.0 + 0.2;
                    vTwinkle = sin(time * 3.0 + phase * 2.0) * 0.5 + 0.5;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_PointSize = (2.0 + force * 4.0) * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying float vIntensity;
                varying float vTwinkle;
                
                void main() {
                    // Create 4-pointed star shape
                    vec2 center = gl_PointCoord - 0.5;
                    float dist = length(center);
                    
                    // Star pattern with 4 points
                    float angle = atan(center.y, center.x);
                    float star = pow(abs(sin(angle * 2.0)), 0.4);
                    
                    float alpha = (1.0 - dist * 2.0) * star * vIntensity * vTwinkle;
                    alpha = clamp(alpha, 0.0, 0.9);
                    
                    // Color shifts from white to blue based on intensity
                    vec3 color = mix(vec3(1.0), vec3(0.7, 0.9, 1.0), vIntensity * 0.5);
                    
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        
        const stars = new THREE.Points(geometry, material);
        this.scene.add(stars);
        
        this.particleSystems.push({
            mesh: stars,
            type: 'stars',
            originalPositions: positions.slice()
        });
    }

    createInformationStreams() {
        const streamCount = 300;
        const positions = new Float32Array(streamCount * 3);
        const velocities = new Float32Array(streamCount * 3);
        const lifetimes = new Float32Array(streamCount);
        
        for (let i = 0; i < streamCount; i++) {
            const i3 = i * 3;
            
            // Start from outer edge of the field
            const radius = Math.random() * 8 + 10;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
            
            velocities[i3] = 0;
            velocities[i3 + 1] = 0;
            velocities[i3 + 2] = 0;
            
            lifetimes[i] = Math.random();
        }
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        geometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));
        
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                singularityPos: { value: this.singularityCenter }
            },
            vertexShader: `
                attribute vec3 velocity;
                attribute float lifetime;
                uniform float time;
                uniform vec3 singularityPos;
                
                varying float vLifetime;
                varying float vDistance;
                varying float vFlow;
                
                void main() {
                    vec3 pos = position;
                    
                    // Calculate pull toward singularity
                    vec3 direction = normalize(singularityPos - pos);
                    float dist = distance(pos, singularityPos);
                    vDistance = dist;
                    vLifetime = lifetime;
                    
                    // Strong gravitational acceleration toward center
                    float force = 4.0 / (dist + 0.8);
                    pos += direction * force * 0.6;
                    
                    // Add complex orbital motion in 3D
                    float orbitalSpeed = 1.5 / (dist + 0.5);
                    float orbitalAngle = time * orbitalSpeed + lifetime * 6.28;
                    
                    // Create 3D helical motion
                    pos.x += cos(orbitalAngle) * sin(time * 0.5 + lifetime) * 0.8;
                    pos.y += sin(orbitalAngle) * cos(time * 0.5 + lifetime) * 0.8;
                    pos.z += sin(orbitalAngle * 0.5 + time) * 0.4;
                    
                    vFlow = force;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_PointSize = (1.5 + force * 2.0) * (200.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying float vLifetime;
                varying float vDistance;
                varying float vFlow;
                
                void main() {
                    vec2 center = gl_PointCoord - 0.5;
                    float dist = length(center);
                    
                    float alpha = (1.0 - dist) * (1.0 - vDistance / 15.0) * vFlow;
                    alpha = clamp(alpha, 0.0, 0.8);
                    
                    // Information stream colors - cyan to blue gradient
                    vec3 color = mix(vec3(0.0, 1.0, 1.0), vec3(0.2, 0.6, 1.0), vLifetime);
                    
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        
        const streams = new THREE.Points(geometry, material);
        this.scene.add(streams);
        
        this.particleSystems.push({
            mesh: streams,
            type: 'streams',
            originalPositions: positions.slice()
        });
    }

    createQuantumField() {
        const fieldCount = 2000;
        const positions = new Float32Array(fieldCount * 3);
        const phases = new Float32Array(fieldCount);
        const scales = new Float32Array(fieldCount);
        
        for (let i = 0; i < fieldCount; i++) {
            const i3 = i * 3;
            
            positions[i3] = (Math.random() - 0.5) * 30;
            positions[i3 + 1] = (Math.random() - 0.5) * 30;
            positions[i3 + 2] = (Math.random() - 0.5) * 20;
            
            phases[i] = Math.random() * Math.PI * 2;
            scales[i] = Math.random() * 0.5 + 0.5;
        }
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));
        geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));
        
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                singularityPos: { value: this.singularityCenter }
            },
            vertexShader: `
                attribute float phase;
                attribute float scale;
                uniform float time;
                uniform vec3 singularityPos;
                
                varying float vIntensity;
                
                void main() {
                    vec3 pos = position;
                    
                    float dist = distance(pos, singularityPos);
                    float distortionFactor = 3.0 / (dist + 2.0);
                    
                    // Quantum fluctuations - particles appear and disappear
                    pos += sin(time * 4.0 + phase) * 0.2 * distortionFactor;
                    
                    vIntensity = sin(time * 2.5 + phase + dist * 0.5) * 0.5 + 0.5;
                    vIntensity *= distortionFactor * scale;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_PointSize = scale * (30.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying float vIntensity;
                
                void main() {
                    vec2 center = gl_PointCoord - 0.5;
                    float dist = length(center);
                    
                    float alpha = (1.0 - dist * 2.0) * vIntensity;
                    alpha = clamp(alpha, 0.0, 0.4);
                    
                    gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        
        const field = new THREE.Points(geometry, material);
        this.scene.add(field);
        
        this.particleSystems.push({
            mesh: field,
            type: 'quantum'
        });
    }

    createBackground() {
        // Create warped background mesh that gets sucked toward center
        const geometry = new THREE.PlaneGeometry(40, 40, 50, 50);
        
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                singularityPos: { value: this.singularityCenter }
            },
            vertexShader: `
                uniform float time;
                uniform vec3 singularityPos;
                
                varying vec2 vUv;
                varying float vDistortion;
                
                void main() {
                    vUv = uv;
                    
                    vec3 pos = position;
                    
                    // Calculate distance to singularity
                    float dist = distance(pos, singularityPos);
                    
                    // Warp space-time toward singularity
                    vec3 direction = normalize(singularityPos - pos);
                    float warpFactor = 4.0 / (dist + 1.0);
                    pos += direction * warpFactor * 0.5;
                    
                    // Add wave distortions
                    pos.z += sin(time + pos.x * 0.5) * sin(time + pos.y * 0.5) * 0.1;
                    
                    vDistortion = warpFactor;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                
                varying vec2 vUv;
                varying float vDistortion;
                
                void main() {
                    vec2 center = vec2(0.5, 0.5);
                    float dist = distance(vUv, center);
                    
                    // Create radial gradient that gets darker toward center (black hole)
                    float darkness = smoothstep(0.0, 0.9, dist);
                    darkness = mix(0.02, 0.08, darkness);
                    
                    // Add subtle grid pattern
                    vec2 grid = abs(fract(vUv * 20.0) - 0.5);
                    float gridLine = min(grid.x, grid.y);
                    darkness += gridLine * 0.02;
                    
                    // Pulse effect
                    darkness += sin(time * 2.0 + dist * 10.0) * 0.005;
                    
                    // Darken more with distortion (closer to black hole)
                    darkness *= (2.0 - vDistortion * 0.5);
                    
                    gl_FragColor = vec4(darkness, darkness, darkness * 1.1, 0.6);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide
        });
        
        this.backgroundMesh = new THREE.Mesh(geometry, material);
        this.backgroundMesh.position.z = -15;
        this.scene.add(this.backgroundMesh);
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
        
        // Update all particle systems
        this.particleSystems.forEach(system => {
            if (system.mesh.material.uniforms) {
                system.mesh.material.uniforms.time.value = this.time;
            }
        });
        
        // Update background
        if (this.backgroundMesh) {
            this.backgroundMesh.material.uniforms.time.value = this.time;
        }
        
        // Dynamic camera movement - slow orbit around the singularity
        this.camera.position.x = Math.sin(this.time * 0.05) * 2;
        this.camera.position.y = Math.cos(this.time * 0.08) * 1;
        this.camera.position.z = 8 + Math.sin(this.time * 0.03) * 2;
        this.camera.lookAt(0, 0, 0);
        
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
            const zPos = Math.sin(index * 0.8) * 30;
            icon.style.transform += ` translateZ(${zPos}px)`;
            
            // Add subtle parallax on mouse move
            document.addEventListener('mousemove', (e) => {
                const x = (e.clientX / window.innerWidth - 0.5) * 30;
                const y = (e.clientY / window.innerHeight - 0.5) * 30;
                
                icon.style.transform = icon.style.transform.replace(/translateX\([^)]*\)/, '') + ` translateX(${x * (index + 1) * 0.15}px)`;
                icon.style.transform = icon.style.transform.replace(/translateY\([^)]*\)/, '') + ` translateY(${y * (index + 1) * 0.15}px)`;
            });
        });
    }

    setupHoverEffects() {
        this.icons.forEach(icon => {
            icon.addEventListener('mouseenter', () => {
                icon.style.animationPlayState = 'paused';
                icon.style.transform += ' scale(1.3) translateZ(80px)';
                this.hub.style.filter = 'drop-shadow(0 0 80px rgba(255, 255, 255, 1))';
                this.drawConnection(icon);
            });
            
            icon.addEventListener('mouseleave', () => {
                icon.style.animationPlayState = 'running';
                icon.style.transform = icon.style.transform.replace(/scale\([^)]*\)/, '').replace(/translateZ\(80px\)/, '');
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
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing WorkspaceOS 3D Gravitational Singularity');
    
    try {
        // Initialize 3D gravitational singularity
        const canvas = document.getElementById('particles');
        if (canvas) {
            new GravitationalSingularity3D(canvas);
            console.log('3D Gravitational singularity initialized successfully');
        }
    } catch (error) {
        console.error('Error initializing 3D system:', error);
        // Fallback to enhanced 2D system
        const canvas = document.getElementById('particles');
        if (canvas) {
            initEnhanced2DFallback(canvas);
        }
    }
    
    // Initialize orbit system
    const orbitSystem = document.querySelector('.orbit-system');
    if (orbitSystem) {
        new OrbitSystem();
    }
    
    // Initialize form handler
    new FormHandler();
    
    // Add CSS for enhanced 3D effects
    const style = document.createElement('style');
    style.textContent = `
        .orbit-system {
            perspective: 1500px;
            transform-style: preserve-3d;
        }
        
        .app-icon {
            transform-style: preserve-3d;
            transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .hero-visual {
            perspective: 2000px;
        }
        
        #particles {
            pointer-events: none;
        }
    `;
    document.head.appendChild(style);
});

// Enhanced 2D fallback system (in case 3D fails)
function initEnhanced2DFallback(canvas) {
    console.log('Initializing enhanced 2D fallback gravitational system');
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
        
        // Draw background distortion
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 400);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.15)');
        gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.08)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach((particle, index) => {
            particle.phase += particle.twinkle;
            
            const dx = centerX - particle.x;
            const dy = centerY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 30) {
                const force = 400 / (distance * distance + 20);
                const pullX = (dx / distance) * force;
                const pullY = (dy / distance) * force;
                
                const spiralAngle = time * 0.8 + index * 0.1;
                const spiralStrength = force * 0.4;
                
                particle.vx += pullX * 0.1 + Math.cos(spiralAngle) * spiralStrength * 0.03;
                particle.vy += pullY * 0.1 + Math.sin(spiralAngle) * spiralStrength * 0.03;
                
                particle.vx *= 0.97;
                particle.vy *= 0.97;
            }
            
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            if (distance < 30) {
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * 400 + 500;
                particle.x = centerX + Math.cos(angle) * radius;
                particle.y = centerY + Math.sin(angle) * radius;
                particle.vx = (Math.random() - 0.5) * 1;
                particle.vy = (Math.random() - 0.5) * 1;
            }
            
            const twinkleOpacity = Math.sin(particle.phase) * 0.3 + 0.7;
            const finalOpacity = particle.opacity * twinkleOpacity;
            
            if (particle.type === 'star') {
                drawStar(particle.x, particle.y, particle.radius, finalOpacity);
            } else if (particle.type === 'stream') {
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius * 1.2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 200, 255, ${finalOpacity})`;
                ctx.fill();
                
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius * 2.5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 150, 255, ${finalOpacity * 0.3})`;
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity})`;
                ctx.fill();
            }
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}
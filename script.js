// Three.js Gravitational Singularity System
class GravitationalSingularity {
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
        this.camera.position.z = 5;
        
        // Singularity center (the black hole)
        this.singularityCenter = new THREE.Vector3(0, 0, 0);
        
        // Particle groups
        this.particleGroups = [];
        this.backgroundMesh = null;
    }

    createParticles() {
        // Create multiple particle systems with different behaviors
        this.createFloatingStars();
        this.createInformationStreams();
        this.createQuantumField();
    }

    createFloatingStars() {
        const starCount = 800;
        const positions = new Float32Array(starCount * 3);
        const velocities = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);
        const originalPositions = new Float32Array(starCount * 3);
        
        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            
            // Distribute in 3D space around the singularity
            const radius = Math.random() * 8 + 2;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            positions[i3] = originalPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = originalPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = originalPositions[i3 + 2] = radius * Math.cos(phi);
            
            velocities[i3] = (Math.random() - 0.5) * 0.02;
            velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
            
            sizes[i] = Math.random() * 3 + 1;
        }
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                singularityPos: { value: this.singularityCenter },
                singularityStrength: { value: 2.0 }
            },
            vertexShader: `
                attribute float size;
                uniform float time;
                uniform vec3 singularityPos;
                uniform float singularityStrength;
                
                varying float vIntensity;
                
                void main() {
                    vec3 pos = position;
                    
                    // Calculate distance to singularity
                    float dist = distance(pos, singularityPos);
                    
                    // Gravitational pull (inverse square law with artistic license)
                    vec3 direction = normalize(singularityPos - pos);
                    float force = singularityStrength / (dist * dist + 0.1);
                    
                    // Warp space-time around singularity
                    pos += direction * force * 0.3;
                    
                    // Add swirling motion
                    float angle = atan(pos.y, pos.x) + time * 0.5 + force * 2.0;
                    mat2 rotation = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
                    pos.xy = rotation * pos.xy;
                    
                    vIntensity = force * 2.0 + 0.3;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z) * (1.0 + force);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying float vIntensity;
                
                void main() {
                    // Create star shape
                    vec2 center = gl_PointCoord - 0.5;
                    float dist = length(center);
                    
                    // Star pattern
                    float angle = atan(center.y, center.x);
                    float star = pow(abs(sin(angle * 4.0)), 0.3);
                    
                    float alpha = (1.0 - dist) * star * vIntensity;
                    alpha = smoothstep(0.0, 1.0, alpha);
                    
                    // Color shifts based on intensity
                    vec3 color = mix(vec3(1.0, 1.0, 1.0), vec3(0.8, 0.9, 1.0), vIntensity);
                    
                    gl_FragColor = vec4(color, alpha * 0.8);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        
        const stars = new THREE.Points(geometry, material);
        this.scene.add(stars);
        
        this.particleGroups.push({
            mesh: stars,
            positions: positions,
            velocities: velocities,
            originalPositions: originalPositions,
            type: 'stars'
        });
    }

    createInformationStreams() {
        // Create streams of data flowing toward the singularity
        const streamCount = 200;
        const positions = new Float32Array(streamCount * 3);
        const velocities = new Float32Array(streamCount * 3);
        const lifetimes = new Float32Array(streamCount);
        
        for (let i = 0; i < streamCount; i++) {
            const i3 = i * 3;
            
            // Start from outer edge
            const radius = Math.random() * 5 + 8;
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
        geometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));
        
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                singularityPos: { value: this.singularityCenter }
            },
            vertexShader: `
                attribute float lifetime;
                uniform float time;
                uniform vec3 singularityPos;
                
                varying float vLifetime;
                varying float vDistance;
                
                void main() {
                    vec3 pos = position;
                    
                    // Calculate pull toward singularity
                    vec3 direction = normalize(singularityPos - pos);
                    float dist = distance(pos, singularityPos);
                    vDistance = dist;
                    
                    // Accelerate toward center with spiral motion
                    float force = 3.0 / (dist + 0.5);
                    pos += direction * sin(time + lifetime * 10.0) * force * 0.5;
                    
                    // Add orbital motion
                    float orbitalSpeed = 1.0 / dist;
                    float angle = time * orbitalSpeed + lifetime * 6.28;
                    mat3 rotation = mat3(
                        cos(angle), -sin(angle), 0,
                        sin(angle), cos(angle), 0,
                        0, 0, 1
                    );
                    pos = rotation * pos;
                    
                    vLifetime = lifetime;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_PointSize = 2.0 * (100.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying float vLifetime;
                varying float vDistance;
                
                void main() {
                    vec2 center = gl_PointCoord - 0.5;
                    float dist = length(center);
                    
                    float alpha = (1.0 - dist) * (1.0 - vDistance / 10.0);
                    alpha = smoothstep(0.0, 1.0, alpha);
                    
                    // Information stream color - cyan/blue
                    vec3 color = mix(vec3(0.0, 1.0, 1.0), vec3(0.0, 0.5, 1.0), vLifetime);
                    
                    gl_FragColor = vec4(color, alpha * 0.6);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        
        const streams = new THREE.Points(geometry, material);
        this.scene.add(streams);
        
        this.particleGroups.push({
            mesh: streams,
            positions: positions,
            velocities: velocities,
            lifetimes: lifetimes,
            type: 'streams'
        });
    }

    createQuantumField() {
        // Quantum foam effect - tiny particles that appear and disappear
        const fieldCount = 1500;
        const positions = new Float32Array(fieldCount * 3);
        const phases = new Float32Array(fieldCount);
        
        for (let i = 0; i < fieldCount; i++) {
            const i3 = i * 3;
            
            positions[i3] = (Math.random() - 0.5) * 20;
            positions[i3 + 1] = (Math.random() - 0.5) * 20;
            positions[i3 + 2] = (Math.random() - 0.5) * 10;
            
            phases[i] = Math.random() * Math.PI * 2;
        }
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));
        
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                singularityPos: { value: this.singularityCenter }
            },
            vertexShader: `
                attribute float phase;
                uniform float time;
                uniform vec3 singularityPos;
                
                varying float vIntensity;
                
                void main() {
                    vec3 pos = position;
                    
                    float dist = distance(pos, singularityPos);
                    float distortionFactor = 2.0 / (dist + 1.0);
                    
                    // Quantum fluctuations
                    pos += sin(time * 3.0 + phase) * 0.1 * distortionFactor;
                    
                    vIntensity = sin(time * 2.0 + phase + dist) * 0.5 + 0.5;
                    vIntensity *= distortionFactor;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_PointSize = 1.0 * (50.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying float vIntensity;
                
                void main() {
                    vec2 center = gl_PointCoord - 0.5;
                    float dist = length(center);
                    
                    float alpha = (1.0 - dist) * vIntensity;
                    
                    gl_FragColor = vec4(1.0, 1.0, 1.0, alpha * 0.3);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending
        });
        
        const field = new THREE.Points(geometry, material);
        this.scene.add(field);
        
        this.particleGroups.push({
            mesh: field,
            type: 'quantum'
        });
    }

    createBackground() {
        // Create a background that warps toward the singularity
        const geometry = new THREE.PlaneGeometry(30, 30, 100, 100);
        
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                singularityPos: { value: this.singularityCenter },
                resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
            },
            vertexShader: `
                uniform float time;
                uniform vec3 singularityPos;
                
                varying vec2 vUv;
                varying float vDistortion;
                
                void main() {
                    vUv = uv;
                    
                    vec3 pos = position;
                    
                    // Calculate distance to singularity in screen space
                    float dist = distance(pos, singularityPos);
                    
                    // Warp space toward singularity
                    vec3 direction = normalize(singularityPos - pos);
                    float warpFactor = 2.0 / (dist + 0.5);
                    pos += direction * warpFactor * 0.3;
                    
                    vDistortion = warpFactor;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec2 resolution;
                
                varying vec2 vUv;
                varying float vDistortion;
                
                void main() {
                    vec2 center = vec2(0.5, 0.5);
                    float dist = distance(vUv, center);
                    
                    // Create radial gradient that gets darker toward center
                    float darkness = smoothstep(0.0, 0.8, dist);
                    darkness = mix(0.05, 0.15, darkness);
                    
                    // Add some subtle noise
                    float noise = sin(vUv.x * 100.0 + time) * sin(vUv.y * 100.0 + time) * 0.02;
                    
                    // Darken more with distortion
                    darkness *= (2.0 - vDistortion);
                    
                    gl_FragColor = vec4(darkness + noise, darkness + noise, darkness + noise * 1.2, 0.3);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide
        });
        
        this.backgroundMesh = new THREE.Mesh(geometry, material);
        this.backgroundMesh.position.z = -8;
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
        this.particleGroups.forEach(group => {
            if (group.mesh.material.uniforms) {
                group.mesh.material.uniforms.time.value = this.time;
            }
        });
        
        // Update background
        if (this.backgroundMesh) {
            this.backgroundMesh.material.uniforms.time.value = this.time;
        }
        
        // Subtle camera movement
        this.camera.position.x = Math.sin(this.time * 0.1) * 0.1;
        this.camera.position.y = Math.cos(this.time * 0.15) * 0.05;
        
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
    // Initialize Three.js gravitational singularity
    const canvas = document.getElementById('particles');
    if (canvas) {
        new GravitationalSingularity(canvas);
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
    `;
    document.head.appendChild(style);
});
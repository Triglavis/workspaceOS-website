// 3D Gravitational Singularity Implementation for WorkspaceOS
// Full 3D scene with gravitational distortion, orbiting apps, and particle system

// Check if running on localhost
const isLocalhost = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1' || 
                   window.location.hostname === '0.0.0.0' ||
                   window.location.hostname.includes('192.168') ||
                   window.location.port === '3000';

// Development flags - MUST be false in production
const DEV_FLAGS = {
    SHOW_CAMERA_CONTROLS: false  // Set to true during development to show camera controls
};

// Auto-enable dev features on localhost
if (isLocalhost) {
    console.log('🚀 Running on localhost - Press "C" to toggle camera controls');
    // Don't auto-enable, but allow toggling
}

class GravitationalSingularity {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.singularity = null;
        this.orbitingApps = [];
        this.particles = [];
        this.distortionMesh = null;
        this.clock = new THREE.Clock();
        this.mouseX = 0;
        this.mouseY = 0;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Camera control parameters
        this.cameraControlsEnabled = false;
        this.lookAtTarget = new THREE.Vector3(-14, 3.5, -20);
        this.cameraDistance = 21.5;
        this.defaultCameraPos = new THREE.Vector3(10.5, -5, 21.5);
        this.minZoom = 10;
        this.maxZoom = 80;
        
        // Initial zoom animation parameters
        this.initialZoomDistance = 55; // Start zoomed out
        this.finalZoomDistance = 21.5; // Final position
        this.zoomAnimationDuration = 2500; // 2.5 seconds
        this.zoomAnimationStartTime = null;
        this.isInitialZoomAnimating = true;
        
        // Gravitational parameters
        this.gravitationalConstant = 50;
        this.singularityMass = 100;
        this.distortionStrength = 0.5;
        
        this.init();
    }
    
    init() {
        // Create scene
        this.scene = new THREE.Scene();
        // Enhanced fog for bokeh-like depth effect
        this.scene.fog = new THREE.FogExp2(0x000000, 0.015); // Increased density for more pronounced depth
        
        // Setup camera - positioned to view right side
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        // Position camera with user's preferred view but start zoomed out for animation
        this.camera.position.x = this.defaultCameraPos.x;
        this.camera.position.y = this.defaultCameraPos.y;
        this.camera.position.z = this.initialZoomDistance; // Start zoomed out
        this.camera.lookAt(this.lookAtTarget);
        
        // Start the zoom animation
        this.zoomAnimationStartTime = Date.now();
        
        // Setup renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('gravitational-canvas'),
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
        this.renderer.setClearColor(0x000000, 0.95); // Slight opacity for subtle transparency
        
        // Create gravitational singularity
        this.createSingularity();
        
        // Remove background distortion mesh - no longer needed
        // this.createDistortionField();
        
        // Create background stars
        this.createBackgroundStars();
        // Removed particle system - distracting from clean aesthetic
        this.createDepthGrid();
        
        // Add ambient and point lighting
        this.setupLighting();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Start animation
        this.animate();
    }
    
    createSingularity() {
        // Create clean white sphere
        const geometry = new THREE.SphereGeometry(2, 64, 64);
        
        // Pure white material - use MeshStandardMaterial for proper emissive support
        const material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0xffffff,
            emissiveIntensity: 1,
            metalness: 0,
            roughness: 0
        });
        
        this.singularity = new THREE.Mesh(geometry, material);
        
        // Create subtle layered glow effects - much more subtle for greyscale aesthetic
        this.glowLayers = [];
        const glowSizes = [2.5, 4, 6];
        const glowOpacities = [0.2, 0.1, 0.05];
        
        glowSizes.forEach((size, index) => {
            const glowGeometry = new THREE.SphereGeometry(size, 32, 32);
            const glowMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    glowColor: { value: new THREE.Color(0xffffff) },
                    time: { value: 0.0 },
                    opacity: { value: glowOpacities[index] }
                },
                vertexShader: `
                    varying vec3 vNormal;
                    varying vec3 vWorldPosition;
                    varying vec3 vViewPosition;
                    
                    void main() {
                        vec4 modelPosition = modelMatrix * vec4(position, 1.0);
                        vec4 viewPosition = viewMatrix * modelPosition;
                        vec4 projectedPosition = projectionMatrix * viewPosition;
                        
                        gl_Position = projectedPosition;
                        
                        vNormal = normalize(normalMatrix * normal);
                        vWorldPosition = modelPosition.xyz;
                        vViewPosition = viewPosition.xyz;
                    }
                `,
                fragmentShader: `
                    uniform vec3 glowColor;
                    uniform float time;
                    uniform float opacity;
                    varying vec3 vNormal;
                    varying vec3 vWorldPosition;
                    varying vec3 vViewPosition;
                    
                    void main() {
                        // Very subtle distance-based falloff
                        float distance = length(vWorldPosition);
                        float falloff = 1.0 / (1.0 + distance * distance * 0.1);
                        
                        // Gentle fresnel rim lighting
                        vec3 viewDirection = normalize(-vViewPosition);
                        float fresnel = 1.0 - max(0.0, dot(vNormal, viewDirection));
                        fresnel = pow(fresnel, 3.0); // More concentrated at edges
                        
                        // Minimal pulsing - barely noticeable
                        float pulse = 0.98 + 0.02 * sin(time * 1.0);
                        
                        // Much more subtle final intensity
                        float finalIntensity = falloff * fresnel * pulse * opacity * 0.3;
                        
                        gl_FragColor = vec4(glowColor, finalIntensity);
                    }
                `,
                side: THREE.BackSide,
                blending: THREE.AdditiveBlending,
                transparent: true,
                depthWrite: false
            });
            
            const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
            this.singularity.add(glowMesh);
            this.glowLayers.push(glowMaterial);
        });
        
        // Store glow layers reference for updates (remove old single material reference)
        
        // Very subtle lighting to maintain greyscale aesthetic
        const mainLight = new THREE.PointLight(0xffffff, 1, 200, 0.8);
        mainLight.position.set(0, 0, 0);
        this.singularity.add(mainLight);
        
        // Create 3 asteroid belt rings with actual 3D asteroids using instancing
        const createAsteroidBelt = (radius, asteroidCount, tilt, orbitSpeed, thickness) => {
            const beltGroup = new THREE.Group();
            
            // Use same varied geometries for all belts
            const isDistant = radius > 15;
            const asteroidGeometries = [
                new THREE.IcosahedronGeometry(0.15, 0),   // 20 faces - spherical
                new THREE.OctahedronGeometry(0.18, 0),    // 8 faces - diamond
                new THREE.TetrahedronGeometry(0.2, 0),    // 4 faces - pyramid
                new THREE.BoxGeometry(0.15, 0.15, 0.15),  // 6 faces - cube
                new THREE.DodecahedronGeometry(0.12, 0)   // 12 faces - rounded
            ];
            
            // Use the first geometry as base for all asteroids (single instanced mesh)
            const mergedGeometry = asteroidGeometries[0].clone();
            
            // Create instanced mesh with consistent material for all belts
            const material = new THREE.MeshPhongMaterial({
                color: 0xffffff, // White base to let instance colors show through clearly
                emissive: 0x111111, // Darker emissive for more contrast
                shininess: 3, // Consistent shininess
                flatShading: true, // Gives low-poly look
                fog: true
            });
            
            const instancedMesh = new THREE.InstancedMesh(mergedGeometry, material, asteroidCount);
            instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // For animation
            
            // Store orbital data for each asteroid
            const asteroidData = [];
            const dummy = new THREE.Object3D();
            
            for (let i = 0; i < asteroidCount; i++) {
                const angle = (i / asteroidCount) * Math.PI * 2 + Math.random() * 0.2;
                const radiusVariation = radius + (Math.random() - 0.5) * thickness;
                const verticalOffset = (Math.random() - 0.5) * 0.5;
                
                // Random size variation - same for all belts
                const scale = 0.3 + Math.random() * 1.2;
                
                // Store data for animation
                asteroidData.push({
                    angle: angle,
                    radius: radiusVariation,
                    verticalOffset: verticalOffset,
                    rotationSpeed: {
                        x: (Math.random() - 0.5) * 0.002,  // 10x slower
                        y: (Math.random() - 0.5) * 0.002,  // 10x slower
                        z: (Math.random() - 0.5) * 0.002   // 10x slower
                    },
                    scale: scale,
                    wobble: Math.random() * Math.PI * 2
                });
                
                // Set initial position
                dummy.position.set(
                    Math.cos(angle) * radiusVariation,
                    verticalOffset,
                    Math.sin(angle) * radiusVariation
                );
                
                // Random rotation
                dummy.rotation.set(
                    Math.random() * Math.PI * 2,
                    Math.random() * Math.PI * 2,
                    Math.random() * Math.PI * 2
                );
                
                dummy.scale.set(scale, scale, scale);
                dummy.updateMatrix();
                instancedMesh.setMatrixAt(i, dummy.matrix);
            }
            
            // Apply color variations for more realism with darker greys
            const colors = [];
            for (let i = 0; i < asteroidCount; i++) {
                // Wider range of darker greys for better variation
                const baseGrey = 0.15 + Math.random() * 0.35; // Range from very dark (0.15) to medium grey (0.5)
                
                // Add subtle color tints for variety
                const tintChoice = Math.random();
                let r, g, b;
                
                if (tintChoice < 0.33) {
                    // Bluish grey (cooler asteroids)
                    r = baseGrey * 0.9;
                    g = baseGrey * 0.95;
                    b = baseGrey;
                } else if (tintChoice < 0.66) {
                    // Brownish grey (rocky asteroids)
                    r = baseGrey;
                    g = baseGrey * 0.9;
                    b = baseGrey * 0.85;
                } else {
                    // Pure grey (neutral asteroids)
                    r = baseGrey;
                    g = baseGrey;
                    b = baseGrey;
                }
                
                colors.push(r, g, b);
            }
            instancedMesh.instanceColor = new THREE.InstancedBufferAttribute(
                new Float32Array(colors), 3
            );
            
            instancedMesh.rotation.x = tilt;
            instancedMesh.userData = {
                asteroidData: asteroidData,
                orbitSpeed: orbitSpeed,
                dummy: dummy
            };
            
            beltGroup.add(instancedMesh);
            
            // Add some dust particles for atmosphere
            const dustGeometry = new THREE.BufferGeometry();
            const dustCount = asteroidCount * 2;
            const dustPositions = new Float32Array(dustCount * 3);
            
            for (let i = 0; i < dustCount; i++) {
                const angle = Math.random() * Math.PI * 2;
                const radiusVariation = radius + (Math.random() - 0.5) * thickness * 1.5;
                const verticalOffset = (Math.random() - 0.5) * 0.8;
                
                dustPositions[i * 3] = Math.cos(angle) * radiusVariation;
                dustPositions[i * 3 + 1] = verticalOffset;
                dustPositions[i * 3 + 2] = Math.sin(angle) * radiusVariation;
            }
            
            dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
            
            const dustMaterial = new THREE.PointsMaterial({
                size: 0.02,
                color: 0x666666,
                transparent: true,
                opacity: 0.3,
                sizeAttenuation: true,
                fog: true
            });
            
            const dust = new THREE.Points(dustGeometry, dustMaterial);
            dust.rotation.x = tilt;
            beltGroup.add(dust);
            
            return beltGroup;
        };
        
        // Create a group to hold the entire singularity system
        this.singularitySystem = new THREE.Group();
        // Position at 3/4 width (center of right half)
        this.singularitySystem.position.set(15, 0, 0);
        
        // Add 3 asteroid belts with 3D asteroids
        // Inner belt: dense with smaller asteroids
        const belt1 = createAsteroidBelt(8, 150, Math.PI * 0.1, 0.04, 4.0);
        // Middle belt: increased density
        const belt2 = createAsteroidBelt(14, 200, Math.PI * 0.15, -0.025, 3.0);
        // Outer belt: much denser for better visual
        const belt3 = createAsteroidBelt(20, 250, Math.PI * 0.2, 0.015, 2.0);
        
        // Add belts to the system group (not to singularity)
        this.singularitySystem.add(belt1);
        this.singularitySystem.add(belt2);
        this.singularitySystem.add(belt3);
        
        // Move singularity to center of system (0,0,0 relative to system)
        this.singularity.position.set(0, 0, 0);
        this.singularitySystem.add(this.singularity);
        
        // Add the entire system to the scene
        this.scene.add(this.singularitySystem);
        
        // Store belts for animation
        this.asteroidBelts = [belt1, belt2, belt3];
        
        // Initialize satellites array
        this.satellites = [];
    }
    
    // Method to launch a new satellite from button position
    addSatelliteAsteroid(buttonPosition = null) {
        if (!this.singularitySystem) return;
        
        console.log('🛰️ Creating realistic satellite with launch sequence');
        console.log('Button position provided:', buttonPosition);
        
        // Create satellite group to hold all components
        const satelliteGroup = new THREE.Group();
        
        // 1. Main body (central rectangular module) - realistic proportions
        const bodyGeometry = new THREE.BoxGeometry(0.6, 0.4, 0.8);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0xe8e8e8, // Light grey body
            metalness: 0.3,
            roughness: 0.7,
            fog: true
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        satelliteGroup.add(body);
        
        // 2. Solar panels (thin rectangles on sides) - larger and more realistic
        const panelGeometry = new THREE.BoxGeometry(1.4, 0.08, 0.7);
        const panelMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e, // Dark blue-grey solar panels
            metalness: 0.8,
            roughness: 0.2,
            fog: true
        });
        
        // Left solar panel
        const leftPanel = new THREE.Mesh(panelGeometry, panelMaterial);
        leftPanel.position.set(-1.0, 0, 0);
        satelliteGroup.add(leftPanel);
        
        // Right solar panel
        const rightPanel = new THREE.Mesh(panelGeometry, panelMaterial);
        rightPanel.position.set(1.0, 0, 0);
        satelliteGroup.add(rightPanel);
        
        // 3. Communication dish (parabolic dish)
        const dishGeometry = new THREE.SphereGeometry(0.12, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.5);
        const dishMaterial = new THREE.MeshStandardMaterial({
            color: 0xf0f0f0,
            metalness: 0.9,
            roughness: 0.1,
            fog: true
        });
        const dish = new THREE.Mesh(dishGeometry, dishMaterial);
        dish.position.set(0, 0.15, 0.2);
        dish.rotation.x = -Math.PI * 0.3; // Angle the dish
        satelliteGroup.add(dish);
        
        // 4. Multiple antennas for realism
        const antennaGeometry = new THREE.CylinderGeometry(0.008, 0.008, 0.2, 6);
        const antennaMaterial = new THREE.MeshStandardMaterial({
            color: 0x888888,
            metalness: 0.7,
            roughness: 0.3,
            fog: true
        });
        
        // Main antenna
        const antenna1 = new THREE.Mesh(antennaGeometry, antennaMaterial);
        antenna1.position.set(0, 0.25, -0.15);
        satelliteGroup.add(antenna1);
        
        // Side antenna
        const antenna2 = new THREE.Mesh(antennaGeometry, antennaMaterial);
        antenna2.position.set(0.15, 0.2, 0.1);
        antenna2.rotation.z = Math.PI * 0.1;
        satelliteGroup.add(antenna2);
        
        // 5. Blinking light (small sphere with emissive material) - use MeshStandardMaterial
        const lightGeometry = new THREE.SphereGeometry(0.08, 8, 6); // Make it more visible
        const lightMaterial = new THREE.MeshStandardMaterial({
            color: 0xff3333,
            emissive: 0xff0000,
            emissiveIntensity: 0.8,
            metalness: 0.1,
            roughness: 0.3,
            fog: true
        });
        const blinkingLight = new THREE.Mesh(lightGeometry, lightMaterial);
        blinkingLight.position.set(0, 0.15, -0.2);
        satelliteGroup.add(blinkingLight);
        
        // Start from a visible position near the button area
        let launchPosition = new THREE.Vector3(-15, -8, 30); // Start from left side, visible position
        
        if (buttonPosition) {
            console.log(`🗺️ Button screen position: (${buttonPosition.x}, ${buttonPosition.y})`);
            
            // Use a simpler approach - position relative to screen but keep it visible
            // Button is typically on left side of screen, so start from left side of 3D scene
            launchPosition.x = -15 + (buttonPosition.x / window.innerWidth) * 10; // Left side, slight adjustment
            launchPosition.y = -8 + (1 - buttonPosition.y / window.innerHeight) * 6; // Bottom area
            launchPosition.z = 30; // Start well in front of camera
            
            console.log(`🚀 Simplified 3D Launch position: (${launchPosition.x.toFixed(1)}, ${launchPosition.y.toFixed(1)}, ${launchPosition.z.toFixed(1)})`);
        }
        
        // Position satellite at launch point
        satelliteGroup.position.copy(launchPosition);
        console.log(`🛰️ Satellite positioned at: (${satelliteGroup.position.x.toFixed(1)}, ${satelliteGroup.position.y.toFixed(1)}, ${satelliteGroup.position.z.toFixed(1)})`);
        
        // Calculate target orbital position
        const targetAngle = Math.random() * Math.PI * 2;
        const targetRadius = 14 + (Math.random() - 0.5) * 2;
        const targetVerticalOffset = (Math.random() - 0.5) * 0.3;
        
        const targetPosition = new THREE.Vector3(
            15 + Math.cos(targetAngle) * targetRadius, // Singularity at (15, 0, 0)
            targetVerticalOffset,
            Math.sin(targetAngle) * targetRadius
        );
        console.log(`🎯 Target position: (${targetPosition.x.toFixed(1)}, ${targetPosition.y.toFixed(1)}, ${targetPosition.z.toFixed(1)})`);
        
        // Store launch and orbital data
        satelliteGroup.userData = {
            // Launch phase data
            isLaunching: true,
            launchStartTime: Date.now(),
            launchDuration: 8000, // 8 second launch sequence - much slower
            launchStartPosition: launchPosition.clone(),
            targetPosition: targetPosition.clone(),
            
            // Orbital phase data
            angle: targetAngle,
            radius: targetRadius,
            verticalOffset: targetVerticalOffset,
            orbitSpeed: -0.025,
            rotationSpeed: {
                x: 0.001,
                y: 0.002,
                z: 0.0005
            },
            isSatellite: true,
            spawnTime: Date.now(),
            blinkingLight: blinkingLight,
            blinkPhase: Math.random() * Math.PI * 2
        };
        
        // Add to singularity system
        this.singularitySystem.add(satelliteGroup);
        console.log('🔧 Satellite added to singularitySystem, which has', this.singularitySystem.children.length, 'children');
        
        // Store reference for animation
        if (!this.satellites) {
            this.satellites = [];
        }
        this.satellites.push(satelliteGroup);
        
        console.log(`🛰️ Realistic satellite launched! Total satellites: ${this.satellites.length}`);
        console.log(`🎯 Satellite world position:`, satelliteGroup.position);
        
        // Force update the satellite material to be more visible
        satelliteGroup.traverse((child) => {
            if (child.isMesh) {
                child.material.transparent = false;
                child.material.opacity = 1.0;
                if (child.material.emissive) {
                    child.material.emissive.setHex(0xff0000);
                    child.material.emissiveIntensity = 2.0;
                }
            }
        });
    }
    
    createDistortionField() {
        // Create background mesh with distortion shader
        const distortionShader = {
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vPosition;
                uniform float time;
                uniform vec2 mouse;
                uniform float distortionStrength;
                
                void main() {
                    vUv = uv;
                    vPosition = position;
                    
                    // Calculate distance from center
                    float dist = length(position.xy);
                    
                    // Apply gravitational warping to vertices
                    vec3 newPosition = position;
                    float warpStrength = 1.0 / (1.0 + dist * 0.1);
                    
                    // Create spiral distortion
                    float angle = atan(position.y, position.x);
                    float spiral = sin(angle * 3.0 - time * 0.5 + dist * 0.5) * warpStrength * distortionStrength;
                    
                    newPosition.x += cos(angle) * spiral;
                    newPosition.y += sin(angle) * spiral;
                    newPosition.z += sin(dist * 0.5 - time) * warpStrength * 2.0;
                    
                    // Add mouse influence
                    vec2 mouseOffset = position.xy - mouse * 10.0;
                    float mouseDistance = length(mouseOffset);
                    newPosition.xy += normalize(mouseOffset) * (1.0 / (1.0 + mouseDistance)) * 2.0;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                varying vec2 vUv;
                varying vec3 vPosition;
                
                void main() {
                    // Create warped grid pattern
                    float gridX = sin(vPosition.x * 2.0 + time * 0.5) * 0.5 + 0.5;
                    float gridY = sin(vPosition.y * 2.0 + time * 0.5) * 0.5 + 0.5;
                    float grid = gridX * gridY;
                    
                    // Distance-based fade
                    float dist = length(vPosition.xy);
                    float fade = 1.0 / (1.0 + dist * 0.05);
                    
                    vec3 color = vec3(0.1, 0.15, 0.3) * grid * fade;
                    
                    gl_FragColor = vec4(color, 0.3);
                }
            `,
            uniforms: {
                time: { value: 0 },
                mouse: { value: new THREE.Vector2(0, 0) },
                distortionStrength: { value: this.distortionStrength }
            }
        };
        
        const geometry = new THREE.PlaneGeometry(100, 100, 50, 50);
        const material = new THREE.ShaderMaterial({
            ...distortionShader,
            transparent: true,
            depthWrite: false
        });
        
        this.distortionMesh = new THREE.Mesh(geometry, material);
        this.distortionMesh.position.z = -10;
        this.scene.add(this.distortionMesh);
    }
    
    createBackgroundStars() {
        // Create distant star field with twinkling
        const starCount = 1500;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);
        const twinkleSpeed = new Float32Array(starCount);
        const twinkleOffset = new Float32Array(starCount);
        
        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            
            // Place stars in far background sphere
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const radius = 150 + Math.random() * 200;
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = -50 - Math.random() * 150;
            
            // Pure white to slight blue tint
            const brightness = 0.8 + Math.random() * 0.2;
            colors[i3] = brightness;
            colors[i3 + 1] = brightness;
            colors[i3 + 2] = brightness + Math.random() * 0.1;
            
            // Random star sizes
            sizes[i] = Math.random() * 1.5 + 0.3;
            
            // Random twinkle parameters
            twinkleSpeed[i] = 1 + Math.random() * 3;
            twinkleOffset[i] = Math.random() * Math.PI * 2;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const material = new THREE.PointsMaterial({
            size: 0.8,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: false,
            fog: false
        });
        
        this.backgroundStars = new THREE.Points(geometry, material);
        this.starTwinkleData = { twinkleSpeed, twinkleOffset, baseSizes: new Float32Array(sizes) };
        this.scene.add(this.backgroundStars);
    }
    
    createDepthGrid() {
        // Create reference grid planes at different depths
        const createGridPlane = (z, opacity, scale) => {
            const geometry = new THREE.PlaneGeometry(200 * scale, 200 * scale, 20, 20);
            const material = new THREE.MeshBasicMaterial({
                color: 0x111133,
                wireframe: true,
                transparent: true,
                opacity: opacity,
                fog: true
            });
            const plane = new THREE.Mesh(geometry, material);
            plane.position.z = z;
            return plane;
        };
        
        // Add multiple grid planes for depth reference
        this.depthGrids = [];
        this.depthGrids.push(createGridPlane(-100, 0.05, 2));
        this.depthGrids.push(createGridPlane(-60, 0.08, 1.5));
        this.depthGrids.push(createGridPlane(-30, 0.1, 1));
        
        this.depthGrids.forEach(grid => this.scene.add(grid));
    }
    
    // Particle system removed for cleaner aesthetic
    
    /* createParticleSystem() {
        const particleCount = 500;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        const opacities = new Float32Array(particleCount);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Spawn particles from behind camera (positive Z) with wider spread
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const radius = 30 + Math.random() * 40;
            
            // Position behind and around camera
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = 45 + Math.random() * 20; // Behind camera (camera is at z=39.5)
            
            // Initial velocities toward singularity
            velocities[i3] = (Math.random() - 0.5) * 0.05;
            velocities[i3 + 1] = (Math.random() - 0.5) * 0.05;
            velocities[i3 + 2] = -Math.random() * 0.1 - 0.05; // Moving forward
            
            // Colors (pure white for star effect)
            colors[i3] = 1.0;
            colors[i3 + 1] = 1.0;
            colors[i3 + 2] = 1.0;
            
            // Smaller sizes
            sizes[i] = Math.random() * 0.2 + 0.05;
            
            // Initial opacity (will fade in)
            opacities[i] = 0.0;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        geometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));
        
        // Custom shader for star-shaped particles with bokeh
        const starShader = {
            vertexShader: `
                attribute float size;
                attribute float opacity;
                varying vec3 vColor;
                varying float vSize;
                varying float vDistance;
                varying float vOpacity;
                
                void main() {
                    vColor = color;
                    vOpacity = opacity;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    vDistance = -mvPosition.z;
                    
                    // Size based on distance for bokeh effect
                    float bokehSize = size * (300.0 / vDistance);
                    vSize = bokehSize;
                    
                    gl_PointSize = bokehSize * 10.0;
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vSize;
                varying float vDistance;
                varying float vOpacity;
                
                void main() {
                    vec2 uv = gl_PointCoord - 0.5;
                    float dist = length(uv);
                    
                    // Create star shape for close particles, simple dots for far
                    float alpha = 0.0;
                    
                    if (vDistance < 20.0) {
                        // Close: star-shaped with rays
                        float angle = atan(uv.y, uv.x);
                        float rays = sin(angle * 4.0) * 0.2 + 0.8;
                        alpha = 1.0 - smoothstep(0.0, 0.5 * rays, dist);
                        
                        // Add center bright spot
                        alpha += exp(-dist * 10.0) * 0.5;
                    } else if (vDistance < 40.0) {
                        // Medium: soft bokeh circle
                        alpha = 1.0 - smoothstep(0.2, 0.5, dist);
                        alpha *= exp(-dist * 3.0);
                    } else {
                        // Far: simple square/dot
                        alpha = 1.0 - smoothstep(0.3, 0.5, dist);
                    }
                    
                    // Fade based on distance
                    alpha *= min(1.0, 50.0 / vDistance);
                    
                    // Apply particle opacity for fade-in effect with depth fog
                    float depthFade = exp(-vDistance * 0.02);
                    gl_FragColor = vec4(vColor * (0.5 + depthFade * 0.5), alpha * vOpacity * 0.3 * depthFade);
                }
            `,
            uniforms: {}
        };
        
        const material = new THREE.ShaderMaterial({
            ...starShader,
            vertexColors: true,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        this.particleSystem = new THREE.Points(geometry, material);
        this.particleVelocities = velocities;
        this.particleOpacities = opacities;
        this.scene.add(this.particleSystem);
    } */
    
    setupLighting() {
        // Softer ambient light to reduce harsh shadows
        const ambientLight = new THREE.AmbientLight(0x202030, 0.3);
        this.scene.add(ambientLight);
        
        // Remove duplicate point light (already in singularity)
        // Point lights are now attached to the singularity itself
        
        // Soft directional light for overall illumination
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
        directionalLight.position.set(10, 10, 10);
        this.scene.add(directionalLight);
        
        // Add hemisphere light for natural lighting
        const hemisphereLight = new THREE.HemisphereLight(0x404060, 0x000000, 0.3);
        this.scene.add(hemisphereLight);
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('click', (e) => this.onMouseClick(e));
        window.addEventListener('wheel', (e) => this.onMouseWheel(e), { passive: false });
        
        // Add keyboard listener for localhost dev controls and zoom
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        
        // Camera control listeners
        this.setupCameraControls();
    }
    
    onKeyDown(event) {
        // Toggle camera controls with 'C' key on localhost
        if (isLocalhost && (event.key === 'c' || event.key === 'C')) {
            const controlsDiv = document.querySelector('.camera-controls');
            if (controlsDiv) {
                const isVisible = controlsDiv.style.display !== 'none';
                controlsDiv.style.display = isVisible ? 'none' : 'block';
                console.log(`Camera controls ${isVisible ? 'hidden' : 'shown'}`);
            }
        }
        
        // Zoom controls with +/- or =/- keys
        if (event.key === '+' || event.key === '=') {
            this.isInitialZoomAnimating = false; // Stop initial animation when manually zooming
            this.cameraDistance = Math.max(this.minZoom, this.cameraDistance - 2);
            this.camera.position.z = this.cameraDistance;
            // Update slider if visible
            const camZ = document.getElementById('cam-z');
            const camZValue = document.getElementById('cam-z-value');
            if (camZ && camZValue) {
                camZ.value = this.cameraDistance;
                camZValue.textContent = this.cameraDistance.toFixed(1);
            }
        } else if (event.key === '-' || event.key === '_') {
            this.isInitialZoomAnimating = false; // Stop initial animation when manually zooming
            this.cameraDistance = Math.min(this.maxZoom, this.cameraDistance + 2);
            this.camera.position.z = this.cameraDistance;
            // Update slider if visible
            const camZ = document.getElementById('cam-z');
            const camZValue = document.getElementById('cam-z-value');
            if (camZ && camZValue) {
                camZ.value = this.cameraDistance;
                camZValue.textContent = this.cameraDistance.toFixed(1);
            }
        }
    }
    
    onMouseWheel(event) {
        // Only allow zoom on localhost when camera controls are visible
        const controlsDiv = document.querySelector('.camera-controls');
        const isControlsVisible = controlsDiv && controlsDiv.style.display !== 'none';
        
        if (isLocalhost && isControlsVisible) {
            event.preventDefault();
            this.isInitialZoomAnimating = false; // Stop initial animation when manually zooming
            
            // Zoom with mouse wheel
            const delta = event.deltaY * 0.01;
            this.cameraDistance = Math.max(this.minZoom, Math.min(this.maxZoom, this.cameraDistance + delta));
            
            // Update camera Z position
            this.camera.position.z = this.cameraDistance;
            
            // Update camera control slider if visible
            const camZ = document.getElementById('cam-z');
            const camZValue = document.getElementById('cam-z-value');
            if (camZ && camZValue) {
                camZ.value = this.cameraDistance;
                camZValue.textContent = this.cameraDistance.toFixed(1);
            }
        }
    }
    
    setupCameraControls() {
        // Hide camera controls if not in dev mode (but allow toggle on localhost)
        const controlsDiv = document.querySelector('.camera-controls');
        if (controlsDiv) {
            // On localhost, start hidden but allow toggle with 'C' key
            // On production, always hide if flag is false
            if (!DEV_FLAGS.SHOW_CAMERA_CONTROLS && !isLocalhost) {
                controlsDiv.style.display = 'none';
                return;
            } else if (isLocalhost && !DEV_FLAGS.SHOW_CAMERA_CONTROLS) {
                // On localhost, hide by default but still set up controls
                controlsDiv.style.display = 'none';
            }
        }
        
        const camX = document.getElementById('cam-x');
        const camY = document.getElementById('cam-y');
        const camZ = document.getElementById('cam-z');
        const lookX = document.getElementById('look-x');
        const lookY = document.getElementById('look-y');
        const lookZ = document.getElementById('look-z');
        const resetBtn = document.getElementById('reset-camera');
        
        const camXValue = document.getElementById('cam-x-value');
        const camYValue = document.getElementById('cam-y-value');
        const camZValue = document.getElementById('cam-z-value');
        const lookXValue = document.getElementById('look-x-value');
        const lookYValue = document.getElementById('look-y-value');
        const lookZValue = document.getElementById('look-z-value');
        
        if (!camX) return; // Controls not found
        
        // Enable camera controls when user interacts
        const enableControls = () => {
            this.cameraControlsEnabled = true;
            this.isInitialZoomAnimating = false; // Stop initial zoom when manually controlling
        };
        
        camX.addEventListener('input', (e) => {
            enableControls();
            this.camera.position.x = parseFloat(e.target.value);
            camXValue.textContent = e.target.value;
        });
        
        camY.addEventListener('input', (e) => {
            enableControls();
            this.camera.position.y = parseFloat(e.target.value);
            camYValue.textContent = e.target.value;
        });
        
        camZ.addEventListener('input', (e) => {
            enableControls();
            const value = parseFloat(e.target.value);
            this.camera.position.z = value;
            this.cameraDistance = value; // Keep zoom in sync
            camZValue.textContent = e.target.value;
        });
        
        lookX.addEventListener('input', (e) => {
            enableControls();
            this.lookAtTarget.x = parseFloat(e.target.value);
            lookXValue.textContent = e.target.value;
        });
        
        lookY.addEventListener('input', (e) => {
            enableControls();
            this.lookAtTarget.y = parseFloat(e.target.value);
            lookYValue.textContent = e.target.value;
        });
        
        lookZ.addEventListener('input', (e) => {
            enableControls();
            this.lookAtTarget.z = parseFloat(e.target.value);
            lookZValue.textContent = e.target.value;
        });
        
        resetBtn.addEventListener('click', () => {
            this.cameraControlsEnabled = false;
            
            // Reset camera distance
            this.cameraDistance = 21.5;
            
            // Reset sliders to preferred values
            camX.value = 10.5;
            camY.value = -5;
            camZ.value = 21.5;
            lookX.value = -14;
            lookY.value = 3.5;
            lookZ.value = -20;
            
            // Reset display values
            camXValue.textContent = '10.5';
            camYValue.textContent = '-5';
            camZValue.textContent = '21.5';
            lookXValue.textContent = '-14';
            lookYValue.textContent = '3.5';
            lookZValue.textContent = '-20';
            
            // Reset camera to preferred view and restart zoom animation
            this.camera.position.x = this.defaultCameraPos.x;
            this.camera.position.y = this.defaultCameraPos.y;
            this.camera.position.z = this.initialZoomDistance; // Start zoomed out again
            this.lookAtTarget.set(-14, 3.5, -20);
            this.cameraDistance = this.finalZoomDistance;
            this.isInitialZoomAnimating = true;
            this.zoomAnimationStartTime = Date.now();
        });
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    onMouseMove(event) {
        this.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        this.mouse.x = this.mouseX;
        this.mouse.y = this.mouseY;
    }
    
    onMouseClick(event) {
        // Check for app interactions
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(
            this.orbitingApps.map(app => app.sphere)
        );
        
        if (intersects.length > 0) {
            const clickedApp = this.orbitingApps.find(
                app => app.sphere === intersects[0].object
            );
            if (clickedApp) {
                // Create ripple effect
                this.createRipple(clickedApp.group.position);
            }
        }
    }
    
    createRipple(position) {
        const rippleGeometry = new THREE.RingGeometry(0.1, 0.5, 32);
        const rippleMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 1,
            side: THREE.DoubleSide
        });
        const ripple = new THREE.Mesh(rippleGeometry, rippleMaterial);
        ripple.position.copy(position);
        ripple.lookAt(this.camera.position);
        this.scene.add(ripple);
        
        // Animate ripple
        const animateRipple = () => {
            ripple.scale.x += 0.3;
            ripple.scale.y += 0.3;
            rippleMaterial.opacity -= 0.02;
            
            if (rippleMaterial.opacity > 0) {
                requestAnimationFrame(animateRipple);
            } else {
                this.scene.remove(ripple);
            }
        };
        animateRipple();
    }
    
    /* updateGravitationalPhysics(deltaTime) {
        // Update particle system with gravitational pull
        const positions = this.particleSystem.geometry.attributes.position.array;
        const opacities = this.particleSystem.geometry.attributes.opacity.array;
        
        // Get singularity world position
        const singularityWorldPos = new THREE.Vector3();
        this.singularity.getWorldPosition(singularityWorldPos);
        
        for (let i = 0, opacityIndex = 0; i < positions.length; i += 3, opacityIndex++) {
            const x = positions[i] - singularityWorldPos.x;
            const y = positions[i + 1] - singularityWorldPos.y;
            const z = positions[i + 2] - singularityWorldPos.z;
            
            // Calculate distance to singularity
            const distance = Math.sqrt(x * x + y * y + z * z);
            
            // Fade in particles as they enter view with depth-based opacity
            const targetOpacity = Math.max(0.2, Math.min(1.0, (50 - distance) / 50));
            if (positions[i + 2] < 45) {
                opacities[opacityIndex] = Math.min(targetOpacity, opacities[opacityIndex] + deltaTime * 0.5);
            }
            
            if (distance > 0.5) {
                // Apply gravitational acceleration with stronger pull
                const force = (this.gravitationalConstant * this.singularityMass * 0.3) / (distance * distance);
                const acceleration = force / distance;
                
                // Update velocities with stronger attraction
                this.particleVelocities[i] -= (x / distance) * acceleration * deltaTime * 0.2;
                this.particleVelocities[i + 1] -= (y / distance) * acceleration * deltaTime * 0.2;
                this.particleVelocities[i + 2] -= (z / distance) * acceleration * deltaTime * 0.2;
                
                // Add swirling motion
                const tangentX = -y / distance;
                const tangentY = x / distance;
                this.particleVelocities[i] += tangentX * 0.02 * deltaTime;
                this.particleVelocities[i + 1] += tangentY * 0.02 * deltaTime;
                
                // Update positions
                positions[i] += this.particleVelocities[i];
                positions[i + 1] += this.particleVelocities[i + 1];
                positions[i + 2] += this.particleVelocities[i + 2];
                
                // Reset particles that get too close or go behind camera too far
                if (distance < 2 || positions[i + 2] > 65) {
                    // Respawn from behind camera
                    const theta = Math.random() * Math.PI * 2;
                    const phi = Math.random() * Math.PI * 0.5 + Math.PI * 0.25; // Narrower cone
                    const newRadius = 20 + Math.random() * 25;
                    
                    positions[i] = newRadius * Math.sin(phi) * Math.cos(theta);
                    positions[i + 1] = newRadius * Math.sin(phi) * Math.sin(theta);
                    positions[i + 2] = 50 + Math.random() * 15; // Behind camera
                    
                    // Reset velocities toward singularity
                    this.particleVelocities[i] = -positions[i] * 0.01;
                    this.particleVelocities[i + 1] = -positions[i + 1] * 0.01;
                    this.particleVelocities[i + 2] = -Math.random() * 0.2 - 0.1;
                    
                    // Reset opacity for fade-in
                    opacities[opacityIndex] = 0.0;
                }
            }
        }
        
        this.particleSystem.geometry.attributes.position.needsUpdate = true;
        this.particleSystem.geometry.attributes.opacity.needsUpdate = true;
    } */
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const deltaTime = this.clock.getDelta();
        const elapsedTime = this.clock.getElapsedTime();
        
        // Update glow shaders with current time
        if (this.glowLayers) {
            this.glowLayers.forEach(glowMaterial => {
                glowMaterial.uniforms.time.value = elapsedTime;
            });
        }
        
        // Handle initial zoom animation
        if (this.isInitialZoomAnimating && this.zoomAnimationStartTime) {
            const elapsed = Date.now() - this.zoomAnimationStartTime;
            const progress = Math.min(elapsed / this.zoomAnimationDuration, 1);
            
            // Use ease-out-cubic for fast-then-slow effect
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            
            // Interpolate camera distance
            const currentDistance = this.initialZoomDistance + 
                (this.finalZoomDistance - this.initialZoomDistance) * easeOutCubic;
            
            this.camera.position.z = currentDistance;
            this.cameraDistance = currentDistance; // Keep internal state in sync
            
            // Update camera control slider if visible
            const camZ = document.getElementById('cam-z');
            const camZValue = document.getElementById('cam-z-value');
            if (camZ && camZValue) {
                camZ.value = currentDistance;
                camZValue.textContent = currentDistance.toFixed(1);
            }
            
            // Stop animating when complete
            if (progress >= 1) {
                this.isInitialZoomAnimating = false;
                this.cameraDistance = this.finalZoomDistance;
            }
        }
        
        // Update singularity
        if (this.singularity) {
            // Slow, subtle rotation
            this.singularity.rotation.y += 0.001;
            
            // Keep scale constant - no pulsing for realistic sun
            this.singularity.scale.set(1, 1, 1);
            
            // Animate asteroid belts with instanced mesh
            if (this.asteroidBelts) {
                this.asteroidBelts.forEach((beltGroup) => {
                    // Get the instanced mesh (first child)
                    const instancedMesh = beltGroup.children[0];
                    if (instancedMesh && instancedMesh.isInstancedMesh) {
                        const { asteroidData, orbitSpeed, dummy } = instancedMesh.userData;
                        
                        // Performance optimization: Update fewer asteroids per frame for distant belts
                        const beltRadius = asteroidData[0] ? asteroidData[0].radius : 10;
                        const updateFrequency = beltRadius > 15 ? 2 : 1; // Update every other frame for distant asteroids
                        const frameCount = Math.floor(elapsedTime * 60); // Approximate frame count
                        
                        asteroidData.forEach((data, i) => {
                            // Skip some updates for distant asteroids (performance optimization)
                            if (data.radius > 15 && (i + frameCount) % updateFrequency !== 0) {
                                return; // Skip this asteroid this frame
                            }
                            
                            // Calculate orbital position
                            const currentAngle = data.angle + elapsedTime * orbitSpeed;
                            
                            // Add slight wobble for realism
                            const wobbleY = Math.sin(elapsedTime * 2 + data.wobble) * 0.05;
                            
                            dummy.position.set(
                                Math.cos(currentAngle) * data.radius,
                                data.verticalOffset + wobbleY,
                                Math.sin(currentAngle) * data.radius
                            );
                            
                            // Tumble rotation - slower for distant asteroids
                            const rotationMultiplier = data.radius > 15 ? 0.5 : 1.0;
                            dummy.rotation.x += data.rotationSpeed.x * rotationMultiplier;
                            dummy.rotation.y += data.rotationSpeed.y * rotationMultiplier;
                            dummy.rotation.z += data.rotationSpeed.z * rotationMultiplier;
                            
                            dummy.scale.set(data.scale, data.scale, data.scale);
                            dummy.updateMatrix();
                            instancedMesh.setMatrixAt(i, dummy.matrix);
                        });
                        
                        instancedMesh.instanceMatrix.needsUpdate = true;
                    }
                });
            }
            
            // Animate individual satellites with launch sequence
            if (this.satellites) {
                this.satellites.forEach((satellite) => {
                    const data = satellite.userData;
                    if (data.isSatellite) {
                        
                        // Handle launch phase
                        if (data.isLaunching) {
                            const launchElapsed = Date.now() - data.launchStartTime;
                            const launchProgress = Math.min(launchElapsed / data.launchDuration, 1);
                            
                            // Use ease-out cubic for realistic rocket launch feel
                            const easeOutCubic = 1 - Math.pow(1 - launchProgress, 3);
                            
                            // Interpolate position from launch point to target
                            const currentPos = data.launchStartPosition.clone().lerp(data.targetPosition, easeOutCubic);
                            satellite.position.copy(currentPos);
                            
                            // Add some launch rotation for realism
                            satellite.rotation.z = launchProgress * Math.PI * 0.5;
                            
                            // Check if launch is complete
                            if (launchProgress >= 1) {
                                data.isLaunching = false;
                                console.log('🎯 Satellite reached orbit!');
                                
                                // Reset rotation for orbital phase
                                satellite.rotation.set(0, 0, 0);
                            }
                        } else {
                            // Orbital phase - normal asteroid belt behavior
                            const currentAngle = data.angle + elapsedTime * data.orbitSpeed;
                            
                            // Add slight wobble
                            const wobbleY = Math.sin(elapsedTime * 2 + (data.spawnTime * 0.001)) * 0.05;
                            
                            // Position relative to singularity system center (15, 0, 0)
                            satellite.position.set(
                                15 + Math.cos(currentAngle) * data.radius,
                                data.verticalOffset + wobbleY,
                                Math.sin(currentAngle) * data.radius
                            );
                            
                            // Realistic slow tumble rotation
                            satellite.rotation.x += data.rotationSpeed.x;
                            satellite.rotation.y += data.rotationSpeed.y;
                            satellite.rotation.z += data.rotationSpeed.z;
                        }
                        
                        // Animate blinking light (works in both phases)
                        if (data.blinkingLight) {
                            const blinkTime = elapsedTime * 3 + data.blinkPhase;
                            
                            // Alternate between red and off
                            if (Math.sin(blinkTime) > 0.7) {
                                data.blinkingLight.material.emissive.setRGB(1, 0.1, 0.1); // Bright red
                                data.blinkingLight.material.emissiveIntensity = 1.2;
                            } else if (Math.sin(blinkTime) < -0.7) {
                                data.blinkingLight.material.emissive.setRGB(0, 0, 0); // Off
                                data.blinkingLight.material.emissiveIntensity = 0;
                            } else {
                                data.blinkingLight.material.emissive.setRGB(0.5, 0, 0); // Dim red
                                data.blinkingLight.material.emissiveIntensity = 0.3;
                            }
                        }
                    }
                });
            }
        }
        
        // Removed gravitational physics update - no longer needed without particle system
        
        // Animate depth grids for parallax effect
        if (this.depthGrids) {
            this.depthGrids.forEach((grid, index) => {
                grid.rotation.z = elapsedTime * 0.01 * (index + 1);
                grid.position.x = Math.sin(elapsedTime * 0.05) * 5 * (index + 1);
                grid.position.y = Math.cos(elapsedTime * 0.03) * 3 * (index + 1);
            });
        }
        
        // Animate background stars with twinkling
        if (this.backgroundStars && this.starTwinkleData) {
            const sizes = this.backgroundStars.geometry.attributes.size.array;
            const { twinkleSpeed, twinkleOffset, baseSizes } = this.starTwinkleData;
            
            for (let i = 0; i < sizes.length; i++) {
                // Create twinkling effect
                const twinkle = Math.sin(elapsedTime * twinkleSpeed[i] + twinkleOffset[i]) * 0.3 + 0.7;
                sizes[i] = baseSizes[i] * twinkle;
            }
            
            this.backgroundStars.geometry.attributes.size.needsUpdate = true;
            
            // Very slow rotation for subtle movement
            this.backgroundStars.rotation.y = elapsedTime * 0.001;
        }
        
        // Camera movement - only if controls are not being used
        if (!this.cameraControlsEnabled && !this.isInitialZoomAnimating) {
            // Keep camera completely still - no drift (but not during initial zoom)
            this.camera.position.x = this.defaultCameraPos.x;
            this.camera.position.y = this.defaultCameraPos.y;
            this.camera.position.z = this.cameraDistance;
        } else {
            // When manually controlling, update sliders if they exist
            const camX = document.getElementById('cam-x');
            const camY = document.getElementById('cam-y');
            const camXValue = document.getElementById('cam-x-value');
            const camYValue = document.getElementById('cam-y-value');
            
            if (camX && !camX.matches(':focus')) {
                camX.value = this.camera.position.x;
                if (camXValue) camXValue.textContent = this.camera.position.x.toFixed(1);
            }
            if (camY && !camY.matches(':focus')) {
                camY.value = this.camera.position.y;
                if (camYValue) camYValue.textContent = this.camera.position.y.toFixed(1);
            }
        }
        
        // Always look at the target (whether controlled or not)
        this.camera.lookAt(this.lookAtTarget);
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if Three.js is loaded
    if (typeof THREE !== 'undefined') {
        // Hide ALL old visual elements first
        const oldParticles = document.getElementById('particles');
        if (oldParticles) {
            oldParticles.style.display = 'none';
        }
        
        const canvasWrapper = document.querySelector('.canvas-wrapper');
        if (canvasWrapper) {
            canvasWrapper.style.display = 'none';
        }
        
        const oldOrbitSystem = document.querySelector('.orbit-system');
        if (oldOrbitSystem) {
            oldOrbitSystem.style.display = 'none';
        }
        
        const heroVisual = document.querySelector('.hero-visual');
        if (heroVisual) {
            heroVisual.style.display = 'none';
        }
        
        // Add canvas element for 3D scene - contained within hero section
        const canvas = document.createElement('canvas');
        canvas.id = 'gravitational-canvas';
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '0';
        canvas.style.pointerEvents = 'auto';
        
        // Insert into hero section
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
            heroSection.insertBefore(canvas, heroSection.firstChild);
        }
        
        // Initialize the gravitational singularity
        window.gravitationalSingularity = new GravitationalSingularity();
    } else {
        console.error('Three.js not loaded. Please ensure three.min.js is included.');
    }
});
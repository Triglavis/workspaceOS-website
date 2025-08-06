// WorkspaceOS Gravitational Pull Effect

class GravitationalField {
    constructor(canvas) {
        // Check if 3D system should be active
        if (typeof THREE !== 'undefined' && document.querySelector('#gravitational-canvas')) {
            console.log('3D gravitational system active, disabling 2D particle system');
            return;
        }
        
        console.log('🌟 Initializing 2D gravitational system...');
        
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
            
            if (distance < fadeDistance && !particle.isSatellite) {
                opacity *= (distance / fadeDistance);
            }
            
            // Different rendering for satellites
            if (particle.isSatellite) {
                // Satellite glow effect
                const gradient = this.ctx.createRadialGradient(
                    particle.x, particle.y, 0,
                    particle.x, particle.y, particle.size * 3
                );
                gradient.addColorStop(0, `rgba(100, 200, 255, ${opacity})`);
                gradient.addColorStop(0.5, `rgba(100, 200, 255, ${opacity * 0.5})`);
                gradient.addColorStop(1, `rgba(100, 200, 255, 0)`);
                
                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Satellite core
                this.ctx.fillStyle = `rgba(150, 220, 255, ${opacity})`;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                // Regular particle
                this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
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
        this.emailInput = this.form?.querySelector('input[type="email"]');
        this.button = this.form?.querySelector('.btn-primary');
        this.originalButtonHTML = this.button?.innerHTML;
        this.validationTimeout = null;
        this.init();
    }

    init() {
        if (this.form && this.emailInput && this.button) {
            // Set initial state
            this.setButtonState('disabled');
            
            // Listen for input changes
            this.emailInput.addEventListener('input', (e) => {
                this.handleInputChange(e.target.value);
            });
            
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                if (this.isValidEmail(this.emailInput.value)) {
                    this.handleSubmit();
                }
            });
        }
    }
    
    handleInputChange(value) {
        // Clear previous timeout
        clearTimeout(this.validationTimeout);
        
        if (value.trim() === '') {
            this.setButtonState('disabled');
            return;
        }
        
        // Show processing state
        this.setButtonState('processing');
        
        // Debounce validation
        this.validationTimeout = setTimeout(() => {
            if (this.isValidEmail(value)) {
                this.setButtonState('valid');
            } else {
                this.setButtonState('invalid');
            }
        }, 500);
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    setButtonState(state) {
        switch (state) {
            case 'disabled':
                this.button.disabled = true;
                this.button.innerHTML = `
                    <span>Join waitlist</span>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M7 10H13M13 10L10 7M13 10L10 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                `;
                this.button.style.opacity = '0.5';
                this.form.classList.remove('expanded');
                break;
                
            case 'processing':
                this.button.disabled = true;
                this.button.innerHTML = `
                    <span>Join waitlist</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="4.5 4.5" stroke-dashoffset="0">
                            <animateTransform attributeName="transform" type="rotate" values="0 12 12;360 12 12" dur="1s" repeatCount="indefinite"/>
                        </circle>
                    </svg>
                `;
                this.button.style.opacity = '0.7';
                this.form.classList.remove('expanded');
                break;
                
            case 'invalid':
                this.button.disabled = true;
                this.button.innerHTML = `
                    <span>Join waitlist</span>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M7 10H13M13 10L10 7M13 10L10 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                `;
                this.button.style.opacity = '0.5';
                this.form.classList.remove('expanded');
                break;
                
            case 'valid':
                this.button.disabled = false;
                this.button.innerHTML = this.originalButtonHTML;
                this.button.style.opacity = '1';
                this.form.classList.add('expanded'); // Expand when valid
                break;
        }
    }
    
    handleSubmit() {
        // Step 1: Hypodermic needle injection effect (inject in, then reverse out)
        this.form.classList.add('injecting');
        
        // Step 2: Spawn satellite at injection midpoint
        setTimeout(() => {
            this.spawnSatellite();
        }, 600); // Midpoint of 1.2s animation
        
        // Step 3: Remove injection class when animation completes, reset to original state
        setTimeout(() => {
            this.form.classList.remove('injecting', 'expanded');
            this.form.reset();
            this.setButtonState('disabled');
        }, 1200); // After full animation cycle
    }
    
    spawnSatellite() {
        console.log('🛰️ Attempting to spawn satellite...');
        
        // Always try 3D system first since that's what we're using
        if (window.gravitationalSingularity) {
            console.log('📡 3D system detected, adding 3D satellite');
            this.spawn3DSatellite();
            return;
        }
        
        // Fallback to 2D gravitational system if available
        const gravitationalSystem = window.gravitationalSystem;
        if (gravitationalSystem && gravitationalSystem.particles) {
            console.log('📡 2D system detected, adding 2D satellite');
            this.spawn2DSatellite(gravitationalSystem);
            return;
        }
        
        // Final fallback - just show visual effect
        console.log('⚠️ No gravitational system found, showing visual effect only');
        this.createLaunchEffect();
    }
    
    spawn2DSatellite(gravitationalSystem) {
        // Get button position for satellite spawn point
        const buttonRect = this.button.getBoundingClientRect();
        const canvas = document.getElementById('particles');
        if (!canvas) {
            console.log('❌ No canvas found');
            return;
        }
        
        const canvasRect = canvas.getBoundingClientRect();
        
        // Convert button position to canvas coordinates
        const spawnX = buttonRect.left + buttonRect.width/2 - canvasRect.left;
        const spawnY = buttonRect.top + buttonRect.height/2 - canvasRect.top;
        
        console.log(`📍 2D Spawn position: (${spawnX}, ${spawnY})`);
        
        // Create satellite object
        const satellite = {
            x: spawnX,
            y: spawnY,
            vx: Math.random() * 2 - 1,
            vy: Math.random() * 2 - 1,
            size: 8,
            opacity: 1,
            speed: 2,
            orbitRadius: 0,
            orbitAngle: 0,
            orbiting: false,
            isSatellite: true,
            createdAt: Date.now()
        };
        
        // Add to gravitational system
        gravitationalSystem.particles.push(satellite);
        console.log(`✅ 2D Satellite added! Total particles: ${gravitationalSystem.particles.length}`);
    }
    
    spawn3DSatellite() {
        console.log('🛰️ Spawning realistic satellite in 3D system...');
        
        // Get button position for satellite launch
        const buttonRect = this.button.getBoundingClientRect();
        const buttonPosition = {
            x: buttonRect.left + buttonRect.width / 2,
            y: buttonRect.top + buttonRect.height / 2
        };
        
        console.log(`🚀 Button position: (${buttonPosition.x.toFixed(1)}, ${buttonPosition.y.toFixed(1)})`);
        
        // Check if 3D gravitational system is available
        console.log('🔍 Checking for 3D system:', !!window.gravitationalSingularity);
        console.log('🔍 Checking for addSatelliteAsteroid method:', !!(window.gravitationalSingularity && window.gravitationalSingularity.addSatelliteAsteroid));
        
        if (window.gravitationalSingularity && window.gravitationalSingularity.addSatelliteAsteroid) {
            // Launch satellite from button position
            window.gravitationalSingularity.addSatelliteAsteroid(buttonPosition);
            console.log('✅ Satellite launched from button!');
            
            // Create visual launch effect as backup to ensure something is visible
            this.createLaunchEffect();
        } else {
            console.log('⚠️ 3D gravitational system not found, creating visual effect only');
            this.createLaunchEffect();
        }
    }
    
    createLaunchEffect() {
        // Get button position for satellite spawn
        const buttonRect = this.button.getBoundingClientRect();
        
        // Create a visual launch particle that moves toward the 3D scene
        const launchParticle = document.createElement('div');
        launchParticle.style.position = 'fixed';
        launchParticle.style.left = buttonRect.left + buttonRect.width/2 - 4 + 'px';
        launchParticle.style.top = buttonRect.top + buttonRect.height/2 - 4 + 'px';
        launchParticle.style.width = '8px';
        launchParticle.style.height = '8px';
        launchParticle.style.backgroundColor = '#3b82f6';
        launchParticle.style.borderRadius = '50%';
        launchParticle.style.boxShadow = '0 0 20px #3b82f6, 0 0 40px #3b82f6';
        launchParticle.style.zIndex = '1000';
        launchParticle.style.pointerEvents = 'none';
        launchParticle.style.opacity = '1';
        launchParticle.style.transition = 'all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        
        document.body.appendChild(launchParticle);
        
        // Animate toward the gravitational singularity position
        const heroSection = document.querySelector('.hero');
        const heroRect = heroSection?.getBoundingClientRect();
        if (heroRect) {
            setTimeout(() => {
                // Calculate approximate singularity position (right side of hero, centered)
                const targetX = heroRect.left + heroRect.width * 0.75;
                const targetY = heroRect.top + heroRect.height * 0.5;
                
                launchParticle.style.left = targetX - 4 + 'px';
                launchParticle.style.top = targetY - 4 + 'px';
                launchParticle.style.opacity = '0';
                launchParticle.style.transform = 'scale(0.2)';
            }, 50);
        }
        
        // Remove after animation
        setTimeout(() => {
            launchParticle.remove();
        }, 1600);
        
        console.log('✅ Launch effect created');
    }
    
    showVisualSatellite() {
        // Fallback: just show a visual satellite launch effect
        this.createLaunchEffect();
        console.log('✅ Visual satellite fallback created');
    }
}

// Stat Cycling Animation
class StatCycler {
    constructor() {
        this.cycleElements = document.querySelectorAll('.stat-cycle');
        this.statsContainer = document.querySelector('.hero-stats');
        this.progressBars = document.querySelectorAll('.stat-progress-bar');
        this.isPaused = false;
        this.currentTimeout = null;
        this.nextCycleTime = 0;
        this.pausedAt = 0;
        this.remainingTime = 7000; // Full cycle time - slower, less anxious
        this.isAnimating = false; // Prevent double animations
        this.init();
    }
    
    init() {
        // Add hover listeners to pause/resume
        if (this.statsContainer) {
            this.statsContainer.addEventListener('mouseenter', () => {
                this.pause();
            });
            
            this.statsContainer.addEventListener('mouseleave', () => {
                this.resume();
            });
        }
        
        // Wait for stats to be fully visible before starting
        // Stats fade in at 4.6s, need to wait for animation to complete
        setTimeout(() => {
            // Now start the countdown timer which takes 7 seconds
            this.scheduleCycle(7000);
        }, 5200); // 5.2s = 4.6s (last stat fade-in) + 0.6s (animation duration)
    }
    
    pause() {
        if (this.isPaused) return;
        this.isPaused = true;
        
        // Calculate remaining time
        if (this.nextCycleTime > 0) {
            this.remainingTime = Math.max(0, this.nextCycleTime - Date.now());
        }
        
        // Clear the current timeout
        if (this.currentTimeout) {
            clearTimeout(this.currentTimeout);
            this.currentTimeout = null;
        }
        
        // Pause CSS animations on the ::after pseudo-elements
        this.progressBars.forEach(bar => {
            // Add a class to control the animation state
            bar.classList.add('paused');
        });
    }
    
    resume() {
        if (!this.isPaused) return;
        this.isPaused = false;
        
        // Resume CSS animations
        this.progressBars.forEach(bar => {
            bar.classList.remove('paused');
        });
        
        // Resume cycling with remaining time
        this.scheduleCycle(this.remainingTime);
    }
    
    startCycle() {
        // Don't cycle content on first run, just schedule
        this.scheduleCycle(7000);
    }
    
    scheduleCycle(delay) {
        if (this.isPaused) return;
        
        // Clear any existing timeout first
        if (this.currentTimeout) {
            clearTimeout(this.currentTimeout);
            this.currentTimeout = null;
        }
        
        this.nextCycleTime = Date.now() + delay;
        
        this.currentTimeout = setTimeout(() => {
            if (!this.isPaused) {
                this.cycleContent();
                // Schedule next cycle with a fresh call
                this.scheduleCycle(7000);
            }
        }, delay);
    }
    
    cycleContent() {
        // Prevent double animations
        if (this.isAnimating) {
            console.log('⚠️ StatCycler: Already animating, skipping cycle');
            return;
        }
        
        this.isAnimating = true;
        console.log('🔄 StatCycler: Starting cycle animation');
        
        // Get all stat containers
        const statContainers = document.querySelectorAll('.stat');
        
        statContainers.forEach((container, containerIndex) => {
            // Get value and label for this stat
            const valueElement = container.querySelector('.stat-value .stat-cycle');
            const labelElement = container.querySelector('.stat-label .stat-cycle');
            
            // Stagger delay for each stat column (left to right)
            const staggerDelay = containerIndex * 250;
            
            // Process value (heading)
            if (valueElement) {
                const valueMessages = JSON.parse(valueElement.dataset.messages);
                const currentValueIndex = valueMessages.indexOf(valueElement.textContent);
                const nextValueIndex = (currentValueIndex + 1) % valueMessages.length;
                
                setTimeout(() => {
                    // Add class for CSS animation
                    valueElement.classList.add('cycling-out');
                    
                    // Wait for fade out animation
                    setTimeout(() => {
                        // Change text while invisible
                        valueElement.textContent = valueMessages[nextValueIndex];
                        // Remove out class, add in class
                        valueElement.classList.remove('cycling-out');
                        valueElement.classList.add('cycling-in');
                        
                        // Clean up after animation
                        setTimeout(() => {
                            valueElement.classList.remove('cycling-in');
                        }, 800);
                    }, 800);
                }, staggerDelay);
            }
            
            // Process label (subtext) with slight delay after value
            if (labelElement) {
                const labelMessages = JSON.parse(labelElement.dataset.messages);
                const currentLabelIndex = labelMessages.indexOf(labelElement.textContent);
                const nextLabelIndex = (currentLabelIndex + 1) % labelMessages.length;
                
                setTimeout(() => {
                    // Add class for CSS animation
                    labelElement.classList.add('cycling-out');
                    
                    // Wait for fade out animation
                    setTimeout(() => {
                        // Change text while invisible
                        labelElement.textContent = labelMessages[nextLabelIndex];
                        // Remove out class, add in class
                        labelElement.classList.remove('cycling-out');
                        labelElement.classList.add('cycling-in');
                        
                        // Clean up after animation
                        setTimeout(() => {
                            labelElement.classList.remove('cycling-in');
                        }, 800);
                    }, 800);
                }, staggerDelay + 120);
            }
        });
        
        // Reset animation flag after all animations complete
        // Total animation time = stagger delay (750ms max) + fade out (800ms) + fade in (800ms) = ~2.4s
        setTimeout(() => {
            this.isAnimating = false;
            console.log('✅ StatCycler: Animation cycle complete');
        }, 2500);
    }
}

// Scroll Shadow Handler
class ScrollShadowHandler {
    constructor() {
        this.descriptionElement = document.querySelector('.hero-description');
        if (this.descriptionElement) {
            this.init();
        }
    }
    
    init() {
        this.descriptionElement.addEventListener('scroll', () => {
            this.updateShadows();
        });
        
        // Initial check
        setTimeout(() => {
            this.updateShadows();
        }, 100);
    }
    
    updateShadows() {
        const element = this.descriptionElement;
        const isScrolledTop = element.scrollTop > 10;
        const isScrolledBottom = element.scrollTop < (element.scrollHeight - element.clientHeight - 10);
        
        if (isScrolledTop) {
            element.classList.add('scrolled-top');
        } else {
            element.classList.remove('scrolled-top');
        }
        
        if (isScrolledBottom && element.scrollHeight > element.clientHeight) {
            element.classList.add('scrolled-bottom');
        } else {
            element.classList.remove('scrolled-bottom');
        }
    }
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    // Initialize gravitational field
    const canvas = document.getElementById('particles');
    if (canvas) {
        window.gravitationalSystem = new GravitationalField(canvas);
    }
    
    // Initialize orbit system
    const orbitSystem = document.querySelector('.orbit-system');
    if (orbitSystem) {
        new OrbitSystem();
    }
    
    // Initialize form handler
    new FormHandler();
    
    // Initialize stat cycling
    new StatCycler();
    
    // Initialize scroll shadows
    new ScrollShadowHandler();
});
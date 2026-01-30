import * as THREE from 'three';
import theatre from '@theatre/core';
import studio from '@theatre/studio';

// Initialize Theatre.js Studio
if (import.meta.env.DEV) {
    studio.initialize();
}

// Create Project
const project = theatre.getProject('WorkspaceOS Promo');
const sheet = project.sheet('Scene 1');

// Three.js Setup
const canvas = document.querySelector('#render-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505); // Deep Obsidian
scene.fog = new THREE.FogExp2(0x050505, 0.05);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Basic Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

// Test Object (The "Cube")
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial({ color: 0x00aaff, emissive: 0x001133 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Theatre.js Object Control
const cubeObj = sheet.object('Test Cube', {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 }
});

cubeObj.onValuesChange((values) => {
    cube.position.set(values.position.x, values.position.y, values.position.z);
    cube.rotation.set(values.rotation.x, values.rotation.y, values.rotation.z);
});

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    
    // Optional: Add some procedural rotation if not driven by Theatre
    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;

    renderer.render(scene, camera);
}

// Handle Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();

# WorkspaceOS "Code-as-Video" Studio Plan

**Goal:** Create a high-quality, programmatic promo video for WorkspaceOS using web technologies (Three.js + Theatre.js). This allows for infinite resolution rendering, live interactive web backgrounds, and reusable visual assets for the product itself.

## 1. The Stack ("The Code-First Studio")

We avoid building a timeline editor from scratch. We use **Theatre.js** to drive **Three.js** parameters.

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Scene Engine** | **Three.js** | Core 3D rendering. Handles geometry (Cubes, Spheres), lights, and cameras. |
| **Timeline/Editor** | **@theatre/core** + **@theatre/studio** | The UI overlay that lets us animate properties (position, intensity, color) over time and save the state to JSON. |
| **Post-Processing** | **Three.js EffectComposer** | Essential for the "Sci-Fi" look. Bloom (UnrealBloomPass) for bioluminescent wires, Noise for texture. |
| **Rendering** | **CCapture.js** (or similar) | Captures the canvas frame-by-frame to export a high-quality MP4/WebM. |

## 2. Visual Architecture

**Aesthetic:** "Gravitational," "Hard Sci-Fi," "Obsidian & Bioluminescence."

### Key Metaphors (Scenes)
1.  **The Entropy (0:00-0:10):**
    *   **Visual:** Floating, disconnected geometric primitives (Cubes = Jira, Spheres = Slack).
    *   **Logic:** Simple physics simulation (slow drift).
2.  **The Observer (0:10-0:20):**
    *   **Visual:** A "Scanner Plane" of light moving through the void.
    *   **Logic:** `ScannerMesh` position driven by Theatre.js. Collision detection changes `Emissive` property of primitives it passes.
3.  **The Parliament (0:20-0:40):**
    *   **Visual:** Rotating concentric rings (The Red Team) verifying a central jagged shape.
    *   **Logic:** Procedural animation of rings. The central shape smooths out (geometry morph or replacement).
4.  **The Singularity (0:40-0:60):**
    *   **Visual:** Objects align into a stream/orbit around a central massive sphere.
    *   **Logic:** "Gravitational Pull" effect (similar to current `gravitational-singularity.js` but 3D).

## 3. Implementation Plan

### Phase 1: Scaffold (Current Branch)
- [x] Create branch `promo-video-studio`.
- [ ] Add dependencies (`three`, `@theatre/core`, `@theatre/studio`, `ccapture.js`).
- [ ] Create `studio/` directory structure.
- [ ] Create `studio/index.html` (The "Editor" interface).
- [ ] Create `studio/main.js` (The Three.js + Theatre.js bootstrap).

### Phase 2: Scene Composition
- [ ] Implement `SceneManager` class.
- [ ] Create `EntropyScene` (Drifting objects).
- [ ] Wire up Theatre.js Studio to control camera and light.

### Phase 3: The "Scanner" & "Parliament"
- [ ] Implement the "Scanner" shader/mesh.
- [ ] Build the "Parliament Rings" geometry.

### Phase 4: Render Pipeline
- [ ] Integrate `CCapture.js` to record the canvas.
- [ ] Create `render.html` (headless, deterministic frame-stepping for recording).

## 4. Usage

1.  **Development (Editing):**
    *   Run `npm run studio` (starts local server).
    *   Open browser. Press `Alt/Option + L` to toggle Theatre.js Studio.
    *   Animate objects. Click "Save" to update the JSON state file.
2.  **Production (Web Background):**
    *   Load the JSON state file.
    *   Play the animation without the Studio UI.
3.  **Export (Video):**
    *   Uncomment the `CCapture` lines.
    *   Play the animation once.
    *   Download the `.webm`/`.mp4`.

## 5. Directory Structure

```
/studio
  ├── index.html        # The Studio Entry Point
  ├── style.css         # Minimal styling for canvas
  ├── main.js           # Main entry point (Three.js init)
  ├── scenes/
  │   ├── Entropy.js    # Scene logic
  │   └── Parliament.js # Scene logic
  └── assets/           # Textures/Models
```

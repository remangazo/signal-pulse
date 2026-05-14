---
name: 3d-web-experience
description: Expertise in creating immersive 3D web environments using Three.js, React Three Fiber (R3F), and GLSL shaders.
---

# 3D Web Experience Skill

## Purpose
This skill enables the AI agent to architect, implement, and optimize 3D visual experiences within web applications. It focuses on premium aesthetics, smooth performance, and interactive 3D elements.

## Core Rules
1.  **Aesthetics First:** Prioritize high-quality materials (PBR), subtle lighting, and smooth animations (GSAP/Leva).
2.  **Performance Optimization:**
    -   Use `requestAnimationFrame` properly.
    -   Optimize geometry (buffergeometry) and textures.
    -   Implement Level of Detail (LOD) for complex scenes.
3.  **Tech Stack:**
    -   Primary: **Three.js** (Vanilla JS) or **React Three Fiber** (React).
    -   Secondary: **Drei** (helpers), **Cannon.js/Rapier** (physics), **Post-processing**.
4.  **Immersive Patterns:** Use raycasting for interaction, environmental mapping (HDR), and custom shaders for unique effects.
5.  **Luxury Product Modeling:** Focus on "Studio Lighting" setups. Use high-gloss materials for glass/liquids and soft-shadow presets for fabrics/clothing.

## Workflows

### /setup-3d-scene [framework]
Initializes a basic 3D scene with essential elements: Camera, Lighting, OrbitControls, and a test mesh.

### /setup-luxury-studio [product]
Sets up a Three.js scene optimized for luxury product showcasing, including HDR environments, soft shadows, and high-fidelity PBR materials.

### /add-3d-model [path]
Handles loading models (GLTF/OBJ), setting up materials, and adding them to the current scene.

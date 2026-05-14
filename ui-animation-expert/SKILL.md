---
name: ui-animation-expert
description: Expertise in creating high-performance, premium UI animations using Anime.js for CSS, SVG, and DOM manipulations.
---

# UI Animation Expert Skill (Anime.js)

## Purpose
This skill enables the AI agent to orchestrate sophisticated animations that elevate the user experience. It focuses on smoothness, micro-interactions, and complex timelines that make "TurnoFácil.io" feel premium and alive.

## Core Rules
1.  **Subtlety is Key:** Don't overdo it. Use meaningful animations that guide the user's attention.
2.  **Easing Matters:** Prioritize `easeInOutExpo` or custom Bezier curves for a natural "premium" feel.
3.  **Timeline Orchestration:** Use `anime.timeline()` to chain animations instead of nested callbacks.
4.  **Performance:** Optimize animations for 60fps. Prefer CSS transforms (`scale`, `translate`, `rotate`) over properties that trigger layout (like `width`, `height`, `top`).
5.  **Motion Paths:** Leverage SVG paths for complex entrance animations or moving elements.

## Workflows

### /animate-entry [selector] [effect]
Generates a sophisticated entrance animation (staggered, fade-slide, or elastic bounce) for a group of elements.

### /create-loader [style]
Designs a custom SVG-based loading animation using path morphing or drawing offsets.

### /dynamic-hover [selector]
Adds interactive, reactive hover effects that respond to mouse movement or state changes.

## Recommended Libraries
- **Standalone:** `anime.min.js` (Include via CDN or local assets).
- **React/Frameworks:** Compatible with any framework by using refs and lifecycle hooks (useEffect).

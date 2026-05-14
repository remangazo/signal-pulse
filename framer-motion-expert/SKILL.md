---
name: framer-motion-expert
description: Specialized skill for high-end React animations using Framer Motion. Focuses on orchestrating complex layouts, gestures, and physics-based interactions.
---

# Framer Motion Expert Skill

## Purpose
This skill empowers the agent to build fluid, production-ready React interfaces that feel organic and alive. It focuses on the specialized features of Framer Motion that differentiate "standard" websites from world-class digital experiences.

## Core Rules
1.  **Orchestration over Individual Tweens**: Use `variants` and the `staggerChildren` property for coordinated group animations. Avoid individual `transition` props when multiple elements are involved.
2.  **Layout Transitions**: Leverage the `layout` and `layoutId` props for seamless transitions between different UI states (e.g., expanding cards, shared element transitions).
3.  **Presence Management**: Always use `AnimatePresence` for mounting/unmounting animations, ensuring exit transitions are properly handled.
4.  **Gesture-Based Interaction**: Implement premium `whileHover`, `whileTap`, and `whileDrag` effects with SPRING physics (`type: "spring"`, `stiffness`, `damping`).
5.  **Motion Values**: Use `useScroll`, `useTransform`, and `useSpring` for advanced, performance-optimized scroll-linked or mouse-parallax effects.

## Workflows

### /animate-entry [selector] [direction]
Creates a sophisticated entrance animation using variants (opacity, y-offset, scale) with a spring-based stagger effect.

### /setup-shared-element [id]
Sets up a `layoutId` transition between two components (e.g., a list item expanding into a full detail view) across Different components.

### /scroll-reveal-framer [id]
Implements a scroll-triggered animation using `whileInView` with `viewport` settings for precise control over when the animation fires.

## Performance Guidelines
-   Use `useReducedMotion` hook to respect user system settings.
-   Prefer `transform` and `opacity` for standard animations.
-   Avoid animating expensive props like `filter` or `box-shadow` in high-frequency loops without hardware acceleration checks.

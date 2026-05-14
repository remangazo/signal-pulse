---
name: gsap-expert
description: Specialized skill for GSAP (GreenSock Animation Platform) focusing on ScrollTrigger, complex timelines, and Apple-style interactive storytelling.
---

# GSAP Expert Skill

## Purpose
This skill enables the agent to create buttery-smooth, industry-standard web animations using the GreenSock Animation Platform (GSAP). It focuses on high-impact scroll-triggered storytelling, SVG morphing, and complex motion orchestration.

## Core Rules
1. **ScrollTrigger Mastery**: Use `GSAP ScrollTrigger` for all scroll-based reveal effects, parallax, and pinned sections.
2. **Timelines over Delays**: Always use `gsap.timeline()` for sequences. Avoid `delay` properties within individual tweens for better maintainability.
3. **Easing Excellence**: Use custom easings like `power4.out`, `expo.inOut`, or `CustomEase` for that "premium" feel. Avoid default linear transitions for primary UI elements.
4. **Performance First**: Animate `x`, `y`, `rotation`, and `scale` (GPU-accelerated) instead of `top`, `left`, `width`, or `height`.
5. **Splitting/Text Animation**: Use `SplitText` patterns for staggering character/word entrances.

## Workflows

### /animate-scroll-reveal [selector] [effect]
Creates a GSAP ScrollTrigger animation for a specific section. Effects include `parallax`, `stagger-fade`, `pin-and-draw`, and `reveal-from-clip`.

### /create-scroll-story [id]
Architects a full-page scroll sequence where elements transition smoothly based on the user's scroll position, similar to Apple product pages.

### /morph-svg [selector_start] [selector_end]
Implements SVG path morphing for liquid-like transitions between shapes or icons.

## Recommended Plugins
- **ScrollTrigger**: For scroll-based interaction.
- **Draggable**: For premium drag-and-drop interactions.
- **MotionPath**: For moving elements along complex SVG paths.
- **Flip**: For seamless layout transitions between states.

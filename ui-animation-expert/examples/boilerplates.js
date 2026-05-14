import anime from 'animejs';

/**
 * Premium staggered entrance animation for list items or grid cards.
 * @param {string} selector - CSS selector for the elements to animate.
 */
export const animateStaggeredEntry = (selector) => {
    anime({
        targets: selector,
        opacity: [0, 1],
        translateY: [20, 0],
        scale: [0.9, 1],
        delay: anime.stagger(100, { start: 200 }),
        easing: 'easeOutExpo',
        duration: 1200
    });
};

/**
 * Interactive hover effect that scales and adds a subtle glow.
 * @param {HTMLElement} el - The element to animate.
 */
export const animateButtonHover = (el) => {
    anime({
        targets: el,
        scale: 1.05,
        boxShadow: '0px 10px 20px rgba(0,0,0,0.1)',
        duration: 300,
        easing: 'spring(1, 80, 10, 0)'
    });
};

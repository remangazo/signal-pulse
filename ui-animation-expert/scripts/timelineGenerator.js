/**
 * Generates a template for an Anime.js timeline.
 * Use this to quickly scaffold complex sequences.
 */
function generateTimelineTemplate(name) {
    return `
const ${name} = anime.timeline({
  easing: 'easeOutExpo',
  duration: 750
});

${name}
  .add({
    targets: '.target-1',
    opacity: [0, 1],
    translateY: [50, 0]
  })
  .add({
    targets: '.target-2',
    opacity: [0, 1],
    scale: [0.5, 1]
  }, '-=500'); // Offset for overlap
`;
}

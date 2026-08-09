document.addEventListener('DOMContentLoaded', () => {
  const cardImages = document.querySelectorAll('.place-thumb, .parkrun-thumb');

  cardImages.forEach(img => {
    img.addEventListener('mouseenter', () => {
      // Pick either -5deg or 5deg randomly
      const angle = Math.random() < 0.5 ? -5 : 5;
      // Rotates by random angle AND zooms by 5% (scale 1.05)
      img.style.transform = `rotate(${angle}deg) scale(1.05)`;
    });

    img.addEventListener('mouseleave', () => {
      // Reset back to original state
      img.style.transform = 'rotate(0deg) scale(1)';
    });
  });
});
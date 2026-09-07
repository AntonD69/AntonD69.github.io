document.addEventListener('DOMContentLoaded', () => {
  // Create Lightbox DOM elements dynamically
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `
    <button class="lightbox-close" aria-label="Close Lightbox">&times;</button>
    <div class="lightbox-content">
      <img src="" alt="" />
      <div class="lightbox-caption"></div>
    </div>
  `;
  document.body.appendChild(lightbox);

  const lightboxImg = lightbox.querySelector('img');
  const lightboxCaption = lightbox.querySelector('.lightbox-caption');
  const closeBtn = lightbox.querySelector('.lightbox-close');

  // Open Lightbox on image click
  document.querySelectorAll('.photo-card').forEach(card => {
    const img = card.querySelector('.photo-wrapper img');
    const desc = card.querySelector('.photo-description');

    if (!img) return;

    img.parentElement.addEventListener('click', () => {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || '';
      lightboxCaption.innerHTML = desc ? desc.innerHTML : '';
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden'; // Prevent scrolling while open
    });
  });

  // Close handlers
  const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  };

  closeBtn.addEventListener('click', closeLightbox);

  // Close when clicking outside the content area
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  // Close on Escape key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });
});
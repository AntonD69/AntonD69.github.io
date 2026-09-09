document.addEventListener('DOMContentLoaded', () => {
  // 1. Create Lightbox DOM elements dynamically (including nav buttons)
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `
    <button class="lightbox-close" aria-label="Close Lightbox">&times;</button>
    <button class="lightbox-nav lightbox-prev" aria-label="Previous Photo">&#10094;</button>
    <div class="lightbox-content">
      <img src="" alt="" />
      <div class="lightbox-caption"></div>
    </div>
    <button class="lightbox-nav lightbox-next" aria-label="Next Photo">&#10095;</button>
  `;
  document.body.appendChild(lightbox);

  const lightboxImg = lightbox.querySelector('img');
  const lightboxCaption = lightbox.querySelector('.lightbox-caption');
  const closeBtn = lightbox.querySelector('.lightbox-close');
  const prevBtn = lightbox.querySelector('.lightbox-prev');
  const nextBtn = lightbox.querySelector('.lightbox-next');

  // 2. Gather all photo cards on the page
  const cards = Array.from(document.querySelectorAll('.photo-card'));
  let currentIndex = 0;

  // Update lightbox content by index
  const updateLightbox = (index) => {
    if (index < 0 || index >= cards.length) return;
    currentIndex = index;

    const card = cards[currentIndex];
    const img = card.querySelector('.photo-wrapper img');
    const desc = card.querySelector('.photo-description');

    if (img) {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || '';
      lightboxCaption.innerHTML = desc ? desc.innerHTML : '';
    }
  };

  // Open Lightbox
  const openLightbox = (index) => {
    updateLightbox(index);
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling while open
  };

  // Close Lightbox
  const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  };

  // Step to Next Photo
  const showNext = () => {
    const nextIndex = (currentIndex + 1) % cards.length;
    updateLightbox(nextIndex);
  };

  // Step to Previous Photo
  const showPrev = () => {
    const prevIndex = (currentIndex - 1 + cards.length) % cards.length;
    updateLightbox(prevIndex);
  };

  // Attach click events to card wrappers
  cards.forEach((card, index) => {
    const wrapper = card.querySelector('.photo-wrapper');
    if (wrapper) {
      wrapper.addEventListener('click', () => openLightbox(index));
    }
  });

  // Event listeners for controls
  closeBtn.addEventListener('click', closeLightbox);
  nextBtn.addEventListener('click', showNext);
  prevBtn.addEventListener('click', showPrev);

  // Close when clicking backdrop
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  // Keyboard navigation controls
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;

    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
  });
});
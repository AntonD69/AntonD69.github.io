document.addEventListener('DOMContentLoaded', () => {
    /* ==========================================================================
       1. LAZY LOADING IMAGES
       ========================================================================== */
    const lazyImages = document.querySelectorAll('img.lazy-thumb');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy-thumb');
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        }, { rootMargin: '200px 0px', threshold: 0.01 });

        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
        });
    }

    /* ==========================================================================
       2. HOVER / TAP DYNAMIC COLOR TINGE
       ========================================================================== */
    const grid = document.querySelector('.adventures-grid');
    const cards = document.querySelectorAll('.adventure-card');

    if (!grid || cards.length === 0) return;

    function activateCard(targetCard) {
        // Extract color safely from data attribute, inline style, or computed style fallback
        let rawColor = targetCard.dataset.colour || 
                       targetCard.style.getPropertyValue('--card-color') || 
                       getComputedStyle(targetCard).getPropertyValue('--card-color');

        rawColor = (rawColor || '#ff0000').trim();

        // Pass the hovered card's color to the parent grid variable
        grid.style.setProperty('--active-hover-color', rawColor);
        grid.classList.add('has-active-card');

        cards.forEach(card => {
            if (card === targetCard) {
                card.classList.add('is-active');
            } else {
                card.classList.remove('is-active');
            }
        });
    }

    function deactivateCards() {
        grid.classList.remove('has-active-card');
        grid.style.removeProperty('--active-hover-color');
        cards.forEach(card => card.classList.remove('is-active'));
    }

    // Desktop Mouse Events
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => activateCard(card));
        card.addEventListener('mouseleave', () => deactivateCards());
    });

    // Mobile / Touch Events
    document.addEventListener('touchstart', (e) => {
        const touchedCard = e.target.closest('.adventure-card');

        if (touchedCard) {
            if (!touchedCard.classList.contains('is-active')) {
                activateCard(touchedCard);
            }
        } else {
            deactivateCards();
        }
    }, { passive: true });
});
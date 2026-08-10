document.addEventListener('DOMContentLoaded', () => {
  /* ==========================================================================
     1. CARD IMAGE HOVER ANIMATIONS
     ========================================================================== */
  const cardImages = document.querySelectorAll('.place-thumb, .parkrun-thumb');

  cardImages.forEach(img => {
    img.addEventListener('mouseenter', () => {
      const angle = Math.random() < 0.5 ? -5 : 5;
      img.style.transform = `rotate(${angle}deg) scale(1.05)`;
    });

    img.addEventListener('mouseleave', () => {
      img.style.transform = 'rotate(0deg) scale(1)';
    });
  });

  /* ==========================================================================
     2. LAZY LOADING IMAGES
     ========================================================================== */
  const lazyImages = document.querySelectorAll('img.lazy-thumb');

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy-thumb');
            img.classList.add('loaded');
            observer.unobserve(img);
          }
        });
      },
      { rootMargin: '200px 0px', threshold: 0.01 }
    );

    lazyImages.forEach(img => imageObserver.observe(img));
  } else {
    lazyImages.forEach(img => {
      img.src = img.dataset.src;
    });
  }

  /* ==========================================================================
     3. FILTER MATRIX COMPONENT (CHECKED BY DEFAULT)
     ========================================================================== */
  const matrixContainer = document.getElementById('filter-matrix');
  const resetBtn = document.getElementById('reset-filter-btn');
  const cards = Array.from(document.querySelectorAll('.visitedPlace-card'));

  if (!matrixContainer || cards.length === 0) return;

  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // Extract unique PointTypes
  const pointTypes = [
    ...new Set(cards.map(card => card.dataset.pointtype).filter(Boolean))
  ].sort();

  // Pre-process card metadata
  const cardData = cards.map(card => ({
    element: card,
    type: card.dataset.pointtype || '',
    nameLetter: (card.dataset.name || '').trim().charAt(0).toUpperCase()
  }));

  // Render Matrix Header Row (Top Row with Checkboxes CHECKED by default)
  let matrixHtml = `<div class="matrix-cell-header">Type</div>`;

  // Render Top Header Column Letters with Checkboxes
  ALPHABET.forEach(letter => {
    const totalLetterCount = cardData.filter(c => c.nameLetter === letter).length;
    const isDisabled = totalLetterCount === 0;

    matrixHtml += `
      <label 
        class="matrix-column-header ${isDisabled ? 'disabled' : ''}" 
        title="Toggle all places starting with ${letter} (${totalLetterCount})"
      >
        <span>${letter}</span>
        <input 
          type="checkbox" 
          class="header-letter-checkbox" 
          data-letter="${letter}" 
          ${isDisabled ? 'disabled' : 'checked'} 
        />
      </label>
    `;
  });

  // Render Matrix Type Rows (Left Headers with Checkboxes CHECKED by default)
  pointTypes.forEach(type => {
    const typeCount = cardData.filter(c => c.type === type).length;

    matrixHtml += `
      <label class="matrix-row-label" title="Toggle all ${type} places (${typeCount})">
        <span>${type}</span>
        <input type="checkbox" class="type-checkbox" data-type="${type}" checked />
      </label>
    `;

    // Inner Grid Cells: Standard Buttons (NO Checkboxes)
    ALPHABET.forEach(letter => {
      const matchCount = cardData.filter(
        c => c.type === type && c.nameLetter === letter
      ).length;
      const isDisabled = matchCount === 0;

      matrixHtml += `
        <button 
          class="matrix-btn ${isDisabled ? 'disabled' : ''}" 
          data-type="${type}" 
          data-letter="${letter}"
          ${isDisabled ? 'disabled' : ''}
          title="${type} starting with ${letter} (${matchCount} places)"
        >
          ${letter}
        </button>
      `;
    });
  });

  matrixContainer.innerHTML = matrixHtml;

  /* --- Unified Filter Engine --- */
  let activeCellBtn = null;

  function applyFilters() {
    // 1. Collect checked Types
    const checkedTypes = Array.from(
      matrixContainer.querySelectorAll('.type-checkbox:checked')
    ).map(cb => cb.dataset.type);

    // 2. Collect checked Top-Row Letters
    const checkedLetters = Array.from(
      matrixContainer.querySelectorAll('.header-letter-checkbox:checked')
    ).map(cb => cb.dataset.letter);

    // 3. Highlight labels containing checked inputs
    matrixContainer.querySelectorAll('.matrix-row-label, .matrix-column-header').forEach(label => {
      const cb = label.querySelector('input[type="checkbox"]');
      label.classList.toggle('has-checked', Boolean(cb && cb.checked));
    });

    const activeCellType = activeCellBtn ? activeCellBtn.dataset.type : null;
    const activeCellLetter = activeCellBtn ? activeCellBtn.dataset.letter : null;

    // 4. Evaluate card visibility
    cardData.forEach(({ element, type, nameLetter }) => {
      const matchesType = checkedTypes.includes(type);
      const matchesLetter = checkedLetters.includes(nameLetter);

      // Enforce cell-level filtering if an interior button is clicked
      let matchesCell = true;
      if (activeCellType && activeCellLetter) {
        matchesCell = (type === activeCellType && nameLetter === activeCellLetter);
      }

      element.style.display = (matchesType && matchesLetter && matchesCell) ? 'flex' : 'none';
    });
  }

  // Initial Filter Pass on Page Load (Applies default checked states)
  applyFilters();

  // Handle Checkbox State Changes (Type Rows & Top Letter Headers)
  matrixContainer.addEventListener('change', e => {
    if (e.target.matches('input[type="checkbox"]')) {
      applyFilters();
    }
  });

  // Handle Inner Cell Clicks (No Checkboxes)
  matrixContainer.addEventListener('click', e => {
    if (e.target.closest('.matrix-row-label, .matrix-column-header')) return;

    const btn = e.target.closest('.matrix-btn');
    if (!btn || btn.classList.contains('disabled')) return;

    if (activeCellBtn === btn) {
      btn.classList.remove('active');
      activeCellBtn = null;
      applyFilters();
      return;
    }

    if (activeCellBtn) activeCellBtn.classList.remove('active');

    btn.classList.add('active');
    activeCellBtn = btn;

    applyFilters();
  });

  // Handle Reset Button (Restores ALL to CHECKED)
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      matrixContainer
        .querySelectorAll('input[type="checkbox"]:not(:disabled)')
        .forEach(cb => (cb.checked = true));

      if (activeCellBtn) {
        activeCellBtn.classList.remove('active');
        activeCellBtn = null;
      }

      applyFilters();
    });
  }
});
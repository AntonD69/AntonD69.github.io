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


document.addEventListener('DOMContentLoaded', () => {
  const matrixContainer = document.getElementById('filter-matrix');
  const resetBtn = document.getElementById('reset-filter-btn');
  const cards = Array.from(document.querySelectorAll('.visitedPlace-card'));

  if (!matrixContainer || cards.length === 0) return;

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // 1. Extract unique PointTypes from card dataset
  const pointTypes = [...new Set(
    cards.map(card => card.dataset.pointtype).filter(Boolean)
  )].sort();

  // 2. Render Header Row (Top-Left Cell + Clickable A-Z Letter Buttons)
  let matrixHtml = `<div class="matrix-cell-header">Type</div>`;
  alphabet.forEach(letter => {
    // Check if ANY card across all types starts with this letter
    const totalLetterCount = cards.filter(card => {
      const name = card.dataset.name ? card.dataset.name.toUpperCase() : '';
      return name.startsWith(letter);
    }).length;

    const isDisabled = totalLetterCount === 0;

    matrixHtml += `
      <button 
        class="matrix-column-header ${isDisabled ? 'disabled' : ''}" 
        data-letter="${letter}"
        ${isDisabled ? 'disabled' : ''}
        title="Show all places starting with ${letter} (${totalLetterCount})"
      >
        ${letter}
      </button>
    `;
  });

  // 3. Render Type Rows
  pointTypes.forEach(type => {
    const typeCount = cards.filter(card => card.dataset.pointtype === type).length;

    // Type Label Button
    matrixHtml += `
      <button 
        class="matrix-row-label" 
        data-type="${type}" 
        title="Show all ${type} places (${typeCount})"
      >
        ${type}
      </button>
    `;

    // Individual Cell Letter Buttons (Type + Letter combo)
    alphabet.forEach(letter => {
      const matchCount = cards.filter(card => {
        const cType = card.dataset.pointtype;
        const cName = card.dataset.name ? card.dataset.name.toUpperCase() : '';
        return cType === type && cName.startsWith(letter);
      }).length;

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

  // 4. Multi-Behavior Click Filter Handler
  let activeElement = null;

  matrixContainer.addEventListener('click', (e) => {
    // Detect clicks on Top Header Buttons, Side Type Labels, or Cell Buttons
    const btn = e.target.closest('.matrix-column-header, .matrix-row-label, .matrix-btn');
    if (!btn || btn.classList.contains('disabled')) return;

    // Toggle off if clicking the currently active button again
    if (activeElement === btn) {
      btn.classList.remove('active');
      activeElement = null;
      showAllCards();
      return;
    }

    // Deactivate previous active button
    if (activeElement) activeElement.classList.remove('active');

    // Activate selected button
    btn.classList.add('active');
    activeElement = btn;

    const filterType = btn.dataset.type || null;
    const filterLetter = btn.dataset.letter || null;

    cards.forEach(card => {
      const cType = card.dataset.pointtype;
      const cName = card.dataset.name ? card.dataset.name.toUpperCase() : '';

      // CASE 1: Specific Cell Clicked (Type AND Letter)
      if (filterType && filterLetter) {
        if (cType === filterType && cName.startsWith(filterLetter)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      } 
      // CASE 2: Side Row Button Clicked (Type ONLY)
      else if (filterType && !filterLetter) {
        if (cType === filterType) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      } 
      // CASE 3: Top Header Button Clicked (Letter ONLY across all Types)
      else if (!filterType && filterLetter) {
        if (cName.startsWith(filterLetter)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      }
    });
  });

  // Reset Button
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (activeElement) {
        activeElement.classList.remove('active');
        activeElement = null;
      }
      showAllCards();
    });
  }

  function showAllCards() {
    cards.forEach(card => card.style.display = 'flex');
  }
});
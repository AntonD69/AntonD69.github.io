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
     3. FILTER MATRIX COMPONENT (TYPE, LETTER, YEAR & PROVINCE)
     ========================================================================== */
  const matrixContainer = document.getElementById('filter-matrix');
  const resetBtn = document.getElementById('reset-filter-btn');
  const cards = Array.from(document.querySelectorAll('.visitedPlace-card'));

  if (!matrixContainer || cards.length === 0) return;

  // 1. Full Type Names Mapping
  const TYPE_NAMES = {
    TT: "Tar Town",
    TP: "Tar Passes",
    DT: "Dusty Town",
    DP: "Dusty Passes",
    CS: "Campsite",
    SP: "Special Points",
    P1: "Top place",

    MM: "Monument",
    MT: "Tunnel",
    GR: "Game Reserve",
    NR: "Nature Reserve",

    BP: "Border Post",
    DM: "Dam",
    DW: "Dam Walls",

    DR: "DirtRoad",
    JH: "JotH",
    LH: "Lighthouse",
    TR: "Toyrun",
    MR: "Railway Tunnel",
    OT: "Other",
    HB: "Harbours"
  };

  // 2. Full Province / Region Names Mapping
  const PROVINCE_NAMES = {
    // South Africa (ZA)
    "ZA-EC": "Eastern Cape",
    "ZA-FS": "Free State",
    "ZA-GP": "Gauteng",
    "ZA-KZN": "KwaZulu-Natal",
    "ZA-KZ": "KwaZulu-Natal",
    "ZA-LP": "Limpopo",
    "ZA-MP": "Mpumalanga",
    "ZA-NC": "Northern Cape",
    "ZA-NW": "North West",
    "ZA-WC": "Western Cape",

    // Lesotho (LS)
    "LS-BB": "Berea",
    "LS-LR": "Leribe",
    "LS-MA": "Maseru",
    "LS-ML": "Mokhotlong",
    "LS-TT": "Thaba-Tseka",

    // Other Regions
    "ES-HH": "Hhohho (Eswatini)",
    "NL-SH": "South Holland (Netherlands)"
  };

  // 3. Custom Display Order for Types
  const TYPE_ORDER = [
    "TT", "TP", "DT", "DP", "SP", "CS", "MT", "P1", "MM", "GR", "NR",
    "DM", "DW", "DR", "JH", "LH", "TR", "MR", "OT", "HB", "BP"
  ];

  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const rawTypes = [...new Set(cards.map(card => card.dataset.pointtype).filter(Boolean))];

  // Sort PointTypes based on TYPE_ORDER array
  const pointTypes = rawTypes.sort((a, b) => {
    const indexA = TYPE_ORDER.indexOf(a) !== -1 ? TYPE_ORDER.indexOf(a) : 999;
    const indexB = TYPE_ORDER.indexOf(b) !== -1 ? TYPE_ORDER.indexOf(b) : 999;
    return indexA - indexB;
  });

  // Extract unique years (descending)
  const years = [
    ...new Set(
      cards.map(card => {
        const dateStr = card.dataset.date || '';
        const year = dateStr.split('-')[0];
        return year.length === 4 ? year : null;
      }).filter(Boolean)
    )
  ].sort((a, b) => b - a);

  // Extract unique Provinces/Areas (alphabetical)
  const rawProvinces = [
    ...new Set(cards.map(card => (card.dataset.area || '').trim()).filter(Boolean))
  ];

  const provinces = rawProvinces.sort((a, b) => {
    const nameA = PROVINCE_NAMES[a] || a;
    const nameB = PROVINCE_NAMES[b] || b;
    return nameA.localeCompare(nameB);
  });

  // Pre-process card metadata
  const cardData = cards.map(card => ({
    element: card,
    type: card.dataset.pointtype || '',
    nameLetter: (card.dataset.name || '').trim().charAt(0).toUpperCase(),
    year: (card.dataset.date || '').split('-')[0],
    province: (card.dataset.area || '').trim()
  }));

  // Render Matrix Header Row
  let matrixHtml = `<div class="matrix-cell-header">Type</div>`;

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

  // Render Matrix Type Rows
  pointTypes.forEach(type => {
    const displayName = TYPE_NAMES[type] || type;
    const typeCount = cardData.filter(c => c.type === type).length;

    matrixHtml += `
      <label class="matrix-row-label" title="Toggle all ${displayName} places (${typeCount})">
        <span>${displayName}</span>
        <input type="checkbox" class="type-checkbox" data-type="${type}" checked />
      </label>
    `;

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
          title="${displayName} starting with ${letter} (${matchCount} places)"
        >
          ${letter}
        </button>
      `;
    });
  });

  // Render Bottom Year Row
  if (years.length > 0) {
    matrixHtml += `
      <div class="matrix-year-row">
        <span class="matrix-filter-label-title">Year:</span>
        <div class="matrix-extra-items">
    `;
    years.forEach(year => {
      const yearCount = cardData.filter(c => c.year === year).length;

      matrixHtml += `
        <label class="matrix-year-item" title="Toggle year ${year} (${yearCount} places)">
          <span>${year}</span>
          <input 
            type="checkbox" 
            class="year-checkbox" 
            data-year="${year}" 
            checked 
          />
        </label>
      `;
    });
    matrixHtml += `</div></div>`;
  }

  // Render Bottom Province Row (Uses PROVINCE_NAMES)
  if (provinces.length > 0) {
    matrixHtml += `
      <div class="matrix-province-row">
        <span class="matrix-filter-label-title">Province:</span>
        <div class="matrix-extra-items">
    `;
    provinces.forEach(prov => {
      const displayName = PROVINCE_NAMES[prov] || prov;
      const provCount = cardData.filter(c => c.province === prov).length;

      matrixHtml += `
        <label class="matrix-province-item" title="Toggle ${displayName} (${provCount} places)">
          <span>${displayName}</span>
          <input 
            type="checkbox" 
            class="province-checkbox" 
            data-province="${prov}" 
            checked 
          />
        </label>
      `;
    });
    matrixHtml += `</div></div>`;
  }

  matrixContainer.innerHTML = matrixHtml;

  /* ==========================================================================
     4. UNIFIED FILTER ENGINE & EXCLUSIVE SELECTION LOGIC
     ========================================================================== */
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

    // 3. Collect checked Years
    const checkedYears = Array.from(
      matrixContainer.querySelectorAll('.year-checkbox:checked')
    ).map(cb => cb.dataset.year);

    // 4. Collect checked Provinces
    const checkedProvinces = Array.from(
      matrixContainer.querySelectorAll('.province-checkbox:checked')
    ).map(cb => cb.dataset.province);

    // Update 'has-checked' visual state for all filter badges
    matrixContainer.querySelectorAll('.matrix-row-label, .matrix-column-header, .matrix-year-item, .matrix-province-item').forEach(label => {
      const cb = label.querySelector('input[type="checkbox"]');
      label.classList.toggle('has-checked', Boolean(cb && cb.checked));
    });

    const activeCellType = activeCellBtn ? activeCellBtn.dataset.type : null;
    const activeCellLetter = activeCellBtn ? activeCellBtn.dataset.letter : null;

    // 5. Evaluate card visibility
    cardData.forEach(({ element, type, nameLetter, year, province }) => {
      const matchesType = checkedTypes.includes(type);
      const matchesLetter = checkedLetters.includes(nameLetter);
      const matchesYear = checkedYears.length === 0 || checkedYears.includes(year);
      const matchesProvince = checkedProvinces.length === 0 || checkedProvinces.includes(province);

      // Enforce cell-level filtering if an interior button is active
      let matchesCell = true;
      if (activeCellType && activeCellLetter) {
        matchesCell = (type === activeCellType && nameLetter === activeCellLetter);
      }

      element.style.display = (matchesType && matchesLetter && matchesYear && matchesProvince && matchesCell) ? 'flex' : 'none';
    });
  }

  // Initial Filter Pass
  applyFilters();

  // Handle Clicks on Matrix Headers, Row Labels, Years, and Provinces
  matrixContainer.addEventListener('click', e => {
    const rowLabel = e.target.closest('.matrix-row-label');
    const colHeader = e.target.closest('.matrix-column-header');
    const yearItem = e.target.closest('.matrix-year-item');
    const provinceItem = e.target.closest('.matrix-province-item');

    // Scenario A: User clicked directly on any <input type="checkbox">
    if (e.target.matches('input[type="checkbox"]')) {
      if (activeCellBtn) {
        activeCellBtn.classList.remove('active');
        activeCellBtn = null;
      }
      applyFilters();
      return;
    }

    // Scenario B: User clicked the Label/Button body (Isolate single filter option)
    if (rowLabel) {
      e.preventDefault();
      const targetCb = rowLabel.querySelector('.type-checkbox');

      if (activeCellBtn) {
        activeCellBtn.classList.remove('active');
        activeCellBtn = null;
      }

      matrixContainer.querySelectorAll('.type-checkbox').forEach(cb => {
        cb.checked = (cb === targetCb);
      });

      applyFilters();
    } 
    else if (colHeader && !colHeader.classList.contains('disabled')) {
      e.preventDefault();
      const targetCb = colHeader.querySelector('.header-letter-checkbox');

      if (activeCellBtn) {
        activeCellBtn.classList.remove('active');
        activeCellBtn = null;
      }

      matrixContainer.querySelectorAll('.header-letter-checkbox').forEach(cb => {
        cb.checked = (cb === targetCb);
      });

      applyFilters();
    }
    else if (yearItem) {
      e.preventDefault();
      const targetCb = yearItem.querySelector('.year-checkbox');

      if (activeCellBtn) {
        activeCellBtn.classList.remove('active');
        activeCellBtn = null;
      }

      matrixContainer.querySelectorAll('.year-checkbox').forEach(cb => {
        cb.checked = (cb === targetCb);
      });

      applyFilters();
    }
    else if (provinceItem) {
      e.preventDefault();
      const targetCb = provinceItem.querySelector('.province-checkbox');

      if (activeCellBtn) {
        activeCellBtn.classList.remove('active');
        activeCellBtn = null;
      }

      matrixContainer.querySelectorAll('.province-checkbox').forEach(cb => {
        cb.checked = (cb === targetCb);
      });

      applyFilters();
    }
  });

  // Handle Inner Cell Buttons (A-Z inside the matrix grid)
  matrixContainer.addEventListener('click', e => {
    if (e.target.closest('.matrix-row-label, .matrix-column-header, .matrix-year-item, .matrix-province-item')) return;

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

    const cellType = btn.dataset.type;
    const cellLetter = btn.dataset.letter;

    matrixContainer.querySelectorAll('.type-checkbox').forEach(cb => {
      cb.checked = (cb.dataset.type === cellType);
    });

    matrixContainer.querySelectorAll('.header-letter-checkbox').forEach(cb => {
      cb.checked = (cb.dataset.letter === cellLetter);
    });

    applyFilters();
  });

  // Handle Reset Button
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
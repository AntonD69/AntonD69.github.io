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
     3. FILTER & SORT MATRIX COMPONENT
     ========================================================================== */
  const matrixContainer = document.getElementById('filter-matrix');
  const resetBtn = document.getElementById('reset-filter-btn');
  const sortDateBtn = document.getElementById('sort-date-btn');
  const sortNameBtn = document.getElementById('sort-name-btn');
  const gridContainer = document.querySelector('.visited-grid');
  const cards = Array.from(document.querySelectorAll('.visitedPlace-card'));

  if (!matrixContainer || cards.length === 0) return;

  // 1. Full Type Names Mapping
  const TYPE_NAMES = {
    TT: "Tar Towns",
    TP: "Tar Passes",
    DT: "Dusty Towns",
    DP: "Dusty Passes",

	CS: "Campsites",
	AC: "Accommodation",
	SP: "Special Points",

    MM: "Monuments",
    MT: "Road Tunnels",
    MR: "Railway Tunnels",

	DM: "Dams",
    DW: "Dam Walls",
    LH: "Lighthouses",
    HB: "Harbours",
	OS: "Ocean/Sea",

	GR: "Game Reserves",
    NR: "Nature Reserves",

	DR: "DirtRoads",
    JH: "JotH",
    TR: "Toyruns",
    OT: "Other",

	BP: "Border Posts",
    P1: "Top places",
  };

  // Category map linking URL hash tags to PointType codes
  const CATEGORY_MAP = {
    'towns': ['TT', 'DT'],
    'passes': ['TP', 'DP'],
	'interesting': ['SP', 'CS', 'JH'],
	'reserves' : ['GR','NR'],
	'other' : ['MM','BP','DR', 'TR', 'OT'],
	'water' : ['DM','DW','LH','HB','OS'],
	'tunnels' : ['MR','MT'],
	'roads' : ['TP', 'DP', 'DR'],
	'accommodation' : ['CS','AC']
  };

  // 2. Full Province / Region Names Mapping
  const PROVINCE_NAMES = {
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

    "LS-BB": "Berea",
    "LS-LR": "Leribe",
    "LS-MA": "Maseru",
    "LS-ML": "Mokhotlong",
    "LS-TT": "Thaba-Tseka",

    "ES-HH": "Hhohho (Eswatini)",
    "NL-SH": "South Holland (Netherlands)"
  };

  // 3. Custom Display Order for Types
  const TYPE_ORDER = [
    "TT", "TP", "DT", "DP", "SP", "AC", "CS", 
	"DM", "DW","LH","HB","OS",  //Water
	"MT", "MR", "MM", "GR", "NR",
    "DR", "JH",  "TR", "MR", "OT", , "BP"
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
  let cardData = cards.map(card => ({
    element: card,
    type: card.dataset.pointtype || '',
    name: (card.dataset.name || '').trim(),
    nameLetter: (card.dataset.name || '').trim().charAt(0).toUpperCase(),
    date: card.dataset.date || '',
    year: (card.dataset.date || '').split('-')[0],
    province: (card.dataset.area || '').trim()
  }));

  /* --- Sorting Functionality --- */
  function sortCards(type) {
    if (type === 'date') {
      if (sortDateBtn) sortDateBtn.classList.add('active');
      if (sortNameBtn) sortNameBtn.classList.remove('active');
      cardData.sort((a, b) => b.date.localeCompare(a.date)); // Newest first
    } else if (type === 'name') {
      if (sortNameBtn) sortNameBtn.classList.add('active');
      if (sortDateBtn) sortDateBtn.classList.remove('active');
      cardData.sort((a, b) => a.name.localeCompare(b.name)); // A to Z
    }

    if (gridContainer) {
      cardData.forEach(item => gridContainer.appendChild(item.element));
    }
  }

  if (sortDateBtn) {
    sortDateBtn.addEventListener('click', () => sortCards('date'));
  }
  if (sortNameBtn) {
    sortNameBtn.addEventListener('click', () => sortCards('name'));
  }

  // Initial Sort Pass (Default to Date)
  sortCards('date');

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

  // Render Bottom Province Row
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
    // Extract URL hashes (e.g., #Towns#Passes)
    const rawHash = window.location.hash.replace(/^#/, '');
    const hashFilters = rawHash
      .split('#')
      .map(tag => tag.trim().toLowerCase())
      .filter(Boolean);

    // 1. Toggle container class based on hash presence
    if (hashFilters.length > 0) {
      matrixContainer.classList.add('has-url-hash');

      // Expand mapped categories into target PointType codes
      const hashTypes = new Set();
      hashFilters.forEach(filter => {
        if (CATEGORY_MAP[filter]) {
          CATEGORY_MAP[filter].forEach(code => hashTypes.add(code.toUpperCase()));
        } else {
          hashTypes.add(filter.toUpperCase());
        }
      });

      // Update type checkboxes based on matching URL tags
      matrixContainer.querySelectorAll('.type-checkbox').forEach(cb => {
        cb.checked = hashTypes.has(cb.dataset.type.toUpperCase());
      });
    } else {
      matrixContainer.classList.remove('has-url-hash');
    }

    // 2. Collect checked values across all categories
    const checkedTypes = Array.from(
      matrixContainer.querySelectorAll('.type-checkbox:checked')
    ).map(cb => cb.dataset.type);

    const checkedLetters = Array.from(
      matrixContainer.querySelectorAll('.header-letter-checkbox:checked')
    ).map(cb => cb.dataset.letter);

    const checkedYears = Array.from(
      matrixContainer.querySelectorAll('.year-checkbox:checked')
    ).map(cb => cb.dataset.year);

    const checkedProvinces = Array.from(
      matrixContainer.querySelectorAll('.province-checkbox:checked')
    ).map(cb => cb.dataset.province);

    // 3. Update visual state & hide ONLY unchecked Type rows when hash exists
    matrixContainer.querySelectorAll('.matrix-row-label').forEach(label => {
      const cb = label.querySelector('.type-checkbox');
      const isChecked = Boolean(cb && cb.checked);
      label.classList.toggle('has-checked', isChecked);

      // Hide/Show ONLY the type row label and its 26 associated grid buttons
      const type = cb ? cb.dataset.type : null;
      if (type) {
        label.classList.toggle('hidden-by-hash', !isChecked);
        matrixContainer.querySelectorAll(`.matrix-btn[data-type="${type}"]`).forEach(btn => {
          btn.classList.toggle('hidden-by-hash', !isChecked);
        });
      }
    });

    // 4. Update Year items visual state ONLY (Keep visible, just update checkbox/border)
    matrixContainer.querySelectorAll('.matrix-year-item').forEach(item => {
      const cb = item.querySelector('.year-checkbox');
      item.classList.toggle('has-checked', Boolean(cb && cb.checked));
      item.classList.remove('hidden-by-hash'); // Always keep visible
    });

    // 5. Update Province items visual state ONLY (Keep visible, just update checkbox/border)
    matrixContainer.querySelectorAll('.matrix-province-item').forEach(item => {
      const cb = item.querySelector('.province-checkbox');
      item.classList.toggle('has-checked', Boolean(cb && cb.checked));
      item.classList.remove('hidden-by-hash'); // Always keep visible
    });

    // 6. Update top column letter headers visual state
    matrixContainer.querySelectorAll('.matrix-column-header').forEach(header => {
      const cb = header.querySelector('.header-letter-checkbox');
      header.classList.toggle('has-checked', Boolean(cb && cb.checked));
    });

    const activeCellType = activeCellBtn ? activeCellBtn.dataset.type : null;
    const activeCellLetter = activeCellBtn ? activeCellBtn.dataset.letter : null;

    // 7. Evaluate card visibility
    cardData.forEach(({ element, type, nameLetter, year, province }) => {
      const matchesType = checkedTypes.includes(type);
      const matchesLetter = checkedLetters.includes(nameLetter);
      const matchesYear = checkedYears.length === 0 || checkedYears.includes(year);
      const matchesProvince = checkedProvinces.length === 0 || checkedProvinces.includes(province);

      let matchesCell = true;
      if (activeCellType && activeCellLetter) {
        matchesCell = (type === activeCellType && nameLetter === activeCellLetter);
      }

      element.style.display = (matchesType && matchesLetter && matchesYear && matchesProvince && matchesCell) ? 'flex' : 'none';
    });
  }

  /* ==========================================================================
     5. URL HASH SYNC ENGINE
     ========================================================================== */
  function syncFiltersWithHash() {
    const rawHash = window.location.hash.replace(/^#/, '');
    const activeTags = rawHash
      .split('#')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0);

    // Reset active cell selection if active
    if (activeCellBtn) {
      activeCellBtn.classList.remove('active');
      activeCellBtn = null;
    }

    if (activeTags.length === 0) {
      // If no hash is set, default to checking all type checkboxes
      matrixContainer.querySelectorAll('.type-checkbox').forEach(cb => {
        cb.checked = true;
      });
    } else {
      // Resolve target PointTypes from CATEGORY_MAP or direct type match
      const targetPointTypes = new Set();
      activeTags.forEach(tag => {
        if (CATEGORY_MAP[tag]) {
          CATEGORY_MAP[tag].forEach(code => targetPointTypes.add(code.toUpperCase()));
        } else {
          targetPointTypes.add(tag.toUpperCase());
        }
      });

      // Update checkboxes to only check matched types
      matrixContainer.querySelectorAll('.type-checkbox').forEach(cb => {
        cb.checked = targetPointTypes.has(cb.dataset.type.toUpperCase());
      });
    }

    applyFilters();
  }

  // Initial Filter Pass via Hash
  syncFiltersWithHash();

  // Re-apply filters on hash change (e.g. clicking anchor links)
  window.addEventListener('hashchange', syncFiltersWithHash);

  // Handle Clicks on Matrix Headers, Row Labels, Years, and Provinces
// Handle Clicks on Matrix Headers, Row Labels, Years, and Provinces
  matrixContainer.addEventListener('click', e => {
    const rowLabel = e.target.closest('.matrix-row-label');
    const colHeader = e.target.closest('.matrix-column-header');
    const yearItem = e.target.closest('.matrix-year-item');
    const provinceItem = e.target.closest('.matrix-province-item');

    // Prevent toggling row checkboxes if URL hash mode is active
    const hasHash = window.location.hash.length > 1;

    // Scenario A: User clicked directly on any <input type="checkbox">
    if (e.target.matches('input[type="checkbox"]')) {
      if (activeCellBtn) {
        activeCellBtn.classList.remove('active');
        activeCellBtn = null;
      }
      applyFilters();
      return;
    }

    // Scenario B: User clicked the Label/Button body
    if (rowLabel) {
      e.preventDefault();
      
      // Ignore click toggling if URL hash is pinning the categories
      if (hasHash) return;

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
function showView(viewId) {
  console.log('Showing view:', viewId);
  // Your view switching logic here
}

function sortBy(mode) {
    console.log('Sorting by:', mode);
  const container = document.getElementById('parkrun-container') || document.querySelector('.parkrun-grid');

  if (!container) {
    console.error('Could not find parkrun container in the DOM.');
    return;
  }
  const cards = Array.from(container.getElementsByClassName('parkrun-card'));

cards.sort((a, b) => {
    const nameA = (a.dataset.name || '').trim();
    const nameB = (b.dataset.name || '').trim();
    
    const dateA = a.dataset.date || '';
    const dateB = b.dataset.date || '';

    // Convert MyPrId to numbers for accurate numerical sorting
    const prIdA = parseInt(a.dataset.prId, 10) || 0;
    const prIdB = parseInt(b.dataset.prId, 10) || 0;

    if (mode === 'alphabetical') {
      const nameComparison = nameA.localeCompare(nameB);
      // Secondary sort: if names match, lower MyPrId first
      return nameComparison !== 0 ? nameComparison : prIdA - prIdB;

    } else if (mode === 'date-desc') {
      const dateDiff = new Date(dateB) - new Date(dateA);
      // Secondary sort: if dates match, lower MyPrId first
      return dateDiff !== 0 ? dateDiff : prIdA - prIdB;

    } else if (mode === 'date-asc') {
      const dateDiff = new Date(dateA) - new Date(dateB);
      // Secondary sort: if dates match, lower MyPrId first
      return dateDiff !== 0 ? dateDiff : prIdA - prIdB;
    }
  });
  
  // cards.sort((a, b) => {
  //   if (mode === 'alphabetical') {
  //     return a.dataset.name.localeCompare(b.dataset.name);
  //   } else if (mode === 'date-desc') {
  //     return new Date(b.dataset.date) - new Date(a.dataset.date);
  //   }
  // });

  // Re-append cards in sorted order
  cards.forEach(card => container.appendChild(card));
}

window.showView = showView;
window.sortBy = sortBy;
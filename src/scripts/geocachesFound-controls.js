document.addEventListener('DOMContentLoaded', () => {
  const cards = Array.from(document.querySelectorAll('.geocache-card'));
  const searchInput = document.getElementById('searchInput');
  const yearFilter = document.getElementById('yearFilter');
  const countryFilter = document.getElementById('countryFilter');
  const provinceFilter = document.getElementById('provinceFilter');
  const showingCountEl = document.getElementById('showing-count');

  const countryCounts = {};
  const countryProvinces = {};
  const yearsSet = new Set();

  // Index data directly from DOM elements
  cards.forEach(card => {
    const year = card.dataset.year;
    const country = card.dataset.country;
    const province = card.dataset.province;

    if (year && year !== 'UNKNOWN') yearsSet.add(year);

    if (country && country !== 'UNKNOWN') {
      countryCounts[country] = (countryCounts[country] || 0) + 1;
      if (!countryProvinces[country]) countryProvinces[country] = new Set();
      if (province && province !== 'UNKNOWN') countryProvinces[country].add(province);
    }
  });

  // Populate Year options
  const years = Array.from(yearsSet).sort().reverse();
  years.forEach(y => yearFilter.add(new Option(y, y)));

  // Set default filter to the latest year available
  if (years.length > 0) {
    yearFilter.value = years[0];
  }

  // Populate Country options
  Object.keys(countryCounts).sort().forEach(c => {
    countryFilter.add(new Option(`${c} (${countryCounts[c]})`, c));
  });

  // Event Listeners
  searchInput.addEventListener('input', applyFilters);
  yearFilter.addEventListener('change', applyFilters);
  countryFilter.addEventListener('change', handleCountryChange);
  provinceFilter.addEventListener('change', applyFilters);

  function handleCountryChange() {
    const selectedCountry = countryFilter.value;
    provinceFilter.innerHTML = '<option value="">All Provinces</option>';

    // Enable province selection ONLY if selected country has > 100 finds
    if (selectedCountry && countryCounts[selectedCountry] > 100) {
      provinceFilter.disabled = false;
      const provinces = Array.from(countryProvinces[selectedCountry] || []).sort();
      provinces.forEach(p => provinceFilter.add(new Option(p, p)));
    } else {
      provinceFilter.disabled = true;
    }

    applyFilters();
  }

  function applyFilters() {
    const search = searchInput.value.toLowerCase().trim();
    const selectedYear = yearFilter.value;
    const selectedCountry = countryFilter.value;
    const selectedProvince = provinceFilter.value;
    const isProvinceActive = selectedCountry && countryCounts[selectedCountry] > 100;

    let visibleCount = 0;

    cards.forEach(card => {
      const nameMatch = !search || card.dataset.name.toLowerCase().includes(search);
      const yearMatch = !selectedYear || card.dataset.year === selectedYear;
      const countryMatch = !selectedCountry || card.dataset.country === selectedCountry;
      const provinceMatch = !isProvinceActive || !selectedProvince || card.dataset.province === selectedProvince;

      if (nameMatch && yearMatch && countryMatch && provinceMatch) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (showingCountEl) showingCountEl.textContent = visibleCount;
  }

  // Initial filter run
  applyFilters();
});
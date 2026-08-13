
  document.addEventListener('DOMContentLoaded', () => {
    const mainNav = document.getElementById('mainNav');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    // 1. Shrink header image and bar on scroll
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        mainNav.classList.add('scrolled');
      } else {
        mainNav.classList.remove('scrolled');
      }
    });

    // 2. Mobile Menu Toggle
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    // 3. Level 2 Dropdown handling for Mobile tap/click
    const dropdownParents = document.querySelectorAll('.has-dropdown');
    
    dropdownParents.forEach(item => {
      const link = item.querySelector('.nav-link');
      
      link.addEventListener('click', (e) => {
        // Only override click behavior on mobile screens
        if (window.innerWidth <= 768) {
          e.preventDefault();
          item.classList.toggle('open');
        }
      });
    });
  });
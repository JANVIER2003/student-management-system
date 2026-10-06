document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.nav-menu a');
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  navLinks.forEach((link) => {
    const linkName = link.getAttribute('href');

    if (linkName === currentPage) {
      link.classList.add('active');
    }
  });
});

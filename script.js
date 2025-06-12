// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});

// Dark/Light toggle
const toggle = document.getElementById('themeSwitch');
toggle.addEventListener('change', () => {
  document.body.classList.toggle('light');
  document.body.classList.toggle('dark');
});
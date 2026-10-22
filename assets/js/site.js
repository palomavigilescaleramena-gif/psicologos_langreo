document.documentElement.classList.add('js');

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
const navGroups = [...document.querySelectorAll('.nav-group')];

function closeMenu() {
  if (!menuToggle) return;
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Abrir menú');
  document.body.classList.remove('menu-open');
}

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const opening = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(opening));
    menuToggle.setAttribute('aria-label', opening ? 'Cerrar menú' : 'Abrir menú');
    document.body.classList.toggle('menu-open', opening);
    if (!opening) navGroups.forEach(group => { group.open = false; });
  });

  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1200) closeMenu();
  });
}

navGroups.forEach(group => group.addEventListener('toggle', () => {
  if (group.open) navGroups.forEach(other => { if (other !== group) other.open = false; });
}));

document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  closeMenu();
  navGroups.forEach(group => { group.open = false; });
});

document.addEventListener('click', event => {
  if (!event.target.closest('.nav-group')) navGroups.forEach(group => { group.open = false; });
});

const scene = document.querySelector('.modalities');
if (scene && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .2 });
  observer.observe(scene);
}

const contactForm = document.querySelector('[data-mailto-form]');
if (contactForm) {
  contactForm.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(contactForm);
    const lines = [
      `Nombre: ${data.get('nombre') || ''}`,
      `Correo: ${data.get('correo') || ''}`,
      `Teléfono: ${data.get('telefono') || ''}`,
      '',
      String(data.get('mensaje') || '')
    ];
    const subject = encodeURIComponent('Consulta desde la web de Psicólogos Langreo');
    const body = encodeURIComponent(lines.join('\n'));
    window.location.href = `mailto:${contactForm.dataset.recipient}?subject=${subject}&body=${body}`;
  });
}

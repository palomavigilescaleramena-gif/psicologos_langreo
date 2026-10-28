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

const revealTitles = document.querySelectorAll('.hero h1, .statement p, .section-heading h2, .about h2, .modalities h2, .pricing__intro h2, .location h2, .location__call > p, .interior-intro h1, .therapy h2, .interior-cta p, .for-you-block__title');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (revealTitles.length && 'IntersectionObserver' in window && !reduceMotion) {
  revealTitles.forEach(title => {
    title.setAttribute('aria-label', title.textContent.replace(/\s+/g, ' ').trim());
    let index = 0;
    const walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach(node => {
      const parts = node.textContent.split(/(\s+)/);
      const fragment = document.createDocumentFragment();
      parts.forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) { fragment.append(part); return; }
        const word = document.createElement('span');
        word.className = 'reveal-word';
        word.setAttribute('aria-hidden', 'true');
        word.style.setProperty('--i', index++);
        word.textContent = part;
        fragment.append(word);
      });
      node.replaceWith(fragment);
    });
    title.classList.add('reveal-title');
  });

  const titleObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        titleObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .25, rootMargin: '0px 0px -8% 0px' });
  revealTitles.forEach(title => titleObserver.observe(title));
}

const serviceCards = [...document.querySelectorAll('.service-card')];
if (serviceCards.length > 1 && !reduceMotion) {
  let ticking = false;
  const updateCards = () => {
    ticking = false;
    serviceCards.forEach((card, i) => {
      const next = serviceCards[i + 1];
      if (!next || getComputedStyle(card).position !== 'sticky') {
        card.style.removeProperty('--card-scale');
        card.style.removeProperty('--card-overlay');
        return;
      }
      const stickyTop = parseFloat(getComputedStyle(card).top) || 0;
      const start = window.innerHeight;
      const progress = Math.min(Math.max((start - next.getBoundingClientRect().top) / (start - stickyTop), 0), 1);
      card.style.setProperty('--card-scale', (1 - progress * .05).toFixed(4));
      card.style.setProperty('--card-overlay', (Math.max(progress - .4, 0) / .6 * .025).toFixed(4));
    });
  };
  const requestUpdate = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(updateCards); }
  };
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  updateCards();
}

const revealImages = [
  ['.hero__art-img', 'zoom-in'],
  ['.statement__img', 'right'],
  ['.section-heading__img', 'up'],
  ['.service-card:nth-child(1) .service-card__img', 'zoom-in'],
  ['.service-card:nth-child(2) .service-card__img', 'right'],
  ['.service-card:nth-child(3) .service-card__img', 'up'],
  ['.service-card:nth-child(4) .service-card__img', 'left'],
  ['.about__photo img:not(.ai-badge)', 'zoom-out'],
  ['.interior-intro__img', 'up']
];
if ('IntersectionObserver' in window && !reduceMotion) {
  const imageObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        imageObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .15, rootMargin: '0px 0px -5% 0px' });
  revealImages.forEach(([selector, effect]) => {
    document.querySelectorAll(selector).forEach(image => {
      image.classList.add('reveal-img');
      image.dataset.reveal = effect;
      imageObserver.observe(image);
    });
  });
}

// Grupos que entran elemento a elemento: [contenedor, elementos, efecto, retardo entre cada uno en ms]
const revealGroups = [
  ['.faq-layout', '.faq-layout__intro, .faq-item', 'left', 110],
  ['.footer', '.footer__details > div > *, .footer__bottom > *', 'up', 90]
];
if ('IntersectionObserver' in window && !reduceMotion) {
  const groupObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const items = entry.target.querySelectorAll('.reveal-seq');
        entry.target.classList.add('is-in');
        groupObserver.unobserve(entry.target);
        // Al terminar, se quitan las clases para que los efectos al pasar el ratón funcionen sin retardo
        setTimeout(() => items.forEach(item => {
          item.classList.remove('reveal-seq');
          item.style.removeProperty('--seq-delay');
        }), items.length * 110 + 1200);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });
  revealGroups.forEach(([groupSelector, itemSelector, effect, step]) => {
    document.querySelectorAll(groupSelector).forEach(group => {
      group.querySelectorAll(itemSelector).forEach((item, i) => {
        item.classList.add('reveal-seq');
        item.dataset.reveal = effect;
        item.style.setProperty('--seq-delay', i * step + 'ms');
      });
      group.classList.add('reveal-group');
      groupObserver.observe(group);
    });
  });
}

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

// Preguntas frecuentes (hipnosis y página de preguntas): abren y cierran con transición, y solo una abierta a la vez
const faqMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll('.therapy-faq, .faq-list').forEach(group => {
  const items = [...group.querySelectorAll('details.faq-item')];
  // Sin name: el navegador cerraría las demás de golpe; lo controlamos aquí para animarlo
  items.forEach(item => item.removeAttribute('name'));

  const animate = (item, opening) => {
    const summary = item.querySelector('summary');
    const start = item.getBoundingClientRect().height;
    item.faqAnimation?.cancel();
    item.classList.toggle('is-closing', !opening);
    if (faqMotion.matches) { item.open = opening; item.classList.remove('is-closing'); return; }
    if (opening) item.open = true;
    const borders = item.offsetHeight - item.clientHeight;
    const end = opening ? item.scrollHeight + borders : summary.offsetHeight + borders;
    item.style.overflow = 'hidden';
    const animation = item.animate({ height: [`${start}px`, `${end}px`] }, { duration: 400, easing: 'cubic-bezier(.4, 0, .2, 1)' });
    item.faqAnimation = animation;
    animation.onfinish = () => {
      if (!opening) item.open = false;
      item.classList.remove('is-closing');
      item.style.overflow = '';
      item.faqAnimation = null;
    };
  };

  const isOpen = item => item.open && !item.classList.contains('is-closing');

  items.forEach(item => item.querySelector('summary').addEventListener('click', event => {
    event.preventDefault();
    const opening = !isOpen(item);
    if (opening) items.forEach(other => { if (other !== item && isOpen(other)) animate(other, false); });
    animate(item, opening);
  }));
});

// Desplegables con el mismo name: solo uno abierto a la vez (también en navegadores antiguos)
document.querySelectorAll('details[name]').forEach(item => item.addEventListener('toggle', () => {
  if (!item.open) return;
  document.querySelectorAll(`details[name="${item.getAttribute('name')}"]`).forEach(other => { if (other !== item) other.open = false; });
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

// Contacto: indica si la consulta está abierta ahora (hora de Madrid)
const openStatus = document.querySelector('[data-open-status]');
if (openStatus) {
  const updateStatus = () => {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date()).map(part => [part.type, part.value]));
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday);
    const minutes = Number(parts.hour) * 60 + Number(parts.minute);
    const weekday = day >= 1 && day <= 5;
    const open = weekday && ((minutes >= 540 && minutes < 780) || (minutes >= 960 && minutes < 1170));
    let text = 'Abierto ahora';
    if (!open) {
      if (weekday && minutes < 540) text = 'Cerrado · abrimos hoy a las 9:00';
      else if (weekday && minutes < 960) text = 'Cerrado · abrimos hoy a las 16:00';
      else if ((day >= 1 && day <= 4) || day === 0) text = 'Cerrado · abrimos mañana a las 9:00';
      else text = 'Cerrado · abrimos el lunes a las 9:00';
    }
    openStatus.textContent = text;
    openStatus.dataset.state = open ? 'open' : 'closed';
    openStatus.hidden = false;
  };
  updateStatus();
  setInterval(updateStatus, 60000);
}

const revealTitles = document.querySelectorAll('.statement p, .section-heading__title, .about__title, .modalities h2, .pricing__intro h2, .location h2, .location__call > p, .interior-intro h1, .therapy h2, .interior-cta p, .for-you-block__title');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Titular de portada: las letras de cada palabra empiezan cambiadas de sitio (se lee como un texto normal sin sentido)
// y luego viajan a su posición, unas por arriba y otras por abajo, letra a letra y las tres filas a la vez
const scrambleTitle = document.querySelector('.hero__title');
if (scrambleTitle && !reduceMotion && 'animate' in Element.prototype) {
  const originalHTML = scrambleTitle.innerHTML;
  const fullText = scrambleTitle.textContent.replace(/\s+/g, ' ').trim();
  const words = [];
  const chars = [];
  scrambleTitle.setAttribute('aria-label', fullText);
  scrambleTitle.style.visibility = 'hidden';
  const walker = document.createTreeWalker(scrambleTitle, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  textNodes.forEach(node => {
    const fragment = document.createDocumentFragment();
    node.textContent.split(/(\s+)/).forEach(part => {
      if (!part) return;
      if (/^\s+$/.test(part)) { fragment.append(part); return; }
      const word = document.createElement('span');
      word.className = 'scramble-word';
      word.setAttribute('aria-hidden', 'true');
      const wordChars = [...part].map(letter => {
        const char = document.createElement('span');
        char.className = 'scramble-char';
        char.textContent = letter;
        char.isLetter = /\p{L}/u.test(letter);
        word.append(char);
        chars.push(char);
        return char;
      });
      words.push(wordChars);
      fragment.append(word);
    });
    node.replaceWith(fragment);
  });

  const shuffle = list => {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const start = () => {
    // Orden desordenado de cada palabra: las letras se barajan entre los huecos de letra; la puntuación no se mueve
    words.forEach(wordChars => {
      const letters = wordChars.filter(char => char.isLetter);
      let mixed = shuffle(letters);
      for (let tries = 0; tries < 6 && letters.length > 1 && mixed.every((char, i) => char.textContent === letters[i].textContent); tries++) mixed = shuffle(letters);
      let k = 0;
      const scrambledOrder = wordChars.map(char => (char.isLetter ? mixed[k++] : char));
      const widths = new Map(wordChars.map(char => [char, char.getBoundingClientRect().width]));
      let x = 0;
      const finalLeft = new Map(wordChars.map(char => { const left = x; x += widths.get(char); return [char, left]; }));
      x = 0;
      scrambledOrder.forEach(char => {
        char.dx = x - finalLeft.get(char);
        x += widths.get(char);
      });
    });

    // Cada letra empieza en un momento al azar y tarda un tiempo distinto: no salen a la vez ni llegan a la vez
    const hold = 0;                          // sin espera: las letras empiezan a moverse en cuanto aparece el titular
    const startSpread = 800;                 // ms en los que se reparten al azar las salidas de las letras
    const minDuration = 450, maxDuration = 950; // ms que tarda cada letra en llegar a su sitio (al azar entre ambos)
    const lift = .55;                        // altura media del arco, en em
    let lastEnd = 0;
    const animations = chars.map(char => {
      const dx = char.dx || 0;
      const moving = Math.abs(dx) > .5;
      // Cada letra elige al azar si pasa por arriba o por abajo, y con una altura algo distinta,
      // sin depender de si va a la derecha o a la izquierda
      const dy = moving ? (Math.random() < .5 ? -1 : 1) * lift * (.6 + Math.random() * .8) : 0;
      const delay = hold + Math.random() * startSpread;
      const duration = minDuration + Math.random() * (maxDuration - minDuration);
      lastEnd = Math.max(lastEnd, delay + duration);
      return char.animate([
        { transform: `translate(${dx}px, 0)` },
        { transform: `translate(${dx / 2}px, ${dy}em)`, offset: .5 },
        { transform: 'translate(0, 0)' }
      ], { duration, delay, easing: 'cubic-bezier(.45, 0, .2, 1)', fill: 'backwards' });
    });
    scrambleTitle.style.visibility = '';
    Promise.all(animations.map(animation => animation.finished)).catch(() => {}).then(() => {
      scrambleTitle.innerHTML = originalHTML;
      scrambleTitle.removeAttribute('aria-label');
    });
  };

  // Medimos con la tipografía ya cargada; si tarda, se mide igualmente para no dejar el titular oculto
  let started = false;
  const go = () => { if (!started) { started = true; start(); } };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go);
  setTimeout(go, 800);
  if (!document.fonts) go();
}
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
  ['.interior-intro__img', 'up'],
  // Páginas de cada terapia: los bloques de texto aparecen al llegar a ellos
  ['.therapy--single > :not(h2):not(aside), .therapy-note > :not(h2)', 'text'],
  // Pedir ayuda: cada párrafo de la franja negra aparece al llegar a él
  ['.for-you-copy__text > p', 'text']
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
    });
  });
  // El navegador calcula el estado escondido antes de observar; así la entrada siempre se anima
  document.body.getBoundingClientRect();
  document.querySelectorAll('.reveal-img').forEach(image => imageObserver.observe(image));
}

// Grupos que entran elemento a elemento: [contenedor, elementos, efecto, retardo entre cada uno en ms]
const revealGroups = [
  ['.faq-layout', '.faq-layout__intro, .faq-item', 'left', 110],
  ['.footer', '.footer__details > div > *, .footer__bottom > *', 'up', 90],
  ['.therapies-layout--single .therapies-index', '.section-index, li', 'left', 140],
  ['.contact-grid--cards', '.contact-card', 'up', 120]
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
    });
  });
  document.body.getBoundingClientRect();
  document.querySelectorAll('.reveal-group').forEach(group => groupObserver.observe(group));
}

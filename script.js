const destinations = {
  santorini: { name: 'Santorini', region: 'Greece', image: 'https://d8j0ntlcm91z4.cloudfront.net/user_3GKMiha1iPa2ChLGK39TrTm5HzW/hf_20260717_105934_90d6fefd-099e-43f8-be01-2b9b06ed3f87.png', description: 'Whitewashed villages, volcanic shorelines, and candlelit dinners above the Aegean. Santorini is best experienced slowly, with time to follow the light and find its quieter corners.', highlights: ['Private sunset sail beneath the caldera', 'Clifftop suites in Oia and Imerovigli', 'Vineyard tastings with a local sommelier'], gallery: ['https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?auto=format&fit=crop&w=1200&q=85', 'https://images.unsplash.com/photo-1504512485720-7d83a16ee930?auto=format&fit=crop&w=900&q=85', 'https://images.unsplash.com/photo-1469796466635-455ede028aca?auto=format&fit=crop&w=900&q=85'] },
  maldives: { name: 'Maldives', region: 'Indian Ocean', image: 'https://d8j0ntlcm91z4.cloudfront.net/user_3GKMiha1iPa2ChLGK39TrTm5HzW/hf_20260717_105939_26f75666-1b3b-46ca-a2c2-0400ea14a766.png', description: 'A world of barely-there horizons and water in every shade of blue. Spend your days between a private villa, quiet reefs, and long lunches with nowhere else to be.', highlights: ['Overwater villas with private pools', 'Traditional dhoni sunset cruises', 'Ocean-to-table dining on a sandbank'], gallery: ['https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1200&q=85', 'https://images.unsplash.com/photo-1505881502353-a1986add3762?auto=format&fit=crop&w=900&q=85', 'https://images.unsplash.com/photo-1589197331516-4e0b4e4b3a15?auto=format&fit=crop&w=900&q=85'] },
  kyoto: { name: 'Kyoto', region: 'Japan', image: 'https://images.unsplash.com/photo-1754672519474-b63317b52ccd?auto=format&fit=crop&w=1800&q=90', description: 'Kyoto rewards a curious pace. Tea houses, moss gardens, and generations of craft reveal themselves in the spaces between the famous sights.', highlights: ['Private tea ceremony with a master', 'Seasonal kaiseki in Gion', 'Early morning walk through Arashiyama'], gallery: ['https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=85', 'https://images.unsplash.com/photo-1491884662610-dfcd28f30cfb?auto=format&fit=crop&w=900&q=85', 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=900&q=85'] }
};

const destinationModal = document.querySelector('#destination-modal');
const plannerModal = document.querySelector('#planner-modal');
const destinationView = document.querySelector('#destination-view');
const journeyForm = document.querySelector('#journey-form');
const success = document.querySelector('.success');
const plannerAside = document.querySelector('.planner-aside');
const plannerBody = document.querySelector('.planner-body');
const creature = document.querySelector('.form-creature');
const creatureEyes = document.querySelectorAll('.form-creature .eye');
const quickSearch = document.querySelector('.quick-search');
const header = document.querySelector('.header');
const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');
const backToTop = document.querySelector('.back-to-top');
const progressFill = document.querySelector('.progress-fill');
const heroPhoto = document.querySelector('.hero-photo');
const newsletterForm = document.querySelector('.newsletter-form');
const newsletterNote = document.querySelector('.footer-note');

let lastFocusedElement = null;

const planeCursor = document.createElement('div');
planeCursor.className = 'cursor-plane';
planeCursor.innerHTML = '<span></span>';
document.body.appendChild(planeCursor);

function showModal(modal) {
  if (!modal) return;
  lastFocusedElement = document.activeElement;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  const firstField = modal.querySelector('input, select, textarea, button.close');
  if (firstField) window.requestAnimationFrame(() => firstField.focus());
}

function hideModal(modal) {
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (lastFocusedElement && document.contains(lastFocusedElement)) {
    lastFocusedElement.focus();
  }
}

function trapFocus(event, modal) {
  if (event.key !== 'Tab') return;
  const focusable = modal.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (!focusable.length) return;
  const list = Array.from(focusable).filter((el) => !el.disabled && el.offsetParent !== null);
  const first = list[0];
  const last = list[list.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function openDestination(key) {
  const destination = destinations[key];
  if (!destination || !destinationView) return;

  destinationView.innerHTML = `
    <div class="destination-hero">
      <img src="${destination.image}" alt="${destination.name}, ${destination.region}" />
      <div class="destination-title">
        <p class="eyebrow">${destination.region}</p>
        <h2 id="destination-name">${destination.name}</h2>
      </div>
    </div>
    <div class="destination-body">
      <div class="destination-info">
        <p>${destination.description}</p>
        <div>
          <h3>Made for lingering</h3>
          <ul class="highlights">${destination.highlights.map((item) => `<li>${item}</li>`).join('')}</ul>
        </div>
      </div>
      <div class="gallery">
        <img loading="lazy" decoding="async" src="${destination.gallery[0]}" alt="Travel scene in ${destination.name}" />
        <div>
          <img loading="lazy" decoding="async" src="${destination.gallery[1]}" alt="Luxury detail from ${destination.name}" />
          <img loading="lazy" decoding="async" src="${destination.gallery[2]}" alt="Experience in ${destination.name}" />
        </div>
      </div>
      <div class="stay-pitch">
        <div>
          <p class="eyebrow">Aurelia's point of view</p>
          <h3>Stay longer. See deeper.</h3>
          <p>We'll shape your time around the season, the stays that suit you, and experiences that make a place feel personal.</p>
        </div>
        <button class="plan-destination" data-place="${destination.name}">Plan this journey →</button>
      </div>
      <p class="destination-guide-link"><a href="${key}.html">Read the full ${destination.name} guide →</a></p>
    </div>`;
  showModal(destinationModal);
}

function updatePlaneCursor(event) {
  planeCursor.style.left = `${event.clientX}px`;
  planeCursor.style.top = `${event.clientY}px`;
}

function openPlanner(destination = '', prefill = {}) {
  hideModal(destinationModal);

  if (journeyForm) {
    journeyForm.hidden = false;
    journeyForm.reset();
    clearFormErrors(journeyForm);
    if (destination && journeyForm.elements.destination) {
      journeyForm.elements.destination.value = destination;
    }
    if (prefill.dates && journeyForm.elements.dates) {
      journeyForm.elements.dates.value = prefill.dates;
    }
    if (prefill.guests && journeyForm.elements.guests) {
      const guestOptions = Array.from(journeyForm.elements.guests.options);
      const match = guestOptions.find((opt) => opt.value.startsWith(prefill.guests.charAt(0)));
      if (match) journeyForm.elements.guests.value = match.value;
    }
  }

  if (plannerAside) plannerAside.hidden = false;
  if (success) success.hidden = true;
  const submitBtn = journeyForm ? journeyForm.querySelector('.submit') : null;
  if (submitBtn) {
    submitBtn.classList.remove('is-loading');
    submitBtn.disabled = false;
  }
  const alertBox = journeyForm ? journeyForm.querySelector('.form-alert') : null;
  if (alertBox) alertBox.classList.remove('show');

  showModal(plannerModal);
  activateCreature();
}

// Header scroll state + active nav link
const sections = document.querySelectorAll('main section[id]');
const navLinks = document.querySelectorAll('.header nav a, .mobile-nav a[href^="#"]');

function onScroll() {
  if (header) header.classList.toggle('is-scrolled', window.scrollY > 40);
  if (backToTop) backToTop.classList.toggle('visible', window.scrollY > 600);

  if (progressFill) {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progressFill.style.width = `${Math.min(100, Math.max(0, pct))}%`;
  }

  let currentId = '';
  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= 140 && rect.bottom >= 140) currentId = section.id;
  });
  navLinks.forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
  });
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Reveal on scroll — sections fade/settle in, and reverse again if you
// scroll back past them, so the motion feels alive in both directions.
const revealTargets = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && revealTargets.length) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('in-view', entry.isIntersecting);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
  revealTargets.forEach((target) => revealObserver.observe(target));
} else {
  revealTargets.forEach((target) => target.classList.add('in-view'));
}

// ---- Granular reveal for individual text and images ----
// Automatically tags headings, paragraphs, cards, and images throughout the
// page so they animate in on their own (with a light stagger) rather than
// the whole section moving as one flat block — and animate back out again
// if you scroll past them in either direction.
(function initGranularReveal() {
  const containers = document.querySelectorAll(
    '.reveal, .destination-article, .article-page, .legal-page, .hero'
  );
  if (!containers.length) return;

  const itemSelector = [
    'h1', 'h2', 'h3', 'p:not(.eyebrow)',
    '.destination-card', '.testimonial-grid > article', '.journal-grid > article',
    '.faq-item', '.gallery > div', '.highlights li', '.press-row span',
    '.stat-chip', '.calculator-panel'
  ].join(', ');

  // Elements that already have their own hover-driven transform transition —
  // these get an opacity-only reveal so hover motion stays snappy.
  const fadeOnlySelector = '.destination-card, .faq-item';

  const tagged = new Set();

  containers.forEach((container) => {
    const items = container.matches(itemSelector) ? [container] : Array.from(container.querySelectorAll(itemSelector));
    items.forEach((el, index) => {
      if (tagged.has(el) || el.closest('.modal')) return;
      // Skip elements whose ancestor is already being animated as a unit
      // (e.g. a <p> inside a .faq-item or .destination-card that itself reveals).
      if (el.parentElement && el.parentElement.closest('.reveal-text, .reveal-image, .reveal-fade')) return;

      tagged.add(el);

      const isImageish =
        el.tagName === 'IMG' ||
        el.classList.contains('gallery') ||
        !!el.querySelector('img');

      const revealClass = el.matches(fadeOnlySelector) ? 'reveal-fade' : (isImageish ? 'reveal-image' : 'reveal-text');
      el.classList.add(revealClass);
      el.style.setProperty('--reveal-delay', `${(index % 5) * 0.07}s`);
    });
  });

  const revealItems = document.querySelectorAll('.reveal-text, .reveal-image, .reveal-fade');
  if (!('IntersectionObserver' in window) || !revealItems.length) {
    revealItems.forEach((el) => el.classList.add('in-view'));
    return;
  }

  const itemObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('in-view', entry.isIntersecting);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });

  revealItems.forEach((el) => itemObserver.observe(el));
})();

// Subtle cursor parallax on the hero photo (desktop pointer devices only)
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
if (heroPhoto && isFinePointer && !prefersReducedMotion) {
  const heroSection = document.querySelector('.hero');
  let ticking = false;
  heroSection.addEventListener('mousemove', (event) => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      const rect = heroSection.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 18;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 18;
      heroPhoto.style.transform = `scale(1.06) translate(${x}px, ${y}px)`;
      ticking = false;
    });
  });
  heroSection.addEventListener('mouseleave', () => {
    heroPhoto.style.transform = 'scale(1.06) translate(0, 0)';
  });
}

function activateCreature() {
  if (plannerBody) plannerBody.classList.add('is-creature-active');
  if (creature) creature.classList.remove('is-sad');
}

function deactivateCreature() {
  if (plannerBody) plannerBody.classList.remove('is-creature-active');
  if (creature) creature.classList.add('is-sad');
  if (creatureEyes) {
    creatureEyes.forEach((eye) => {
      eye.style.transform = 'translate(0, 0)';
    });
  }
}

function followCreatureCursor(event) {
  if (!creature || !creatureEyes.length) return;
  const rect = creature.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width - 0.5) * 5;
  const y = ((event.clientY - rect.top) / rect.height - 0.5) * 5;
  creatureEyes.forEach((eye) => {
    eye.style.transform = `translate(${x}px, ${y}px)`;
  });
}

if (plannerBody && creature) {
  const formFields = plannerBody.querySelectorAll('input, select, textarea, button');

  plannerBody.addEventListener('pointerenter', (event) => {
    activateCreature();
    followCreatureCursor(event);
  });
  plannerBody.addEventListener('pointermove', (event) => {
    activateCreature();
    followCreatureCursor(event);
  });
  plannerBody.addEventListener('pointerleave', (event) => {
    if (!plannerBody.contains(event.relatedTarget)) {
      deactivateCreature();
    }
  });

  formFields.forEach((field) => {
    field.addEventListener('focus', activateCreature);
    field.addEventListener('blur', (event) => {
      if (!plannerBody.contains(event.relatedTarget)) {
        deactivateCreature();
      }
    });
  });

  journeyForm?.addEventListener('focusin', activateCreature);
  journeyForm?.addEventListener('focusout', (event) => {
    if (!plannerBody.contains(event.relatedTarget)) {
      deactivateCreature();
    }
  });
}

// Mobile nav
if (menuToggle && mobileNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
  mobileNav.querySelectorAll('a, button').forEach((el) => {
    el.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}

// Back to top
if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Event Listeners
document.querySelectorAll('[data-destination]').forEach((card) => {
  card.addEventListener('click', (event) => {
    event.preventDefault();
    openDestination(card.dataset.destination);
  });
  card.addEventListener('pointerenter', () => {
    planeCursor.classList.add('is-visible');
  });
  card.addEventListener('pointermove', (event) => {
    updatePlaneCursor(event);
    planeCursor.classList.add('is-visible');
  });
  card.addEventListener('pointerleave', () => {
    planeCursor.classList.remove('is-visible');
  });
});

document.querySelectorAll('[data-open-planner]').forEach((trigger) => {
  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    openPlanner();
  });
});

if (quickSearch) {
  quickSearch.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(quickSearch);
    const destinationValue = (formData.get('destination') || '').trim();
    openPlanner(destinationValue, {
      dates: (formData.get('dates') || '').trim(),
      guests: (formData.get('guests') || '').trim()
    });
  });
}

if (destinationView) {
  destinationView.addEventListener('click', (event) => {
    const button = event.target.closest('[data-place]');
    if (button) openPlanner(button.dataset.place);
  });
}

document.querySelectorAll('[data-close]').forEach((button) => {
  button.addEventListener('click', () => {
    hideModal(destinationModal);
    hideModal(plannerModal);
  });
});

[destinationModal, plannerModal].forEach((modal) => {
  if (!modal) return;
  modal.addEventListener('keydown', (event) => trapFocus(event, modal));
});

// ---- Journey form validation + submission ----
function clearFormErrors(form) {
  form.querySelectorAll('.field-error').forEach((el) => el.classList.remove('field-error'));
  const alertBox = form.querySelector('.form-alert');
  if (alertBox) alertBox.classList.remove('show');
}

function setFieldError(field, message) {
  const wrapper = field.closest('label');
  if (!wrapper) return;
  wrapper.classList.add('field-error');
  let msg = wrapper.querySelector('.field-error-msg');
  if (!msg) {
    msg = document.createElement('span');
    msg.className = 'field-error-msg';
    wrapper.appendChild(msg);
  }
  msg.textContent = message;
}

function validateJourneyForm(form) {
  clearFormErrors(form);
  let firstInvalid = null;
  const errors = [];

  const name = form.elements.name;
  if (!name.value.trim() || name.value.trim().length < 2) {
    setFieldError(name, 'Please enter your full name.');
    errors.push(name);
  }

  const email = form.elements.email;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email.value.trim())) {
    setFieldError(email, 'Enter a valid email address.');
    errors.push(email);
  }

  const phone = form.elements.phone;
  if (phone.value.trim() && !/^[0-9+()\-\s]{7,}$/.test(phone.value.trim())) {
    setFieldError(phone, 'Enter a valid phone number.');
    errors.push(phone);
  }

  const destinationField = form.elements.destination;
  if (!destinationField.value) {
    setFieldError(destinationField, 'Choose a destination.');
    errors.push(destinationField);
  }

  const dates = form.elements.dates;
  if (!dates.value.trim()) {
    setFieldError(dates, 'Let us know your travel window.');
    errors.push(dates);
  }

  const guests = form.elements.guests;
  if (!guests.value) {
    setFieldError(guests, 'Select the number of guests.');
    errors.push(guests);
  }

  if (errors.length) firstInvalid = errors[0];
  return firstInvalid;
}

if (journeyForm) {
  journeyForm.addEventListener('submit', (event) => {
    event.preventDefault();

    // Honeypot spam check
    const honeypot = journeyForm.elements.website;
    if (honeypot && honeypot.value) {
      return;
    }

    const firstInvalid = validateJourneyForm(journeyForm);
    if (firstInvalid) {
      firstInvalid.focus();
      const alertBox = journeyForm.querySelector('.form-alert');
      if (alertBox) {
        alertBox.textContent = 'Please check the highlighted fields and try again.';
        alertBox.classList.add('show');
      }
      return;
    }

    const submitBtn = journeyForm.querySelector('.submit');
    if (submitBtn) {
      submitBtn.classList.add('is-loading');
      submitBtn.disabled = true;
    }

    const formData = new FormData(journeyForm);
    const payload = Object.fromEntries(formData.entries());
    const apiBase = window.location.protocol === 'file:' ? 'http://localhost:3000' : '';

    fetch(`${apiBase}/api/book-journey`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.error || 'Unable to send your inquiry right now.');
        }
        return data;
      })
      .then(() => {
        if (submitBtn) {
          submitBtn.classList.remove('is-loading');
          submitBtn.disabled = false;
        }
        journeyForm.hidden = true;
        if (plannerAside) plannerAside.hidden = true;
        if (success) {
          success.hidden = false;
          success.setAttribute('tabindex', '-1');
          success.focus();
        }
      })
      .catch((error) => {
        if (submitBtn) {
          submitBtn.classList.remove('is-loading');
          submitBtn.disabled = false;
        }
        const alertBox = journeyForm.querySelector('.form-alert');
        if (alertBox) {
          alertBox.textContent = error.message || 'Unable to send your inquiry right now.';
          alertBox.classList.add('show');
        }
      });
  });

  journeyForm.querySelectorAll('input, select, textarea').forEach((field) => {
    field.addEventListener('input', () => {
      const wrapper = field.closest('label');
      if (wrapper) wrapper.classList.remove('field-error');
    });
  });
}

// ---- Newsletter form ----
if (newsletterForm) {
  newsletterForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = newsletterForm.querySelector('input[type="email"]');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!input || !emailPattern.test(input.value.trim())) {
      if (newsletterNote) newsletterNote.textContent = 'Please enter a valid email address.';
      return;
    }

    const submitBtn = newsletterForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    if (newsletterNote) newsletterNote.textContent = 'Sending…';

    const apiBase = window.location.protocol === 'file:' ? 'http://localhost:3000' : '';

    fetch(`${apiBase}/api/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: input.value.trim() })
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Unable to subscribe right now.');
        return data;
      })
      .then(() => {
        if (newsletterNote) newsletterNote.textContent = 'Thank you — you are on the list.';
        newsletterForm.reset();
      })
      .catch((error) => {
        if (newsletterNote) newsletterNote.textContent = error.message || 'Unable to subscribe right now.';
      })
      .finally(() => {
        if (submitBtn) submitBtn.disabled = false;
      });
  });
}

// ---- Trip cost estimator ----
const estimateForm = document.querySelector('#estimate-form');
const estimateFigure = document.querySelector('#estimate-figure');

const DESTINATION_NIGHTLY_RATE = {
  santorini: 620,
  maldives: 950,
  kyoto: 480,
  other: 550
};

const STYLE_MULTIPLIER = {
  relaxation: 1,
  culture: 1.05,
  adventure: 1.1,
  celebration: 1.3
};

function guestMultiplier(guests) {
  // Diminishing marginal cost per extra guest (shared villas/suites).
  const extra = Math.max(0, guests - 1);
  return 1 + extra * 0.55;
}

function formatUSD(value) {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function updateEstimate() {
  if (!estimateForm || !estimateFigure) return;
  const formData = new FormData(estimateForm);
  const destination = formData.get('destination') || 'other';
  const nights = Math.min(30, Math.max(2, Number(formData.get('nights')) || 7));
  const guests = Number(formData.get('guests')) || 2;
  const style = formData.get('style') || 'relaxation';

  const nightlyRate = DESTINATION_NIGHTLY_RATE[destination] || DESTINATION_NIGHTLY_RATE.other;
  const styleFactor = STYLE_MULTIPLIER[style] || 1;
  const base = nightlyRate * nights * guestMultiplier(guests) * styleFactor;

  const low = Math.round((base * 0.85) / 100) * 100;
  const high = Math.round((base * 1.2) / 100) * 100;

  estimateFigure.textContent = `${formatUSD(low)} – ${formatUSD(high)}`;
}

if (estimateForm) {
  estimateForm.addEventListener('input', updateEstimate);
  estimateForm.addEventListener('change', updateEstimate);
  updateEstimate();
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    hideModal(destinationModal);
    hideModal(plannerModal);
    if (mobileNav && mobileNav.classList.contains('open')) {
      mobileNav.classList.remove('open');
      if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  }
});

/* ══════════════════════════════════════════════════════════
   THE FOREST DAK BUNGALOW — JavaScript
   Interactions: Nav scroll, Reveal animations,
   Lightbox, Mobile menu, Form handling
══════════════════════════════════════════════════════════ */

'use strict';

// ─── Nav: scroll state ────────────────────────────────────
const nav = document.getElementById('main-nav');

function onScroll() {
  if (window.scrollY > 60) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ─── Hero: trigger load animation ────────────────────────
window.addEventListener('load', () => {
  document.querySelector('.hero')?.classList.add('loaded');
});

// ─── Mobile Navigation ────────────────────────────────────
const burger  = document.getElementById('nav-burger');
const navList = document.getElementById('nav-links');

burger?.addEventListener('click', () => {
  const isOpen = navList.classList.toggle('open');
  burger.setAttribute('aria-expanded', String(isOpen));
  // Animate burger bars
  const bars = burger.querySelectorAll('span');
  if (isOpen) {
    bars[0].style.cssText = 'transform: rotate(45deg) translate(4.5px, 4.5px)';
    bars[1].style.cssText = 'opacity: 0; transform: scaleX(0)';
    bars[2].style.cssText = 'transform: rotate(-45deg) translate(4.5px, -4.5px)';
  } else {
    bars.forEach(b => b.removeAttribute('style'));
  }
});

// Close mobile nav when a link is clicked
navList?.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => {
    navList.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    burger.querySelectorAll('span').forEach(b => b.removeAttribute('style'));
  });
});

// ─── Scroll Reveal with IntersectionObserver ─────────────
const revealTargets = document.querySelectorAll('.reveal, .reveal-img');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -60px 0px'
});

revealTargets.forEach(el => revealObserver.observe(el));

// ─── Gallery Lightbox ─────────────────────────────────────
const galleryItems = document.querySelectorAll('.gallery__item');
const lightbox     = document.getElementById('lightbox');
const lightboxImg  = document.getElementById('lightbox-img');
const lightboxCap  = document.getElementById('lightbox-caption');
const closeBtn     = document.getElementById('lightbox-close');
const prevBtn      = document.getElementById('lightbox-prev');
const nextBtn      = document.getElementById('lightbox-next');

let currentGalleryIndex = 0;

const galleryData = Array.from(galleryItems).map(item => ({
  src: item.querySelector('img')?.src || '',
  alt: item.querySelector('img')?.alt || '',
  caption: item.querySelector('.gallery__caption')?.textContent || ''
}));

function openLightbox(index) {
  currentGalleryIndex = index;
  updateLightbox();
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
  lightbox.focus();
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

function updateLightbox() {
  const data = galleryData[currentGalleryIndex];
  if (!data) return;
  lightboxImg.src = data.src;
  lightboxImg.alt = data.alt;
  lightboxCap.textContent = data.caption;
}

function showPrev() {
  currentGalleryIndex = (currentGalleryIndex - 1 + galleryData.length) % galleryData.length;
  updateLightbox();
}

function showNext() {
  currentGalleryIndex = (currentGalleryIndex + 1) % galleryData.length;
  updateLightbox();
}

galleryItems.forEach((item, index) => {
  item.addEventListener('click', () => openLightbox(index));
  item.setAttribute('tabindex', '0');
  item.setAttribute('role', 'button');
  item.setAttribute('aria-label', `View image: ${galleryData[index]?.caption || ''}`);
  item.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openLightbox(index);
    }
  });
});

closeBtn?.addEventListener('click', closeLightbox);
prevBtn?.addEventListener('click', showPrev);
nextBtn?.addEventListener('click', showNext);

lightbox?.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (e) => {
  if (!lightbox?.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') showPrev();
  if (e.key === 'ArrowRight') showNext();
});

// ─── Smooth anchor scrolling (offset for nav) ─────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const targetId = anchor.getAttribute('href').slice(1);
    const target = document.getElementById(targetId);
    if (!target) return;
    e.preventDefault();
    const navHeight = parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--nav-h'), 10) || 80;
    const y = target.getBoundingClientRect().top + window.scrollY - navHeight;
    window.scrollTo({ top: y, behavior: 'smooth' });
  });
});

// ─── Enquiry Form Handling ────────────────────────────────
const form        = document.getElementById('inquiry-form');
const formSuccess = document.getElementById('form-success');
const submitBtn   = document.getElementById('form-submit-btn');

function validateForm(formEl) {
  let valid = true;
  const requiredFields = formEl.querySelectorAll('[required]');
  requiredFields.forEach(field => {
    if (!field.value.trim()) {
      valid = false;
      field.classList.add('field-error');
    } else {
      field.classList.remove('field-error');
    }
  });

  // Email format
  const emailField = formEl.querySelector('#guest-email');
  if (emailField && emailField.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
    valid = false;
    emailField.classList.add('field-error');
  }

  // Date logic
  const checkin  = formEl.querySelector('#checkin-date')?.value;
  const checkout = formEl.querySelector('#checkout-date')?.value;
  if (checkin && checkout && new Date(checkout) <= new Date(checkin)) {
    valid = false;
    formEl.querySelector('#checkout-date')?.classList.add('field-error');
  }

  return valid;
}

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validateForm(form)) return;

  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending…';

  // Simulate async submission (replace with real endpoint)
  await new Promise(resolve => setTimeout(resolve, 1500));

  form.setAttribute('hidden', '');
  formSuccess.removeAttribute('hidden');
});

// Remove error class on input
form?.querySelectorAll('input, select, textarea').forEach(field => {
  field.addEventListener('input', () => field.classList.remove('field-error'));
});

// ─── Date inputs: set min date to today ──────────────────
const today = new Date().toISOString().split('T')[0];
document.getElementById('checkin-date')?.setAttribute('min', today);
document.getElementById('checkout-date')?.setAttribute('min', today);

document.getElementById('checkin-date')?.addEventListener('change', (e) => {
  const checkoutField = document.getElementById('checkout-date');
  if (checkoutField && e.target.value) {
    checkoutField.setAttribute('min', e.target.value);
  }
});

// ─── Subtle nav active section highlight ─────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav__link:not(.nav__link--cta)');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.remove('nav__link--active');
        if (link.getAttribute('href') === '#' + entry.target.id) {
          link.classList.add('nav__link--active');
        }
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(section => sectionObserver.observe(section));

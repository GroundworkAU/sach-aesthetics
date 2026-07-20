/* Sach Aesthetics - minimal progressive enhancement */

(function () {
  'use strict';

  /* ---- Mobile drawer ---- */
  var burger = document.querySelector('.burger');
  var drawer = document.getElementById('drawer');

  if (burger && drawer) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      drawer.setAttribute('data-open', String(!open));
      document.body.style.overflow = !open ? 'hidden' : '';
    });

    drawer.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        burger.setAttribute('aria-expanded', 'false');
        drawer.setAttribute('data-open', 'false');
        document.body.style.overflow = '';
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.getAttribute('data-open') === 'true') {
        burger.setAttribute('aria-expanded', 'false');
        drawer.setAttribute('data-open', 'false');
        document.body.style.overflow = '';
        burger.focus();
      }
    });
  }

  /* ---- Scroll reveals ---- */
  var reveals = document.querySelectorAll('[data-reveal]');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!reveals.length) return;

  if (reduced || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      var delay = parseInt(el.getAttribute('data-reveal-delay') || '0', 10);
      setTimeout(function () { el.classList.add('is-in'); }, delay);
      io.unobserve(el);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

  reveals.forEach(function (el) { io.observe(el); });
})();

/* ---- Contact form ---- */
(function () {
  'use strict';

  var form = document.querySelector('form[action="/api/contact"]');
  if (!form) return;

  var status = form.querySelector('.form__status');
  var button = form.querySelector('button[type="submit"]');
  var label = button ? button.textContent : 'Send message';

  function show(text, state) {
    if (!status) return;
    status.textContent = text;
    status.setAttribute('data-state', state);
    status.hidden = false;
  }

  // Someone arriving back here after a no-JavaScript submission
  var params = new URLSearchParams(window.location.search);
  if (params.get('sent')) {
    show('Thank you, your message has been sent. I will be in touch within two business days.', 'ok');
  } else if (params.get('error')) {
    show('Something went wrong sending that. Please try again, or reach me on Instagram.', 'error');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var data = {};
    new FormData(form).forEach(function (value, key) { data[key] = value; });

    if (button) { button.disabled = true; button.textContent = 'Sending'; }

    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(function (res) {
        return res.json().then(function (payload) { return { ok: res.ok, payload: payload }; });
      })
      .then(function (result) {
        if (result.ok) {
          form.reset();
          show('Thank you, your message has been sent. I will be in touch within two business days.', 'ok');
        } else {
          show(result.payload.error || 'Could not send that. Please try again.', 'error');
        }
      })
      .catch(function () {
        show('Could not send that. Please check your connection and try again.', 'error');
      })
      .then(function () {
        if (button) { button.disabled = false; button.textContent = label; }
      });
  });
})();

/* ---- Footer year ---- */
document.querySelectorAll('[data-year]').forEach(function (el) {
  el.textContent = new Date().getFullYear();
});

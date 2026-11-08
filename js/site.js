(function () {
  var body = document.body, drawer = document.getElementById('drawer'), scrim = document.getElementById('scrim'), lastFocus = null;
  // In a frame sized to the whole page nothing scrolls, so place the drawer beside the button that opened it.
  function inFrame() { return document.documentElement.scrollHeight <= window.innerHeight + 40; }
  function open(trigger) {
    lastFocus = trigger;
    var t = trigger && trigger.dataset.track; if (t) document.querySelector('input[name=track][value=' + t + ']').checked = true;
    if (inFrame()) {
      var y = Math.max(0, Math.min(trigger.getBoundingClientRect().top - 300, document.documentElement.scrollHeight - 900));
      drawer.classList.add('is-inframe'); scrim.classList.add('is-inframe'); drawer.style.top = y + 'px';
      scrim.style.top = 0; scrim.style.height = document.documentElement.scrollHeight + 'px';
    }
    body.classList.add('drawer-open'); drawer.setAttribute('aria-hidden', 'false');
    setTimeout(function () { document.getElementById('fn').focus({ preventScroll: true }); }, 400);
  }
  function close() { body.classList.remove('drawer-open'); drawer.setAttribute('aria-hidden', 'true'); if (lastFocus) lastFocus.focus({ preventScroll: true }); }
  document.querySelectorAll('.js-apply').forEach(function (b) { b.addEventListener('click', function () { open(b); }); });
  document.getElementById('close').addEventListener('click', close);
  scrim.addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && body.classList.contains('drawer-open')) close(); });

  document.getElementById('form').addEventListener('submit', function (e) {
    e.preventDefault(); var bad = 0;
    [['fn', function (v) { return v.trim().length > 1; }, 'Add your full name so we can enrol you.'],
     ['em', function (v) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v); }, 'Add a full email, like you@example.com.']].forEach(function (f) {
      var el = document.getElementById(f[0]), box = el.closest('.th-field'), help = box.querySelector('.th-field__help');
      if (f[1](el.value)) { box.classList.remove('is-error'); el.removeAttribute('aria-invalid'); help.textContent = help.dataset.help; }
      else { bad++; box.classList.add('is-error'); el.setAttribute('aria-invalid', 'true'); help.textContent = f[2]; }
    });
    if (bad) return;
    var form = this, btn = form.querySelector('button[type=submit]'), label = btn.firstChild.textContent;
    var t = document.querySelector('input[name=track]:checked').value.toUpperCase();
    function done() {
      document.getElementById('okmsg').textContent = ' We\u2019ve emailed your ' + t + ' welcome pack. Orientation is on the first Saturday.';
      document.getElementById('ok').classList.remove('hidden');
      var s = form.querySelectorAll('.th-step'); s[1].classList.replace('is-current', 'is-done'); s[1].removeAttribute('aria-current'); s[2].classList.add('is-current'); s[2].setAttribute('aria-current', 'step');
      form.reset(); btn.disabled = true; btn.firstChild.textContent = 'Application sent ';
    }
    document.getElementById('fail').classList.add('hidden');
    // Until a real Formspree form ID is in the action URL, the form stays a demo.
    if (form.action.indexOf('YOUR_FORM_ID') !== -1) { done(); return; }
    btn.disabled = true; btn.firstChild.textContent = 'Sending\u2026 ';
    fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      .then(function (r) { if (!r.ok) throw new Error(r.status); done(); })
      .catch(function () { btn.disabled = false; btn.firstChild.textContent = label; document.getElementById('fail').classList.remove('hidden'); });
  });

  // carousel
  var rail = document.getElementById('rail'), prev = document.getElementById('prev'), next = document.getElementById('next');
  function stepW() { var c = rail.querySelector('.step'); return c.getBoundingClientRect().width + 16; }
  function sync() { prev.disabled = rail.scrollLeft < 4; next.disabled = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4; }
  prev.addEventListener('click', function () { rail.scrollBy({ left: -stepW(), behavior: 'smooth' }); });
  next.addEventListener('click', function () { rail.scrollBy({ left: stepW(), behavior: 'smooth' }); });
  rail.addEventListener('scroll', sync, { passive: true }); sync();
  var down = false, sx = 0, sl = 0;
  rail.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; sx = e.clientX; sl = rail.scrollLeft; rail.style.scrollSnapType = 'none'; });
  window.addEventListener('pointermove', function (e) { if (down) rail.scrollLeft = sl - (e.clientX - sx); });
  window.addEventListener('pointerup', function () { if (down) { down = false; rail.style.scrollSnapType = ''; } });

  // reveal + hero parallax
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: 0.12 });
  document.querySelectorAll('.rv').forEach(function (el, i) { if (reduce) el.classList.add('in'); else { el.style.transitionDelay = (i < 4 ? i * 90 : 0) + 'ms'; io.observe(el); } });
  if (!reduce) window.addEventListener('scroll', function () { var y = window.scrollY; document.querySelectorAll('[data-par]').forEach(function (a) { a.style.transform = 'translateY(' + (y * a.dataset.par) + 'px)'; }); }, { passive: true });
})();

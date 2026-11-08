(function () {
  var form = document.getElementById('contact-form');
  var btn = form.querySelector('.send'), label = btn.querySelector('.send__label');
  var checks = [
    ['c-name', function (v) { return v.trim().length > 0; }, 'Add your name.'],
    ['c-surname', function (v) { return v.trim().length > 0; }, 'Add your surname.'],
    ['c-email', function (v) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v); }, 'Add a full email, like you@example.com.'],
    ['c-msg', function (v) { return v.trim().length > 2; }, 'Write a short message so we know how to help.']
  ];
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = 0, first = null;
    checks.forEach(function (c) {
      var el = document.getElementById(c[0]), box = el.closest('.uf'), err = box.querySelector('.uf__err');
      if (c[1](el.value)) { box.classList.remove('is-error'); el.removeAttribute('aria-invalid'); err.textContent = ''; }
      else { bad++; first = first || el; box.classList.add('is-error'); el.setAttribute('aria-invalid', 'true'); err.textContent = c[2]; }
    });
    var priv = document.getElementById('c-privacy'), perr = document.getElementById('c-privacy-err');
    if (!priv.checked) { bad++; first = first || priv; perr.textContent = 'Please accept the Terms of Use and Privacy Policy to send.'; } else perr.textContent = '';
    if (bad) { first.focus(); return; }
    document.getElementById('c-fail').classList.add('hidden');
    btn.disabled = true; label.textContent = 'Sending…';
    fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        form.reset(); label.textContent = 'Sent';
        document.getElementById('c-ok').classList.remove('hidden');
      })
      .catch(function () {
        btn.disabled = false; label.textContent = 'Send';
        document.getElementById('c-fail').classList.remove('hidden');
      });
  });
})();

/* "Good to know" scroll story. The stage stays pinned while scroll progress drives:
   yellow grid + title -> orange grid with a growing red pixel blob -> red with a pixel
   smiley -> a giant line of FAQ questions sliding across. Then the FAQ card's question
   words darken as it scrolls through the viewport. */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Word-by-word reveal for the FAQ questions (works with or without the story).
  var words = [];
  document.querySelectorAll('.gtk-q').forEach(function (q) {
    q.innerHTML = q.textContent.split(' ').map(function (w) { return '<span class="w">' + w + '</span>'; }).join(' ');
    words = words.concat([].slice.call(q.querySelectorAll('.w')));
  });
  var faq = document.querySelector('.gtk-faq');
  function revealWords() {
    if (!faq || reduce) return;
    var r = faq.getBoundingClientRect(), vh = window.innerHeight;
    var p = (vh * 0.85 - r.top) / (r.height * 0.9 + vh * 0.2);
    var n = Math.round(Math.max(0, Math.min(1, p)) * words.length);
    for (var i = 0; i < words.length; i++) words[i].classList.toggle('on', i < n);
  }

  var pin = document.querySelector('.gtk-pin');
  if (!pin || reduce) { window.addEventListener('scroll', revealWords, { passive: true }); revealWords(); return; }

  var stage = pin.querySelector('.gtk-stage'), canvas = pin.querySelector('.gtk-canvas'), ctx = canvas.getContext('2d');
  var title = pin.querySelector('.gtk-title'), blobText = pin.querySelector('.gtk-blobtext'), run = pin.querySelector('.gtk-run');
  var css = getComputedStyle(document.documentElement);
  function tok(n, f) { return css.getPropertyValue(n).trim() || f; }
  var C = { sun: tok('--sun', '#ffd60a'), orange: tok('--tangerine', '#ff8c1a'), red: tok('--poppy', '#ee3d3d'), purple: tok('--grape', '#b266f8'), ink: '#111111' };

  var SMILEY = [
    '....#######....',
    '..##.......##..',
    '.#...........#.',
    '.#...#...#...#.',
    '#....#...#....#',
    '#....#...#....#',
    '#.............#',
    '#..#.......#..#',
    '#...#.....#...#',
    '#....#####....#',
    '.#...........#.',
    '.#...........#.',
    '..##.......##..',
    '....#######....'
  ];
  var smileCells = [];
  SMILEY.forEach(function (row, y) { for (var x = 0; x < row.length; x++) if (row[x] === '#') smileCells.push([x, y]); });
  // stable scattered build order
  smileCells.forEach(function (c, i) { c.push((Math.sin(i * 91.7) * 1e4) % 1); });
  smileCells.sort(function (a, b) { return Math.abs(a[2]) - Math.abs(b[2]); });

  var w = 0, h = 0, dpr = 1, p = 0, ticking = false;

  function hex(c) { c = c.replace('#', ''); return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)]; }
  function mix(a, b, t) { var x = hex(a), y = hex(b); return 'rgb(' + x.map(function (v, i) { return Math.round(v + (y[i] - v) * t); }).join(',') + ')'; }
  function seg(a, b) { return Math.max(0, Math.min(1, (p - a) / (b - a))); }
  function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  function resize() {
    var r = stage.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2); w = r.width; h = r.height;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    render();
  }

  function render() {
    if (!w) return;
    var cols = w > 900 ? 28 : 12, cell = w / cols, rows = Math.ceil(h / cell) + 1;
    var oy = (h - Math.floor(h / cell) * cell) / 2;          // centre the grid vertically

    // 1. ground colour: yellow -> orange
    var toOrange = ease(seg(0.13, 0.2));
    ctx.fillStyle = mix(C.sun, C.orange, toOrange); ctx.fillRect(0, 0, w, h);

    // 2. grid lines
    ctx.strokeStyle = 'rgba(17,17,17,.55)'; ctx.lineWidth = 1; ctx.beginPath();
    for (var i = 1; i < cols; i++) { var x = Math.round(i * cell) + 0.5; ctx.moveTo(x, 0); ctx.lineTo(x, h); }
    for (var j = 0; j <= rows; j++) { var y = Math.round(oy + j * cell) + 0.5; ctx.moveTo(0, y); ctx.lineTo(w, y); }
    ctx.stroke();

    // 3. pixel blob: red inside, black outline cells, growing until it fills the stage
    var g = ease(seg(0.2, 0.5));
    if (g > 0) {
      var cx = cols / 2, cy = (h / 2 - oy) / cell, aspect = 1.75;
      var maxR = Math.sqrt(Math.pow(cols / 2 + 1, 2) + Math.pow((rows / 2 + 1) * aspect, 2)) + 1;
      var rx = Math.max(0.6, g * maxR), ry = rx / aspect;
      var inside = function (a, b) { var dx = (a + 0.5 - cx) / rx, dy = (b + 0.5 - cy) / ry; return dx * dx + dy * dy < 1; };
      for (var a = 0; a < cols; a++) for (var b = -1; b < rows; b++) {
        if (!inside(a, b)) continue;
        var edge = g < 0.995 && !(inside(a - 1, b) && inside(a + 1, b) && inside(a, b - 1) && inside(a, b + 1));
        ctx.fillStyle = edge ? C.ink : C.red;
        ctx.fillRect(Math.floor(a * cell), Math.floor(oy + b * cell), Math.ceil(cell) + 1, Math.ceil(cell) + 1);
      }
    }

    // 4. pixel smiley builds cell by cell, then grows a little while the questions slide past
    var s = seg(0.52, 0.64);
    if (s > 0) {
      var sc = Math.min(w / 26, h / 17) * (1 + 0.12 * ease(seg(0.62, 0.95)));
      var sx = w / 2 - 15 * sc / 2, sy = h / 2 - 14 * sc / 2, count = Math.round(s * smileCells.length);
      ctx.fillStyle = C.purple;
      for (var k = 0; k < count; k++) ctx.fillRect(Math.floor(sx + smileCells[k][0] * sc), Math.floor(sy + smileCells[k][1] * sc), Math.ceil(sc), Math.ceil(sc));
    }

    // DOM layers
    var tOut = seg(0.1, 0.18);
    title.style.opacity = 1 - tOut;
    title.style.transform = 'translateY(' + (-40 * tOut) + 'px) scale(' + (1 - 0.06 * tOut) + ')';
    var bt = Math.min(seg(0.3, 0.36), 1 - seg(0.44, 0.49));
    blobText.style.opacity = bt;
    blobText.style.transform = 'translate(-50%, calc(-50% + ' + (16 * (1 - bt)) + 'px))';
    var rp = seg(0.6, 0.97);
    run.style.opacity = rp > 0 && rp < 1 ? 1 : 0;
    var span = run.firstElementChild, tw = span.offsetWidth;
    run.style.transform = 'translate(' + (w - rp * (w + tw)) + 'px, -50%)';
  }

  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var r = pin.getBoundingClientRect(), total = r.height - window.innerHeight;
      p = Math.max(0, Math.min(1, -r.top / total));
      render(); revealWords();
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { resize(); onScroll(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(render);
  resize(); onScroll();
})();

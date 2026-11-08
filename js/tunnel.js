/* Endless perspective tunnel: a square corridor of grid lines with colour tiles
   flowing toward the viewer. Pure canvas, no dependencies. */
(function () {
  var canvas = document.getElementById('tunnel');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var css = getComputedStyle(document.documentElement);
  function token(n, f) { var v = css.getPropertyValue(n).trim(); return v || f; }
  var ink = token('--ink', '#111111'), ground = token('--paper', '#f2ebe1');
  var palette = ['--cobalt', '--sun', '--tangerine', '--tomato', '--grape', '--meadow', '--lime']
    .map(function (n, i) { return token(n, ['#1d4ed8', '#ffd60a', '#ff8c1a', '#c8232c', '#b266f8', '#00a63e', '#1fe24f'][i]); });

  var COLS = 4;          // lanes across each wall
  var DEPTH = 0.45;      // distance between rings
  var RINGS = 17;        // rings drawn
  var NEAR = 1;          // ring that meets the frame edge
  var SPEED = 0.55;      // rings per second
  var w = 0, h = 0, dpr = 1, t = 0, last = 0, running = false;

  // Stable pseudo-random colour for a wall cell, keyed on its absolute ring index.
  function cellColor(wall, col, ring) {
    var n = Math.sin(wall * 127.1 + col * 311.7 + ring * 74.7) * 43758.5453;
    n = n - Math.floor(n);
    if (n > 0.13) return null;
    return palette[Math.floor(n / 0.13 * palette.length) % palette.length];
  }

  function resize() {
    var r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = r.width; h = r.height;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  // Wall point: u runs 0..1 around one wall, wall 0 top, 1 right, 2 bottom, 3 left. Square tunnel of half-size 1.
  function wallPoint(wall, u) {
    var a = -1 + 2 * u;
    if (wall === 0) return [a, -1];
    if (wall === 1) return [1, a];
    if (wall === 2) return [-a, 1];
    return [-1, -a];
  }

  function draw() {
    if (!w) return;
    var cx = w / 2, cy = h / 2, fx = w / 2 * NEAR * 0.96, fy = h / 2 * NEAR * 0.96;
    function P(p, z) { return [cx + p[0] / z * fx, cy + p[1] / z * fy]; }
    var frac = t - Math.floor(t), base = Math.floor(t);
    var zs = [];
    for (var k = 0; k <= RINGS; k++) zs.push(NEAR + (k - 1 - frac) * DEPTH);

    ctx.fillStyle = ground; ctx.fillRect(0, 0, w, h);

    // tiles, far to near
    for (k = RINGS - 1; k >= 0; k--) {
      var z1 = Math.max(zs[k], 0.02), z2 = zs[k + 1];
      for (var wall = 0; wall < 4; wall++) for (var c = 0; c < COLS; c++) {
        var col = cellColor(wall, c, base + k);
        if (!col) continue;
        var a = wallPoint(wall, c / COLS), b = wallPoint(wall, (c + 1) / COLS);
        var q = [P(a, z1), P(b, z1), P(b, z2), P(a, z2)];
        ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(q[0][0], q[0][1]);
        for (var i = 1; i < 4; i++) ctx.lineTo(q[i][0], q[i][1]);
        ctx.closePath(); ctx.fill();
      }
    }

    // far opening
    var zf = zs[RINGS], tl = P([-1, -1], zf), br = P([1, 1], zf);
    ctx.fillStyle = ground; ctx.fillRect(tl[0], tl[1], br[0] - tl[0], br[1] - tl[1]);

    // lines
    ctx.strokeStyle = ink; ctx.lineCap = 'round';
    for (k = 0; k <= RINGS; k++) {
      var z = zs[k]; if (z <= 0.02) continue;
      ctx.lineWidth = Math.max(0.7, Math.min(2.4, 1.7 * NEAR / z));
      var p0 = P([-1, -1], z), p1 = P([1, 1], z);
      ctx.strokeRect(p0[0], p0[1], p1[0] - p0[0], p1[1] - p0[1]);
    }
    ctx.globalAlpha = 1; ctx.lineWidth = 1.4;
    var zn = 0.02;
    for (wall = 0; wall < 4; wall++) for (c = 0; c <= COLS; c++) {
      var pt = wallPoint(wall, c / COLS), s = P(pt, zn), e = P(pt, zf);
      ctx.beginPath(); ctx.moveTo(s[0], s[1]); ctx.lineTo(e[0], e[1]); ctx.stroke();
    }
  }

  function frame(now) {
    if (!running) return;
    var dt = last ? Math.min(0.05, (now - last) / 1000) : 0; last = now;
    t += dt * SPEED; draw();
    requestAnimationFrame(frame);
  }
  function start() { if (running) return; running = true; last = 0; requestAnimationFrame(frame); }
  function stop() { running = false; }

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.addEventListener('resize', resize);
  resize();
  if (reduce) { t = 0.5; draw(); return; }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { es[0].isIntersecting ? start() : stop(); }).observe(canvas);
  } else start();
  document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
})();

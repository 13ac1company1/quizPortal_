// src/confetti.js
// Lightweight, dependency-free confetti with canvas; supports bursts and gentle showers.

(function () {
  if (typeof window === "undefined") return;

  var canvas, ctx, rafId = null, particles = [];
  var configured = false;

  function makeCanvas() {
    if (canvas) return canvas;
    canvas = document.createElement("canvas");
    canvas.className = "confetti-canvas";
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.position = "fixed";
    canvas.style.inset = "0";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "9999";
    document.body.appendChild(canvas);
    ctx = canvas.getContext("2d");
    onResize();
    window.addEventListener("resize", onResize);
    return canvas;
  }

  function onResize() {
    if (!canvas) return;
    var dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function rand(min, max) { return Math.random() * (max - min) + min; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  var PALETTE = [
    "#ff5bb3", "#61e8ff", "#7aff9a", "#ffd166",
    "#7c83ff", "#f472b6", "#60a5fa", "#34d399"
  ];
  var SHAPES = ["rect", "circle", "triangle", "star"];

  function pushParticles(count, opts) {
    var cx = (opts && typeof opts.x === "number") ? opts.x : window.innerWidth / 2;
    var cy = (opts && typeof opts.y === "number") ? opts.y : window.innerHeight / 3;
    var spread = (opts && opts.spread) || Math.PI * 2;
    var force = (opts && opts.force) || 12;
    var gravity = (opts && opts.gravity) || 0.25;
    var sizeMin = (opts && opts.sizeMin) || 6;
    var sizeMax = (opts && opts.sizeMax) || 14;

    var i;
    for (i = 0; i < count; i++) {
      // eslint-disable-next-line no-mixed-operators
      var angle = rand(-spread / 2, spread / 2) + (opts && opts.angle || -Math.PI / 2);
      var speed = rand(force * 0.5, force);
      particles.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        ay: gravity,
        r: rand(sizeMin, sizeMax),
        color: pick(PALETTE),
        rotate: rand(0, Math.PI * 2),
        vr: rand(-0.2, 0.2),
        shape: pick(SHAPES),
        life: rand(1.2, 2.2),        // seconds
        born: performance.now() / 1000
      });
    }
    if (!rafId) loop();
  }

  function drawParticle(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotate);
    ctx.fillStyle = p.color;

    var r = p.r;
    // eslint-disable-next-line default-case
    switch (p.shape) {
      case "rect":
        ctx.fillRect(-r * 0.6, -r * 0.4, r * 1.2, r * 0.8);
        break;
      case "circle":
        ctx.beginPath(); ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2); ctx.fill(); break;
      case "triangle":
        ctx.beginPath();
        ctx.moveTo(-r * 0.6, r * 0.6);
        ctx.lineTo(0, -r * 0.7);
        ctx.lineTo(r * 0.6, r * 0.6);
        ctx.closePath(); ctx.fill();
        break;
      case "star":
        ctx.beginPath();
        var spikes = 5, outer = r * 0.7, inner = r * 0.35, rot = Math.PI / 2 * 3, x = 0, y = 0, step = Math.PI / spikes;
        ctx.moveTo(0, -outer);
        for (var i = 0; i < spikes; i++) {
          x = Math.cos(rot) * outer; y = Math.sin(rot) * outer; ctx.lineTo(x, y); rot += step;
          x = Math.cos(rot) * inner; y = Math.sin(rot) * inner; ctx.lineTo(x, y); rot += step;
        }
        ctx.lineTo(0, -outer); ctx.closePath(); ctx.fill();
        break;
    }
    ctx.restore();
  }

  function loop() {
    rafId = requestAnimationFrame(loop);
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var now = performance.now() / 1000;
    var i;
    for (i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      var age = now - p.born;
      if (age > p.life) { particles.splice(i, 1); continue; }
      p.vy += p.ay;
      p.x += p.vx;
      p.y += p.vy;
      p.rotate += p.vr;
      drawParticle(p);
    }
    if (!particles.length) { cancelAnimationFrame(rafId); rafId = null; }
  }

  function ensure() {
    if (configured) return;
    makeCanvas();
    configured = true;
  }

  // Public API
  window.ConfettiBoom = {
    burst: function (opts) {
      ensure();
      pushParticles((opts && opts.count) || 120, opts || {});
    },
    celebrate: function (opts) {
      // Gentle shower top-center for a short while
      ensure();
      var t0 = Date.now();
      var dur = (opts && opts.duration) || 1200; // ms
      var shower = setInterval(function () {
        pushParticles((opts && opts.count) || 24, {
          x: window.innerWidth / 2 + rand(-80, 80),
          y: rand(-10, 10),
          angle: Math.PI / 2,
          spread: Math.PI / 8,
          force: 6,
          gravity: 0.18,
          sizeMin: 5, sizeMax: 10
        });
        if (Date.now() - t0 > dur) clearInterval(shower);
      }, 80);
    }
  };
})();

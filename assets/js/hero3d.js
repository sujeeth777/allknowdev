"use strict";
/* allknowdev v2 — 3D hero scene.
   Interactive "knowledge constellation": pastel particle cloud + glassy
   wireframe solids + orbiting category nodes. Drag to spin, mouse parallax,
   pauses when offscreen or hidden, honours prefers-reduced-motion, and falls
   back to the CSS orb when WebGL or the CDN is unavailable. */

(function () {
  const canvas = document.getElementById("heroCanvas");
  const visual = canvas ? canvas.parentElement : null;
  if (!canvas || !visual) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return; // CSS handles a static fallback via media query

  // CDN module import — dynamic so file:// and offline gracefully fall back.
  import("https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js")
    .then((THREE) => init(THREE))
    .catch(() => {
      canvas.style.display = "none";
      visual.classList.add("orb-only");
    });

  function init(THREE) {
    const PALETTE = [0x5b4dff, 0xf0447c, 0xff8a3d, 0x0fb5a0, 0x3e7bfa, 0xc053df, 0xf2a413];
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch (e) {
      canvas.style.display = "none";
      visual.classList.add("orb-only");
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 9.5);

    const world = new THREE.Group();
    scene.add(world);

    /* --- particle constellation --- */
    const COUNT = 260;
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const color = new THREE.Color();
    for (let i = 0; i < COUNT; i++) {
      // shell distribution between r=2.6 and r=4.4
      const r = 2.6 + Math.random() * 1.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.75;
      positions[i * 3 + 2] = r * Math.cos(phi);
      color.setHex(PALETTE[i % PALETTE.length]).offsetHSL(0, 0, (Math.random() - 0.5) * 0.12);
      colors[i * 3] = color.r; colors[i * 3 + 1] = color.g; colors[i * 3 + 2] = color.b;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    pGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const points = new THREE.Points(pGeo, new THREE.PointsMaterial({
      size: 0.075, vertexColors: true, transparent: true, opacity: 0.85,
      depthWrite: false, sizeAttenuation: true
    }));
    world.add(points);

    /* --- central glassy core --- */
    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.5, 1),
      new THREE.MeshNormalMaterial({ transparent: true, opacity: 0.32, flatShading: true })
    );
    world.add(core);

    const coreWire = new THREE.LineSegments(
      new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(2.05, 1)),
      new THREE.LineBasicMaterial({ color: 0x5b4dff, transparent: true, opacity: 0.35 })
    );
    world.add(coreWire);

    const knot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.72, 0.22, 110, 16),
      new THREE.MeshNormalMaterial({ transparent: true, opacity: 0.85 })
    );
    world.add(knot);

    /* --- orbiting category nodes --- */
    const nodes = [];
    for (let i = 0; i < 7; i++) {
      const node = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 20, 20),
        new THREE.MeshBasicMaterial({ color: PALETTE[i % PALETTE.length] })
      );
      const halo = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 16, 16),
        new THREE.MeshBasicMaterial({ color: PALETTE[i % PALETTE.length], transparent: true, opacity: 0.18 })
      );
      node.add(halo);
      node.userData = {
        speed: 0.25 + Math.random() * 0.3,
        radius: 2.4 + Math.random() * 1.3,
        phase: (i / 7) * Math.PI * 2,
        tilt: (Math.random() - 0.5) * 0.9,
        yOff: (Math.random() - 0.5) * 1.6
      };
      nodes.push(node);
      world.add(node);
    }

    /* --- interaction state --- */
    let targetRX = 0, targetRY = 0, parX = 0, parY = 0;
    let dragging = false, lastX = 0, lastY = 0, velY = 0, velX = 0;

    canvas.addEventListener("pointerdown", (e) => {
      dragging = true; lastX = e.clientX; lastY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener("pointermove", (e) => {
      const rect = canvas.getBoundingClientRect();
      parX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      parY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      if (dragging) {
        velY = (e.clientX - lastX) * 0.005;
        velX = (e.clientY - lastY) * 0.005;
        world.rotation.y += velY;
        world.rotation.x += velX;
        lastX = e.clientX; lastY = e.clientY;
      }
    });
    const endDrag = () => { dragging = false; };
    canvas.addEventListener("pointerup", endDrag);
    canvas.addEventListener("pointercancel", endDrag);
    canvas.addEventListener("pointerleave", () => { dragging = false; parX = 0; parY = 0; });

    /* --- sizing --- */
    function resize() {
      const w = visual.clientWidth, h = visual.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    addEventListener("resize", resize);

    /* --- visibility gating --- */
    let visible = true;
    const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; }, { threshold: 0 });
    io.observe(visual);
    document.addEventListener("visibilitychange", () => { visible = !document.hidden && visible; });

    /* --- loop --- */
    const clock = new THREE.Clock();
    let autoSpin = 0.0035;
    function frame() {
      requestAnimationFrame(frame);
      if (!visible) return;
      const t = clock.getElapsedTime();

      if (!dragging) {
        velY *= 0.94; velX *= 0.94;
        world.rotation.y += autoSpin + velY;
        world.rotation.x += velX;
        world.rotation.x += (targetRX - world.rotation.x) * 0.02;
      }
      // gentle mouse parallax
      camera.position.x += (parX * 0.7 - camera.position.x) * 0.04;
      camera.position.y += (-parY * 0.5 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      core.rotation.y = t * 0.35; core.rotation.x = Math.sin(t * 0.4) * 0.25;
      coreWire.rotation.y = -t * 0.18; coreWire.rotation.z = t * 0.1;
      knot.rotation.x = t * 0.6; knot.rotation.y = t * 0.45;
      points.rotation.y = t * 0.04;

      nodes.forEach((n) => {
        const u = n.userData;
        const a = t * u.speed + u.phase;
        n.position.set(
          Math.cos(a) * u.radius,
          Math.sin(a * 0.8) * u.tilt * 2 + u.yOff,
          Math.sin(a) * u.radius
        );
        n.scale.setScalar(1 + Math.sin(a * 2) * 0.12);
      });

      renderer.render(scene, camera);
    }
    frame();
  }
})();

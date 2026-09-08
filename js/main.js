/* Wedding invitation — 3D splash + animated invite */
(function () {
  // ---- which side of the family is inviting?  index.html?side=bride  (default: groom) ----
  const SIDE = /^(bride|kanya)$/i.test(new URLSearchParams(location.search).get('side') || '') ? 'bride' : 'groom';
  const W = Object.assign({}, window.WEDDING, SIDE === 'bride' ? (window.WEDDING.bride_side || {}) : {});
  W.side = SIDE;
  document.documentElement.dataset.side = SIDE;
  const isMobile = matchMedia('(max-width: 640px)').matches;
  const DPR = Math.min(devicePixelRatio || 1, 3);

  /* ================= helpers ================= */
  function makeRenderer(canvas) {
    const r = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    r.setPixelRatio(DPR);
    r.setSize(innerWidth, innerHeight, false);
    r.outputEncoding = THREE.sRGBEncoding;
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 1.1;
    return r;
  }
  function circleTexture() {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, 'rgba(255,240,190,1)');
    grd.addColorStop(0.35, 'rgba(255,215,120,.8)');
    grd.addColorStop(1, 'rgba(255,200,80,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c); return t;
  }
  function petalGeometry() {
    // marigold-ish petal: a bent rounded shape
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.bezierCurveTo(0.12, 0.05, 0.18, 0.28, 0, 0.42);
    s.bezierCurveTo(-0.18, 0.28, -0.12, 0.05, 0, 0);
    const geo = new THREE.ShapeGeometry(s, 8);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i);
      pos.setZ(i, Math.sin(y * 4) * 0.05 + x * x * 0.6);
    }
    geo.computeVertexNormals();
    return geo;
  }
  function goldDust(count, spread) {
    const g = new THREE.BufferGeometry();
    const p = new Float32Array(count * 3), sp = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - .5) * spread.x;
      p[i * 3 + 1] = (Math.random() - .5) * spread.y;
      p[i * 3 + 2] = (Math.random() - .5) * spread.z;
      sp[i] = 0.4 + Math.random();
    }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    g.userData.speed = sp;
    const m = new THREE.PointsMaterial({
      size: 0.06, map: circleTexture(), transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, color: 0xffd97a, opacity: .9, sizeAttenuation: true
    });
    return new THREE.Points(g, m);
  }
  // painted petal texture: soft gradient, veins, rounded edge (alpha)
  function petalTexture(inner, outer, edge) {
    const S = 128, c = document.createElement('canvas'); c.width = S; c.height = S * 2;
    const g = c.getContext('2d');
    // petal outline
    g.beginPath(); g.moveTo(S / 2, S * 2 - 6);
    g.bezierCurveTo(S * 0.02, S * 1.35, S * 0.05, S * 0.45, S / 2, 6);
    g.bezierCurveTo(S * 0.95, S * 0.45, S * 0.98, S * 1.35, S / 2, S * 2 - 6);
    g.closePath();
    const grd = g.createLinearGradient(0, S * 2, 0, 0);
    grd.addColorStop(0, inner); grd.addColorStop(0.55, outer); grd.addColorStop(1, edge);
    g.fillStyle = grd; g.fill();
    g.save(); g.clip();
    // soft highlight on one side
    const hl = g.createRadialGradient(S * 0.35, S * 0.6, 4, S * 0.35, S * 0.6, S * 0.9);
    hl.addColorStop(0, 'rgba(255,255,255,.35)'); hl.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = hl; g.fillRect(0, 0, S, S * 2);
    // veins
    g.strokeStyle = 'rgba(120,40,0,.28)'; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(S / 2, S * 2 - 10); g.quadraticCurveTo(S / 2 + 4, S, S / 2, 14); g.stroke();
    g.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const y = S * 1.75 - i * S * 0.3;
      g.beginPath(); g.moveTo(S / 2, y); g.quadraticCurveTo(S * 0.3, y - S * 0.2, S * 0.18, y - S * 0.45); g.stroke();
      g.beginPath(); g.moveTo(S / 2, y); g.quadraticCurveTo(S * 0.7, y - S * 0.2, S * 0.82, y - S * 0.45); g.stroke();
    }
    g.restore();
    const t = new THREE.CanvasTexture(c); t.anisotropy = 4; t.encoding = THREE.sRGBEncoding; return t;
  }
  const PETAL_TEXTURES = [
    petalTexture('#b45309', '#f59e0b', '#fde68a'),   // marigold
    petalTexture('#c2410c', '#fb923c', '#fed7aa'),   // saffron
    petalTexture('#9f1239', '#e11d48', '#fda4af'),   // rose
    petalTexture('#a16207', '#facc15', '#fef3c7'),   // yellow
  ];
  // whole flowers painted on canvas: marigold, jasmine, rose
  function flowerTexture(kind) {
    const S = 160, c = document.createElement('canvas'); c.width = c.height = S;
    const g = c.getContext('2d'); g.translate(S / 2, S / 2);
    const petal = (r0, r1, w, fill, stroke) => {
      g.beginPath(); g.moveTo(0, -r0);
      g.bezierCurveTo(w, -r0 - (r1 - r0) * 0.3, w, -r1 + (r1 - r0) * 0.25, 0, -r1);
      g.bezierCurveTo(-w, -r1 + (r1 - r0) * 0.25, -w, -r0 - (r1 - r0) * 0.3, 0, -r0);
      g.fillStyle = fill; g.fill(); if (stroke) { g.strokeStyle = stroke; g.lineWidth = 1; g.stroke(); }
    };
    const ringOf = (n, r0, r1, w, fill, stroke, off) => { for (let i = 0; i < n; i++) { g.save(); g.rotate(i / n * Math.PI * 2 + (off || 0)); petal(r0, r1, w, fill, stroke); g.restore(); } };
    if (kind === 'marigold') {
      ringOf(14, 10, 76, 16, '#d97706', '#b45309');
      ringOf(12, 8, 62, 15, '#f59e0b', '#c2410c', 0.22);
      ringOf(10, 6, 48, 14, '#fbbf24', '#d97706', 0.5);
      ringOf(8, 4, 34, 12, '#fcd34d', '#f59e0b', 0.8);
      ringOf(6, 2, 20, 9, '#fde68a', '#f59e0b', 1.1);
      g.beginPath(); g.arc(0, 0, 6, 0, 7); g.fillStyle = '#92400e'; g.fill();
    } else if (kind === 'jasmine') {
      ringOf(5, 8, 74, 22, '#fffaf0', '#e5d9c0');
      ringOf(5, 6, 52, 16, '#ffffff', '#ece3cf', 0.63);
      g.beginPath(); g.arc(0, 0, 9, 0, 7); g.fillStyle = '#fde68a'; g.fill();
      g.beginPath(); g.arc(0, 0, 4, 0, 7); g.fillStyle = '#d97706'; g.fill();
    } else { // rose / hibiscus red
      ringOf(5, 10, 76, 26, '#be123c', '#881337');
      ringOf(5, 8, 58, 20, '#e11d48', '#9f1239', 0.63);
      ringOf(5, 5, 40, 14, '#f43f5e', '#be123c', 0.2);
      g.beginPath(); g.arc(0, 0, 8, 0, 7); g.fillStyle = '#fbbf24'; g.fill();
      g.beginPath(); g.arc(0, 0, 3, 0, 7); g.fillStyle = '#7c2d12'; g.fill();
    }
    // soft shading toward the centre for depth
    const sh = g.createRadialGradient(0, 0, 4, 0, 0, 78); sh.addColorStop(0, 'rgba(0,0,0,.28)'); sh.addColorStop(0.5, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.18)');
    g.globalCompositeOperation = 'source-atop'; g.fillStyle = sh; g.fillRect(-S / 2, -S / 2, S, S);
    const t = new THREE.CanvasTexture(c); t.anisotropy = 4; t.encoding = THREE.sRGBEncoding; return t;
  }
  const FLOWER_TEXTURES = ['marigold', 'jasmine', 'rose'].map(flowerTexture);
  function cupGeometry(size, depth) {
    const geo = new THREE.PlaneGeometry(size, size, 14, 14);
    const p = geo.attributes.position, R = size / 2;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), r = Math.min(1, Math.hypot(x, y) / R);
      // petals rise toward the rim and ripple slightly around
      p.setZ(i, r * r * depth + Math.sin(Math.atan2(y, x) * 5) * 0.012 * r);
    }
    geo.computeVertexNormals();
    return geo;
  }
  const FLOWER_GEO_OUTER = cupGeometry(0.30, 0.10);
  const FLOWER_GEO_INNER = cupGeometry(0.20, 0.09);
  function makeFlower(mat) {
    const g = new THREE.Group();
    const outer = new THREE.Mesh(FLOWER_GEO_OUTER, mat);
    const inner = new THREE.Mesh(FLOWER_GEO_INNER, mat);
    inner.position.z = 0.035; inner.rotation.z = 0.4;
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 8), new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: .9 }));
    core.position.z = 0.06;
    g.add(outer, inner, core);
    return g;
  }
  function curvedPetalGeometry() {
    const geo = new THREE.PlaneGeometry(0.17, 0.34, 6, 12);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i);
      p.setZ(i, x * x * 2.4 + Math.sin((y + 0.17) * 7) * 0.02);   // cupped across, gentle wave along
    }
    geo.computeVertexNormals();
    return geo;
  }
  const PETAL_GEO = curvedPetalGeometry();
  function petalCloud(count, spread, flowerShare = 0) {
    const group = new THREE.Group();
    const fmats = FLOWER_TEXTURES.map(tex => new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, roughness: .85, metalness: 0 }));
    const mats = PETAL_TEXTURES.map(tex => new THREE.MeshStandardMaterial({
      map: tex, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, roughness: .8, metalness: 0
    }));
    for (let i = 0; i < count; i++) {
      const isFlower = i < count * flowerShare;
      const m = isFlower ? makeFlower(fmats[i % fmats.length]) : new THREE.Mesh(PETAL_GEO, mats[i % mats.length]);
      m.position.set((Math.random() - .5) * spread.x, (Math.random() - .5) * spread.y, (Math.random() - .5) * spread.z);
      m.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
      const s = (isFlower ? 0.8 : 0.75) + Math.random() * 0.6; m.scale.setScalar(s);
      m.userData = {
        fall: (isFlower ? 0.14 : 0.18) + Math.random() * 0.32, sway: Math.random() * 6.28, swayAmp: 0.2 + Math.random() * 0.4,
        rx: (Math.random() - .5) * 1.6, ry: (Math.random() - .5) * 1.2, rz: (Math.random() - .5) * 1.0
      };
      group.add(m);
    }
    group.userData.spread = spread;
    return group;
  }
  function animatePetals(group, dt, t) {
    const sp = group.userData.spread;
    group.children.forEach(m => {
      const u = m.userData;
      // flutter: slow fall with a side-to-side glide and tumbling
      m.position.y -= u.fall * dt * (0.8 + Math.sin(t * 1.3 + u.sway) * 0.25);
      m.position.x += Math.cos(t * 0.9 + u.sway) * u.swayAmp * dt;
      m.position.z += Math.sin(t * 0.7 + u.sway) * 0.1 * dt;
      m.rotation.x += u.rx * dt; m.rotation.y += u.ry * dt; m.rotation.z += u.rz * dt;
      if (m.position.y < -sp.y / 2) { m.position.y = sp.y / 2; m.position.x = (Math.random() - .5) * sp.x; }
    });
  }
  function animateDust(points, dt, t) {
    const p = points.geometry.attributes.position, sp = points.geometry.userData.speed;
    const h = 8;
    for (let i = 0; i < p.count; i++) {
      let y = p.getY(i) + sp[i] * 0.12 * dt;
      if (y > h / 2) y = -h / 2;
      p.setY(i, y);
      p.setX(i, p.getX(i) + Math.sin(t + i) * 0.02 * dt);
    }
    p.needsUpdate = true;
  }

  /* ================= SPLASH SCENE ================= */
  const splash = document.getElementById('splash');
  const splashCanvas = document.getElementById('splash-canvas');
  const embed = document.getElementById('ganesha-embed');
  document.body.classList.add('locked');

  const sRenderer = makeRenderer(splashCanvas);
  const sScene = new THREE.Scene();
  const sCam = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.1, 100);
  const camZ = () => 6.5;
  const LOOK_Y = 0.55;                       // model centre height; camera stays level with it
  const CAM_Y = LOOK_Y - 0.80;               // camera looks a little below the model so it sits above the text
  const look = { y: CAM_Y };                 // live look-at height (tweened toward the face on open)
  sCam.position.set(0, CAM_Y, camZ());
  // visible frustum size at z=0
  const frustum = () => { const h = 2 * camZ() * Math.tan(THREE.MathUtils.degToRad(sCam.fov / 2)); return { h, w: h * innerWidth / innerHeight }; };

  sScene.add(new THREE.AmbientLight(0xffe6b3, 0.5));
  const key = new THREE.DirectionalLight(0xfff1cc, 1.6); key.position.set(3, 5, 4); sScene.add(key);
  const rim = new THREE.DirectionalLight(0xff9a5c, 1.2); rim.position.set(-4, 2, -3); sScene.add(rim);
  const fill = new THREE.PointLight(0xd4af37, 1.4, 20); fill.position.set(0, -1, 3); sScene.add(fill);

  // halo ring behind deity
  const halo = new THREE.Mesh(
    new THREE.RingGeometry(1.55, 1.75, 96),
    new THREE.MeshBasicMaterial({ color: 0xf3d98b, transparent: true, opacity: .55, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })
  );
  halo.position.set(0, LOOK_Y, -0.8); sScene.add(halo);
  const halo2 = new THREE.Mesh(
    new THREE.RingGeometry(1.9, 1.93, 96),
    new THREE.MeshBasicMaterial({ color: 0xd4af37, transparent: true, opacity: .35, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })
  );
  halo2.position.copy(halo.position); sScene.add(halo2);

  // rotating light rays behind the deity
  function raysTexture() {
    const S = 1024, c = document.createElement('canvas'); c.width = c.height = S;
    const g = c.getContext('2d'); g.translate(S / 2, S / 2);
    for (let i = 0; i < 36; i++) {
      const a = i / 36 * Math.PI * 2, w = 0.035 + (i % 2) * 0.02;
      const grad = g.createLinearGradient(0, 0, Math.cos(a) * S / 2, Math.sin(a) * S / 2);
      grad.addColorStop(0, 'rgba(255,225,150,0.9)'); grad.addColorStop(1, 'rgba(255,200,90,0)');
      g.fillStyle = grad; g.beginPath(); g.moveTo(0, 0);
      g.arc(0, 0, S / 2, a - w, a + w); g.closePath(); g.fill();
    }
    return new THREE.CanvasTexture(c);
  }
  const rays = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: raysTexture(), transparent: true, opacity: .32, depthWrite: false, blending: THREE.AdditiveBlending }));
  rays.position.set(0, LOOK_Y, -1.2); sScene.add(rays);
  const rays2 = rays.clone(); rays2.material = rays.material.clone(); rays2.material.opacity = .18; rays2.position.z = -1.3; sScene.add(rays2);
  // orbiting sparkles around the halo
  const sparkGeo = new THREE.BufferGeometry();
  const SPARKS = 90, sparkPos = new Float32Array(SPARKS * 3), sparkSeed = new Float32Array(SPARKS);
  for (let i = 0; i < SPARKS; i++) sparkSeed[i] = Math.random() * 6.28;
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
  const sparks = new THREE.Points(sparkGeo, new THREE.PointsMaterial({ size: 0.09, map: circleTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xfff1c0 }));
  sScene.add(sparks);
  const sDust = goldDust(isMobile ? 350 : 700, { x: 14, y: 8, z: 6 }); sScene.add(sDust);
  const sPetals = petalCloud(isMobile ? 26 : 48, { x: 12, y: 9, z: 5 });
  sScene.add(sPetals);

  let ganesha = null, ganeshaPivot = new THREE.Group();
  ganeshaPivot.position.set(0, LOOK_Y, 0);
  sScene.add(ganeshaPivot);

  function loadGanesha() {
    if (!THREE.GLTFLoader) { showEmbed(); return; }
    const loader = new THREE.GLTFLoader();
    if (THREE.DRACOLoader) {
      const d = new THREE.DRACOLoader();
      d.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/libs/draco/');
      loader.setDRACOLoader(d);
    }
    loader.load(W.ganeshaModel, gltf => {
      const obj = gltf.scene;
      obj.rotation.y = -Math.PI / 2; // face the viewer
      obj.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(obj);
      const size = box.getSize(new THREE.Vector3()), centre = box.getCenter(new THREE.Vector3());
      const inner = new THREE.Group();          // centred, unit-scaled model
      obj.position.sub(centre);
      inner.add(obj);
      inner.userData.size = size;
      const maxAniso = sRenderer.capabilities.getMaxAnisotropy();
      obj.traverse(n => {
        if (!n.isMesh) return;
        n.castShadow = false;
        const m = n.material; if (!m) return;
        if ('envMapIntensity' in m) m.envMapIntensity = 1.2;
        ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'emissiveMap'].forEach(k => {
          const t = m[k]; if (!t) return;
          t.anisotropy = maxAniso;
          t.minFilter = THREE.LinearMipmapLinearFilter;
          t.magFilter = THREE.LinearFilter;
          t.generateMipmaps = true;
          t.needsUpdate = true;
        });
        m.needsUpdate = true;
      });
      ganesha = inner;
      ganeshaPivot.add(inner);
      const s = fitScale();
      inner.scale.setScalar(s);
      // soft fade-in instead of a bounce
      obj.traverse(n => { if (n.isMesh && n.material) { n.material.transparent = true; n.material.opacity = 0; } });
      const fade = { v: 0 };
      gsap.to(fade, { v: 1, duration: 1.2, ease: 'power2.out', onUpdate: () => {
        obj.traverse(n => { if (n.isMesh && n.material) n.material.opacity = fade.v; });
      }, onComplete: () => { obj.traverse(n => { if (n.isMesh && n.material) n.material.transparent = false; }); } });
    }, undefined, () => showEmbed());
  }
  function fitScale() {
    if (!ganesha) return 1;
    const f = frustum(), sz = ganesha.userData.size;
    return Math.min(f.h * 0.42 / sz.y, f.w * 0.68 / sz.x);
  }
  // height of Ganeshji's face in world units (upper part of the model)
  function faceY() {
    if (!ganesha) return LOOK_Y;
    const h = ganesha.userData.size.y * ganesha.scale.y;
    return LOOK_Y + h * 0.27;
  }
  function fitHalo() {
    const f = frustum(), r = Math.min(f.h, f.w) * 0.30;
    halo.scale.setScalar(r / 1.65); halo2.scale.setScalar(r / 1.9);
    rays.scale.setScalar(r * 4.2); rays2.scale.setScalar(r * 5);
    sparks.userData.r = r;
  }
  fitHalo();
  halo.visible = halo2.visible = rays.visible = rays2.visible = sparks.visible = false;
  function showEmbed() {
    embed.hidden = false;
    halo.visible = halo2.visible = false;
  }
  loadGanesha();

  // parallax on pointer
  const target = { x: 0, y: 0 };
  addEventListener('pointermove', e => {
    target.x = (e.clientX / innerWidth - .5) * 2;
    target.y = (e.clientY / innerHeight - .5) * 2;
  });

  /* ================= BACKGROUND SCENE (main page) ================= */
  const bgCanvas = document.getElementById('bg-canvas');
  const bRenderer = makeRenderer(bgCanvas);
  const bScene = new THREE.Scene();
  const bCam = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 100);
  bCam.position.z = 7;
  bScene.add(new THREE.AmbientLight(0xffe6b3, 0.45));
  const bl = new THREE.DirectionalLight(0xfff1cc, 1.7); bl.position.set(2, 4, 5); bScene.add(bl);
  const bl2 = new THREE.DirectionalLight(0xff9a5c, 0.6); bl2.position.set(-4, -2, 3); bScene.add(bl2);
  const bDust = goldDust(isMobile ? 250 : 500, { x: 16, y: 10, z: 6 }); bScene.add(bDust);
  const bPetals = petalCloud(isMobile ? 22 : 44, { x: 14, y: 11, z: 6 }, 0.35);
  bScene.add(bPetals);

  // ---- traditional decorations: gold mandala + floating diyas ----
  function mandalaTexture() {
    const S = 1024, c = document.createElement('canvas'); c.width = c.height = S;
    const g = c.getContext('2d'); g.translate(S / 2, S / 2);
    g.strokeStyle = 'rgba(243,217,139,1)'; g.lineWidth = 2; g.lineCap = 'round';
    const petal = (r0, r1, n, w) => {
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        g.save(); g.rotate(a);
        g.beginPath(); g.moveTo(0, r0);
        g.quadraticCurveTo(w, (r0 + r1) / 2, 0, r1);
        g.quadraticCurveTo(-w, (r0 + r1) / 2, 0, r0);
        g.stroke(); g.restore();
      }
    };
    const ring = (r, lw = 2) => { g.lineWidth = lw; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.stroke(); g.lineWidth = 2; };
    ring(500, 3); ring(486, 1); ring(400, 1.5); ring(300, 2); ring(200, 1); ring(90, 2);
    petal(400, 496, 24, 22); petal(300, 396, 16, 34); petal(200, 296, 12, 44); petal(90, 196, 8, 46);
    for (let i = 0; i < 48; i++) { const a = i / 48 * Math.PI * 2; g.beginPath(); g.arc(Math.cos(a) * 443, Math.sin(a) * 443, 4, 0, 7); g.fillStyle = 'rgba(243,217,139,1)'; g.fill(); }
    g.beginPath(); g.arc(0, 0, 26, 0, 7); g.fill();
    const t = new THREE.CanvasTexture(c); t.anisotropy = 8; return t;
  }
  const mandalaMat = new THREE.MeshBasicMaterial({ map: mandalaTexture(), transparent: true, opacity: .11, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const mandalaL = new THREE.Mesh(new THREE.PlaneGeometry(7, 7), mandalaMat); mandalaL.position.set(-5.4, 1.6, -3.5);
  const mandalaR = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), mandalaMat.clone()); mandalaR.material.opacity = .08; mandalaR.position.set(6.2, -2.6, -4.5);
  bScene.add(mandalaL, mandalaR);

  const flowers = [];


  /* ================= RENDER LOOP ================= */
  const clock = new THREE.Clock();
  let splashActive = true, scrollY = 0;
  addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

  function tick() {
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
    if (splashActive) {
      animateDust(sDust, dt, t); animatePetals(sPetals, dt, t);
      halo.rotation.z += dt * 0.15; halo2.rotation.z -= dt * 0.1;
      rays.rotation.z += dt * 0.05; rays2.rotation.z -= dt * 0.035;
      rays.material.opacity = 0.26 + Math.sin(t * 0.9) * 0.08;
      const hp = 1 + Math.sin(t * 1.5) * 0.02; halo.scale.multiplyScalar(1); halo2.scale.multiplyScalar(1);
      { const R = sparks.userData.r || 1.5, p = sparks.geometry.attributes.position;
        for (let i = 0; i < SPARKS; i++) {
          const a = sparkSeed[i] + t * (0.25 + (i % 3) * 0.08), rr = R * (1.08 + Math.sin(t * 0.8 + sparkSeed[i] * 3) * 0.06);
          p.setXYZ(i, Math.cos(a) * rr, LOOK_Y + Math.sin(a) * rr, -0.7 + Math.sin(t + i) * 0.15);
        }
        p.needsUpdate = true; sparks.material.opacity = 0.75 + Math.sin(t * 3) * 0.2; }
      halo.material.opacity = 0.45 + Math.sin(t * 1.5) * 0.12;
      if (ganesha) {
        ganeshaPivot.rotation.y += (target.x * 0.45 - ganeshaPivot.rotation.y) * 0.05;
        ganeshaPivot.rotation.x += (0.12 + target.y * 0.05 - ganeshaPivot.rotation.x) * 0.05;
        ganeshaPivot.position.y = LOOK_Y + Math.sin(t * 1.2) * 0.05;
      }
      sCam.position.x += (target.x * 0.3 - sCam.position.x) * 0.04;
      sCam.position.y += (look.y - target.y * 0.1 - sCam.position.y) * 0.04;
      sCam.lookAt(0, look.y, 0);
      sRenderer.render(sScene, sCam);
    } else {
      animateDust(bDust, dt, t); animatePetals(bPetals, dt, t);
      mandalaL.rotation.z += dt * 0.06; mandalaR.rotation.z -= dt * 0.04;
      bCam.position.y = -scrollY * 0.0015;
      bCam.position.x += (target.x * 0.4 - bCam.position.x) * 0.03;
      bRenderer.render(bScene, bCam);
    }
    requestAnimationFrame(tick);
  }
  tick();

  addEventListener('resize', () => {
    [sRenderer, bRenderer].forEach(r => r.setSize(innerWidth, innerHeight, false));
    [sCam, bCam].forEach(c => { c.aspect = innerWidth / innerHeight; c.updateProjectionMatrix(); });
    if (splashActive) { fitHalo(); if (ganesha) ganesha.scale.setScalar(fitScale()); }
  });

  /* ================= SPLASH INTRO + OPEN ================= */
  gsap.from('.splash-content > *', { y: 30, opacity: 0, duration: 1.2, stagger: 0.18, delay: 0.5, ease: 'power3.out' });

  const invite = document.getElementById('invite');
  const doors = document.getElementById('doors');
  document.getElementById('open-btn').addEventListener('click', () => {
    const btn = document.getElementById('open-btn'); btn.disabled = true;
    const tl = gsap.timeline({
      onComplete: () => {
        doors.style.display = 'none';
        document.body.classList.remove('locked');
      }
    });
    // 1) text fades, camera drifts in toward Ganeshji
    tl.to('.splash-content, .credit', { opacity: 0, y: -20, duration: .5, ease: 'power2.in' })
      .to(sCam.position, { z: camZ() * 0.6, duration: 1.2, ease: 'power2.inOut' }, '<')
      .to(look, { y: LOOK_Y, duration: 1.2, ease: 'power2.inOut' }, '<')
      // 2) mandap doors close over the splash
      .set(doors, { display: 'block' })
      .fromTo('.door.left', { xPercent: -100 }, { xPercent: 0, duration: .8, ease: 'power3.out' }, '-=0.4')
      .fromTo('.door.right', { xPercent: 100 }, { xPercent: 0, duration: .8, ease: 'power3.out' }, '<')
      // 3) swap the splash for the invitation behind the closed doors
      .add(() => {
        splash.style.display = 'none'; splashActive = false;
        invite.setAttribute('aria-hidden', 'false');
        initScroll();
      })
      .to({}, { duration: .35 })
      // 4) doors swing open to reveal the invitation
      .to('.door.left', { xPercent: -100, rotateY: 35, duration: 1.5, ease: 'power3.inOut' })
      .to('.door.right', { xPercent: 100, rotateY: -35, duration: 1.5, ease: 'power3.inOut' }, '<');
  });

  /* ================= MAIN PAGE CONTENT ================= */
  document.getElementById('splash-sub').innerHTML = W.splashQuote || '';
  if (SIDE === 'bride') {
    // bride first: her parents, her name, "ના શુભલગ્ન", his name, his parents
    const names = document.getElementById('names');
    const [first, mid, second] = names.children;
    names.insertBefore(second, first);            // -> second(bride) , first(groom) , mid
    names.insertBefore(mid, first);               // -> second(bride) , mid , first(groom)
    const gp = document.getElementById('groom-parents'), gf = document.getElementById('groom-from');
    const bp = document.getElementById('bride-parents'), bf = document.getElementById('bride-from');
    names.parentNode.insertBefore(bp, names); names.parentNode.insertBefore(bf, names);
    names.parentNode.insertBefore(gp, names.nextSibling); names.parentNode.insertBefore(gf, gp.nextSibling);
  }
  document.querySelectorAll('[data-name="groom"]').forEach(e => e.textContent = W.groom);
  document.querySelectorAll('[data-name="bride"]').forEach(e => e.textContent = W.bride);
  // Guest name from the link: index.html?to=શ્રી પટેલ પરિવાર   (falls back to config, else hidden)
  (function () {
    const q = new URLSearchParams(location.search).get('to');
    const name = (q && q.trim()) || W.guestDefault || '';
    if (!name) return;
    const hasTitle = /^(શ્રી|શ્રીમતી|પૂજ્ય|માનનીય|આદરણીય|ડૉ\.|સૌ\.)/.test(name);
    const prefix = (!hasTitle && W.guestPrefix) ? W.guestPrefix + ' ' : '';
    const suffix = W.guestSuffix ? ' ' + W.guestSuffix : '';
    document.getElementById('guest-name').textContent = name;
    document.getElementById('guest').hidden = false;
  })();
  document.getElementById('deities').innerHTML = (W.deities || []).map(d => `<span>${d}</span>`).join('');
  document.getElementById('foot-names').textContent = SIDE === 'bride' ? `${W.bride} — ${W.groom}` : `${W.groom} — ${W.bride}`;
  document.getElementById('groom-parents').textContent = W.groomParents || '';
  document.getElementById('bride-parents').textContent = W.brideParents || '';
  document.getElementById('tithi-line').textContent = W.tithi || '';
  document.getElementById('groom-from').textContent = W.groomFrom ? `(${W.groomFrom})` : '';
  document.getElementById('bride-from').textContent = W.brideFrom ? `(${W.brideFrom})` : '';
  document.getElementById('muhurat-line').textContent = W.muhurat || '';
  document.getElementById('foot-family').textContent = SIDE === 'bride' ? `${W.brideFamily}  ·  ${W.groomFamily}` : `${W.groomFamily}  ·  ${W.brideFamily}`;
  document.getElementById('date-line').textContent = W.dateText;
  document.getElementById('verse').innerHTML = (W.verse || []).map(l => `<span>${l}</span>`).join('<br>');
  document.getElementById('inviter').textContent = W.inviter || '';
  document.getElementById('venue-title').textContent = W.venueTitle || 'લગ્ન સ્થળ';
  document.getElementById('venue-name').textContent = W.venue.name;
  document.getElementById('venue-addr').textContent = W.venue.address;
  document.getElementById('map-link').href = W.venue.mapsUrl;
  document.getElementById('wa-link').href =
    `https://wa.me/${W.whatsapp}?text=${encodeURIComponent(`નમસ્તે! ચિ. ${W.groom} તથા ચિ. ${W.bride} ના શુભલગ્ન પ્રસંગે (${W.dateText}) હું ઉપસ્થિત રહીશ.`)}`;
  document.title = `${W.groom} — ${W.bride} | લગ્ન કંકોત્રી`;

  // timeline cards
  const ICONS = {"om": "<svg viewBox=\"0 0 48 48\"><text x=\"24\" y=\"34\" text-anchor=\"middle\" font-family=\"Tiro Devanagari Sanskrit,serif\" font-size=\"30\" fill=\"currentColor\">ॐ</text></svg>", "flower": "<svg viewBox=\"0 0 48 48\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"24\" cy=\"24\" r=\"5\"/><path d=\"M24 19c0-6 3-9 0-13-3 4 0 7 0 13zM24 29c0 6 3 9 0 13-3-4 0-7 0-13zM19 24c-6 0-9 3-13 0 4-3 7 0 13 0zM29 24c6 0 9 3 13 0-4-3-7 0-13 0zM20.5 20.5c-4-4-8-4-10-9 5 2 5 6 10 9zM27.5 27.5c4 4 8 4 10 9-5-2-5-6-10-9zM27.5 20.5c4-4 4-8 9-10-2 5-6 5-9 10zM20.5 27.5c-4 4-4 8-9 10 2-5 6-5 9-10z\"/></svg>", "mandap": "<svg viewBox=\"0 0 48 48\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 40h36M9 40V22M39 40V22M14 40V26M34 40V26M24 40V28\"/><path d=\"M4 22l20-12 20 12\"/><path d=\"M4 22c3-3 5 0 8-3 3 3 5 0 8-3 3 3 5 0 8 3 3-3 5 0 8 3\"/><path d=\"M24 5v5\"/><circle cx=\"24\" cy=\"4\" r=\"1.2\"/></svg>", "thali": "<svg viewBox=\"0 0 48 48\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\"><circle cx=\"24\" cy=\"24\" r=\"17\"/><circle cx=\"24\" cy=\"24\" r=\"11\"/><circle cx=\"16\" cy=\"18\" r=\"2.2\"/><circle cx=\"30\" cy=\"16\" r=\"2.2\"/><circle cx=\"32\" cy=\"27\" r=\"2.2\"/><circle cx=\"19\" cy=\"31\" r=\"2.2\"/><path d=\"M24 20v8M21 24h6\"/></svg>", "dhol": "<svg viewBox=\"0 0 48 48\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\"><ellipse cx=\"14\" cy=\"24\" rx=\"5\" ry=\"11\"/><ellipse cx=\"34\" cy=\"24\" rx=\"5\" ry=\"11\"/><path d=\"M14 13h20M14 35h20M20 13l8 22M28 13l-8 22\"/><path d=\"M40 8l-6 8M8 40l6-8\"/></svg>", "rings": "<svg viewBox=\"0 0 48 48\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\"><circle cx=\"18\" cy=\"27\" r=\"10\"/><circle cx=\"30\" cy=\"27\" r=\"10\"/><path d=\"M27 15l3-5 3 5-3 3z\"/></svg>", "kalash": "<svg viewBox=\"0 0 48 48\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M16 20h16l3 14c0 4-4 7-11 7s-11-3-11-7z\"/><path d=\"M14 20c0-3 4-5 10-5s10 2 10 5\"/><path d=\"M17 11c2-2 5-3 7-3s5 1 7 3\"/><path d=\"M24 15v-4\"/><path d=\"M19 15c-3-5-1-8 1-9M29 15c3-5 1-8-1-9\"/><path d=\"M24 6c3 2 3 5 0 9-3-4-3-7 0-9z\"/></svg>"};
  const tlEl = document.getElementById('timeline');
  W.events.forEach(ev => {
    const d = document.createElement('div'); d.className = 'ev reveal';
    d.innerHTML = `<div class="ev-card"><div class="ev-icon">${ICONS[ev.icon] || ev.icon}</div><div class="ev-name">${ev.name}</div>
      <div class="ev-when">${ev.date} · ${ev.time}</div><div class="ev-note">${ev.note}</div></div>`;
    tlEl.appendChild(d);
  });

  // calendar (.ics)
  (function () {
    const start = new Date(W.dateTime), end = new Date(start.getTime() + 4 * 3600e3);
    const f = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Wedding//EN', 'BEGIN:VEVENT',
      `DTSTART:${f(start)}`, `DTEND:${f(end)}`, `SUMMARY:${W.groom} - ${W.bride} શુભલગ્ન`,
      `LOCATION:${W.venue.name}, ${W.venue.address}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    document.getElementById('cal-link').href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics);
  })();

  // countdown
  (function () {
    const els = {}; ['d', 'h', 'm', 's'].forEach(k => els[k] = document.querySelector(`[data-cd="${k}"]`));
    const target = new Date(W.dateTime).getTime();
    const GU = '૦૧૨૩૪૫૬૭૮૯';
    const pad = n => String(Math.max(0, n)).padStart(2, '0').replace(/\d/g, d => GU[d]);
    function upd() {
      const diff = Math.max(0, target - Date.now());
      els.d.textContent = pad(Math.floor(diff / 864e5));
      els.h.textContent = pad(Math.floor(diff / 36e5) % 24);
      els.m.textContent = pad(Math.floor(diff / 6e4) % 60);
      els.s.textContent = pad(Math.floor(diff / 1e3) % 60);
    }
    upd(); setInterval(upd, 1000);
  })();

  // scroll-driven reveals
  function initScroll() {
    gsap.registerPlugin(ScrollTrigger);
    gsap.to('.hero .reveal', { opacity: 1, y: 0, duration: 1.1, stagger: 0.15, ease: 'power3.out', delay: 0.2 });
    gsap.utils.toArray('.section .reveal, footer .reveal').forEach(el => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });
    gsap.utils.toArray('.section-title').forEach(el => {
      gsap.fromTo(el, { scale: .92 }, { scale: 1, duration: 1.2, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
    });
  }
})();

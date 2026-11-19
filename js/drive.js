/* drive-down crash (three.js) */
    const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
    const sm = x => x * x * (3 - 2 * x);
    const SIN = Math.sin(.61);
    const COS = Math.cos(.61);
    const YAW0 = -Math.PI / 2 - .55;
    
    let ok = false, SY = 0, W = 0, H = 0, Sc = 40, R, sc, cam, car, shadow, hip, head, shoulder, elbow, hb, fb, sparks;
    let sparkV = [], smoke = [], stars = [], V, startY, headY, tx, startX, Send = 1;
    const T0 = performance.now();
    const letters = [];
    
    const M = (c, o) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .6, metalness: .1 }, o || {}));
    const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
    const C = (a, b, h, n) => new THREE.CylinderGeometry(a, b, h, n || 12);
    const S = r => new THREE.SphereGeometry(r, 16, 12);

    function add(g, m, x, y, z, par, rx, rz) {
      const o = new THREE.Mesh(g, m);
      o.position.set(x, y, z);
      if (rx) o.rotation.x = rx;
      if (rz) o.rotation.z = rz;
      (par || sc).add(o);
      return o;
    }

    function bottle() {
      const g = new THREE.Group();
      const br = M(0x6b3a12, { roughness: .2, metalness: .3 });
      add(C(.1, .11, .4), br, 0, -.2, 0, g);
      add(C(.09, .04, .25), br, 0, -.52, 0, g);
      add(C(.05, .05, .04), M(0xd4af37), 0, -.66, 0, g);
      add(C(.112, .112, .14), M(0xf5ecd0), 0, -.2, 0, g);
      return g;
    }

    /* split the target heading into flyable letters */
    (function () {
      const h = document.querySelector('#s-vars h2');
      h.innerHTML = [...h.textContent].map(c => '<span class="ch">' + (c === ' ' ? ' ' : c) + '</span>').join('');
      h.querySelectorAll('.ch').forEach(el => letters.push({
        el,
        dx: (Math.random() - .3) * 260,
        vy: -(80 + Math.random() * 180),
        r: (Math.random() - .5) * 900
      }));
    })();

    function init3d() {
      R = new THREE.WebGLRenderer({ canvas: $('gl'), antialias: true, alpha: true });
      R.setPixelRatio(Math.min(devicePixelRatio, 2));
      R.setClearColor(0x000000, 0);
      
      sc = new THREE.Scene();
      cam = new THREE.OrthographicCamera(-1, 1, 1, -1, .1, 600);
      sc.add(new THREE.HemisphereLight(0xb0b0ff, 0x3a2a4a, 1.05));
      
      const dl = new THREE.DirectionalLight(0xffe8d0, 1);
      dl.position.set(8, 20, 25);
      sc.add(dl);
      
      car = new THREE.Group();
      car.rotation.order = 'YXZ';
      sc.add(car);
      
      const red = M(0xe0283c, { metalness: .5, roughness: .35 });
      const dark = M(0x111118);
      
      add(B(4.4, .8, 1.9), red, 0, .75, 0, car);
      add(B(1.4, .3, 1.8), red, 1.5, 1.25, 0, car);
      add(B(2.3, .75, 1.7), M(0x6a86b8, { metalness: .8, roughness: .1, transparent: true, opacity: .38, depthWrite: false }), -.3, 1.5, 0, car);
      add(B(2.4, .08, 1.8), red, -.3, 1.92, 0, car);
      
      [[1.4, .95], [1.4, -.95], [-1.4, .95], [-1.4, -.95]].forEach(w => add(C(.45, .45, .3, 16), dark, w[0], .45, w[1], car, Math.PI / 2));
      
      [-.6, .6].forEach(z => {
        add(B(.1, .2, .4), M(0xfff3b0, { emissive: 0xffe080 }), 2.2, .85, z, car);
        add(B(.1, .2, .4), M(0xff2030, { emissive: 0xaa0010 }), -2.2, .85, z, car);
      });
      
      add(B(1.7, .04, .02), dark, .2, .95, -.96, car);
      add(B(.2, .15, .3), red, .9, 1.3, -1.1, car);
      add(new THREE.TorusGeometry(.25, .04, 8, 16), dark, .95, 1.4, -.3, car).rotation.y = 1.2;
      
      /* the guy: torso, neck and head are one leaning group so nothing floats */
      const skin = M(0xf1c27d);
      const shirt = M(0x3b82f6);
      const red2 = M(0xc2181f);
      
      hip = new THREE.Group();
      hip.position.set(.1, .95, -.1);
      hip.rotation.x = -.9;
      car.add(hip);
      
      add(B(.5, .8, .62), shirt, 0, .4, 0, hip);
      add(C(.14, .15, .45), skin, 0, .95, 0, hip);
      
      head = new THREE.Group();
      head.position.set(0, 1.25, 0);
      hip.add(head);
      
      add(S(.36), skin, 0, 0, 0, head);
      add(new THREE.SphereGeometry(.39, 16, 8, 0, 6.283, 0, 1.57), red2, 0, .06, 0, head);
      add(B(.38, .04, .44), red2, .32, .06, 0, head);
      add(B(.1, .1, .54), dark, .32, -.02, 0, head);
      add(B(.04, .07, .16), M(0xffffff), .36, -.15, 0, head);
      add(S(.17), shirt, .1, 1.25, -.86, car);
      
      shoulder = new THREE.Group();
      shoulder.position.set(.1, 1.25, -.86);
      car.add(shoulder);
      
      add(C(.11, .11, .7), shirt, 0, -.35, 0, shoulder);
      
      elbow = new THREE.Group();
      elbow.position.y = -.7;
      shoulder.add(elbow);
      
      add(C(.1, .1, .6), skin, 0, -.3, 0, elbow);
      add(S(.13), skin, 0, -.62, 0, elbow);
      
      hb = bottle();
      hb.position.y = -.55;
      hb.scale.setScalar(1.5);
      elbow.add(hb);
      
      fb = bottle();
      fb.scale.setScalar(1.5);
      fb.visible = false;
      sc.add(fb);
      
      const cv = document.createElement('canvas');
      cv.width = 128;
      cv.height = 64;
      const c2 = cv.getContext('2d');
      c2.scale(1, .5);
      
      const gr = c2.createRadialGradient(64, 64, 10, 64, 64, 62);
      gr.addColorStop(0, 'rgba(0,0,0,.55)');
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      c2.fillStyle = gr;
      c2.fillRect(0, 0, 128, 128);
      
      shadow = new THREE.Group();
      sc.add(shadow);
      add(new THREE.PlaneGeometry(5.6, 2.8), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false }), 0, .03, 0, shadow, -Math.PI / 2);
      
      const N = 90;
      const pp = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) sparkV.push([(Math.random() - .5) * 5, Math.random() * 4 + 1, (Math.random() - .2) * 5]);
      const pg = new THREE.BufferGeometry();
      pg.setAttribute('position', new THREE.BufferAttribute(pp, 3));
      
      sparks = new THREE.Points(pg, new THREE.PointsMaterial({ color: 0xffb020, size: 6, sizeAttenuation: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
      sparks.frustumCulled = false;
      sc.add(sparks);
      
      for (let i = 0; i < 8; i++) {
        const m = add(S(.6), new THREE.MeshBasicMaterial({ color: 0x999aa8, transparent: true, opacity: .5, depthWrite: false }), 0, 0, 0);
        m.userData = { ox: (Math.random() - .5) * 1.6, oz: (Math.random() - .5) * 1.6, d: i * .08 };
        smoke.push(m);
      }
      
      for (let i = 0; i < 3; i++) stars.push(add(S(.16), new THREE.MeshBasicMaterial({ color: 0xffd54a }), 0, 0, 0));
      V = new THREE.Vector3();
      ok = true;
      size();
    }

    function measure() {
      const sy = scrollY;
      const r1 = $('h1').getBoundingClientRect();
      const m = document.querySelector('main').getBoundingClientRect();
      const h2 = document.querySelector('#s-vars h2').getBoundingClientRect();
      
      startY = r1.top + sy + r1.height / 2;
      headY = h2.top + sy + h2.height / 2;
      tx = h2.left + Math.min(60, h2.width / 2);
      startX = innerWidth < 760 ? innerWidth * .78 : Math.min(innerWidth - Sc * 3, m.right - Sc * 1.6);
      Send = Math.max(300, headY - H * .55);
      
      if (sc) buildRoad();
    }

    const UV = .66;

    function RDC() {
      const iy = headY - 1.07 * Sc - 6;
      return { ix: tx + 1.14 * Sc, iy, yv: iy - H * .35, ex: -Sc * 9 };
    }

    function RD(r) {
      const c = RDC();
      if (r <= UV) {
        const a = r / UV;
        return [startX + (c.ix - startX) * sm(cl((a - .4) / .6)), startY + (c.yv - startY) * Math.pow(a, 1.5)];
      }
      const v = (r - UV) / (1 - UV);
      return [c.ix + (c.ex - c.ix) * sm(v), c.yv + Sc * 3 * v];
    }

    function P0(u) {
      if (u <= UV) return RD(u);
      const c = RDC();
      const v = (u - UV) / (1 - UV);
      return [c.ix, c.yv + (c.iy - c.yv) * (.75 * v + .25 * v * v)];
    }

    function PATH(u) {
      const b = P0(Math.min(1, u + .01));
      const c = P0(Math.max(0, u - .01));
      const dx = (b[0] - c[0]) / Sc;
      const dz = (b[1] - c[1]) / (Sc * SIN);
      const l = Math.hypot(dx, dz) || 1;
      return [0, 0, dx / l, dz / l];
    }

    let roadG;

    function buildRoad() {
      if (roadG) {
        sc.remove(roadG);
        roadG.traverse(o => { if (o.geometry) o.geometry.dispose() });
      }
      
      roadG = new THREE.Group();
      sc.add(roadG);
      
      const dense = [];
      const tw = (X, Y) => ({ x: (X - W / 2) / Sc, z: (Y - H / 2) / (Sc * SIN) });
      dense.push(tw(startX, startY - Sc * 5));
      
      for (let i = 0; i <= 300; i++) {
        const p = RD(i / 300);
        dense.push(tw(p[0], p[1]));
      }
      
      const wp = [];
      let acc = 0, next = 0;
      wp.push(dense[0]);
      
      for (let i = 1; i < dense.length; i++) {
        const a = dense[i - 1];
        const b = dense[i];
        const l = Math.hypot(b.x - a.x, b.z - a.z);
        
        while (acc + l >= next + 1) {
          next += 1;
          const k = (next - acc) / l;
          wp.push({ x: a.x + (b.x - a.x) * k, z: a.z + (b.z - a.z) * k });
        }
        acc += l;
      }
      
      wp.forEach((q, i) => {
        const a = wp[Math.max(0, i - 1)];
        const b = wp[Math.min(wp.length - 1, i + 1)];
        const dx = b.x - a.x;
        const dz = b.z - a.z;
        const l = Math.hypot(dx, dz) || 1;
        q.nx = -dz / l;
        q.nz = dx / l;
      });
      
      const strip = (o1, o2, y, mat, skip) => {
        const pos = [];
        const idx = [];
        let n = 0;
        
        for (let i = 0; i < wp.length - 1; i++) {
          if (skip && skip(i)) continue;
          [wp[i], wp[i + 1]].forEach(q => pos.push(q.x + q.nx * o1, y, q.z + q.nz * o1, q.x + q.nx * o2, y, q.z + q.nz * o2));
          idx.push(n, n + 1, n + 2, n + 1, n + 3, n + 2);
          n += 4;
        }
        
        if (!n) return;
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        g.setIndex(idx);
        roadG.add(new THREE.Mesh(g, mat));
      };
      
      const mb = (c, o) => new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide, transparent: true, opacity: o, depthWrite: false });
      
      strip(-2.3, 2.3, .005, mb(0x23232f, .94));
      strip(-2.3, -2.12, .01, mb(0xffffff, .8));
      strip(2.12, 2.3, .01, mb(0xffffff, .8));
      strip(-.08, .08, .012, mb(0xffd54a, 1), i => Math.floor(i / 2) % 2 === 1);
    }

    function size() {
      W = innerWidth;
      H = innerHeight;
      Sc = cl(W * .042, 26, 46);
      R.setSize(W, H, false);
      cam.left = -W / 2 / Sc;
      cam.right = W / 2 / Sc;
      cam.top = H / 2 / Sc;
      cam.bottom = -H / 2 / Sc;
      cam.position.set(0, 150 * SIN, 150 * COS);
      cam.lookAt(0, 0, 0);
      cam.updateProjectionMatrix();
      measure();
    }

    function scrollAnim() {}

    function frame() {
      requestAnimationFrame(frame);
      if (!ok) return;
      
      const now = performance.now();
      const dt = Math.min(.1, (now - (frame.l || now)) / 1000);
      frame.l = now;
      SY += (scrollY - SY) * (1 - Math.exp(-dt * 4));
      
      const tm = (now - T0) / 1000;
      const u = cl(SY / Send);
      const t = cl((SY - Send) / (H * 1.1));
      const tau = t * 3;
      const k2 = cl(t * 3);
      const bac = u * .2;
      const taper = 1 - cl((u - .86) / .12);
      
      $('flash2').style.opacity = t > 0 && t < .04 ? 1 - t / .04 : 0;
      document.querySelector('main').classList.toggle('shake', t > 0 && t < .08);
      $('gl').style.opacity = 1 - sm(cl((t - .45) / .35));
      
      /* path in page space, then to screen */
      const impX = tx + 1.14 * Sc;
      const impY = headY - 1.07 * Sc - 6;
      const pa = PATH(Math.max(u, .05));
      const pb = P0(u);
      const tyaw = Math.atan2(-pa[3], pa[2]) - .35;
      const yb = tyaw + (YAW0 - tyaw) * sm(cl((u - .8) / .2));
      
      let px = pb[0] + Math.sin(u * 55) * Sc * bac * 9 * taper;
      let py = pb[1] - scrollY;
      let hop = 0;
      let yaw = yb + Math.cos(u * 55) * bac * 1.2 * taper;
      let roll = 0;
      
      if (u < .03) py += Math.sin(tm * 3) * 1.5;
      
      if (t > 0) {
        px = impX + k2 * 1.6 * Sc * .52;
        py = impY - scrollY - k2 * 70;
        roll = Math.PI * cl(t * 2.2);
        hop = Math.sin(cl(t * 2) * Math.PI) * 2.6 + 1.9 * (1 - Math.cos(roll)) / 2;
        yaw = YAW0 + k2 * .5;
      }
      
      const wx = (px - W / 2) / Sc;
      const wz = (py - H / 2) / (Sc * SIN);
      
      car.position.set(wx, hop, wz);
      car.rotation.set(roll, yaw, 0);
      car.scale.x = t > 0 ? .86 : 1;
      
      shadow.position.set(wx, 0, wz);
      shadow.rotation.y = yaw;
      shadow.scale.set(1 - hop * .04, 1, 1 - hop * .04);
      shadow.visible = roll < 1.2;
      
      /* the guy */
      hip.rotation.x = -.9 + Math.sin(tm * 2.3) * .04 - k2 * .25;
      head.position.set(t > 0 ? Math.sin(cl(t * 4) * Math.PI) * .8 : 0, 1.25 + Math.sin(tm * 4) * .04, 0);
      head.rotation.z = Math.sin(tm * 3) * .12 * (1 - k2) + k2 * .5;
      
      shoulder.rotation.x = (1 - k2) * (.96 + Math.sin(tm * 2.7) * (.2 + bac * 1.2)) + k2 * .3;
      elbow.rotation.x = (1 - k2) * (1.57 + Math.sin(tm * 5.3) * .2) + k2 * .6;
      
      hb.visible = t <= 0;
      fb.visible = t > 0;
      
      if (t > 0) {
        fb.position.set(wx - tau * 3, Math.max(.12, 2 + 7 * tau - 4.9 * tau * tau), wz + tau * 3);
        fb.rotation.set(tau * 5, 0, tau * 8);
      }
      
      /* fx at the crash */
      const ox = (impX + k2 * 0 - W / 2) / Sc;
      const oz = (impY - scrollY - H / 2) / (Sc * SIN);
      const sa = sparks.geometry.attributes.position;
      
      sparks.visible = t > 0 && tau < 1.8;
      if (sparks.visible) {
        for (let i = 0; i < 90; i++) {
          const v = sparkV[i];
          sa.setXYZ(i, ox - 1.1 + v[0] * tau, Math.max(.05, 1 + v[1] * tau - 4.9 * tau * tau * .5), oz + 1.8 + v[2] * tau);
        }
        sa.needsUpdate = true;
        sparks.material.opacity = 1 - tau / 1.8;
      }
      
      smoke.forEach(m => {
        const d = m.userData;
        const s = Math.max(0, tau - d.d);
        m.visible = t > .02 && s < 3;
        m.position.set(wx + d.ox, 1.6 + s * 1.4, wz + d.oz);
        m.scale.setScalar(.6 + s * 1.1);
        m.material.opacity = .5 * (1 - cl(s / 3));
      });
      
      car.updateMatrixWorld(true);
      head.getWorldPosition(V);
      
      stars.forEach((m, i) => {
        m.visible = t > .15 && t < 1;
        const a = tm * 6 + i * 2.1;
        m.position.set(V.x + Math.cos(a) * .7, V.y + .8, V.z + Math.sin(a) * .7);
      });
      
      /* letters */
      const lk = t <= 0 ? 0 : t < .35 ? 1 - Math.pow(1 - t / .35, 2) : 1 - sm(cl((t - .35) / .5));
      letters.forEach(l => {
        l.el.style.transform = lk > .001 ? 'translate(' + l.dx * lk + 'px,' + (l.vy * lk + 160 * lk * lk) + 'px) rotate(' + l.r * lk + 'deg)' : '';
      });
      
      roadG.position.z = -scrollY / (Sc * SIN);
      R.render(sc, cam);
    }

    try {
      init3d();
      frame();
    } catch (e) {
      console.error(e);
    }
    
    addEventListener('resize', () => { if (ok) size() });
    addEventListener('load', () => { if (ok) measure() });
    
    setTimeout(() => { if (ok) measure() }, 800);


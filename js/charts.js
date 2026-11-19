/* charts */
    function setup(c) {
      const r = c.getBoundingClientRect();
      const d = devicePixelRatio || 1;
      c.width = r.width * d;
      c.height = r.height * d;
      const g = c.getContext('2d');
      g.setTransform(d, 0, 0, d, 0, 0);
      return [g, r.width, r.height];
    }

    function axes(g, W, H, x0, x1, y0, y1, P, zero) {
      g.strokeStyle = css('--line');
      g.fillStyle = css('--mut');
      g.font = '11px system-ui';
      g.lineWidth = 1;
      g.strokeRect(P, P / 2, W - P * 1.5, H - P * 1.5);
      
      for (let i = 0; i <= 4; i++) {
        const t = i / 4;
        const xx = P + t * (W - P * 1.5);
        const yy = H - P - t * (H - P * 1.5);
        g.fillText(fmt(x0 + t * (x1 - x0)), xx - 8, H - P / 2 + 4);
        g.fillText(fmt(y0 + t * (y1 - y0)), 2, yy + 4);
      }
      
      if (zero) {
        const yy = H - P - (0 - y0) / (y1 - y0) * (H - P * 1.5);
        g.beginPath();
        g.moveTo(P, yy);
        g.lineTo(W - P / 2, yy);
        g.strokeStyle = css('--acc2');
        g.stroke();
      }
    }

    function empty(g, W, H, t) {
      g.fillStyle = css('--mut');
      g.font = '14px system-ui';
      g.textAlign = 'center';
      g.fillText(t, W / 2, H / 2);
      g.textAlign = 'left';
    }

    let anim = 0;

    function draw() {
      const [g, W, H] = setup($('main'));
      const p = pts();
      const P = 44;
      g.clearRect(0, 0, W, H);
      
      if (!p.length) {
        axes(g, W, H, 0, 1, 0, 1, P);
        empty(g, W, H, 'No data yet');
        drawRes();
        return;
      }
      
      const log = logOn;
      const T = y => log ? Math.log10(y) : y;
      const xs = p.map(q => q.x);
      const x0 = Math.min(...xs);
      const x1 = Math.max(...xs) || 1;
      const xr = (x1 - x0) || 1;
      const ys = p.map(q => T(q.y));
      
      let y0 = Math.min(...ys);
      let y1 = Math.max(...ys);
      
      if (fit) {
        const e = [T(f(x0)), T(f(x1))];
        y0 = Math.min(y0, ...e);
        y1 = Math.max(y1, ...e);
      }
      
      if (y1 === y0) y1 = y0 + 1;
      if (!log) y0 = Math.min(0, y0);
      
      const sx = x => P + (x - x0) / xr * (W - P * 1.5);
      const sy = y => H - P - (T(y) - y0) / (y1 - y0) * (H - P * 1.5);
      
      axes(g, W, H, x0, x1, y0, y1, P);
      
      const prog = Math.min(1, (performance.now() - anim) / 900);
      
      if (fit) {
        g.beginPath();
        g.strokeStyle = css('--acc');
        g.lineWidth = 3;
        g.shadowColor = css('--acc');
        g.shadowBlur = 12;
        
        for (let i = 0; i <= 100 * prog; i++) {
          const x = x0 + i / 100 * xr;
          if (i) {
            g.lineTo(sx(x), sy(f(x)));
          } else {
            g.moveTo(sx(x), sy(f(x)));
          }
        }
        g.stroke();
        g.shadowBlur = 0;
      }
      
      g.fillStyle = css('--acc2');
      p.forEach(q => {
        g.beginPath();
        g.arc(sx(q.x), sy(q.y), 5, 0, 7);
        g.fill();
      });
      
      if (prog < 1) requestAnimationFrame(draw);
      drawRes();
    }

    function drawRes() {
      const [g, W, H] = setup($('resc'));
      const p = pts();
      const P = 44;
      g.clearRect(0, 0, W, H);
      
      if (!fit || !p.length) {
        axes(g, W, H, 0, 1, -1, 1, P, true);
        empty(g, W, H, 'Residual plot appears here');
        return;
      }
      
      const xs = p.map(q => q.x);
      const x0 = Math.min(...xs);
      const x1 = Math.max(...xs);
      const xr = (x1 - x0) || 1;
      
      const rs = p.map(q => q.y - f(q.x));
      const m = Math.max(...rs.map(Math.abs)) || 1;
      
      axes(g, W, H, x0, x1, -m, m, P, true);
      g.fillStyle = css('--acc');
      
      p.forEach((q, i) => {
        const x = P + (q.x - x0) / xr * (W - P * 1.5);
        const y = H - P - (rs[i] + m) / (2 * m) * (H - P * 1.5);
        g.beginPath();
        g.arc(x, y, 5, 0, 7);
        g.fill();
      });
    }

    addEventListener('resize', draw);

    function fillText() {
      $('members').textContent = CFG.members;
      $('indT').textContent = CFG.indep;
      $('depT').textContent = CFG.dep;
      $('py').textContent = 'If a driver has a BAC of ' + CFG.px + '%, the model predicts a ' + CFG.depShort + ' of about ' + fmt(f(CFG.px)) + '.';
      
      const xi = Math.log(CFG.py / fit.a) / Math.log(fit.b);
      $('qx').textContent = 'A ' + CFG.depShort + ' of ' + CFG.py + ' corresponds to a BAC of about ' + fmt(xi) + '%.';
      $('domT').textContent = CFG.domain;
      $('ranT').textContent = CFG.range;
      $('domWhy').textContent = CFG.domWhy;
      
      const rs = rows.map(q => q.y - f(q.x));
      let ch = 0;
      for (let i = 1; i < rs.length; i++) {
        if (Math.sign(rs[i]) !== Math.sign(rs[i - 1])) ch++;
      }
      
      $('goodT').textContent = ch >= rs.length / 3 
        ? 'The residuals bounce above and below zero with no clear pattern, so an exponential model is a good fit for this data.' 
        : 'The residuals show a clear pattern (runs of positive, then negative values), so the exponential model is only an approximate fit and a different model may work better.';
        
      calcErr();
    }

    function calcErr() {
      const q = rows[+$('eidx').value - 1];
      if (!q) {
        $('eout').textContent = 'Pick a row from 1 to ' + rows.length + '.';
        $('emean').textContent = '';
        return;
      }
      
      const p = f(q.x);
      const e = q.y - p;
      
      $('eout').textContent = 'Actual ' + fmt(q.y) + ' \u2212 predicted ' + fmt(p) + ' = ' + fmt(e);
      $('emean').textContent = 'At a BAC of ' + q.x + '%, the model ' + (e > 0 ? 'under-predicts' : 'over-predicts') + ' the ' + CFG.depShort + ' by about ' + fmt(Math.abs(e)) + '.';
    }


const $ = id => document.getElementById(id);
    let rows = [];
    const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

    /* reveal on scroll */
    const io = new IntersectionObserver(es => {
      es.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: .12 });

    document.querySelectorAll('.card').forEach(c => io.observe(c));

    const CFG = window.ProjectConfig.CFG;

    let logOn = false;
    rows = CFG.data.map(r => ({ x: r[0], y: r[1] }));

    function pts() {
      return rows;
    }

    function renderRows() {
      $('rows').innerHTML = rows.map((r, i) => `<tr><td>${i + 1}</td><td>${r.x}</td><td>${r.y}</td></tr>`).join('');
      update();
    }

    /* regression using Desmos model */
    let fit = { 
      a: 0.583048, 
      b: 2.2072e10 //2.2072^10
    };

    const f = x => fit.a * Math.pow(fit.b, x);
    const fmt = v => Math.abs(v) >= 1e4 || (v !== 0 && Math.abs(v) < 1e-3) ? v.toExponential(3) : (+v.toFixed(4)).toString();

    function update() {
      // Hardcoding the display text to look nice with the scientific notation
      $('eq').textContent = `y = 0.583048 · (2.2072 × 10¹⁰)ˣ`;
      $('eqinfo').textContent = `Equation found with desmos Exponential Regression.`;
      
      const p = pts();
      $('rtab').innerHTML = p.map(q => 
        `<tr><td>${fmt(q.x)}</td><td>${fmt(q.y)}</td><td>${fmt(f(q.x))}</td><td>${fmt(q.y - f(q.x))}</td></tr>`
      ).join('');
      
      draw();
    }

anim = performance.now();
renderRows();
fillText();
scrollAnim();

const logButton = document.querySelector('#s-graph button');
logButton?.addEventListener('click', () => {
  logOn = !logOn;
  logButton.textContent = logOn ? 'Log scale: OFF' : 'Log scale: ON';
  draw();
});

$('eidx').addEventListener('input', calcErr);

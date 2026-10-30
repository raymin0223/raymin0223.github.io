 'use strict';
(() => {
  const data = window.OPRD_DATA;
  const $ = id => document.getElementById(id);
  function selectButtons(selector, key, selected) {
    document.querySelectorAll(selector).forEach(button => button.setAttribute('aria-pressed', String(button.dataset[key] === selected)));
  }
  function renderResults(domain) {
    const results = data.results[domain];
    const rows = results.rows;
    const average = row => row.values[row.values.length - 1];
    const trainedRows = rows.filter(row => !['Teacher', 'Student'].includes(row.name));
    const oprd = rows.find(row => row.name === 'OPRD');
    const strongest = Math.max(...rows.filter(row => ['GRPO', 'OPD', 'KDRL'].includes(row.name)).map(average));
    $('result-pair').textContent = results.pair;
    $('result-score').textContent = average(oprd).toFixed(2);
    $('score-description').textContent = `OPRD · ${results.metric}, averaged over training checkpoints`;
    $('result-gain').textContent = `+${(average(oprd) - strongest).toFixed(2)} pp`;
    $('table-title').textContent = results.title;
    $('table-note').textContent = results.note;
    $('results-aggregation').textContent = `Teacher and initial-student rows use fixed checkpoints. Trained rows average evaluations at updates ${results.updates.join(', ')}. Bold marks the best trained-policy score, matching the paper.`;
    $('results-table').innerHTML = `<caption class="sr-only">${results.title}, ${results.metric} percent; trained policies averaged over five checkpoints.</caption><thead><tr><th scope="col">Policy</th>${results.columns.map(column => `<th scope="col">${column}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr class="${row.name === 'OPRD' ? 'oprd-row' : ''}"><th scope="row">${row.name}</th>${row.values.map((v, i) => `<td class="${trainedRows.includes(row) && v === Math.max(...trainedRows.map(r => r.values[i])) ? 'best' : ''}">${v.toFixed(2)}</td>`).join('')}</tr>`).join('')}</tbody>`;
    $('result-bars').innerHTML = rows.filter(row => row.name !== 'Student').map(row => `<div class="bar-row ${row.name === 'OPRD' ? 'is-oprd' : ''}"><span>${row.name}</span><div class="bar-track" aria-hidden="true"><div class="bar-fill" style="width:${average(row)}%"></div></div><span>${average(row).toFixed(2)}</span></div>`).join('');
    selectButtons('[data-domain]', 'domain', domain);
  }
  let alignment = 'positive';
  function renderGeometry() {
    const lambda = Number($('strength').value);
    const sign = alignment === 'positive' ? 1 : -1;
    const origin = { x: 280, y: 282 };
    const student = { x: origin.x + sign * 68, y: 144 };
    const scaled = { x: origin.x + sign * 68 * (1 + lambda), y: 144 };
    const line = (id, from, to) => Object.entries({ x1: from.x, y1: from.y, x2: to.x, y2: to.y }).forEach(([k, v]) => $(id).setAttribute(k, v));
    line('student-vector', origin, student);
    line('scaled-vector', origin, scaled);
    line('projection-guide', scaled, { x: scaled.x, y: origin.y });
    line('amplified-component', origin, { x: scaled.x, y: origin.y });
    $('student-label').setAttribute('x', student.x + (sign > 0 ? -20 : 10));
    $('student-label').setAttribute('y', 137);
    $('scaled-label').setAttribute('x', scaled.x + (sign > 0 ? 10 : -23));
    $('scaled-label').setAttribute('y', 129);
    $('strength-value').textContent = `λ = ${lambda.toFixed(1)}`;
    const label = alignment === 'positive' ? 'Teacher-aligned progress' : 'Verifier-supported departure from the teacher';
    const caption = `${label} is amplified by ${(1 + lambda).toFixed(1)}×. The orthogonal component is unchanged.`;
    $('geometry-caption').textContent = caption;
    $('vector-description').textContent = caption;
    selectButtons('[data-alignment]', 'alignment', alignment);
  }

  document.querySelectorAll('[data-domain]').forEach(b => b.addEventListener('click', () => renderResults(b.dataset.domain)));
  document.querySelectorAll('[data-alignment]').forEach(b => b.addEventListener('click', () => { alignment = b.dataset.alignment; renderGeometry(); }));
  $('strength').addEventListener('input', renderGeometry);
  $('copy-citation').addEventListener('click', async () => {
    const citation = $('citation').textContent;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(citation);
      $('copy-citation').textContent = 'Copied';
      $('copy-status').textContent = 'BibTeX copied to clipboard.';
    } catch {
      const range = document.createRange();
      range.selectNodeContents($('citation'));
      const selection = window.getSelection();
      selection.removeAllRanges(); selection.addRange(range);
      $('copy-status').textContent = 'Citation selected. Press Ctrl+C (or ⌘C) to copy.';
    }
  });

  renderResults('math');
  renderGeometry();
  $('curve-values').innerHTML = Object.entries(data.curves).map(([key, curve]) => `<div class="table-scroll"><table><caption>${curve.title} (${curve.metric}, %)</caption><thead><tr><th scope="col">Update</th><th scope="col">GRPO</th><th scope="col">OPD</th><th scope="col">OPRD</th><th scope="col">Teacher</th></tr></thead><tbody>${data.steps.map((step, i) => `<tr><th scope="row">${step}</th>${['GRPO','OPD','OPRD'].map(method => `<td>${curve.series[method][i].toFixed(2)}</td>`).join('')}<td>${curve.teacher.toFixed(2)}</td></tr>`).join('')}</tbody></table></div>`).join('');

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const narrowScreen = window.matchMedia('(max-width: 640px)');
  const videos = [...document.querySelectorAll('.learning-video')];
  const playVisible = video => {
    if (!document.hidden && !reducedMotion.matches && !video.dataset.userPaused) video.play().catch(() => {});
  };
  function selectMovie(video) {
    const base = video.id === 'successive-video' ? 'successive-learning' : 'multiteacher-learning';
    const suffix = narrowScreen.matches ? '-mobile' : '';
    const extension = video.canPlayType('video/webm; codecs="vp9"') ? 'webm' : 'mp4';
    const next = `assets/${base}${suffix}.${extension}`;
    if (video.getAttribute('src') !== next) {
      if (!video.paused) video.dataset.autoPause = 'true';
      video.src = next;
      video.poster = `assets/${base}${suffix}.png`;
      video.style.aspectRatio = narrowScreen.matches ? (video.id === 'successive-video' ? '640 / 850' : '640 / 1260') : '1280 / 430';
      video.load();
    }
  }
  videos.forEach(video => {
    const toggle = document.querySelector(`[data-toggle="${video.id}"]`);
    const seek = document.querySelector(`[data-seek="${video.id}"]`);
    const updateControl = () => {
      toggle.textContent = video.paused ? 'Play' : 'Pause';
      toggle.setAttribute('aria-label', `${video.paused ? 'Play' : 'Pause'} learning animation`);
    };
    video.muted = true;
    video.controls = false;
    video.addEventListener('pause', () => {
      if (video.dataset.autoPause) delete video.dataset.autoPause;
      else video.dataset.userPaused = 'true';
      updateControl();
    });
    video.addEventListener('play', () => { delete video.dataset.userPaused; updateControl(); });
    video.addEventListener('loadedmetadata', () => {
      if (video.dataset.visible === 'true') playVisible(video);
    });
    video.addEventListener('timeupdate', () => {
      if (Number.isFinite(video.duration) && video.duration > 0) {
        seek.value = String(Math.round(video.currentTime / video.duration * 1000));
        seek.setAttribute('aria-valuetext', `${video.currentTime.toFixed(1)} of ${video.duration.toFixed(1)} seconds`);
      }
    });
    toggle.addEventListener('click', () => {
      if (video.paused) { delete video.dataset.userPaused; video.play().catch(() => {}); }
      else { delete video.dataset.autoPause; video.pause(); }
    });
    seek.addEventListener('input', () => {
      if (Number.isFinite(video.duration)) video.currentTime = Number(seek.value) / 1000 * video.duration;
    });
    selectMovie(video);
  });
  narrowScreen.addEventListener('change', () => videos.forEach(selectMovie));
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      const video = entry.target;
      video.dataset.visible = String(entry.isIntersecting);
      if (entry.isIntersecting) playVisible(video);
      else if (!video.paused) { video.dataset.autoPause = 'true'; video.pause(); }
    }), { threshold: 0.25 });
    videos.forEach(video => observer.observe(video));
  }
  const updateMotion = () => videos.forEach(video => {
    if (document.hidden || reducedMotion.matches) {
      if (!video.paused) { video.dataset.autoPause = 'true'; video.pause(); }
    } else if (video.dataset.visible === 'true') playVisible(video);
  });
  reducedMotion.addEventListener('change', updateMotion);
  document.addEventListener('visibilitychange', updateMotion);
  document.querySelectorAll('[data-replay]').forEach(button => button.addEventListener('click', () => {
    const video = $(button.dataset.replay);
    video.currentTime = 0;
    delete video.dataset.userPaused;
    video.play().catch(() => {});
  }));
})();

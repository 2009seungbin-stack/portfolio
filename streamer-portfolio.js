/* Extend the existing player. All sources are local, lazy-loaded media. */
(() => {
  const data = window.STREAMER_PORTFOLIO;
  if (!data) return;
  const host = document.querySelector('#streamerWorks');
  const tabs = [...document.querySelectorAll('.game-tab')];
  const label = document.querySelector('#streamerSelection');
  const thumbnailWorks = data.works.filter(w => w.group === 'wide');
  let activeGame = 'lol';

  function streamCard(w) {
    const base = `media/${w.id}/`;
    const long = w.group === 'wide';
    return `<button type="button" class="work" data-id="${esc(w.id)}" aria-label="${esc(w.cardTitle || w.title)} 약 30초 재생" data-cursor="label" data-label="PLAY">
      <span class="thumb"><img src="${base}cover.jpg" alt="" loading="lazy" width="${long ? 1280 : 432}" height="${long ? 720 : 768}">
      <span class="sprite" style="background-image:url('${base}sprite.jpg');background-size:800% 500%"></span>
      <span class="play-ico" aria-hidden="true"></span><span class="burn">${tc(0)}</span><span class="scrub"><i></i></span>
      <span class="clip-length">${mmss(w.duration)}</span></span>
      <span><span class="stream-meta"><strong>${long ? '롱폼 발췌' : '쇼츠 발췌'}</strong><span>전체 편집본 ${mmss(w.originalDuration)}</span></span>
      <h4>${esc(w.cardTitle || w.title)}</h4>${long ? `<p class="work-summary">${esc(w.description)}</p>` : ''}</span>
      </button>`;
  }

  function renderGame(game) {
    activeGame = game;
    const info = data.games.find(g => g.id === game);
    const works = data.works.filter(w => w.game === game);
    tabs.forEach(t => { const selected = t.dataset.game === game; t.setAttribute('aria-selected', selected); t.tabIndex = selected ? 0 : -1; });
    host.setAttribute('aria-labelledby', `tab-${game}`);
    label.textContent = `${info.streamer} · 롱폼 2편 / 쇼츠 2편`;
    host.innerHTML = `<div class="streamer-panel"><div class="stream-long-grid">${works.filter(w => w.group === 'wide').map(streamCard).join('')}</div>
      <div><h3 class="shorts-heading"><span>같은 방송, 세로로 다시.</span><span>9:16</span></h3><div class="stream-short-grid">${works.filter(w => w.group === 'shorts').map(streamCard).join('')}</div></div></div>`;
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => renderGame(tab.dataset.game));
    tab.addEventListener('keydown', e => {
      let target;
      if (e.key === 'ArrowRight') target = (index + 1) % tabs.length;
      if (e.key === 'ArrowLeft') target = (index + tabs.length - 1) % tabs.length;
      if (e.key === 'Home') target = 0;
      if (e.key === 'End') target = tabs.length - 1;
      if (target !== undefined) { e.preventDefault(); renderGame(tabs[target].dataset.game); tabs[target].focus(); }
    });
  });
  renderGame(activeGame);
  host.addEventListener('click', e => {
    const button = e.target.closest('.work');
    if (button) openWork(workById[button.dataset.id]);
  });
  host.addEventListener('pointermove', e => {
    const target = e.target.closest('.work .thumb');
    if (!target || e.pointerType !== 'mouse') return;
    const w = workById[target.closest('.work').dataset.id];
    const rect = target.getBoundingClientRect();
    const portion = clamp01((e.clientX - rect.left) / rect.width);
    const frame = Math.min(39, Math.floor(portion * 40));
    target.classList.add('scrubbing');
    target.querySelector('.sprite').style.backgroundPosition = `${(frame % 8) * 100 / 7}% ${Math.floor(frame / 8) * 100 / 4}%`;
    target.querySelector('.burn').textContent = tc(portion * w.duration * FPS);
    target.style.setProperty('--s', portion);
  });
  host.addEventListener('pointerout', e => {
    const target = e.target.closest('.thumb');
    if (target && !target.contains(e.relatedTarget)) target.classList.remove('scrubbing');
  });

  const compare = document.querySelector('#thumbnailCompareImage');
  const compareCaption = document.querySelector('#thumbnailCompareCaption');
  document.querySelectorAll('[data-compare]').forEach(button => button.addEventListener('click', () => {
    const after = button.dataset.compare === 'after';
    compare.src = after ? 'media/stream_lol_long_v02/thumbnail.jpg' : 'media/thumbnail-before.jpg';
    compare.alt = after ? 'B안: 실제 펜타킬 화면과 크게 배치한 크캣의 리액션' : '기존 구성: 주황 프레임과 여러 겹의 외곽선';
    compareCaption.textContent = after ? 'B안 · 실제 표정 + 펜타킬 근거 화면 + 핵심 단어 강조' : '기존 구성 · 같은 원본과 문구를 사용한 이전 시안';
    document.querySelectorAll('[data-compare]').forEach(b => b.setAttribute('aria-pressed', b === button));
  }));

  const gallery = document.querySelector('#thumbnailGallery');
  gallery.innerHTML = thumbnailWorks.map((w, i) => `<button type="button" class="thumbnail-card" data-thumb="${i}" aria-label="${esc(w.cardTitle || w.title)} 썸네일 크게 보기" data-cursor="label" data-label="VIEW">
    <img src="media/${w.id}/thumbnail.jpg" width="1280" height="720" loading="lazy" alt="${esc(w.cardTitle || w.title)} B안 썸네일">
    <span><b>${esc(w.gameLabel)}</b><span>${esc(w.who.split(' · ')[0])} ↗</span></span></button>`).join('');
  const dialog = document.querySelector('#thumbnailDialog');
  let thumbIndex = 0;
  function showThumbnail(index) {
    thumbIndex = (index + thumbnailWorks.length) % thumbnailWorks.length;
    const w = thumbnailWorks[thumbIndex];
    document.querySelector('#thumbnailDialogImage').src = `media/${w.id}/thumbnail.jpg`;
    document.querySelector('#thumbnailDialogImage').alt = `${w.cardTitle || w.title} B안 썸네일`;
    document.querySelector('#thumbnailDialogTitle').textContent = w.cardTitle || w.title;
    document.querySelector('#thumbnailDialogCount').textContent = `${thumbIndex + 1} / ${thumbnailWorks.length}`;
    document.querySelector('#thumbnailDialogMeta').textContent = `${w.gameLabel} · ${w.who.split(' · ')[0]} · B안`;
  }
  gallery.addEventListener('click', e => {
    const button = e.target.closest('[data-thumb]');
    if (!button) return;
    showThumbnail(Number(button.dataset.thumb));
    dialog.showModal(); document.body.classList.add('modal-open');
  });
  function closeThumbnail() { dialog.close(); document.body.classList.remove('modal-open'); }
  document.querySelector('#thumbnailDialogClose').addEventListener('click', closeThumbnail);
  dialog.addEventListener('close', () => document.body.classList.remove('modal-open'));
  dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if(e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeThumbnail(); } });
  document.querySelector('#thumbnailPrevious').addEventListener('click', () => showThumbnail(thumbIndex - 1));
  document.querySelector('#thumbnailNext').addEventListener('click', () => showThumbnail(thumbIndex + 1));
  dialog.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') showThumbnail(thumbIndex - 1); if (e.key === 'ArrowRight') showThumbnail(thumbIndex + 1); });
  document.querySelector('#thumbnailWatch').addEventListener('click', () => { const w = thumbnailWorks[thumbIndex]; closeThumbnail(); openWork(workById[w.id]); });

  // Keep focus within the pre-existing video dialog when navigating by keyboard.
  document.querySelector('#modal').addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const focusable = [...e.currentTarget.querySelectorAll('button,video[controls],a[href]')].filter(el => !el.hidden && el.getClientRects().length);
    const first = focusable[0], last = focusable[focusable.length-1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
})();

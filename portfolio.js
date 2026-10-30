/* 히어로 쇼릴 · 장르 챕터 · 전체 그리드 · 스타일 재현 · 썸네일 · 크레딧.
   데이터는 portfolio-data.js(window.PORTFOLIO), 문구는 site-copy.js.
   index.html 안의 스크립트가 먼저 실행되어 $, $$, esc, tc, mmss, clamp01, FPS, reduce, reveal, openWork,
   workById, genreLabel, sourceLine, DATA, COPY를 만든다.
   영상 규칙: 히어로 하나 + 그 밖에는 한 번에 한 편만 재생. 재생 창이 열리면 나머지는 모두 멈춘다. */
(() => {
  const works = DATA.works || [];
  const SPRITE_N = 40, COLS = 8, ROWS = 5;
  const shownGenres = DATA.genres.filter(g => works.some(w => w.genre === g.id));   // 비어 있는 장르 탭은 숨긴다
  const saveData = !!(navigator.connection && navigator.connection.saveData);
  let lightboxOpen = false;

  /* ---------- 히어로 쇼릴: 소리 켜기 · 일시정지 · 타임코드 · 화면 밖이면 멈춤 ---------- */
  const hv = $("#heroVideo"), sound = $("#soundToggle"), reelBtn = $("#reelToggle"), tcNow = $("#heroTcNow");
  let heroUserPaused = reduce, heroInView = true;
  function heroUI() {
    const playing = !hv.paused;
    $(".pz", reelBtn).style.display = playing ? "inline" : "none";
    $(".pl", reelBtn).style.display = playing ? "none" : "inline";
    reelBtn.setAttribute("aria-label", playing ? "쇼릴 일시정지" : "쇼릴 재생");
    const on = !hv.muted;
    sound.setAttribute("aria-pressed", on);
    sound.setAttribute("aria-label", on ? "쇼릴 소리 끄기" : "쇼릴 소리 켜기");
    $("#soundLabel").textContent = on ? "소리 끄기" : "소리 켜기";
    $(".wave", sound).style.display = on ? "inline" : "none";
    $(".mute", sound).style.display = on ? "none" : "inline";
  }
  function heroPlay() { if (!hv.src) return; hv.play().catch(() => { heroUserPaused = true; heroUI(); }); }
  if (hv.src) {
    reelBtn.addEventListener("click", () => {
      if (hv.paused) { heroUserPaused = false; heroPlay(); } else { heroUserPaused = true; hv.pause(); }
    });
    sound.addEventListener("click", () => {
      hv.muted = !hv.muted;
      if (!hv.muted && hv.paused) { heroUserPaused = false; heroPlay(); }
    });
    ["play", "pause", "volumechange"].forEach(t => hv.addEventListener(t, heroUI));
    // 타임코드: 재생 중일 때만 프레임마다 갱신
    const tick = () => { tcNow.textContent = tc(hv.currentTime * FPS); if (!hv.paused) requestAnimationFrame(tick); };
    hv.addEventListener("play", () => requestAnimationFrame(tick));
    hv.addEventListener("seeked", tick);
    // 화면 밖에서는 멈춰 데이터와 배터리를 아낀다
    new IntersectionObserver(([en]) => {
      heroInView = en.isIntersecting;
      if (!heroInView) hv.pause();
      else if (!heroUserPaused && !lightboxOpen) heroPlay();
    }, { threshold: .05 }).observe(hv);
    heroUI();
  } else {
    sound.hidden = reelBtn.hidden = true; $("#heroTc").hidden = true;
  }

  /* ---------- 장르 챕터: 장르마다 대표작 한 편 ---------- */
  const CH_ORDER = ["variety", "game", "vlog", "edu", "motion"];
  // 미리보기 구간(초). 설명은 아래 keepInSegments 참고
  const PREVIEW_SEGMENTS = { type_neon: [[4.25, 7.9], [12.25, 15.9]] };
  const chapterWorks = CH_ORDER.map(g => works.find(w => w.genre === g && w.featured && w.format !== "vertical")
    || works.find(w => w.genre === g && w.format !== "vertical")).filter(Boolean);
  const spriteBg = src => `background-image:url('${src}');background-size:${COLS * 100}% ${ROWS * 100}%`;
  const scrubLayer = sprite => sprite ? `<span class="sprite" style="${spriteBg(sprite)}"></span><span class="burn">${tc(0)}</span><span class="scrub"><i></i></span>` : "";

  $("#heroGenres").innerHTML = chapterWorks.map(w =>
    `<li><a href="#ch-${esc(w.genre)}">${esc(genreLabel[w.genre] || "")}<b>${works.filter(x => x.genre === w.genre).length}</b></a></li>`).join("");

  function chapter(w, i) {
    const c = w.clip, s = w.short, own = w.kind === "개인 작업";
    const ref = w.styleRef ? w.styleRef.name : "";
    const side = s && s.status === "ready"
      ? `<button type="button" class="ch-short" data-id="${esc(w.id)}" data-mode="short" aria-label="${esc(w.cardTitle)} 세로 쇼츠 보기">
          <span class="thumb"><img src="${esc(s.cover)}" alt="" loading="lazy" draggable="false" width="720" height="1280">${scrubLayer(s.sprite)}</span>
          <span class="lbl"><b><span class="ico-short" aria-hidden="true"></span>세로 쇼츠</b><span>9:16 · ${mmss(s.duration)}</span></span></button>`
      : `<a class="ch-live" href="#type"><span class="tag">LIVE</span><strong>브라우저에서 지금 움직이는 버전</strong><span class="go">직접 글자를 넣어 볼 수 있어요 ↓</span></a>`;
    return `<article class="chapter" id="ch-${esc(w.genre)}" data-id="${esc(w.id)}" data-reveal>
      <p class="ch-slate"><b>CH.${String(i + 1).padStart(2, "0")}</b><span>${esc(genreLabel[w.genre] || "")}</span><i aria-hidden="true"></i><span>${esc(w.kind || "")}</span></p>
      <header class="ch-head">
        <div class="ch-titles">${ref ? `<p class="ch-ref">${esc(ref)}</p>` : ""}<h3 class="ch-title">${esc(w.cardTitle)}</h3></div>
        <p class="ch-roles">${esc((w.role || []).join(" · "))}</p>
      </header>
      <div class="ch-media">
        <div class="ch-screen">
          <video muted loop playsinline preload="none" poster="${esc(c.cover || (w.thumbnail && w.thumbnail.src) || "")}" data-src="${esc(c.src)}" disablepictureinpicture controlslist="nodownload" aria-hidden="true" tabindex="-1"></video>
          ${PREVIEW_SEGMENTS[w.id] ? `<img class="ch-hold" src="${esc(c.cover)}" alt="" draggable="false" hidden>` : ""}
          <button type="button" class="ch-open" data-id="${esc(w.id)}" data-mode="main" aria-label="${esc(w.cardTitle)} 하이라이트 ${c.audio === false ? "크게" : "소리와 함께"} 보기"><span class="pill"><span class="ico-play" aria-hidden="true"></span>${c.audio === false ? "크게 보기" : "소리 켜고 보기"} · ${mmss(c.duration)}</span></button>
          <span class="ch-tc" aria-hidden="true">${tc(0)}</span>
        </div>
        <div class="ch-side">${side}</div>
      </div>
      <div class="ch-foot">
        <dl class="ch-note">
          <dt>${own ? "작업" : "측정"}</dt><dd>${esc(w.styleRef ? w.styleRef.detail : "")}</dd>
          <dt>${own ? "결과" : "재현"}</dt><dd class="made">${esc(w.summary || "")}</dd>
        </dl>
        <div class="ch-cta">
          <button type="button" class="btn primary sm" data-id="${esc(w.id)}" data-mode="main"><span class="ico-play" aria-hidden="true"></span>하이라이트 ${mmss(c.duration)}</button>
          ${s && s.status === "ready" ? `<button type="button" class="btn sm" data-id="${esc(w.id)}" data-mode="short"><span class="ico-short" aria-hidden="true"></span>쇼츠 ${mmss(s.duration)}</button>` : ""}
        </div>
        <p class="ch-credit">${sourceLine(w)}</p>
      </div>
    </article>`;
  }
  const chHost = $("#chapters");
  chHost.innerHTML = chapterWorks.map(chapter).join("");
  chHost.addEventListener("click", e => {
    const b = e.target.closest("button[data-mode]");
    if (b) openWork(workById[b.dataset.id], b.dataset.mode);
  });

  // 화면에 가장 많이 보이는 챕터 하나만 소리 없이 미리보기 재생 (동작 줄이기·데이터 절약 모드면 표지만)
  const autoPreview = !reduce && !saveData;
  // 미리보기에서 건너뛸 구간: 네온 타이포 렌더는 4장면 중 2장면이 밝은 배경이라 어두운 페이지에서 눈부시다.
  // 어두운 장면만 이어서 반복한다(ffmpeg로 잰 밝기 기준: 4.2–7.95초, 12.2–15.95초). 재생 창에서는 전체를 그대로 보여 준다.
  const segsOf = v => PREVIEW_SEGMENTS[v.closest(".chapter").dataset.id];
  // 구간 밖이면 다음 어두운 구간으로 건너뛴다. 건너뛰기가 안 되는 서버(Range 미지원)에서도 밝은 장면이
  // 보이지 않도록, 구간 밖에서는 어두운 표지(.ch-hold)를 덮어 둔다
  function keepInSegments(v) {
    const segs = segsOf(v); if (!segs) return;
    const t = v.currentTime, inside = segs.some(([a, b]) => t >= a && t < b);
    v.parentNode.querySelector(".ch-hold").hidden = inside;
    if (!inside && !v.seeking) v.currentTime = segs.find(([a]) => a > t)?.[0] ?? segs[0][0];
  }
  const ratios = new Map();
  let chActive = null;
  function chTick() {
    if (!chActive || chActive.paused) return;
    keepInSegments(chActive);
    chActive.closest(".ch-screen").querySelector(".ch-tc").textContent = tc(chActive.currentTime * FPS);
    requestAnimationFrame(chTick);
  }
  function stopChapter() {
    if (!chActive) return;
    chActive.pause(); chActive.closest(".chapter").classList.remove("is-playing"); chActive = null;
  }
  function pickChapter() {
    if (!autoPreview || lightboxOpen) return;
    let best = null, br = .55;
    ratios.forEach((r, v) => { if (r >= br) { best = v; br = r; } });
    if (best === chActive) return;
    stopChapter();
    if (!best) return;
    chActive = best;
    if (!best.getAttribute("src")) {
      best.preload = "auto"; best.src = best.dataset.src;
      const segs = segsOf(best); if (segs) best.addEventListener("loadedmetadata", () => { best.currentTime = segs[0][0]; }, { once: true });
    }
    best.closest(".chapter").classList.add("is-playing");
    best.play().then(() => requestAnimationFrame(chTick)).catch(() => {});
  }
  const chIO = new IntersectionObserver(ents => { ents.forEach(en => ratios.set(en.target, en.intersectionRatio)); pickChapter(); },
    { threshold: [0, .25, .5, .55, .7, .85, 1] });
  $$(".ch-screen video", chHost).forEach(v => chIO.observe(v));

  document.addEventListener("lightbox", e => {
    lightboxOpen = e.detail.open;
    if (lightboxOpen) { stopChapter(); if (hv.src) hv.pause(); }
    else { pickChapter(); if (hv.src && heroInView && !heroUserPaused) heroPlay(); }
  });

  /* ---------- 전체 그리드: 장르 탭 ---------- */
  function srcLine(w) {
    const s = w.source || {};
    return `${esc(s.text || "")}${w.license ? ` · <span class="lic">${esc(w.license)}</span>` : ""}`;
  }
  function card(w) {
    const c = w.clip, vertical = w.format === "vertical";
    const thumb = (w.thumbnail && w.thumbnail.src) || c.cover || "";
    const ready = c.status === "ready";
    const badge = !ready ? `<span class="badge-pending">하이라이트 준비 중</span>` : c.long ? `<span class="badge-pending">긴 발췌 · 교체 예정</span>` : "";
    const len = ready ? `<span class="clip-length">${mmss(c.duration)}</span>` : "";
    const short = w.short ? `<button type="button" class="short-toggle" data-id="${esc(w.id)}" data-mode="short">
        <span class="ico" aria-hidden="true"></span>세로 쇼츠${w.short.status === "ready" ? ` · ${mmss(w.short.duration)}` : " · 준비 중"}</button>` : "";
    const name = w.styleRef ? w.styleRef.name : "";
    return `<article class="wcard${vertical ? " is-vertical" : ""}" data-id="${esc(w.id)}">
      <button type="button" class="work" data-id="${esc(w.id)}" data-mode="main" aria-label="${esc(w.cardTitle)} ${ready ? "하이라이트 재생" : "자세히 보기"}">
        <span class="thumb"><img src="${esc(thumb)}" alt="" loading="lazy" draggable="false" width="${vertical ? 720 : 1280}" height="${vertical ? 1280 : 720}">
        ${scrubLayer(c.sprite)}<span class="play-ico" aria-hidden="true"></span>${len}${badge}</span>
      </button>
      <div class="wmeta">
        <p class="wstyle"><b>${esc(name)}</b><span>${esc(genreLabel[w.genre] || "")}</span></p>
        <h4>${esc(w.cardTitle)}</h4>
        <p class="wsrc">${srcLine(w)}</p>
        <ul class="role-chips">${(w.role || []).map(r => `<li>${esc(r)}</li>`).join("")}</ul>
        ${short}
      </div>
    </article>`;
  }

  const tabs = [{ id: "all", label: "전체" }, ...shownGenres];
  const host = $("#genreWorks");
  let current = null, expanded = false;
  $("#genreTabs").innerHTML = tabs.map(t => `<button class="tab" type="button" role="tab" id="gtab-${t.id}" data-genre="${t.id}" aria-controls="genreWorks" aria-selected="false" tabindex="-1">${esc(t.label)}<span class="n">${t.id === "all" ? works.length : works.filter(w => w.genre === t.id).length}</span></button>`).join("");
  // "전체"는 대표작 우선: 장르별 대표작(featured) → 나머지 순서
  function sortedFor(id) {
    if (id !== "all") return works.filter(w => w.genre === id);
    return [...works.filter(w => w.featured), ...works.filter(w => !w.featured)];
  }
  function render(id) {
    const list = sortedFor(id);
    const wides = list.filter(w => w.format !== "vertical"), verts = list.filter(w => w.format === "vertical");
    const limit = id === "all" && !expanded;
    const narrow = matchMedia("(max-width: 760px)").matches;
    const W = limit ? wides.slice(0, narrow ? 4 : 9) : wides, V = limit ? verts.slice(0, narrow ? 4 : 6) : verts;
    const more = limit && (wides.length > W.length || verts.length > V.length)
      ? `<div class="more-row"><button type="button" class="btn" id="showAll">작품 ${list.length}편 모두 보기 <span class="arrow" aria-hidden="true">↓</span></button></div>` : "";
    host.innerHTML = `${W.length ? `<div class="wgrid">${W.map(card).join("")}</div>` : ""}
      ${V.length ? `<h4 class="shorts-heading"><span>세로 쇼츠</span><span>9:16</span></h4><div class="vgrid">${V.map(card).join("")}</div>` : ""}${more}`;
    const pend = list.filter(w => w.clip.status !== "ready").length;
    $("#genreCount").textContent = `${list.length}편${pend ? ` · 하이라이트 준비 중 ${pend}편` : ""}`;
  }
  function selectGenre(id, focus) {
    if (!tabs.some(t => t.id === id)) id = "all";
    if (id !== current) expanded = false;
    current = id;
    $$("#genreTabs .tab").forEach(t => { const on = t.dataset.genre === id; t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1; if (on && focus) t.focus(); });
    host.setAttribute("aria-labelledby", `gtab-${id}`);
    render(id);
  }
  $("#genreTabs").addEventListener("click", e => { const t = e.target.closest("[data-genre]"); if (t) selectGenre(t.dataset.genre); });
  $("#genreTabs").addEventListener("keydown", e => {
    const i = tabs.findIndex(t => t.id === current); let n;
    if (e.key === "ArrowRight") n = (i + 1) % tabs.length;
    if (e.key === "ArrowLeft") n = (i + tabs.length - 1) % tabs.length;
    if (e.key === "Home") n = 0;
    if (e.key === "End") n = tabs.length - 1;
    if (n !== undefined) { e.preventDefault(); selectGenre(tabs[n].id, true); }
  });
  host.addEventListener("click", e => {
    if (e.target.closest("#showAll")) { expanded = true; render(current); return; }
    const b = e.target.closest("[data-mode]");
    if (b) openWork(workById[b.dataset.id], b.dataset.mode);
  });
  selectGenre(COPY.defaultGenre || "all");

  // 데스크톱: 커서를 좌우로 움직이면 스프라이트(40프레임)가 스크럽된다 (그리드 카드 + 챕터 쇼츠)
  document.addEventListener("pointermove", e => {
    if (e.pointerType !== "mouse") return;
    const thumb = e.target.closest && e.target.closest(".thumb"); if (!thumb) return;
    const sp = thumb.querySelector(".sprite"); if (!sp) return;
    const btn = thumb.closest("[data-id]"), w = workById[btn.dataset.id];
    const clip = btn.dataset.mode === "short" ? w.short : w.clip;
    const r = thumb.getBoundingClientRect(), s = clamp01((e.clientX - r.left) / r.width);
    const i = Math.min(SPRITE_N - 1, Math.floor(s * SPRITE_N));
    sp.style.backgroundPosition = `${(i % COLS) / (COLS - 1) * 100}% ${Math.floor(i / COLS) / (ROWS - 1) * 100}%`;
    thumb.classList.add("scrubbing"); thumb.style.setProperty("--s", s);
    const d = clip && clip.status === "ready" ? clip.duration : 0;
    thumb.querySelector(".burn").textContent = d ? tc(s * d * FPS) : `${i + 1}/${SPRITE_N}`;
  }, { passive: true });
  document.addEventListener("pointerout", e => { const t = e.target.closest && e.target.closest(".thumb"); if (t && !t.contains(e.relatedTarget)) t.classList.remove("scrubbing"); });

  /* ---------- 스타일 재현 ---------- */
  const style = DATA.style || [];
  const TONE = { a: "#ffb02e", b: "#4aa3ff", c: "#9aa3b0" };
  function diagram(s) {
    const [W, H] = s.canvas;
    const fs = matchMedia("(max-width: 760px)").matches ? 60 : 40;   // 휴대폰에서는 라벨을 키운다
    // 라벨 규칙: 큰 상자(높이 150 이상)는 안쪽 왼쪽 위, 점선(대체 상태)은 위쪽 왼쪽 정렬, 나머지는 위쪽 오른쪽 정렬
    const boxes = s.boxes.map(b => {
      const big = b.h >= 150;
      const x = big || b.dashed ? b.x + 14 : b.x + b.w - 12;
      const y = big ? b.y + fs + 12 : b.y - 16;
      const anchor = big || b.dashed ? "start" : "end";
      return `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" fill="${TONE[b.tone]}" fill-opacity="${b.tone === "c" ? .12 : .28}" stroke="${TONE[b.tone]}" stroke-width="6"${b.dashed ? ' stroke-dasharray="24 14"' : ""}/>
        <text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${fs}" font-weight="700" fill="${b.tone === "a" ? "#ffcf73" : TONE[b.tone]}" paint-order="stroke" stroke="#0e0e10" stroke-width="10">${esc(b.label)}</text>`;
    }).join("");
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(s.styleName)} 레퍼런스에서 측정한 자막·그래픽 배치도 (화면 없이 좌표만)">
      <rect width="${W}" height="${H}" fill="#0e0e10"/>
      <g stroke="#26262b" stroke-width="2">${[1, 2, 3].map(k => `<line x1="${W * k / 4}" y1="0" x2="${W * k / 4}" y2="${H}"/><line x1="0" y1="${H * k / 4}" x2="${W}" y2="${H * k / 4}"/>`).join("")}</g>
      ${boxes}<text x="${W - 24}" y="${H - 24}" text-anchor="end" font-size="34" fill="#8e8981">${W}×${H}</text></svg>`;
  }
  function stylePanel(i) {
    const s = style[i];
    $$("#styleTabs .tab").forEach((t, k) => { t.setAttribute("aria-selected", k === i); t.tabIndex = k === i ? 0 : -1; });
    $("#stylePanel").innerHTML = `<article class="style-card">
      <header class="style-head"><p class="style-genre">편집 문법 · <b>${esc(s.styleName)}</b></p><p class="style-ref">${esc(s.ref)} — <em>측정값만 표기, 화면·채널명 미수록</em></p></header>
      <div class="style-body">
        <div class="style-measure">
          <figure class="style-diagram">${diagram(s)}<figcaption>레퍼런스에서 잰 배치 (1920×1080 기준 좌표) · 실선은 같은 순간, 점선은 다른 순간에 나오는 요소</figcaption></figure>
          <table class="style-table"><tbody>${s.rows.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join("")}</tbody></table>
        </div>
        <figure class="style-shot">${s.img ? `<img src="${esc(s.img)}" alt="${esc(s.workTitle)} — 같은 규칙으로 만든 내 편집 프레임" loading="lazy" draggable="false" width="1280" height="720">` : ""}
          <figcaption><p class="shot-title"><b>내 편집</b> · ${esc(s.workTitle)}</p><span>${esc(s.take)}</span>
          <button type="button" class="btn sm" data-open="${esc(s.work)}"><span class="ico-play" aria-hidden="true"></span>하이라이트 보기</button></figcaption></figure>
      </div></article>`;
  }
  if (style.length) {
    $("#styleTabs").innerHTML = style.map((s, i) => `<button class="tab" type="button" role="tab" data-i="${i}" aria-selected="false" tabindex="-1">${esc(s.styleName || s.genre)}</button>`).join("");
    $("#styleTabs").addEventListener("click", e => { const t = e.target.closest("[data-i]"); if (t) stylePanel(+t.dataset.i); });
    $("#styleTabs").addEventListener("keydown", e => {
      const i = $$("#styleTabs .tab").findIndex(t => t.getAttribute("aria-selected") === "true");
      const n = e.key === "ArrowRight" ? (i + 1) % style.length : e.key === "ArrowLeft" ? (i + style.length - 1) % style.length : null;
      if (n !== null) { e.preventDefault(); stylePanel(n); $$("#styleTabs .tab")[n].focus(); }
    });
    $("#stylePanel").addEventListener("click", e => { const b = e.target.closest("[data-open]"); if (b) openWork(workById[b.dataset.open]); });
    stylePanel(0);
  } else {
    $("#style").hidden = true;
  }

  /* ---------- 썸네일: 장르가 섞이게 번갈아 놓고, A/B 전체 전환 ---------- */
  const finals = works.filter(w => w.format !== "vertical" && w.thumbnail && w.thumbnail.status === "final");
  const ORDER = ["variety", "game", "vlog", "edu", "motion", ...shownGenres.map(g => g.id)];
  const buckets = [...new Set(ORDER)].map(g => [...finals.filter(w => w.genre === g && w.featured), ...finals.filter(w => w.genre === g && !w.featured)]);
  const thumbWorks = [];
  for (let k = 0; buckets.some(b => b[k]); k++) buckets.forEach(b => { if (b[k]) thumbWorks.push(b[k]); });
  const thumbGenres = shownGenres.filter(g => thumbWorks.some(w => w.genre === g.id));
  const THUMB_FIRST = 13;   // 큰 칸 1 + 작은 칸 12 = 4줄
  let thumbList = thumbWorks, thumbIndex = 0, thumbAB = "a", thumbGenre = "all", thumbAll = false;
  const gallery = $("#thumbnailGallery");
  function renderThumbs() {
    thumbList = thumbGenre === "all" ? thumbWorks : thumbWorks.filter(w => w.genre === thumbGenre);
    $$("#thumbFilter button").forEach(b => b.setAttribute("aria-pressed", b.dataset.g === thumbGenre));
    $$("#abSwitch button").forEach(b => b.setAttribute("aria-pressed", b.dataset.ab === thumbAB));
    const shown = thumbAll || thumbGenre !== "all" ? thumbList : thumbList.slice(0, THUMB_FIRST);
    gallery.innerHTML = shown.map((w, i) => {
      const b = thumbAB === "b" && w.thumbnailB;
      return `<button type="button" class="thumbnail-card" data-thumb="${i}" aria-label="${esc(w.cardTitle)} 썸네일 ${b ? "B안" : "A안"} 크게 보기">
        <span class="frame"><img src="${esc(b ? w.thumbnailB : w.thumbnail.src)}" width="1280" height="720" loading="lazy" draggable="false" alt="${esc(w.cardTitle)} 썸네일 ${b ? "B안" : "A안"}">${w.thumbnailB ? `<span class="ab-tag">${b ? "B" : "A"}</span>` : ""}</span>
        <span class="cap"><b>${esc((w.styleRef && w.styleRef.name) || genreLabel[w.genre] || "")}</b><span>${esc(w.cardTitle)}</span></span></button>`;
    }).join("");
    $("#thumbMoreRow").hidden = shown.length >= thumbList.length;
  }
  $("#thumbFilter").innerHTML = thumbGenres.length > 1
    ? [{ id: "all", label: "전체" }, ...thumbGenres].map(g => `<button class="tab" type="button" data-g="${g.id}" aria-pressed="false">${esc(g.label)}</button>`).join("") : "";
  $("#thumbFilter").addEventListener("click", e => { const b = e.target.closest("[data-g]"); if (b) { thumbGenre = b.dataset.g; renderThumbs(); } });
  $("#abSwitch").addEventListener("click", e => { const b = e.target.closest("[data-ab]"); if (b) { thumbAB = b.dataset.ab; renderThumbs(); } });
  $("#thumbMore").addEventListener("click", () => { thumbAll = true; renderThumbs(); });
  if (!thumbWorks.some(w => w.thumbnailB)) $("#abSwitch").closest(".ab-wrap").hidden = true;
  renderThumbs();
  const waiting = shownGenres.filter(g => !thumbGenres.includes(g)).map(g => g.label);
  if (waiting.length) { $("#thumbPendingNote").hidden = false; $("#thumbPendingNote").textContent = `${waiting.join(" · ")} 썸네일은 장르별 조사 후 A/B 시안을 만드는 중입니다.`; }

  const dialog = $("#thumbnailDialog");
  let dlgAB = "a";
  function showThumbnail(index, ab = dlgAB) {
    thumbIndex = (index + thumbList.length) % thumbList.length;
    const w = thumbList[thumbIndex];
    dlgAB = w.thumbnailB ? ab : "a";
    const img = $("#thumbnailDialogImage");
    img.src = dlgAB === "b" ? w.thumbnailB : w.thumbnail.src;
    img.alt = `${w.cardTitle} 썸네일 ${dlgAB.toUpperCase()}안`;
    $("#thumbnailDialogTitle").textContent = w.cardTitle;
    $("#thumbnailDialogCount").textContent = `${thumbIndex + 1} / ${thumbList.length}`;
    $("#thumbnailDialogMeta").textContent = `${(w.styleRef && w.styleRef.name) || genreLabel[w.genre] || ""}${w.thumbnailB ? ` · ${dlgAB.toUpperCase()}안` : ""}`;
    $("#thumbAB").hidden = !w.thumbnailB;
    $$("#thumbAB button").forEach(b => b.setAttribute("aria-pressed", b.dataset.ab === dlgAB));
  }
  gallery.addEventListener("click", e => {
    const b = e.target.closest("[data-thumb]"); if (!b) return;
    showThumbnail(Number(b.dataset.thumb), thumbAB); dialog.showModal(); document.body.classList.add("modal-open");
  });
  $("#thumbAB").addEventListener("click", e => { const b = e.target.closest("[data-ab]"); if (b) showThumbnail(thumbIndex, b.dataset.ab); });
  function closeThumbnail() { dialog.close(); document.body.classList.remove("modal-open"); }
  $("#thumbnailDialogClose").addEventListener("click", closeThumbnail);
  dialog.addEventListener("close", () => document.body.classList.remove("modal-open"));
  dialog.addEventListener("click", e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeThumbnail(); } });
  $("#thumbnailPrevious").addEventListener("click", () => showThumbnail(thumbIndex - 1));
  $("#thumbnailNext").addEventListener("click", () => showThumbnail(thumbIndex + 1));
  dialog.addEventListener("keydown", e => { if (e.key === "ArrowLeft") showThumbnail(thumbIndex - 1); if (e.key === "ArrowRight") showThumbnail(thumbIndex + 1); });
  $("#thumbnailWatch").addEventListener("click", () => { const w = thumbList[thumbIndex]; closeThumbnail(); openWork(w); });

  /* ---------- 크레딧 ---------- */
  const cr = DATA.credits || {};
  const block = (title, items) => items && items.length ? `<div class="credit-block"><h3>${title}</h3><ul>${items.join("")}</ul></div>` : "";
  $("#creditsList").innerHTML =
    block("원본 영상", (cr.sources || []).map(s => `<li>${s.url ? `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.text)} ↗</a>` : esc(s.text)}<span>${esc(s.license || "")}${s.works && s.works.length ? ` · ${esc(s.works.join(", "))}` : ""}</span></li>`)) +
    block("음악", (cr.music || []).map(m => `<li>${esc(m.text)}<span>${esc(m.work)}</span></li>`)) +
    block("효과음", (cr.sfx || []).map(m => `<li>${esc(m.text)}<span>${esc(m.work)}</span></li>`)) +
    block("서체 · 안내", (cr.general || []).map(g => `<li>${esc(g.text)}<span>${esc(g.what)}</span></li>`));

  reveal(chHost);
})();

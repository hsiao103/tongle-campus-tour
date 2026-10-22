/* ===== 訪客版：只有鳥瞰；兩個起點（校門口、後門）＋四個參觀地點（行政辦公室、校史室、禮堂、草原班） =====
   要改介紹文字：改下面 VISIT_PLACES 的 desc 即可。 */
(function () {
  const VISIT_STARTS = [
    { key: 'gate', name: '校門口', x: 0, z: -13, az: 0.15, d: 80, pol: 0.95, desc: '正門入口，從這裡開始參觀。' },
    { key: 'back', name: '後門', x: 50, z: -138, az: 0.5, d: 80, pol: 0.95, desc: '後門入口，位於校園北側。' }
  ];
  const VISIT_PLACES = [
    { name: '行政辦公室', desc: '學校行政業務的辦公處所，洽公、詢問請由此進入。' },
    { name: '校史室', desc: '陳列學校歷年的歷史與發展紀錄。' },
    { name: '禮堂', desc: '全校集會與各項活動的場地。' },
    { name: '草原班', desc: '幼兒園草原班的教室。' }
  ];

  /* ---- 找出每個地點的座標與所在建築 ---- */
  VISIT_PLACES.forEach(v => {
    const p = NPLACES.find(q => q.room && q.name === v.name); if (!p) { console.warn('visitor: place not found', v.name); return; }
    const short = p.sub.replace(/\s+\d+F$/, ''), b = BUILDINGS.find(x => x.short === short || x.id === short);
    Object.assign(v, { x: p.x, z: p.z, lv: p.lv, bid: b ? b.id : null, loc: p.sub.replace(/\s+(\d+)F$/, '　$1 樓') });
  });
  const PLACES = VISIT_PLACES.filter(v => v.x !== undefined);

  /* ---- 樣式 ---- */
  const css = document.createElement('style');
  css.textContent = `
body.visitor #modes,body.visitor #search,body.visitor #nav,body.visitor #flSel,body.visitor #floors,body.visitor #mini,body.visitor #hint,
body.visitor #joyL,body.visitor #joyR,body.visitor #tbtns,body.visitor #intro,body.visitor #lift,body.visitor #dqd,body.visitor #info #where,body.visitor #bVR{display:none!important}
#vWel{position:fixed;inset:0;z-index:20;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(20,40,32,.28);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);transition:opacity .4s}
#vWel.hide{opacity:0;pointer-events:none}
#vWel .card{background:var(--panel);border-radius:20px;box-shadow:0 10px 40px rgba(0,0,0,.25);padding:26px 24px 22px;max-width:380px;width:100%;text-align:center;color:var(--fg);font-family:var(--font-ui)}
#vWel img{width:64px;height:64px;border-radius:14px;object-fit:cover}
#vWel h1{margin:10px 0 2px;font-size:24px;letter-spacing:.04em}
#vWel p{margin:0 0 16px;color:var(--muted);font-size:14px}
#vWel .go{display:flex;gap:10px}
#vWel .go button{flex:1;padding:16px 8px;font:700 17px var(--font-ui);border-radius:14px;border:2px solid var(--accent);background:var(--accent);color:var(--accent-fg);cursor:pointer}
#vWel .go button.alt{background:#fff;color:var(--accent)}
#vWel small{display:block;margin-top:14px;color:var(--muted);font-size:12px}
#vBar{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(26px + env(safe-area-inset-bottom,0px));z-index:6;width:min(720px,calc(100vw - 16px));display:flex;flex-direction:column;gap:8px;align-items:stretch;font-family:var(--font-ui)}
#vCard{background:var(--panel);border-radius:14px;box-shadow:0 4px 18px rgba(0,0,0,.18);padding:10px 14px;color:var(--fg);display:none}
#vCard.show{display:block}
#vCard b{font-size:17px}#vCard .loc{display:inline-block;margin-left:8px;padding:1px 9px;border-radius:999px;background:var(--roof);color:#fff;font-size:12px;vertical-align:2px}
#vCard p{margin:4px 0 0;font-size:13.5px;color:var(--muted);line-height:1.5}
#vRows{background:var(--panel);border-radius:16px;box-shadow:0 4px 18px rgba(0,0,0,.18);padding:8px 10px;display:flex;flex-direction:column;gap:6px}
#vRows .r{display:flex;align-items:center;gap:6px;overflow-x:auto;scrollbar-width:none}
#vRows .r::-webkit-scrollbar{display:none}
#vRows .lab{flex:none;font-size:12px;color:var(--muted);min-width:34px}
#vRows button{flex:none;padding:8px 14px;border-radius:999px;border:1.5px solid var(--line);background:#fff;color:var(--fg);font:600 14px var(--font-ui);cursor:pointer;white-space:nowrap}
#vRows button.st{border-color:#1f7a8c;color:#1f7a8c}
#vRows button.pl{border-color:#e0a200;color:#8a5a00;background:#fff8e1}
#vRows button.on{background:var(--accent);border-color:var(--accent);color:#fff}
#vRows button.all{margin-left:auto}
#vTip{position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:5;background:rgba(20,28,24,.6);color:#fff;border-radius:999px;padding:4px 14px;font:12px var(--font-ui);pointer-events:none;white-space:nowrap}
@media (max-width:640px){#vTip{display:none}#vRows button{padding:7px 12px;font-size:13px}}
`;
  document.head.appendChild(css);

  /* ---- 介面 ---- */
  const logoSrc = (document.querySelector('#info img.lg') || {}).src || '';
  const wel = document.createElement('div'); wel.id = 'vWel';
  wel.innerHTML = '<div class="card">' + (logoSrc ? '<img alt="同樂國小校徽" src="' + logoSrc + '">' : '') + '<h1>同樂國小 校園導覽</h1><p>歡迎蒞臨！請選擇導覽起點</p><div class="go"><button type="button" data-s="gate">校門口</button><button type="button" class="alt" data-s="back">後門</button></div><small>拖曳旋轉・滾輪或雙指縮放</small></div>';
  document.body.appendChild(wel);
  const bar = document.createElement('div'); bar.id = 'vBar'; bar.hidden = true;
  bar.innerHTML = '<div id="vCard"><b id="vcN"></b><span class="loc" id="vcL"></span><p id="vcD"></p></div><div id="vRows"><div class="r" id="vrS"><span class="lab">起點</span></div><div class="r" id="vrP"><span class="lab">地點</span></div></div>';
  document.body.appendChild(bar);
  const tip = document.createElement('div'); tip.id = 'vTip'; tip.textContent = '拖曳旋轉・滾輪縮放・WASD 平移'; document.body.appendChild(tip);
  const $v = id => document.getElementById(id), btns = {};
  function mk(row, cls, text, fn) { const b = document.createElement('button'); b.type = 'button'; b.className = cls; b.textContent = text; b.onclick = fn; row.appendChild(b); return b; }
  VISIT_STARTS.forEach(s => { btns[s.key] = mk($v('vrS'), 'st', s.name, () => goStart(s)); });
  PLACES.forEach(p => { btns[p.name] = mk($v('vrP'), 'pl', p.name, () => goPlace(p)); });
  mk($v('vrS'), 'all', '全校', () => goAll());

  /* ---- 鏡頭飛行 ---- */
  let tw = null;
  function fly(t) {
    const f = { tx: orbit.tx, tz: orbit.tz, d: orbit.d, az: orbit.az, pol: orbit.pol };
    let da = (t.az - f.az) % (Math.PI * 2); if (da > Math.PI) da -= Math.PI * 2; if (da < -Math.PI) da += Math.PI * 2;
    tw = { f, t, da, t0: performance.now(), dur: 1100 };
  }
  function twTick(now) {
    if (!tw) return; let k = Math.min(1, (now - tw.t0) / tw.dur); const e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    orbit.tx = tw.f.tx + (tw.t.x - tw.f.tx) * e; orbit.tz = tw.f.tz + (tw.t.z - tw.f.tz) * e; orbit.d = tw.f.d + (tw.t.d - tw.f.d) * e;
    orbit.az = tw.f.az + tw.da * e; orbit.pol = tw.f.pol + (tw.t.pol - tw.f.pol) * e; if (k >= 1) tw = null;
  }
  addEventListener('pointerdown', () => { tw = null; }, true); addEventListener('wheel', () => { tw = null; }, { capture: true, passive: true });

  function setOn(key) { Object.keys(btns).forEach(k => btns[k].classList.toggle('on', k === key || (curStart && k === curStart.key && PLACES.some(q => q.name === key)))); }
  function showCard(n, l, d) { $v('vcN').textContent = n; $v('vcL').textContent = l || ''; $v('vcL').style.display = l ? '' : 'none'; $v('vcD').textContent = d || ''; $v('vCard').classList.add('show'); }
  let curMark = null, curStart = null, curPlace = null;
  function dropRoute() { buildRibbons([]); }
  function drawRoute(from, p) {
    const c = navSearch(0, from.x, from.z, p.lv, p.x, p.z); if (!c) return null;
    const pts = smoothRoute(c); pts.unshift({ x: from.x, z: from.z, lv: 0 }); pts.push({ x: p.x, z: p.z, lv: p.lv });
    let len = 0, up = false, x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
    pts.forEach((q, i) => { if (i) { len += Math.hypot(q.x - pts[i - 1].x, q.z - pts[i - 1].z); if (q.lv > pts[i - 1].lv) up = true; } x0 = Math.min(x0, q.x); x1 = Math.max(x1, q.x); z0 = Math.min(z0, q.z); z1 = Math.max(z1, q.z); });
    buildRibbons(pts); return { len, up, x: (x0 + x1) / 2, z: (z0 + z1) / 2, span: Math.hypot(x1 - x0, z1 - z0) };
  }
  function routeText(r, from, p) {
    const m = Math.max(1, Math.round(r.len / 80));
    return '建議路線：' + from.name + ' → ' + p.name + '，約 ' + Math.round(r.len) + ' 公尺，步行約 ' + m + ' 分鐘' + (r.up ? '（需上樓梯到 ' + (p.lv + 1) + ' 樓）' : '') + '。沿黃色箭頭前進。';
  }
  function showPlace() {
    const p = curPlace; if (!p) return; const f0 = document.querySelector('#flSel [data-g="0"]'); if (curStart && f0) f0.click(); else cutAll(); if (p.bid) applyCut(p.bid, p.lv);   // 有路線時：其餘建築只留 1 樓，路線才不會被屋頂擋住
    setOn(p.name); curMark = p.name;
    const r = curStart ? drawRoute(curStart, p) : null;
    if (r) { showCard(p.name, p.loc, routeText(r, curStart, p) + ' ' + p.desc); fly({ x: r.x, z: r.z, az: 0.3, d: Math.min(150, Math.max(48, r.span * 1.5 + 30)), pol: 0.85 }); }
    else { dropRoute(); showCard(p.name, p.loc, p.desc); fly({ x: p.x, z: p.z, az: 0.3, d: 36, pol: 0.8 }); }
  }
  function goStart(s) {
    view.auto = false; curStart = s; if (curPlace) { showPlace(); return; }
    cutAll(); dropRoute(); setOn(s.key); showCard(s.name, '', s.desc + ' 點下方地點，會顯示從這裡出發的路線。'); curMark = s.key; fly({ x: s.x, z: s.z, az: s.az, d: s.d, pol: s.pol });
  }
  function goPlace(p) { view.auto = false; curPlace = p; showPlace(); }
  function goAll() { view.auto = false; curPlace = null; cutAll(); dropRoute(); setOn(null); $v('vCard').classList.remove('show'); curMark = null; fly({ x: 0, z: -62, az: 0.5, d: 190, pol: 0.95 }); }
  wel.querySelectorAll('button[data-s]').forEach(b => b.onclick = () => { const s = VISIT_STARTS.find(x => x.key === b.dataset.s); wel.classList.add('hide'); bar.hidden = false; goStart(s); });

  /* ---- 場景標記（金色＝參觀地點；青色＝起點），隨鏡頭距離縮放，永遠看得到 ---- */
  function pin(text, col, x, y, z) {
    const w = 320, h = 120, tex = canvasTex(w, h, g => {
      g.fillStyle = col; g.strokeStyle = '#fff'; g.lineWidth = 6; const r = 18;
      g.beginPath(); g.moveTo(10 + r, 6); g.arcTo(w - 10, 6, w - 10, 76, r); g.arcTo(w - 10, 76, 10, 76, r); g.lineTo(w / 2 + 16, 76); g.lineTo(w / 2, 112); g.lineTo(w / 2 - 16, 76); g.arcTo(10, 76, 10, 6, r); g.arcTo(10, 6, w - 10, 6, r); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = '#fff'; g.font = 'bold ' + (text.length > 4 ? 40 : 48) + 'px "Noto Sans TC",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, 42);
    });
    const s = new T.Sprite(new T.SpriteMaterial({ map: tex, depthTest: false, transparent: true, fog: false }));
    s.center.set(0.5, 0); s.position.set(x, y, z); s.renderOrder = 40; s.userData.vpin = true; s.scale.set(1, h / w, 1); scene.add(s); return s;
  }
  const PINS = [];
  VISIT_STARTS.forEach(s => { const y = (typeof groundAt === 'function' && isFinite(groundAt(s.x, 3, s.z)) ? groundAt(s.x, 3, s.z) : 0) + 2.5; PINS.push({ k: s.key, s: pin(s.name, '#1f7a8c', s.x, y, s.z) }); });
  PLACES.forEach(p => { PINS.push({ k: p.name, pl: true, s: pin(p.name, '#d9822b', p.x, (typeof LIFT === 'number' ? LIFT : 0) + p.lv * H + 1.2, p.z) }); });

  /* ---- 每幀：鏡頭動畫＋標記縮放 ---- */
  const dist = new T.Vector3();
  const on0 = o => o.k === curMark;
  function vTick(now) {
    twTick(now); if (curPlace) chevTex.offset.y -= (now - (vTick.l || now)) / 1000 * 0.45; vTick.l = now;
    const t = now / 1000;
    PINS.forEach(o => {
      o.s.visible = !(curPlace && !on0(o) && !(curStart && o.k === curStart.key));
      dist.copy(o.s.position).sub(camera.position); const d = dist.length(), on = o.k === curMark;
      const sc = Math.min(30, Math.max(5.5, d * 0.115)) * (on ? 1.12 + 0.06 * Math.sin(t * 5) : 1);
      o.s.scale.set(sc, sc * 0.375, 1);
    });
    requestAnimationFrame(vTick);
  }
  requestAnimationFrame(vTick);

  /* ---- 畫面中心上移，避開下方的操作列 ---- */
  function vOffset() { const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return; const small = innerWidth < 640; camera.setViewOffset(w, h, 0, Math.round(h * (small ? 0.2 : 0.17)), w, h); }
  addEventListener('resize', vOffset); vOffset();

  /* ---- 初始：關掉原本的開場說明，背景慢速環繞全校 ---- */
  try { $('iBird').click(); } catch (e) { /* 忽略 */ }
  Object.assign(orbit, { tx: 0, tz: -62, d: 190, pol: 0.95 }); view.auto = true;
  window.__visitor = { goStart, goPlace, goAll, PLACES, VISIT_STARTS };
})();

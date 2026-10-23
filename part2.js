/* ===== 核心：場景、材質、積木工具 ===== */
window.__VISITOR = true; document.body.classList.add('visitor');   // 訪客版：只有鳥瞰

/* ===== 中／英切換：字典與核心（校名「同樂國小」與校徽維持原樣，不翻譯、不置換） ===== */
const EN = {
  // 建築與區域
  '行政大樓':'Administration Building','廚房':'Kitchen','教學區西樓':'Teaching West Building','教學區南樓':'Teaching South Building',
  '教學區東樓':'Teaching East Building','科任及幼兒園區':'Specialist & Kindergarten Wing','科任樓梯間':'Specialist Wing Stairwell',
  // 戶外與設施
  '同新路':'Tongxin Rd.','停車場':'Parking Lot','機車・腳踏車車棚':'Scooter & Bicycle Shed','科任銜接區':'Specialist Link Area',
  '穿堂休憩區':'Concourse Rest Area','連通橋':'Connecting Bridge','無障礙電梯':'Accessible Elevator','接送區':'Pick-up / Drop-off',
  '集合場':'Assembly Ground','梅花廣場':'Plum Blossom Plaza','木棧板平台':'Wooden Deck','無障礙坡道':'Accessible Ramp',
  '操場':'Playground','涼亭':'Pavilion','後門':'Back Gate','校門口':'Main Gate','校門':'Main Gate','圍牆外巷道':'Alley Outside the Wall',
  '風雨球場':'Covered Court','涼亭・遊戲區':'Pavilion & Play Area','全校':'Whole Campus',
  // 房間
  '廁所':'Restroom','男廁':"Men's Restroom",'女廁':"Women's Restroom",'行政辦公室':'Administrative Office','交誼室':'Lounge',
  '校史室':'School History Room','校長室':"Principal's Office",'禮堂':'Auditorium','4F 管道維修間':'4F Pipe Maintenance Room',
  '教學設備及檔案室':'Teaching Equipment & Archives','圖書館':'Library','健康中心':'Health Center','活動教室':'Activity Room',
  '資源班':'Resource Class','英語教室':'English Classroom','愛的書庫':'Love Book Depot','多用途室':'Multipurpose Room',
  '社會教室':'Social Studies Room','自然教室':'Science Room','語言教室':'Language Room','課輔教室':'After-school Tutoring Room',
  '教師/校友會辦公室':"Teachers' & Alumni Office",'家長會/志工辦公室':'Parents Assoc. & Volunteer Office','資源回收室':'Recycling Room',
  '幼兒活動室':'Preschool Activity Room','工具間':'Tool Room','體育器材室':'PE Equipment Room','草原班':'Prairie Class',
  '藍天班':'Blue Sky Class','彩虹班':'Rainbow Class','幼兒園辦公室':'Kindergarten Office','多功1':'Multipurpose 1','多功2':'Multipurpose 2',
  '電器室':'Electrical Room','員山親子館':'Yuanshan Parent-Child Center','（空）':'(Empty)','總務處儲藏室':'General Affairs Storage',
  '教導處儲藏室':'Academic Affairs Storage','音樂教室':'Music Room','電腦教室':'Computer Room','輔導諮商室':'Counseling Room',
  // 導覽介面
  '起點':'Start','地點':'Places','歡迎蒞臨！請選擇導覽起點':'Welcome! Please choose a starting point',
  '拖曳旋轉・滾輪或雙指縮放':'Drag to rotate · Scroll or pinch to zoom','拖曳旋轉・滾輪縮放・WASD 平移':'Drag to rotate · Scroll to zoom · WASD to pan',
  // 地點介紹
  '正門入口，從這裡開始參觀。':'Main entrance — start your visit here.',
  '後門入口，位於校園北側。':'Back entrance, on the north side of campus.',
  '學校行政業務的辦公處所，洽公、詢問請由此進入。':'Where school administration is handled — come here for business or inquiries.',
  '陳列學校歷年的歷史與發展紀錄。':"Displays the school's history and records of its development over the years.",
  '全校集會與各項活動的場地。':'Venue for school-wide assemblies and events.',
  '幼兒園草原班的教室。':'The classroom of the kindergarten Prairie Class.',
  '點下方地點，會顯示從這裡出發的路線。':'Tap a place below to see the route from here.'
};
let LANG = 'zh';
try { const sv = localStorage.getItem('tl_lang'); if (sv === 'en' || sv === 'zh') LANG = sv; } catch (e) { /* 無法讀取就用中文 */ }
function tr(s) {
  if (LANG !== 'en' || typeof s !== 'string' || !s) return s;
  if (Object.prototype.hasOwnProperty.call(EN, s)) return EN[s];
  let m;
  if ((m = s.match(/^(\d)忠$/))) return 'Grade ' + m[1] + ' Class';
  if ((m = s.match(/^廚房(\d)F$/))) return 'Kitchen ' + m[1] + 'F';
  return s;
}
const LANG_HOOKS = [];
function setLang(l) {
  LANG = l === 'en' ? 'en' : 'zh';
  try { localStorage.setItem('tl_lang', LANG); } catch (e) { /* 忽略 */ }
  document.documentElement.lang = LANG === 'en' ? 'en' : 'zh-Hant';
  document.title = LANG === 'en' ? 'TLPS Campus Tour (Visitor Edition)' : '同樂國小 校園導覽（訪客版）';
  document.querySelectorAll('#langSw button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === LANG)));
  const ld = document.getElementById('loading'); if (ld) ld.textContent = LANG === 'en' ? 'Loading TLPS campus…' : '正在建立同樂國小…';
  const lg = document.querySelector('#info img.lg'); if (lg) lg.alt = LANG === 'en' ? 'TLPS school emblem' : '同樂國小校徽';
  const sn = document.getElementById('schoolName'); if (sn) sn.textContent = LANG === 'en' ? 'TLPS' : '同樂國小';
  const ct = document.getElementById('creditT'); if (ct && ct.firstChild) ct.firstChild.nodeValue = LANG === 'en' ? 'Inspired by: ' : '製作參考：';
  LANG_HOOKS.forEach(f => { try { f(); } catch (e) { console.warn('lang hook', e); } });
}
document.querySelectorAll('#langSw button').forEach(b => b.onclick = () => setLang(b.dataset.lang));
// 英文字較長：自動換成兩行並縮小字級，讓文字不超出標籤
function drawFitText(g, text, w, h, face, weight, color, maxSize) {
  g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle';
  const maxW = w - 28; let size = maxSize || 40, lines = [text];
  g.font = weight + size + 'px ' + face;
  if (g.measureText(text).width > maxW) {
    const ws = text.split(' ');
    if (ws.length > 1) { let best = null; for (let i = 1; i < ws.length; i++) { const a = ws.slice(0, i).join(' '), b = ws.slice(i).join(' '), mw = Math.max(g.measureText(a).width, g.measureText(b).width); if (!best || mw < best.mw) best = { a, b, mw }; } lines = [best.a, best.b]; }
  }
  for (; size > 12; size -= 2) { g.font = weight + size + 'px ' + face; if (Math.max(...lines.map(l => g.measureText(l).width)) <= maxW && lines.length * size * 1.12 <= h - 14) break; }
  lines.forEach((l, i) => g.fillText(l, w / 2, h / 2 + 2 + (i - (lines.length - 1) / 2) * size * 1.12));
}
const T = THREE, H = 3.4;                       // H = 樓層高度(公尺)
const stage = document.getElementById('stage');
const renderer = new T.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = T.PCFSoftShadowMap;
stage.appendChild(renderer.domElement);
const scene = new T.Scene();
const camera = new T.PerspectiveCamera(65, 1, 0.1, 520);
const hemi = new T.HemisphereLight(0xdfeaff, 0x6b7a5a, 1.0);
const sun = new T.DirectionalLight(0xfff1d2, 0.95);
sun.position.set(70, 100, 50);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -150, right: 150, top: 150, bottom: -150, near: 10, far: 360 });
sun.shadow.bias = -0.0004;
sun.target.position.set(-5, 0, -60);
scene.add(sun, sun.target, hemi);
const DAY = { sky: 0xaed6f0, fog: 0xc9e3f3, hemi: 1.0, sun: 0.95 };
const NIGHT = { sky: 0x0d1626, fog: 0x0d1626, hemi: 0.28, sun: 0.12 };
let isNight = false;
window.themeHook = null;   // 節慶主題（part8）掛上後，於日夜設定之後覆寫天空／霧／光色
function applyTime() {
  const c = isNight ? NIGHT : DAY;
  scene.background = new T.Color(c.sky);
  scene.fog = new T.Fog(c.fog, 160, 900);
  hemi.intensity = c.hemi; sun.intensity = c.sun;
  sun.color.set(isNight ? 0x8fa8ff : 0xfff1d2); hemi.color.set(0xdfeaff); hemi.groundColor.set(0x6b7a5a);
  if (window.themeHook) window.themeHook(c, isNight);
}
applyTime();

const walk = [];      // 可站立的表面
const WALLS = [];     // 碰撞牆 {x0,z0,x1,z1,y0,y1}
const FOOT = [];      // 小地圖用的建築輪廓

function mat(c, o) { return new T.MeshLambertMaterial(Object.assign({ color: c }, o || {})); }
const M = {
  wall: mat(0xefeae0), wallIn: mat(0xf6f3ea), teal: mat(0x3a9d9a), roofG: mat(0x2f8266, { side: T.DoubleSide }),
  roofB: mat(0x7f9fb8, { side: T.DoubleSide }), glass: mat(0x2c4a63, { transparent: true, opacity: 0.8 }),
  rail: mat(0xf8f8f4), floor: mat(0xd9d4c6), ground: mat(0x7fa05e), grass2: mat(0x8fb26a), track: mat(0xc2582f),
  asphalt: mat(0x3b3f43), concrete: mat(0xbdbdb6), orange: mat(0xe0702c), yellow: mat(0xf0c23a),
  board: mat(0x2d5a46), desk: mat(0xb88c5a), white: mat(0xffffff), trunk: mat(0x6b4f33), leaf: mat(0x3c7a3a),
  leaf2: mat(0x4f9444), blue: mat(0x2f6bb3), red: mat(0xc83c35), steel: mat(0x7e8b93), dark: mat(0x23272b)
};
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; return t;
}
const solarTex = canvasTex(128, 128, (g, w, h) => {
  g.fillStyle = '#1b2f55'; g.fillRect(0, 0, w, h); g.strokeStyle = '#7ea0d8'; g.lineWidth = 2;
  for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * w / 4, 0); g.lineTo(i * w / 4, h); g.stroke(); g.beginPath(); g.moveTo(0, i * h / 4); g.lineTo(w, i * h / 4); g.stroke(); }
});
M.solar = mat(0xffffff, { map: solarTex });

let CTX = null;   // 旋轉群組情境：{group, tf:{x,z,c,s}}
function toWorld(tf, x, z) { return tf ? [tf.x + x * tf.c + z * tf.s, tf.z - x * tf.s + z * tf.c] : [x, z]; }
function withTf(px, pz, rot, fn) {
  const g = new T.Group(); g.position.set(px, 0, pz); g.rotation.y = rot; scene.add(g);
  CTX = { group: g, tf: { x: px, z: pz, c: Math.cos(rot), s: Math.sin(rot) } };
  try { return fn(); } finally { CTX = null; }
}
let RAISE = 0;   // 墊高：底面在地面者只抬頂面，其餘整體抬高
function box(x0, z0, x1, z1, y0, y1, m, o) {
  o = o || {};
  if (RAISE) { if (y0 <= 0.001) y1 += RAISE; else { y0 += RAISE; y1 += RAISE; } }
  const me = new T.Mesh(new T.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), m);
  me.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  me.castShadow = !o.noShadow; me.receiveShadow = true;
  (o.parent || (CTX ? CTX.group : scene)).add(me);
  if (o.walk) walk.push(me);
  if (o.wall) WALLS.push({ x0, z0, x1, z1, y0, y1, tf: CTX ? CTX.tf : null });
  return me;
}
function ramp(ax, az, ay, bx, bz, by, width, mt) {
  const dx = bx - ax, dz = bz - az, dy = by - ay, len = Math.hypot(dx, dz, dy);
  const me = new T.Mesh(new T.BoxGeometry(width, 0.25, len), mt || M.concrete);
  me.position.set((ax + bx) / 2, (ay + by) / 2 - 0.125, (az + bz) / 2);
  const m4 = new T.Matrix4().lookAt(new T.Vector3(bx, by - 0.125, bz), me.position, new T.Vector3(0, 1, 0));
  me.quaternion.setFromRotationMatrix(m4);
  me.castShadow = true; me.receiveShadow = true;
  (CTX ? CTX.group : scene).add(me); me.updateMatrixWorld(true); walk.push(me); return me;
}
// 寫實階梯：踏面＋踢面（鋸齒式混凝土梯段），沿 a→b 上升；每階約 17 cm
let STAIRM = null;
function stairs(ax, az, ay, bx, bz, by, width) {
  if (!STAIRM) { STAIRM = M.concrete.clone(); STAIRM.userData.noCut = true; }                 // 樓梯不被等角模式的透視洞挖掉
  const dx = bx - ax, dz = bz - az, run = Math.hypot(dx, dz), rise = by - ay, n = Math.max(2, Math.round(rise / 0.17)), r = rise / n, tr = run / n, th = r + 0.12;
  const ang = Math.atan2(dx, dz), g = new T.Group(); g.rotation.y = ang; g.position.set(ax, 0, az); (CTX ? CTX.group : scene).add(g);
  for (let i = 0; i < n; i++) {
    const top = ay + (i + 1) * r, me = new T.Mesh(new T.BoxGeometry(width, th, tr + 0.02), STAIRM);
    me.position.set(0, top - th / 2, (i + 0.5) * tr); me.castShadow = true; me.receiveShadow = true; g.add(me);
  }
  g.updateMatrixWorld(true); g.children.forEach(m => walk.push(m)); return g;
}
function makeLabelTex(text, bg, fg) {
  text = tr(text);
  if (typeof DQ !== 'undefined' && DQ.on) return canvasTex(256, 96, (g, w, h) => {
    g.fillStyle = '#f6ecd2'; g.fillRect(0, 0, w, h); g.fillStyle = '#3b2a1e'; g.fillRect(0, 0, w, 8); g.fillRect(0, h - 8, w, 8); g.fillRect(0, 0, 8, h); g.fillRect(w - 8, 0, 8, h);
    g.strokeStyle = '#fffbe9'; g.lineWidth = 3; g.strokeRect(11, 11, w - 22, h - 22);
    g.fillStyle = '#3b2a1e'; g.font = (text.length > 8 ? 24 : text.length > 5 ? 34 : 44) + 'px "DotGothic16","Noto Sans TC",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, h / 2 + 2);
  });
  return canvasTex(256, 96, (g, w, h) => {
    g.fillStyle = bg || '#ffffff'; g.fillRect(0, 0, w, h); g.strokeStyle = '#2f7d63'; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6);
    if (LANG === 'en') { drawFitText(g, text, w, h, '"Noto Sans TC",sans-serif', 'bold ', fg || '#1d2a24', 40); return; }
    g.fillStyle = fg || '#1d2a24'; g.font = 'bold ' + (text.length > 8 ? 24 : text.length > 5 ? 34 : 44) + 'px "Noto Sans TC",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, h / 2 + 2);
  });
}
LANG_HOOKS.push(function () {   // 切換語言：重畫場景裡所有房名／設施標籤
  scene.traverse(o => { if (o.isSprite && o.userData && typeof o.userData.text === 'string' && o.material) { if (o.material.map) o.material.map.dispose(); o.material.map = makeLabelTex(o.userData.text, o.userData.bg, o.userData.fg); o.material.needsUpdate = true; } });
});
function label(text, x, y, z, scale, bg, fg, key) {
  if (RAISE) y += RAISE;
  const s = new T.Sprite(new T.SpriteMaterial({ map: makeLabelTex(text, bg, fg) }));
  if (CTX) s.position.set(x, y, z); else s.position.set(x, y, z);
  s.scale.set(scale || 1.5, (scale || 1.5) * 0.375, 1); (CTX ? CTX.group : scene).add(s);
  s.userData.text = text; s.userData.bg = bg; s.userData.fg = fg;
  if (key) { s.userData.key = key; LABELS[key] = s; }
  return s;
}
// 重畫房名標籤（供「編輯教室」套用名稱）
function relabel(s, text) {
  if (s.material.map) s.material.map.dispose();
  s.material.map = makeLabelTex(text, text === '（待補）' ? '#f3efe2' : (s.userData.bg || '#fff4e0'), s.userData.fg); s.material.needsUpdate = true; s.userData.text = text;
}
const LABELS = {};
let seed = 7; function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }

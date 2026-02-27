/* ============================================================
   東京防災ナビ — app.js  v3.0.0
   - 東京都オープンデータ避難所CSV連携 (CC BY 4.0)
   - i18n: 日本語 / English / 中文
   - PWA: Service Worker + offline fallback
   - Accessibility: ARIA, high-contrast, font-size control
============================================================ */
const APP_VERSION = '3.0.0';

/* ── i18n ────────────────────────────────────────────────── */
const I18N = {
  ja: {
    appName:       '東京防災ナビ',
    tickerText:    '実際の災害時は東京都・各区の公式情報を必ず確認してください。避難は早めの判断が命を守ります。',
    searchBtn:     '🔍 近くの避難所を自動検索',
    simBtn:        '🏃 避難シミュレーションを始める →',
    locTitle:      '📍 現在地を設定',
    locPlaceholder:'住所・駅名・ランドマークを入力（例：渋谷駅）',
    gpsLabel:      'GPSで現在地を取得',
    gpsSub:        '位置情報の許可が必要です',
    mapCtrLabel:   '地図の中心を現在地として使う',
    mapCtrSub:     '地図をスクロールして場所を合わせてください',
    searching:     '避難所を検索中...',
    searchRadius:  '現在地周辺 1.5km を検索しています',
    sheltersFound: '件の避難所が見つかりました',
    closeBtn:      '✕ 閉じる',
    selectBtn:     '選択',
    routeBtn:      'ここへ避難するルートを確認 →',
    walkMin:       '約',
    simTitle:      '🧭 避難シミュレーション',
    simStep:       'STEP 1/2',
    destLabel:     '🎯 避難先',
    noShelter:     '避難所が選択されていません',
    noShelterSub:  'マップに戻って「近くの避難所を自動検索」をタップしてください',
    disasterLabel: '想定する災害',
    disasters:     { flood:'水害', quake:'地震', tsunami:'津波' },
    speedLabel:    '歩くスピード',
    speeds:        {
      fast:   { name:'早歩き（いそぎ）', sub:'時速 5.0km · 急いで移動できる人' },
      normal: { name:'ふつうに歩く',     sub:'時速 3.5km · 大人の平均ペース' },
      slow:   { name:'お年寄り・ケガあり', sub:'時速 2.0km · ゆっくり移動' },
    },
    startBtn:      '🚨 シミュレーション開始！',
    resultTitle:   '📊 シミュレーション結果',
    resultStep:    'STEP 2/2',
    arrivalLabel:  '⏱ 避難所まで 予想到達時間',
    arrivalUnit:   '分',
    xpLabel:       'MISSION COMPLETE',
    xpText:        '防災シミュレーション達成！',
    calLabel:      '消費カロリー',
    distLabel:     '避難距離',
    stepsLabel:    '歩数目安',
    tlLabel:       '⏱ タイムライン — 危険が始まるまでの時間',
    advLabel:      '💡 防災アドバイス',
    retryBtn:      '🔄 条件を変えてもう一度試す',
    backMapBtn:    '🗺 ハザードマップに戻る',
    shareBtn:      '📤 結果をシェア',
    shareText:     (mins) => `東京防災ナビ シミュレーション結果\n避難所まで 予想 ${mins}分\n\nあなたも試してみよう！`,
    dataSource:    '避難所データ：東京都オープンデータ (CC BY 4.0)',
    offlineNote:   '(オフライン推定)',
    toastGps:      '📍 現在地を取得中...',
    toastGpsOk:    '✅ GPSで現在地を取得しました',
    toastGpsFail:  '📍 デモ位置で表示中（GPS取得失敗）',
    toastTap:      '📍 タップした場所を現在地に設定しました',
    toastShelter:  (name) => `✅ 避難先を「${name}」に設定しました`,
    toastNoShelter:'⚠ 先に避難所を選択してください',
    toastCopied:   '📋 結果をコピーしました',
    toastRouteFail:'⚠ 道路ルート取得失敗。直線で表示しています。',
    toastUpdate:   '🔄 アプリを更新しました。再読み込みしてください。',
    errGps1:       '⚠ 位置情報の使用が拒否されました。ブラウザの設定を確認してください。',
    errGps2:       '⚠ 位置情報を取得できませんでした。',
    errGps3:       '⚠ タイムアウトしました。もう一度お試しください。',
    risk:          { flood:'水害', quake:'倒壊', liq:'液状化', tsunami:'津波' },
    riskHigh:      '🔴 高危険', riskMid: '🟠 中危険', riskLow: '🟡 要注意',
    riskArea:      'リスクエリア',
    safe: {
      icon:'✅', xp:100,
      feedback:'🎉 余裕を持って到着できます！\n想定される危険が始まる前に避難所へ到達できます。ただし実際には道のがれきや混雑があります。警報が出たらすぐに出発しましょう！',
      advice:[
        {i:'🎒',t:'非常持ち出し袋（水・食料・常備薬）を今すぐ確認しよう！'},
        {i:'📱',t:'家族との「集合場所」と「連絡方法」を事前に決めておこう。'},
        {i:'🔋',t:'スマホの充電は常に50%以上をキープするくせをつけよう。'},
        {i:'🗺',t:'今確認した避難ルートを家族と一緒に実際に歩いてみよう！'},
      ],
    },
    warn: {
      icon:'⚠️', xp:60,
      feedback:'⚠️ 少しギリギリかもしれません！\n実際には道が冠水したりがれきで通れなくなることがあります。この結果より【20分早く】出発することをおすすめします！',
      advice:[
        {i:'🚨',t:'「まだ大丈夫」は禁物。避難指示が出たらすぐに動こう！'},
        {i:'🛤',t:'川や低い土地のそばを通るルートは避け、高い場所を歩こう。'},
        {i:'👥',t:'近所の人と声をかけあって一緒に避難しよう。'},
        {i:'💨',t:'不要な荷物は置いていく勇気も必要。命が最優先！'},
      ],
    },
    danger: {
      icon:'🆘', xp:30,
      feedback:'🆘 間に合わない可能性があります！\n急いでも危険が始まるまでに到達できないかもしれません。今すぐ【上の階への垂直避難】を考えましょう。2階以上が安全です！',
      advice:[
        {i:'🏢',t:'水平移動が難しい場合は、2階以上への「垂直避難」が有効！'},
        {i:'📞',t:'119番・110番へ迷わず早期連絡を。助けを求めることは正しい。'},
        {i:'🚫',t:'胸まで水が来たら歩くのは非常に危険。無理に動かないで！'},
        {i:'🌟',t:'冷静さを保つことが最も大切。パニックは危険を大きくする。'},
      ],
    },
  },
  en: {
    appName:       'Tokyo Bousai Navi',
    tickerText:    'In a real emergency, always follow official Tokyo Metropolitan Government guidance. Early action saves lives.',
    searchBtn:     '🔍 Find Nearby Shelters',
    simBtn:        '🏃 Start Evacuation Simulation →',
    locTitle:      '📍 Set Your Location',
    locPlaceholder:'Enter address, station or landmark (e.g. Shibuya Station)',
    gpsLabel:      'Use GPS Location',
    gpsSub:        'Location permission required',
    mapCtrLabel:   'Use Map Center as Location',
    mapCtrSub:     'Scroll the map to your position',
    searching:     'Searching for shelters...',
    searchRadius:  'Searching within 1.5km of your location',
    sheltersFound: 'shelters found',
    closeBtn:      '✕ Close',
    selectBtn:     'Select',
    routeBtn:      'Set as evacuation destination →',
    walkMin:       'approx.',
    simTitle:      '🧭 Evacuation Simulation',
    simStep:       'STEP 1/2',
    destLabel:     '🎯 Destination',
    noShelter:     'No shelter selected',
    noShelterSub:  'Go back to map and tap "Find Nearby Shelters"',
    disasterLabel: 'Disaster type',
    disasters:     { flood:'Flood', quake:'Earthquake', tsunami:'Tsunami' },
    speedLabel:    'Walking speed',
    speeds:        {
      fast:   { name:'Fast walk',         sub:'5.0 km/h · Can move quickly' },
      normal: { name:'Normal walk',       sub:'3.5 km/h · Average adult pace' },
      slow:   { name:'Elderly / Injured', sub:'2.0 km/h · Slow movement' },
    },
    startBtn:      '🚨 Start Simulation!',
    resultTitle:   '📊 Simulation Results',
    resultStep:    'STEP 2/2',
    arrivalLabel:  '⏱ Estimated Arrival Time',
    arrivalUnit:   'min',
    xpLabel:       'MISSION COMPLETE',
    xpText:        'Evacuation simulation done!',
    calLabel:      'Calories',
    distLabel:     'Distance',
    stepsLabel:    'Steps',
    tlLabel:       '⏱ Timeline — Time until danger begins',
    advLabel:      '💡 Safety Advice',
    retryBtn:      '🔄 Try different conditions',
    backMapBtn:    '🗺 Back to Hazard Map',
    shareBtn:      '📤 Share Results',
    shareText:     (mins) => `Tokyo Bousai Navi Simulation\nEstimated evacuation time: ${mins} min\n\nTry it yourself!`,
    dataSource:    'Shelter data: Tokyo Open Data (CC BY 4.0)',
    offlineNote:   '(offline estimate)',
    toastGps:      '📍 Getting GPS location...',
    toastGpsOk:    '✅ GPS location acquired',
    toastGpsFail:  '📍 Showing demo location (GPS failed)',
    toastTap:      '📍 Location set to tapped point',
    toastShelter:  (name) => `✅ Destination set to "${name}"`,
    toastNoShelter:'⚠ Please select a shelter first',
    toastCopied:   '📋 Results copied',
    toastRouteFail:'⚠ Route fetch failed. Showing straight line.',
    toastUpdate:   '🔄 App updated. Please reload.',
    errGps1:       '⚠ Location access denied. Check browser settings.',
    errGps2:       '⚠ Could not get location.',
    errGps3:       '⚠ Timed out. Please try again.',
    risk:          { flood:'Flood', quake:'Collapse', liq:'Liquefaction', tsunami:'Tsunami' },
    riskHigh:'🔴 High Risk', riskMid:'🟠 Mid Risk', riskLow:'🟡 Caution',
    riskArea:'Risk Area',
    safe: {
      icon:'✅', xp:100,
      feedback:'🎉 You can arrive with plenty of time!\nYou can reach the shelter before the danger begins. However, in a real disaster there may be debris and crowds. Leave as soon as a warning is issued!',
      advice:[
        {i:'🎒',t:'Check your emergency bag (water, food, medication) now!'},
        {i:'📱',t:'Decide a meeting place and contact method with your family in advance.'},
        {i:'🔋',t:'Keep your phone charged above 50% at all times.'},
        {i:'🗺',t:'Walk the evacuation route with your family while everything is calm!'},
      ],
    },
    warn: {
      icon:'⚠️', xp:60,
      feedback:'⚠️ It might be close!\nRoads may flood or be blocked by debris. Leave 20 minutes earlier than this result suggests!',
      advice:[
        {i:'🚨',t:'"I\'m probably fine" is dangerous. Move immediately when ordered!'},
        {i:'🛤',t:'Avoid routes near rivers or low ground. Stick to high ground.'},
        {i:'👥',t:'Call out to neighbours and evacuate together.'},
        {i:'💨',t:'Courage to leave unnecessary luggage behind. Life is the priority!'},
      ],
    },
    danger: {
      icon:'🆘', xp:30,
      feedback:'🆘 You may not make it in time!\nEven hurrying, you might not reach shelter before danger begins. Consider vertical evacuation to a higher floor immediately!',
      advice:[
        {i:'🏢',t:'If horizontal movement is difficult, "vertical evacuation" to floor 2+ is effective!'},
        {i:'📞',t:'Call 119 or 110 early. Asking for help is the right thing to do.'},
        {i:'🚫',t:'Walking when water reaches your chest is extremely dangerous. Don\'t move!'},
        {i:'🌟',t:'Staying calm is the most important thing. Panic makes danger worse.'},
      ],
    },
  },
  zh: {
    appName:       '东京防灾导航',
    tickerText:    '发生真实灾害时，请务必确认东京都及各区的官方信息。尽早判断、尽早行动，是保护生命的关键。',
    searchBtn:     '🔍 自动搜索附近避难所',
    simBtn:        '🏃 开始避难模拟 →',
    locTitle:      '📍 设置当前位置',
    locPlaceholder:'输入地址、车站或地标（例：涩谷站）',
    gpsLabel:      '使用GPS获取当前位置',
    gpsSub:        '需要位置权限',
    mapCtrLabel:   '使用地图中心作为当前位置',
    mapCtrSub:     '滚动地图到您的位置',
    searching:     '正在搜索避难所...',
    searchRadius:  '正在搜索当前位置1.5公里范围内的避难所',
    sheltersFound: '个避难所',
    closeBtn:      '✕ 关闭',
    selectBtn:     '选择',
    routeBtn:      '确认前往该避难所的路线 →',
    walkMin:       '约',
    simTitle:      '🧭 避难模拟',
    simStep:       '第 1/2 步',
    destLabel:     '🎯 避难目的地',
    noShelter:     '尚未选择避难所',
    noShelterSub:  '请返回地图，点击"自动搜索附近避难所"',
    disasterLabel: '灾害类型',
    disasters:     { flood:'洪水', quake:'地震', tsunami:'海啸' },
    speedLabel:    '步行速度',
    speeds:        {
      fast:   { name:'快步走',     sub:'5.0 km/h · 可以快速移动的人' },
      normal: { name:'正常步行',   sub:'3.5 km/h · 成人平均速度' },
      slow:   { name:'老人/受伤者', sub:'2.0 km/h · 缓慢移动' },
    },
    startBtn:      '🚨 开始模拟！',
    resultTitle:   '📊 模拟结果',
    resultStep:    '第 2/2 步',
    arrivalLabel:  '⏱ 预计到达避难所时间',
    arrivalUnit:   '分钟',
    xpLabel:       '任务完成',
    xpText:        '防灾模拟完成！',
    calLabel:      '消耗卡路里',
    distLabel:     '避难距离',
    stepsLabel:    '步数',
    tlLabel:       '⏱ 时间轴 — 距危险开始的时间',
    advLabel:      '💡 防灾建议',
    retryBtn:      '🔄 更换条件重试',
    backMapBtn:    '🗺 返回灾害地图',
    shareBtn:      '📤 分享结果',
    shareText:     (mins) => `东京防灾导航模拟结果\n预计避难时间：${mins}分钟\n\n快来试试吧！`,
    dataSource:    '避难所数据：东京都开放数据 (CC BY 4.0)',
    offlineNote:   '（离线估算）',
    toastGps:      '📍 正在获取GPS位置...',
    toastGpsOk:    '✅ 已获取GPS位置',
    toastGpsFail:  '📍 显示示例位置（GPS获取失败）',
    toastTap:      '📍 已将点击位置设为当前位置',
    toastShelter:  (name) => `✅ 已将避难地点设置为「${name}」`,
    toastNoShelter:'⚠ 请先选择避难所',
    toastCopied:   '📋 结果已复制',
    toastRouteFail:'⚠ 路线获取失败，以直线显示。',
    toastUpdate:   '🔄 应用已更新，请重新加载。',
    errGps1:       '⚠ 位置权限被拒绝，请检查浏览器设置。',
    errGps2:       '⚠ 无法获取位置信息。',
    errGps3:       '⚠ 超时，请重试。',
    risk:          { flood:'洪水', quake:'倒塌', liq:'液化', tsunami:'海啸' },
    riskHigh:'🔴 高风险', riskMid:'🟠 中风险', riskLow:'🟡 注意',
    riskArea:'风险区域',
    safe: {
      icon:'✅', xp:100,
      feedback:'🎉 您可以从容到达！\n在危险开始之前可以到达避难所。但实际情况可能有碎石和人群。发出警报后请立即出发！',
      advice:[
        {i:'🎒',t:'现在就检查应急包（水、食物、常备药）！'},
        {i:'📱',t:'事先与家人确定好集合地点和联系方式。'},
        {i:'🔋',t:'养成保持手机电量50%以上的习惯。'},
        {i:'🗺',t:'在平时和家人一起实际走一遍避难路线！'},
      ],
    },
    warn: {
      icon:'⚠️', xp:60,
      feedback:'⚠️ 时间可能很紧张！\n道路可能被淹没或被碎石堵塞。建议比本模拟结果提前【20分钟】出发！',
      advice:[
        {i:'🚨',t:'"应该没问题"是危险的想法。收到避难指示后立刻行动！'},
        {i:'🛤',t:'避开河流和低洼地带的路线，走地势较高的地方。'},
        {i:'👥',t:'呼唤邻居一起避难。'},
        {i:'💨',t:'勇于舍弃不必要的行李。生命安全是第一位的！'},
      ],
    },
    danger: {
      icon:'🆘', xp:30,
      feedback:'🆘 可能来不及了！\n即使赶快跑，也可能在危险开始前无法到达避难所。请立即考虑向高层进行"垂直避难"！',
      advice:[
        {i:'🏢',t:'水平移动困难时，向2楼以上"垂直避难"很有效！'},
        {i:'📞',t:'及时拨打119或110。寻求帮助是正确的。'},
        {i:'🚫',t:'水位到胸口时行走非常危险，不要强行移动！'},
        {i:'🌟',t:'保持冷静最重要。恐慌会使危险加剧。'},
      ],
    },
  },
};

let currentLang = 'ja';
const t = () => I18N[currentLang];

function setLang(lang) {
  if (!I18N[lang]) return;
  currentLang = lang;
  document.documentElement.lang = lang === 'ja' ? 'ja' : lang === 'en' ? 'en' : 'zh';
  applyI18n();
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
    b.setAttribute('aria-pressed', b.dataset.lang === lang);
  });
  localStorage.setItem('bousai_lang', lang);
}

function applyI18n() {
  const T = t();
  // Dynamic text nodes keyed by data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const keys = key.split('.');
    let val = T;
    for (const k of keys) val = val?.[k];
    if (typeof val === 'string') el.textContent = val;
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.dataset.i18nPh;
    const keys = key.split('.');
    let val = T;
    for (const k of keys) val = val?.[k];
    if (typeof val === 'string') el.placeholder = val;
  });
  // App name / page title
  document.title = T.appName + ' — 避難所検索・ハザードマップ';
  // Ticker
  const tickEl = document.querySelector('.tick-text');
  if (tickEl) tickEl.textContent = T.tickerText;
  // Speed card labels
  Object.entries(T.speeds).forEach(([key, s]) => {
    const card = document.querySelector(`.speed-card[data-speed="${key}"]`);
    if (!card) return;
    const name = card.querySelector('.sp-name');
    const sub  = card.querySelector('.sp-sub');
    if (name) name.textContent = s.name;
    if (sub)  sub.textContent  = s.sub;
  });
  // Disaster chips
  Object.entries(T.disasters).forEach(([key, label]) => {
    const chip = document.querySelector(`.chip[data-disaster="${key}"]`);
    if (chip) chip.querySelector('.chip-label').textContent = label;
  });
  // Data source credit
  const credit = document.getElementById('data-credit');
  if (credit) credit.textContent = T.dataSource;
}

/* ── Accessibility: Font size ────────────────────────────── */
let fontScale = parseFloat(localStorage.getItem('bousai_font') || '1');
function applyFontScale(scale) {
  fontScale = Math.min(1.4, Math.max(1, scale));
  document.documentElement.style.fontSize = (fontScale * 16) + 'px';
  localStorage.setItem('bousai_font', fontScale);
  document.getElementById('font-decrease').disabled = fontScale <= 1;
  document.getElementById('font-increase').disabled = fontScale >= 1.4;
  document.getElementById('font-decrease').setAttribute('aria-disabled', fontScale <= 1);
  document.getElementById('font-increase').setAttribute('aria-disabled', fontScale >= 1.4);
}
function increaseFontSize() { applyFontScale(fontScale + 0.1); }
function decreaseFontSize() { applyFontScale(fontScale - 0.1); }

/* ── Accessibility: High contrast ───────────────────────── */
let highContrast = localStorage.getItem('bousai_hc') === '1';
function toggleHighContrast() {
  highContrast = !highContrast;
  document.documentElement.classList.toggle('high-contrast', highContrast);
  localStorage.setItem('bousai_hc', highContrast ? '1' : '0');
  const btn = document.getElementById('hc-btn');
  if (btn) {
    btn.setAttribute('aria-pressed', highContrast);
    btn.title = highContrast ? 'ハイコントラスト OFF' : 'ハイコントラスト ON';
  }
}

/* ── Navigation ──────────────────────────────────────────── */
function nav(id) {
  document.querySelectorAll('.view').forEach(v => {
    v.classList.remove('active');
    v.setAttribute('aria-hidden', 'true');
  });
  const target = document.getElementById('view-' + id);
  target.classList.add('active');
  target.setAttribute('aria-hidden', 'false');
  // Focus management for accessibility
  const firstFocusable = target.querySelector('button, [href], input, select, [tabindex]:not([tabindex="-1"])');
  if (firstFocusable) setTimeout(() => firstFocusable.focus(), 50);
  if (id === 'results') document.getElementById('results-scroll').scrollTop = 0;
  if (id === 'sim')     document.getElementById('sim-scroll').scrollTop = 0;
}

/* ── Toast ───────────────────────────────────────────────── */
let _toastTimer;
function toast(msg, ms = 2800) {
  clearTimeout(_toastTimer);
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  el.setAttribute('aria-live', 'assertive');
  _toastTimer = setTimeout(() => el.classList.remove('show'), ms);
}

/* ── Bottom Sheet ────────────────────────────────────────── */
let sheetExpanded = false;
function toggleSheet() {
  sheetExpanded = !sheetExpanded;
  const sheet = document.getElementById('bottom-sheet');
  sheet.classList.toggle('expanded', sheetExpanded);
  sheet.setAttribute('aria-expanded', sheetExpanded);
}
function switchSheet(id) {
  document.querySelectorAll('.sheet-view').forEach(v => v.classList.remove('active'));
  document.getElementById('sv-' + id).classList.add('active');
}
function closeResults() {
  switchSheet('default');
  sheetExpanded = false;
  document.getElementById('bottom-sheet').classList.remove('expanded');
}

/* ── Location Search Modal ───────────────────────────────── */
function openLocSearch() {
  const modal = document.getElementById('loc-modal');
  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');
  setTimeout(() => document.getElementById('loc-input').focus(), 80);
}
function closeLocSearch() {
  const modal = document.getElementById('loc-modal');
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', 'true');
  document.getElementById('loc-input').value = '';
  document.getElementById('loc-suggestions').innerHTML = '';
  document.getElementById('loc-clear').style.display = 'none';
  clearTimeout(_sugTimer);
  document.getElementById('fab-gps').focus();
}

let _sugTimer, _sugAbort;
function onLocInput() {
  const val = document.getElementById('loc-input').value.trim();
  document.getElementById('loc-clear').style.display = val ? 'block' : 'none';
  clearTimeout(_sugTimer);
  if (val.length < 2) { document.getElementById('loc-suggestions').innerHTML = ''; return; }
  _sugTimer = setTimeout(() => fetchSuggestions(val), 380);
}
function onLocKey(e) {
  if (e.key === 'Enter') { const v = document.getElementById('loc-input').value.trim(); if (v) fetchSuggestions(v); }
  if (e.key === 'Escape') closeLocSearch();
}
function clearLocInput() {
  document.getElementById('loc-input').value = '';
  document.getElementById('loc-clear').style.display = 'none';
  document.getElementById('loc-suggestions').innerHTML = '';
  document.getElementById('loc-input').focus();
}

async function fetchSuggestions(query) {
  const sug = document.getElementById('loc-suggestions');
  sug.innerHTML = '<div class="loc-sug-loading"><div class="loc-sug-spinner" role="status" aria-label="検索中"></div>' + (currentLang === 'ja' ? '検索中...' : currentLang === 'en' ? 'Searching...' : '搜索中...') + '</div>';
  if (_sugAbort) _sugAbort.abort();
  _sugAbort = new AbortController();
  try {
    const url = 'https://nominatim.openstreetmap.org/search?' + new URLSearchParams({
      q: query + (currentLang === 'ja' ? ' 日本' : ' Japan'),
      format: 'json', addressdetails: 1, limit: 7,
      countrycodes: 'jp', 'accept-language': currentLang === 'zh' ? 'zh' : currentLang,
      viewbox: '139.4,35.5,139.9,35.9', bounded: 0,
    });
    const res = await fetch(url, { signal: _sugAbort.signal });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const results = await res.json();
    if (!results.length) { sug.innerHTML = '<div class="loc-sug-loading">「' + query + '」' + (currentLang === 'ja' ? 'は見つかりませんでした' : currentLang === 'en' ? ' not found' : '未找到') + '</div>'; return; }
    sug.innerHTML = '';
    results.forEach(r => {
      const name = r.namedetails?.name || r.display_name.split(',')[0];
      const addr = r.display_name.split(',').slice(1, 4).join(' ').trim();
      const item = document.createElement('div');
      item.className = 'loc-sug-item';
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      item.setAttribute('aria-label', name + ' ' + addr);
      item.innerHTML = '<div class="loc-sug-icon" aria-hidden="true">📍</div><div class="loc-sug-body"><div class="loc-sug-name">' + name + '</div><div class="loc-sug-addr">' + addr + '</div></div>';
      const pick = () => setLocationFromNominatim(parseFloat(r.lat), parseFloat(r.lon), name);
      item.addEventListener('click', pick);
      item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') pick(); });
      sug.appendChild(item);
    });
  } catch(err) {
    if (err.name === 'AbortError') return;
    sug.innerHTML = '<div class="loc-sug-loading">⚠ ' + (currentLang === 'ja' ? '検索に失敗しました' : currentLang === 'en' ? 'Search failed' : '搜索失败') + '</div>';
  }
}

function setLocationFromNominatim(lat, lng, label) {
  closeLocSearch();
  userLatLng = { lat, lng };
  placeUser(lat, lng);
  map.setView([lat, lng], 15, { animate: true });
  toast('📍 ' + label);
}

function useGPS() {
  const btn = document.getElementById('loc-gps-label');
  const orig = btn.textContent;
  btn.textContent = currentLang === 'ja' ? '取得中...' : currentLang === 'en' ? 'Getting...' : '获取中...';
  if (!navigator.geolocation) { btn.textContent = orig; toast('⚠ GPS非対応'); return; }
  navigator.geolocation.getCurrentPosition(
    p => {
      btn.textContent = orig;
      closeLocSearch();
      userLatLng = { lat: p.coords.latitude, lng: p.coords.longitude };
      placeUser(userLatLng.lat, userLatLng.lng);
      map.setView([userLatLng.lat, userLatLng.lng], 16, { animate: true });
      toast(t().toastGpsOk);
    },
    err => {
      btn.textContent = orig;
      const msgs = { 1: t().errGps1, 2: t().errGps2, 3: t().errGps3 };
      toast(msgs[err.code] || t().errGps2, 4000);
    },
    { timeout: 10000, enableHighAccuracy: true }
  );
}

function useMapCenter() {
  const c = map.getCenter();
  userLatLng = { lat: c.lat, lng: c.lng };
  placeUser(c.lat, c.lng);
  closeLocSearch();
  toast(t().toastTap);
}

/* ── Map ─────────────────────────────────────────────────── */
const DEFAULT_CENTER = [35.6800, 139.7500];
let map, userMarker, routeLine;
let userLatLng    = null;
let shelterMarkers = [];
let selectedShelter = null;

// Tokyo open data shelter cache
let _tokyoShelters = null;

function initMap() {
  const TOKYO_BOUNDS = L.latLngBounds([35.50, 139.05], [35.93, 139.92]);
  map = L.map('map', {
    center: DEFAULT_CENTER, zoom: 11, zoomControl: true,
    maxBounds: TOKYO_BOUNDS.pad(0.02),
    minZoom: 10,
    maxBoundsViscosity: 1.0,
  });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://openstreetmap.org" rel="noopener">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map);

  /* ── Tokyo boundary polygon (mainland, excluding islands) ── */
  const TOKYO_BORDER = [
    [35.898, 139.095],[35.917, 139.150],[35.900, 139.200],[35.860, 139.260],
    [35.832, 139.320],[35.810, 139.380],[35.795, 139.420],[35.790, 139.470],
    [35.787, 139.520],[35.792, 139.560],[35.798, 139.610],[35.800, 139.650],
    [35.802, 139.700],[35.800, 139.750],[35.795, 139.790],[35.777, 139.830],
    [35.747, 139.860],[35.712, 139.878],[35.672, 139.888],[35.642, 139.872],
    [35.612, 139.852],[35.592, 139.822],[35.572, 139.792],[35.552, 139.772],
    [35.542, 139.742],[35.550, 139.692],[35.562, 139.652],[35.572, 139.602],
    [35.560, 139.552],[35.572, 139.502],[35.562, 139.452],[35.550, 139.412],
    [35.532, 139.382],[35.557, 139.342],[35.582, 139.292],[35.622, 139.232],
    [35.672, 139.172],[35.732, 139.122],[35.782, 139.092],[35.832, 139.072],
    [35.898, 139.095],
  ];
  // Mask: dim everything outside Tokyo
  const worldRect = [[90,-180],[90,180],[-90,180],[-90,-180],[90,-180]];
  const tokyoHole = TOKYO_BORDER.slice().reverse();
  L.polygon([worldRect, tokyoHole], {
    fillColor: '#1a1a2e', fillOpacity: 0.35, stroke: false, interactive: false,
  }).addTo(map);
  // Border line around Tokyo
  L.polyline(TOKYO_BORDER, {
    color: '#FF5C00', weight: 3, opacity: 0.7, dashArray: '10, 5', interactive: false,
  }).addTo(map);

  map.on('click', e => {
    userLatLng = { lat: e.latlng.lat, lng: e.latlng.lng };
    placeUser(e.latlng.lat, e.latlng.lng);
    toast(t().toastTap);
  });

  // Keyboard accessibility: Leaflet map ARIA
  map.getContainer().setAttribute('role', 'application');
  map.getContainer().setAttribute('aria-label', currentLang === 'ja' ? 'インタラクティブ防災マップ' : 'Interactive hazard map');

  // Load and display all shelter names on map
  loadAndShowAllShelters();
}

async function placeUser(lat, lng) {
  userLatLng = { lat, lng };
  if (userMarker) map.removeLayer(userMarker);
  if (routeLine) {
    (Array.isArray(routeLine) ? routeLine : [routeLine]).forEach(l => map.removeLayer(l));
    routeLine = null;
  }
  const icon = L.divIcon({
    className: '',
    html: '<div role="img" aria-label="現在地" style="width:28px;height:28px;background:linear-gradient(135deg,#FF5C00,#FF8C00);border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 0 0 6px rgba(255,92,0,.18),0 4px 14px rgba(0,0,0,.22);"></div>',
    iconSize: [28, 28], iconAnchor: [14, 26],
  });
  userMarker = L.marker([lat, lng], { icon, alt: '現在地' }).addTo(map);
  userMarker.bindPopup('<div class="pop-inner"><div class="pop-title">📍 ' + (currentLang === 'ja' ? '現在地' : currentLang === 'en' ? 'Your Location' : '当前位置') + '</div></div>');
  if (selectedShelter) await drawRoute(lat, lng, selectedShelter.lat, selectedShelter.lng);
  renderRiskSummary(lat, lng);
}

function addShelterPin(lat, lng, name, distKm, isSelected, accessible) {
  const bg   = isSelected ? 'linear-gradient(135deg,#FF5C00,#FF8C00)' : 'linear-gradient(135deg,#00A86B,#00C87A)';
  const glow = isSelected ? 'rgba(255,92,0,.22)' : 'rgba(0,168,107,.22)';
  const badge = accessible ? '<div style="position:absolute;top:-6px;right:-6px;background:#1E6FD9;color:#fff;border-radius:50%;width:16px;height:16px;font-size:.6rem;display:flex;align-items:center;justify-content:center;border:2px solid #fff;">♿</div>' : '';
  const icon = L.divIcon({
    className: '',
    html: '<div role="img" aria-label="避難所" style="position:relative;width:38px;height:38px;background:' + bg + ';border-radius:11px;border:3px solid white;display:flex;align-items:center;justify-content:center;font-size:1.05rem;box-shadow:0 0 0 4px ' + glow + ',0 4px 14px rgba(0,0,0,.22);">🏫' + badge + '</div>',
    iconSize: [38, 38], iconAnchor: [19, 19],
  });
  const distText = distKm < 1 ? Math.round(distKm * 1000) + 'm' : distKm.toFixed(1) + 'km';
  const idx = shelterMarkers.length;
  window._allShelterData = window._allShelterData || [];
  window._allShelterData[idx] = { lat, lng, name, dist: distKm };
  const m = L.marker([lat, lng], { icon, alt: name }).addTo(map);
  m.bindPopup(
    '<div class="pop-inner">' +
    '<div class="pop-title">🏫 ' + name + (accessible ? ' <span style="color:#1E6FD9;font-size:.7rem">♿</span>' : '') + '</div>' +
    '<div class="pop-sub">' + (currentLang === 'ja' ? '指定避難所' : currentLang === 'en' ? 'Designated Shelter' : '指定避难所') + '</div>' +
    '<div class="pop-dist">📏 ' + distText + '</div>' +
    '<button class="pop-btn" onclick="window._pickShelter(' + idx + ')">' + t().routeBtn + '</button>' +
    '</div>'
  );
  shelterMarkers.push(m);
  return m;
}

window._pickShelter = idx => {
  const s = (window._allShelterData || [])[idx];
  if (s) { map.closePopup(); applySelectedShelter(s.lat, s.lng, s.name, s.dist, s.accessible); }
};

function clearShelterPins() {
  shelterMarkers.forEach(m => map.removeLayer(m));
  shelterMarkers = [];
  window._allShelterData = [];
}

async function applySelectedShelter(lat, lng, name, dist, accessible) {
  selectedShelter = { lat, lng, name, dist, accessible };
  const saved = window._foundShelters || [];
  clearShelterPins();
  if (saved.length) {
    saved.forEach(s => addShelterPin(s.lat, s.lng, s.name, s.dist, s.lat === lat && s.lng === lng, s.accessible));
  } else {
    addShelterPin(lat, lng, name, dist, true, accessible);
  }
  if (userLatLng) await drawRoute(userLatLng.lat, userLatLng.lng, lat, lng);

  const distNum  = dist < 1 ? Math.round(dist * 1000) : dist.toFixed(1);
  const distUnit = dist < 1 ? 'm' : 'km';
  document.getElementById('sim-shelter-name').textContent = name;
  document.getElementById('sim-shelter-dist-val').innerHTML = distNum + '<span class="ss-dist-u">' + distUnit + '</span>';
  document.getElementById('rline-km').textContent = dist < 1 ? Math.round(dist*1000) + ' M' : dist.toFixed(1) + ' KM';
  document.getElementById('r-dist').textContent = dist < 1 ? (dist*1000).toFixed(0) : dist.toFixed(1);
  document.getElementById('sim-no-shelter').style.display = 'none';
  document.getElementById('sim-shelter-card').style.display = 'flex';

  document.querySelectorAll('.shelter-item').forEach(el => {
    el.classList.toggle('selected', parseFloat(el.dataset.lat) === lat && parseFloat(el.dataset.lng) === lng);
  });
  toast(t().toastShelter(name));
}

/* ── Route (OSRM) ────────────────────────────────────────── */
async function drawRoute(lat1, lng1, lat2, lng2) {
  if (routeLine) {
    (Array.isArray(routeLine) ? routeLine : [routeLine]).forEach(l => map.removeLayer(l));
    routeLine = null;
  }
  try {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), 8000);
    const url = 'https://router.project-osrm.org/route/v1/foot/' + lng1 + ',' + lat1 + ';' + lng2 + ',' + lat2 + '?overview=full&geometries=geojson&steps=false';
    const res = await fetch(url, { signal: ac.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error('OSRM ' + res.status);
    const data = await res.json();
    if (data.code !== 'Ok' || !data.routes.length) throw new Error('No route');

    const coords  = data.routes[0].geometry.coordinates.map(([ln, lt]) => [lt, ln]);
    const meters  = data.routes[0].distance;
    const seconds = data.routes[0].duration;
    const outline = L.polyline(coords, { color: '#fff',    weight: 7,   opacity: .8  }).addTo(map);
    const line    = L.polyline(coords, { color: '#FF5C00', weight: 4.5, opacity: .95 }).addTo(map);
    const mid     = coords[Math.floor(coords.length / 2)];
    const kmText  = meters < 1000 ? Math.round(meters) + 'm' : (meters / 1000).toFixed(1) + 'km';
    const minText = t().walkMin + Math.round(seconds / 60) + (currentLang === 'zh' ? '分钟' : t().arrivalUnit);
    const badge   = L.marker(mid, {
      icon: L.divIcon({
        className: '',
        html: '<div role="img" aria-label="ルート距離' + kmText + '" style="background:#FF5C00;color:#fff;font-family:sans-serif;font-size:.72rem;font-weight:900;padding:5px 10px;border-radius:20px;white-space:nowrap;box-shadow:0 2px 8px rgba(255,92,0,.4);border:2px solid #fff;">🚶 ' + kmText + ' · ' + minText + '</div>',
        iconAnchor: [50, 14],
      }),
    }).addTo(map);
    routeLine = [outline, line, badge];
    // Update sim with real road distance
    const realDist = meters / 1000;
    if (selectedShelter) {
      selectedShelter.dist = realDist;
      const dn = realDist < 1 ? Math.round(realDist*1000) : realDist.toFixed(1);
      const du = realDist < 1 ? 'm' : 'km';
      document.getElementById('sim-shelter-dist-val').innerHTML = dn + '<span class="ss-dist-u">' + du + '</span>';
      document.getElementById('rline-km').textContent = realDist < 1 ? Math.round(realDist*1000) + ' M' : realDist.toFixed(1) + ' KM';
      document.getElementById('r-dist').textContent = realDist < 1 ? (realDist*1000).toFixed(0) : realDist.toFixed(1);
    }
  } catch(err) {
    routeLine = L.polyline([[lat1,lng1],[lat2,lng2]], { color:'#FF5C00', weight:3.5, opacity:.65, dashArray:'10,8' }).addTo(map);
    toast(t().toastRouteFail, 3000);
  }
}

/* ── Tokyo Open Data CSV ─────────────────────────────────── */
// Returns shelters near [lat,lng] sorted by distance
async function fetchTokyoShelters(lat, lng, radiusKm = 1.5) {
  // Cache in memory (one-time download per session)
  if (!_tokyoShelters) {
    try {
      // Fetch via GitHub Pages CORS-safe proxy pattern:
      // The Tokyo open data server supports CORS, so direct fetch is fine.
      const SHELTER_CSV = 'https://www.opendata.metro.tokyo.lg.jp/soumu/130001_evacuation_center.csv';
      const ac = new AbortController();
      const timer = setTimeout(() => ac.abort(), 12000);
      const res = await fetch(SHELTER_CSV, { signal: ac.signal });
      clearTimeout(timer);
      if (!res.ok) throw new Error('CSV HTTP ' + res.status);
      const buf = await res.arrayBuffer();
      // Decode Shift-JIS
      const decoder = new TextDecoder('shift-jis');
      const text = decoder.decode(buf);
      _tokyoShelters = parseTokyoCSV(text);
    } catch(err) {
      console.warn('[Tokyo CSV]', err.message);
      _tokyoShelters = [];
    }
  }

  return _tokyoShelters
    .map(s => ({ ...s, dist: calcDist(lat, lng, s.lat, s.lng) }))
    .filter(s => s.dist <= radiusKm)
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 15);
}

function parseTokyoCSV(text) {
  const lines = text.split('\n');
  // Skip header rows (first 2 lines based on format)
  const shelters = [];
  for (let i = 2; i < lines.length; i++) {
    const row = lines[i].split(',');
    if (row.length < 7) continue;
    const name = row[0]?.trim();
    const lat  = parseFloat(row[5]);
    const lng  = parseFloat(row[6]);
    if (!name || isNaN(lat) || isNaN(lng)) continue;
    const accessible = row[7]?.trim() === '有' || row[8]?.trim() === '有';
    shelters.push({ name, lat, lng, accessible });
  }
  return shelters;
}

/* ── Shelter Search (Tokyo CSV → Overpass fallback) ─────── */
function calcDist(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function makeFallbackShelters(lat, lng) {
  return [
    { dir: '北東', dlat:  0.004, dlng:  0.003 },
    { dir: '南東', dlat: -0.006, dlng:  0.005 },
    { dir: '西',   dlat:  0.002, dlng: -0.007 },
    { dir: '南西', dlat: -0.003, dlng: -0.004 },
    { dir: '北',   dlat:  0.008, dlng: -0.003 },
  ].map(o => ({
    lat: lat + o.dlat, lng: lng + o.dlng,
    name: (currentLang === 'en' ? 'Nearby Shelter (' + o.dir + ')' : currentLang === 'zh' ? '附近避难所（' + o.dir + '方向）' : '周辺避難所（' + o.dir + '方向）') + ' ' + t().offlineNote,
    dist: calcDist(lat, lng, lat + o.dlat, lng + o.dlng),
    demo: true, accessible: false,
  })).sort((a, b) => a.dist - b.dist);
}

async function searchShelters() {
  if (!userLatLng) { toast(t().toastNoShelter + ' — ' + (currentLang === 'ja' ? 'まず場所を設定してください' : 'Set location first'), 3500); openLocSearch(); return; }

  switchSheet('searching');
  document.getElementById('bottom-sheet').classList.add('expanded');
  const { lat, lng } = userLatLng;
  document.getElementById('search-sub-msg').textContent = t().searchRadius;

  let found = [];

  // ① Tokyo official CSV (best quality)
  found = await fetchTokyoShelters(lat, lng, 1.5);

  // ② Overpass fallback if CSV empty
  if (found.length < 3) {
    try {
      const r = 1500;
      const q = '[out:json][timeout:25];('
        + 'node["emergency"="assembly_point"](around:' + r + ',' + lat + ',' + lng + ');'
        + 'node["amenity"="shelter"](around:' + r + ',' + lat + ',' + lng + ');'
        + 'way["emergency"="assembly_point"](around:' + r + ',' + lat + ',' + lng + ');'
        + 'way["amenity"="community_centre"](around:' + r + ',' + lat + ',' + lng + ');'
        + 'way["amenity"="school"](around:' + r + ',' + lat + ',' + lng + ');'
        + ');out center tags;';
      const res = await fetch('https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(q), { headers: { Accept: 'application/json' } });
      if (res.ok) {
        const data = await res.json();
        const osm = data.elements.map(el => {
          const elat = el.lat ?? el.center?.lat;
          const elng = el.lon  ?? el.center?.lon;
          if (!elat || !elng) return null;
          const tags = el.tags || {};
          return { lat: elat, lng: elng, name: tags['name:ja'] || tags.name || tags['name:en'] || (currentLang === 'en' ? 'Shelter' : '避難所'), dist: calcDist(lat, lng, elat, elng), accessible: tags['wheelchair'] === 'yes' };
        }).filter(Boolean).sort((a,b) => a.dist - b.dist).slice(0, 12);
        // Merge without duplicates
        osm.forEach(o => { if (!found.some(f => calcDist(f.lat, f.lng, o.lat, o.lng) < 0.05)) found.push(o); });
        found.sort((a,b) => a.dist - b.dist);
        found = found.slice(0, 15);
      }
    } catch(err) { console.warn('[Overpass]', err.message); }
  }

  // ③ Offline demo fallback
  if (found.length < 2) {
    makeFallbackShelters(lat, lng).forEach(d => { if (!found.some(f => f.name === d.name)) found.push(d); });
    found.sort((a,b) => a.dist - b.dist);
    found = found.slice(0, 8);
  }

  window._foundShelters = found;
  renderShelterResults(found);
}

function renderShelterResults(shelters) {
  clearShelterPins();
  document.getElementById('res-num').textContent = shelters.length;
  const list = document.getElementById('shelter-list');
  list.innerHTML = '';
  list.setAttribute('role', 'list');

  shelters.forEach((s, i) => {
    const isFirst  = i === 0;
    const distTxt  = s.dist < 1 ? Math.round(s.dist*1000) + 'm' : s.dist.toFixed(1) + 'km';
    const distNum  = s.dist < 1 ? Math.round(s.dist*1000) : s.dist.toFixed(1);
    const distUnit = s.dist < 1 ? 'm' : 'km';
    const minsEst  = Math.round((s.dist / 3.5) * 60);
    const a11yBadge = s.accessible ? ' <span aria-label="車椅子対応" title="車椅子対応" style="color:#1E6FD9">♿</span>' : '';
    const demoTag  = s.demo ? ' <span style="font-size:.6rem;color:var(--ink4)">' + t().offlineNote + '</span>' : '';

    const item = document.createElement('div');
    item.className = 'shelter-item' + (isFirst ? ' selected' : '');
    item.setAttribute('role', 'listitem');
    item.dataset.lat = s.lat;
    item.dataset.lng = s.lng;
    const riskBadges = getRiskBadgesHTML(s.lat, s.lng);
    item.innerHTML =
      '<div class="si-icon" aria-hidden="true">' + (s.demo ? '🏫' : '🏛') + '</div>' +
      '<div class="si-body">' +
        '<span class="si-name">' + s.name + a11yBadge + demoTag + '</span>' +
        '<span class="si-meta">' + t().walkMin + minsEst + (currentLang === 'zh' ? '分钟' : t().arrivalUnit) + ' · ' + distTxt + '</span>' +
        (riskBadges ? '<div class="si-risks">' + riskBadges + '</div>' : '') +
      '</div>' +
      '<div class="si-dist" aria-label="距離 ' + distTxt + '">' + distNum + '<span class="si-dist-unit">' + distUnit + '</span></div>' +
      '<button class="btn-route" aria-label="' + s.name + 'を選択">' + t().selectBtn + '</button>';

    item.querySelector('.btn-route').addEventListener('click', e => {
      e.stopPropagation();
      applySelectedShelter(s.lat, s.lng, s.name, s.dist, s.accessible);
    });
    item.addEventListener('click', () => map.setView([s.lat, s.lng], 16, { animate: true }));
    list.appendChild(item);
    addShelterPin(s.lat, s.lng, s.name, s.dist, isFirst, s.accessible);
  });

  applySelectedShelter(shelters[0].lat, shelters[0].lng, shelters[0].name, shelters[0].dist, shelters[0].accessible);
  const bounds = shelters.map(s => [s.lat, s.lng]);
  if (userLatLng) bounds.push([userLatLng.lat, userLatLng.lng]);
  try { map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 }); } catch(e) {}
  switchSheet('results');
}

/* ── Risk Overlays ───────────────────────────────────────── */
const riskLayers = {}, riskOn = {};
const RISK = {
  flood: { pts:[
    // 荒川流域（足立・葛飾・北区・荒川区）
    [35.775,139.805,.95],[35.760,139.790,.9],[35.748,139.810,.85],[35.780,139.830,.8],
    [35.790,139.785,.75],[35.755,139.775,.7],[35.730,139.800,.85],[35.765,139.820,.8],
    // 隅田川・墨田区・台東区
    [35.710,139.800,.85],[35.720,139.795,.8],[35.700,139.790,.7],[35.712,139.810,.75],
    // 江東区（低地帯）
    [35.672,139.817,.9],[35.660,139.830,.85],[35.680,139.800,.8],[35.668,139.845,.75],
    [35.685,139.825,.7],[35.655,139.810,.8],
    // 江戸川区
    [35.707,139.868,.95],[35.720,139.880,.9],[35.695,139.875,.85],[35.735,139.870,.8],
    [35.710,139.890,.85],[35.690,139.860,.75],
    // 葛飾区
    [35.744,139.847,.85],[35.755,139.860,.8],[35.735,139.840,.75],
    // 多摩川沿い（大田区・世田谷区）
    [35.560,139.720,.8],[35.570,139.700,.7],[35.580,139.680,.65],[35.555,139.740,.75],
    [35.590,139.665,.6],[35.575,139.710,.7],
    // 中川・新中川沿い
    [35.730,139.855,.7],[35.745,139.840,.65],[35.715,139.860,.75],
    // 世田谷・目黒（旧データ含む）
    [35.665,139.640,.6],[35.660,139.645,.5],[35.655,139.650,.55],
    // 北区・板橋区（荒川沿い）
    [35.770,139.740,.7],[35.780,139.755,.65],[35.760,139.750,.6],
  ], c:{h:'rgba(0,110,220,.52)',m:'rgba(0,80,200,.35)',l:'rgba(60,130,220,.22)'} },

  quake: { pts:[
    // 木造密集地域 — 墨田区・荒川区
    [35.715,139.805,.9],[35.725,139.795,.85],[35.710,139.790,.8],[35.720,139.810,.75],
    // 品川区・大田区（密集市街地）
    [35.610,139.730,.8],[35.600,139.720,.75],[35.620,139.715,.7],[35.595,139.735,.65],
    // 杉並区・中野区（木密エリア）
    [35.700,139.635,.8],[35.710,139.650,.75],[35.695,139.620,.7],[35.705,139.645,.65],
    [35.690,139.640,.6],
    // 豊島区・北区
    [35.735,139.715,.75],[35.740,139.730,.7],[35.745,139.720,.65],[35.730,139.710,.6],
    // 新宿区・文京区
    [35.705,139.720,.65],[35.710,139.745,.6],[35.700,139.735,.55],
    // 台東区
    [35.715,139.780,.7],[35.720,139.775,.65],
    // 足立区
    [35.775,139.800,.7],[35.785,139.810,.65],[35.770,139.790,.6],
    // 世田谷区・目黒区（旧データ含む）
    [35.660,139.620,.55],[35.645,139.640,.5],[35.635,139.650,.6],
    // 板橋区
    [35.760,139.700,.6],[35.755,139.690,.55],
    // 葛飾区
    [35.745,139.850,.6],[35.750,139.840,.55],
  ], c:{h:'rgba(210,43,43,.52)',m:'rgba(240,100,0,.38)',l:'rgba(245,166,35,.28)'} },

  liq: { pts:[
    // 江東区・湾岸（埋立地）
    [35.650,139.790,.95],[35.640,139.800,.9],[35.655,139.810,.9],[35.645,139.820,.85],
    [35.660,139.785,.85],[35.635,139.795,.8],[35.648,139.830,.8],
    // 中央区（月島・晴海・豊洲周辺）
    [35.660,139.775,.85],[35.665,139.785,.8],[35.655,139.770,.75],
    // 港区（台場・芝浦）
    [35.635,139.760,.8],[35.628,139.770,.75],[35.640,139.755,.7],
    // 江戸川区（臨海部）
    [35.650,139.860,.85],[35.660,139.870,.8],[35.645,139.855,.75],[35.640,139.880,.7],
    // 大田区（湾岸）
    [35.570,139.755,.75],[35.565,139.770,.7],[35.575,139.745,.65],
    // 品川区（天王洲周辺）
    [35.620,139.750,.7],[35.615,139.755,.65],
    // 足立区（荒川沿い低地）
    [35.775,139.810,.65],[35.780,139.800,.6],
    // 墨田区・江東区北部
    [35.695,139.810,.7],[35.700,139.820,.65],
    // 世田谷（旧データ含む）
    [35.655,139.645,.45],[35.648,139.655,.4],
  ], c:{h:'rgba(200,150,0,.55)',m:'rgba(220,180,0,.4)',l:'rgba(240,210,0,.28)'} },

  tsunami: { pts:[
    // 江東区臨海部（有明・豊洲・辰巳）
    [35.640,139.790,.9],[35.635,139.800,.85],[35.645,139.810,.85],[35.630,139.785,.8],
    [35.648,139.820,.8],[35.638,139.830,.75],
    // 中央区臨海部（晴海・勝どき）
    [35.655,139.775,.8],[35.660,139.780,.75],[35.650,139.770,.7],
    // 港区臨海部（台場・竹芝・芝浦）
    [35.630,139.760,.85],[35.625,139.770,.8],[35.635,139.755,.75],[35.620,139.765,.7],
    // 品川区臨海部（天王洲・東品川）
    [35.615,139.750,.75],[35.610,139.745,.7],[35.620,139.755,.65],
    // 大田区臨海部（城南島・羽田）
    [35.560,139.760,.9],[35.555,139.770,.85],[35.565,139.750,.8],[35.550,139.780,.9],
    [35.545,139.790,.85],[35.570,139.745,.7],
    // 江戸川区臨海部（葛西臨海）
    [35.645,139.860,.8],[35.650,139.870,.75],[35.640,139.855,.7],
    // 旧データ含む
    [35.610,139.680,.5],[35.618,139.670,.45],
  ], c:{h:'rgba(0,170,150,.52)',m:'rgba(0,145,130,.38)',l:'rgba(0,200,180,.22)'} },
};

function toggleRisk(type) {
  riskOn[type] = !riskOn[type];
  const fab = document.querySelector('.risk-fab[data-type="' + type + '"]');
  fab.classList.toggle('active', riskOn[type]);
  fab.setAttribute('aria-pressed', riskOn[type]);
  if (riskOn[type]) {
    const rd = RISK[type];
    riskLayers[type] = rd.pts.map(([lat, lng, v]) => {
      const col = v>.75 ? rd.c.h : v>.5 ? rd.c.m : rd.c.l;
      const lv  = v>.75 ? t().riskHigh : v>.5 ? t().riskMid : t().riskLow;
      const c = L.circle([lat,lng],{radius:370+v*280,fillColor:col,fillOpacity:.8,color:'transparent'}).addTo(map);
      c.on('click', () => c.bindPopup('<div class="pop-inner"><div class="pop-title">' + lv + '</div><div class="pop-sub">' + t().risk[type] + ' ' + t().riskArea + '</div></div>').openPopup());
      return c;
    });
  } else {
    (riskLayers[type]||[]).forEach(c => map.removeLayer(c));
    delete riskLayers[type];
  }
}

/* ── Risk Assessment (被害予想) ────────────────────────────── */
function assessLocationRisk(lat, lng) {
  const T = t();
  const results = {};
  for (const [type, data] of Object.entries(RISK)) {
    let maxRisk = 0;
    for (const pt of data.pts) {
      const [plat, plng, v] = pt;
      const d = calcDist(lat, lng, plat, plng);
      const radiusKm = (370 + v * 280) / 1000;
      if (d <= radiusKm * 2) {
        const risk = v * Math.max(0, 1 - d / (radiusKm * 2));
        maxRisk = Math.max(maxRisk, risk);
      }
    }
    if (maxRisk > 0.05) {
      results[type] = {
        level: maxRisk,
        label: maxRisk > 0.6 ? T.riskHigh : maxRisk > 0.3 ? T.riskMid : T.riskLow,
        name: T.risk[type],
      };
    }
  }
  return results;
}

function renderRiskSummary(lat, lng) {
  const risks = assessLocationRisk(lat, lng);
  const el = document.getElementById('risk-summary');
  if (!el) return;
  const T = t();
  if (Object.keys(risks).length === 0) {
    el.innerHTML = '<div class="risk-ok">' + (currentLang === 'ja' ? '✅ この地点で特定されたリスクはありません' : currentLang === 'en' ? '✅ No identified risks at this location' : '✅ 该地点未发现风险') + '</div>';
    el.style.display = 'block';
    return;
  }
  let html = '<div class="risk-summary-title">' + (currentLang === 'ja' ? '⚠ この地点の被害予想' : currentLang === 'en' ? '⚠ Risk Assessment' : '⚠ 该地点受灾预测') + '</div>';
  for (const [type, info] of Object.entries(risks)) {
    const cls = info.level > 0.6 ? 'danger' : info.level > 0.3 ? 'warn' : 'low';
    html += '<div class="risk-badge-row risk-' + cls + '">' +
      '<span class="risk-type-name">' + info.name + '</span>' +
      '<span class="risk-level-badge">' + info.label + '</span>' +
    '</div>';
  }
  el.innerHTML = html;
  el.style.display = 'block';
}

function getRiskBadgesHTML(lat, lng) {
  const risks = assessLocationRisk(lat, lng);
  if (Object.keys(risks).length === 0) return '';
  return Object.entries(risks).map(([type, info]) => {
    const cls = info.level > 0.6 ? 'danger' : info.level > 0.3 ? 'warn' : 'low';
    return '<span class="si-risk si-risk-' + cls + '">' + info.name + '</span>';
  }).join('');
}

function renderResultRisk() {
  const el = document.getElementById('result-risk');
  if (!el || !selectedShelter) return;
  const userRisks = userLatLng ? assessLocationRisk(userLatLng.lat, userLatLng.lng) : {};
  const shelterRisks = assessLocationRisk(selectedShelter.lat, selectedShelter.lng);
  const T = t();

  let html = '<div class="risk-result-title">' + (currentLang === 'ja' ? '🗺 被害予想マップ' : currentLang === 'en' ? '🗺 Damage Forecast' : '🗺 受灾预测') + '</div>';

  if (userLatLng && Object.keys(userRisks).length > 0) {
    html += '<div class="risk-result-section"><div class="risk-result-label">' + (currentLang === 'ja' ? '📍 現在地のリスク' : currentLang === 'en' ? '📍 Your Location Risk' : '📍 当前位置风险') + '</div>';
    for (const [type, info] of Object.entries(userRisks)) {
      const cls = info.level > 0.6 ? 'danger' : info.level > 0.3 ? 'warn' : 'low';
      html += '<div class="risk-badge-row risk-' + cls + '"><span class="risk-type-name">' + info.name + '</span><span class="risk-level-badge">' + info.label + '</span></div>';
    }
    html += '</div>';
  }

  if (Object.keys(shelterRisks).length > 0) {
    html += '<div class="risk-result-section"><div class="risk-result-label">' + (currentLang === 'ja' ? '🏫 避難所周辺のリスク' : currentLang === 'en' ? '🏫 Shelter Area Risk' : '🏫 避难所周围风险') + '</div>';
    for (const [type, info] of Object.entries(shelterRisks)) {
      const cls = info.level > 0.6 ? 'danger' : info.level > 0.3 ? 'warn' : 'low';
      html += '<div class="risk-badge-row risk-' + cls + '"><span class="risk-type-name">' + info.name + '</span><span class="risk-level-badge">' + info.label + '</span></div>';
    }
    html += '</div>';
  }

  if (Object.keys(userRisks).length === 0 && Object.keys(shelterRisks).length === 0) {
    html += '<div class="risk-ok">' + (currentLang === 'ja' ? '✅ 現在地・避難所ともにリスクは低い地域です' : currentLang === 'en' ? '✅ Low risk area for both locations' : '✅ 两地均为低风险区域') + '</div>';
  }

  el.innerHTML = html;
  el.style.display = 'block';
}

/* ── All Shelter Names on Map ─────────────────────────────── */
let allShelterLayerGroup = null;

async function loadAndShowAllShelters() {
  if (!_tokyoShelters || !_tokyoShelters.length) {
    // Try Tokyo CSV first
    try {
      const SHELTER_CSV = 'https://www.opendata.metro.tokyo.lg.jp/soumu/130001_evacuation_center.csv';
      const ac = new AbortController();
      const timer = setTimeout(() => ac.abort(), 15000);
      const res = await fetch(SHELTER_CSV, { signal: ac.signal });
      clearTimeout(timer);
      if (!res.ok) throw new Error('CSV HTTP ' + res.status);
      const buf = await res.arrayBuffer();
      _tokyoShelters = parseTokyoCSV(new TextDecoder('shift-jis').decode(buf));
      console.log('[Shelters] CSV loaded:', _tokyoShelters.length, 'shelters');
    } catch(err) {
      console.warn('[Shelters] CSV failed:', err.message, '- trying Overpass fallback');
      _tokyoShelters = [];
    }
    // Fallback: Overpass API if CSV failed or empty
    if (!_tokyoShelters.length) {
      try {
        const q = `[out:json][timeout:20];node["amenity"="shelter"](35.50,139.05,35.93,139.92);out body;`;
        const res = await fetch('https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(q));
        if (res.ok) {
          const data = await res.json();
          _tokyoShelters = (data.elements || [])
            .filter(e => e.lat && e.lon)
            .map(e => ({ name: e.tags?.['name:ja'] || e.tags?.name || '', lat: e.lat, lng: e.lon, accessible: false }));
          console.log('[Shelters] Overpass loaded:', _tokyoShelters.length, 'shelters');
        }
      } catch(err2) {
        console.warn('[Shelters] Overpass also failed:', err2.message);
        _tokyoShelters = [];
      }
    }
  }
  updateMapShelters();
  map.on('moveend', updateMapShelters);
}

function updateMapShelters() {
  if (allShelterLayerGroup) map.removeLayer(allShelterLayerGroup);
  allShelterLayerGroup = L.layerGroup();
  if (!_tokyoShelters || !_tokyoShelters.length) {
    allShelterLayerGroup.addTo(map);
    return;
  }
  const zoom = map.getZoom();
  const bounds = map.getBounds();
  const visible = _tokyoShelters.filter(s => bounds.contains([s.lat, s.lng]));
  // Limit markers at low zoom to avoid performance issues
  const maxMarkers = zoom < 13 ? 200 : 500;
  const toShow = visible.slice(0, maxMarkers);
  const showLabels = zoom >= 14;
  toShow.forEach(s => {
    const r = zoom >= 15 ? 6 : zoom >= 13 ? 4 : 3;
    const m = L.circleMarker([s.lat, s.lng], {
      radius: r,
      fillColor: '#00A86B',
      fillOpacity: 0.8,
      color: '#fff',
      weight: 1.5,
    });
    if (s.name) {
      m.bindTooltip(s.name, {
        permanent: showLabels,
        direction: 'right',
        offset: [6, 0],
        className: 'shelter-name-label',
      });
    }
    allShelterLayerGroup.addLayer(m);
  });
  allShelterLayerGroup.addTo(map);
}

/* ── Simulation ──────────────────────────────────────────── */
let speed = 'fast', disaster = 'flood';
const SPEEDS  = { fast:5.0, normal:3.5, slow:2.0 };
const METS    = { fast:4.5, normal:3.5, slow:2.5 };
const DLIMITS = { flood:60, quake:30, tsunami:15 };

function pickSpeed(el, s)   { document.querySelectorAll('.speed-card').forEach(c=>c.classList.remove('on')); el.classList.add('on'); speed=s; }
function pickDisaster(el,d) { document.querySelectorAll('.chip').forEach(c=>c.classList.remove('on'));       el.classList.add('on'); disaster=d; }
function goSim() { nav('sim'); }

function calcResult() {
  if (!selectedShelter) { toast(t().toastNoShelter, 3000); nav('map'); return; }
  const dist  = selectedShelter.dist;
  const hrs   = dist / SPEEDS[speed];
  const mins  = Math.round(hrs * 60);
  const cal   = Math.round(METS[speed] * 60 * hrs);
  const steps = Math.round(dist * 1000 / 0.75);
  const limit = DLIMITS[disaster];
  const ratio = mins / limit;
  const T = t();
  const tier = ratio < .6 ? T.safe : ratio < .9 ? T.warn : T.danger;
  const cls  = ratio < .6 ? 'safe' : ratio < .9 ? 'warn' : 'danger';

  document.getElementById('result-hero').className = 'result-hero ' + cls;
  document.getElementById('rh-icon').textContent = tier.icon;
  document.getElementById('rh-time').className = 'rh-time ' + cls;
  document.getElementById('rh-mins').textContent = mins;
  document.getElementById('feed-card').className = 'feed-card ' + cls;
  document.getElementById('feed-card').textContent = tier.feedback;
  document.getElementById('xp-pts').textContent = '+' + tier.xp;
  document.getElementById('r-cal').textContent = cal;
  document.getElementById('r-steps').textContent = steps.toLocaleString();
  document.getElementById('r-dist').textContent = dist < 1 ? (dist*1000).toFixed(0) : dist.toFixed(1);

  const fill = document.getElementById('tl-fill');
  fill.className = 'tl-fill ' + cls;
  fill.style.width = '0%';
  requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.width = Math.min((mins/limit)*100,100) + '%'; }));
  document.getElementById('tl-you').textContent   = tier.icon + ' ' + (currentLang === 'ja' ? 'あなた' : currentLang === 'en' ? 'You' : '您') + ' (' + mins + T.arrivalUnit + ')';
  document.getElementById('tl-limit').textContent = '⚠ ' + (currentLang === 'ja' ? '危険ライン' : currentLang === 'en' ? 'Danger line' : '危险线') + ' (' + limit + T.arrivalUnit + ')';
  document.getElementById('adv-list').innerHTML = tier.advice.map(a =>
    '<div class="adv-item"><span class="adv-icon" aria-hidden="true">' + a.i + '</span><span class="adv-text">' + a.t + '</span></div>'
  ).join('');
  renderResultRisk();
  nav('results');
}

/* ── Share ───────────────────────────────────────────────── */
async function doShare() {
  const mins = document.getElementById('rh-mins').textContent;
  const txt  = t().shareText(mins);
  try {
    if (navigator.share) { await navigator.share({ title: t().appName, text: txt }); return; }
    await navigator.clipboard.writeText(txt);
    toast(t().toastCopied);
  } catch(e) {}
}

/* ── Boot ────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Restore preferences
  const savedLang = localStorage.getItem('bousai_lang') || (navigator.language.startsWith('zh') ? 'zh' : navigator.language.startsWith('en') ? 'en' : 'ja');
  setLang(savedLang);
  applyFontScale(fontScale);
  if (highContrast) document.documentElement.classList.add('high-contrast');

  initMap();

  // PWA shortcut handling
  const params = new URLSearchParams(location.search);
  if (params.get('action') === 'search') setTimeout(() => openLocSearch(), 600);
  else if (params.get('action') === 'sim') setTimeout(() => nav('sim'), 600);

  // Service Worker (GitHub Pages: use relative path)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => {
        reg.addEventListener('updatefound', () => {
          const nw = reg.installing;
          nw.addEventListener('statechange', () => {
            if (nw.state === 'installed' && navigator.serviceWorker.controller) {
              toast(t().toastUpdate, 6000);
            }
          });
        });
      }).catch(() => {});
  }
});

/* ============================================================
   東京防災ナビ — app.js  v3.0.0
   - 東京都オープンデータ避難所CSV連携 (CC BY 4.0)
   - i18n: 日本語 / English / 中文
   - PWA: Service Worker + offline fallback
   - Accessibility: ARIA, high-contrast, font-size control
============================================================ */
const APP_VERSION = '4.0.0';

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
    risk:          { flood:'水害', quake:'倒壊', liq:'液状化', tsunami:'津波', landslide:'土砂災害' },
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
    risk:          { flood:'Flood', quake:'Collapse', liq:'Liquefaction', tsunami:'Tsunami', landslide:'Landslide' },
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
    risk:          { flood:'洪水', quake:'倒塌', liq:'液化', tsunami:'海啸', landslide:'泥石流' },
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

/* ── Emergency Mode (緊急時UI) ────────────────────────────── */
let emergencyMode = false;
function toggleEmergencyMode() {
  emergencyMode = !emergencyMode;
  document.documentElement.classList.toggle('emergency-mode', emergencyMode);
  const btn = document.getElementById('sos-btn');
  btn.setAttribute('aria-pressed', emergencyMode);

  if (emergencyMode) {
    // 大文字、高コントラスト、アニメーション無効化を一括適用
    applyFontScale(1.3);
    // マスクを黒に
    if (window._tokyoMask) window._tokyoMask.setStyle({ fillColor: '#000' });
    toast(currentLang === 'ja' ? '🆘 緊急モード ON — 大きく・見やすく表示中' : '🆘 Emergency Mode ON', 3000);
    // キャッシュから前回の避難所を復元（すぐ使えるように）
    if (!window._foundShelters?.length) {
      try {
        const cached = JSON.parse(localStorage.getItem('bousai_last_shelters') || 'null');
        const cachedPos = JSON.parse(localStorage.getItem('bousai_last_pos') || 'null');
        if (cached?.length && cachedPos) {
          userLatLng = cachedPos;
          placeUser(cachedPos.lat, cachedPos.lng);
          window._foundShelters = cached;
          renderShelterResults(cached);
          toast(currentLang === 'ja' ? '📋 前回の検索結果を表示中' : 'Showing cached results', 3000);
        }
      } catch(e) {}
    }
  } else {
    applyFontScale(1);
    // マスクを元のベージュに戻す
    if (window._tokyoMask) window._tokyoMask.setStyle({ fillColor: '#E8E5DE' });
    toast(currentLang === 'ja' ? '緊急モード OFF' : 'Emergency Mode OFF', 2000);
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

/* ── Settings dropdown ───────────────────────────────────── */
function toggleSettings() {
  const dd = document.getElementById('settings-dropdown');
  const btn = document.getElementById('settings-btn');
  const open = dd.style.display !== 'none';
  dd.style.display = open ? 'none' : 'flex';
  btn.setAttribute('aria-expanded', !open);
}
// Close settings when clicking outside
document.addEventListener('click', e => {
  const dd = document.getElementById('settings-dropdown');
  const btn = document.getElementById('settings-btn');
  if (dd && dd.style.display !== 'none' && !dd.contains(e.target) && !btn.contains(e.target)) {
    dd.style.display = 'none';
    btn.setAttribute('aria-expanded', 'false');
  }
});

/* ── Bottom Sheet (3-stage: peek / half / full) ─────────── */
let sheetState = 'peek'; // 'peek' | 'half' | 'full'
const SHEET_STATES = ['peek', 'half', 'full'];
function setSheetState(state) {
  const sheet = document.getElementById('bottom-sheet');
  sheet.classList.remove('half', 'full');
  if (state === 'half') sheet.classList.add('half');
  if (state === 'full') sheet.classList.add('full');
  sheetState = state;
  sheet.setAttribute('aria-expanded', state !== 'peek');
}
// Touch drag for bottom sheet
(function initSheetDrag() {
  let startY = 0, startH = 0, dragging = false;
  document.addEventListener('DOMContentLoaded', () => {
    const handle = document.getElementById('sheet-handle');
    const sheet = document.getElementById('bottom-sheet');
    if (!handle || !sheet) return;
    handle.addEventListener('touchstart', e => {
      dragging = true;
      startY = e.touches[0].clientY;
      startH = sheet.offsetHeight;
      sheet.style.transition = 'none';
    }, { passive: true });
    handle.addEventListener('touchmove', e => {
      if (!dragging) return;
      const dy = startY - e.touches[0].clientY;
      const newH = Math.max(60, Math.min(window.innerHeight * 0.9, startH + dy));
      sheet.style.height = newH + 'px';
    }, { passive: true });
    handle.addEventListener('touchend', () => {
      if (!dragging) return;
      dragging = false;
      sheet.style.transition = '';
      const h = sheet.offsetHeight;
      const vh = window.innerHeight;
      if (h > vh * 0.65) setSheetState('full');
      else if (h > vh * 0.25) setSheetState('half');
      else setSheetState('peek');
      sheet.style.height = '';
    });
    // Click handle to cycle states
    handle.addEventListener('click', () => {
      const idx = SHEET_STATES.indexOf(sheetState);
      setSheetState(SHEET_STATES[(idx + 1) % 3]);
    });
  });
})();

function switchSheet(id) {
  document.querySelectorAll('.sheet-view').forEach(v => v.classList.remove('active'));
  document.getElementById('sv-' + id).classList.add('active');
}
function closeResults() {
  switchSheet('default');
  setSheetState('peek');
}

/* ── One-tap GPS + Search ───────────────────────────────── */
async function quickSearch() {
  if (userLatLng) {
    searchShelters();
    return;
  }
  toast(t().toastGps);
  if (!navigator.geolocation) { openLocSearch(); return; }
  navigator.geolocation.getCurrentPosition(
    pos => {
      placeUser(pos.coords.latitude, pos.coords.longitude);
      map.setView([pos.coords.latitude, pos.coords.longitude], 15);
      toast(t().toastGpsOk);
      setTimeout(() => searchShelters(), 300);
    },
    () => {
      toast(currentLang === 'ja' ? '📍 GPS取得失敗。手動で場所を設定してください' : 'GPS failed');
      openLocSearch();
    },
    { enableHighAccuracy: true, timeout: 8000 }
  );
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
    maxBounds: TOKYO_BOUNDS.pad(0.08),
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
  // Mask: 東京都外を完全に塗りつぶし
  const worldRect = [[90,-180],[90,180],[-90,180],[-90,-180],[90,-180]];
  const tokyoHole = TOKYO_BORDER.slice().reverse();
  const maskLayer = L.polygon([worldRect, tokyoHole], {
    fillColor: '#E8E5DE', fillOpacity: 1.0, stroke: false, interactive: false,
    className: 'tokyo-mask',
  }).addTo(map);
  window._tokyoMask = maskLayer;
  // Border line around Tokyo
  L.polyline(TOKYO_BORDER, {
    color: '#FF5C00', weight: 2.5, opacity: 0.85, interactive: false,
  }).addTo(map);

  map.on('click', e => {
    userLatLng = { lat: e.latlng.lat, lng: e.latlng.lng };
    placeUser(e.latlng.lat, e.latlng.lng);
    toast(t().toastTap);
  });

  // Keyboard accessibility: Leaflet map ARIA
  map.getContainer().setAttribute('role', 'application');
  map.getContainer().setAttribute('aria-label', currentLang === 'ja' ? 'インタラクティブ防災マップ' : 'Interactive hazard map');

  // ビューポート変更時にリスクレイヤーを再描画（パフォーマンス最適化）
  map.on('moveend', onMapMoveUpdateRisk);

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
  setSheetState('half');
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
  // オフラインキャッシュ: 検索結果をlocalStorageに保存
  try {
    localStorage.setItem('bousai_last_shelters', JSON.stringify(found));
    localStorage.setItem('bousai_last_pos', JSON.stringify(userLatLng));
  } catch(e) {}
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
  setSheetState('half');
}

/* ── Risk Overlays ───────────────────────────────────────── */
const riskLayers = {}, riskOn = {};
const RISK = {
  flood: { pts:[
    // ===== 荒川流域（高危険：足立・葛飾・北・荒川・板橋） =====
    [35.795,139.780,.95],[35.790,139.795,.95],[35.785,139.810,.9],[35.780,139.825,.9],
    [35.775,139.805,.95],[35.770,139.790,.9],[35.765,139.800,.85],[35.760,139.815,.85],
    [35.755,139.775,.85],[35.750,139.790,.8],[35.748,139.810,.85],[35.780,139.830,.8],
    [35.790,139.785,.8],[35.730,139.800,.85],[35.765,139.820,.8],[35.770,139.840,.75],
    [35.770,139.740,.75],[35.775,139.755,.7],[35.780,139.770,.75],[35.760,139.750,.65],
    [35.765,139.730,.6],[35.755,139.760,.65],
    // ===== 隅田川流域（墨田・台東・荒川・中央北部） =====
    [35.730,139.795,.85],[35.725,139.790,.8],[35.720,139.800,.8],[35.715,139.795,.8],
    [35.710,139.800,.85],[35.705,139.795,.75],[35.700,139.790,.7],[35.712,139.810,.75],
    [35.695,139.790,.65],[35.690,139.785,.6],[35.685,139.780,.55],
    // ===== 江東区（ゼロメートル地帯） =====
    [35.680,139.810,.95],[35.675,139.820,.95],[35.670,139.830,.9],[35.665,139.840,.9],
    [35.660,139.825,.9],[35.655,139.815,.85],[35.680,139.800,.85],[35.672,139.817,.9],
    [35.668,139.845,.85],[35.685,139.825,.8],[35.655,139.810,.85],[35.650,139.835,.8],
    [35.690,139.815,.8],[35.695,139.805,.75],
    // ===== 江戸川区（ゼロメートル地帯） =====
    [35.720,139.880,.95],[35.715,139.875,.95],[35.710,139.870,.95],[35.707,139.868,.95],
    [35.700,139.878,.9],[35.695,139.875,.9],[35.690,139.870,.85],[35.685,139.865,.85],
    [35.735,139.870,.85],[35.730,139.878,.85],[35.725,139.885,.8],[35.740,139.880,.8],
    [35.710,139.890,.9],[35.705,139.885,.85],[35.680,139.860,.8],
    // ===== 葛飾区 =====
    [35.755,139.860,.85],[35.750,139.855,.85],[35.745,139.850,.85],[35.740,139.845,.8],
    [35.744,139.847,.85],[35.735,139.840,.8],[35.760,139.865,.75],[35.730,139.855,.75],
    // ===== 足立区（広域） =====
    [35.790,139.800,.85],[35.785,139.795,.8],[35.795,139.815,.8],[35.775,139.820,.75],
    [35.780,139.790,.75],[35.770,139.810,.7],[35.785,139.830,.7],[35.775,139.835,.65],
    // ===== 多摩川流域（大田・世田谷・狛江・調布） =====
    [35.560,139.720,.8],[35.555,139.735,.8],[35.565,139.710,.75],[35.570,139.700,.7],
    [35.575,139.690,.7],[35.580,139.680,.65],[35.555,139.740,.75],[35.590,139.665,.6],
    [35.575,139.710,.7],[35.550,139.750,.75],[35.558,139.728,.7],
    [35.630,139.580,.6],[35.625,139.570,.55],[35.620,139.560,.5],[35.635,139.590,.55],
    // ===== 中川・新中川流域 =====
    [35.730,139.855,.75],[35.745,139.840,.7],[35.715,139.860,.75],[35.725,139.850,.7],
    [35.710,139.855,.7],[35.700,139.858,.65],
    // ===== 神田川・妙正寺川（内水氾濫：中野・杉並・新宿） =====
    [35.705,139.660,.55],[35.700,139.680,.55],[35.698,139.700,.5],[35.700,139.720,.5],
    [35.710,139.640,.5],[35.715,139.660,.45],[35.695,139.740,.45],
    // ===== 石神井川・白子川（内水氾濫：練馬・板橋） =====
    [35.750,139.620,.45],[35.748,139.650,.45],[35.745,139.680,.4],[35.742,139.710,.4],
    // ===== 世田谷・目黒（内水氾濫） =====
    [35.665,139.640,.55],[35.660,139.650,.5],[35.655,139.660,.5],[35.650,139.670,.45],
    [35.645,139.680,.4],[35.640,139.690,.4],
    // ===== 中央区低地 =====
    [35.670,139.775,.6],[35.675,139.780,.55],[35.680,139.770,.5],
    // ===== 渋谷川・古川流域（渋谷・港） =====
    [35.658,139.710,.45],[35.655,139.720,.4],[35.650,139.730,.4],[35.645,139.740,.35],
    // ===== 多摩地域河川 =====
    [35.660,139.330,.5],[35.665,139.340,.45],[35.670,139.320,.5],
    [35.730,139.200,.45],[35.740,139.190,.4],[35.725,139.210,.4],
    [35.660,139.480,.5],[35.655,139.490,.45],[35.650,139.500,.45],
    [35.690,139.410,.45],[35.685,139.420,.4],[35.695,139.400,.4],
    // 小金井・国分寺（野川沿い）
    [35.690,139.510,.4],[35.685,139.520,.35],[35.695,139.500,.35],
  ], c:{h:'rgba(0,110,220,.52)',m:'rgba(0,80,200,.35)',l:'rgba(60,130,220,.22)'} },

  quake: { pts:[
    // ===== 木造密集地域（都指定 不燃化特区等） =====
    // 墨田区（京島・向島）
    [35.715,139.805,.9],[35.718,139.810,.9],[35.712,139.800,.85],[35.720,139.808,.85],
    // 荒川区（荒川・町屋）
    [35.735,139.790,.9],[35.730,139.785,.85],[35.740,139.795,.85],[35.728,139.792,.8],
    // 台東区（根岸・谷中・入谷）
    [35.720,139.780,.8],[35.725,139.775,.8],[35.718,139.785,.75],[35.715,139.778,.75],
    // 品川区（大井・中延・荏原）
    [35.610,139.730,.85],[35.605,139.725,.8],[35.615,139.735,.8],[35.608,139.720,.75],
    [35.600,139.728,.75],[35.612,139.718,.7],
    // 大田区（蒲田・大森・池上）
    [35.575,139.715,.8],[35.570,139.720,.75],[35.580,139.710,.75],[35.565,139.725,.7],
    [35.585,139.705,.7],[35.560,139.718,.65],
    // 杉並区（阿佐ヶ谷・高円寺）
    [35.705,139.635,.8],[35.700,139.640,.8],[35.710,139.630,.75],[35.698,139.645,.75],
    [35.695,139.638,.7],[35.708,139.642,.7],[35.702,139.625,.65],
    // 中野区（中野・野方）
    [35.710,139.660,.8],[35.715,139.655,.75],[35.708,139.665,.75],[35.712,139.650,.7],
    // 豊島区（池袋東・雑司が谷・長崎）
    [35.735,139.720,.8],[35.730,139.715,.75],[35.738,139.725,.75],[35.728,139.710,.7],
    [35.740,139.730,.7],[35.733,139.708,.65],
    // 北区（赤羽・十条・王子）
    [35.760,139.720,.75],[35.755,139.715,.7],[35.765,139.725,.7],[35.750,139.718,.65],
    // 板橋区（大山・板橋本町）
    [35.755,139.700,.7],[35.750,139.695,.65],[35.760,139.705,.65],[35.748,139.690,.6],
    // 新宿区（大久保・百人町）
    [35.705,139.700,.7],[35.710,139.705,.65],[35.700,139.695,.65],[35.708,139.710,.6],
    // 文京区（本郷・根津）
    [35.715,139.760,.65],[35.712,139.755,.6],[35.718,139.765,.6],
    // 足立区（千住・梅島・綾瀬）
    [35.775,139.800,.75],[35.770,139.795,.7],[35.780,139.805,.7],[35.768,139.808,.65],
    [35.785,139.810,.65],[35.772,139.790,.6],[35.778,139.815,.6],
    // 葛飾区（立石・四ツ木・堀切）
    [35.745,139.850,.65],[35.740,139.845,.6],[35.750,139.855,.6],[35.748,139.840,.55],
    // 世田谷区（下北沢・太子堂・三軒茶屋）
    [35.660,139.665,.6],[35.655,139.670,.55],[35.663,139.660,.55],[35.658,139.675,.5],
    // 目黒区（中目黒・祐天寺）
    [35.640,139.695,.55],[35.635,139.700,.5],[35.645,139.690,.5],
    // 渋谷区（笹塚・幡ヶ谷）
    [35.668,139.688,.5],[35.670,139.695,.5],[35.665,139.682,.45],
    // 練馬区（江古田・小竹向原）
    [35.740,139.670,.55],[35.735,139.665,.5],[35.745,139.675,.5],
    // 江東区（北部旧市街）
    [35.690,139.815,.6],[35.685,139.810,.55],[35.695,139.820,.55],
    // 江戸川区（小岩・平井）
    [35.730,139.870,.5],[35.725,139.865,.5],[35.720,139.860,.45],
    // 千代田区（神田）
    [35.695,139.770,.4],[35.698,139.775,.35],
    // ===== 多摩地域 =====
    [35.655,139.330,.55],[35.660,139.325,.5],[35.650,139.335,.5],
    [35.700,139.410,.5],[35.695,139.415,.45],
    [35.705,139.560,.45],[35.700,139.565,.4],[35.710,139.555,.4],
    [35.670,139.480,.45],[35.665,139.490,.4],[35.675,139.475,.4],
    [35.545,139.440,.5],[35.540,139.445,.45],[35.550,139.435,.45],
    // 東村山・小平
    [35.760,139.470,.4],[35.755,139.480,.35],
    // 西東京・東久留米
    [35.745,139.540,.4],[35.740,139.550,.35],
  ], c:{h:'rgba(210,43,43,.52)',m:'rgba(240,100,0,.38)',l:'rgba(245,166,35,.28)'} },

  liq: { pts:[
    // ===== 江東区（大規模埋立地） =====
    [35.650,139.790,.95],[35.645,139.800,.95],[35.640,139.810,.95],[35.635,139.820,.95],
    [35.655,139.810,.9],[35.648,139.830,.9],[35.660,139.785,.9],[35.638,139.795,.9],
    [35.630,139.805,.85],[35.652,139.825,.85],[35.643,139.815,.9],[35.658,139.795,.85],
    [35.662,139.805,.85],[35.668,139.815,.8],[35.675,139.810,.75],
    [35.640,139.785,.95],[35.635,139.795,.9],[35.638,139.805,.9],[35.632,139.810,.85],
    // ===== 中央区（月島・晴海・勝どき・築地） =====
    [35.660,139.775,.9],[35.665,139.780,.85],[35.658,139.770,.85],[35.662,139.785,.8],
    [35.670,139.775,.75],[35.655,139.765,.75],[35.668,139.782,.8],
    [35.665,139.768,.7],[35.670,139.770,.65],
    // ===== 港区（台場・芝浦・竹芝・汐留） =====
    [35.635,139.760,.85],[35.630,139.770,.85],[35.640,139.755,.8],[35.625,139.765,.8],
    [35.638,139.750,.75],[35.628,139.758,.75],[35.645,139.760,.7],
    [35.655,139.758,.7],[35.650,139.762,.65],
    // ===== 品川区（天王洲・東品川・八潮） =====
    [35.620,139.750,.8],[35.615,139.755,.75],[35.618,139.745,.75],[35.625,139.748,.7],
    [35.610,139.752,.7],[35.622,139.758,.65],
    // ===== 大田区（湾岸・羽田） =====
    [35.570,139.755,.8],[35.565,139.765,.8],[35.575,139.750,.75],[35.560,139.770,.75],
    [35.555,139.775,.8],[35.550,139.780,.85],[35.545,139.785,.8],
    [35.558,139.760,.7],[35.562,139.745,.65],
    // ===== 江戸川区（臨海・葛西） =====
    [35.660,139.860,.85],[35.655,139.870,.85],[35.650,139.865,.8],[35.645,139.875,.8],
    [35.640,139.880,.75],[35.658,139.855,.75],[35.665,139.862,.7],
    // ===== 墨田区・江東区北部（旧河道） =====
    [35.700,139.810,.7],[35.695,139.815,.7],[35.690,139.808,.65],[35.705,139.820,.65],
    [35.685,139.805,.6],[35.710,139.815,.6],
    // ===== 足立区（荒川沿い低地） =====
    [35.775,139.810,.65],[35.780,139.800,.6],[35.770,139.815,.6],[35.785,139.808,.55],
    // ===== 葛飾区（低地） =====
    [35.750,139.855,.6],[35.745,139.850,.55],[35.740,139.845,.55],
    // ===== 荒川区・台東区（旧河道） =====
    [35.738,139.790,.55],[35.735,139.795,.5],[35.715,139.785,.5],[35.712,139.790,.45],
    // ===== 多摩地域 =====
    [35.710,139.405,.4],[35.705,139.410,.35],
    [35.660,139.485,.45],[35.655,139.490,.4],
  ], c:{h:'rgba(200,150,0,.55)',m:'rgba(220,180,0,.4)',l:'rgba(240,210,0,.28)'} },

  tsunami: { pts:[
    // ===== 江東区臨海部 =====
    [35.645,139.790,.95],[35.640,139.800,.95],[35.635,139.810,.9],[35.650,139.795,.9],
    [35.638,139.820,.9],[35.632,139.815,.85],[35.648,139.825,.85],[35.630,139.805,.85],
    [35.655,139.800,.8],[35.628,139.795,.8],[35.643,139.830,.8],
    // ===== 中央区臨海部 =====
    [35.660,139.775,.85],[35.655,139.780,.8],[35.665,139.770,.8],[35.658,139.785,.75],
    [35.670,139.775,.7],[35.662,139.768,.7],
    // ===== 港区臨海部 =====
    [35.635,139.760,.9],[35.630,139.770,.85],[35.625,139.765,.85],[35.640,139.755,.8],
    [35.620,139.758,.8],[35.645,139.762,.75],[35.638,139.750,.75],
    [35.650,139.758,.65],[35.655,139.755,.6],
    // ===== 品川区臨海部 =====
    [35.618,139.750,.8],[35.612,139.748,.75],[35.622,139.755,.75],[35.608,139.745,.7],
    [35.615,139.740,.7],[35.625,139.752,.65],
    // ===== 大田区臨海部（羽田・城南島） =====
    [35.560,139.760,.95],[35.555,139.770,.95],[35.550,139.780,.95],[35.545,139.790,.9],
    [35.565,139.755,.9],[35.540,139.785,.9],[35.570,139.748,.85],[35.558,139.765,.85],
    [35.548,139.775,.85],[35.575,139.740,.7],
    // ===== 江戸川区臨海部 =====
    [35.650,139.860,.85],[35.645,139.870,.85],[35.640,139.875,.8],[35.655,139.855,.8],
    [35.648,139.865,.8],[35.638,139.862,.75],[35.660,139.858,.7],
    // ===== 河口遡上 =====
    [35.670,139.785,.6],[35.680,139.790,.5],[35.690,139.795,.4],[35.700,139.798,.3],
  ], c:{h:'rgba(0,170,150,.52)',m:'rgba(0,145,130,.38)',l:'rgba(0,200,180,.22)'} },

  landslide: { pts:[
    // ===== 奥多摩町 =====
    [35.830,139.080,.95],[35.840,139.090,.95],[35.850,139.095,.9],[35.820,139.075,.9],
    [35.835,139.070,.9],[35.845,139.085,.85],[35.825,139.095,.85],[35.815,139.100,.85],
    [35.855,139.100,.85],[35.810,139.095,.8],
    // ===== 檜原村 =====
    [35.735,139.150,.9],[35.730,139.140,.9],[35.740,139.160,.85],[35.725,139.130,.85],
    [35.745,139.170,.85],[35.720,139.145,.8],
    // ===== 青梅市 =====
    [35.800,139.260,.8],[35.795,139.250,.8],[35.805,139.270,.75],[35.790,139.240,.75],
    [35.810,139.280,.7],[35.785,139.255,.7],
    // ===== あきる野市・日の出町 =====
    [35.740,139.180,.8],[35.745,139.190,.75],[35.735,139.175,.75],[35.750,139.200,.7],
    [35.780,139.300,.65],[35.775,139.310,.6],[35.770,139.320,.6],
    // ===== 八王子市 =====
    [35.680,139.250,.8],[35.675,139.240,.8],[35.685,139.260,.75],[35.670,139.235,.75],
    [35.690,139.270,.7],[35.665,139.245,.7],[35.660,139.310,.7],[35.655,139.300,.65],
    [35.625,139.340,.65],[35.620,139.350,.6],[35.630,139.330,.6],
    // ===== 町田市 =====
    [35.580,139.440,.7],[35.575,139.430,.65],[35.570,139.420,.65],[35.565,139.410,.6],
    [35.560,139.400,.65],[35.555,139.390,.6],[35.540,139.380,.65],[35.550,139.395,.6],
    [35.585,139.450,.55],[35.545,139.385,.55],
    // ===== 多摩市・稲城市 =====
    [35.630,139.440,.6],[35.625,139.450,.55],[35.635,139.435,.55],[35.620,139.460,.5],
    // ===== 日野市 =====
    [35.670,139.400,.55],[35.665,139.410,.5],[35.675,139.395,.5],
    // ===== 西多摩（山間部） =====
    [35.810,139.150,.75],[35.800,139.170,.7],[35.790,139.190,.65],
    [35.770,139.220,.6],[35.760,139.240,.55],
    // ===== 23区内急傾斜地 =====
    // 世田谷区（国分寺崖線）
    [35.645,139.620,.55],[35.640,139.615,.55],[35.635,139.610,.5],[35.650,139.625,.5],
    [35.630,139.605,.5],[35.625,139.600,.45],
    // 北区（赤羽台・飛鳥山）
    [35.760,139.720,.55],[35.755,139.715,.5],[35.765,139.725,.5],[35.758,139.710,.45],
    // 板橋区
    [35.755,139.695,.5],[35.750,139.700,.45],[35.748,139.690,.45],
    // 文京区（本郷台地）
    [35.712,139.758,.45],[35.715,139.755,.4],[35.710,139.762,.4],
    // 港区（麻布・六本木）
    [35.660,139.730,.45],[35.655,139.725,.4],[35.658,139.735,.4],
    // 渋谷区（代官山・松濤）
    [35.655,139.698,.4],[35.650,139.695,.4],[35.660,139.702,.35],
    // 新宿区（四谷・市谷）
    [35.690,139.728,.4],[35.688,139.725,.35],
    // 目黒区
    [35.635,139.715,.4],[35.638,139.710,.35],
    // 練馬区・杉並区（善福寺川沿い）
    [35.720,139.610,.4],[35.715,139.615,.35],[35.725,139.605,.35],
  ], c:{h:'rgba(139,90,43,.55)',m:'rgba(160,120,60,.4)',l:'rgba(180,150,90,.25)'} },
};

/* ── Realtime Disaster Info (気象庁 + P2P地震) ──────────── */
let realtimeAlerts = [];
let realtimeQuakes = [];
let lastRealtimeUpdate = null;   // 最終更新時刻
let realtimeFetchErrors = 0;     // 連続エラー回数
let isOnline = navigator.onLine; // ネットワーク状態
const TOKYO_AREA_CODE = '130000'; // 東京都

// ── オフライン検知 ──
window.addEventListener('online',  () => { isOnline = true;  toast('📶 ネットワーク復帰 — データを更新します'); fetchRealtimeDisasterInfo(); });
window.addEventListener('offline', () => { isOnline = false; toast('📵 オフラインです — キャッシュ済みデータで表示中', 5000); renderRealtimeAlertBanner(); });

// ── リトライ付きfetch ──
async function fetchWithRetry(url, retries = 2, timeout = 8000) {
  for (let i = 0; i <= retries; i++) {
    try {
      const ctrl = new AbortController();
      const tid = setTimeout(() => ctrl.abort(), timeout);
      const res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(tid);
      if (res.ok) return res;
      if (res.status >= 500 && i < retries) { await new Promise(r => setTimeout(r, 1000 * (i + 1))); continue; }
      return res;
    } catch(e) {
      if (i < retries && e.name !== 'AbortError') { await new Promise(r => setTimeout(r, 1000 * (i + 1))); continue; }
      throw e;
    }
  }
}

async function fetchRealtimeDisasterInfo() {
  let anySuccess = false;

  // ① 気象庁 警報・注意報
  try {
    const res = await fetchWithRetry('https://www.jma.go.jp/bosai/warning/data/warning/' + TOKYO_AREA_CODE + '.json');
    if (res.ok) {
      const data = await res.json();
      realtimeAlerts = parseJmaWarnings(data);
      anySuccess = true;
      console.log('[Realtime] JMA warnings:', realtimeAlerts.length);
    }
  } catch(e) { console.warn('[Realtime] JMA failed:', e.message); }

  // ② P2P地震情報（直近5件）
  try {
    const res = await fetchWithRetry('https://api.p2pquake.net/v2/history?codes=551&limit=5');
    if (res.ok) {
      const data = await res.json();
      realtimeQuakes = parseP2pQuakes(data);
      anySuccess = true;
      console.log('[Realtime] P2P quakes:', realtimeQuakes.length);
    }
  } catch(e) { console.warn('[Realtime] P2P failed:', e.message); }

  // ③ 気象庁 天気予報（雨量推定）
  await fetchRainfallData();

  // 更新時刻を記録
  if (anySuccess) {
    lastRealtimeUpdate = new Date();
    realtimeFetchErrors = 0;
    // オフラインキャッシュ
    try {
      localStorage.setItem('bousai_alerts', JSON.stringify({ alerts: realtimeAlerts, quakes: realtimeQuakes, rain: currentRainLevel, ts: Date.now() }));
    } catch(e) {}
  } else { realtimeFetchErrors++; }

  // リスクレベルを動的に調整
  applyRealtimeRiskBoost();
  // UI更新
  renderRealtimeAlertBanner();
}

function parseJmaWarnings(data) {
  const alerts = [];
  const warnTypes = {
    '大雨': { risk: 'flood', boost: 0.3, level: 'warn' },
    '洪水': { risk: 'flood', boost: 0.4, level: 'warn' },
    '暴風': { risk: 'quake', boost: 0.1, level: 'warn' },
    '波浪': { risk: 'tsunami', boost: 0.2, level: 'warn' },
    '高潮': { risk: 'tsunami', boost: 0.3, level: 'warn' },
    '土砂災害': { risk: 'landslide', boost: 0.4, level: 'danger' },
  };
  const specialWarn = {
    '大雨特別警報': { risk: 'flood', boost: 0.5, level: 'danger' },
    '大雨警報': { risk: 'flood', boost: 0.3, level: 'danger' },
    '洪水警報': { risk: 'flood', boost: 0.4, level: 'danger' },
    '土砂災害警戒情報': { risk: 'landslide', boost: 0.5, level: 'danger' },
    '暴風警報': { risk: 'quake', boost: 0.15, level: 'warn' },
    '高潮警報': { risk: 'tsunami', boost: 0.35, level: 'danger' },
    '津波注意報': { risk: 'tsunami', boost: 0.4, level: 'danger' },
    '津波警報': { risk: 'tsunami', boost: 0.5, level: 'danger' },
  };

  try {
    const areaTypes = data.areaTypes || [];
    for (const areaType of areaTypes) {
      for (const area of (areaType.areas || [])) {
        for (const warning of (area.warnings || [])) {
          const status = warning.status;
          if (status === '発表' || status === '継続') {
            const code = warning.code;
            const name = warning.name || '';
            // Check special warnings first
            for (const [key, info] of Object.entries(specialWarn)) {
              if (name.includes(key)) {
                alerts.push({ type: info.risk, name: key, boost: info.boost, level: info.level, area: area.name });
                break;
              }
            }
            // Then check general warning types
            for (const [key, info] of Object.entries(warnTypes)) {
              if (name.includes(key) && !alerts.some(a => a.name.includes(key) && a.area === area.name)) {
                alerts.push({ type: info.risk, name: key + '注意報', boost: info.boost, level: info.level, area: area.name });
              }
            }
          }
        }
      }
    }
  } catch(e) { console.warn('[JMA Parse]', e.message); }
  return alerts;
}

function parseP2pQuakes(data) {
  const quakes = [];
  const now = Date.now();
  for (const q of data) {
    if (!q.earthquake) continue;
    const time = new Date(q.earthquake.time).getTime();
    const hoursAgo = (now - time) / 3600000;
    if (hoursAgo > 24) continue; // 24時間以内のみ
    const mag = q.earthquake.hypocenter?.magnitude || 0;
    const depth = q.earthquake.hypocenter?.depth || 0;
    const maxScale = q.earthquake.maxScale || 0;
    // 東京に影響があるか（震度1以上の報告があるエリアをチェック）
    let tokyoAffected = false;
    let tokyoIntensity = 0;
    for (const point of (q.points || [])) {
      if (point.pref === '東京都') {
        tokyoAffected = true;
        tokyoIntensity = Math.max(tokyoIntensity, point.scale || 0);
      }
    }
    if (tokyoAffected || mag >= 5) {
      quakes.push({
        time: q.earthquake.time,
        mag,
        depth,
        maxScale,
        tokyoIntensity,
        hoursAgo: Math.round(hoursAgo * 10) / 10,
        place: q.earthquake.hypocenter?.name || '不明',
      });
    }
  }
  return quakes;
}

// リスクデータのベースラインを保持
let _baseRiskPts = null;
function applyRealtimeRiskBoost() {
  // ベースラインを保存（初回のみ）
  if (!_baseRiskPts) {
    _baseRiskPts = {};
    for (const [type, data] of Object.entries(RISK)) {
      _baseRiskPts[type] = data.pts.map(p => [...p]);
    }
  }
  // ベースラインに戻す
  for (const [type, data] of Object.entries(RISK)) {
    if (_baseRiskPts[type]) {
      data.pts = _baseRiskPts[type].map(p => [...p]);
    }
  }

  // 警報によるブースト
  for (const alert of realtimeAlerts) {
    if (RISK[alert.type]) {
      RISK[alert.type].pts = RISK[alert.type].pts.map(([lat, lng, v]) =>
        [lat, lng, Math.min(1.0, v + alert.boost)]
      );
    }
  }

  // 地震によるブースト
  for (const q of realtimeQuakes) {
    if (q.tokyoIntensity >= 10) { // 震度1以上
      const boost = Math.min(0.3, q.tokyoIntensity * 0.03);
      const freshness = Math.max(0.2, 1 - q.hoursAgo / 24); // 新しいほど影響大
      RISK.quake.pts = RISK.quake.pts.map(([lat, lng, v]) =>
        [lat, lng, Math.min(1.0, v + boost * freshness)]
      );
      // 地震後は液状化リスクも上がる
      RISK.liq.pts = RISK.liq.pts.map(([lat, lng, v]) =>
        [lat, lng, Math.min(1.0, v + boost * freshness * 0.5)]
      );
    }
  }

  // アクティブなオーバーレイを再描画
  for (const [type, on] of Object.entries(riskOn)) {
    if (on) renderRiskForViewport(type);
  }
}

function renderRealtimeAlertBanner() {
  let banner = document.getElementById('realtime-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'realtime-banner';
    const sheet = document.getElementById('bottom-sheet');
    const riskChips = document.getElementById('risk-chips');
    if (riskChips) riskChips.after(banner);
    else if (sheet) sheet.prepend(banner);
  }

  const T = t();
  const items = [];

  // 警報情報
  if (realtimeAlerts.length > 0) {
    const grouped = {};
    for (const a of realtimeAlerts) {
      if (!grouped[a.name]) grouped[a.name] = [];
      grouped[a.name].push(a.area);
    }
    for (const [name, areas] of Object.entries(grouped)) {
      const level = realtimeAlerts.find(a => a.name === name)?.level;
      const icon = level === 'danger' ? '🔴' : '🟡';
      items.push('<div class="alert-item alert-' + level + '">' + icon + ' ' + name + '</div>');
    }
  }

  // 地震情報
  for (const q of realtimeQuakes) {
    const scaleText = q.tokyoIntensity >= 10
      ? (currentLang === 'ja' ? '東京 震度' + Math.floor(q.tokyoIntensity / 10) : 'Tokyo Int.' + Math.floor(q.tokyoIntensity / 10))
      : '';
    const timeText = q.hoursAgo < 1
      ? (currentLang === 'ja' ? Math.round(q.hoursAgo * 60) + '分前' : Math.round(q.hoursAgo * 60) + 'min ago')
      : (currentLang === 'ja' ? Math.round(q.hoursAgo) + '時間前' : Math.round(q.hoursAgo) + 'h ago');
    items.push('<div class="alert-item alert-quake">🫨 M' + q.mag + ' ' + q.place + ' ' + scaleText + ' <small>' + timeText + '</small></div>');
  }

  // 最終更新時刻 + オフライン表示
  let statusLine = '';
  if (!isOnline) {
    statusLine = '<div class="alert-status offline">📵 ' + (currentLang === 'ja' ? 'オフライン — キャッシュデータ' : 'Offline — cached data') + '</div>';
  } else if (lastRealtimeUpdate) {
    const hh = String(lastRealtimeUpdate.getHours()).padStart(2,'0');
    const mm = String(lastRealtimeUpdate.getMinutes()).padStart(2,'0');
    const updLabel = currentLang === 'ja' ? '最終更新 ' + hh + ':' + mm : 'Updated ' + hh + ':' + mm;
    statusLine = '<div class="alert-status">' + updLabel + (realtimeFetchErrors > 0 ? ' ⚠' : '') + '</div>';
  }

  if (items.length === 0) {
    const safeMsg = currentLang === 'ja' ? '✅ 現在、東京都に警報・注意報は出ていません'
      : currentLang === 'en' ? '✅ No active warnings for Tokyo'
      : '✅ 东京都目前没有警报';
    banner.innerHTML = '<div class="alert-safe">' + safeMsg + '</div>' + statusLine;
  } else {
    banner.innerHTML = '<div class="alert-header">' + (currentLang === 'ja' ? '⚡ リアルタイム災害情報' : currentLang === 'en' ? '⚡ Live Disaster Info' : '⚡ 实时灾害信息') + '</div>' + items.join('') + statusLine;
  }
  banner.style.display = 'block';
}

/* ── Tokyo River Data (河川氾濫エリア) ───────────────────── */
const TOKYO_RIVERS = [
  { name:'荒川', dangerLevel:'high',
    // 荒川の流路（北区→足立→葛飾→江東→東京湾）
    path:[[35.800,139.720],[35.795,139.740],[35.785,139.760],[35.778,139.785],[35.770,139.800],
          [35.755,139.815],[35.740,139.830],[35.720,139.840],[35.700,139.850],[35.680,139.855],
          [35.660,139.845],[35.640,139.830],[35.625,139.810]],
    // 浸水想定エリア（河川両岸の低地）
    floodZone:[
      // 足立区（荒川西岸）
      {lat:35.780,lng:139.795,r:800,depth:3.0},{lat:35.770,lng:139.785,r:700,depth:2.5},
      {lat:35.790,lng:139.780,r:600,depth:2.0},
      // 北区・荒川区
      {lat:35.755,lng:139.775,r:600,depth:2.0},{lat:35.745,lng:139.790,r:700,depth:2.5},
      // 葛飾区
      {lat:35.750,lng:139.850,r:900,depth:3.5},{lat:35.740,lng:139.840,r:800,depth:3.0},
      {lat:35.760,lng:139.860,r:700,depth:2.5},
      // 江東区（ゼロメートル地帯）
      {lat:35.670,lng:139.820,r:1000,depth:4.0},{lat:35.680,lng:139.835,r:900,depth:3.5},
      {lat:35.660,lng:139.810,r:800,depth:3.0},{lat:35.655,lng:139.840,r:700,depth:2.5},
      // 江戸川区
      {lat:35.710,lng:139.875,r:1000,depth:4.5},{lat:35.700,lng:139.880,r:900,depth:4.0},
      {lat:35.720,lng:139.885,r:800,depth:3.5},{lat:35.690,lng:139.870,r:700,depth:3.0},
    ]
  },
  { name:'多摩川', dangerLevel:'mid',
    path:[[35.630,139.300],[35.620,139.400],[35.595,139.500],[35.575,139.600],
          [35.565,139.680],[35.558,139.720],[35.555,139.750],[35.550,139.775]],
    floodZone:[
      // 世田谷区（多摩川沿い）
      {lat:35.580,lng:139.660,r:500,depth:1.5},{lat:35.575,lng:139.680,r:500,depth:2.0},
      {lat:35.570,lng:139.700,r:600,depth:2.0},
      // 大田区
      {lat:35.565,lng:139.720,r:600,depth:2.5},{lat:35.558,lng:139.740,r:700,depth:2.5},
      {lat:35.555,lng:139.760,r:600,depth:2.0},
    ]
  },
  { name:'隅田川', dangerLevel:'mid',
    path:[[35.770,139.740],[35.755,139.755],[35.740,139.770],[35.725,139.785],
          [35.710,139.795],[35.695,139.790],[35.680,139.785],[35.665,139.780]],
    floodZone:[
      {lat:35.720,lng:139.800,r:500,depth:2.0},{lat:35.710,lng:139.795,r:500,depth:2.0},
      {lat:35.700,lng:139.790,r:400,depth:1.5},{lat:35.730,lng:139.790,r:400,depth:1.5},
    ]
  },
  { name:'神田川', dangerLevel:'low',
    path:[[35.700,139.600],[35.705,139.650],[35.700,139.700],[35.695,139.750],[35.690,139.770]],
    floodZone:[
      {lat:35.705,lng:139.640,r:300,depth:1.0},{lat:35.700,lng:139.680,r:300,depth:1.0},
      {lat:35.698,lng:139.720,r:300,depth:1.2},
    ]
  },
  { name:'中川・新中川', dangerLevel:'high',
    path:[[35.780,139.850],[35.760,139.855],[35.740,139.850],[35.720,139.855],
          [35.700,139.860],[35.680,139.855],[35.660,139.850]],
    floodZone:[
      {lat:35.750,lng:139.850,r:700,depth:3.0},{lat:35.730,lng:139.855,r:600,depth:2.5},
      {lat:35.710,lng:139.860,r:700,depth:3.0},{lat:35.690,lng:139.855,r:600,depth:2.5},
    ]
  },
  { name:'江戸川', dangerLevel:'high',
    path:[[35.790,139.890],[35.770,139.885],[35.750,139.880],[35.730,139.878],
          [35.710,139.875],[35.690,139.870],[35.670,139.865]],
    floodZone:[
      {lat:35.760,lng:139.885,r:700,depth:3.0},{lat:35.740,lng:139.880,r:800,depth:3.5},
      {lat:35.720,lng:139.878,r:900,depth:4.0},{lat:35.700,lng:139.875,r:800,depth:3.5},
    ]
  },
  { name:'石神井川', dangerLevel:'low',
    path:[[35.755,139.600],[35.750,139.640],[35.745,139.680],[35.740,139.720],[35.738,139.740]],
    floodZone:[
      {lat:35.752,lng:139.620,r:250,depth:0.8},{lat:35.748,lng:139.660,r:250,depth:0.8},
    ]
  },
];

let riverLayerGroup = null;

// ビューポート内のポイントのみ描画（パフォーマンス最適化）
function renderRiskForViewport(type) {
  const rd = RISK[type];
  const bounds = map.getBounds();
  const pad = 0.02; // 少し余裕を持たせる
  const n = bounds.getNorth() + pad, s = bounds.getSouth() - pad;
  const e = bounds.getEast() + pad, w = bounds.getWest() - pad;

  // 既存レイヤーを削除
  (riskLayers[type] || []).forEach(c => map.removeLayer(c));

  riskLayers[type] = rd.pts
    .filter(([lat, lng]) => lat >= s && lat <= n && lng >= w && lng <= e)
    .map(([lat, lng, v]) => {
      const col = v>.75 ? rd.c.h : v>.5 ? rd.c.m : rd.c.l;
      const lv  = v>.75 ? t().riskHigh : v>.5 ? t().riskMid : t().riskLow;
      const c = L.circle([lat,lng],{radius:370+v*280,fillColor:col,fillOpacity:.8,color:'transparent'}).addTo(map);
      c.on('click', () => c.bindPopup('<div class="pop-inner"><div class="pop-title">' + lv + '</div><div class="pop-sub">' + t().risk[type] + ' ' + t().riskArea + '</div></div>').openPopup());
      return c;
    });
}

// moveend時にアクティブなリスクレイヤーを再描画
let _riskMoveTimer = null;
function onMapMoveUpdateRisk() {
  clearTimeout(_riskMoveTimer);
  _riskMoveTimer = setTimeout(() => {
    for (const [type, on] of Object.entries(riskOn)) {
      if (on) renderRiskForViewport(type);
    }
  }, 200);
}

function toggleRisk(type) {
  riskOn[type] = !riskOn[type];
  const chip = document.querySelector('.risk-chip[data-type="' + type + '"]');
  if (chip) {
    chip.classList.toggle('active', riskOn[type]);
    chip.setAttribute('aria-pressed', riskOn[type]);
  }
  if (riskOn[type]) {
    renderRiskForViewport(type);
    // floodの場合、河川ライン＋浸水想定も表示
    if (type === 'flood') showRiverOverlay();
  } else {
    (riskLayers[type]||[]).forEach(c => map.removeLayer(c));
    delete riskLayers[type];
    if (type === 'flood') hideRiverOverlay();
  }
  updateMapLegend();
}

function showRiverOverlay() {
  hideRiverOverlay();
  riverLayerGroup = L.layerGroup();
  const rainBoost = currentRainLevel; // 0〜1 (雨量による倍率)

  TOKYO_RIVERS.forEach(river => {
    // 河川ライン
    const baseWidth = river.dangerLevel === 'high' ? 4 : river.dangerLevel === 'mid' ? 3 : 2;
    const lineColor = river.dangerLevel === 'high' ? '#0055CC' : river.dangerLevel === 'mid' ? '#2277DD' : '#4499EE';
    const line = L.polyline(river.path, {
      color: lineColor, weight: baseWidth + rainBoost * 3, opacity: 0.7,
      dashArray: rainBoost > 0.3 ? null : '8,4', // 雨が強いと実線に
      interactive: true,
    });
    line.bindPopup('<div class="pop-inner"><div class="pop-title">🏞 ' + river.name + '</div><div class="pop-sub">'
      + (currentLang === 'ja' ? '氾濫危険度: ' : 'Flood risk: ')
      + (river.dangerLevel === 'high' ? t().riskHigh : river.dangerLevel === 'mid' ? t().riskMid : t().riskLow)
      + (rainBoost > 0.3 ? '<br>' + (currentLang === 'ja' ? '⚠ 雨量により水位上昇中' : '⚠ Water level rising') : '')
      + '</div></div>');
    riverLayerGroup.addLayer(line);

    // 浸水想定エリア
    river.floodZone.forEach(zone => {
      const depthFactor = Math.min(1, zone.depth / 5);
      const radius = zone.r * (1 + rainBoost * 0.5);
      const opacity = 0.15 + depthFactor * 0.2 + rainBoost * 0.15;
      const circle = L.circle([zone.lat, zone.lng], {
        radius,
        fillColor: depthFactor > 0.6 ? '#0044AA' : depthFactor > 0.3 ? '#2266CC' : '#4488DD',
        fillOpacity: opacity,
        color: 'transparent',
        interactive: true,
      });
      const depthText = currentLang === 'ja' ? '想定浸水深: ' + zone.depth + 'm' : 'Est. depth: ' + zone.depth + 'm';
      circle.bindPopup('<div class="pop-inner"><div class="pop-title">💧 '
        + (currentLang === 'ja' ? '浸水想定エリア' : 'Flood Zone')
        + '</div><div class="pop-sub">' + river.name + '<br>' + depthText + '</div></div>');
      riverLayerGroup.addLayer(circle);
    });
  });
  riverLayerGroup.addTo(map);
}

function hideRiverOverlay() {
  if (riverLayerGroup) {
    map.removeLayer(riverLayerGroup);
    riverLayerGroup = null;
  }
}

/* ── Rainfall data (雨量データ) ──────────────────────────── */
let currentRainLevel = 0; // 0=晴れ 〜 1=豪雨
async function fetchRainfallData() {
  try {
    // 気象庁 天気予報API（東京: 130000）
    const res = await fetch('https://www.jma.go.jp/bosai/forecast/data/forecast/130000.json');
    if (!res.ok) return;
    const data = await res.json();
    // 直近の天気コードから雨量を推定
    const area = data[0]?.timeSeries?.[0]?.areas?.[0];
    if (!area) return;
    const weatherCodes = area.weatherCodes || [];
    const code = weatherCodes[0] || '100';
    // 天気コード判定 (200番台=曇り, 300番台=雨, 400番台=雪)
    const codeNum = parseInt(code);
    if (codeNum >= 300 && codeNum < 400) {
      // 雨系
      if (codeNum >= 350) currentRainLevel = 0.8; // 大雨
      else if (codeNum >= 330) currentRainLevel = 0.6; // 雨時々止む
      else if (codeNum >= 313) currentRainLevel = 0.5; // 雨後曇
      else if (codeNum >= 300) currentRainLevel = 0.4; // 雨
      else currentRainLevel = 0.3;
    } else if (codeNum >= 200 && codeNum < 300) {
      // 曇り系（雨の可能性）
      if (codeNum >= 218) currentRainLevel = 0.2; // 曇り時々雨
      else currentRainLevel = 0.05;
    } else {
      currentRainLevel = 0;
    }

    // 警報が出ている場合はさらにブースト
    if (realtimeAlerts.some(a => a.name.includes('大雨') || a.name.includes('洪水'))) {
      currentRainLevel = Math.min(1.0, currentRainLevel + 0.3);
    }

    console.log('[Rain] Level:', currentRainLevel, 'code:', code);

    // 雨量によるfloodリスクの動的調整
    if (currentRainLevel > 0.2 && _baseRiskPts?.flood) {
      RISK.flood.pts = _baseRiskPts.flood.map(([lat, lng, v]) =>
        [lat, lng, Math.min(1.0, v + currentRainLevel * 0.3)]
      );
      // landslideも雨で上がる
      if (_baseRiskPts.landslide) {
        RISK.landslide.pts = _baseRiskPts.landslide.map(([lat, lng, v]) =>
          [lat, lng, Math.min(1.0, v + currentRainLevel * 0.4)]
        );
      }
    }

    // 表示中のfloodオーバーレイを更新
    if (riskOn.flood) {
      renderRiskForViewport('flood');
      showRiverOverlay();
    }

    // アラートバナーに雨量情報追加
    updateRainBanner();
  } catch(e) { console.warn('[Rain]', e.message); }
}

function updateRainBanner() {
  const banner = document.getElementById('realtime-banner');
  if (!banner) return;
  let rainInfo = banner.querySelector('.rain-info');
  if (!rainInfo) {
    rainInfo = document.createElement('div');
    rainInfo.className = 'rain-info';
    banner.appendChild(rainInfo);
  }
  if (currentRainLevel >= 0.5) {
    const label = currentLang === 'ja' ? '🌧 現在 強い雨が降っています — 河川の増水・浸水に注意' : currentLang === 'en' ? '🌧 Heavy rain — Watch for flooding' : '🌧 大雨中 — 注意洪水';
    rainInfo.innerHTML = '<div class="alert-item alert-danger">' + label + '</div>';
  } else if (currentRainLevel >= 0.3) {
    const label = currentLang === 'ja' ? '🌦 雨が降っています — 河川の水位に注意' : currentLang === 'en' ? '🌦 Rain — Monitor river levels' : '🌦 下雨中 — 注意水位';
    rainInfo.innerHTML = '<div class="alert-item alert-warn">' + label + '</div>';
  } else {
    rainInfo.innerHTML = '';
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
        const bbox = '35.50,139.05,35.93,139.92';
        const q = `[out:json][timeout:25];(
          nwr["emergency"="assembly_point"](${bbox});
          nwr["amenity"="shelter"](${bbox});
          nwr["social_facility"="shelter"](${bbox});
          nwr["shelter_type"](${bbox});
          nwr["amenity"="school"]["name"](${bbox});
          nwr["amenity"="community_centre"]["name"](${bbox});
        );out center body;`;
        const res = await fetch('https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(q));
        if (res.ok) {
          const data = await res.json();
          const seen = new Set();
          _tokyoShelters = (data.elements || [])
            .map(e => {
              const lat = e.lat || e.center?.lat;
              const lng = e.lon || e.center?.lon;
              const name = e.tags?.['name:ja'] || e.tags?.name || '';
              return { name, lat, lng, accessible: e.tags?.wheelchair === 'yes' };
            })
            .filter(s => s.lat && s.lng && s.name)
            .filter(s => { const k = s.name+s.lat; if(seen.has(k)) return false; seen.add(k); return true; });
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
  const dist = document.getElementById('r-dist').textContent;
  const distUnit = dist >= 1 ? 'km' : 'm';
  const shelterName = selectedShelter?.name || '';
  const shelterLat = selectedShelter?.lat;
  const shelterLng = selectedShelter?.lng;
  // リッチなシェアテキスト
  let txt = '';
  if (currentLang === 'ja') {
    txt = '🆘 東京防災ナビ シミュレーション結果\n\n';
    if (shelterName) txt += '🏫 避難先: ' + shelterName + '\n';
    txt += '📏 距離: ' + dist + distUnit + '\n';
    txt += '⏱ 予想到達: ' + mins + '分\n';
    if (shelterLat && shelterLng) txt += '\n📍 Google マップで開く:\nhttps://www.google.com/maps/dir/?api=1&destination=' + shelterLat + ',' + shelterLng + '&travelmode=walking\n';
    txt += '\n防災ナビで避難ルートを確認しよう！\nhttps://rikky-1020.github.io/bousai.navi/';
  } else {
    txt = '🆘 Tokyo Bousai Navi - Simulation Result\n\n';
    if (shelterName) txt += '🏫 Shelter: ' + shelterName + '\n';
    txt += '📏 Distance: ' + dist + distUnit + '\n';
    txt += '⏱ ETA: ' + mins + ' min\n';
    if (shelterLat && shelterLng) txt += '\n📍 Open in Google Maps:\nhttps://www.google.com/maps/dir/?api=1&destination=' + shelterLat + ',' + shelterLng + '&travelmode=walking\n';
    txt += '\nhttps://rikky-1020.github.io/bousai.navi/';
  }
  try {
    if (navigator.share) { await navigator.share({ title: t().appName, text: txt }); return; }
    await navigator.clipboard.writeText(txt);
    toast(t().toastCopied);
  } catch(e) {}
}

/* ── Map Legend (凡例) ─────────────────────────────────── */
const LEGEND_INFO = {
  flood:     { label:'水害',   colors:[{c:'rgba(30,111,217,.55)',l:'高危険'},{c:'rgba(30,111,217,.4)',l:'中危険'},{c:'rgba(30,111,217,.25)',l:'要注意'}] },
  quake:     { label:'倒壊',   colors:[{c:'rgba(212,43,43,.55)',l:'高危険'},{c:'rgba(212,43,43,.4)',l:'中危険'},{c:'rgba(212,43,43,.25)',l:'要注意'}] },
  liq:       { label:'液状化', colors:[{c:'rgba(232,160,0,.55)',l:'高危険'},{c:'rgba(232,160,0,.4)',l:'中危険'},{c:'rgba(232,160,0,.25)',l:'要注意'}] },
  tsunami:   { label:'津波',   colors:[{c:'rgba(0,137,123,.55)',l:'高危険'},{c:'rgba(0,137,123,.4)',l:'中危険'},{c:'rgba(0,137,123,.25)',l:'要注意'}] },
  landslide: { label:'土砂災害', colors:[{c:'rgba(139,90,43,.55)',l:'高危険'},{c:'rgba(139,90,43,.4)',l:'中危険'},{c:'rgba(139,90,43,.25)',l:'要注意'}] },
};

function updateMapLegend() {
  const legend = document.getElementById('map-legend');
  if (!legend) return;
  const activeTypes = Object.entries(riskOn).filter(([,v]) => v).map(([k]) => k);
  if (activeTypes.length === 0) { legend.style.display = 'none'; return; }
  legend.style.display = 'block';
  const titleEl = document.getElementById('legend-title');
  titleEl.textContent = currentLang === 'ja' ? '凡例' : currentLang === 'en' ? 'Legend' : '图例';
  let html = '';
  for (const type of activeTypes) {
    const info = LEGEND_INFO[type];
    if (!info) continue;
    html += '<div style="font-size:.48rem;font-weight:900;color:var(--ink3);margin-top:2px">' + info.label + '</div>';
    for (const c of info.colors) {
      html += '<div class="legend-row"><div class="legend-dot" style="background:' + c.c + '"></div>' + c.l + '</div>';
    }
  }
  // 河川凡例
  if (activeTypes.includes('flood')) {
    html += '<div style="font-size:.48rem;font-weight:900;color:var(--ink3);margin-top:2px">河川</div>';
    html += '<div class="legend-row"><div class="legend-dot" style="background:#0055CC;width:16px;height:3px;border-radius:1px"></div>危険度 高</div>';
    html += '<div class="legend-row"><div class="legend-dot" style="background:#2277DD;width:16px;height:3px;border-radius:1px"></div>危険度 中</div>';
    html += '<div class="legend-row"><div class="legend-dot" style="background:#4499EE;width:16px;height:3px;border-radius:1px"></div>危険度 低</div>';
  }
  document.getElementById('legend-items').innerHTML = html;
}

/* ── Next Actions (持ち物チェックリスト + 家族連絡) ────── */
const CHECKLIST_ITEMS = [
  {icon:'💧', text:'飲料水（1人1日3L×3日分）'},
  {icon:'🍙', text:'非常食（缶詰・カロリーメイト等 3日分）'},
  {icon:'🔦', text:'懐中電灯・予備電池'},
  {icon:'📱', text:'モバイルバッテリー（満充電）'},
  {icon:'💊', text:'常備薬・お薬手帳のコピー'},
  {icon:'🩹', text:'救急セット（絆創膏・消毒液）'},
  {icon:'📻', text:'携帯ラジオ'},
  {icon:'🪪', text:'身分証明書のコピー・保険証'},
  {icon:'💰', text:'現金（小銭多め）'},
  {icon:'👕', text:'着替え・タオル'},
  {icon:'🧻', text:'トイレットペーパー・ウェットティッシュ'},
  {icon:'🔑', text:'自宅の鍵・車の鍵'},
];

function showChecklist() {
  const panel = document.getElementById('checklist-panel');
  if (panel.style.display !== 'none') { panel.style.display = 'none'; return; }
  const saved = JSON.parse(localStorage.getItem('bousai_checklist') || '{}');
  let html = '<div class="cl-title">🎒 ' + (currentLang === 'ja' ? '非常持ち出し袋チェックリスト' : 'Emergency Bag Checklist') + '</div>';
  CHECKLIST_ITEMS.forEach((item, i) => {
    const checked = saved[i] ? ' checked' : '';
    html += '<div class="cl-item"><div class="cl-check' + checked + '" onclick="toggleCheckItem(' + i + ',this)" role="checkbox" aria-checked="' + !!saved[i] + '">' + (saved[i] ? '✓' : '') + '</div><span>' + item.icon + ' ' + item.text + '</span></div>';
  });
  html += '<div class="cl-close" onclick="document.getElementById(\'checklist-panel\').style.display=\'none\'">閉じる</div>';
  panel.innerHTML = html;
  panel.style.display = 'block';
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function toggleCheckItem(idx, el) {
  const saved = JSON.parse(localStorage.getItem('bousai_checklist') || '{}');
  saved[idx] = !saved[idx];
  localStorage.setItem('bousai_checklist', JSON.stringify(saved));
  el.classList.toggle('checked', saved[idx]);
  el.textContent = saved[idx] ? '✓' : '';
  el.setAttribute('aria-checked', saved[idx]);
}

function showFamilyContact() {
  let msg = '';
  if (currentLang === 'ja') {
    msg = '【避難先の共有】\n';
    if (selectedShelter) {
      msg += '避難先: ' + selectedShelter.name + '\n';
      msg += '距離: ' + (selectedShelter.dist < 1 ? Math.round(selectedShelter.dist * 1000) + 'm' : selectedShelter.dist.toFixed(1) + 'km') + '\n';
      msg += '📍 Google マップ:\nhttps://www.google.com/maps/dir/?api=1&destination=' + selectedShelter.lat + ',' + selectedShelter.lng + '&travelmode=walking\n';
    }
    msg += '\n東京防災ナビ\nhttps://rikky-1020.github.io/bousai.navi/';
  } else {
    msg = 'Evacuation shelter: ' + (selectedShelter?.name || 'N/A') + '\n';
    if (selectedShelter) msg += 'https://www.google.com/maps/dir/?api=1&destination=' + selectedShelter.lat + ',' + selectedShelter.lng + '&travelmode=walking\n';
    msg += '\nhttps://rikky-1020.github.io/bousai.navi/';
  }
  if (navigator.share) {
    navigator.share({ title: currentLang === 'ja' ? '避難先の共有' : 'Shelter Info', text: msg }).catch(() => {});
  } else {
    navigator.clipboard.writeText(msg).then(() => toast(currentLang === 'ja' ? '📋 家族への連絡文をコピーしました' : 'Copied to clipboard'));
  }
}

/* ── Boot ────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Restore preferences
  const savedLang = localStorage.getItem('bousai_lang') || (navigator.language.startsWith('zh') ? 'zh' : navigator.language.startsWith('en') ? 'en' : 'ja');
  setLang(savedLang);
  applyFontScale(fontScale);
  if (highContrast) document.documentElement.classList.add('high-contrast');

  initMap();

  // オフライン時はキャッシュからリアルタイム情報を復元
  if (!navigator.onLine) {
    try {
      const cached = JSON.parse(localStorage.getItem('bousai_alerts') || 'null');
      if (cached) {
        realtimeAlerts = cached.alerts || [];
        realtimeQuakes = cached.quakes || [];
        currentRainLevel = cached.rain || 0;
        lastRealtimeUpdate = cached.ts ? new Date(cached.ts) : null;
        renderRealtimeAlertBanner();
      }
    } catch(e) {}
  }
  // Fetch realtime disaster info
  fetchRealtimeDisasterInfo();
  // Refresh every 5 minutes
  setInterval(fetchRealtimeDisasterInfo, 5 * 60 * 1000);

  // PWA shortcut handling
  const params = new URLSearchParams(location.search);
  if (params.get('action') === 'search') setTimeout(() => quickSearch(), 600);
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

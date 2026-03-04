// === 工具函数 ===
function getDaysInMonth(y, m) { return new Date(y, m, 0).getDate(); }
function getFirstDayOfWeek(y, m) { var d = new Date(y, m - 1, 1).getDay(); return d === 0 ? 7 : d; }
function pad(n) { return n < 10 ? '0' + n : '' + n; }
function toDateStr(y, m, d) { return y + '-' + pad(m) + '-' + pad(d); }
function getTodayStr() {
  var t = new Date();
  return t.getFullYear() + '-' + pad(t.getMonth() + 1) + '-' + pad(t.getDate());
}
function truncate(s, len) { return s.length > len ? s.slice(0, len) + '…' : s; }

// === 计划范围 ===
var PLAN_START = '2026-03-01';
var PLAN_END = '2026-05-10';
var TOTAL_DAYS = 71;

var MONTHS = [
  { year: 2026, month: 3, label: '三月' },
  { year: 2026, month: 4, label: '四月' },
  { year: 2026, month: 5, label: '五月' }
];

var currentIdx = 0;

// === 进度条 ===
function updateProgress() {
  var today = getTodayStr();
  var start = new Date(PLAN_START);
  var end = new Date(PLAN_END);
  var now = new Date(today);
  var elapsed = Math.floor((now - start) / 86400000) + 1;
  if (elapsed < 1) elapsed = 0;
  if (elapsed > TOTAL_DAYS) elapsed = TOTAL_DAYS;
  var pct = Math.round((elapsed / TOTAL_DAYS) * 100);
  document.getElementById('progress-text').textContent = '第 ' + elapsed + ' 天 / ' + TOTAL_DAYS + ' 天';
  document.getElementById('progress-pct').textContent = pct + '%';
  document.getElementById('progress-fill').style.width = pct + '%';
}

// === 渲染日历 ===
function renderCalendar() {
  var info = MONTHS[currentIdx];
  var y = info.year, m = info.month;
  document.getElementById('month-title').innerHTML = info.label + '<span>' + y + '</span>';

  var daysInMonth = getDaysInMonth(y, m);
  var firstDay = getFirstDayOfWeek(y, m);
  var grid = document.getElementById('calendar-grid');
  grid.innerHTML = '';
  var todayStr = getTodayStr();

  // 空白格子
  for (var i = 1; i < firstDay; i++) {
    var empty = document.createElement('div');
    empty.className = 'day-cell';
    empty.style.visibility = 'hidden';
    grid.appendChild(empty);
  }

  // 日期格子
  for (var d = 1; d <= daysInMonth; d++) {
    var dateStr = toDateStr(y, m, d);
    var plan = PLAN_MAP[dateStr];
    var phase = plan ? PHASES[plan.phase] : null;
    var isToday = dateStr === todayStr;
    var hasPlan = !!plan;

    var cell;
    if (hasPlan) {
      cell = document.createElement('a');
      cell.href = 'days/' + dateStr + '.html';
    } else {
      cell = document.createElement('div');
    }

    cell.className = 'day-cell' + (hasPlan ? ' has-plan' : ' no-plan') + (isToday ? ' today' : '');
    if (hasPlan && phase) {
      cell.style.backgroundColor = phase.bg;
    }

    var html = '';
    if (isToday) html += '<span class="today-dot"></span>';
    html += '<span class="day-num">' + d + '</span>';
    if (hasPlan && phase) {
      html += '<span class="day-line" style="background-color:' + phase.color + '"></span>';
      html += '<span class="day-title" style="color:' + phase.color + '">' + truncate(plan.title, 8) + '</span>';
    }
    cell.innerHTML = html;
    grid.appendChild(cell);
  }

  // 更新标签状态
  var tabs = document.querySelectorAll('.month-tab');
  tabs.forEach(function(tab, idx) {
    tab.className = 'month-tab' + (idx === currentIdx ? ' active' : '');
  });
}

// === 图例 ===
function renderLegend() {
  var legend = document.getElementById('legend');
  var uniquePhases = [];
  var seen = {};
  Object.keys(PHASES).forEach(function(k) {
    var label = PHASES[k].label;
    if (!seen[label]) { seen[label] = true; uniquePhases.push(PHASES[k]); }
  });
  legend.innerHTML = uniquePhases.map(function(p) {
    return '<div class="legend-item"><span class="legend-dot" style="background:' + p.color + '"></span>' + p.label + '</div>';
  }).join('');
}

// === 事件绑定 ===
document.querySelectorAll('.month-tab').forEach(function(tab) {
  tab.addEventListener('click', function() {
    currentIdx = parseInt(this.getAttribute('data-idx'));
    renderCalendar();
  });
});

// === 初始化 ===
updateProgress();
renderCalendar();
renderLegend();

// ===== STORAGE =====
const S = {
  get: (k, d = null) => { try { const v = localStorage.getItem(k); return v !== null ? JSON.parse(v) : d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e) { console.error('Storage error:', e); } },
  del: (k) => localStorage.removeItem(k),
  keys: () => Object.keys(localStorage),
};

// ===== DEFAULTS =====
const DEFAULT_HABITS = [
  { id: 'h1', name: 'Belajar PM — Google Certificate (2 jam)', cat: 'PM', section: 'Prioritas Utama', active: true },
  { id: 'h2', name: 'Catat 1 hal penting dari materi hari ini', cat: 'PM', section: 'Prioritas Utama', active: true },
  { id: 'h3', name: 'Olahraga (60–90 menit)', cat: 'Kesehatan', section: 'Kesehatan & Energi', active: true },
  { id: 'h4', name: 'Excel / Google Workspace (45 mnt)', cat: 'Admin', section: 'Poles Admin', active: true },
  { id: 'h5', name: 'Cari / kerjakan sambilan admin remote', cat: 'Admin', section: 'Income Tambahan', active: true },
  { id: 'h6', name: 'Review catatan belajar singkat (10 mnt)', cat: 'PM', section: 'Prioritas Utama', active: true },
];

const DEFAULT_CATS = ['PM', 'Admin', 'Kesehatan', 'Habit', 'Pribadi'];

const DEFAULT_COURSES = [
  { id: 'c1', name: 'Foundations of Project Management', source: 'Google PM Certificate — Coursera', modules: ['Pekan 1', 'Pekan 2', 'Pekan 3', 'Kuis lulus'], done: [] },
  { id: 'c2', name: 'Project Initiation: Starting a Successful Project', source: 'Google PM Certificate — Coursera', modules: ['Pekan 1', 'Pekan 2', 'Pekan 3', 'Kuis lulus'], done: [] },
  { id: 'c3', name: 'Project Planning: Putting It All Together', source: 'Google PM Certificate — Coursera', modules: ['Pekan 1', 'Pekan 2', 'Pekan 3', 'Kuis lulus'], done: [] },
  { id: 'c4', name: 'Project Execution: Running the Project', source: 'Google PM Certificate — Coursera', modules: ['Pekan 1', 'Pekan 2', 'Pekan 3', 'Kuis lulus'], done: [] },
  { id: 'c5', name: 'Agile Project Management', source: 'Google PM Certificate — Coursera', modules: ['Pekan 1', 'Pekan 2', 'Pekan 3', 'Kuis lulus'], done: [] },
  { id: 'c6', name: 'Capstone: Applying PM in the Real World', source: 'Google PM Certificate — Coursera', modules: ['Bagian 1', 'Bagian 2', 'Bagian 3', 'Sertifikat diterima'], done: [] },
];

// ===== STATE =====
let state = {
  page: 'dashboard',
  habitDate: new Date(),
  habitView: 'harian',
  habitWeekSelected: new Date(),
  editingHabit: null,
  editingCourse: null,
  editingProject: null,
  editingNote: null,
  editingMilestone: null,
  editingJournal: null,
  editingReview: null,
  searchQuery: { catatan: '', jurnal: '', proyek: '' },
};

// ===== SETTINGS =====
function getSettings() {
  return S.get('settings', {
    appName: 'Growth System',
    theme: 'light',
    accentColor: '#3C3489',
    lang: 'id',
    shift: 'siang',
  });
}
function saveSettings(s) { S.set('settings', s); applySettings(s); }
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return (!isNaN(r) && !isNaN(g) && !isNaN(b)) ? { r, g, b } : null;
}

function applySettings(s) {
  document.documentElement.setAttribute('data-theme', s.theme);
  document.documentElement.style.setProperty('--accent', s.accentColor);
  const rgb = hexToRgb(s.accentColor);
  if (rgb) {
    let styleTag = document.getElementById('accent-style');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'accent-style';
      document.head.appendChild(styleTag);
    }
    styleTag.textContent = `:root { --accent-mid: rgba(${rgb.r},${rgb.g},${rgb.b},0.75); --accent-light: rgba(${rgb.r},${rgb.g},${rgb.b},0.1); }`;
  }
  document.getElementById('sidebar-app-name').textContent = s.appName;
  document.getElementById('mobile-app-name').textContent = s.appName;
  document.title = s.appName;
}

// ===== HABITS DATA =====
function getHabits() { return S.get('habits_config', DEFAULT_HABITS); }
function saveHabits(h) { S.set('habits_config', h); }
function getCats() { return S.get('habit_cats', DEFAULT_CATS); }
function saveCats(c) { S.set('habit_cats', c); }
function getDayData(dateKey) { return S.get('day_' + dateKey, {}); }
function saveDayData(dateKey, data) { S.set('day_' + dateKey, data); }
function dateKey(d) { return d.toISOString().slice(0, 10); }

function getDayCompletion(d) {
  const habits = getHabits().filter(h => h.active);
  if (!habits.length) return 0;
  const data = getDayData(dateKey(d));
  return Math.round((habits.filter(h => data[h.id]).length / habits.length) * 100);
}

function getStreak() {
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 365; i++) {
    if (getDayCompletion(d) >= 50) streak++;
    else break;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

// ===== LEARNING DATA =====
function getCourses() { return S.get('courses_config', DEFAULT_COURSES); }
function saveCourses(c) { S.set('courses_config', c); }

// ===== PROJECTS DATA =====
function getProjects() { return S.get('projects', []); }
function saveProjects(p) { S.set('projects', p); }

// ===== NOTES DATA =====
function getNotes() { return S.get('notes', []); }
function saveNotes(n) { S.set('notes', n); }

// ===== JOURNAL DATA =====
function getJournal() { return S.get('journal', []); }
function saveJournal(j) { S.set('journal', j); }

// ===== MILESTONES DATA =====
function getMilestones() { return S.get('milestones', []); }
function saveMilestones(m) { S.set('milestones', m); }

// ===== WEEKLY REVIEW DATA =====
function getReviews() { return S.get('reviews', []); }
function saveReviews(r) { S.set('reviews', r); }

// ===== NAV =====
function goTo(page, fromNav = false) {
  state.page = page;
  // Reset page shells so they rebuild on next visit (fixes lang switch etc)
  // But only for pages that use shell+list pattern
  if (['catatan','jurnal','proyek'].includes(page)) {
    // Clear shell so it rebuilds with correct language if changed
    const pg = document.getElementById('page-' + page);
    if (pg) pg.innerHTML = '';
  }
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const pageEl = document.getElementById('page-' + page);
  if (pageEl) pageEl.classList.add('active');
  const navEl = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (navEl) navEl.classList.add('active');
  const titles = {
    dashboard: T('Dashboard'), habit: T('Habit Harian'),
    belajar: T('Progress Belajar'), review: T('Weekly Review'),
    proyek: T('Portofolio & Proyek'), catatan: T('Catatan Belajar'),
    jurnal: T('Jurnal Karir'), milestone: T('Target & Milestone'),
    settings: T('Pengaturan'),
  };
  document.getElementById('topbar-title').textContent = titles[page] || page;
  document.getElementById('mobile-page-title').textContent = titles[page] || page;
  // Topbar search: show only on searchable pages, clear value on nav
  const searchPages = ['catatan', 'jurnal', 'proyek'];
  const topbarSearch = document.getElementById('topbar-search-wrap');
  if (topbarSearch) topbarSearch.style.display = searchPages.includes(page) ? '' : 'none';
  const topbarInput = document.getElementById('topbar-search-input');
  if (topbarInput) { topbarInput.value = state.searchQuery[page] || ''; }
  if (fromNav) closeSidebar();
  renders[page]?.();
}

// ===== TRANSLATIONS =====
const LANG = {
  id: {
    'Dashboard': 'Dashboard', 'Habit Harian': 'Habit Harian',
    'Progress Belajar': 'Progress Belajar', 'Weekly Review': 'Weekly Review',
    'Portofolio & Proyek': 'Portofolio & Proyek', 'Catatan Belajar': 'Catatan Belajar',
    'Jurnal Karir': 'Jurnal Karir', 'Target & Milestone': 'Target & Milestone',
    'Pengaturan': 'Pengaturan', 'Hari ini': 'Hari ini', 'Simpan': 'Simpan',
    'Batal': 'Batal', 'Hapus': 'Hapus', 'Edit': 'Edit', 'Tambah': 'Tambah',
    'Selesai': 'Selesai', 'Aktif': 'Aktif', 'Cari...': 'Cari...',
    'Tersimpan': 'Tersimpan ✓', 'Streak': 'Streak', 'hari': 'hari',
    'Belum ada data': 'Belum ada data.', 'Tutup': 'Tutup',
  },
  en: {
    'Dashboard': 'Dashboard', 'Habit Harian': 'Daily Habit',
    'Progress Belajar': 'Learning Progress', 'Weekly Review': 'Weekly Review',
    'Portofolio & Proyek': 'Portfolio & Projects', 'Catatan Belajar': 'Study Notes',
    'Jurnal Karir': 'Career Journal', 'Target & Milestone': 'Targets & Milestones',
    'Pengaturan': 'Settings', 'Hari ini': 'Today', 'Simpan': 'Save',
    'Batal': 'Cancel', 'Hapus': 'Delete', 'Edit': 'Edit', 'Tambah': 'Add',
    'Selesai': 'Done', 'Aktif': 'Active', 'Cari...': 'Search...',
    'Tersimpan': 'Saved ✓', 'Streak': 'Streak', 'hari': 'days',
    'Belum ada data': 'No data yet.', 'Tutup': 'Close',
  }
};
function T(k) { const s = getSettings(); return (LANG[s.lang] || LANG.id)[k] || k; }

// ===== SIDEBAR MOBILE =====
function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebar-overlay').classList.add('open');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('open');
}

// ===== MODAL =====
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// ===== RENDER: DASHBOARD =====
function renderDashboard() {
  const habits = getHabits().filter(h => h.active);
  const todayPct = getDayCompletion(new Date());
  const streak = getStreak();
  const courses = getCourses();
  let totalM = 0, doneM = 0;
  courses.forEach(c => { totalM += c.modules.length; doneM += (c.done || []).length; });
  const learnPct = totalM ? Math.round((doneM / totalM) * 100) : 0;
  const milestones = getMilestones().filter(m => !m.done);
  const upcoming = milestones.sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).slice(0, 3);
  const projects = getProjects();
  const activeProjects = projects.filter(p => p.status !== 'done').length;
  const s = getSettings();

  document.getElementById('page-dashboard').innerHTML = `
    <div class="page-content">
      <div class="page-header flex-between">
        <div>
          <h1 class="page-title">${s.appName}</h1>
          <p class="page-sub">${new Date().toLocaleDateString(s.lang === 'id' ? 'id-ID' : 'en-US', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</p>
        </div>
        ${streak > 0 ? `<div class="streak-badge">🔥 ${streak} ${T('hari')} ${T('Streak')}</div>` : ''}
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-val" style="color:var(--success-mid)">${todayPct}%</div>
          <div class="stat-label">${s.lang === 'id' ? 'Habit hari ini' : 'Today\'s habits'}</div>
          <div class="stat-sub">${getHabits().filter(h=>h.active && getDayData(dateKey(new Date()))[h.id]).length} / ${habits.length}</div>
        </div>
        <div class="stat-card">
          <div class="stat-val" style="color:var(--accent)">${learnPct}%</div>
          <div class="stat-label">${s.lang === 'id' ? 'Progress belajar' : 'Learning progress'}</div>
          <div class="stat-sub">${doneM} / ${totalM} ${s.lang === 'id' ? 'modul' : 'modules'}</div>
        </div>
        <div class="stat-card">
          <div class="stat-val" style="color:var(--warn-mid)">${milestones.length}</div>
          <div class="stat-label">${s.lang === 'id' ? 'Target aktif' : 'Active targets'}</div>
          <div class="stat-sub">${getMilestones().filter(m=>m.done).length} ${s.lang === 'id' ? 'selesai' : 'completed'}</div>
        </div>
        <div class="stat-card">
          <div class="stat-val" style="color:var(--success)">${activeProjects}</div>
          <div class="stat-label">${s.lang === 'id' ? 'Proyek aktif' : 'Active projects'}</div>
          <div class="stat-sub">${projects.filter(p=>p.status==='done').length} ${s.lang === 'id' ? 'selesai' : 'done'}</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1rem">
        <div class="card">
          <div class="card-title mb-0" style="margin-bottom:.75rem">${s.lang==='id'?'Target terdekat':'Upcoming targets'}</div>
          ${upcoming.length ? upcoming.map(m => {
            const daysLeft = Math.ceil((new Date(m.deadline) - new Date()) / 86400000);
            const overdue = daysLeft < 0;
            return `<div class="card-sm mb-0" style="margin-bottom:6px">
              <div class="font-medium text-sm">${m.title}</div>
              <div class="text-xs ${overdue ? 'text-danger' : 'text-faint'}" style="margin-top:2px">
                ${overdue ? (s.lang==='id'?'Terlambat':'Overdue') : `${daysLeft} ${s.lang==='id'?'hari lagi':'days left'}`} · ${m.deadline}
              </div>
            </div>`;
          }).join('') : `<div class="text-sm text-faint">${s.lang==='id'?'Belum ada target.':'No targets yet.'}</div>`}
        </div>
        <div class="card">
          <div class="card-title mb-0" style="margin-bottom:.75rem">${s.lang==='id'?'Progress belajar':'Learning progress'}</div>
          ${courses.slice(0,4).map(c => {
            const pct = c.modules.length ? Math.round(((c.done||[]).length / c.modules.length) * 100) : 0;
            return `<div style="margin-bottom:10px">
              <div class="flex-between" style="margin-bottom:4px">
                <span class="text-xs text-muted" style="max-width:70%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.name}</span>
                <span class="text-xs text-faint">${pct}%</span>
              </div>
              <div class="progress-bar" style="height:5px"><div class="progress-fill" style="width:${pct}%"></div></div>
            </div>`;
          }).join('')}
        </div>
      </div>

      <div class="card" style="margin-top:0">
        <div class="card-title mb-0" style="margin-bottom:.75rem">${s.lang==='id'?'Habit minggu ini':'This week\'s habits'}</div>
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px">
          ${Array.from({length:7}, (_,i) => {
            const d = new Date(); d.setDate(d.getDate() - d.getDay() + i);
            const pct = getDayCompletion(d);
            const isToday = dateKey(d) === dateKey(new Date());
            const days = s.lang==='id' ? ['Min','Sen','Sel','Rab','Kam','Jum','Sab'] : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
            return `<div style="text-align:center;cursor:pointer" onclick="goTo('habit')">
              <div class="text-xs text-faint" style="margin-bottom:4px">${days[d.getDay()]}</div>
              <div style="width:36px;height:36px;border-radius:50%;margin:0 auto;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;border:1.5px solid ${isToday ? 'var(--accent)' : 'var(--border)'};background:${pct >= 50 ? 'var(--success-bg)' : 'var(--surface)'};color:${pct >= 50 ? 'var(--success)' : 'var(--text2)'}">
                ${pct}%
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>`;
}

// ===== RENDER: HABIT =====
function renderHabit() {
  const habits = getHabits().filter(h => h.active);
  const s = getSettings();
  const pg = document.getElementById('page-habit');
  pg.innerHTML = `
    <div class="page-content">
      <div class="page-header flex-between" style="align-items:flex-start">
        <div><h1 class="page-title">${T('Habit Harian')}</h1>
        <p class="page-sub">${s.lang==='id'?'Lakukan secara sadar, bukan auto-pilot.':'Do it consciously, not on autopilot.'}</p></div>
        <div style="display:flex;gap:8px;align-items:center">
          ${getStreak() > 0 ? `<div class="streak-badge">🔥 ${getStreak()} ${T('hari')}</div>` : ''}
          <button class="btn btn-outline btn-sm" onclick="openHabitModal(null)">+ ${T('Tambah')}</button>
        </div>
      </div>
      <div class="toggle-row">
        <button class="toggle-btn ${state.habitView==='harian'?'active':''}" onclick="setHabitView('harian')">${s.lang==='id'?'Harian':'Daily'}</button>
        <button class="toggle-btn ${state.habitView==='mingguan'?'active':''}" onclick="setHabitView('mingguan')">${s.lang==='id'?'Mingguan':'Weekly'}</button>
      </div>
      <div id="habit-view-content"></div>
    </div>`;
  renderHabitView();
  renderHabitModal();
}

function setHabitView(v) {
  state.habitView = v;
  renderHabit();
}

function renderHabitView() {
  const el = document.getElementById('habit-view-content');
  if (!el) return;
  if (state.habitView === 'harian') el.innerHTML = renderHabitDaily();
  else el.innerHTML = renderHabitWeekly();
}

function renderHabitDaily() {
  const s = getSettings();
  const habits = getHabits().filter(h => h.active);
  const dk = dateKey(state.habitDate);
  const data = getDayData(dk);
  const today = new Date(); today.setHours(0,0,0,0);
  const cur = new Date(state.habitDate); cur.setHours(0,0,0,0);
  const isToday = cur.getTime() === today.getTime();
  const days = s.lang==='id' ? ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'] : ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = s.lang==='id' ? ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'] : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const dateStr = `${days[state.habitDate.getDay()]}, ${state.habitDate.getDate()} ${months[state.habitDate.getMonth()]} ${state.habitDate.getFullYear()}${isToday ? ' — ' + T('Hari ini') : ''}`;
  const doneCnt = habits.filter(h => data[h.id]).length;
  const pct = habits.length ? Math.round((doneCnt / habits.length) * 100) : 0;

  // Group habits by section
  const sections = {};
  habits.forEach(h => {
    if (!sections[h.section]) sections[h.section] = [];
    sections[h.section].push(h);
  });

  const energy = data.energy || 0;
  const energyLabels = ['1','2','3','4','5'];

  const CAT_COLORS = ['accent', 'warn', 'success', 'neutral'];
  function getCatChip(cat) {
    const cats = getCats();
    const idx = cats.indexOf(cat);
    const variants = ['chip-accent', 'chip-warn', 'chip-success', 'chip-neutral'];
    return variants[idx % variants.length] || 'chip-neutral';
  }

  let habitHtml = '';
  for (const [sec, hs] of Object.entries(sections)) {
    habitHtml += `<div class="habit-section">
      <div class="habit-section-title">${sec}</div>`;
    hs.forEach(h => {
      const done = !!data[h.id];
      habitHtml += `<div class="habit-item ${done?'done':''}" onclick="toggleHabit('${dk}','${h.id}')">
        <div class="habit-check"><svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4.5L4 7.5L10 1.5" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
        <span class="habit-name">${h.name}</span>
        <span class="chip ${getCatChip(h.cat)}">${h.cat}</span>
        <div class="habit-actions">
          <button class="btn btn-ghost btn-icon btn-sm" onclick="event.stopPropagation();openHabitModal('${h.id}')">✏️</button>
        </div>
      </div>`;
    });
    habitHtml += '</div>';
  }

  return `
    <div class="date-nav">
      <button class="date-nav-btn" onclick="changeHabitDate(-1)">&#8592;</button>
      <span class="date-display">${dateStr}</span>
      <button class="date-nav-btn" onclick="changeHabitDate(1)">&#8594;</button>
      ${!isToday ? `<button class="date-today-btn" onclick="goHabitToday()">${T('Hari ini')}</button>` : ''}
    </div>
    <div class="progress-wrap card" style="padding:1rem 1.25rem">
      <div class="progress-header">
        <span class="progress-label">${s.lang==='id'?`${doneCnt} dari ${habits.length} selesai`:`${doneCnt} of ${habits.length} done`}</span>
        <span class="progress-val">${pct}%</span>
      </div>
      <div class="progress-bar"><div class="progress-fill green" style="width:${pct}%"></div></div>
    </div>
    ${habitHtml}
    <div class="card mt-12">
      <div class="form-label">${s.lang==='id'?'Energi hari ini':'Energy today'}</div>
      <div class="energy-row" style="margin-bottom:1rem">
        ${energyLabels.map((l,i) => `<button class="energy-btn ${energy===i+1?'active':''}" onclick="setHabitEnergy('${dk}',${i+1})">${l}</button>`).join('')}
      </div>
      <div class="form-label">${s.lang==='id'?'Catatan hari ini':'Daily note'}</div>
      <textarea id="daily-note-input" rows="3" placeholder="${s.lang==='id'?'Refleksi singkat hari ini...':'Quick reflection for today...'}">${data.note||''}</textarea>
      <button class="btn btn-primary btn-sm mt-8" onclick="saveDailyNote('${dk}')">${T('Simpan')}</button>
      <span id="daily-note-saved" style="font-size:12px;color:var(--success);margin-left:8px;display:none">${T('Tersimpan')}</span>
    </div>`;
}

function renderHabitWeekly() {
  const s = getSettings();
  const today = new Date(); today.setHours(0,0,0,0);
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const dayNames = s.lang==='id' ? ['Min','Sen','Sel','Rab','Kam','Jum','Sab'] : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  let weekHtml = '<div class="week-grid-view">';
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek); d.setDate(startOfWeek.getDate() + i);
    const pct = getDayCompletion(d);
    const isToday = d.getTime() === today.getTime();
    const isSel = dateKey(d) === dateKey(state.habitWeekSelected);
    weekHtml += `<div class="week-day ${isToday?'today':''} ${isSel?'selected':''}" onclick="selectWeekDay(${d.getTime()})">
      <div class="wd-name">${dayNames[d.getDay()]}</div>
      <div class="wd-date">${d.getDate()}</div>
      <div class="wd-pct">${pct}%</div>
      <div class="wd-bar"><div class="wd-bar-fill" style="width:${pct}%"></div></div>
    </div>`;
  }
  weekHtml += '</div>';

  const dk = dateKey(state.habitWeekSelected);
  const data = getDayData(dk);
  const habits = getHabits().filter(h => h.active);
  const done = habits.filter(h => data[h.id]);
  const notDone = habits.filter(h => !data[h.id]);
  const dayStr = state.habitWeekSelected.toLocaleDateString(s.lang==='id'?'id-ID':'en-US', {weekday:'long',day:'numeric',month:'long'});

  weekHtml += `<div class="card"><div style="font-weight:500;margin-bottom:12px">${dayStr}</div>`;
  if (done.length) {
    weekHtml += `<div class="text-xs font-bold text-success" style="margin-bottom:6px">${s.lang==='id'?'Selesai ✓':'Done ✓'}</div>`;
    done.forEach(h => { weekHtml += `<div class="card-sm" style="color:var(--text2);font-size:13px;margin-bottom:5px">${h.name}</div>`; });
  }
  if (notDone.length) {
    weekHtml += `<div class="text-xs font-bold text-faint" style="margin:12px 0 6px">${s.lang==='id'?'Belum selesai':'Not done'}</div>`;
    notDone.forEach(h => { weekHtml += `<div class="card-sm" style="color:var(--text3);font-size:13px;margin-bottom:5px">${h.name}</div>`; });
  }
  if (!habits.length) weekHtml += `<div class="text-sm text-faint">${T('Belum ada data')}</div>`;
  weekHtml += '</div>';
  return weekHtml;
}

function toggleHabit(dk, hid) {
  const data = getDayData(dk);
  data[hid] = !data[hid];
  saveDayData(dk, data);
  renderHabitView();
  renderDashboardIfActive();
}

function setHabitEnergy(dk, val) {
  const data = getDayData(dk);
  data.energy = val;
  saveDayData(dk, data);
  renderHabitView();
}

function saveDailyNote(dk) {
  const input = document.getElementById('daily-note-input');
  if (!input) return;
  const data = getDayData(dk);
  data.note = input.value;
  saveDayData(dk, data);
  const el = document.getElementById('daily-note-saved');
  if (el) { el.style.display = 'inline'; setTimeout(() => el.style.display = 'none', 2000); }
}

function changeHabitDate(d) {
  state.habitDate = new Date(state.habitDate);
  state.habitDate.setDate(state.habitDate.getDate() + d);
  renderHabitView();
}
function goHabitToday() { state.habitDate = new Date(); renderHabitView(); }
function selectWeekDay(ts) { state.habitWeekSelected = new Date(ts); renderHabitView(); }

// Habit Modal
function renderHabitModal() {
  if (document.getElementById('modal-habit')) return;
  const cats = getCats();
  const sections = [...new Set(getHabits().map(h => h.section))];
  document.body.insertAdjacentHTML('beforeend', `
    <div class="modal-overlay" id="modal-habit">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title" id="habit-modal-title">Tambah Habit</span>
          <button class="modal-close" onclick="closeModal('modal-habit')">✕</button>
        </div>
        <div class="form-group">
          <label class="form-label">Nama habit</label>
          <input type="text" id="hm-name" placeholder="Contoh: Belajar PM 2 jam">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Kategori</label>
            <select id="hm-cat">${cats.map(c => `<option>${c}</option>`).join('')}</select>
          </div>
          <div class="form-group">
            <label class="form-label">Seksi / Kelompok</label>
            <input type="text" id="hm-section" placeholder="Contoh: Prioritas Utama" list="section-list">
            <datalist id="section-list">${sections.map(s=>`<option value="${s}">`).join('')}</datalist>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select id="hm-active"><option value="1">Aktif</option><option value="0">Nonaktif</option></select>
        </div>
        <div class="modal-footer">
          <button class="btn btn-danger-outline" id="hm-delete-btn" onclick="deleteHabitModal()" style="display:none">Hapus</button>
          <button class="btn btn-outline" onclick="closeModal('modal-habit')">Batal</button>
          <button class="btn btn-primary" onclick="saveHabitModal()">Simpan</button>
        </div>
      </div>
    </div>`);
}

function openHabitModal(id) {
  state.editingHabit = id;
  const habits = getHabits();
  const h = id ? habits.find(x => x.id === id) : null;
  document.getElementById('habit-modal-title').textContent = h ? 'Edit Habit' : 'Tambah Habit';
  document.getElementById('hm-name').value = h?.name || '';
  document.getElementById('hm-cat').value = h?.cat || getCats()[0];
  document.getElementById('hm-section').value = h?.section || '';
  document.getElementById('hm-active').value = h?.active !== false ? '1' : '0';
  document.getElementById('hm-delete-btn').style.display = h ? '' : 'none';
  openModal('modal-habit');
}

function saveHabitModal() {
  const name = document.getElementById('hm-name').value.trim();
  if (!name) return alert('Nama habit wajib diisi.');
  const habits = getHabits();
  if (state.editingHabit) {
    const idx = habits.findIndex(h => h.id === state.editingHabit);
    if (idx > -1) {
      habits[idx].name = name;
      habits[idx].cat = document.getElementById('hm-cat').value;
      habits[idx].section = document.getElementById('hm-section').value || 'Umum';
      habits[idx].active = document.getElementById('hm-active').value === '1';
    }
  } else {
    habits.push({ id: 'h' + Date.now(), name, cat: document.getElementById('hm-cat').value, section: document.getElementById('hm-section').value || 'Umum', active: true });
  }
  saveHabits(habits);
  closeModal('modal-habit');
  renderHabit();
}

function deleteHabitModal() {
  if (!confirm('Hapus habit ini?')) return;
  const habits = getHabits().filter(h => h.id !== state.editingHabit);
  saveHabits(habits);
  closeModal('modal-habit');
  renderHabit();
}

// ===== RENDER: BELAJAR =====
function renderBelajar() {
  const s = getSettings();
  const courses = getCourses();
  let totalM = 0, doneM = 0;
  courses.forEach(c => { totalM += c.modules.length; doneM += (c.done||[]).length; });
  const pct = totalM ? Math.round((doneM / totalM) * 100) : 0;

  document.getElementById('page-belajar').innerHTML = `
    <div class="page-content">
      <div class="page-header flex-between">
        <div><h1 class="page-title">${T('Progress Belajar')}</h1>
        <p class="page-sub">${s.lang==='id'?'Tracking semua topik yang sedang kamu pelajari.':'Track everything you are learning.'}</p></div>
        <button class="btn btn-primary btn-sm" onclick="openCourseModal(null)">+ ${s.lang==='id'?'Tambah topik':'Add topic'}</button>
      </div>
      <div class="card">
        <div class="flex-between" style="margin-bottom:1rem">
          <div>
            <div class="text-sm text-muted">${s.lang==='id'?'Total progress':'Total progress'}</div>
            <div style="font-family:var(--font-serif);font-size:36px;line-height:1">${pct}%</div>
          </div>
          <div style="text-align:right">
            <div class="text-sm text-muted" style="margin-bottom:4px">${s.lang==='id'?'Jam belajar minggu ini':'Study hours this week'}</div>
            <div style="display:flex;align-items:center;gap:8px">
              <input type="number" id="pm-hrs" min="0" max="100" style="width:60px;text-align:center" value="${S.get('study_hours_week',0)}">
              <span class="text-sm text-muted">/ 10 jam</span>
              <button class="btn btn-outline btn-sm" onclick="saveStudyHours()">${T('Simpan')}</button>
            </div>
          </div>
        </div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      </div>
      <div id="courses-list">${renderCoursesList()}</div>
    </div>`;
  renderCourseModal();
}

function renderCoursesList() {
  const courses = getCourses();
  const s = getSettings();
  if (!courses.length) return `<div class="empty-state"><div class="empty-icon">📚</div><div class="empty-text">${T('Belum ada data')}</div></div>`;
  return courses.map(c => {
    const done = c.done || [];
    const pct = c.modules.length ? Math.round((done.length / c.modules.length) * 100) : 0;
    return `<div class="card">
      <div class="flex-between" style="margin-bottom:10px">
        <div style="flex:1;margin-right:12px">
          <div class="card-title">${c.name}</div>
          ${c.source ? `<div class="card-sub">${c.source}</div>` : ''}
        </div>
        <div style="display:flex;gap:6px;align-items:center">
          <span class="chip chip-accent">${pct}%</span>
          <button class="btn btn-ghost btn-icon btn-sm" onclick="openCourseModal('${c.id}')">✏️</button>
        </div>
      </div>
      <div class="progress-bar" style="margin-bottom:12px"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px">
        ${c.modules.map((m, mi) => {
          const checked = done.includes(mi);
          return `<label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;${checked?'color:var(--text2)':''}">
            <input type="checkbox" ${checked?'checked':''} onchange="toggleModule('${c.id}',${mi},this)" style="width:16px;height:16px;accent-color:var(--accent)">
            <span style="${checked?'text-decoration:line-through;':''}">${m}</span>
          </label>`;
        }).join('')}
      </div>
    </div>`;
  }).join('');
}

function toggleModule(cid, mi, el) {
  const courses = getCourses();
  const c = courses.find(x => x.id === cid);
  if (!c) return;
  if (!c.done) c.done = [];
  if (el.checked) { if (!c.done.includes(mi)) c.done.push(mi); }
  else { c.done = c.done.filter(x => x !== mi); }
  saveCourses(courses);
  document.getElementById('courses-list').innerHTML = renderCoursesList();
  renderDashboardIfActive();
}

function saveStudyHours() {
  S.set('study_hours_week', parseInt(document.getElementById('pm-hrs').value) || 0);
  const btn = event.currentTarget;
  btn.textContent = T('Tersimpan'); setTimeout(() => btn.textContent = T('Simpan'), 2000);
}

function renderCourseModal() {
  if (document.getElementById('modal-course')) return;
  document.body.insertAdjacentHTML('beforeend', `
    <div class="modal-overlay" id="modal-course">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title" id="course-modal-title">Tambah Topik Belajar</span>
          <button class="modal-close" onclick="closeModal('modal-course')">✕</button>
        </div>
        <div class="form-group">
          <label class="form-label">Nama topik / materi</label>
          <input type="text" id="cm-name" placeholder="Contoh: Foundations of Project Management">
        </div>
        <div class="form-group">
          <label class="form-label">Sumber belajar (opsional)</label>
          <input type="text" id="cm-source" placeholder="Contoh: Coursera, Buku, YouTube">
        </div>
        <div class="form-group">
          <label class="form-label">Modul / bagian (satu per baris)</label>
          <textarea id="cm-modules" rows="5" placeholder="Pekan 1&#10;Pekan 2&#10;Kuis lulus"></textarea>
          <div class="form-hint">Pisahkan setiap modul dengan baris baru</div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-danger-outline" id="cm-delete-btn" onclick="deleteCourseModal()" style="display:none">Hapus</button>
          <button class="btn btn-outline" onclick="closeModal('modal-course')">Batal</button>
          <button class="btn btn-primary" onclick="saveCourseModal()">Simpan</button>
        </div>
      </div>
    </div>`);
}

function openCourseModal(id) {
  state.editingCourse = id;
  const c = id ? getCourses().find(x => x.id === id) : null;
  document.getElementById('course-modal-title').textContent = c ? 'Edit Topik' : 'Tambah Topik Belajar';
  document.getElementById('cm-name').value = c?.name || '';
  document.getElementById('cm-source').value = c?.source || '';
  document.getElementById('cm-modules').value = c?.modules?.join('\n') || '';
  document.getElementById('cm-delete-btn').style.display = c ? '' : 'none';
  openModal('modal-course');
}

function saveCourseModal() {
  const name = document.getElementById('cm-name').value.trim();
  if (!name) return alert('Nama topik wajib diisi.');
  const modules = document.getElementById('cm-modules').value.split('\n').map(m => m.trim()).filter(Boolean);
  if (!modules.length) return alert('Tambahkan minimal 1 modul.');
  const courses = getCourses();
  if (state.editingCourse) {
    const idx = courses.findIndex(c => c.id === state.editingCourse);
    if (idx > -1) { courses[idx].name = name; courses[idx].source = document.getElementById('cm-source').value; courses[idx].modules = modules; }
  } else {
    courses.push({ id: 'c' + Date.now(), name, source: document.getElementById('cm-source').value, modules, done: [] });
  }
  saveCourses(courses);
  closeModal('modal-course');
  renderBelajar();
}

function deleteCourseModal() {
  if (!confirm('Hapus topik ini? Progress yang sudah ada akan ikut terhapus.')) return;
  saveCourses(getCourses().filter(c => c.id !== state.editingCourse));
  closeModal('modal-course');
  renderBelajar();
}

// ===== RENDER: WEEKLY REVIEW =====
function renderReview() {
  const s = getSettings();
  const reviews = getReviews();
  document.getElementById('page-review').innerHTML = `
    <div class="page-content">
      <div class="page-header flex-between">
        <div><h1 class="page-title">${T('Weekly Review')}</h1>
        <p class="page-sub">${s.lang==='id'?'Isi setiap Rabu malam. Tanpa ini, semua hanya niat.':'Fill every Wednesday night. Without this, it\'s all just intention.'}</p></div>
        <button class="btn btn-primary btn-sm" onclick="openReviewForm(null)">+ ${s.lang==='id'?'Review baru':'New review'}</button>
      </div>
      ${reviews.length ? reviews.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map(r => `
        <div class="list-item">
          <div class="list-item-header">
            <div style="flex:1">
              <div class="list-item-title">${r.weekLabel || r.weekDate}</div>
              <div class="list-item-meta">${r.weekDate}${r.shift ? ` · Shift ${r.shift}` : ''}</div>
              <div style="display:flex;gap:10px;font-size:12px;color:var(--text2);margin-top:4px">
                <span>PM: ${r.pmHours||0}/10 jam</span>
                <span>${s.lang==='id'?'Habit':'Habits'}: ${r.habitDays||0}/7</span>
                <span>${s.lang==='id'?'Olahraga':'Exercise'}: ${r.olahraga||0}/4</span>
              </div>
            </div>
            <div class="list-item-actions">
              <button class="btn btn-ghost btn-icon btn-sm" onclick="openReviewForm('${r.id}')">✏️</button>
              <button class="btn btn-danger-outline btn-sm" onclick="deleteReview('${r.id}')">✕</button>
            </div>
          </div>
          ${r.bukti ? `<div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border)"><div class="text-xs font-bold text-muted" style="margin-bottom:4px">${s.lang==='id'?'Bukti progress':'Progress proof'}</div><div class="list-item-body" style="font-size:13px">${r.bukti.slice(0,200)}${r.bukti.length>200?'...':''}</div></div>` : ''}
        </div>`).join('') : `<div class="empty-state"><div class="empty-icon">📋</div><div class="empty-text">${T('Belum ada data')}</div></div>`}
    </div>`;
  renderReviewModal();
}

function renderReviewModal() {
  if (document.getElementById('modal-review')) return;
  const s = getSettings();
  document.body.insertAdjacentHTML('beforeend', `
    <div class="modal-overlay" id="modal-review">
      <div class="modal" style="max-width:600px">
        <div class="modal-header">
          <span class="modal-title" id="review-modal-title">Weekly Review</span>
          <button class="modal-close" onclick="closeModal('modal-review')">✕</button>
        </div>
        <div class="form-group">
          <label class="form-label">Label minggu (opsional)</label>
          <input type="text" id="rv-label" placeholder="Contoh: Minggu 1 Fase 1">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Tanggal</label>
            <input type="date" id="rv-date">
          </div>
          <div class="form-group">
            <label class="form-label">Shift aktif minggu ini</label>
            <select id="rv-shift"><option value="pagi">Pagi</option><option value="siang">Siang</option></select>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:1rem">
          <div><label class="form-label">Jam PM</label><input type="number" id="rv-pm" min="0" max="40" placeholder="0"></div>
          <div><label class="form-label">Hari habit</label><input type="number" id="rv-habit" min="0" max="7" placeholder="0"></div>
          <div><label class="form-label">Olahraga</label><input type="number" id="rv-ola" min="0" max="7" placeholder="0"></div>
          <div><label class="form-label">Sambilan (rb)</label><input type="number" id="rv-income" min="0" placeholder="0"></div>
        </div>
        <div class="form-group"><label class="form-label">Yang berjalan baik</label><textarea id="rv-baik" rows="2"></textarea></div>
        <div class="form-group"><label class="form-label">Yang perlu diperbaiki</label><textarea id="rv-perbaiki" rows="2"></textarea></div>
        <div class="form-group"><label class="form-label">Bukti progress <span style="color:var(--danger)">(wajib)</span></label><textarea id="rv-bukti" rows="2" placeholder="Apa yang bisa kamu tunjukkan dari minggu ini?"></textarea></div>
        <div class="form-group"><label class="form-label">Target minggu depan</label><textarea id="rv-target" rows="2" placeholder="Spesifik, bukan abstrak."></textarea></div>
        <div class="modal-footer">
          <button class="btn btn-danger-outline" id="rv-delete-btn" onclick="deleteReviewModal()" style="display:none">Hapus</button>
          <button class="btn btn-outline" onclick="closeModal('modal-review')">Batal</button>
          <button class="btn btn-primary" onclick="saveReviewModal()">Simpan</button>
        </div>
      </div>
    </div>`);
}

function openReviewForm(id) {
  state.editingReview = id;
  const r = id ? getReviews().find(x => x.id === id) : null;
  document.getElementById('review-modal-title').textContent = r ? 'Edit Review' : 'Weekly Review Baru';
  document.getElementById('rv-label').value = r?.weekLabel || '';
  document.getElementById('rv-date').value = r?.weekDate || new Date().toISOString().slice(0,10);
  document.getElementById('rv-shift').value = r?.shift || 'siang';
  document.getElementById('rv-pm').value = r?.pmHours || '';
  document.getElementById('rv-habit').value = r?.habitDays || '';
  document.getElementById('rv-ola').value = r?.olahraga || '';
  document.getElementById('rv-income').value = r?.sambilan || '';
  document.getElementById('rv-baik').value = r?.baik || '';
  document.getElementById('rv-perbaiki').value = r?.perbaiki || '';
  document.getElementById('rv-bukti').value = r?.bukti || '';
  document.getElementById('rv-target').value = r?.target || '';
  document.getElementById('rv-delete-btn').style.display = r ? '' : 'none';
  openModal('modal-review');
}

function saveReviewModal() {
  const bukti = document.getElementById('rv-bukti').value.trim();
  if (!bukti) return alert('Bukti progress wajib diisi.');
  const reviews = getReviews();
  const data = {
    weekLabel: document.getElementById('rv-label').value,
    weekDate: document.getElementById('rv-date').value,
    shift: document.getElementById('rv-shift').value,
    pmHours: document.getElementById('rv-pm').value,
    habitDays: document.getElementById('rv-habit').value,
    olahraga: document.getElementById('rv-ola').value,
    sambilan: document.getElementById('rv-income').value,
    baik: document.getElementById('rv-baik').value,
    perbaiki: document.getElementById('rv-perbaiki').value,
    bukti, target: document.getElementById('rv-target').value,
    createdAt: new Date().toISOString(),
  };
  if (state.editingReview) {
    const idx = reviews.findIndex(r => r.id === state.editingReview);
    if (idx > -1) { reviews[idx] = { ...reviews[idx], ...data }; }
  } else {
    reviews.push({ id: 'r' + Date.now(), ...data });
  }
  saveReviews(reviews);
  closeModal('modal-review');
  renderReview();
}

function deleteReview(id) {
  if (!confirm('Hapus review ini?')) return;
  saveReviews(getReviews().filter(r => r.id !== id));
  renderReview();
}

function deleteReviewModal() {
  if (!confirm('Hapus review ini?')) return;
  saveReviews(getReviews().filter(r => r.id !== state.editingReview));
  closeModal('modal-review');
  renderReview();
}

// ===== RENDER: PROYEK =====
function renderProyek() {
  const s = getSettings();
  const pg = document.getElementById('page-proyek');
  if (!pg.querySelector('.page-content')) {
    pg.innerHTML = `
      <div class="page-content">
        <div class="page-header flex-between">
          <div><h1 class="page-title">${T('Portofolio & Proyek')}</h1>
          <p class="page-sub">${s.lang==='id'?'Dokumentasi proyek sebagai bukti pengalaman nyata.':'Document projects as proof of real experience.'}</p></div>
          <button class="btn btn-primary btn-sm" onclick="openProyekModal(null)">+ ${s.lang==='id'?'Tambah proyek':'Add project'}</button>
        </div>
        <div class="search-bar"><span>🔍</span><input type="text" id="proyek-search" placeholder="${T('Cari...')}" oninput="state.searchQuery.proyek=this.value;renderProyekList()"></div>
        <div id="proyek-list"></div>
      </div>`;
  }
  const input = document.getElementById('proyek-search');
  if (input && document.activeElement !== input) input.value = state.searchQuery.proyek;
  renderProyekList();
  renderProyekModal();
}

function renderProyekList() {
  const s = getSettings();
  const q = state.searchQuery.proyek.toLowerCase();
  const projects = getProjects().filter(p => !q || p.title?.toLowerCase().includes(q) || p.masalah?.toLowerCase().includes(q));
  const active = projects.filter(p => p.status !== 'done');
  const done = projects.filter(p => p.status === 'done');
  const el = document.getElementById('proyek-list');
  if (!el) return;
  let html = '';
  if (active.length) html += `<div class="text-xs font-bold text-muted" style="margin-bottom:8px;text-transform:uppercase;letter-spacing:.06em">${s.lang==='id'?'Aktif':'Active'}</div>${active.map(p => renderProyekCard(p, s)).join('')}`;
  if (done.length) html += `<div class="text-xs font-bold text-muted" style="margin:16px 0 8px;text-transform:uppercase;letter-spacing:.06em">${s.lang==='id'?'Selesai':'Completed'}</div>${done.map(p => renderProyekCard(p, s)).join('')}`;
  if (!projects.length) html = `<div class="empty-state"><div class="empty-icon">💼</div><div class="empty-text">${T('Belum ada data')}</div></div>`;
  el.innerHTML = html;
}

function renderProyekCard(p, s) {
  const statusChip = { ongoing: 'chip-accent', done: 'chip-success', hold: 'chip-warn' };
  const statusLabel = { ongoing: s.lang==='id'?'Berlangsung':'Ongoing', done: s.lang==='id'?'Selesai':'Done', hold: s.lang==='id'?'Ditunda':'On Hold' };
  const typeLabel = { pekerjaan: s.lang==='id'?'Pekerjaan':'Work', freelance: 'Freelance', sambilan: s.lang==='id'?'Sambilan':'Side job', pribadi: s.lang==='id'?'Pribadi':'Personal' };
  return `<div class="list-item ${p.status==='done'?'':''}">
    <div class="list-item-header">
      <div style="flex:1">
        <div class="list-item-title">${p.title}</div>
        <div class="list-item-meta" style="margin-top:4px">
          <span class="chip ${statusChip[p.status]||'chip-neutral'}">${statusLabel[p.status]||p.status}</span>
          ${p.type ? `<span class="chip chip-neutral" style="margin-left:4px">${typeLabel[p.type]||p.type}</span>` : ''}
          ${p.periode ? `<span style="margin-left:8px">${p.periode}</span>` : ''}
        </div>
      </div>
      <div class="list-item-actions">
        <button class="btn btn-ghost btn-icon btn-sm" onclick="openProyekModal('${p.id}')">✏️</button>
        <button class="btn btn-danger-outline btn-sm" onclick="deleteProyek('${p.id}')">✕</button>
      </div>
    </div>
    ${p.masalah ? `<div class="list-item-body" style="margin-top:8px;font-size:13px">${p.masalah.slice(0,150)}${p.masalah.length>150?'...':''}</div>` : ''}
  </div>`;
}

function renderProyekModal() {
  if (document.getElementById('modal-proyek')) return;
  const s = getSettings();
  document.body.insertAdjacentHTML('beforeend', `
    <div class="modal-overlay" id="modal-proyek">
      <div class="modal" style="max-width:620px">
        <div class="modal-header">
          <span class="modal-title" id="proyek-modal-title">Tambah Proyek</span>
          <button class="modal-close" onclick="closeModal('modal-proyek')">✕</button>
        </div>
        <div class="form-group"><label class="form-label">Nama proyek</label><input type="text" id="pm-title" placeholder="Contoh: Redesign Website Pondok Pesantren..."></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Tipe proyek</label>
            <select id="pm-type"><option value="pekerjaan">Pekerjaan</option><option value="freelance">Freelance</option><option value="sambilan">Sambilan</option><option value="pribadi">Pribadi</option></select></div>
          <div class="form-group"><label class="form-label">Status</label>
            <select id="pm-status"><option value="ongoing">Berlangsung</option><option value="hold">Ditunda</option><option value="done">Selesai</option></select></div>
        </div>
        <div class="form-group"><label class="form-label">Periode</label><input type="text" id="pm-periode" placeholder="Contoh: Maret – Agustus 2025"></div>
        <div class="form-group"><label class="form-label">Masalah yang diselesaikan</label><textarea id="pm-masalah" rows="2" placeholder="Kenapa proyek ini dibuat? Apa masalahnya?"></textarea></div>
        <div class="form-group"><label class="form-label">Pihak yang terlibat</label><textarea id="pm-pihak" rows="2" placeholder="Siapa saja yang terlibat dan perannya masing-masing?"></textarea></div>
        <div class="form-group"><label class="form-label">Keputusan & proses</label><textarea id="pm-keputusan" rows="3" placeholder="Keputusan penting yang kamu buat dan alasannya."></textarea></div>
        <div class="form-group"><label class="form-label">Hambatan & cara mengatasinya</label><textarea id="pm-hambatan" rows="2"></textarea></div>
        <div class="form-group"><label class="form-label">Hasil & pembelajaran</label><textarea id="pm-hasil" rows="2"></textarea></div>
        <div class="modal-footer">
          <button class="btn btn-danger-outline" id="pm-delete-btn" onclick="deleteProyekModal()" style="display:none">Hapus</button>
          <button class="btn btn-outline" onclick="closeModal('modal-proyek')">Batal</button>
          <button class="btn btn-primary" onclick="saveProyekModal()">Simpan</button>
        </div>
      </div>
    </div>`);
}

function openProyekModal(id) {
  state.editingProject = id;
  const p = id ? getProjects().find(x => x.id === id) : null;
  document.getElementById('proyek-modal-title').textContent = p ? 'Edit Proyek' : 'Tambah Proyek';
  ['title','type','status','periode','masalah','pihak','keputusan','hambatan','hasil'].forEach(f => {
    const el = document.getElementById('pm-' + f);
    if (el) el.value = p?.[f] || (f==='status'?'ongoing':f==='type'?'pekerjaan':'');
  });
  document.getElementById('pm-delete-btn').style.display = p ? '' : 'none';
  openModal('modal-proyek');
}

function saveProyekModal() {
  const title = document.getElementById('pm-title').value.trim();
  if (!title) return alert('Nama proyek wajib diisi.');
  const projects = getProjects();
  const data = {};
  ['title','type','status','periode','masalah','pihak','keputusan','hambatan','hasil'].forEach(f => {
    data[f] = document.getElementById('pm-' + f)?.value || '';
  });
  data.updatedAt = new Date().toISOString();
  if (state.editingProject) {
    const idx = projects.findIndex(p => p.id === state.editingProject);
    if (idx > -1) projects[idx] = { ...projects[idx], ...data };
  } else {
    projects.push({ id: 'p' + Date.now(), createdAt: new Date().toISOString(), ...data });
  }
  saveProjects(projects);
  closeModal('modal-proyek');
  renderProyekList();
  renderDashboardIfActive();
}

function deleteProyek(id) {
  if (!confirm('Hapus proyek ini?')) return;
  saveProjects(getProjects().filter(p => p.id !== id));
  renderProyekList();
}

function deleteProyekModal() {
  if (!confirm('Hapus proyek ini?')) return;
  saveProjects(getProjects().filter(p => p.id !== state.editingProject));
  closeModal('modal-proyek');
  renderProyekList();
}

// ===== RENDER: CATATAN =====
function renderCatatan() {
  const s = getSettings();
  const pg = document.getElementById('page-catatan');
  // Only build shell once so search input keeps focus
  if (!pg.querySelector('.page-content')) {
    pg.innerHTML = `
      <div class="page-content">
        <div class="page-header flex-between">
          <div><h1 class="page-title">${T('Catatan Belajar')}</h1>
          <p class="page-sub">${s.lang==='id'?'Simpan insight dan ringkasan materi.':'Save insights and study summaries.'}</p></div>
          <button class="btn btn-primary btn-sm" onclick="openNoteModal(null)">+ ${T('Tambah')}</button>
        </div>
        <div class="search-bar"><span>🔍</span><input type="text" id="catatan-search" placeholder="${T('Cari...')}" oninput="state.searchQuery.catatan=this.value;renderCatatanList()"></div>
        <div id="catatan-list"></div>
      </div>`;
  }
  // Always restore search value and re-render list
  const input = document.getElementById('catatan-search');
  if (input && document.activeElement !== input) input.value = state.searchQuery.catatan;
  renderCatatanList();
  renderNoteModal();
}

function renderCatatanList() {
  const s = getSettings();
  const q = state.searchQuery.catatan.toLowerCase();
  const notes = getNotes().filter(n => !q || n.title?.toLowerCase().includes(q) || n.body?.toLowerCase().includes(q));
  const catColors = { PM: 'chip-accent', Admin: 'chip-warn', Kesehatan: 'chip-success', Habit: 'chip-success', Pribadi: 'chip-neutral' };
  const el = document.getElementById('catatan-list');
  if (!el) return;
  el.innerHTML = notes.length ? notes.sort((a,b) => b.createdAt - a.createdAt).map(n => `
    <div class="list-item">
      <div class="list-item-header">
        <div style="flex:1">
          <div class="list-item-title">${n.title}</div>
          <div class="list-item-meta" style="margin-top:4px">
            <span class="chip ${catColors[n.cat]||'chip-neutral'}">${n.cat}</span>
            <span style="margin-left:8px">${new Date(n.createdAt).toLocaleDateString(s.lang==='id'?'id-ID':'en-US',{day:'numeric',month:'short',year:'numeric'})}</span>
          </div>
        </div>
        <div class="list-item-actions">
          <button class="btn btn-ghost btn-icon btn-sm" onclick="openNoteModal('${n.id}')">✏️</button>
          <button class="btn btn-danger-outline btn-sm" onclick="deleteNote('${n.id}')">✕</button>
        </div>
      </div>
      <div class="list-item-body" style="margin-top:8px">${n.body.slice(0,200)}${n.body.length>200?'...':''}</div>
    </div>`).join('') : `<div class="empty-state"><div class="empty-icon">📝</div><div class="empty-text">${T('Belum ada data')}</div></div>`;
}

function renderNoteModal() {
  // Always remove and rebuild to get latest categories
  const existing = document.getElementById('modal-note');
  if (existing) existing.remove();
  const cats = getCats();
  document.body.insertAdjacentHTML('beforeend', `
    <div class="modal-overlay" id="modal-note">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title" id="note-modal-title">Catatan Baru</span>
          <button class="modal-close" onclick="closeModal('modal-note')">✕</button>
        </div>
        <div class="form-group"><label class="form-label">Judul</label><input type="text" id="nm-title" placeholder="Judul catatan"></div>
        <div class="form-group"><label class="form-label">Kategori</label>
          <select id="nm-cat">${cats.map(c=>`<option>${c}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label">Isi catatan</label><textarea id="nm-body" rows="7" placeholder="Tulis catatan, insight, atau ringkasan materi..."></textarea></div>
        <div class="modal-footer">
          <button class="btn btn-danger-outline" id="nm-delete-btn" onclick="deleteNoteModal()" style="display:none">Hapus</button>
          <button class="btn btn-outline" onclick="closeModal('modal-note')">Batal</button>
          <button class="btn btn-primary" onclick="saveNoteModal()">Simpan</button>
        </div>
      </div>
    </div>`);
}

function openNoteModal(id) {
  state.editingNote = id;
  const n = id ? getNotes().find(x => x.id === id) : null;
  document.getElementById('note-modal-title').textContent = n ? 'Edit Catatan' : 'Catatan Baru';
  document.getElementById('nm-title').value = n?.title || '';
  document.getElementById('nm-cat').value = n?.cat || getCats()[0];
  document.getElementById('nm-body').value = n?.body || '';
  document.getElementById('nm-delete-btn').style.display = n ? '' : 'none';
  openModal('modal-note');
}

function saveNoteModal() {
  const title = document.getElementById('nm-title').value.trim();
  const body = document.getElementById('nm-body').value.trim();
  if (!title || !body) return alert('Judul dan isi catatan wajib diisi.');
  const notes = getNotes();
  const data = { title, cat: document.getElementById('nm-cat').value, body, createdAt: Date.now() };
  if (state.editingNote) {
    const idx = notes.findIndex(n => n.id === state.editingNote);
    if (idx > -1) notes[idx] = { ...notes[idx], ...data };
  } else {
    notes.push({ id: 'n' + Date.now(), ...data });
  }
  saveNotes(notes);
  closeModal('modal-note');
  renderCatatanList();
  renderDashboardIfActive();
}

function deleteNote(id) {
  if (!confirm('Hapus catatan ini?')) return;
  saveNotes(getNotes().filter(n => n.id !== id));
  renderCatatanList();
}

function deleteNoteModal() {
  if (!confirm('Hapus catatan ini?')) return;
  saveNotes(getNotes().filter(n => n.id !== state.editingNote));
  closeModal('modal-note');
  renderCatatanList();
}

// ===== RENDER: JURNAL =====
function renderJurnal() {
  const s = getSettings();
  const pg = document.getElementById('page-jurnal');
  if (!pg.querySelector('.page-content')) {
    pg.innerHTML = `
      <div class="page-content">
        <div class="page-header flex-between">
          <div><h1 class="page-title">${T('Jurnal Karir')}</h1>
          <p class="page-sub">${s.lang==='id'?'Catat momen penting perjalanan karir kamu.':'Record important moments in your career journey.'}</p></div>
          <button class="btn btn-primary btn-sm" onclick="openJurnalModal(null)">+ ${T('Tambah')}</button>
        </div>
        <div class="search-bar"><span>🔍</span><input type="text" id="jurnal-search" placeholder="${T('Cari...')}" oninput="state.searchQuery.jurnal=this.value;renderJurnalList()"></div>
        <div id="jurnal-list"></div>
      </div>`;
  }
  const input = document.getElementById('jurnal-search');
  if (input && document.activeElement !== input) input.value = state.searchQuery.jurnal;
  renderJurnalList();
  renderJurnalModal();
}

function renderJurnalList() {
  const s = getSettings();
  const q = state.searchQuery.jurnal.toLowerCase();
  const journals = getJournal().filter(j => !q || j.title?.toLowerCase().includes(q) || j.body?.toLowerCase().includes(q));
  const moodEmoji = { great: '🌟', good: '😊', ok: '😐', bad: '😔', terrible: '😞' };
  const moodLabel = { great: s.lang==='id'?'Luar biasa':'Great', good: s.lang==='id'?'Baik':'Good', ok: 'OK', bad: s.lang==='id'?'Buruk':'Bad', terrible: s.lang==='id'?'Sangat buruk':'Terrible' };
  const el = document.getElementById('jurnal-list');
  if (!el) return;
  el.innerHTML = journals.length ? journals.sort((a,b) => b.createdAt - a.createdAt).map(j => `
    <div class="list-item">
      <div class="list-item-header">
        <div style="flex:1">
          <div class="list-item-title">${j.title}</div>
          <div class="list-item-meta" style="margin-top:4px">
            ${j.mood ? `<span style="margin-right:8px">${moodEmoji[j.mood]} ${moodLabel[j.mood]||j.mood}</span>` : ''}
            <span class="chip chip-neutral">${j.type||'Umum'}</span>
            <span style="margin-left:8px">${new Date(j.createdAt).toLocaleDateString(s.lang==='id'?'id-ID':'en-US',{day:'numeric',month:'short',year:'numeric'})}</span>
          </div>
        </div>
        <div class="list-item-actions">
          <button class="btn btn-ghost btn-icon btn-sm" onclick="openJurnalModal('${j.id}')">✏️</button>
          <button class="btn btn-danger-outline btn-sm" onclick="deleteJurnal('${j.id}')">✕</button>
        </div>
      </div>
      <div class="list-item-body" style="margin-top:8px">${j.body.slice(0,200)}${j.body.length>200?'...':''}</div>
    </div>`).join('') : `<div class="empty-state"><div class="empty-icon">📖</div><div class="empty-text">${T('Belum ada data')}</div></div>`;
}

function renderJurnalModal() {
  if (document.getElementById('modal-jurnal')) return;
  const s = getSettings();
  document.body.insertAdjacentHTML('beforeend', `
    <div class="modal-overlay" id="modal-jurnal">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title" id="jurnal-modal-title">Entri Jurnal Baru</span>
          <button class="modal-close" onclick="closeModal('modal-jurnal')">✕</button>
        </div>
        <div class="form-group"><label class="form-label">Judul / Topik</label><input type="text" id="jm-title" placeholder="Contoh: Wawancara pertama, Feedback dari recruiter..."></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Tipe momen</label>
            <select id="jm-type">
              <option value="wawancara">${s.lang==='id'?'Wawancara':'Interview'}</option>
              <option value="pencapaian">${s.lang==='id'?'Pencapaian':'Achievement'}</option>
              <option value="refleksi">${s.lang==='id'?'Refleksi':'Reflection'}</option>
              <option value="feedback">Feedback</option>
              <option value="pelajaran">${s.lang==='id'?'Pelajaran':'Lesson'}</option>
              <option value="umum">${s.lang==='id'?'Umum':'General'}</option>
            </select></div>
          <div class="form-group"><label class="form-label">${s.lang==='id'?'Perasaan':'Mood'}</label>
            <select id="jm-mood">
              <option value="great">${s.lang==='id'?'🌟 Luar biasa':'🌟 Great'}</option>
              <option value="good">${s.lang==='id'?'😊 Baik':'😊 Good'}</option>
              <option value="ok">😐 OK</option>
              <option value="bad">${s.lang==='id'?'😔 Buruk':'😔 Bad'}</option>
              <option value="terrible">${s.lang==='id'?'😞 Sangat buruk':'😞 Terrible'}</option>
            </select></div>
        </div>
        <div class="form-group"><label class="form-label">Cerita / Catatan</label><textarea id="jm-body" rows="7" placeholder="${s.lang==='id'?'Apa yang terjadi? Apa yang kamu rasakan? Apa yang kamu pelajari?':'What happened? How did you feel? What did you learn?'}"></textarea></div>
        <div class="modal-footer">
          <button class="btn btn-danger-outline" id="jm-delete-btn" onclick="deleteJurnalModal()" style="display:none">Hapus</button>
          <button class="btn btn-outline" onclick="closeModal('modal-jurnal')">Batal</button>
          <button class="btn btn-primary" onclick="saveJurnalModal()">Simpan</button>
        </div>
      </div>
    </div>`);
}

function openJurnalModal(id) {
  state.editingJournal = id;
  const j = id ? getJournal().find(x => x.id === id) : null;
  document.getElementById('jurnal-modal-title').textContent = j ? 'Edit Entri Jurnal' : 'Entri Jurnal Baru';
  document.getElementById('jm-title').value = j?.title || '';
  document.getElementById('jm-type').value = j?.type || 'umum';
  document.getElementById('jm-mood').value = j?.mood || 'good';
  document.getElementById('jm-body').value = j?.body || '';
  document.getElementById('jm-delete-btn').style.display = j ? '' : 'none';
  openModal('modal-jurnal');
}

function saveJurnalModal() {
  const title = document.getElementById('jm-title').value.trim();
  const body = document.getElementById('jm-body').value.trim();
  if (!title || !body) return alert('Judul dan isi jurnal wajib diisi.');
  const journals = getJournal();
  const data = { title, type: document.getElementById('jm-type').value, mood: document.getElementById('jm-mood').value, body, createdAt: Date.now() };
  if (state.editingJournal) {
    const idx = journals.findIndex(j => j.id === state.editingJournal);
    if (idx > -1) journals[idx] = { ...journals[idx], ...data };
  } else {
    journals.push({ id: 'j' + Date.now(), ...data });
  }
  saveJournal(journals);
  closeModal('modal-jurnal');
  renderJurnalList();
}

function deleteJurnal(id) {
  if (!confirm('Hapus entri jurnal ini?')) return;
  saveJournal(getJournal().filter(j => j.id !== id));
  renderJurnalList();
}

function deleteJurnalModal() {
  if (!confirm('Hapus entri jurnal ini?')) return;
  saveJournal(getJournal().filter(j => j.id !== state.editingJournal));
  closeModal('modal-jurnal');
  renderJurnalList();
}

// ===== RENDER: MILESTONE =====
function renderMilestone() {
  const s = getSettings();
  const milestones = getMilestones();
  const active = milestones.filter(m => !m.done).sort((a,b) => new Date(a.deadline) - new Date(b.deadline));
  const done = milestones.filter(m => m.done);

  document.getElementById('page-milestone').innerHTML = `
    <div class="page-content">
      <div class="page-header flex-between">
        <div><h1 class="page-title">${T('Target & Milestone')}</h1>
        <p class="page-sub">${s.lang==='id'?'Set target besar, pantau progress, rayakan pencapaian.':'Set big targets, track progress, celebrate wins.'}</p></div>
        <button class="btn btn-primary btn-sm" onclick="openMilestoneModal(null)">+ ${s.lang==='id'?'Tambah target':'Add target'}</button>
      </div>
      ${active.length ? active.map(m => renderMilestoneCard(m, s, false)).join('') : ''}
      ${done.length ? `<div class="text-xs font-bold text-muted" style="margin:16px 0 8px;text-transform:uppercase;letter-spacing:.06em">${s.lang==='id'?'Tercapai':'Achieved'} 🎉</div>${done.map(m => renderMilestoneCard(m, s, true)).join('')}` : ''}
      ${!milestones.length ? `<div class="empty-state"><div class="empty-icon">🎯</div><div class="empty-text">${T('Belum ada data')}</div></div>` : ''}
    </div>`;
  renderMilestoneModal();
}

function renderMilestoneCard(m, s, isDone) {
  const daysLeft = Math.ceil((new Date(m.deadline) - new Date()) / 86400000);
  const overdue = daysLeft < 0 && !isDone;
  const pct = m.progress || 0;
  return `<div class="milestone-item ${isDone?'done-item':''}">
    <div class="milestone-header">
      <div style="flex:1">
        <div class="milestone-title">${m.title}</div>
        <div class="milestone-deadline ${overdue?'milestone-overdue':'text-faint'}">
          ${isDone ? (s.lang==='id'?'✓ Tercapai':'✓ Achieved') : overdue ? (s.lang==='id'?`Terlambat ${Math.abs(daysLeft)} hari`:`${Math.abs(daysLeft)} days overdue`) : `${daysLeft} ${s.lang==='id'?'hari lagi':'days left'}`} · ${m.deadline}
        </div>
        ${m.desc ? `<div class="text-sm text-muted" style="margin-top:4px">${m.desc}</div>` : ''}
      </div>
      <div style="display:flex;gap:6px">
        ${!isDone ? `<button class="btn btn-success btn-sm btn-icon" onclick="completeMilestone('${m.id}')" title="${s.lang==='id'?'Tandai selesai':'Mark done'}">✓</button>` : ''}
        <button class="btn btn-ghost btn-icon btn-sm" onclick="openMilestoneModal('${m.id}')">✏️</button>
        <button class="btn btn-danger-outline btn-sm" onclick="deleteMilestone('${m.id}')">✕</button>
      </div>
    </div>
    ${!isDone ? `<div class="milestone-progress">
      <div class="flex-between" style="margin-bottom:4px">
        <span class="text-xs text-muted">${s.lang==='id'?'Progress':'Progress'}</span>
        <span class="text-xs text-muted">${pct}%</span>
      </div>
      <div class="progress-bar"><div class="progress-fill amber" style="width:${pct}%"></div></div>
      <input type="range" min="0" max="100" value="${pct}" style="width:100%;margin-top:6px;accent-color:var(--warn-mid)" onchange="updateMilestoneProgress('${m.id}',this.value)">
    </div>` : ''}
  </div>`;
}

function renderMilestoneModal() {
  if (document.getElementById('modal-milestone')) return;
  document.body.insertAdjacentHTML('beforeend', `
    <div class="modal-overlay" id="modal-milestone">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title" id="milestone-modal-title">Target Baru</span>
          <button class="modal-close" onclick="closeModal('modal-milestone')">✕</button>
        </div>
        <div class="form-group"><label class="form-label">Judul target</label><input type="text" id="mm-title" placeholder="Contoh: Selesaikan Google PM Certificate"></div>
        <div class="form-group"><label class="form-label">Deskripsi (opsional)</label><textarea id="mm-desc" rows="2" placeholder="Kenapa target ini penting?"></textarea></div>
        <div class="form-group"><label class="form-label">Deadline</label><input type="date" id="mm-deadline"></div>
        <div class="modal-footer">
          <button class="btn btn-danger-outline" id="mm-delete-btn" onclick="deleteMilestoneModal()" style="display:none">Hapus</button>
          <button class="btn btn-outline" onclick="closeModal('modal-milestone')">Batal</button>
          <button class="btn btn-primary" onclick="saveMilestoneModal()">Simpan</button>
        </div>
      </div>
    </div>`);
}

function openMilestoneModal(id) {
  state.editingMilestone = id;
  const m = id ? getMilestones().find(x => x.id === id) : null;
  document.getElementById('milestone-modal-title').textContent = m ? 'Edit Target' : 'Target Baru';
  document.getElementById('mm-title').value = m?.title || '';
  document.getElementById('mm-desc').value = m?.desc || '';
  document.getElementById('mm-deadline').value = m?.deadline || '';
  document.getElementById('mm-delete-btn').style.display = m ? '' : 'none';
  openModal('modal-milestone');
}

function saveMilestoneModal() {
  const title = document.getElementById('mm-title').value.trim();
  const deadline = document.getElementById('mm-deadline').value;
  if (!title || !deadline) return alert('Judul dan deadline wajib diisi.');
  const milestones = getMilestones();
  const data = { title, desc: document.getElementById('mm-desc').value, deadline };
  if (state.editingMilestone) {
    const idx = milestones.findIndex(m => m.id === state.editingMilestone);
    if (idx > -1) milestones[idx] = { ...milestones[idx], ...data };
  } else {
    milestones.push({ id: 'm' + Date.now(), progress: 0, done: false, ...data });
  }
  saveMilestones(milestones);
  closeModal('modal-milestone');
  renderMilestone();
  renderDashboardIfActive();
}

function completeMilestone(id) {
  const milestones = getMilestones();
  const idx = milestones.findIndex(m => m.id === id);
  if (idx > -1) { milestones[idx].done = true; milestones[idx].progress = 100; }
  saveMilestones(milestones);
  renderMilestone();
  renderDashboardIfActive();
}

function deleteMilestone(id) {
  if (!confirm('Hapus target ini?')) return;
  saveMilestones(getMilestones().filter(m => m.id !== id));
  renderMilestone();
  renderDashboardIfActive();
}

function deleteMilestoneModal() {
  if (!confirm('Hapus target ini?')) return;
  saveMilestones(getMilestones().filter(m => m.id !== state.editingMilestone));
  closeModal('modal-milestone');
  renderMilestone();
}

function updateMilestoneProgress(id, val) {
  const milestones = getMilestones();
  const idx = milestones.findIndex(m => m.id === id);
  if (idx > -1) milestones[idx].progress = parseInt(val);
  saveMilestones(milestones);
  renderDashboardIfActive();
}

// ===== RENDER: SETTINGS =====
function renderSettings() {
  const s = getSettings();
  const cats = getCats();
  const colorPresets = ['#3C3489','#1D6E55','#C05621','#0E5A8A','#6B2D8B','#B5232B','#1A5276','#2E4057'];

  document.getElementById('page-settings').innerHTML = `
    <div class="page-content">
      <div class="page-header"><h1 class="page-title">${T('Pengaturan')}</h1></div>

      <div class="settings-section">
        <div class="settings-section-title">${s.lang==='id'?'Tampilan':'Appearance'}</div>
        <div class="settings-row">
          <div><div class="settings-label">${s.lang==='id'?'Nama aplikasi':'App name'}</div></div>
          <div style="display:flex;gap:8px">
            <input type="text" id="set-appname" value="${s.appName}" style="width:180px">
            <button class="btn btn-outline btn-sm" onclick="saveAppName()">${T('Simpan')}</button>
          </div>
        </div>
        <div class="settings-row">
          <div><div class="settings-label">${s.lang==='id'?'Tema':'Theme'}</div></div>
          <div class="toggle-row" style="margin:0">
            <button class="toggle-btn ${s.theme==='light'?'active':''}" onclick="setTheme('light')">☀️ Light</button>
            <button class="toggle-btn ${s.theme==='dark'?'active':''}" onclick="setTheme('dark')">🌙 Dark</button>
          </div>
        </div>
        <div class="settings-row">
          <div><div class="settings-label">${s.lang==='id'?'Warna aksen':'Accent color'}</div></div>
          <div class="color-options">
            ${colorPresets.map(c => `<div class="color-opt ${s.accentColor===c?'selected':''}" style="background:${c}" onclick="setAccent('${c}')"></div>`).join('')}
            <div class="color-opt-custom" title="Custom color"><input type="color" value="${s.accentColor}" onchange="setAccent(this.value)"></div>
          </div>
        </div>
        <div class="settings-row">
          <div><div class="settings-label">${s.lang==='id'?'Shift aktif minggu ini':'Active shift this week'}</div>
          <div class="settings-sub">${s.lang==='id'?'Digunakan sebagai default Jadwal Hari Ini':'Used as default for Today\'s Schedule'}</div></div>
          <div class="toggle-row" style="margin:0">
            <button class="toggle-btn ${(s.shift||'siang')==='pagi'?'active':''}" onclick="setShift('pagi')">${s.lang==='id'?'Pagi':'Morning'}</button>
            <button class="toggle-btn ${(s.shift||'siang')==='siang'?'active':''}" onclick="setShift('siang')">${s.lang==='id'?'Siang':'Afternoon'}</button>
          </div>
        </div>
        <div class="settings-row">
          <div><div class="settings-label">${s.lang==='id'?'Bahasa':'Language'}</div></div>
          <select id="set-lang" onchange="setLang(this.value)" style="width:160px">
            <option value="id" ${s.lang==='id'?'selected':''}>Bahasa Indonesia</option>
            <option value="en" ${s.lang==='en'?'selected':''}>English</option>
          </select>
        </div>
      </div>

      ${renderScheduleTemplateSettings()}

      <div class="settings-section">
        <div class="settings-section-title">${s.lang==='id'?'Kategori habit':'Habit categories'}</div>
        <div id="cats-list" style="margin-bottom:12px">${cats.map((c,i) => `
          <div class="flex-between card-sm" style="margin-bottom:6px">
            <span class="text-sm">${c}</span>
            <button class="btn btn-danger-outline btn-sm" onclick="deleteCat(${i})">✕</button>
          </div>`).join('')}</div>
        <div style="display:flex;gap:8px">
          <input type="text" id="new-cat-input" placeholder="${s.lang==='id'?'Nama kategori baru...':'New category name...'}" style="flex:1">
          <button class="btn btn-outline btn-sm" onclick="addCat()">+ ${T('Tambah')}</button>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-section-title">${s.lang==='id'?'Data':'Data'}</div>
        <div class="settings-row">
          <div><div class="settings-label">${s.lang==='id'?'Ekspor semua data':'Export all data'}</div>
          <div class="settings-sub">${s.lang==='id'?'Simpan sebagai file JSON untuk backup':'Save as JSON file for backup'}</div></div>
          <button class="btn btn-outline btn-sm" onclick="exportData()">📥 Export</button>
        </div>
        <div class="settings-row">
          <div><div class="settings-label">${s.lang==='id'?'Import data':'Import data'}</div>
          <div class="settings-sub">${s.lang==='id'?'Restore dari file JSON':'Restore from JSON file'}</div></div>
          <label class="btn btn-outline btn-sm" style="cursor:pointer">📤 Import<input type="file" accept=".json" style="display:none" onchange="importData(this)"></label>
        </div>
      </div>

      <div class="settings-section">
        <div class="settings-section-title" style="color:var(--danger)">${s.lang==='id'?'Reset data':'Reset data'}</div>
        ${[
          ['habit', s.lang==='id'?'Reset data habit harian':'Reset daily habit data'],
          ['belajar', s.lang==='id'?'Reset progress belajar':'Reset learning progress'],
          ['reviews', s.lang==='id'?'Reset weekly review':'Reset weekly reviews'],
          ['proyek', s.lang==='id'?'Reset portofolio & proyek':'Reset portfolio & projects'],
          ['catatan', s.lang==='id'?'Reset catatan belajar':'Reset study notes'],
          ['jurnal', s.lang==='id'?'Reset jurnal karir':'Reset career journal'],
          ['milestone', s.lang==='id'?'Reset target & milestone':'Reset targets & milestones'],
        ].map(([k, label]) => `
          <div class="settings-row">
            <div><div class="settings-label">${label}</div></div>
            <button class="btn btn-danger-outline btn-sm" onclick="resetData('${k}')">${s.lang==='id'?'Reset':'Reset'}</button>
          </div>`).join('')}
      </div>
    </div>`;
}

function saveAppName() {
  const s = getSettings();
  s.appName = document.getElementById('set-appname').value.trim() || 'Growth System';
  saveSettings(s);
}

function setShift(shift) {
  const s = getSettings(); s.shift = shift; saveSettings(s); renderSettings();
}

function setTheme(t) {
  const s = getSettings(); s.theme = t; saveSettings(s); renderSettings();
}

function setAccent(c) {
  const s = getSettings(); s.accentColor = c; saveSettings(s); renderSettings();
}

function setLang(l) {
  const s = getSettings(); s.lang = l; saveSettings(s);
  goTo(state.page);
  renderSettings();
}

function addCat() {
  const val = document.getElementById('new-cat-input').value.trim();
  if (!val) return;
  const cats = getCats();
  if (!cats.includes(val)) { cats.push(val); saveCats(cats); }
  renderSettings();
}

function deleteCat(i) {
  const cats = getCats();
  cats.splice(i, 1);
  saveCats(cats);
  renderSettings();
}

function exportData() {
  const data = {};
  S.keys().forEach(k => { data[k] = S.get(k); });
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `growth-system-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importData(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (!confirm('Import akan mengganti semua data yang ada. Lanjutkan?')) return;
      Object.entries(data).forEach(([k, v]) => S.set(k, v));
      applySettings(getSettings());
      goTo('dashboard');
      alert('Data berhasil diimport!');
    } catch { alert('File tidak valid. Pastikan file JSON yang digunakan benar.'); }
  };
  reader.readAsText(file);
}

function resetData(key) {
  const labels = { habit: 'data habit harian', belajar: 'progress belajar', reviews: 'weekly review', proyek: 'portofolio & proyek', catatan: 'catatan belajar', jurnal: 'jurnal karir', milestone: 'target & milestone' };
  if (!confirm(`Reset ${labels[key]}? Data tidak bisa dikembalikan.`)) return;
  const keyMap = {
    habit: () => S.keys().filter(k => k.startsWith('day_')).forEach(k => S.del(k)),
    belajar: () => S.del('courses_config'),
    reviews: () => S.del('reviews'),
    proyek: () => S.del('projects'),
    catatan: () => S.del('notes'),
    jurnal: () => S.del('journal'),
    milestone: () => S.del('milestones'),
  };
  keyMap[key]?.();
  alert('Data berhasil direset.');
  renderSettings();
}

// ===== JADWAL HARI INI =====

const DEFAULT_TEMPLATES = {
  pagi: [
    { time: '04.00', end: '05.45', label: 'Bangun, ibadah, sarapan, siap', cat: 'ibadah' },
    { time: '05.45', end: '06.00', label: 'Berangkat kerja', cat: 'kerja' },
    { time: '06.00', end: '14.00', label: 'Kerja — shift pagi', cat: 'kerja' },
    { time: '14.00', end: '15.30', label: 'Pulang, makan, istirahat', cat: 'istirahat' },
    { time: '15.30', end: '17.00', label: 'Belajar PM / Olahraga', cat: 'belajar' },
    { time: '17.00', end: '18.30', label: 'Belajar PM lanjut / Bebas', cat: 'belajar' },
    { time: '18.30', end: '21.30', label: 'Makan, istirahat, ibadah', cat: 'istirahat' },
    { time: '21.30', end: '22.00', label: 'Review / sambilan remote', cat: 'belajar' },
    { time: '22.00', end: '04.00', label: 'Tidur', cat: 'tidur' },
  ],
  siang: [
    { time: '04.00', end: '06.30', label: 'Bangun, ibadah, sarapan', cat: 'ibadah' },
    { time: '06.30', end: '08.30', label: 'Belajar PM — Google Certificate', cat: 'belajar' },
    { time: '08.30', end: '10.00', label: 'Olahraga / Bebas / Jastip', cat: 'olahraga' },
    { time: '10.00', end: '12.00', label: 'Bersih diri, siap kerja', cat: 'istirahat' },
    { time: '12.00', end: '20.00', label: 'Kerja — shift siang', cat: 'kerja' },
    { time: '20.00', end: '21.30', label: 'Makan, istirahat, ibadah', cat: 'istirahat' },
    { time: '21.30', end: '22.00', label: 'Review / sambilan remote', cat: 'belajar' },
    { time: '22.00', end: '04.00', label: 'Tidur', cat: 'tidur' },
  ],
  libur: [
    { time: '04.00', end: '05.30', label: 'Bangun, ibadah, sarapan', cat: 'ibadah' },
    { time: '05.30', end: '07.30', label: 'Belajar PM — sesi panjang', cat: 'belajar' },
    { time: '07.30', end: '09.00', label: 'Olahraga', cat: 'olahraga' },
    { time: '09.00', end: '12.00', label: 'Belajar PM lanjut / praktik Figma', cat: 'belajar' },
    { time: '12.00', end: '14.00', label: 'Makan siang, istirahat', cat: 'istirahat' },
    { time: '14.00', end: '17.00', label: 'Belajar PM / case study / bebas', cat: 'belajar' },
    { time: '17.00', end: '20.00', label: 'Bebas / jastip / evaluasi mingguan', cat: 'bebas' },
    { time: '20.00', end: '22.00', label: 'Makan, istirahat, ibadah', cat: 'istirahat' },
    { time: '22.00', end: '04.00', label: 'Tidur', cat: 'tidur' },
  ],
};

function getTemplates() {
  return S.get('schedule_templates', DEFAULT_TEMPLATES);
}
function saveTemplates(t) { S.set('schedule_templates', t); }

function getActiveTemplate() {
  const override = S.get('schedule_override_' + todayKey(), null);
  if (override) return override;
  const s = getSettings();
  return s.shift || 'siang';
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function timeToMinutes(t) {
  const [h, m] = t.replace('.', ':').split(':').map(Number);
  return h * 60 + (m || 0);
}

function validateSlotTime(time, end) {
  const tMin = timeToMinutes(time);
  const eMin = timeToMinutes(end);
  // Allow crossing midnight (e.g. 22.00 → 04.00)
  if (eMin === tMin) return false;
  return true;
}

function getCurrentSlotIndex(slots) {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  for (let i = 0; i < slots.length; i++) {
    const start = timeToMinutes(slots[i].time);
    let end = timeToMinutes(slots[i].end);
    if (end <= start) end += 24 * 60;
    const nowAdj = (nowMin < start && end > 24 * 60) ? nowMin + 24 * 60 : nowMin;
    if (nowAdj >= start && nowAdj < end) return i;
  }
  return -1;
}

function getDayProgress(slots) {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const nonSleepSlots = slots.filter(s => s.cat !== 'tidur');
  if (!nonSleepSlots.length) return 0;
  const last = nonSleepSlots[nonSleepSlots.length - 1];
  const dayStart = timeToMinutes(nonSleepSlots[0].time);
  const dayEnd = timeToMinutes(last.end);
  if (nowMin <= dayStart) return 0;
  if (nowMin >= dayEnd) return 100;
  return Math.round(((nowMin - dayStart) / (dayEnd - dayStart)) * 100);
}

function renderJadwal() {
  const s = getSettings();
  const templates = getTemplates();
  const activeKey = getActiveTemplate();
  const slots = templates[activeKey] || templates.siang;
  const currentIdx = getCurrentSlotIndex(slots);
  const dayPct = getDayProgress(slots);
  const override = S.get('schedule_override_' + todayKey(), null);

  const dayNames = s.lang === 'id'
    ? ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu']
    : ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = s.lang === 'id'
    ? ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des']
    : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const today = new Date();
  const dateStr = `${dayNames[today.getDay()]}, ${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;

  const templateLabels = {
    pagi: s.lang === 'id' ? 'Shift Pagi' : 'Morning Shift',
    siang: s.lang === 'id' ? 'Shift Siang' : 'Afternoon Shift',
    libur: s.lang === 'id' ? 'Hari Libur' : 'Day Off',
  };

  const catColors = {
    belajar: 'var(--accent)',
    kerja: '#0C447C',
    olahraga: '#D85A30',
    ibadah: '#1D9E75',
    istirahat: 'var(--color-text-secondary)',
    tidur: 'var(--color-text-tertiary)',
    bebas: '#6B2D8B',
  };
  const catBg = {
    belajar: 'rgba(127,119,221,0.1)',
    kerja: 'rgba(55,138,221,0.1)',
    olahraga: 'rgba(216,90,48,0.1)',
    ibadah: 'rgba(29,158,117,0.1)',
    istirahat: 'var(--color-background-secondary)',
    tidur: 'var(--color-background-tertiary)',
    bebas: 'rgba(107,45,139,0.1)',
  };

  const pg = document.getElementById('page-jadwal');
  pg.innerHTML = `
    <div class="page-content">
      <div class="page-header">
        <div class="flex-between" style="align-items:flex-start;flex-wrap:wrap;gap:12px">
          <div>
            <h1 class="page-title">${s.lang === 'id' ? 'Jadwal Hari Ini' : "Today's Schedule"}</h1>
            <p class="page-sub">${dateStr}</p>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <span class="chip chip-accent">${templateLabels[activeKey]}</span>
            ${override ? `<span class="chip chip-warn">${s.lang==='id'?'Override manual':'Manual override'}</span>` : ''}
          </div>
        </div>

        <div class="card" style="margin-top:1rem;padding:1rem 1.25rem">
          <div class="flex-between" style="margin-bottom:8px">
            <span class="text-sm font-medium">${s.lang==='id'?'Progress hari ini':'Day progress'}</span>
            <span class="text-sm text-muted">${dayPct}%</span>
          </div>
          <div class="progress-bar" style="height:10px;margin-bottom:1rem">
            <div class="progress-fill green" style="width:${dayPct}%"></div>
          </div>
          <div class="form-label" style="margin-bottom:6px">${s.lang==='id'?'Ganti template hari ini:':'Override today\'s template:'}</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            ${Object.entries(templateLabels).map(([k, label]) =>
              `<button class="btn btn-sm ${activeKey === k ? 'btn-primary' : 'btn-outline'}" onclick="setScheduleOverride('${k}')">${label}</button>`
            ).join('')}
            ${override ? `<button class="btn btn-sm btn-danger-outline" onclick="clearScheduleOverride()">${s.lang==='id'?'Reset ke default':'Reset to default'}</button>` : ''}
          </div>
        </div>
      </div>

      <div id="jadwal-timeline">
        ${slots.map((slot, i) => {
          const isCurrent = i === currentIdx;
          const isPast = currentIdx >= 0 ? i < currentIdx : false;
          const color = catColors[slot.cat] || 'var(--color-text-secondary)';
          const bg = catBg[slot.cat] || 'var(--color-background-secondary)';
          return `
            <div style="display:flex;gap:12px;margin-bottom:8px;opacity:${isPast ? '0.45' : '1'}">
              <div style="width:48px;flex-shrink:0;text-align:right;padding-top:12px">
                <span style="font-size:12px;font-weight:500;color:var(--color-text-secondary)">${slot.time}</span>
              </div>
              <div style="display:flex;flex-direction:column;align-items:center;gap:0;flex-shrink:0">
                <div style="width:${isCurrent ? '12px' : '8px'};height:${isCurrent ? '12px' : '8px'};border-radius:50%;background:${isCurrent ? color : 'var(--color-border-secondary)'};margin-top:14px;transition:all .2s;${isCurrent ? 'box-shadow:0 0 0 3px ' + bg : ''}"></div>
                <div style="width:2px;flex:1;background:var(--color-border-tertiary);margin-top:4px;min-height:24px"></div>
              </div>
              <div style="flex:1;background:${isCurrent ? bg : 'transparent'};border:1px solid ${isCurrent ? color + '40' : 'transparent'};border-radius:var(--border-radius-sm);padding:${isCurrent ? '10px 14px' : '8px 14px'};transition:all .2s">
                <div style="font-size:${isCurrent ? '14px' : '13px'};font-weight:${isCurrent ? '500' : '400'};color:${isCurrent ? color : 'var(--color-text-primary)'}">${slot.label}</div>
                <div style="font-size:11px;color:var(--color-text-tertiary);margin-top:2px">${slot.time} – ${slot.end}${isCurrent ? ` · <span style="color:${color};font-weight:500">${s.lang==='id'?'Sekarang':'Now'}</span>` : ''}</div>
              </div>
            </div>`;
        }).join('')}
      </div>
    </div>`;

  clearTimeout(window._jadwalTimer);
  window._jadwalTimer = setTimeout(() => { if (state.page === 'jadwal') renderJadwal(); }, 60000);
}

function setScheduleOverride(templateKey) {
  S.set('schedule_override_' + todayKey(), templateKey);
  renderJadwal();
}

function clearScheduleOverride() {
  S.del('schedule_override_' + todayKey());
  renderJadwal();
}

// Add schedule template editing to settings
function renderScheduleTemplateSettings() {
  const s = getSettings();
  const templates = getTemplates();
  const templateNames = {
    pagi: s.lang === 'id' ? 'Shift Pagi' : 'Morning Shift',
    siang: s.lang === 'id' ? 'Shift Siang' : 'Afternoon Shift',
    libur: s.lang === 'id' ? 'Hari Libur' : 'Day Off',
  };

  return `
    <div class="settings-section">
      <div class="settings-section-title">${s.lang === 'id' ? 'Template jadwal' : 'Schedule templates'}</div>
      <div class="form-hint" style="margin-bottom:12px">${s.lang === 'id' ? 'Edit slot waktu untuk setiap template. Klik + di antara slot untuk menyisipkan jadwal baru di posisi tersebut.' : 'Edit time slots for each template. Click + between slots to insert a new one at that position.'}</div>
      ${Object.entries(templateNames).map(([key, name]) => `
        <div style="margin-bottom:16px">
          <div class="flex-between" style="margin-bottom:8px">
            <span style="font-size:13px;font-weight:500;color:var(--color-text-primary)">${name}</span>
            <button class="btn btn-danger-outline btn-sm" onclick="resetTemplate('${key}')">${s.lang==='id'?'Reset ke default':'Reset to default'}</button>
          </div>
          <div id="tmpl-${key}-list">
            ${renderTemplateSlots(key, templates[key])}
          </div>
          <button class="btn btn-outline btn-sm" onclick="insertTemplateSlot('${key}', ${(templates[key]||[]).length})" style="margin-top:4px">+ ${s.lang === 'id' ? 'Tambah di akhir' : 'Add at end'}</button>
        </div>`).join('<hr class="divider">')}
    </div>`;
}

function renderTemplateSlots(key, slots) {
  const s = getSettings();
  const catOptions = ['belajar','kerja','olahraga','ibadah','istirahat','tidur','bebas'];
  if (!slots || !slots.length) return `<div class="text-sm text-faint" style="padding:8px 0">${s.lang==='id'?'Belum ada slot.':'No slots yet.'}</div>`;

  let html = '';
  slots.forEach((slot, i) => {
    // Insert button BEFORE each slot
    html += `<div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">
      <button onclick="insertTemplateSlot('${key}',${i})" title="${s.lang==='id'?'Sisipkan slot di sini':'Insert slot here'}"
        style="font-size:10px;padding:1px 8px;border-radius:10px;border:1px dashed var(--border2);background:transparent;color:var(--text3);cursor:pointer;line-height:1.6;white-space:nowrap">
        + ${s.lang==='id'?'sisip':'insert'}
      </button>
      <div style="flex:1;height:1px;background:var(--border)"></div>
    </div>`;

    // Slot row — mobile friendly 2-row layout
    html += `<div style="background:var(--surface2);border-radius:var(--radius-sm);padding:8px;margin-bottom:4px">
      <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:6px;margin-bottom:6px;align-items:center">
        <input type="text" value="${slot.time}" placeholder="06.00"
          style="font-size:12px;padding:6px 8px"
          onchange="updateTemplateSlot('${key}',${i},'time',this.value)">
        <input type="text" value="${slot.end}" placeholder="08.00"
          style="font-size:12px;padding:6px 8px"
          onchange="updateTemplateSlot('${key}',${i},'end',this.value)">
        <button class="btn btn-danger-outline btn-icon btn-sm" onclick="deleteTemplateSlot('${key}',${i})">✕</button>
      </div>
      <div style="display:grid;grid-template-columns:1fr auto;gap:6px;align-items:center">
        <input type="text" value="${slot.label}" placeholder="${s.lang==='id'?'Nama aktivitas':'Activity name'}"
          style="font-size:12px;padding:6px 8px"
          onchange="updateTemplateSlot('${key}',${i},'label',this.value)">
        <select style="font-size:12px;padding:6px 8px;width:90px" onchange="updateTemplateSlot('${key}',${i},'cat',this.value)">
          ${catOptions.map(c => `<option value="${c}" ${slot.cat===c?'selected':''}>${c}</option>`).join('')}
        </select>
      </div>
    </div>`;
  });

  return html;
}

function updateTemplateSlot(key, idx, field, val) {
  const templates = getTemplates();
  if (!templates[key] || !templates[key][idx]) return;
  // Validate time fields
  if (field === 'time' || field === 'end') {
    const updated = { ...templates[key][idx], [field]: val };
    if (!validateSlotTime(updated.time, updated.end)) {
      alert(getSettings().lang === 'id'
        ? 'Jam mulai dan jam selesai tidak boleh sama.'
        : 'Start time and end time cannot be the same.');
      return;
    }
  }
  templates[key][idx][field] = val;
  saveTemplates(templates);
}

function insertTemplateSlot(key, afterIdx) {
  const templates = getTemplates();
  if (!templates[key]) templates[key] = [];
  // Guess sensible default time from surrounding slots
  const prev = templates[key][afterIdx - 1];
  const next = templates[key][afterIdx];
  const defaultTime = prev ? prev.end : '00.00';
  const defaultEnd = next ? next.time : '01.00';
  templates[key].splice(afterIdx, 0, {
    time: defaultTime,
    end: defaultEnd,
    label: getSettings().lang === 'id' ? 'Aktivitas baru' : 'New activity',
    cat: 'bebas',
  });
  saveTemplates(templates);
  document.getElementById('tmpl-' + key + '-list').innerHTML = renderTemplateSlots(key, templates[key]);
}

function deleteTemplateSlot(key, idx) {
  const templates = getTemplates();
  if (templates[key]) templates[key].splice(idx, 1);
  saveTemplates(templates);
  document.getElementById('tmpl-' + key + '-list').innerHTML = renderTemplateSlots(key, templates[key]);
}

function resetTemplate(key) {
  const s = getSettings();
  if (!confirm(s.lang === 'id'
    ? `Reset template "${key}" ke default? Semua perubahan akan hilang.`
    : `Reset "${key}" template to default? All changes will be lost.`)) return;
  const templates = getTemplates();
  templates[key] = JSON.parse(JSON.stringify(DEFAULT_TEMPLATES[key]));
  saveTemplates(templates);
  document.getElementById('tmpl-' + key + '-list').innerHTML = renderTemplateSlots(key, templates[key]);
}

// ===== HELPERS =====
function renderDashboardIfActive() {
  if (state.page === 'dashboard') renderDashboard();
}

const renders = {
  dashboard: renderDashboard,
  jadwal: renderJadwal,
  habit: renderHabit,
  belajar: renderBelajar,
  review: renderReview,
  proyek: renderProyek,
  catatan: renderCatatan,
  jurnal: renderJurnal,
  milestone: renderMilestone,
  settings: renderSettings,
};

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  applySettings(getSettings());
  renderHabitModal();
  renderCourseModal();
  renderReviewModal();
  renderProyekModal();
  renderNoteModal();
  renderJurnalModal();
  renderMilestoneModal();
  goTo('dashboard');
});

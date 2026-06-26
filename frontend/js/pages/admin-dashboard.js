/* Trackr — Admin dashboard. Renders skeletons, fills from the api seam,
   then wires course tabs/search/filter and the student table actions. */
import { getAdminMetrics, getRecentActivity, getAdminCourses, getStudents } from '../admin-api.js';
import { statCard, statCardSkeleton } from '../components/statCard.js';

const $ = (s) => document.querySelector(s);
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const ICON = {
  students:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  courses:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  syllabus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13l2 2 4-4"/></svg>',
  archive:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="5" rx="1"/><path d="M4 8v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V8M10 12h4"/></svg>',
};

/* course-code colour, derived deterministically from the code so the same
   course always lands on the same swatch (mirrors the dashboard course cards) */
const SWATCHES = ['var(--course-teal)','var(--course-sky)','var(--course-violet)','var(--course-coral)','var(--course-amber)','var(--course-lime)','var(--primary)'];
const colorFor = (s) => SWATCHES[[...String(s)].reduce((a, c) => a + c.charCodeAt(0), 0) % SWATCHES.length];
const initials = (name) => name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));

const state = { courses: [], students: [], tab: 'active', courseSearch: '', semester: 'all', studentSearch: '', studentStatus: 'all' };

/* ---------- skeletons ---------- */
function showSkeletons() {
  $('#adminMetrics').innerHTML = Array.from({ length: 4 }, statCardSkeleton).join('');
  $('#adminActivity').innerHTML =
    `<div class="dash-card__head"><h2>Recent activity</h2></div>` +
    `<ul class="afeed">${Array.from({ length: 5 }, () => `
      <li class="afeed__item"><span class="sk sk--dot"></span>
        <div class="afeed__body" style="flex:1">
          <div class="sk sk--line" style="width:70%"></div>
          <div class="sk sk--sm" style="width:35%"></div>
        </div></li>`).join('')}</ul>`;
  $('#adminCourseList').innerHTML = Array.from({ length: 3 }, () => `
    <div class="acard">
      <div class="sk sk--line" style="width:45%"></div>
      <div class="sk sk--line" style="width:70%;margin:.7rem 0 .4rem"></div>
      <div class="sk sk--sm" style="width:30%"></div>
    </div>`).join('');
  $('#adminStudents').innerHTML = Array.from({ length: 5 }, () => `
    <tr><td colspan="6"><div class="sk sk--line" style="width:100%;height:18px"></div></td></tr>`).join('');
}

/* ---------- metric cards ---------- */
function renderMetrics(m) {
  $('#adminMetrics').innerHTML = [
    statCard({ icon: ICON.students, value: m.totalStudents, label: 'Total Students', accent: 'primary', countup: true }),
    statCard({ icon: ICON.courses, value: m.activeCourses, label: 'Active Courses', accent: 'violet', sub: m.semesterLabel }),
    statCard({ icon: ICON.syllabus, value: m.syllabusesProcessed, label: 'Syllabuses Processed', accent: 'progress', countup: true }),
    statCard({ icon: ICON.archive, value: m.archivedCourses, label: 'Archived Courses', accent: 'marker' }),
  ].join('');
  animateCounts();
}
function animateCounts() {
  requestAnimationFrame(() => document.querySelectorAll('[data-countup]').forEach(countUp));
}
function countUp(el) {
  const target = parseFloat(el.dataset.countup), suffix = el.dataset.suffix || '';
  if (reduce) { el.textContent = target + suffix; return; }
  const t0 = performance.now(), dur = 900;
  const tick = (now) => {
    const p = Math.min((now - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * e) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ---------- recent activity ---------- */
function renderActivity(items) {
  $('#adminActivity').innerHTML =
    `<div class="dash-card__head"><h2>Recent activity</h2><a href="#">View all →</a></div>` +
    (items.length
      ? `<ul class="afeed">${items.map((a) => `
          <li class="afeed__item">
            <span class="afeed__dot afeed__dot--${esc(a.type)}"></span>
            <div class="afeed__body">
              <p class="afeed__text">${a.html}</p>
              <span class="afeed__time">${esc(a.time)}</span>
            </div>
          </li>`).join('')}</ul>`
      : `<div class="admin-empty"><b>No activity yet.</b><br>Platform events will show up here.</div>`);
}

/* ---------- course management ---------- */
function populateSemesterFilter() {
  const sel = $('#semesterFilter');
  const terms = [...new Set(state.courses.map((c) => c.semester))];
  sel.innerHTML = `<option value="all">All semesters</option>` +
    terms.map((t) => `<option value="${esc(t)}">${esc(t)}</option>`).join('');
}
function filteredCourses() {
  const q = state.courseSearch.toLowerCase();
  return state.courses.filter((c) =>
    c.status === state.tab &&
    (state.semester === 'all' || c.semester === state.semester) &&
    (!q || c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.professor.toLowerCase().includes(q)));
}
function avatarStack(students) {
  const shown = students.slice(0, 4);
  const extra = students.length - shown.length;
  return `<div class="astack">${shown.map((s) => `
    <span class="astack__a" style="background:${colorFor(s)}">${esc(initials(s))}</span>`).join('')}
    ${extra > 0 ? `<span class="astack__more">+${extra}</span>` : ''}</div>`;
}
function renderCourses() {
  const list = filteredCourses();
  if (!list.length) {
    $('#adminCourseList').innerHTML = `<div class="admin-empty"><b>No ${state.tab} courses found.</b><br>Try a different search or semester.</div>`;
    return;
  }
  $('#adminCourseList').innerHTML = list.map((c) => `
    <article class="acard" style="--c:${colorFor(c.code)}">
      <div class="acard__head">
        <span class="acard__code">${esc(c.code)}</span>
        <span class="acard__status acard__status--${c.status}">${c.status === 'active' ? 'Active' : 'Archived'}</span>
      </div>
      <h3 class="acard__name">${esc(c.name)}</h3>
      <p class="acard__meta">${esc(c.semester)} · ${esc(c.professor)}</p>
      ${avatarStack(c.students)}
      <div class="acard__foot">
        <span class="acard__stats"><b>${c.enrolled}</b> enrolled · <b>${c.credits}</b> credits</span>
        <div class="acard__actions">
          ${c.status === 'active'
            ? `<button class="btn btn-ghost" type="button" data-course-action="archive" data-id="${c.id}">Archive</button>` : ''}
          <a class="btn" href="courses.html?id=${encodeURIComponent(c.id)}">View</a>
        </div>
      </div>
    </article>`).join('');
}

/* ---------- student management ---------- */
function filteredStudents() {
  const q = state.studentSearch.toLowerCase();
  return state.students.filter((s) =>
    (state.studentStatus === 'all' || s.status === state.studentStatus) &&
    (!q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)));
}
function renderStudents() {
  const rows = filteredStudents();
  $('#studentCount').textContent = `${rows.length} of ${state.students.length}`;
  if (!rows.length) {
    $('#adminStudents').innerHTML = `<tr><td colspan="6"><div class="admin-empty"><b>No students match.</b><br>Clear the search or status filter.</div></td></tr>`;
    return;
  }
  $('#adminStudents').innerHTML = rows.map((s) => `
    <tr class="${s.status === 'inactive' ? 'is-disabled' : ''}">
      <td>
        <div class="atd-student">
          <span class="atd-student__avatar" style="background:${colorFor(s.name)}">${esc(initials(s.name))}</span>
          <span><span class="atd-student__name">${esc(s.name)}</span><span class="atd-student__email">${esc(s.email)}</span></span>
        </div>
      </td>
      <td data-num>${esc(s.studentId)}</td>
      <td data-num>${s.courses}</td>
      <td>${esc(s.joined)}</td>
      <td><span class="apill apill--${s.status}">${s.status === 'active' ? 'Active' : 'Inactive'}</span></td>
      <td>
        <div class="arow-actions">
          <button class="abtn" type="button" data-student-action="view" data-id="${s.id}">View</button>
          <button class="abtn" type="button" data-student-action="reset" data-id="${s.id}">Reset Password</button>
          <button class="abtn abtn--danger" type="button" data-student-action="toggle" data-id="${s.id}">${s.status === 'active' ? 'Disable' : 'Enable'}</button>
        </div>
      </td>
    </tr>`).join('');
}

/* ---------- toast ---------- */
let toastTimer;
function toast(msg) {
  const el = $('#adminToast');
  el.textContent = msg;
  el.classList.add('is-show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-show'), 2600);
}

/* ---------- events ---------- */
function wireEvents() {
  /* course tabs */
  document.querySelectorAll('.seg__btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.seg__btn').forEach((b) => {
        const on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', String(on));
      });
      state.tab = btn.dataset.tab;
      renderCourses();
    });
  });

  $('#courseSearch').addEventListener('input', (e) => { state.courseSearch = e.target.value; renderCourses(); });
  $('#semesterFilter').addEventListener('change', (e) => { state.semester = e.target.value; renderCourses(); });
  $('#studentSearch').addEventListener('input', (e) => { state.studentSearch = e.target.value; renderStudents(); });
  $('#statusFilter').addEventListener('change', (e) => { state.studentStatus = e.target.value; renderStudents(); });

  /* course actions (delegated) */
  $('#adminCourseList').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-course-action]');
    if (!btn) return;
    const course = state.courses.find((c) => String(c.id) === btn.dataset.id);
    if (!course) return;
    if (btn.dataset.courseAction === 'archive') {
      course.status = 'archived';
      renderCourses();
      toast(`Archived ${course.code}.`);
    }
  });

  /* student actions (delegated) */
  $('#adminStudents').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-student-action]');
    if (!btn) return;
    const student = state.students.find((s) => String(s.id) === btn.dataset.id);
    if (!student) return;
    const action = btn.dataset.studentAction;
    if (action === 'view') {
      toast(`Opening ${student.name}…`); // TODO: wire to student-detail.html when it exists
    } else if (action === 'reset') {
      toast(`Password reset link sent to ${student.email}.`);
    } else if (action === 'toggle') {
      student.status = student.status === 'active' ? 'inactive' : 'active';
      renderStudents();
      toast(student.status === 'inactive' ? `Disabled ${student.name}.` : `Re-enabled ${student.name}.`);
    }
  });
}

/* ---------- init ---------- */
async function init() {
  showSkeletons();
  let metrics, activity, courses, students;
  try {
    [metrics, activity, courses, students] = await Promise.all([
      getAdminMetrics(), getRecentActivity(), getAdminCourses(), getStudents(),
    ]);
  } catch (e) {
    $('#adminActivity').innerHTML = `<div class="admin-empty"><b>Couldn't load the dashboard.</b><br>Please refresh to try again.</div>`;
    return;
  }
  state.courses = courses;
  state.students = students;

  renderMetrics(metrics);
  renderActivity(activity);
  populateSemesterFilter();
  renderCourses();
  renderStudents();
  wireEvents();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
/* ============================================================
   Trackr — Admin API seam (mock).
   Self-contained: mock data + async getters in one file.
   Swap the bodies for real fetch() calls when the backend lands.
   ============================================================ */

const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));
const clone = (v) =>
  typeof structuredClone === 'function' ? structuredClone(v) : JSON.parse(JSON.stringify(v));

/* ---------- mock data ---------- */

const ADMIN_METRICS = {
  totalStudents: 312,
  activeCourses: 47,
  semesterLabel: 'Spring 2026',
  syllabusesProcessed: 186,
  archivedCourses: 23,
};

/* `type` drives the dot colour (register | upload | flag | fail | archive).
   `html` is trusted mock copy — bold the entity, keep the rest plain. */
const RECENT_ACTIVITY = [
  { type: 'register', html: 'New student registered — <b>Jordan Lee</b>', time: '2 min ago' },
  { type: 'upload',   html: 'Syllabus uploaded — <b>CS301</b> by Alex Chen', time: '18 min ago' },
  { type: 'upload',   html: 'Syllabus uploaded — <b>MATH 201</b> by Priya Sharma', time: '36 min ago' },
  { type: 'flag',     html: 'AI extraction flagged <b>3 low-confidence fields</b> — ENG 250', time: '1 hr ago' },
  { type: 'archive',  html: 'Course archived — <b>BU 121</b> (Winter 2025)', time: 'Yesterday, 4:12 pm' },
  { type: 'fail',     html: 'Failed extraction — <b>PSY 101</b> PDF unreadable', time: 'Yesterday, 2:03 pm' },
];

/* `students` is a list of names — the dashboard derives initials + avatar
   colours from them. `status` is 'active' | 'archived'. */
const ADMIN_COURSES = [
  { id: 'c1', code: 'CS301',  name: 'Introduction to Algorithms', semester: 'Spring 2026', professor: 'Dr. Sarah Kim',  enrolled: 34, credits: 0.5, status: 'active',
    students: ['Alex Chen', 'Priya Sharma', 'Jordan Lee', 'Sam Okafor', 'Mia Tanaka', 'Chris Babalunde'] },
  { id: 'c2', code: 'MATH201', name: 'Linear Algebra', semester: 'Spring 2026', professor: 'Dr. James Park', enrolled: 41, credits: 0.5, status: 'active',
    students: ['Priya Sharma', 'Mia Tanaka', 'Liam Walsh', 'Noor Haidari', 'Diego Cruz'] },
  { id: 'c3', code: 'ENG250',  name: 'Technical Writing', semester: 'Spring 2026', professor: 'Dr. Helen Roy', enrolled: 28, credits: 0.5, status: 'active',
    students: ['Jordan Lee', 'Sam Okafor', 'Aisha Khan'] },
  { id: 'c4', code: 'PSY101',  name: 'Intro to Psychology', semester: 'Spring 2026', professor: 'Dr. Omar Faruk', enrolled: 52, credits: 0.5, status: 'active',
    students: ['Alex Chen', 'Diego Cruz', 'Liam Walsh', 'Noor Haidari', 'Mia Tanaka', 'Aisha Khan', 'Chris Babalunde'] },
  { id: 'c5', code: 'BU121',   name: 'Functional Programming for Business', semester: 'Winter 2025', professor: 'Dr. Grace Lin', enrolled: 39, credits: 0.5, status: 'archived',
    students: ['Sam Okafor', 'Priya Sharma', 'Liam Walsh'] },
  { id: 'c6', code: 'HIST210', name: 'Modern World History', semester: 'Fall 2025', professor: 'Dr. Paul Mensah', enrolled: 31, credits: 0.5, status: 'archived',
    students: ['Aisha Khan', 'Diego Cruz', 'Jordan Lee', 'Mia Tanaka'] },
];

const STUDENTS = [
  { id: 's1', name: 'Alex Chen',       email: 'achen@mylaurier.ca',      studentId: '169034567', courses: 5, joined: 'Jan 6, 2026', status: 'active' },
  { id: 's2', name: 'Priya Sharma',    email: 'psharma@mylaurier.ca',    studentId: '169045678', courses: 4, joined: 'Jan 6, 2026', status: 'active' },
  { id: 's3', name: 'Jordan Lee',      email: 'jlee@mylaurier.ca',       studentId: '169056789', courses: 3, joined: 'Jan 7, 2026', status: 'active' },
  { id: 's4', name: 'Sam Okafor',      email: 'sokafor@mylaurier.ca',    studentId: '169067890', courses: 6, joined: 'Jan 6, 2026', status: 'active' },
  { id: 's5', name: 'Mia Tanaka',      email: 'mtanaka@mylaurier.ca',    studentId: '169078901', courses: 2, joined: 'Jan 8, 2026', status: 'inactive' },
  { id: 's6', name: 'Chris Babalunde', email: 'cbabalunde@mylaurier.ca', studentId: '169089012', courses: 1, joined: 'Jan 9, 2026', status: 'inactive' },
  { id: 's7', name: 'Aisha Khan',      email: 'akhan@mylaurier.ca',      studentId: '169090123', courses: 5, joined: 'Jan 5, 2026', status: 'active' },
  { id: 's8', name: 'Diego Cruz',      email: 'dcruz@mylaurier.ca',      studentId: '169101234', courses: 4, joined: 'Jan 7, 2026', status: 'active' },
];

/* ---------- getters (the seam the page imports) ---------- */

export async function getAdminMetrics()   { await delay(); return clone(ADMIN_METRICS); }
export async function getRecentActivity() { await delay(); return clone(RECENT_ACTIVITY); }
export async function getAdminCourses()   { await delay(); return clone(ADMIN_COURSES); }
export async function getStudents()       { await delay(); return clone(STUDENTS); }
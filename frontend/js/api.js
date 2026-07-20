/* Trackr — API seam. Components/pages call THESE, never the backend directly.
   Each function returns the same camelCase shapes the UI already expects; the
   snake_case DB rows are translated in adapters.js. Courses + activities are
   fetched once per page load and shared across the getters (the dashboard calls
   all of them together via Promise.all), so we don't hit the API repeatedly. */

import { API_BASE, authHeaders, getUser } from "./auth.js";
import { adaptActivity, adaptCourse, computeGpa } from "./adapters.js";

async function apiGet(path) {
  const res = await fetch(API_BASE + path, { headers: authHeaders() });
  if (!res.ok) throw new Error(`GET ${path} failed (${res.status})`);
  return res.json();
}

// The "current term" is the term of the most recently added course (highest
// course_id) — good enough until an explicit active-term setting exists.
function pickCurrentTerm(rawCourses) {
  if (!rawCourses.length) return null;
  const newest = rawCourses.reduce((a, b) => (b.course_id > a.course_id ? b : a));
  return newest.term || null;
}

// Fetch courses + activities once and derive everything. Cached as a promise so
// concurrent getters share a single round-trip per page load.
let _dataPromise = null;

// Drop the cache after a write, so the dashboard and GPA tracker pick up the new grade on their next visit
export function invalidateData() {
  _dataPromise = null;
}

function loadData() {
  if (_dataPromise) return _dataPromise;
  _dataPromise = (async () => {
    const [rawCourses, rawActivities] = await Promise.all([
      apiGet("/user/courses"),
      apiGet("/user/activities"),
    ]);

    const activities = rawActivities.map(adaptActivity);
    const byCourse = new Map();
    for (const a of activities) {
      if (!byCourse.has(a.courseId)) byCourse.set(a.courseId, []);
      byCourse.get(a.courseId).push(a);
    }

    const courses = rawCourses.map((row, i) =>
      adaptCourse(row, i, byCourse.get(row.course_id) || []),
    );

    return { courses, activities, currentTerm: pickCurrentTerm(rawCourses) };
  })();
  return _dataPromise;
}

export async function getCourses() {
  const { courses } = await loadData();
  return courses;
}

export async function getActivities() {
  const { activities } = await loadData();
  return activities;
}

export async function getSemester() {
  const { currentTerm } = await loadData();
  return { term: currentTerm };
}

// PUT /user/activities/:id — record a grade from the assignments page.
// Returns the stored row, not the values we sent, since the backend
// normalizes them.
export async function updateActivity(id, { grade, status }) {
  const res = await fetch(`${API_BASE}/user/activities/${id}`, {
    method: "PUT",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ activity: { grade, status } }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Save failed (${res.status})`);
  }
  invalidateData();
  return adaptActivity(await res.json());
}

// Assembled from the user stored at login (auth.js) plus a computed GPA. Fields
// with no data source (year, study streak, gpa delta) are intentionally gone.
export async function getCurrentUser() {
  const stored = getUser() || {};
  const { courses, currentTerm } = await loadData();
  const scale = Number(stored.preferred_gpa_scale) || 4.0;
  const { termGpa, cumulativeGpa } = computeGpa(courses, { currentTerm, scale });
  return {
    firstName: stored.first_name || "there",
    currentGPA: termGpa,       // null when no graded activities yet
    cumulativeGPA: cumulativeGpa,
    gpaScale: scale,
  };
}

// --------------------------------------------------------------------------- //
// Profile (Settings page)                                                      //
// --------------------------------------------------------------------------- //
// GET /user/:id/profile returns the user's row (snake_case, no password).
// Translated here into the camelCase shape settings.js expects.
export async function getProfile() {
  const stored = getUser() || {};
  const id = stored.user_id;
  if (!id) throw new Error("No logged-in user");
  const row = await apiGet(`/user/${id}/profile`);
  return {
    id: row.user_id,
    firstName: row.first_name || "",
    lastName: row.last_name || "",
    email: row.email || "",
    institution: row.institution || "",
    gpaScale: Number(row.preferred_gpa_scale) || 4.0,
    themeMode: row.theme_mode || "light",
    reminderDays: row.default_reminder_days ?? 1,
    reminderMethod: row.default_reminder_method || "Email",
  };
}

// PUT /user/:id/profile expects { profile: {...snake_case fields...} }.
// Only the columns the backend allows are sent.
export async function updateProfile(patch) {
  const stored = getUser() || {};
  const id = stored.user_id;
  if (!id) throw new Error("No logged-in user");
  const res = await fetch(`${API_BASE}/user/${id}/profile`, {
    method: "PUT",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ profile: patch }),
  });
  if (!res.ok) throw new Error(`Save failed (${res.status})`);
  return res.json();
}

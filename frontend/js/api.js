/* Trackr — API seam. Components/pages call THESE, never the data directly.
   Today it returns mock data after a short delay; the backend team swaps the
   bodies for real fetch() calls without touching any page or component. */

import { user, semester, courses, activities, studyHours } from './mock-data.js';

const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));
const clone = (v) => (typeof structuredClone === 'function' ? structuredClone(v) : JSON.parse(JSON.stringify(v)));

export async function getCurrentUser() { await delay(); return clone(user); }
export async function getSemester()    { await delay(); return clone(semester); }
export async function getCourses()     { await delay(); return clone(courses); }
export async function getActivities()  { await delay(); return clone(activities); }
export async function getStudyHours()  { await delay(); return clone(studyHours); }
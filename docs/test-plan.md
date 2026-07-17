# Trackr — Test Plan (Milestone 3)

**Course:** CP476B – Internet Computing (Spring 2026)
**Prepared by:** Zohra Haidary
**Last updated:** July 17, 2026

## 1. Purpose and scope

This test plan covers the end-to-end verification of Trackr, our full-stack academic management application (vanilla HTML/CSS/JS frontend, Node.js/Express backend, MySQL database). It defines the features under test, the test cases with expected results, and the environment needed to run them. Results will be recorded in the Testing Summary Report (Milestone 3 deliverable).

**In scope (we are testing):** authentication(login, signup), user course/activity/profile workflows(user features), admin read endpoints, input validation(reject bad data), and access control (JWT + role checks).

**Out of scope (we are not testing):** load/performance testing, browser compatibility beyond Chrome/Firefox/Edge latest, and any features not implemented by the Milestone 3 code freeze (tracked in §6 Known limitations).

## 2. Test environment

| Item | Value |
|---|---|
| Backend | Node.js + Express, `http://localhost:5000` (`cd backend && npm run dev`) |

| Frontend | Static serve, `http://localhost:3000` (`npm start` from repo root) |

| Database | MySQL 8.x, database `trackr` with `users`, `courses`, `activities` tables |

| API client | Postman (manual) / automated test suite (see section 7) |

| Config | `backend/.env` with DB credentials + `JWT_SECRET` |


**Test accounts (create before testing):**

| Account | Role | Purpose |
|---|---|---|
| `student.test@trackr.dev` | student | User workflow + negative admin tests |

| `admin.test@trackr.dev` | admin | Admin endpoint tests |


## 3. Test cases — Authentication (`/auth`)

| ID | Test case | Steps | Expected result | Result | Notes |
|---|---|---|---|---|---|

| AUTH-01 | Register new user | POST `/auth/register` with valid email, password, role | 201/200, user created, token or success payload returned | | |

| AUTH-02 | Register duplicate email | POST `/auth/register` with an email that already exists | 409 (or 4xx) with clear error, no duplicate row in `users` | | |

| AUTH-03 | Register with invalid email format | POST `/auth/register` with `not-an-email` | 400, validation error, no row created (no user should be crerated) | | |

| AUTH-04 | Register with missing fields | POST `/auth/register` with empty body | 400, validation error | | |

| AUTH-05 | Login with valid credentials | POST `/auth/login` with AUTH-01 credentials | 200, response contains JWT and user object with `role` | | |

| AUTH-06 | Login with wrong password | POST `/auth/login` with wrong password | 401, generic error (does not reveal which field was wrong) | | |

| AUTH-07 | Login with non-existent email | POST `/auth/login` with unknown email | 401, same generic error as AUTH-06 | | |

| AUTH-08 | Forgot password request | POST `/auth/forgot-password` with existing email | 200 (Also: unknown emails should still return 200 to avoid revealing which accounts exist.) | | |

| AUTH-09 | Reset password with valid token | POST `/auth/reset-password` with valid token + new password | 200, old password no longer works, new one does | | |

| AUTH-10 | Reset password with bad/expired token | POST `/auth/reset-password` with fake token | 400, password unchanged(ger an error and password should not change) | | |

| AUTH-11 | Password stored hashed | Inspect `users` table after AUTH-01 | Password column contains bcrypt hash, never plaintext | | |


## 4. Test cases — User workflow (`/user`, JWT required)- Everything a Logged-in student can do

| ID | Test case | Steps | Expected result | Result | Notes |
|---|---|---|---|---|---|

| USER-01 | Get my courses - View courses | GET `/user/courses` with valid student token | 200, only courses belonging to the logged-in user | | |

| USER-02 | Get my activities | GET `/user/activities` with valid token | 200, only the user's activities | | |

| USER-03 | Get my statistics | Seed 1 activity due tomorrow + 1 due yesterday (both ungraded), then GET `/user/statistics` | 200 with `total_courses` correct, `upcoming: #`, `overdue: #` | | Counts come from `activityModel.getStatisticsByUserId` |

| USER-04 | Get single course | GET `/user/courses/:courseId` for a course I own | 200, correct course data | | |

| USER-05 | Get course I don't own | GET `/user/courses/:courseId` for another user's course | 403/404 — must not leak another user's data (blocks access tp someone else's course) | | |

| USER-06 | Get activities for a course | GET `/user/courses/:courseId/activities` | 200, activities scoped to user + course (activities belongs to this course  + this student) | | |

| USER-07 | Add course | POST `/user/courses/` with valid course payload | 200/201, row appears in `courses`, shows up in USER-01 | | |

| USER-08 | Add course with missing/invalid fields | POST `/user/courses/` with empty name / bad data | 400, no row created | | |

| USER-09 | Upload syllabus (stub) | POST `/user/upload-syllabus` with a valid file | 200, file received confirmation | | Controller is a stub; tests file acceptance only |

| USER-10 | Upload with no file / bad file | POST `/user/upload-syllabus` with empty body, then with .exe | 400 "No file uploaded" for empty; graceful rejection for disallowed types, no crash | | |

| USER-11 | View my profile | GET `/user/:id/profile` with own id + token | 200, profile data returned | | |

| USER-12 | Update my profile | PUT `/user/:id/profile` with changed fields | 200, changes persist (verify with USER-11) | | |

| USER-13 | Update another user's profile | PUT `/user/:id/profile` with someone else's id | Server uses `req.user.user_id` from token — other user's data must NOT change | | |

 
## 5. Test cases — Admin (`/admin`, JWT + admin role) and access control
 
| ID | Test case | Steps | Expected result | Result | Notes |
|---|---|---|---|---|---|

| ADM-01 | List all users | GET `/admin/users/` with admin token | 200, all users returned | | |

| ADM-02 | Get single user | GET `/admin/users/:id` with admin token | 200, correct user | | |

| ADM-03 | List all courses | GET `/admin/courses/` with admin token | 200, all courses | | |

| ADM-04 | Get single course | GET `/admin/courses/:id` with admin token | 200, correct course | | |

| ADM-05 | Global statistics (all users, all coursees...) | GET `/admin/statistics/` with admin token | 200, aggregate stats | | |

| ADM-06 | All user activities | GET `/admin/user-activities/` with admin token | 200, activities across users | | |

## security
| SEC-01 | No token on protected route | GET `/user/courses` with no Authorization header | 401 | | |

| SEC-02 | Malformed/garbage token | GET `/user/courses` with `Bearer abc123` | 401 | | |

| SEC-03 | Expired token | GET `/user/courses` with expired JWT | 401 | | |

| SEC-04 | Student token on admin route | GET `/admin/users/` with student token | 403 (blocked by `requireAdmin`) | | |

| SEC-05 | SQL injection attempt | Login with email `' OR '1'='1` / add course named `'; DROP TABLE users;--` | Treated as plain text; no auth bypass, tables intact (parameterized queries) | | |

| SEC-06 | XSS payload stored safely | Add course named `<script>alert(1)</script>`, view it in UI | Rendered as text, script does not execute | | |
| SEC-07 | CORS config | Request from unexpected origin | Blocked per CORS config | | |
 
## 6. Test cases — Frontend UI
 
| ID | Test case | Steps | Expected result | Result | Notes |
|---|---|---|---|---|---|

| UI-01 | Signup form client-side validation | Submit signup with invalid email, weak password | Inline errors from `validation.js` / password checklist, no submit | | |

| UI-02 | Login → dashboard flow | Log in via UI with valid account | Redirect to dashboard, courses/activities render | | |

| UI-03 | Role-based redirect | Log in as admin | Redirected to admin dashboard | | |

| UI-04 | Primary workflow end to end | Signup → login → add course → view course → view activities → update profile | Every step succeeds against the real backend (not mocks) | | |

| UI-05 | Navigation between pages | Click through all nav links / partials | All pages load via `include.js`, no broken links or console errors | | |

| UI-06 | Graceful API failure | Stop the backend, use the UI | User-friendly error, no white screen / unhandled exception | | |

| UI-07 | Dashboard shows real data after integration | Log in as test student with seeded courses/activities, view dashboard | Counts and lists match the database, not `mock-data.js` values (no "Alex Chen" leftovers) | | Widgets with no backend source handled per §7 decision |
 


## 7. Traceability — user stories to test cases

Maps Milestone 1 user stories (docs/user-stories.md / proposal) to the test cases that verify them.

| Story | Feature | Verified by | Coverage notes |
|---|---|---|---|

| US-01 Authentication | Register/login with role | AUTH-01–AUTH-07, AUTH-11, UI-01, UI-02, UI-03 | Google SSO not implemented in backend (see section 8). Weak-password check is client-side only |

| US-02 Syllabus upload + AI extraction | Upload PDF, extract fields | USER-09, USER-10 | Backend is a stub — extraction not implemented (section 8) |

| US-03 Extraction review & confirm | Edit/confirm parsed fields | — | No backend endpoints exist; UI page only (section 8) |

| US-04 Semester dashboard | Courses, stats, weekly glance | USER-01, USER-02, USER-03, UI-04, UI-07 | Study hours / streak / GPA delta widgets are mock-only (section 8) |

| US-05 Course view | Syllabus details, sorted assignments, grade breakdown | USER-04, USER-06 | Sort-by-due-date verified via `ORDER BY due_date` in USER-02/06 responses |

| US-06 Assignment details | Name, type, due date, weight, status, grade | USER-02, USER-06 | Status is derived (graded/upcoming/overdue); no stored status field |

| US-07 GPA calculator | Scales, current GPA, target calc | USER-03 (partial) | GPA math is frontend-only; backend stores raw grades. Test via UI once integrated |

| US-08 Reminders | Email/WhatsApp deadline reminders | — | No backend reminder/email delivery implemented (section 8) |

| US-09 Calendar monthly | Deadlines across courses | USER-02, UI-04 | Calendar rendering is frontend; data source is `/user/activities` |

| US-10 Calendar weekly | Next-7-days view, priorities | USER-02, UI-04 | Priority level marked "additional feature" in data plan |

| US-11 Settings/profile | Edit profile, preferences | USER-11, USER-12, USER-13 | |

| US-12 Admin dashboard | Metrics, user/course management | ADM-01–ADM-06, SEC-04 | Backend admin routes are read-only; archive/reset-password/disable-account have no endpoints (section 8) |

## 8. Known limitations (fill in at code freeze)
 
- Frontend currently uses mock APIs (`api.js`, `admin-api.js`); UI-02–UI-04 are blocked until real `fetch()` integration lands (see `INTEGRATION.md`).
- Admin controllers in progress (Tyler / team) — ADM-01–ADM-06 blocked until merged.
- Syllabus upload is a stub: the backend confirms file receipt but PDF parsing/extraction is not implemented. The `extraction-review.html` page has no backend support.
- Dashboard widgets with no backend data source: study hours, study streak, GPA delta/cumulative GPA, and course percent-complete are currently hardcoded in `mock-data.js`. The backend `activities`/`courses` tables do not store this data. Team decision pending: implement, remove, or document as mock-driven.
- Email delivery for forgot-password: confirm whether real or stubbed; adjust AUTH-08/09 accordingly.
- Google SSO (US-01 acceptance criterion): no backend route exists; email/password only.
- Extraction review flow (US-03): `extraction-review.html` exists but has no backend endpoints.
- Reminders (US-08): reminder fields exist in the data plan, but no scheduling/email/WhatsApp delivery is implemented.
- Admin write actions (US-12): archive course, reset password, disable account have no backend endpoints — admin API is read-only.
- Weak-password validation is client-side only; the backend accepts any non-empty password.

## 8. Handoff notes for automated testing
 
- Every API case above (AUTH, USER, ADM, SEC) can be automated as HTTP tests: seed the two test accounts, capture tokens in a setup step, assert status codes + response shapes.
- Suggested order: AUTH-01 → AUTH-05 first (produces the tokens everything else needs).
- Reset the database between runs (fresh `trackr` schema) so duplicate-email and count-based assertions stay deterministic.
- Record how to run the suite (one command) — Milestone 3 report must include it.
 
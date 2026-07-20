import { getActivities, getCourses, updateActivity } from "./api.js";

const listEl = document.getElementById("assignmentList");
const tabsEl = document.getElementById("sortTabs");

let activities = [];
let coursesById = {};
let sortMode = "due"; 

const STATUS_LABEL = {
  not_started: "Not Started", in_progress: "In Progress",
  graded: "Graded", submitted: "Submitted", completed: "Completed",
};
// reuse the existing pill classes from app-pages.css
const STATUS_CLASS = {
  not_started: "not-started", in_progress: "in-progress",
  graded: "graded", submitted: "graded", completed: "graded",
};
// options shown in each card's Status dropdown
const STATUS_OPTIONS = [
  ["not_started", "Not Started"],
  ["in_progress", "In Progress"],
  ["completed", "Completed"],
  ["submitted", "Submitted"],
  ["graded", "Graded"],
];

const DAY = 86400000;
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

// priority = unfinished + heavy + due soon/overdue float to the top.
function priorityScore(a) {
  const daysLeft = (new Date(a.dueDate) - Date.now()) / DAY;
  const done = a.status === "graded" || a.status === "submitted";
  let score = a.weight;                  // heavier counts more
  if (!done) score += 20;                // unfinished outranks finished
  score += Math.max(0, 30 - daysLeft);   // sooner / overdue counts more
  return score;
}

function sorted() {
  const arr = [...activities];
  if (sortMode === "due")      arr.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  if (sortMode === "weight")   arr.sort((a, b) => b.weight - a.weight);
  if (sortMode === "priority") arr.sort((a, b) => priorityScore(b) - priorityScore(a));
  return arr;
}

function statusSelect(a) {
  const opts = STATUS_OPTIONS
    .map(([v, l]) => `<option value="${v}"${v === a.status ? " selected" : ""}>${l}</option>`)
    .join("");
  return `<select class="js-status" data-id="${a.id}">${opts}</select>`;
}

function cardHTML(a) {
  const code = coursesById[a.courseId]?.code ?? "";
  const cls = STATUS_CLASS[a.status] ?? "not-started";
  const label = STATUS_LABEL[a.status] ?? a.status;
  const isGraded = a.grade != null;
  const missing = a.missingInfo
    ? `<p class="missing">Missing assignment info — please review and update this entry.</p>`
    : "";
  const bigGrade = isGraded ? `<h2 class="js-bigGrade" data-id="${a.id}">${a.grade}%</h2>` : "";
  return `
    <div class="assignment-card" data-id="${a.id}">
      <span class="tag">${a.category}</span><span class="tag">${code}</span>
      <span class="assignment-status ${cls}">${label}</span>
      <h3>${a.name}</h3>
      <p>Due ${fmtDate(a.dueDate)} · ${a.weight}% of final grade</p>
      ${missing}
      ${bigGrade}
      <b>Status</b><br />
      ${statusSelect(a)}
      <b>Grade</b><br />
      <input type="number" class="js-grade" data-id="${a.id}" value="${a.grade ?? ""}" placeholder="–" /> / 100
      <br /><br />
      <button class="js-update" data-id="${a.id}">Update grade</button>
      <span class="js-msg" data-id="${a.id}" role="status"></span>
    </div>`;
}

function render() {
  listEl.innerHTML = sorted().map(cardHTML).join("");

  const overdue = activities.filter(
    (a) => new Date(a.dueDate) < Date.now() &&
           a.status !== "graded" && a.status !== "submitted"
  ).length;
  const subtext = document.querySelector(".subtext");
  if (subtext) subtext.textContent = `${activities.length} total · ${overdue} overdue`;
}

const findById = (id) => activities.find((x) => String(x.id) === String(id));

function showMessage(id, text, isError) {
  const el = listEl.querySelector(`.js-msg[data-id="${id}"]`);
  if (!el) return;
  el.textContent = text;
  el.className = `js-msg ${isError ? "is-error" : "is-ok"}`;
}

// Swap in the row the server stored and repaint.
function applyUpdate(saved) {
  const i = activities.findIndex((x) => String(x.id) === String(saved.id));
  if (i !== -1) activities[i] = saved;
  render();
}

tabsEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-sort]");
  if (!btn) return;
  sortMode = btn.dataset.sort;
  tabsEl.querySelectorAll("button").forEach((b) => b.classList.toggle("is-active", b === btn));
  render();
});

listEl.addEventListener("change", async (e) => {
  const sel = e.target.closest(".js-status");
  if (!sel) return;
  const a = findById(sel.dataset.id);
  if (!a) return;

  const id = a.id;
  sel.disabled = true;
  try {
    applyUpdate(await updateActivity(id, { grade: a.grade, status: sel.value }));
    showMessage(id, "Status saved.", false);
  } catch (err) {
    render(); 
    showMessage(id, err.message, true);
  }
});

listEl.addEventListener("click", async (e) => {
  const btn = e.target.closest(".js-update");
  if (!btn) return;
  const a = findById(btn.dataset.id);
  const input = listEl.querySelector(`.js-grade[data-id="${btn.dataset.id}"]`);
  if (!a || !input) return;

  const id = a.id;
  const raw = input.value.trim();
  if (raw === "") {
    showMessage(id, "Enter a grade first.", true);
    return;
  }
  const grade = Number(raw);
  if (!Number.isFinite(grade) || grade < 0 || grade > 100) {
    showMessage(id, "Grade must be between 0 and 100.", true);
    return;
  }

  btn.disabled = true;
  btn.textContent = "Saving…";
  try {
    // Recording a grade implies the work is graded, unless it's already
    // further along in a way the dropdown captured.
    applyUpdate(await updateActivity(id, { grade, status: "graded" }));
    showMessage(id, "Grade saved.", false);
  } catch (err) {
    btn.disabled = false;
    btn.textContent = "Update grade";
    showMessage(id, err.message, true);
  }
});

(async function init() {
  try {
    const [acts, courses] = await Promise.all([getActivities(), getCourses()]);
    activities = acts;
    coursesById = Object.fromEntries(courses.map((c) => [c.id, c]));
    render();
  } catch (e) {
    listEl.innerHTML =
      `<p class="subtext">Couldn't load your assignments — your session may have expired. ` +
      `<a href="login.html">Log in again</a>.</p>`;
  }
})();

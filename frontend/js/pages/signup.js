// frontend/js/pages/signup.js
import { initPasswordChecklist } from "../components/passwordChecklist.js";
import { isEmail, isStrongPassword, setFieldError, clearFieldError } from "../validation.js";

const form     = document.querySelector(".auth-form");
const email    = document.getElementById("email");
const password = document.getElementById("password");
const confirm  = document.getElementById("confirm-password");
const panel    = document.querySelector(".password-rules");

// live checklist + live mismatch on the confirm field
initPasswordChecklist({ password, confirm, panel });

// clear a field's error the moment the user edits it
// (confirm is managed live by the checklist, so it's not included here)
[email, password].forEach((el) =>
  el.addEventListener("input", () => clearFieldError(el))
);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  let firstBad = null;
  const fail = (el, msg) => { setFieldError(el, msg); firstBad = firstBad || el; };

  if (!email.value.trim())        fail(email, "Email is required.");
  else if (!isEmail(email.value)) fail(email, "Enter a valid email address.");

  if (!password.value)                        fail(password, "Password is required.");
  else if (!isStrongPassword(password.value)) {
    fail(password, "Password doesn't meet the requirements below.");
    panel.classList.add("show");
  }

  if (!confirm.value)                        fail(confirm, "Please confirm your password.");
  else if (confirm.value !== password.value) fail(confirm, "Passwords don't match.");

  if (firstBad) { firstBad.focus(); return; }

  // valid — no backend yet, so route to the correct home screen (US-01)
  const role = form.querySelector('input[name="role"]:checked')?.value || "student";
  window.location.href = role === "admin" ? "admin-dashboard.html" : "dashboard.html";
});
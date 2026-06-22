// frontend/js/pages/login.js
import { isEmail, setFieldError, clearFieldError } from "../validation.js";

const form     = document.querySelector(".auth-form");
const email    = document.getElementById("email");
const password = document.getElementById("password");

[email, password].forEach((el) =>
  el.addEventListener("input", () => clearFieldError(el))
);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  let firstBad = null;
  const fail = (el, msg) => { setFieldError(el, msg); firstBad = firstBad || el; };

  if (!email.value.trim())        fail(email, "Email is required.");
  else if (!isEmail(email.value)) fail(email, "Enter a valid email address.");

  // on login we only check the password isn't empty — not its strength
  if (!password.value) fail(password, "Password is required.");

  if (firstBad) { firstBad.focus(); return; }

  // valid — no backend yet, so route to the dashboard
  window.location.href = "dashboard.html";
});
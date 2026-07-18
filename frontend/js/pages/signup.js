import { initPasswordChecklist } from "../components/passwordChecklist.js";
import { isEmail, isStrongPassword, setFieldError, clearFieldError } from "../validation.js";

const API_URL = "http://localhost:5000";

const form = document.querySelector(".auth-form");

const firstName = document.getElementById("first-name");
const lastName = document.getElementById("last-name");
const email = document.getElementById("email");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirm-password");

const passwordPanel = document.querySelector(".password-rules");
const submitButton = form.querySelector('button[type="submit"]');

initPasswordChecklist({ password: password, confirm: confirmPassword, panel: passwordPanel });

firstName.addEventListener("input", function () {
  clearFieldError(firstName);
});

lastName.addEventListener("input", function () {
  clearFieldError(lastName);
});

email.addEventListener("input", function () {
  clearFieldError(email);
});

password.addEventListener("input", function () {
  clearFieldError(password);
});

confirmPassword.addEventListener("input", function () {
  clearFieldError(confirmPassword);
});

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  let firstBadField = null;

  function showError(input, message) {
    setFieldError(input, message);

    if (firstBadField === null) {
      firstBadField = input;
    }
  }

  if (firstName.value.trim() === "") {
    showError(firstName, "First name is required.");
  }

  if (lastName.value.trim() === "") {
    showError(lastName, "Last name is required.");
  }

  if (email.value.trim() === "") {
    showError(email, "Email is required.");
  } else if (!isEmail(email.value.trim())) {
    showError(email, "Enter a valid email address.");
  }

  if (password.value === "") {
    showError(password, "Password is required.");
  } else if (!isStrongPassword(password.value)) {
    showError( password, "Password does not meet the requirements." );
    passwordPanel.classList.add("show");
  }

  if (confirmPassword.value === "") {
    showError( confirmPassword, "Please confirm your password." );
  } else if (confirmPassword.value !== password.value) {
    showError( confirmPassword, "Passwords do not match." );
  }

  if (firstBadField !== null) {
    firstBadField.focus();
    return;
  }

  const selectedRole = document.querySelector(
    'input[name="role"]:checked'
  ).value;

  submitButton.disabled = true;
  submitButton.textContent = "Creating account...";

  try {
    const response = await fetch(
      API_URL + "/auth/register",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({ first_name: firstName.value.trim(), last_name: lastName.value.trim(), email: email.value.trim(), password: password.value, role: selectedRole })
      }
    );

    const data = await response.json();

    if (response.ok === false) {
      throw new Error(
        data.message || "Could not create account."
      );
    }

    alert("Account created successfully. Please log in.");

    window.location.href = "login.html";
  } catch (error) {
    setFieldError(email, error.message);
    email.focus();
  }

  submitButton.disabled = false;
  submitButton.textContent = "Create account";
});

const googleButton = document.querySelector(
  '[data-action="google-signup"]'
);

googleButton.addEventListener("click", function () {
  alert("Google signup is not available yet.");
});

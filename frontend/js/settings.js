import { getProfile, updateProfile } from "./api.js";
import { requireAuth } from "./auth.js";

let loaded = null;

let daysToOption = { 1: "1 day before", 2: "2 days before", 3: "3 days before", 7: "1 week before" };
let optionToDays = { "1 day before": 1, "2 days before": 2, "3 days before": 3, "1 week before": 7 };

function fillForm(p) {
    document.getElementById("full-name").value = (p.firstName + " " + p.lastName).trim();
    document.getElementById("student-id").value = p.id;
    document.getElementById("email").value = p.email;
    document.getElementById("program").value = p.institution;
    document.getElementById("gpa-scale").value = String(p.gpaScale === 12 ? 12 : 4);
    document.getElementById("reminder-time").value = daysToOption[p.reminderDays] || "1 day before";
    document.getElementById("reminder-method").value = p.reminderMethod === "WhatsApp" ? "WhatsApp" : "Email";
}

async function saveProfile() {
    let name = document.getElementById("full-name").value.trim();
    let email = document.getElementById("email").value;
    let msg = document.getElementById("profile-msg");

    msg.classList.remove("hide");

    if (name === "") {
        msg.className = "result-box bad";
        msg.innerHTML = "Full name cannot be empty.";
        return;
    }

    if (email.indexOf("@") === -1) {
        msg.className = "result-box bad";
        msg.innerHTML = "Please enter a valid email address.";
        return;
    }

    let parts = name.split(" ");
    let firstName = parts.shift();
    let lastName = parts.join(" ");

    let scale = Number(document.getElementById("gpa-scale").value);
    let method = document.getElementById("reminder-method").value;
    let days = optionToDays[document.getElementById("reminder-time").value] || 1;

    let patch = {
        first_name: firstName,
        last_name: lastName,
        institution: document.getElementById("program").value,
        theme_mode: document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light",
        preferred_gpa_scale: scale,
        default_reminder_days: days,
        default_reminder_method: method
    };

    msg.className = "result-box";
    msg.innerHTML = "Saving...";

    try {
        await updateProfile(patch);
        const storage = localStorage.getItem("trackr-user") ? localStorage : sessionStorage;
        let stored = {};
        try { stored = JSON.parse(storage.getItem("trackr-user")) || {}; } catch { /* ignore invalid old data */ }
        stored = { ...stored, ...patch };
        storage.setItem("trackr-user", JSON.stringify(stored));
        document.body.dispatchEvent(new CustomEvent("profile:updated", { detail: stored }));

        // Keep the snapshot Reset restores from in step with what was just saved.
        loaded = {
            ...loaded,
            firstName: firstName,
            lastName: lastName,
            institution: patch.institution,
            themeMode: patch.theme_mode,
            gpaScale: patch.preferred_gpa_scale,
            reminderDays: patch.default_reminder_days,
            reminderMethod: patch.default_reminder_method
        };
        msg.className = "result-box good";
        msg.innerHTML = "Your changes have been saved.";
    } catch (e) {
        msg.className = "result-box bad";
        msg.innerHTML = "Could not save your changes. Please try again.";
    }
}

function resetProfile() {
    if (loaded) fillForm(loaded);
    document.getElementById("profile-msg").classList.add("hide");
}

function setTheme(mode) {
    document.documentElement.setAttribute("data-theme", mode);
    try {
        localStorage.setItem("trackr-theme", mode);
    } catch (e) {}

    if (mode === "dark") {
        document.getElementById("dark-btn").classList.add("active");
        document.getElementById("light-btn").classList.remove("active");
    } else {
        document.getElementById("light-btn").classList.add("active");
        document.getElementById("dark-btn").classList.remove("active");
    }
}

function logout() {
    localStorage.removeItem("trackr-token");
    sessionStorage.removeItem("trackr-token");
    localStorage.removeItem("trackr-user");
    sessionStorage.removeItem("trackr-user");
    window.location.replace("login.html");
}

function deleteAccount() {
    let ok = confirm("Are you sure you want to delete your account? This cannot be undone.");
    if (ok) {
        alert("Account deletion isn't available yet.");
    }
}

async function init() {
    if (!requireAuth()) return;
    try {
        loaded = await getProfile();
        fillForm(loaded);
        let current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
        setTheme(current);
    } catch (e) {
        let msg = document.getElementById("profile-msg");
        msg.classList.remove("hide");
        msg.className = "result-box bad";
        msg.innerHTML = "Couldn't load your profile. Please refresh.";
    }
}

window.saveProfile = saveProfile;
window.resetProfile = resetProfile;
window.setTheme = setTheme;
window.logout = logout;
window.deleteAccount = deleteAccount;

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();

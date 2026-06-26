let savedProfile = {
    name: "Alex Chen",
    id: "210234567",
    email: "a.chen@mylaurier.ca",
    program: "Computer Science",
    year: "3"
};

function saveProfile() {
    let name = document.getElementById("full-name").value;
    let email = document.getElementById("email").value;
    let year = Number(document.getElementById("year").value);
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

    if (year < 1 || year > 8) {
        msg.className = "result-box bad";
        msg.innerHTML = "Year of study must be between 1 and 8.";
        return;
    }

    savedProfile.name = name;
    savedProfile.id = document.getElementById("student-id").value;
    savedProfile.email = email;
    savedProfile.program = document.getElementById("program").value;
    savedProfile.year = document.getElementById("year").value;

    msg.className = "result-box good";
    msg.innerHTML = "Your changes have been saved.";
}

function resetProfile() {
    document.getElementById("full-name").value = savedProfile.name;
    document.getElementById("student-id").value = savedProfile.id;
    document.getElementById("email").value = savedProfile.email;
    document.getElementById("program").value = savedProfile.program;
    document.getElementById("year").value = savedProfile.year;
    document.getElementById("profile-msg").classList.add("hide");
}

function setTheme(mode) {
    // Use the app-wide theme system
    document.documentElement.setAttribute("data-theme", mode);
    try {
        localStorage.setItem("trackr-theme", mode);
    } catch (e) {}
    syncThemeButtons();
}

// Reflect the currently active theme on the Light/Dark buttons.
function syncThemeButtons() {
    let mode = document.documentElement.getAttribute("data-theme") || "light";
    let light = document.getElementById("light-btn");
    let dark = document.getElementById("dark-btn");
    if (!light || !dark) return;
    light.classList.toggle("active", mode !== "dark");
    dark.classList.toggle("active", mode === "dark");
}

document.addEventListener("DOMContentLoaded", syncThemeButtons);

function logout() {
    window.location.href = "login.html";
}

function deleteAccount() {
    let ok = confirm("Are you sure you want to delete your account? This cannot be undone.");
    if (ok) {
        alert("Account deleted.");
    }
}

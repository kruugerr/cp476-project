let reminders = [
    { id: 1, title: "ML Project Proposal Due", type: "Assignment", priority: "high" },
    { id: 2, title: "ML Project Proposal Due", type: "Assignment", priority: "high" },
    { id: 3, title: "ML Project Proposal Due", type: "Assignment", priority: "high" }
];

let nextId = 4;

function renderReminders() {
    let list = document.getElementById("reminder-list");
    list.innerHTML = "";

    for (let r of reminders) {
        let card = document.createElement("div");
        card.className = "reminder-card";
        card.innerHTML =
            '<span class="reminder-bell">🔔</span>' +
            '<div class="reminder-info">' +
                '<strong>' + r.title + '</strong>' +
                '<span class="priority ' + r.priority + '">' + r.priority + '</span>' +
                '<p>' + r.type + '</p>' +
            '</div>' +
            '<div class="reminder-actions">' +
                '<a onclick="editReminder(' + r.id + ')">Edit</a>' +
                '<a onclick="deleteReminder(' + r.id + ')">Delete</a>' +
            '</div>';
        list.appendChild(card);
    }
}

function showForm() {
    document.getElementById("create-form").classList.remove("hide");
    document.getElementById("create-btn").classList.add("hide");
}

function hideForm() {
    document.getElementById("create-form").classList.add("hide");
    document.getElementById("create-btn").classList.remove("hide");
    document.getElementById("new-title").value = "";
}

function addReminder() {
    let title = document.getElementById("new-title").value;
    let type = document.getElementById("new-type").value;
    let priority = document.getElementById("new-priority").value;

    if (title === "") {
        alert("Please enter a reminder title.");
        return;
    }

    reminders.push({ id: nextId, title: title, type: type, priority: priority });
    nextId++;

    hideForm();
    renderReminders();
}

function deleteReminder(id) {
    reminders = reminders.filter(function (r) {
        return r.id !== id;
    });
    renderReminders();
}

function editReminder(id) {
    let r = reminders.find(function (x) {
        return x.id === id;
    });

    let newTitle = prompt("Edit reminder title:", r.title);
    if (newTitle !== null && newTitle !== "") {
        r.title = newTitle;
        renderReminders();
    }
}

renderReminders();

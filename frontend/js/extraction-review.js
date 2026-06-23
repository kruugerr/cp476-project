let loadingSection = document.getElementById("loadingSection");
let reviewSection = document.getElementById("reviewSection");
let addBtn = document.getElementById("addBtn");
let saveBtn = document.getElementById("saveBtn");
let assignmentBox = document.getElementById("assignmentBox");

setTimeout(function () {
    loadingSection.style.display = "none";
    reviewSection.style.display = "block";
}, 2500);

addBtn.onclick = function () {
    let row = document.createElement("div");
    row.className = "assignment-row";

    row.innerHTML = `
        <input type="text" placeholder="Assignment name">
        <input type="text" placeholder="Type">
        <input type="date">
        <input type="text" placeholder="Weight">
        <select>
            <option>Not Started</option>
            <option>In Progress</option>
            <option>Completed</option>
        </select>
    `;

    assignmentBox.appendChild(row);
};

saveBtn.onclick = function () {
    alert("Course added successfully.");
    window.location.href = "dashboard.html";
};

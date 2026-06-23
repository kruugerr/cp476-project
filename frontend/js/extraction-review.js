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
    let newAssignment = document.createElement("div");

    newAssignment.className = "assignment";

    newAssignment.innerHTML = `
        <label>Assignment Name</label>
        <input type="text" placeholder="Assignment name">

        <label>Due Date</label>
        <input type="date">

        <label>Weight</label>
        <input type="text" placeholder="Weight">
    `;

    assignmentBox.appendChild(newAssignment);
};

saveBtn.onclick = function () {
    alert("Course saved successfully.");
    window.location.href = "dashboard.html";
};

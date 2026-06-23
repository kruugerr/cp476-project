let assignmentList = document.getElementById("assignmentList");
let addAssignmentBtn = document.getElementById("addAssignmentBtn");
let saveBtn = document.getElementById("saveBtn");

let assignments = [
    {
        name: "Milestone 02",
        dueDate: "2026-06-25",
        weight: "7"
    },
    {
        name: "Final Project",
        dueDate: "2026-08-01",
        weight: "25"
    }
];

function showAssignments() {
    assignmentList.innerHTML = "";

    for (let i = 0; i < assignments.length; i++) {
        assignmentList.innerHTML += `
            <div class="assignment-row">
                <label>Assignment Name</label>
                <input type="text" value="${assignments[i].name}">

                <label>Due Date</label>
                <input type="date" value="${assignments[i].dueDate}">

                <label>Weight</label>
                <input type="text" value="${assignments[i].weight}">
            </div>
        `;
    }
}

addAssignmentBtn.addEventListener("click", function () {
    assignments.push({
        name: "",
        dueDate: "",
        weight: ""
    });

    showAssignments();
});

saveBtn.addEventListener("click", function () {
    alert("Course saved successfully.");
    window.location.href = "dashboard.html";
});

showAssignments();

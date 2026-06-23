function updateGrade() {
    let grade = document.getElementById("grade4").value;

    if (grade == "") {
        alert("Missing assignment grade.");
    } else {
        document.getElementById("midtermGrade").innerHTML = grade + "%";
        alert("Grade updated.");
    }
}

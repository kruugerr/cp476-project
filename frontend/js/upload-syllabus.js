let pdfFile = document.getElementById("pdfFile");
let extractBtn = document.getElementById("extractBtn");
let fileMessage = document.getElementById("fileMessage");

extractBtn.addEventListener("click", function () {
    if (pdfFile.files.length === 0) {
        alert("Please choose a PDF file first.");
        return;
    }

    let fileName = pdfFile.files[0].name;
    fileMessage.innerHTML = "Selected file: " + fileName;

    alert("AI extraction started.");

    window.location.href = "extraction-review.html";
});

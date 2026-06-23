let pdfFile = document.getElementById("pdfFile");
let extractBtn = document.getElementById("extractBtn");
let fileMessage = document.getElementById("fileMessage");

extractBtn.onclick = function () {
    if (pdfFile.files.length == 0) {
        alert("Please choose a PDF file first.");
    } else {
        let name = pdfFile.files[0].name;
        fileMessage.innerHTML = "Selected file: " + name;

        alert("AI extraction started.");

        window.location.href = "extraction-review.html";
    }
};

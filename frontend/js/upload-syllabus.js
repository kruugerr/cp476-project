let pdfFile = document.getElementById("pdfFile");
let extractBtn = document.getElementById("extractBtn");
let fileMessage = document.getElementById("fileMessage");

extractBtn.onclick = function () {
    if (pdfFile.files.length == 0) {
        alert("Please choose a PDF file first.");
    } else {
        fileMessage.innerHTML = "Selected file: " + pdfFile.files[0].name;
        window.location.href = "extraction-review.html";
    }
};

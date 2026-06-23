let uploadBtn = document.getElementById("uploadBtn");
let pdfFile = document.getElementById("pdfFile");
let message = document.getElementById("message");

uploadBtn.addEventListener("click", function () {

    if (pdfFile.files.length == 0) {
        alert("Please select a PDF file");
        return;
    }

    let fileName = pdfFile.files[0].name;

    message.innerHTML = "File Selected: " + fileName;

    setTimeout(function () {
        window.location.href = "extraction-review.html";
    }, 2000);

});

async function uploadFile() {
    const fileInput = document.getElementById("fileInput");
    if (!fileInput.files.length) {
        alert("Please select a file.");
        return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    const response = await fetch("/upload", { method: "POST", body: formData });
    const result = await response.json();

    if (result.success) {
        document.getElementById("result").style.display = "block";
        document.getElementById("excelLink").href = result.excel;
        document.getElementById("imageLink").href = result.image;
    } else {
        alert("Error processing file.");
    }
}

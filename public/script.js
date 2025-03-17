async function uploadFile() {
    const fileInput = document.getElementById("fileInput");

    if (!fileInput.files.length) {
        alert("Please select a file.");
        return;
    }

    const file = fileInput.files[0];
    const allowedExtensions = ["txt", "lvm"];
    const fileExt = file.name.split(".").pop().toLowerCase();

    if (!allowedExtensions.includes(fileExt)) {
        alert("Invalid file type! Please upload a .txt or .lvm file.");
        fileInput.value = ""; // Clear input
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const loadingSpinner = document.getElementById("loading");

    try {
        // Show the loading spinner
        loadingSpinner.style.display = "block";
        const response = await fetch("/upload", { method: "POST", body: formData });
        const result = await response.json();

        // Hide the loading spinner
        loadingSpinner.style.display = "none";

        if (result.success) {
            document.getElementById("result").style.display = "block";
            document.getElementById("excelLink").href = result.excel;
            document.getElementById("imageLink").href = result.image;
        } else {
            alert("Error processing file.");
        }
    } catch (error) {
        console.error("Upload failed:", error);
        alert("An error occurred while uploading.");
        loadingSpinner.style.display = "none"; // Hide spinner on error
    }
}

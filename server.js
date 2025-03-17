require('dotenv').config();
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const ExcelJS = require("exceljs");
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");

const app = express();
const PORT = process.env.PORT || 3000;


// File validation function
const fileFilter = (req, file, cb) => {
    const allowedTypes = [".txt", ".lvm"];
    const fileExt = path.extname(file.originalname).toLowerCase();
  
    if (allowedTypes.includes(fileExt)) {
      cb(null, true); // Accept file
    } else {
      cb(new Error("Invalid file type. Only .txt and .lvm files are allowed!"), false);
    }
  };

// Storage for uploaded files
const upload = multer({ 
    dest: "uploads/",
    fileFilter: fileFilter,
 });

// Ensure output directories exist
const outputDir = "output";
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

// Chart configuration
const width = 800;
const height = 400;
const chartCallback = (ChartJS) => {};

// API to handle file upload and processing
app.post("/upload", upload.single("file"), async (req, res) => {
    const filePath = req.file.path;
    const fileName = path.basename(req.file.originalname, path.extname(req.file.originalname));

    try {
        // Read and parse the .lvm file
        const rawData = fs.readFileSync(filePath, "utf-8");
        console.log(rawData);
        const data = parseLVM(rawData);
        // Generate Excel file
        const excelPath = path.join(outputDir, `${fileName}.xlsx`);
        await createExcelWithChart(data, excelPath);

        // Generate PNG graph
        const imagePath = path.join(outputDir, `${fileName}.png`);
        await createChartImage(data, imagePath);

        res.json({ success: true, excel: excelPath, image: imagePath });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error processing file" });
    } finally {
        fs.unlinkSync(filePath); // Cleanup uploaded file
    }
});

// Parse .lvm file (Assuming tab-separated values)
function parseLVM(rawData) {
    const lines = rawData.trim().split("\n");
    console.log("Raw lines:", lines); // Debugging step
    return lines.map(line => {
        const values = line.trim().split("\t").map(Number);
        console.log("Parsed line:", values); // Debugging each parsed row
        return values;
    });
}

// Create Excel file with an embedded chart
async function createExcelWithChart(data, filePath) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Data");

    // Insert headers
    sheet.addRow([" ", "Time", "S1", "S2", "S3", "S4", "S1 %", "S2 %", "S3 %", "S4 %"]);

    // Insert data
    data.forEach((row) => sheet.addRow(row));

    // Save Excel file
    await workbook.xlsx.writeFile(filePath);
}

// Create a PNG graph using Chart.js
async function createChartImage(data, filePath) {
    const canvas = new ChartJSNodeCanvas({ width, height });

    // Extracting columns from the dataset
    const timeValues = data.map(row => row[0]); // Extract Time from column 1
    const s1Values = data.map(row => row[5]);  // Extract S1 (%) from column 5
    const s2Values = data.map(row => row[6]);  // Extract S2 (%) from column 6
    const s3Values = data.map(row => row[7]);  // Extract S3 (%) from column 7
    const s4Values = data.map(row => row[8]);  // Extract S4 (%) from column 8

    const datasets = [
        { label: "S1 (%)", data: s1Values, borderColor: "red", borderWidth: 2, fill: false },
        { label: "S2 (%)", data: s2Values, borderColor: "blue", borderWidth: 2, fill: false },
        { label: "S3 (%)", data: s3Values, borderColor: "green", borderWidth: 2, fill: false },
        { label: "S4 (%)", data: s4Values, borderColor: "purple", borderWidth: 2, fill: false }
    ];

    const chartConfig = {
        type: "line",
        data: { labels: timeValues, datasets },
        options: {
            scales: {
                x: { title: { display: true, text: "Time" } },
                y: { title: { display: true, text: "Percentage (%)" } }
            }
        }
    };

    const imageBuffer = await canvas.renderToBuffer(chartConfig);
    fs.writeFileSync(filePath, imageBuffer);
}

// Serve frontend
app.use(express.static("public"));

 // Serve downloadable files
app.use("/output", express.static(path.join(__dirname, "output")));

// Route for downloading the Excel file
app.get("/download/:filename", (req, res) => {
    const filePath = path.join(__dirname, "output", req.params.filename);
    res.download(filePath, (err) => {
        if (err) {
            console.error("Download error:", err);
            res.status(500).send("Error downloading file");
        }
    });
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

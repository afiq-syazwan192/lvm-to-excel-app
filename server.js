require('dotenv').config();
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const ExcelJS = require("exceljs");
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");

const app = express();
const PORT = process.env.PORT || 3000;

// Storage for uploaded files
const upload = multer({ dest: "uploads/" });

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
    return lines.map((line) => line.split("\t").map(Number));
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
    const canvas = new ChartJSNodeCanvas({ width, height, chartCallback });

    const chartConfig = {
        type: "line",
        data: {
            labels: data.map((row, index) => index), // X-axis
            datasets: [
                {
                    label: "LVM Data",
                    data: data.map((row) => row[1]), // Y-axis
                    borderColor: "blue",
                    borderWidth: 2,
                    fill: false,
                },
            ],
        },
        options: {
            scales: {
                x: { title: { display: true, text: "Time" } },
                y: { title: { display: true, text: "Value" } },
            },
        },
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

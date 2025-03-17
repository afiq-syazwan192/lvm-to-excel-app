const fs = require('fs');
const ExcelJS = require('exceljs');

async function convertTxtToExcel(txtFilePath, excelFilePath) {
    // Read the .txt file
    const data = fs.readFileSync(txtFilePath, 'utf8');

    // Split data into rows (by newline)
    const rows = data.split('\n').map(row => row.trim().split(/\s+/)); // Splitting by spaces/tabs

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    // Add rows to the worksheet
    rows.forEach(row => {
        worksheet.addRow(row);
    });

    // Save the Excel file
    await workbook.xlsx.writeFile(excelFilePath);

    console.log(`Excel file created: ${excelFilePath}`);
}

// Example usage
convertTxtToExcel('data.lvm', 'output.xlsx')
    .then(() => console.log("Conversion successful!"))
    .catch(err => console.error("Error:", err));
# TXT to Excel Converter

A web application that converts text files (including .lvm files) to Excel format with data visualization capabilities.

## Features

- File upload support for text and .lvm files
- Automatic conversion to Excel format
- Data visualization using Chart.js
- Web-based interface for easy access
- Support for multiple file formats
- Real-time data processing

## Prerequisites

- Node.js (v12 or higher)
- npm (Node Package Manager)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd txt-to-excel
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and configure your environment variables if needed.

## Usage

1. Start the server:
```bash
npm start
```

2. Open your web browser and navigate to `http://localhost:3000`

3. Upload your text file through the web interface

4. The converted Excel file will be automatically generated and available for download

## Project Structure

- `server.js` - Main application server
- `public/` - Static files (HTML, CSS, client-side JavaScript)
- `uploads/` - Temporary storage for uploaded files
- `output/` - Directory for converted Excel files
- `convert.js` - File conversion logic

## Dependencies

- express - Web application framework
- exceljs - Excel file manipulation
- multer - File upload handling
- chartjs-node-canvas - Server-side chart generation
- xlsx - Spreadsheet processing
- dotenv - Environment variable management

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 
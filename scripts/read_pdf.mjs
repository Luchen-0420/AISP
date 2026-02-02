import fs from 'fs';
import pdf from 'pdf-parse';

const pdfPath = process.argv[2];

if (!pdfPath) {
    console.error("Please provide a PDF path");
    process.exit(1);
}

const dataBuffer = fs.readFileSync(pdfPath);

// ESM import might result in default export
const parse = pdf.default || pdf;

if (typeof parse !== 'function') {
    console.log("PDF export is not a function:", parse);
    // process.exit(1); 
    // Try to inspect further if needed, or just fail
}

parse(dataBuffer).then(function (data) {
    console.log(data.text);
}).catch(err => {
    console.error("Error parsing PDF:", err);
});

const fs = require('fs');
const pdf = require('pdf-parse');

const pdfPath = process.argv[2];

if (!pdfPath) {
    console.error("Please provide a PDF path");
    process.exit(1);
}

const dataBuffer = fs.readFileSync(pdfPath);

// pdf-parse might be an object
const parse = typeof pdf === 'function' ? pdf : pdf.default;

if (typeof parse !== 'function') {
    console.error("PDF Parse library format unexpected:", typeof pdf, pdf);
    process.exit(1);
}

parse(dataBuffer).then(function (data) {
    console.log(data.text);
}).catch(err => {
    console.error("Error parsing PDF:", err);
});

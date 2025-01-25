import fs from 'fs';
import pdfParse from 'pdf-parse';

const textFromPDF = (filePath) => {
    console.log(filePath);
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                return reject(err);
            }

            pdfParse(data).then(result => {
                resolve(result.text);
            }).catch(error => {
                reject(error);
            });
        });
    });
}

const audioChunkTowav = (chunk) => {
    
}

export { textFromPDF };
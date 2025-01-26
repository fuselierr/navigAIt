import fs from 'fs';
import pdfParse from 'pdf-parse';
import screenshot from 'screenshot-desktop';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const screenshotsDir = path.join(__dirname, 'uploads/');
if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
}

function deletePDFs() {
    const directoryPath = path.join(__dirname, 'uploads/');
    const files = fs.readdirSync(directoryPath);
    files.forEach(file => {
        const ext = path.extname(file).toLowerCase();
        if (ext === '.pdf') {
            fs.unlinkSync(path.join(directoryPath, file));
        }
    });
}

function clearCombinedTxt() {
    const combinedTxtPath = path.join(__dirname, 'uploads', 'combined.txt');
    fs.writeFileSync(combinedTxtPath, '.', 'utf-8');
    console.log('Contents of combined.txt have been deleted');
}

clearCombinedTxt();

function takeScreenshot() {
    const filePath = path.join(screenshotsDir, 'screenshot.png');
    screenshot({ filename: filePath }).then((imgPath) => {
        console.log(`Screenshot saved to ${imgPath}`);
    }).catch((error) => {
        console.error('Error taking screenshot', error);
    });
}

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

const combineFiles = (processedFiles) => {
    let combinedText = '';
    processedFiles.forEach(file => {
        combinedText += `File: ${file.cleanedText}\n\n`;
    });

    fs.writeFile(path.join(__dirname, 'uploads', 'combined.txt'), combinedText, (err) => {
        if (err) {
            console.error('Error writing combined file:', err);
        } else {
            console.log('Combined file written successfully');
        }
    });
}

const primeText = (text) => {
    //const stopwords = ['i','me','my','myself','we','our','ours','ourselves','you','your','yours','yourself','yourselves','he','him','his','himself','she','her','hers','herself','it','its','itself','they','them','their','theirs','themselves','what','which','who','whom','this','that','these','those','am','is','are','was','were','be','been','being','have','has','had','having','do','does','did','doing','a','an','the','and','but','if','or','because','as','until','while','of','at','by','for','with','about','against','between','into','through','during','before','after','above','below','to','from','up','down','in','out','on','off','over','under','again','further','then','once','here','there','when','where','why','how','all','any','both','each','few','more','most','other','some','such','no','nor','not','only','own','same','so','than','too','very','s','t','can','will','just','don','should','now']
    // Remove newlines and weird characters
    let cleanedText = text.replace(/(\r\n|\n|\r)/gm, " ").replace(/[^a-zA-Z0-9 ]/g, "");

    // Remove stopwords
    //cleanedText = cleanedText.split(' ').filter(word => !stopwords.includes(word.toLowerCase())).join(' ');

    return cleanedText;
}

export { textFromPDF, primeText, takeScreenshot, deletePDFs, combineFiles};
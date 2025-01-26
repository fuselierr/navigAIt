import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { textFromPDF, primeText, takeScreenshot, deletePDFs, combineFiles } from './utils.js';
import fs from 'fs';
import http from 'http';
import path from 'path';
//import { startRecording, stopRecording } from './stream.js';

const PORT = 3001;
const app = express();
const server = http.createServer(app);

let latestMessage = "";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

deletePDFs(); // Delete any existing PDFs

// multer storage for pdf
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage: storage });

// Basic server endpoint
app.get('/', (req, res) => {
    res.send('Server is up and running!');
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})

app.post('/pdf-upload', upload.array('pdfs'), async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
    }
    try {
        const processedFiles = await Promise.all(
            req.files.map(async (file) => {
                const text = await textFromPDF(file.path); // Extract text from PDF
                return {
                    originalName: file.originalname,
                    cleanedText: primeText(text), // Clean and process text
                };
            })
        ).then((processedFiles) => {
            combineFiles(processedFiles); // Combine all the processed files and put them in uploads
        });

        res.json({
            message: 'PDF files received',
            processedFiles, // Send the cleaned text for each uploaded file
        });
    } catch (error) {
        res.status(400).json({ message: 'Error processing PDF files', error });
    }
});

// Send tts response from llm
app.get('/send-audio', (req, res) => {
    const filePath = NULL;
    if (fs.existsSync(filePath)) {
        res.sendFile(path.resolve(filePath));
    } else {
        res.status(400).json({ message: 'No audio file present' });
    }
    res.json({ message: 'Audio file received' });
})

// Receive and process screenshots from client
app.post('/screenshots', upload.single('screenshot'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No screenshot file present' });
    }
    res.json({ message: 'Screenshot file received', filePath: req.file.path });
})

// Audio testing for Gemini
app.post('/send-audio', upload.single('wav'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No audio file present' });
    }
    res.json({ message: 'Audio file received', filePath: req.file.path });
})

app.get('/send-text', (req, res) => {
    res.send(latestMessage);
})

app.post('/transcription', (req, res) => {
    //startRecording();
    //setInterval(takeScreenshot, 1000);
    res.json({ message: 'Transcription received' });
})

app.post('/stop-transcription', (req, res) => {
    //stopRecording();
    res.json({ message: 'Transcription stopped' });
})
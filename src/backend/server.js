import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { textFromPDF, primeText } from './utils.js';
import fs from 'fs';
import http from 'http';
import { Server } from 'socket.io';
import { startRecording, stopRecording } from './stream.js';

const PORT = 3001;
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"],
  },
});


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

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

// Get uploaded pdf file from frontend
app.post('/pdf-upload', upload.single('pdf'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    const filePath = req.file.path;
    textFromPDF(filePath).then(text => {
        const cleanedText = primeText(text);
        res.json({ message: 'PDF file received', cleanedText });
    }).catch(error => {
        res.status(400).json({ message: 'Error reading PDF file', error });
    });
})

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

// Start AI assistance protocol
app.post('/start-assistance', (req, res) => {
    res.json({ message: 'AI assistance started' });
  
    // Start listening for audio streams on Socket.io
    io.on('connection', (socket) => {
      console.log('A user connected for AI assistance');
  
      // Handle incoming audio data from the client
      socket.on('audio', (audioChunk) => {
        console.log('Received audio chunk');
  
        // Generate a unique filename for each chunk
        const timestamp = Date.now();
        const filename = `audio_chunk_${timestamp}.wav`;
        const filepath = path.join('audio_chunks', filename);
  
        // Ensure the directory exists
        if (!fs.existsSync('audio_chunks')) {
          fs.mkdirSync('audio_chunks');
        }
  
        // Write the audio chunk to a new WAV file
        const fileWriter = new wav.FileWriter(filepath, {
          sampleRate: 44100, // Adjust to match your audio stream
          channels: 1, // Mono audio
        });
  
        fileWriter.write(Buffer.from(audioChunk));
        fileWriter.end(() => {
          console.log(`Saved audio chunk to ${filename}`);
        });
      });
  
      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('A user disconnected');
      });
    });
})
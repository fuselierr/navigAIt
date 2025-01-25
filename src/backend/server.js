import express from 'express';
import cors from 'cors';
import multer from 'multer';

const PORT = 3001;
const app = express();
app.use(express.json());
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
    res.json({ message: 'PDF file received' });
})

// Get input audio from employee/user
app.post('/audio-upload', (req, res) => {
    res.json({ message: 'Audio file received' });
})

// Send tts response from llm
app.get('/send-audio', (req, res) => {
    res.json({ message: 'Audio file received' });
})

// Start AI assistance protocol
app.post('/start-assistance', (req, res) => {
    
    res.json({ message: 'AI assistance started' });
})
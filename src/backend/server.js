import express from 'express';

const PORT = 3001;
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Server is up and running!');
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
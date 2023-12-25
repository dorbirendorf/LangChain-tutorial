import express from 'express';
const app = express();
const port = 3000;
import QuestionProcessor from './QuestionProcessor.js';
import cors from 'cors';

app.use(express.json()); // for parsing application/json
app.use(cors())

const questionProcessor = new QuestionProcessor();

// Define a route
app.post('/chatbot', async (req, res) => {
    const question = req.body.question
    const history = req.body.history
    const result = await questionProcessor.processQuestion(question,history);
    res.json(result);
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
const express = require('express');
const cors = require('cors');
const XLSX = require('xlsx');;
const http = require('http');
const { error } = require('console');
const app = express();
const server = http.createServer(app)
const PORT = process.env.PORT || 4000;
const path = require('path')

app.use(cors());

app.get('/questions-and-answers', (req, res) => {
    res.json(questionsAndAnswers);
});

app.get('/', (req,res) =>{

    res.send('Servidor a correr')

})





app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
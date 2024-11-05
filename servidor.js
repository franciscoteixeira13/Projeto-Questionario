const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Password@08vzT65',
    database: 'projeto_questionario', // Certifique-se de usar o nome correto do seu banco de dados
    port: 3306
});

connection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar: ' + err.stack);
        return;
    }
    console.log('Conectado como ID ' + connection.threadId);
});

connection.query('SHOW TABLES', (err, results) => {
    if (err) {
        console.error('Erro ao executar a consulta: ' + err.stack);
    } else {
        console.log('Tabelas no banco de dados:', results);
    }
});

// Rota para lidar com POST na /api/survey
app.post('/api/survey', (req, res) => {
    console.log('Dados recebidos:', req.body); // Verifica os dados recebidos

    // Acessando valores do usuário do req.body
    const { user, responses = [] } = req.body; // Supondo que você agora está enviando um array de respostas

    // Inserindo os dados do usuário na tabela correspondente
    const userSql = 'INSERT INTO entrevistados (name, jobtitle, location, functional_area) VALUES (?, ?, ?, ?)';
    const userValues = [user.name, user.jobTitle, user.location, user.functionalArea]; // Use user.<coluna> conforme o objeto req.body

    connection.query(userSql, userValues, (err, userResult) => {
        if (err) {
            console.error('Erro ao inserir dados do usuário: ' + err.stack);
            return res.status(500).json({ error: 'Erro ao inserir dados do usuário' });
        }

        // Obtendo o ID do usuário inserido
        const userId = userResult.insertId;

        // Array para armazenar as promessas de inserção
        const insertPromises = responses.map(response => {
            const { Data, Normas_aplicaveis, Indice_Pergunta, Ambito, Pergunta, Resposta, Comentarios } = response;

            // Agora, inserindo as informações do questionário para cada resposta
            const surveySql = 'INSERT INTO questionario (user_id, Data, Normas_aplicaveis, Indice_Pergunta, Ambito, Pergunta, Resposta, Comentarios) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
            const surveyValues = [userId, Data, Normas_aplicaveis, Indice_Pergunta, Ambito, Pergunta, Resposta, Comentarios];

            return new Promise((resolve, reject) => {
                connection.query(surveySql, surveyValues, (err, surveyResult) => {
                    if (err) {
                        console.error('Erro ao inserir dados do questionário: ' + err.stack);
                        return reject(err); // Se ocorrer um erro, rejeita a promessa
                    }
                    resolve(surveyResult.insertId); // Resolve a promessa com o ID do registro inserido
                });
            });
        });

        // Executa todas as promessas
        Promise.all(insertPromises)
            .then(surveyIds => {
                res.status(200).json({
                    message: 'Dados inseridos com sucesso',
                    userId: userId, // ID do usuário inserido
                    surveyIds: surveyIds // IDs dos registros do questionário inseridos
                });
            })
            .catch(err => {
                console.error('Erro ao inserir dados do questionário: ' + err.stack);
                res.status(500).json({ error: 'Erro ao inserir dados do questionário' });
            });
    });
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
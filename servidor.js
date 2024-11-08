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
    database: 'projeto_questionario', 
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
// Rota para lidar com POST na /api/survey
app.post('/api/survey', (req, res) => {
    console.log('Dados recebidos:', req.body); // Verifica os dados recebidos

    // Acessando valores do req.body
    const { entrevistador, entrevistado, responses = [] } = req.body;

    // Inserindo os dados do entrevistador
    const entrevistadorSql = 'INSERT INTO entrevistador (name, jobtitle, location, functional_area) VALUES (?, ?, ?, ?)';
    const entrevistadorValues = [entrevistador.nomeEntrevistador, entrevistador.jobTitleEntrevistador, entrevistador.localizacaoEntrevistador, entrevistador.functionalAreaEntrevistador];

    connection.query(entrevistadorSql, entrevistadorValues, (err, entrevistadorResult) => {
        if (err) {
            console.error('Erro ao inserir dados do entrevistador: ' + err.stack);
            return res.status(500).json({ error: 'Erro ao inserir dados do entrevistador' });
        }

        // Obtendo o ID do entrevistador inserido
        const entrevistadorId = entrevistadorResult.insertId;

        // Inserindo os dados do entrevistado
        const entrevistadoSql = 'INSERT INTO entrevistados (name, jobtitle, location, functional_area) VALUES (?, ?, ?, ?)';
        const entrevistadoValues = [entrevistado.nomeEntrevistado, entrevistado.jobTitleEntrevistado, entrevistado.localizacaoEntrevistado, entrevistado.functionalAreaEntrevistado];

        connection.query(entrevistadoSql, entrevistadoValues, (err, entrevistadoResult) => {
            if (err) {
                console.error('Erro ao inserir dados do entrevistado: ' + err.stack);
                return res.status(500).json({ error: 'Erro ao inserir dados do entrevistado' });
            }

            // Obtendo o ID do entrevistado inserido
            const entrevistadoId = entrevistadoResult.insertId;

            // Array para armazenar as promessas de inserção das respostas do questionário
            const insertPromises = responses.map(response => {
                const { Data, Normas_aplicaveis, Indice_Pergunta, Ambito, Pergunta, Resposta, Comentarios, Documentacao } = response;

                // Inserindo as informações do questionário
                const surveySql = 'INSERT INTO questionario (user_id, Data, Normas_aplicaveis, Indice_Pergunta, Ambito, Pergunta, Resposta, Comentarios, Documentacao, entrevistador_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                const surveyValues = [entrevistadoId, Data, Normas_aplicaveis, Indice_Pergunta, Ambito, Pergunta, Resposta, Comentarios, Documentacao, entrevistadorId];

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
                        entrevistadorId, // ID do entrevistador inserido
                        entrevistadoId, // ID do entrevistado inserido
                        surveyIds // IDs dos registros do questionário inseridos
                    });
                })
                .catch(err => {
                    console.error('Erro ao inserir dados do questionário: ' + err.stack);
                    res.status(500).json({ error: 'Erro ao inserir dados do questionário' });
                });
        });
    });
});


// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

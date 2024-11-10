const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql2');
const fs = require('fs');
const app = express();
const PORT = 4000;
const { v4: uuidv4 } = require('uuid');

// Configuração do multer para salvar os arquivos diretamente na pasta 'uploads'
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads'; // Define a pasta 'uploads' como destino para todos os arquivos
        fs.mkdirSync(dir, { recursive: true }); // Garante que o diretório 'uploads' exista
        cb(null, dir); // Define o diretório de destino
        console.log(req.files)
    },
    filename: (req, file, cb) => {
        cb(null, uuidv4() + path.extname(file.originalname)); // Define o nome único para cada arquivo
    },
});

const upload = multer({ storage });

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Conexão com o banco de dados
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Password@08vzT65',
    database: 'projeto_questionario',
    port: 3306,
});

connection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.stack);
        return;
    }
    console.log('Conectado ao banco de dados!');
});



// Endpoint para inserir dados do questionário (incluindo upload de arquivos)
app.post('/api/survey', upload.fields([{ name: 'files[0]', maxCount: 5 }]), (req, res) => {
    const { InfoEntrevistador, InfoEntrevistado, responses } = req.body;
    const interviewId = uuidv4(); 
    // Processar os caminhos dos arquivos
    const filePaths = [];
    for (let i = 0; i < responses.length; i++) {
        const filesForThisQuestion = req.files[`files[${i}]`]; // Recupera os arquivos para a pergunta atual

        if (filesForThisQuestion) {
            const pathsForQuestion = filesForThisQuestion.map((file) => file.path); // Extrai os caminhos dos arquivos
            filePaths.push(pathsForQuestion.join(',')); // Concatena os caminhos separados por vírgulas
        } else {
            filePaths.push(''); // Adiciona string vazia se não houver arquivos
        }
    }

    console.log('Dados recebidos:', { InfoEntrevistador, InfoEntrevistado, responses, filePaths });

    // Insere dados do entrevistador
    const entrevistadorSql = `INSERT INTO entrevistador (name, jobtitle, location, functional_area) VALUES (?, ?, ?, ?)`;
    const entrevistadorValues = [
        InfoEntrevistador.nomeEntrevistador,
        InfoEntrevistador.jobTitleEntrevistador,
        InfoEntrevistador.localizacaoEntrevistador,
        InfoEntrevistador.functionalAreaEntrevistador,
    ];

    connection.query(entrevistadorSql, entrevistadorValues, (err, entrevistadorResult) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao salvar entrevistador', details: err.message });
        }
        const entrevistadorId = entrevistadorResult.insertId;

        // Insere dados do entrevistado
        const entrevistadoSql = `INSERT INTO entrevistados (name, jobtitle, location, functional_area) VALUES (?, ?, ?, ?)`;
        const entrevistadoValues = [
            InfoEntrevistado.nomeEntrevistado,
            InfoEntrevistado.jobTitleEntrevistado,
            InfoEntrevistado.localizacaoEntrevistado,
            InfoEntrevistado.functionalAreaEntrevistado,
        ];

        connection.query(entrevistadoSql, entrevistadoValues, (err, entrevistadoResult) => {
            if (err) {
                return res.status(500).json({ error: 'Erro ao salvar entrevistado', details: err.message });
            }
            const entrevistadoId = entrevistadoResult.insertId;

            // Insere os dados do questionário
            const surveySql = `INSERT INTO questionario 
                (user_id, Data, Normas_aplicaveis, Indice_Pergunta, Ambito, Pergunta, Resposta, Comentarios, Documentacao, entrevistador_id, entrevista_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            const surveyPromises = responses.map((response, index) => {
                const {
                    Data,
                    Normas_aplicaveis,
                    Indice_Pergunta,
                    Ambito,
                    Pergunta,
                    Resposta,
                    Comentarios,
                } = response;

                // Recupera a string de arquivos concatenados para esta pergunta
                const documentacao = filePaths[index] || null;

                const surveyValues = [
                    entrevistadoId,
                    Data,
                    Normas_aplicaveis,
                    Indice_Pergunta,
                    Ambito,
                    Pergunta,
                    Resposta,
                    Comentarios,
                    documentacao, // Armazena os caminhos dos arquivos associados à pergunta
                    entrevistadorId,
                    interviewId
                ];

                return new Promise((resolve, reject) => {
                    connection.query(surveySql, surveyValues, (err, result) => {
                        if (err) return reject(err);
                        resolve(result.insertId); // Retorna o ID do questionário inserido
                    });
                });
            });

            Promise.all(surveyPromises)
                .then((surveyIds) => {
                    res.status(200).json({
                        message: 'Dados salvos com sucesso!',
                        surveyIds,
                    });
                })
                .catch((err) => {
                    res.status(500).json({ error: 'Erro ao salvar respostas do questionário', details: err.message });
                });
        });
    });
});


// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
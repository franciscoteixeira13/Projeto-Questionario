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
const JSZip = require('jszip');
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
app.post('/api/survey', upload.any(), (req, res) => {
    const { InfoEntrevistador, InfoEntrevistado, responses } = req.body;
    const interviewId = uuidv4();  // Gerar ID único para a entrevista

    // Processar as perguntas e arquivos associados
    const filePaths = [];
    for (let i = 0; i < responses.length; i++) {
        const filesForThisQuestion = req.files.filter(file => file.fieldname === `files[${i}]`);
        
        if (filesForThisQuestion.length > 0) {
            const pathsForQuestion = filesForThisQuestion.map((file) => file.path);
            filePaths.push(pathsForQuestion.join(','));
        } else {
            filePaths.push('');
        }
    }

    // Inserir os dados no banco de dados (entrevistador, entrevistado e respostas do questionário)
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

        // Inserir dados do entrevistado
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

            // Insere as respostas do questionário
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
                    documentacao,
                    entrevistadorId,
                    interviewId
                ];

                return new Promise((resolve, reject) => {
                    connection.query(surveySql, surveyValues, (err, result) => {
                        if (err) return reject(err);
                        resolve(result.insertId);
                    });
                });
            });


            Promise.all(surveyPromises)
                .then(() => {
                    // Agora vamos criar o arquivo ZIP após o salvamento no banco
                    const zip = new JSZip();

                    // Nome do arquivo ZIP com base nos nomes do entrevistador e entrevistado
                    const zipFileName = `${InfoEntrevistador.nomeEntrevistador}-${InfoEntrevistado.nomeEntrevistado}.zip`;
                    const folder = zip.folder(`${InfoEntrevistador.nomeEntrevistador}-${InfoEntrevistado.nomeEntrevistado}`);

                    // Adicionar o PDF na pasta principal
                    req.files.forEach(file => {
                        if (file.mimetype === 'application/pdf') {
                            folder.file(file.originalname, fs.readFileSync(file.path));  // Adiciona o PDF à pasta principal
                        }
                    });

                    // Criar as subpastas de perguntas dentro da pasta principal
                    responses.forEach((response, index) => {
                        const questionText = response.Pergunta;  // Texto da pergunta
                        const questionFiles = req.files.filter(file => file.fieldname === `files[${index}]`);
                    
                        if (questionFiles.length > 0) {
                            // Formatando o texto da pergunta para ser usado como nome da pasta
                            const formattedQuestionText = questionText
                                .replace(/[^a-zA-Z0-9\s]/g, '')  // Remove caracteres especiais
                                .replace(/\s+/g, '_')            // Substitui espaços por underscores
                                .substring(0, 100);              // Limita o comprimento do nome da pasta
                    
                            // Verifica se o nome formatado da pergunta não está vazio e cria a subpasta com o nome formatado
                            if (formattedQuestionText.trim() !== '') {
                                const questionFolder = folder.folder(formattedQuestionText);  // Subpasta para cada pergunta
                    
                                // Adicionar os arquivos à subpasta
                                questionFiles.forEach(file => {
                                    questionFolder.file(file.originalname, fs.readFileSync(file.path));  // Adiciona o arquivo
                                });
                            }
                        }
                    });
                    

                    // Gerar o arquivo ZIP e salvá-lo
                    zip.generateNodeStream({ type: 'nodebuffer', streamFiles: true })
                        .pipe(fs.createWriteStream(path.join('uploads', zipFileName))) // Salva o arquivo ZIP
                        .on('finish', () => {
                            // Limpar os arquivos temporários
                            req.files.forEach(file => fs.unlinkSync(file.path));

                            // Responder com o caminho do arquivo ZIP gerado
                            res.status(200).json({
                                message: 'Dados salvos com sucesso!',
                                zipFilePath: `/uploads/${zipFileName}`,  // Caminho do arquivo ZIP
                                interviewId,
                            });
                        });
                })
                .catch((err) => {
                    res.status(500).json({ error: 'Erro ao salvar respostas do questionário', details: err.message });
                });
        });
    });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.get('/api/surveys', (req, res) => {
    const query = `
     SELECT 
        entrevistados.name AS entrevistadoName,
        entrevistados.jobtitle AS entrevistadoJobTitle,
        entrevistados.location AS entrevistadoLocation,
        entrevistados.functional_area AS entrevistadoFunctional_area,
        entrevistador.name AS entrevistadorName,
        entrevistador.jobtitle AS entrevistadorJobTitle,
        entrevistador.location AS entrevistadorLocation,
        entrevistador.functional_area AS entrevistadorFunctional_area,
        questionario.entrevista_id,  -- Certifique-se de usar o nome correto aqui
        questionario.Pergunta,
        questionario.Resposta,
        questionario.Documentacao,
        questionario.Comentarios,
        questionario.Normas_aplicaveis,
        questionario.Ambito,
        questionario.Indice_Pergunta,
        questionario.Data
      FROM questionario
      JOIN entrevistados ON questionario.user_id = entrevistados.id
      JOIN entrevistador ON questionario.entrevistador_id = entrevistador.id
      ORDER BY questionario.Data DESC, questionario.id_questionario ;
    `;
  
    connection.query(query, (err, results) => {
        if (err) {
          console.error('Erro na consulta SQL:', err);
          return res.status(500).json({ error: 'Erro ao obter as entrevistas', details: err.message });
        }
      
        const groupedResults = results.reduce((acc, row) => {
            if (!acc[row.entrevista_id]) {
                acc[row.entrevista_id] = {
                    entrevista_id: row.entrevista_id,
                    entrevistadoName: row.entrevistadoName,
                    entrevistadoJobTitle: row.entrevistadoJobTitle,
                    entrevistadoLocation: row.entrevistadoLocation,
                    entrevistadoFunctional_area: row.entrevistadoFunctional_area,
                    entrevistadorName: row.entrevistadorName,
                    entrevistadorJobTitle: row.entrevistadorJobTitle,
                    entrevistadorLocation: row.entrevistadorLocation,
                    entrevistadorFunctional_area: row.entrevistadorFunctional_area,
                    surveyDetails: []
                };
            }

            // Substituir valores nulos por padrões
            acc[row.entrevista_id].surveyDetails.push({
                Pergunta: row.Pergunta,
                Resposta: row.Resposta || "Sem resposta",
                Normas_aplicaveis: row.Normas_aplicaveis || "Nenhuma norma aplicada",
                Ambito: row.Ambito || "Sem âmbito definido",
                Indice_Pergunta: row.Indice_Pergunta || "Sem índice de pergunta",
                Comentarios: row.Comentarios || "Nenhum comentário",
                Documentacao: row.Documentacao,
                entrevistaData: row.Data
            });

            return acc;
        }, {});

        const finalResults = Object.values(groupedResults);
      
        // Processando a documentação
        const processedResults = finalResults.map(survey => {
            survey.surveyDetails = survey.surveyDetails.map(question => {
                if (question.Documentacao) {
                    const files = question.Documentacao.split(',').map(filePath => path.basename(filePath));
                    question.Documentacao = files.join(', ');
                }
                return question;
            });
            return survey;
        });

        res.status(200).json(processedResults);
    });
});


app.get('/api/search', (req, res) => {
    const { searchTerm, searchCriteria } = req.query;
  
    if (!searchTerm || !searchCriteria) {
      return res.status(400).json({ error: 'Termo de pesquisa e critério são necessários' });
    }
  
    // Criação de consulta SQL com base no critério de pesquisa
    let query = 'SELECT * FROM entrevistas WHERE ';
    let values = [];
  
    switch (searchCriteria) {
      case 'entrevistador':
        query += 'entrevistadorName LIKE ?';
        values.push(`%${searchTerm}%`);
        break;
      case 'entrevistado':
        query += 'entrevistadoName LIKE ?';
        values.push(`%${searchTerm}%`);
        break;
      case 'entrevista_id':
        query += 'entrevista_id LIKE ?';
        values.push(`%${searchTerm}%`);
        break;
      default:
        return res.status(400).json({ error: 'Critério de pesquisa inválido' });
    }
})



// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
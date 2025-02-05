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
                    res.status(200).json({

                        message: 'Dados salvos com sucesso',
                        redirectTo: '/survey-summary',
                        interviewId,

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


app.get('/api/excel-file', (req, res) => {
    const directoryPath = path.join(__dirname, 'my-app/public/ficheiro-excel');
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            console.error('Erro ao listar arquivos:', err);
            return res.status(500).json({ error: 'Erro ao listar arquivos' });
        }

        // Filtra arquivos Excel (.xlsx ou .xls)
        const excelFiles = files.filter(file => file.endsWith('.xlsx') || file.endsWith('.xls'));

        if (excelFiles.length > 0) {
            // Retorna o primeiro arquivo encontrado
            res.json({ fileName: `/ficheiro-excel/${excelFiles[0]}` });
        } else {
            res.status(404).json({ error: 'Nenhum arquivo Excel encontrado' });
        }
    });
});

const storage1 = multer.diskStorage({
    destination: (req, file, cb) => {
        // Caminho do diretório onde o arquivo será armazenado
        const uploadPath = path.join(__dirname, 'my-app/public/ficheiro-excel');
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Nome do arquivo será o nome original
        cb(null, file.originalname);
    }
});

const upload1 = multer({ storage: storage1 });

app.post('/api/upload-file', (req, res) => {
    const uploadPath = path.join(__dirname, 'my-app/public/ficheiro-excel');

    // Verifica se o diretório de upload existe
    fs.access(uploadPath, fs.constants.F_OK, (err) => {
        if (err) {
            console.error('Diretório de upload não encontrado:', uploadPath);
            return res.status(500).json({ error: 'Diretório de arquivos não encontrado.' });
        }

        // Se existir algum arquivo na pasta, removê-lo
        fs.readdir(uploadPath, (err, files) => {
            if (err) {
                console.error('Erro ao ler os arquivos da pasta:', err);
                return res.status(500).json({ error: 'Erro ao ler os arquivos.' });
            }

            // Se a pasta já contiver um arquivo, eliminá-lo
            if (files.length > 0) {

                const fileToDelete = path.join(uploadPath, files[0]);

                // Remover o arquivo antigo
                fs.unlink(fileToDelete, (err) => {
                    if (err) {
                        console.error('Erro ao excluir o arquivo anterior:', err);
                        return res.status(500).json({ error: 'Erro ao excluir o arquivo anterior.' });
                    }
                    console.log('Arquivo anterior removido:', files[0]);

                    // Agora, salvar o novo arquivo após a exclusão do antigo
                    upload1.single('file')(req, res, (uploadErr) => {
                        if (uploadErr) {
                            console.error('Erro ao carregar o novo arquivo:', uploadErr);
                            return res.status(500).json({ error: 'Erro ao salvar o novo arquivo.' });
                        }
                        res.status(200).json({ message: 'Arquivo carregado e substituído com sucesso!', fileName: req.file.originalname });
                    });
                });
            } else {
                // Se não houver arquivos antigos, simplesmente salva o novo
                upload1.single('file')(req, res, (uploadErr) => {
                    if (uploadErr) {
                        console.error('Erro ao carregar o novo arquivo:', uploadErr);
                        return res.status(500).json({ error: 'Erro ao salvar o novo arquivo.' });
                    }
                    res.status(200).json({ message: 'Arquivo carregado com sucesso!', fileName: req.file.originalname });
                });
            }
        });
    });
});

app.delete('/api/delete-survey/:id', (req, res) => {
    const surveyId = req.params.id;
    console.log('Entrevista ID:', surveyId);

    // Buscar a documentação da entrevista no banco de dados
    connection.query(
        'SELECT Documentacao FROM questionario WHERE entrevista_id = ?',
        [surveyId],
        (error, surveyData) => {
            if (error) {
                console.error('Erro ao buscar a documentação:', error);
                return res.status(500).json({ error: 'Erro ao buscar a documentação da entrevista.' });
            }

            if (surveyData.length === 0) {
                console.log('Entrevista não encontrada.');
                return res.status(404).json({ error: 'Entrevista não encontrada.' });
            }

            const documentacao = surveyData[0].Documentacao;
            console.log('Documentação:', documentacao);

            if (documentacao) {
                // Dividir os caminhos dos arquivos e remover espaços extras
                const filePaths = documentacao.split(',').map((file) => file.trim());

                console.log('Caminhos dos arquivos:', filePaths);

                // Excluir cada arquivo relacionado
                filePaths.forEach((relativePath) => {
                    const fullPath = path.resolve(relativePath); // Resolver o caminho completo
                    fs.unlink(fullPath, (err) => {
                        if (err) {
                            console.warn(`Erro ao excluir o arquivo: ${fullPath}`, err.message);
                        } else {
                            console.log(`Arquivo excluído: ${fullPath}`);
                        }
                    });
                });
            }

            // Excluir a entrevista do banco de dados
            connection.query(
                'DELETE FROM questionario WHERE entrevista_id = ?',
                [surveyId],
                (deleteError, deleteResult) => {
                    if (deleteError) {
                        console.error('Erro ao excluir a entrevista:', deleteError);
                        return res.status(500).json({ error: 'Erro ao excluir a entrevista.' });
                    }

                    if (deleteResult.affectedRows > 0) {
                        // Após exclusão, redirecionar ou carregar os dados atualizados
                        res.status(200).json({ message: 'Entrevista e arquivos associados excluídos com sucesso.' });

                        
                    } else {
                        res.status(404).json({ error: 'Entrevista não encontrada.' });
                    }
                }
            );
        }
    );
});


app.post('/api/reset-file', (req, res) => {
    const publicDir = path.join(__dirname, '../public');
    const targetDir = path.join(publicDir, 'ficheiro-excel');

   
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    fs.readdir(publicDir, (err, files) => {
        if (err) {
            console.error('Erro ao ler a pasta public:', err);
            return res.status(500).json({ error: 'Erro ao ler a pasta public.' });
        }

      
        const excelFiles = files.filter(file => file.endsWith('.xlsx') || file.endsWith('.xls'));

        if (excelFiles.length === 0) {
            return res.status(404).json({ error: 'Nenhum arquivo Excel encontrado na pasta public.' });
        }

        const firstExcelFile = excelFiles[0];
        const originalFilePath = path.join(publicDir, firstExcelFile);
        const duplicatedFilePath = path.join(targetDir, firstExcelFile);

        
        fs.readdir(targetDir, (err, targetFiles) => {
            if (err) {
                console.error('Erro ao ler a pasta ficheiro-excel:', err);
                return res.status(500).json({ error: 'Erro ao ler a pasta ficheiro-excel.' });
            }

           
            if (targetFiles.length > 0) {
                const fileToDelete = path.join(targetDir, targetFiles[0]);
                try {
                    fs.unlinkSync(fileToDelete);
                    console.log('Arquivo anterior excluído com sucesso:', targetFiles[0]);
                } catch (err) {
                    console.error('Erro ao excluir o arquivo existente:', err);
                    return res.status(500).json({ error: 'Erro ao excluir o arquivo existente.' });
                }
            }

            // Copia o ficheiro original para a pasta 'ficheiro-excel'
            fs.copyFile(originalFilePath, duplicatedFilePath, (err) => {
                if (err) {
                    console.error('Erro ao copiar o arquivo:', err);
                    return res.status(500).json({ error: 'Erro ao copiar o arquivo.' });
                }

                console.log('Arquivo duplicado com sucesso:', duplicatedFilePath);
                res.status(200).json({
                    message: `Arquivo resetado para o padrão com sucesso.`,
                    originalFile: firstExcelFile,
                });
            });
        });
    });
});

app.use('/ficheiro-excel', express.static(path.join(__dirname, 'my-app' ,'public', 'ficheiro-excel')));

app.use(express.static(path.join(__dirname, 'public')))

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
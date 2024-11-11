const path = require('path');
const fs = require('fs');

function generateSurveyDirectory(surveyData) {
    const baseDir = path.join(__dirname, 'uploads', surveyData.entrevistadorName, surveyData.entrevistadoName);

    // Criação do diretório base para o entrevistador e entrevistado
    fs.mkdirSync(baseDir, { recursive: true });

    // Para cada questão na pesquisa, crie uma subpasta e adicione os arquivos
    surveyData.surveyDetails.forEach((question) => {
        const questionDir = path.join(baseDir, `question_${question.Indice_Pergunta}`);
        fs.mkdirSync(questionDir, { recursive: true });

        // Adicionar os arquivos para essa questão
        if (question.Documentacao) {
            const filePaths = question.Documentacao.split(',');
            filePaths.forEach((filePath, index) => {
                const fileName = path.basename(filePath);
                fs.copyFileSync(filePath, path.join(questionDir, fileName)); // Copia os arquivos para a pasta
            });
        }
    });

    return baseDir; // Retorna o caminho do diretório gerado
}

module.exports = { generateSurveyDirectory };

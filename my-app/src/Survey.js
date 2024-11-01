
import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import Footer from './components/Footer';

import './'

const Survey = ({ userInfo }) => {
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(11);
    const [additionalInfo,setAdditionalInfo] = useState([])
    const [response, setResponse] = useState('');
    const [responses, setResponses] = useState([]);

            useEffect(() => { 
                fetch('/respostas_questionarios.xlsx')
                    .then(response => response.arrayBuffer())
                    .then(data => {
                        const workbook = XLSX.read(data, { type: 'array' });
                        const firstSheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[firstSheetName];
                        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                        const header = json[0];
                        const perguntas = json.slice(1).map(row => row[header.indexOf('Pergunta')]);
                        const otherColumns = json.slice(1).map(row => ({
                            Cliente: row[header.indexOf('Cliente')],
                            Data: '',
                            Funcao: row[header.indexOf('Função')],
                            Local: row[header.indexOf('Local')],
                            Area_Funcional: row[header.indexOf('Area Funcional')],
                            Normas_aplicaveis: row[header.indexOf('Normas_aplicaveis')],
                            Indice_Pergunta: row[header.indexOf('Indice Pergunta')],
                            âmbito: row[header.indexOf('âmbito')],
                            Comentarios: row[header.indexOf('Comentários')],
                            Documentacao: row[header.indexOf('Documentação')],
                            Entrevista: row[header.indexOf('Entrevista')],
                            
                            // Add other fields as needed
                        }));

                        setQuestions(perguntas);
                        setResponses(Array(perguntas.length).fill(""));
                        setAdditionalInfo(otherColumns);
                    })
                    .catch(error => console.error('Erro ao ler o arquivo Excel:', error));


                    const handleBeforeUnload = (event) => {
                        if (currentQuestionIndex < questions.length) {
                            const confirmationMessage = 'Você ainda não concluiu a pesquisa. Tem certeza de que deseja sair?';
                            event.returnValue = confirmationMessage; // Para navegadores que suportam
                            return confirmationMessage; // Para outros navegadores
                        }
                    };

                    window.addEventListener('beforeunload', handleBeforeUnload);

                    return () => {
                        window.removeEventListener('beforeunload', handleBeforeUnload);
                    };
            }, [currentQuestionIndex, questions.length]);
            
           
        

        
    

    const handleNextQuestion = () => {
        if (response.trim() === '') {
            alert('Por favor, forneça uma resposta antes de prosseguir.');
            return;
        }
        console.log(currentQuestionIndex)
        

        // Adiciona a resposta atual ao array de respostas
        setResponses((prevResponses) => [...prevResponses, response]);
        setResponse(''); // Limpa a resposta atual
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1); // Avança para a próxima pergunta
    };

    if (currentQuestionIndex >= questions.length) {
        return (
            <div>
                <h2>Obrigado por completar a pesquisa!</h2>
                <h3>Suas Respostas:</h3>
                <ul>
                    {responses.map((resp, index) => (
                        <li key={index}>{`${questions[index]}: ${resp}`}</li>
                    ))}
                </ul>
            </div>
        );
    }
    const currentAdditionalInfo = additionalInfo[currentQuestionIndex]
    return (
        <div>
            <div className="survey-container">
                <h2>{questions[currentQuestionIndex]}</h2>
                <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    placeholder="Sua resposta..."
                    rows="4"
                    required
                />
                <button onClick={handleNextQuestion}>{currentQuestionIndex < questions.length - 1 ? 'Próxima Pergunta' : 'Enviar Formulário'}</button>
                {currentAdditionalInfo && (
                    <div className="additional-info">
                        <h4>Informações Adicionais:</h4>
                        <p><strong>Normas Aplicáveis:</strong> {currentAdditionalInfo.Normas_aplicaveis}</p>
                        <p><strong>Índice da Pergunta:</strong> {currentAdditionalInfo.Indice_Pergunta}</p>
                        <p><strong>Âmbito:</strong> {currentAdditionalInfo.âmbito}</p>
                    </div>
                )}
            </div>
            
        </div>        

    );
};

export default Survey;

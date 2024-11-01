import React, { useEffect, useState } from 'react'; 
import * as XLSX from 'xlsx';




const Question = ({ text }) => (
  <div className="question">
      <p>{text}</p>
  </div>
);

const Chat = () => {
    const [questionsList, setQuestionsList] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [userResponse, setUserResponse] = useState('');
    const [additionalInfo, setAdditionalInfo] = useState([]);
    const [isInterviewer, setIsInterviewer] = useState(true);
    const [isAnswered, setIsAnswered] = useState(false);
    
    // Conectar ao servidor Socket.IO
    

    useEffect(() => {
        // Função para carregar perguntas do arquivo Excel
        fetch('/respostas_questionarios.xlsx')
            .then(response => response.arrayBuffer())
            .then(data => {
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                const header = json[0];
                const pergunta = json.slice(1).map(row => row[header.indexOf('Pergunta')]);
                const otherColumns = json.slice(1).map(row => ({
                    Cliente: row[header.indexOf('Cliente')],
                    Data: '',
                    Funcao: row[header.indexOf('Função')],
                    Local: row[header.indexOf('Local')],
                    Area_Funcional: row[header.indexOf('Area Funcional')],
                    Normas_aplicaveis: row[header.indexOf('Normas_aplicaveis')],
                    Indice_Pergunta: row[header.indexOf('Indice Pergunta')],
                    âmbito: row[header.indexOf('âmbito')],
                }));
                setQuestionsList(pergunta);
                setAnswers(Array(pergunta.length).fill(""));
                setAdditionalInfo(otherColumns);
            })
            .catch(error => console.error('Erro ao ler o arquivo Excel:', error));
            
        // Ouvindo eventos do servidor (opcional)
        

        
    }, []);

    const handleAnswerChange = (event) => {
        setUserResponse(event.target.value);
    };
    
    const handleAnswerSubmit = () => {
        if (userResponse.trim() === "") {
            alert("Por favor, forneça uma resposta antes de prosseguir.");
            return;
        }
        
        const newAnswers = [...answers];
        newAnswers[currentQuestionIndex] = userResponse;
        setAnswers(newAnswers);
        setIsAnswered(true);

        // Emitir resposta para o servidor

        setUserResponse(''); // Limpar a resposta do usuário
    };

    const handleNextQuestion = () => {
        if (isAnswered) {
            if (currentQuestionIndex < questionsList.length - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
                setIsAnswered(false);
            } else {
                alert("Respostas: " + JSON.stringify(answers, null, 2));
            }
        }
    };

    return (
        <div className="container">
            <h1>Sistema de Perguntas e Respostas</h1>
            <button onClick={() => setIsInterviewer(!isInterviewer)}>
                {isInterviewer ? 'Trocar para Entrevistado' : 'Trocar para Entrevistador'}
            </button>
    
            {questionsList.length > 0 && (
                <div className="qa-container">
                    <Question text={questionsList[currentQuestionIndex]} />
                    {isInterviewer ? (
                        <div>
                            <p>Você é o entrevistador. Clique em "Próxima Pergunta" quando estiver pronto.</p>
                            <button onClick={handleNextQuestion} disabled={!isAnswered}>
                                Próxima Pergunta
                            </button>
                        </div>
                    ) : (
                        <div>
                            <textarea
                                className="answer"
                                value={userResponse}
                                onChange={handleAnswerChange}
                                placeholder="Digite sua resposta..."
                            />
                            <button onClick={handleAnswerSubmit}>Responder</button>
                            <button onClick={handleNextQuestion} disabled={!isAnswered}>
                                Próxima Pergunta
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Chat;
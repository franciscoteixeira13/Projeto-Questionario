import React, { useEffect, useState } from 'react';
import { useAsyncError } from 'react-router-dom';
import io from 'socket.io-client';
import * as XLSX from 'xlsx';


const Question = ({ text }) => (
    <div className="question">
        <p>{text}</p>
    </div>
  );
  

const Chat1 = () => {
    const [questionsList, setQuestionsList] = useState('');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [otherColumns, setOtherColumns] = useState('');
    const [question, setQuestion] = useState('');
    const [answers, setAnswers] = useState('');
    const [comment, setComment] = useState('');
    const [messages, setMessages] = useState([]);
    const [isInterviewer, setIsInterviewer] = useState(true); // true para entrevistador

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
            setQuestionsList(perguntas);
        })
        .catch(error => console.error('Erro ao ler o arquivo Excel:', error));
        // Ouvir perguntas recebidas
        
    }, []);

    useEffect(() => {
        if (questionsList.length > 0) {
            setCurrentQuestionIndex(0); // Iniciar com a primeira pergunta
        }
    }, [questionsList]);


    const handleSendQuestion = () => {
        if(currentQuestionIndex < questionsList.length){
            const question = questionsList[currentQuestionIndex]
            let messageToDisplay;

            if(question){
                messageToDisplay = `${question}${comment ? `.`: ''} ${comment ? `Comentário ${comment}` : ''}`
            }else{
                messageToDisplay = comment
            }

            
            setMessages(prev => [...prev, { type: 'question', content: messageToDisplay}]);
            setCurrentQuestionIndex(currentQuestionIndex + 1); // Limpar a entrada
        }
    };

    const handleSendAnswer = () => {
        if (answers.trim()) {
            
            setMessages(prev => [...prev, { type: 'answer', content: answers }]);
            setAnswers(''); // Limpar a entrada
            
            }
        }


        return (
            <div>
                <h1>TESTE</h1>
                <h1>{isInterviewer ? 'Entrevistador' : 'Entrevistado'}</h1>
                <button onClick={() => setIsInterviewer(!isInterviewer)}>
                    {isInterviewer ? 'Trocar para Entrevistado' : 'Trocar para Entrevistador'}
                </button>
    
                <div>
                    <h2>Mensagens:</h2>
                    {messages.map((msg, index) => (
                        <div key={index} style={{ textAlign: msg.type === 'question' ? 'left' : 'right' }}>
                            <strong>{msg.type === 'question' ? 'Pergunta:' : 'Resposta:'}</strong> {msg.content}
                        </div>
                    ))}
                </div>
    
                {isInterviewer ? (
                    <div>
                        <input
                            type="text"
                            value={currentQuestionIndex < questionsList.length ? questionsList[currentQuestionIndex] : ''}
                            
                            readOnly
                            placeholder="Pergunta Excel"
                        />
                        <input
                        type="text"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)} // Atualizar o estado do comentário
                        placeholder="Comentário adicional..."
                        />
                        
                        <button onClick={handleSendQuestion} disabled={currentQuestionIndex >= questionsList.length || !comment}>Enviar Pergunta</button>
                    </div>
                ) : (
                    <div>
                        <input
                            type="text"
                            value={answers}
                            onChange={(e) => setAnswers(e.target.value)}
                            placeholder="Digite sua resposta..."
                        />
                        <button onClick={handleSendAnswer} >Enviar Resposta</button>
                    </div>
                )}
            </div>
        );

    };

   
    



export default Chat1;
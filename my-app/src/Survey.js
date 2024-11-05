import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Survey.css';

const Survey = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { selectedQuestions, userInfo } = location.state || { selectedQuestions: [], userInfo: {} };

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [responses, setResponses] = useState(Array(selectedQuestions.length).fill(''));
    const [comments, setComments] = useState(Array(selectedQuestions.length).fill(''));
    const [expandedInfo, setExpandedInfo] = useState({});

    const handleNextQuestion = () => {
        // Avança para a próxima pergunta ou, se for a última, submete o formulário
        if (currentQuestionIndex === selectedQuestions.length - 1) {
            handleSubmit();
        } else {
            setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
        }
    };

    const handleOptionSelect = (option) => {
        setResponses((prevResponses) => {
            const updatedResponses = [...prevResponses];
            updatedResponses[currentQuestionIndex] = option;
            return updatedResponses;
        });
    };

    const toggleInfo = (id) => {
        setExpandedInfo(prev => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const handleSubmit = () => {
        const submissionData = {
            user: userInfo,
            Data:  `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`; // Current date and time
            Normas_aplicaveis: selectedQuestions.map(q => q.normasAplicaveis).join(', '),
            Indice_Pergunta: selectedQuestions.map(q => q.id).join(', '),
            Ambito: selectedQuestions.map(q => q.âmbito).join(', '),
            Pergunta: selectedQuestions.map(q => q.pergunta).join(', '),
            Resposta: responses.join(', '),
            Comentarios: comments.join(', '),
        };
    
        console.log('Dados a serem enviados:', submissionData);
    
        fetch('http://localhost:4000/api/survey', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(submissionData),
        })
        .then((response) => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`Erro ${response.status}: ${text}`);
                });
            }
            return response.json();
        })
        .then((data) => {
            console.log('Dados enviados com sucesso:', data);
            // Pass relevant data to the next page
            navigate('/survey-summary', { state: { selectedQuestions, responses, comments } });
        })
        .catch((error) => {
            console.error('Erro ao enviar os dados:', error);
            alert(`Houve um erro ao enviar os dados: ${error.message}`);
        });
    };

    if (currentQuestionIndex >= selectedQuestions.length) {
        return (
            <div>
                <h2>Obrigado por completar a pesquisa!</h2>
                <h3>Suas Respostas:</h3>
                <ul>
                    {responses.map((resp, index) => (
                        <li key={index}>
                            {`${selectedQuestions[index].pergunta}: ${resp}`}
                            <br />
                            <strong>Comentário:</strong> {comments[index] || 'Nenhum comentário'}
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    return (
        <div>
            <h2>{selectedQuestions[currentQuestionIndex].pergunta}</h2>
            <div className="option-buttons">
                <button
                    className={`small-button ${responses[currentQuestionIndex] === 'Sim' ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect('Sim')}
                >
                    Sim
                </button>
                <button
                    className={`small-button ${responses[currentQuestionIndex] === 'Não' ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect('Não')}
                >
                    Não
                </button>
            </div>
            <textarea
                minLength='5'
                maxLength='40'
                className="response-input"
                value={responses[currentQuestionIndex]}
                onChange={(e) =>
                    setResponses((prevResponses) => {
                        const updatedResponses = [...prevResponses];
                        updatedResponses[currentQuestionIndex] = e.target.value;
                        return updatedResponses;
                    })
                }
                placeholder="A sua resposta..."
                rows="4"
                required
            />

            <div className='informacoes-adicionais'>
                <button className='informacoes-button' onClick={() => toggleInfo(selectedQuestions[currentQuestionIndex].id)} style={{ cursor: 'pointer' }}>
                    {expandedInfo[selectedQuestions[currentQuestionIndex].id] ? '▲' : '▼'} Informações Adicionais
                </button>
            </div>
            {expandedInfo[selectedQuestions[currentQuestionIndex].id] && (
                <ul className='question-details'>
                    <li><strong>Normas Aplicáveis:</strong> {selectedQuestions[currentQuestionIndex].normasAplicaveis || 'N/A'}</li>
                    <li><strong>Índice da Pergunta:</strong> {selectedQuestions[currentQuestionIndex].id}</li>
                    <li><strong>Âmbito:</strong> {selectedQuestions[currentQuestionIndex].âmbito || 'N/A'}</li>
                </ul>
            )}
            
            <h3>Comentários:</h3>
            <textarea
                minLength='5'
                maxLength='40'
                className="comment-input"
                value={comments[currentQuestionIndex]}
                onChange={(e) =>
                    setComments((prevComments) => {
                        const updatedComments = [...prevComments];
                        updatedComments[currentQuestionIndex] = e.target.value;
                        return updatedComments;
                    })
                }
                placeholder="O seu comentário..."
                rows="3"
            />
            <div className="button-container">
                {currentQuestionIndex > 0 && (
                    <button className='back-button' onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0}>
                        Voltar
                    </button>
                )}
                <button className='submit-button' onClick={handleNextQuestion}>
                    {currentQuestionIndex < selectedQuestions.length - 1 ? 'Próxima Pergunta' : 'Enviar Formulário'}
                </button>
            </div>
        </div>
    );
};

export default Survey;
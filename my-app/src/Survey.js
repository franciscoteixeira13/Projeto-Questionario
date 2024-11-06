import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Survey.css';

const Survey = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { selectedQuestions, userInfo } = location.state || { selectedQuestions: [], userInfo: {} };

    console.log('Perguntas recebidas:', selectedQuestions); // Log para depuração

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [responses, setResponses] = useState(Array(selectedQuestions.length).fill(''));
    const [comments, setComments] = useState(Array(selectedQuestions.length).fill(''));
    const [expandedInfo, setExpandedInfo] = useState({});

    const handleNextQuestion = () => {
        if (responses[currentQuestionIndex] === '') {
            alert('Por favor, forneça uma resposta antes de continuar.'); // Alerta para o usuário
            return; // Não avança se a resposta estiver vazia
        }

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
        const now = new Date();
        const submissionData = {
            user: userInfo,
            responses: responses.map((resp, index) => ({
                Data: `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
                Normas_aplicaveis: selectedQuestions[index].normasAplicaveis,
                Indice_Pergunta: selectedQuestions[index].id,
                Ambito: selectedQuestions[index].âmbito,
                Pergunta: selectedQuestions[index].pergunta,
                Resposta: responses[index],
                Comentarios: comments[index]
            }))
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
            navigate('/survey-summary', { state: { selectedQuestions, responses, comments } });
        })
        .catch((error) => {
            console.error('Erro ao enviar os dados:', error);
            alert(`Houve um erro ao enviar os dados: ${error.message}`);
        });
    };

    if (currentQuestionIndex >= selectedQuestions.length || currentQuestionIndex < 0) {
        return null; // Ou alguma mensagem de erro
    }

    const currentQuestionId = selectedQuestions[currentQuestionIndex].id;
    const totalQuestions = selectedQuestions.length; // Total de perguntas

    return (
        <div>
            <h2>Pergunta {currentQuestionIndex + 1} de {totalQuestions}</h2>
            <h3 className='pergunta-text'>{selectedQuestions[currentQuestionIndex].pergunta}</h3>
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
                <button className='informacoes-button' onClick={() => toggleInfo(currentQuestionId)} style={{ cursor: 'pointer' }}>
                    {expandedInfo[currentQuestionId] ? '▲' : '▼'} Informações Adicionais
                </button>
            </div>
            {expandedInfo[currentQuestionId] && (
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
                <button className='submit-button' type='submit' onClick={handleNextQuestion}>
                    {currentQuestionIndex < selectedQuestions.length - 1 ? 'Próxima Pergunta' : 'Enviar Formulário'}
                </button>
            </div>
        </div>
    );
};

export default Survey;
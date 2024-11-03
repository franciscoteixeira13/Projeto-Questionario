import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Survey.css'
const Survey = () => {
    const location = useLocation();
    const navigate = useNavigate()
    const { selectedQuestions } = location.state || { selectedQuestions: [] };

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [responses, setResponses] = useState(Array(selectedQuestions.length).fill(''));
    const [comments, setComments] = useState(Array(selectedQuestions.length).fill(''));

    const handleNextQuestion = () => {
        // Avança para a próxima pergunta ou, se for a última, redireciona para o resumo
        if (currentQuestionIndex === selectedQuestions.length - 1) {
            navigate('/survey-summary', { state: { selectedQuestions, responses, comments } });
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
                {currentQuestionIndex > 0 &&(
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
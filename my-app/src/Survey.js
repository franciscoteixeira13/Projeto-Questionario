import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const Survey = () => {
    const location = useLocation();
    const { selectedQuestions } = location.state || { selectedQuestions: [] };

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [responses, setResponses] = useState(Array(selectedQuestions.length).fill(''));

    const handleNextQuestion = () => {
        // Adiciona a resposta atual ao array de respostas
        setResponses((prevResponses) => {
            const updatedResponses = [...prevResponses];
            updatedResponses[currentQuestionIndex] = responses[currentQuestionIndex]; // Salva a resposta atual
            return updatedResponses;
        });

        // Avança para a próxima pergunta
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    };

    if (currentQuestionIndex >= selectedQuestions.length) {
        return (
            <div>
                <h2>Obrigado por completar a pesquisa!</h2>
                <h3>Suas Respostas:</h3>
                <ul>
                    {responses.map((resp, index) => (
                        <li key={index}>{`${selectedQuestions[index].pergunta}: ${resp}`}</li>
                    ))}
                </ul>
            </div>
        );
    }

    return (
        <div>
            <h2>{selectedQuestions[currentQuestionIndex].pergunta}</h2>
            <textarea
                value={responses[currentQuestionIndex]}
                onChange={(e) => setResponses((prevResponses) => {
                    const updatedResponses = [...prevResponses];
                    updatedResponses[currentQuestionIndex] = e.target.value; // Atualiza a resposta atual
                    return updatedResponses;
                })}
                placeholder="Sua resposta..."
                rows="4"
                required
            />
            <button onClick={handleNextQuestion}>
                {currentQuestionIndex < selectedQuestions.length - 1 ? 'Próxima Pergunta' : 'Enviar Formulário'}
            </button>
        </div>
    );
};

export default Survey;

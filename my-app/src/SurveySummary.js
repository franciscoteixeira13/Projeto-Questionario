import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './SurveySummary.css';

const SurveySummary = () => {
    const location = useLocation();
    const { interviewId, selectedQuestions, responses, comments } = location.state || { 
        interviewId: 'N/A', 
        selectedQuestions: [], 
        responses: [], 
        comments: [] 
    };
    const navigate = useNavigate();

    return (
        <div className="survey-summary">
           
            <h2 className="interview-id">ID da Entrevista: {interviewId}</h2>

            <h2 className='agradecimento'>Obrigado por completar o questionário!</h2>
            <h3>As suas Respostas:</h3>
            <ul>
                {selectedQuestions.map((question, index) => (
                    <li className='pergunta-revisao' key={index}>
                        <strong className='pergunta'>{question.pergunta}:</strong>
                        
                        <div className='resposta'>
                            <span className="ponto">•</span> Resposta: {responses[index]}
                        </div>
                        
                        <span className="ponto-comment">•</span> <strong>Comentário: </strong> 
                        {comments[index] || ' Nenhum comentário'}
                    </li>
                ))}
            </ul>
            <button onClick={() => navigate('/')}>Voltar ao Início</button>
        </div>
    );
};

export default SurveySummary;

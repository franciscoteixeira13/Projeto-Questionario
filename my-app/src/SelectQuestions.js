import React, { useEffect, useState } from 'react';
import './SelectQuestions.css';
import * as XLSX from 'xlsx';
import { useNavigate, useLocation } from 'react-router-dom';

const SelectQuestions = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { userInfo } = location.state || {}; // Recebe userInfo do estado

    const [questionsData, setQuestionsData] = useState([]);
    const [selectedQuestions, setSelectedQuestions] = useState({});
    const [expandedScopes, setExpandedScopes] = useState({});

    useEffect(() => {
        fetch('/respostas_questionarios.xlsx')
            .then(response => response.arrayBuffer())
            .then(data => {
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                const header = json[0];
                const perguntas = json.slice(1).map(row => ({
                    pergunta: row[header.indexOf('Pergunta')],
                    âmbito: row[header.indexOf('âmbito')],
                    id: row[header.indexOf('Indice Pergunta')],
                    normasAplicaveis: row[header.indexOf('Normas_aplicavel')]
                }));

                // Filtra as perguntas não vazias e inicializa selectedQuestions
                const initialSelected = perguntas.reduce((acc, question) => {
                    if (question.pergunta && question.pergunta.trim() !== '') {
                        acc[question.id] = false; // Marca como selecionada se não estiver vazia
                    }
                    return acc;
                }, {});

                // Filtra para incluir apenas perguntas não vazias no questionsData
                const filteredQuestions = perguntas.filter(q => q.pergunta && q.pergunta.trim() !== '');

                setQuestionsData(filteredQuestions); // Atualiza o estado com perguntas filtradas
                setSelectedQuestions(initialSelected); // Atualiza o estado com perguntas selecionadas
            })
            .catch(error => console.error('Erro ao ler o arquivo Excel:', error));
    }, []);

    const handleCheckboxChange = (id) => {
        setSelectedQuestions(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const toggleScope = (scope) => {
        setExpandedScopes(prev => ({
            ...prev,
            [scope]: !prev[scope]
        }));
    };

    const handleScopeCheckboxChange = (scope) => {
        const questionsInScope = questionsData.filter(q => q.âmbito === scope);
        const areAllSelected = questionsInScope.every(q => selectedQuestions[q.id]);

        const newSelectedQuestions = { ...selectedQuestions };
        questionsInScope.forEach(q => {
            newSelectedQuestions[q.id] = !areAllSelected; // Se todos estão selecionados, desmarque-os, caso contrário, marque-os
        });

        setSelectedQuestions(newSelectedQuestions);
    };

    const startSurvey = () => {
        const selectedQuestionsList = questionsData.filter(q => selectedQuestions[q.id]);
        navigate('/survey', { state: { selectedQuestions: selectedQuestionsList, userInfo } }); // Passa userInfo
    };

    const groupedQuestions = questionsData.reduce((groups, question) => {
        if (!question.âmbito) return groups;
        if (!groups[question.âmbito]) {
            groups[question.âmbito] = [];
        }
        groups[question.âmbito].push(question);
        return groups;
    }, {});

    const filteredGroupedQuestions = Object.entries(groupedQuestions)
        .filter(([scope, questions]) => questions.length > 1)
        .reduce((acc, [scope, questions]) => {
            acc[scope] = questions;
            return acc;
        }, {});

    // Verifica se alguma pergunta foi selecionada
    const isAnyQuestionSelected = Object.values(selectedQuestions).some(isSelected => isSelected);
    
    return (
        <div>
            <h1 className="select-questions-container">Selecione as Perguntas a que vai Responder</h1>
            {Object.keys(filteredGroupedQuestions).length === 0 ? (
                <p>Não há perguntas disponíveis.</p>
            ) : (
                Object.keys(filteredGroupedQuestions).map(scope => {
                    const questionsInScope = filteredGroupedQuestions[scope];

                    return (
                        <div className="scope-container" key={scope}>
                            <h2 className="scope-title" onClick={() => toggleScope(scope)} style={{ cursor: 'pointer' }}>
                                <input 
                                    type="checkbox" 
                                    className='scope-checkbox' 
                                    checked={questionsInScope.every(q => selectedQuestions[q.id])}
                                    onChange={() => handleScopeCheckboxChange(scope)} 
                                />
                                {scope} {expandedScopes[scope] ? '▲' : '▼'}
                            </h2>
                            {expandedScopes[scope] && (
                                <div className='questions-list'>
                                    {questionsInScope.map((question) => (
                                        <div className='question-item' key={question.id}>
                                            <input
                                                type="checkbox"
                                                className='custom-checkbox'
                                                checked={!!selectedQuestions[question.id]}
                                                onChange={() => handleCheckboxChange(question.id)}
                                            />
                                            <label className='question label'>{question.pergunta}</label>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })
            )}
            <button 
                className="start-survey-button" 
                onClick={startSurvey} 
                disabled={!isAnyQuestionSelected} // Botão desabilitado caso nenhuma pergunta esteja selecionada
            >
                Iniciar Questionário
            </button>
        </div>
    );
};

export default SelectQuestions;
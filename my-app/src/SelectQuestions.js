import React, { useEffect, useState } from 'react';
import './SelectQuestions.css';
import * as XLSX from 'xlsx';
import { useNavigate, useLocation } from 'react-router-dom';

const SelectQuestions = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { InfoEntrevistador, InfoEntrevistado } = location.state || {};
    
    const [questionsData, setQuestionsData] = useState([]);
    const [selectedQuestions, setSelectedQuestions] = useState({});
    const [expandedScopes, setExpandedScopes] = useState({});
    const [selectAll, setSelectAll] = useState(false); // Estado para selecionar/deselecionar todas as perguntas

    useEffect(() => {
        if (
            !InfoEntrevistador || 
            !InfoEntrevistado || 
            Object.values(InfoEntrevistador).some(value => !value || value.trim() === '') || 
            Object.values(InfoEntrevistado).some(value => !value || value.trim() === '')
        ) {
            alert("Por favor, preencha todas as informações antes de prosseguir.");
            navigate('/');
        }
    }, [InfoEntrevistador, InfoEntrevistado, navigate]);


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
                    normasAplicaveis: row[header.indexOf('Normas_aplicavel')],
                }));

                const initialSelected = perguntas.reduce((acc, question) => {
                    if (question.pergunta && question.pergunta.trim() !== '') {
                        acc[question.id] = false;
                    }
                    return acc;
                }, {});

                const filteredQuestions = perguntas.filter(q => q.pergunta && q.pergunta.trim() !== '');

                setQuestionsData(filteredQuestions);
                setSelectedQuestions(initialSelected);
            })
            .catch(error => console.error('Erro ao ler o arquivo Excel:', error));
    }, []);

    // Manipula o estado ao marcar/desmarcar uma pergunta
    const handleCheckboxChange = (id) => {
        setSelectedQuestions(prev => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    // Alterna a visibilidade de um âmbito
    const toggleScope = (scope) => {
        setExpandedScopes(prev => ({
            ...prev,
            [scope]: !prev[scope],
        }));
    };

    // Seleciona/deseleciona todas as perguntas
    const handleSelectAll = () => {
        const newSelectedQuestions = {};
        questionsData.forEach(q => {
            newSelectedQuestions[q.id] = !selectAll;
        });
        setSelectedQuestions(newSelectedQuestions);
        setSelectAll(prev => !prev);
    };

    // Seleciona/deseleciona todas as perguntas de um âmbito
    const handleScopeCheckboxChange = (scope) => {
        const questionsInScope = questionsData.filter(q => q.âmbito === scope);
        const areAllSelected = questionsInScope.every(q => selectedQuestions[q.id]);

        const newSelectedQuestions = { ...selectedQuestions };
        questionsInScope.forEach(q => {
            newSelectedQuestions[q.id] = !areAllSelected;
        });

        setSelectedQuestions(newSelectedQuestions);
    };

    // Navega para a próxima página com as perguntas selecionadas e os dados do entrevistador/entrevistado
    const startSurvey = () => {
        const selectedQuestionsList = questionsData.filter(q => selectedQuestions[q.id]);
        navigate('/survey', {
            state: {
                selectedQuestions: selectedQuestionsList,
                InfoEntrevistador,
                InfoEntrevistado,
            },
        });
    };

    // Agrupa perguntas por âmbito
    const groupedQuestions = questionsData.reduce((groups, question) => {
        if (!question.âmbito) return groups;
        if (!groups[question.âmbito]) {
            groups[question.âmbito] = [];
        }
        groups[question.âmbito].push(question);
        return groups;
    }, {});

    // Filtra os âmbitos com mais de uma pergunta
    const filteredGroupedQuestions = Object.entries(groupedQuestions)
        .filter(([scope, questions]) => questions.length > 1)
        .reduce((acc, [scope, questions]) => {
            acc[scope] = questions;
            return acc;
        }, {});

    // Conta o número de perguntas selecionadas por âmbito
    const selectedCountByScope = Object.keys(filteredGroupedQuestions).reduce((acc, scope) => {
        acc[scope] = filteredGroupedQuestions[scope].filter(q => selectedQuestions[q.id]).length;
        return acc;
    }, {});

    const isAnyQuestionSelected = Object.values(selectedQuestions).some(isSelected => isSelected);

    // Contagem geral: selecionadas / total
    const totalQuestions = questionsData.length;
    const totalSelected = Object.values(selectedQuestions).filter(isSelected => isSelected).length;

    return (
        <div>
            <h1 className="select-questions-container">Selecione as Perguntas a que vai Responder</h1>
            <p className="selected-count">Questões Selecionadas: {totalSelected}/{totalQuestions}</p>
            
            {/* Botão para selecionar/deselecionar todas as perguntas */}
            <div style={{ marginBottom: '10px' }}>
                <button onClick={handleSelectAll}>
                    {selectAll ? 'Desmarcar todas' : 'Selecionar todas'}
                </button>
            </div>

            {Object.keys(filteredGroupedQuestions).length === 0 ? (
                <p>Não há perguntas disponíveis.</p>
            ) : (
                Object.keys(filteredGroupedQuestions).map(scope => {
                    const questionsInScope = filteredGroupedQuestions[scope];
                    const totalQuestionsInScope = questionsInScope.length;
                    const selectedQuestionsInScope = selectedCountByScope[scope];

                    return (
                        <div className="scope-container" key={scope}>
                            <h2 className="scope-title" onClick={() => toggleScope(scope)} style={{ cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    className="scope-checkbox"
                                    checked={questionsInScope.every(q => selectedQuestions[q.id])}
                                    onChange={() => handleScopeCheckboxChange(scope)}
                                />
                                {scope} ({selectedQuestionsInScope}/{totalQuestionsInScope})
                                {expandedScopes[scope] ? ' ▲' : ' ▼'}
                            </h2>
                            {expandedScopes[scope] && (
                                <div className="questions-list">
                                    {questionsInScope.map((question) => (
                                        <div className="question-item" key={question.id}>
                                            <input
                                                type="checkbox"
                                                className="custom-checkbox"
                                                checked={!!selectedQuestions[question.id]}
                                                onChange={() => handleCheckboxChange(question.id)}
                                            />
                                            <label className="question-label">{question.pergunta}</label>
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
                disabled={!isAnyQuestionSelected}
            >
                Iniciar Questionário
            </button>
        </div>
    );
};

export default SelectQuestions;

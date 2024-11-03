import React, { useEffect, useState } from 'react';
import './SelectQuestions.css'
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';

const SelectQuestions = () => {
    const [questionsData, setQuestionsData] = useState([]);
    const [selectedQuestions, setSelectedQuestions] = useState({});
    const [expandedScopes, setExpandedScopes] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        // Carrega as perguntas do arquivo Excel
        fetch('/respostas_questionarios.xlsx')
            .then(response => response.arrayBuffer())
            .then(data => {
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                const header = json[0]; // Primeiro elemento como cabeçalho
                const perguntas = json.slice(1).map(row => ({
                    pergunta: row[header.indexOf('Pergunta')],
                    âmbito: row[header.indexOf('âmbito')],
                    id: row[header.indexOf('Indice Pergunta')],
                }));

                setQuestionsData(perguntas);

                // Inicializa todas as perguntas como selecionadas
                const initialSelected = perguntas.reduce((acc, question) => {
                    acc[question.id] = false; // Marca a pergunta como selecionada
                    return acc;
                }, {});
                setSelectedQuestions(initialSelected);
            })
            .catch(error => console.error('Erro ao ler o arquivo Excel:', error));
    }, []);

    const handleCheckboxChange = (id) => {
        setSelectedQuestions(prev => ({
            ...prev,
            [id]: !prev[id] // Inverte o estado da checkbox
        }));
    };

    const toggleScope = (scope) => {
        setExpandedScopes(prev => ({
            ...prev,
            [scope]: !prev[scope]
        }));
    };

    const startSurvey = () => {
        // Filtra apenas as perguntas selecionadas
        const selectedQuestionsList = questionsData.filter(q => selectedQuestions[q.id]);
        navigate('/survey', { state: { selectedQuestions: selectedQuestionsList } });
    };

    // Agrupa as perguntas por âmbito
    const groupedQuestions = questionsData.reduce((groups, question) => {
        if (!question.âmbito) return groups; // Ignora perguntas sem âmbito
        if (!groups[question.âmbito]) {
            groups[question.âmbito] = [];
        }
        groups[question.âmbito].push(question);
        return groups;
    }, {});

    // Filtra grupos para remover âmbitos sem perguntas
    const filteredGroupedQuestions = Object.entries(groupedQuestions)
        .filter(([scope, questions]) => questions.length > 1) // Remove âmbitos sem perguntas
        .reduce((acc, [scope, questions]) => {
            acc[scope] = questions;
            return acc;
        }, {});

    return (
        <div>
            <h1 className="select-questions-container">Selecione as Perguntas para Responder</h1>
            {Object.keys(filteredGroupedQuestions).length === 0 ? (
                <p>Não há perguntas disponíveis.</p>
            ) : (
                Object.keys(filteredGroupedQuestions).map(scope => {
                    const questionsInScope = filteredGroupedQuestions[scope];

                    return (
                        <div className="scope-container" key={scope}>
                            <h2 className="scope-title" onClick={() => toggleScope(scope)} style={{ cursor: 'pointer' }}>
                                {scope} {expandedScopes[scope] ? '▲' : '▼'}
                            </h2>
                            {expandedScopes[scope] && (
                                <div className='questions-list'>
                                    {questionsInScope.map((question) => (
                                        <div className='question-item' key={question.id}>
                                            <input
                                                type="checkbox"
                                                className='question-checkbox'
                                                checked={!!selectedQuestions[question.id]} // Verifica se a pergunta está selecionada
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
            <button className="start-survey-button"  onClick={startSurvey}>Iniciar Questionário</button>
        </div>
    );
};

export default SelectQuestions;
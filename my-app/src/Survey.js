import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Survey.css';

const Survey = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { selectedQuestions, userInfo, interviewerInfo } = location.state || { selectedQuestions: [], userInfo: {}, interviewerInfo: {} };

    console.log('Perguntas recebidas:', selectedQuestions);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [responses, setResponses] = useState(Array(selectedQuestions.length).fill(''));
    const [comments, setComments] = useState(Array(selectedQuestions.length).fill(''));
    const [files, setFiles] = useState({}); // Mapeamento: Pergunta -> Arquivos

    const handleNextQuestion = () => {
        if (responses[currentQuestionIndex] === '') {
            alert('Por favor, forneça uma resposta antes de continuar.');
            return;
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

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles((prevFiles) => ({
            ...prevFiles,
            [currentQuestionIndex]: selectedFiles, // Associa os arquivos à pergunta atual
        }));
    };

    const handleRemoveFile = (fileName) => {
        setFiles((prevFiles) => {
            const updatedFiles = { ...prevFiles };
            updatedFiles[currentQuestionIndex] = updatedFiles[currentQuestionIndex]?.filter(
                (file) => file.name !== fileName
            );
            return updatedFiles;
        });
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
                Comentarios: comments[index],
            })),
            files: files, // Arquivos agrupados por pergunta
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
                    return response.text().then((text) => {
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
        return null;
    }

    const currentQuestionId = selectedQuestions[currentQuestionIndex].id;
    const totalQuestions = selectedQuestions.length;

    return (
        <div>
            <h2>Pergunta {currentQuestionIndex + 1} de {totalQuestions}</h2>
            <h3 className="pergunta-text">{selectedQuestions[currentQuestionIndex].pergunta}</h3>

            <div className="additional-info">
                <h4>Informações Adicionais:</h4>
                <ul>
                    <li><strong>Normas Aplicáveis:</strong> {selectedQuestions[currentQuestionIndex].normasAplicaveis || 'N/A'}</li>
                    <li><strong>Índice da Pergunta:</strong> {selectedQuestions[currentQuestionIndex].id}</li>
                    <li><strong>Âmbito:</strong> {selectedQuestions[currentQuestionIndex].âmbito || 'N/A'}</li>
                </ul>
            </div>

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
                minLength="5"
                maxLength="500"
                className="response-input"
                value={responses[currentQuestionIndex]}
                onChange={(e) => {
                    const updatedResponses = [...responses];
                    updatedResponses[currentQuestionIndex] = e.target.value;
                    setResponses(updatedResponses);
                }}
                placeholder="A sua resposta..."
                rows="6"
                required
            />

            <h3>Comentários:</h3>
            <textarea
                minLength="5"
                maxLength="500"
                className="comment-input"
                value={comments[currentQuestionIndex]}
                onChange={(e) => {
                    const updatedComments = [...comments];
                    updatedComments[currentQuestionIndex] = e.target.value;
                    setComments(updatedComments);
                }}
                placeholder="O seu comentário..."
                rows="3"
            />

            <div className="file-upload">
                <label htmlFor="file-upload" className="file-upload-btn">
                    Carregar Arquivos
                </label>
                <input
                    type="file"
                    id="file-upload"
                    multiple
                    accept=".xlsx, .xls, .docx, .doc, .jpg, .jpeg, .png, .pdf"
                    onChange={handleFileChange}
                />
            </div>

            {files[currentQuestionIndex]?.length > 0 && (
                <div className="file-list">
                    <h4>Arquivos Adicionados:</h4>
                    <ul>
                        {files[currentQuestionIndex].map((file, index) => (
                            <li key={index}>
                                {file.name}
                                <button
                                    onClick={() => handleRemoveFile(file.name)}
                                    className="remove-file-btn"
                                >
                                    Remover
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="button-container">
                {currentQuestionIndex > 0 && (
                    <button
                        className="back-button"
                        onClick={handlePreviousQuestion}
                        disabled={currentQuestionIndex === 0}
                    >
                        Voltar
                    </button>
                )}
                <button
                    className="submit-button"
                    type="submit"
                    onClick={handleNextQuestion}
                >
                    {currentQuestionIndex < selectedQuestions.length - 1 ? 'Próxima Pergunta' : 'Enviar Formulário'}
                </button>
            </div>
        </div>
    );
};

export default Survey;

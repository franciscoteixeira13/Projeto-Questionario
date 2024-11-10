import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Survey.css';

const Survey = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { selectedQuestions, InfoEntrevistador, InfoEntrevistado } = location.state || { selectedQuestions: [], InfoEntrevistador: {}, InfoEntrevistado: {} };

    console.log('Perguntas recebidas:', selectedQuestions);
    console.log(InfoEntrevistado, InfoEntrevistado)
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [responses, setResponses] = useState(Array(selectedQuestions.length).fill(''));
    const [comments, setComments] = useState(Array(selectedQuestions.length).fill(''));
    const [files, setFiles] = useState(Array(selectedQuestions.length).fill([]));

    // Função para adicionar arquivos
    const handleFileChange = (event) => {
        const newFiles = Array.from(event.target.files);
        setFiles((prevFiles) => {
            const updatedFiles = [...prevFiles];
            updatedFiles[currentQuestionIndex] = [...updatedFiles[currentQuestionIndex], ...newFiles];
            return updatedFiles;
        });
    };

    // Função para remover um arquivo específico
    const handleRemoveFile = (fileIndex) => {
        setFiles((prevFiles) => {
            const updatedFiles = [...prevFiles];
            updatedFiles[currentQuestionIndex] = updatedFiles[currentQuestionIndex].filter((_, index) => index !== fileIndex);
            return updatedFiles;
        });
    };

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

    const handleSubmit = () => {
        if (!InfoEntrevistador.nomeEntrevistador || !InfoEntrevistado.nomeEntrevistado) {
            alert('Por favor, preencha as informações do entrevistador e do entrevistado corretamente.');
            return;
        }
    
        const now = new Date();
        const formData = new FormData();
    
        // Adiciona campos do InfoEntrevistador diretamente ao FormData
        Object.entries(InfoEntrevistador).forEach(([key, value]) => {
            formData.append(`InfoEntrevistador[${key}]`, value);
        });
    
        // Adiciona campos do InfoEntrevistado diretamente ao FormData
        Object.entries(InfoEntrevistado).forEach(([key, value]) => {
            formData.append(`InfoEntrevistado[${key}]`, value);
        });
    
        // Adiciona as respostas e os arquivos ao FormData
        responses.forEach((response, index) => {
            const questionData = {
                Data: `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
                Normas_aplicaveis: selectedQuestions[index].normasAplicaveis,
                Indice_Pergunta: selectedQuestions[index].id,
                Ambito: selectedQuestions[index].âmbito,
                Pergunta: selectedQuestions[index].pergunta,
                Resposta: responses[index],
                Comentarios: comments[index],
            };
    
            // Adiciona dados da pergunta
            Object.entries(questionData).forEach(([key, value]) => {
                formData.append(`responses[${index}][${key}]`, value);
            });
    
            // Adiciona os arquivos relacionados (se houver)
            if (files[index] && files[index].length > 0) {
                files[index].forEach((file) => {
                    // Envia o arquivo com o nome correto para cada pergunta (sem duplicar o índice)
                    formData.append(`files[${index}]`, file);
                });
            }
        });
    
        // Envia os dados para o servidor
        fetch('http://localhost:4000/api/survey', {
            method: 'POST',
            body: formData, // Não defina headers manualmente
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
            // Navega para a próxima página após o envio bem-sucedido
            navigate('/survey-summary', { state: { selectedQuestions, responses, comments, files } });
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
            <h3 className='pergunta-text'>{selectedQuestions[currentQuestionIndex].pergunta}</h3>

            <div className="question-details">
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

            {/* Botão de upload de arquivos */}
            <div className="file-upload">
                <button
                    className="select-file-button"
                    onClick={() => document.getElementById('file-input').click()}
                >
                    Escolher Arquivos
                </button>
                <input
                    type="file"
                    id="file-input"
                    multiple
                    onChange={handleFileChange}
                    style={{ display: 'none' }} // Esconde o input real
                />
                {files[currentQuestionIndex].length > 0 && (
                    <>
                        <h4>Arquivos Selecionados:</h4>
                        <ul>
                            {files[currentQuestionIndex].map((file, index) => (
                                <li key={index} className="file-item">
                                    {file.name}
                                    <button onClick={() => handleRemoveFile(index)} className="remove-file-button">Remover</button>
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </div>

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

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AllSurveys.css';

const AllSurveys = () => {
  const [surveys, setSurveys] = useState([]);
  const [expandedSurveyId, setExpandedSurveyId] = useState(null); // Controla qual título está expandido
  const [expandedQuestions, setExpandedQuestions] = useState({}); // Controla as perguntas expandidas por entrevista
  const [currentPage, setCurrentPage] = useState(1); // Página atual
  const [surveysPerPage] = useState(20); // Número de entrevistas por página

  // Carregar os dados da API
  useEffect(() => {
    axios
      .get('http://localhost:4000/api/surveys')
      .then((response) => setSurveys(response.data))
      .catch((error) => console.error('Erro ao obter as entrevistas:', error));
  }, []);

  // Alternar expansão de um título específico
  const toggleSurveyExpansion = (id) => {
    setExpandedSurveyId((prevId) => (prevId === id ? null : id)); // Se já estiver expandido, recolhe, senão expande
  };

  // Alternar expansão de uma pergunta específica dentro de uma entrevista
  const toggleQuestionExpansion = (surveyId, index) => {
    const questionKey = `${surveyId}-${index}`; // Gerar uma chave única para cada pergunta (combinando surveyId e index)
    setExpandedQuestions((prevExpandedQuestions) => ({
      ...prevExpandedQuestions,
      [questionKey]: prevExpandedQuestions[questionKey] === true ? false : true, // Expande ou recolhe
    }));
  };

  const downloadFile = (fileName) => {
    const fileUrl = `http://localhost:4000/uploads/${fileName}`;
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.click();
  };

  // Determina os índices para cortar as entrevistas para a página atual
  const indexOfLastSurvey = currentPage * surveysPerPage;
  const indexOfFirstSurvey = indexOfLastSurvey - surveysPerPage;
  const currentSurveys = surveys.slice(indexOfFirstSurvey, indexOfLastSurvey);

  // Funções de navegação de página
  const nextPage = () => {
    if (currentPage * surveysPerPage < surveys.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div>
      <h1>Entrevistas Realizadas</h1>

      {/* Exibir as entrevistas da página atual */}
      {currentSurveys.map((survey) => (
        <div key={survey.id_entrevista} className="survey">
          {/* Cabeçalho da entrevista com a data formatada */}
          <div
            className="survey-header"
            onClick={() => toggleSurveyExpansion(survey.entrevista_id)}
          >
            <h2>
              <strong>Entrevistador:</strong> {survey.entrevistadorName || 'Sem nome do entrevistador'} |
              <strong> Entrevistado:</strong> {survey.entrevistadoName || 'Sem nome do entrevistado'}
            </h2>

            {/* Exibir a data da entrevista logo abaixo */}
            {survey.entrevistaData && (
              <p style={{ fontStyle: 'italic', fontSize: '0.9em', marginTop: '5px' }}>
                <strong>Data da Entrevista:</strong> {survey.entrevistaData}
              </p>
            )}
          </div>

          {/* Exibir detalhes apenas para o título expandido */}
          {expandedSurveyId === survey.entrevista_id && (
            <>
              <div
                className="survey-details"
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '20px',
                  marginBottom: '10px',
                }}
              >
                {/* Detalhes do entrevistador */}
                <div style={{ flex: 1, padding: '10px', borderRight: '1px solid #ddd' }}>
                  <h3>Entrevistador</h3>
                  <ul>
                    <li><strong>Nome:</strong> {survey.entrevistadorName || 'Não disponível'}</li>
                    <li><strong>Cargo:</strong> {survey.entrevistadorJobTitle || 'Não disponível'}</li>
                    <li><strong>Localização:</strong> {survey.entrevistadorLocation || 'Não disponível'}</li>
                    <li><strong>Área Funcional:</strong> {survey.entrevistadorFunctional_area || 'Não disponível'}</li>
                  </ul>
                </div>

                {/* Detalhes do entrevistado */}
                <div style={{ flex: 1, padding: '10px' }}>
                  <h3>Entrevistado</h3>
                  <ul>
                    <li><strong>Nome:</strong> {survey.entrevistadoName || 'Não disponível'}</li>
                    <li><strong>Cargo:</strong> {survey.entrevistadoJobTitle || 'Não disponível'}</li>
                    <li><strong>Localização:</strong> {survey.entrevistadoLocation || 'Não disponível'}</li>
                    <li><strong>Área Funcional:</strong> {survey.entrevistadoFunctional_area || 'Não disponível'}</li>
                  </ul>
                </div>
              </div>

              <div className="questions-list" style={{ paddingLeft: '20px', marginTop: '10px' }}>
                {survey.surveyDetails.map((question, index) => {
                  const questionKey = `${survey.id_entrevista}-${index}`; // Gerar chave única para a pergunta
                  return (
                    <div key={index} className="question" style={{ marginBottom: '20px' }}>
                      {/* Linha de pergunta com a seta ao lado esquerdo */}
                      <div
                        style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                        onClick={() => toggleQuestionExpansion(survey.id_entrevista, index)}
                      >
                        <span
                          style={{
                            marginRight: '10px', // Espaçamento entre a seta e o texto
                            transform: expandedQuestions[questionKey] ? 'rotate(90deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s',
                          }}
                        >
                          ➤
                        </span>
                        <h3>{question.Pergunta}</h3>
                      </div>

                      {/* Mostrar detalhes da pergunta se estiver expandida */}
                      {expandedQuestions[questionKey] && (
                        <>
                          <p><strong>Resposta:</strong> {question.Resposta}</p>
                          <p><strong>Comentários:</strong> {question.Comentarios || 'Nenhum comentário'}</p>
                          <p><strong>Normas Aplicáveis:</strong> {question.Normas_aplicaveis}</p>
                          <p><strong>Índice da Pergunta:</strong> {question.Indice_Pergunta}</p>
                          <p><strong>Âmbito:</strong> {question.Ambito}</p>

                          {/* Mostrar documentos apenas se existirem */}
                          {question.Documentacao?.trim() && (
                            <div className="documentos">
                              <h4>Documentos:</h4>
                              <ul>
                                {question.Documentacao.split(',').map((fileName, idx) => (
                                  <li key={idx}>
                                    <a
                                      href="#"
                                      onClick={() => downloadFile(fileName.trim())}
                                      style={{ color: 'blue', textDecoration: 'underline' }}
                                    >
                                      {fileName.trim()}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      ))}

      {/* Botões de navegação */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <button
          onClick={prevPage}
          disabled={currentPage === 1}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            backgroundColor: '#f1f1f1',
            border: '1px solid #007bff',
            borderRadius: '5px',
          }}
        >
          Anterior
        </button>
        <button
          onClick={nextPage}
          disabled={currentPage * surveysPerPage >= surveys.length}
          style={{
            padding: '10px 20px',
            cursor: currentPage * surveysPerPage >= surveys.length ? 'not-allowed' : 'pointer',
            backgroundColor: '#f1f1f1',
            border: '1px solid #007bff',
            borderRadius: '5px',
          }}
        >
          Próxima
        </button>
      </div>
    </div>
  );
};

export default AllSurveys;

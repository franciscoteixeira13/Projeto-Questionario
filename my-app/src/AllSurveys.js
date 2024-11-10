import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AllSurveys.css';

const AllSurveys = () => {
  const [surveys, setSurveys] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchCriteria, setSearchCriteria] = useState('entrevistador');
  const [expandedSurveyId, setExpandedSurveyId] = useState(null);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [surveysPerPage] = useState(20);

  // Carregar os dados da API
  useEffect(() => {
    fetchSurveys(); // Carregar as entrevistas quando o componente for montado
  }, []);

  // Função para buscar as entrevistas
  const fetchSurveys = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/surveys');
      setSurveys(response.data);
    } catch (error) {
      console.error('Erro ao obter as entrevistas:', error);
    }
  };

  // Função para realizar a pesquisa em tempo real
  useEffect(() => {
    if (searchTerm === '') {
      fetchSurveys(); // Se o campo de pesquisa estiver vazio, carrega todas as entrevistas
    } else {
      const timeoutId = setTimeout(() => {
        searchSurveys(searchTerm, searchCriteria); // Realiza a pesquisa após um pequeno atraso
      }, 500); // Delay de 500ms para evitar chamadas em excesso

      return () => clearTimeout(timeoutId); // Limpar o timeout se o valor for alterado antes de terminar
    }
  }, [searchTerm, searchCriteria]); // Dependendo da alteração no input ou critério de pesquisa

  // Função para pesquisar no banco de dados
  const searchSurveys = async (term, criteria) => {
    try {
      const response = await axios.get('http://localhost:4000/api/search', {
        params: {
          searchTerm: term,
          searchCriteria: criteria,
        },
      });
      setSurveys(response.data); // Atualiza a lista com os resultados da pesquisa
      setCurrentPage(1); // Resetar a página para a primeira ao filtrar
    } catch (error) {
      console.error('Erro ao realizar a pesquisa:', error);
    }
  };

  // Função para baixar os arquivos
  const downloadFile = (fileName) => {
    const fileUrl = `http://localhost:4000/uploads/${fileName}`;
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.click();
  };

  // Alternar expansão de um título específico
  const toggleSurveyExpansion = (id) => {
    setExpandedSurveyId((prevId) => (prevId === id ? null : id));
  };

  // Alternar expansão de uma pergunta específica
  const toggleQuestionExpansion = (surveyId, index) => {
    const questionKey = `${surveyId}-${index}`;
    setExpandedQuestions((prevExpandedQuestions) => ({
      ...prevExpandedQuestions,
      [questionKey]: prevExpandedQuestions[questionKey] === true ? false : true,
    }));
  };

  // Função de navegação
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

  // Determina os índices para cortar as entrevistas para a página atual
  const indexOfLastSurvey = currentPage * surveysPerPage;
  const indexOfFirstSurvey = indexOfLastSurvey - surveysPerPage;
  const currentSurveys = surveys.slice(indexOfFirstSurvey, indexOfLastSurvey);

  return (
    <div>
      <h1>Entrevistas Realizadas</h1>

      {/* Barra de pesquisa */}
      <div className="search-bar" style={{ marginBottom: '20px' }}>
        <select
          value={searchCriteria}
          onChange={(e) => setSearchCriteria(e.target.value)}
          style={{ padding: '5px', marginRight: '10px' }}
        >
          <option value="entrevistador">Entrevistador</option>
          <option value="entrevistado">Entrevistado</option>
          <option value="entrevista_id">ID da Entrevista</option>
        </select>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Pesquisar..."
          style={{
            padding: '5px',
            width: '300px',
            marginRight: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
      </div>

      {/* Exibir as entrevistas da página atual */}
      {currentSurveys.map((survey) => (
        <div key={survey.id_entrevista} className="survey">
          {/* Cabeçalho da entrevista */}
          <div
            className="survey-header"
            onClick={() => toggleSurveyExpansion(survey.id_entrevista)}
          >
            <h2>
              <strong>Entrevistador:</strong> {survey.entrevistadorName || 'Sem nome do entrevistador'} |
              <strong> Entrevistado:</strong> {survey.entrevistadoName || 'Sem nome do entrevistado'}
            </h2>
            {survey.entrevistaData && (
              <p style={{ fontStyle: 'italic', fontSize: '0.9em', marginTop: '5px' }}>
                <strong>Data da Entrevista:</strong> {survey.entrevistaData}
              </p>
            )}
          </div>

          {/* Detalhes expandíveis */}
          {expandedSurveyId === survey.id_entrevista && (
            <div className="survey-details">
              <p>{survey.details}</p>
              {/* Exemplo de exibição de arquivos para download */}
              {survey.surveyDetails.map((question, index) => (
                <div key={index} className="documentos">
                  {question.Documentacao && question.Documentacao.trim() && (
                    <div>
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
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Navegação de páginas */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <button onClick={prevPage} disabled={currentPage === 1}>
          Anterior
        </button>
        <button
          onClick={nextPage}
          disabled={currentPage * surveysPerPage >= surveys.length}
        >
          Próxima
        </button>
      </div>
    </div>
  );
};

export default AllSurveys;

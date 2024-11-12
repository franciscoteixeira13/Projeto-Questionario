import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Importa o hook para navegação
import axios from 'axios';
import { jsPDF } from 'jspdf'; // Importando jsPDF para criar o PDF
import JSZip from 'jszip'; // Importando JSZip
import { FaDownload } from 'react-icons/fa'; // Importando o ícone de download do react-icons
import './AllSurveys.css';

const AllSurveys = () => {
  const navigate = useNavigate(); // Hook para redirecionamento
  const [surveys, setSurveys] = useState([]);
  const [expandedSurveyId, setExpandedSurveyId] = useState(null); // Controla qual título está expandido
  const [expandedQuestions, setExpandedQuestions] = useState({}); // Controla as perguntas expandidas por entrevista
  const [currentPage, setCurrentPage] = useState(1); // Página atual
  const [surveysPerPage] = useState(10); // Número de entrevistas por página

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

  // Função para gerar o PDF
 // Gera o PDF como array buffer
 const generatePDF = (survey) => {
  const doc = new jsPDF();
  doc.setFontSize(18);

  // Título com ID da Entrevista logo ao lado (sem espaçamento lateral)
  doc.text(`Informações da Entrevista:${survey.entrevista_id}`, 14, 20);
  doc.setFontSize(14);
  // Colocando o ID ao lado sem distância

  let yPosition = 40; // Ajustando a posição inicial para mais espaço no topo

  // Largura das colunas para o entrevistador e entrevistado
  const columnWidth = 85;
  const marginLeft = 14;  // Distância da esquerda para a coluna do entrevistador
  const marginRight = 105; // Distância da esquerda para a coluna do entrevistado

  // Adicionando as informações do Entrevistador à esquerda com espaçamento extra
  doc.setFontSize(14);
  doc.text('Entrevistador:', marginLeft, yPosition);
  yPosition += 10;
  doc.setFontSize(12);
  doc.text(`Nome: ${survey.entrevistadorName || 'Não disponível'}`, marginLeft, yPosition);
  yPosition += 6;
  doc.text(`Cargo: ${survey.entrevistadorJobTitle || 'Não disponível'}`, marginLeft, yPosition);
  yPosition += 6;
  doc.text(`Localização: ${survey.entrevistadorLocation || 'Não disponível'}`, marginLeft, yPosition);
  yPosition += 6;
  doc.text(`Área Funcional: ${survey.entrevistadorFunctional_area || 'Não disponível'}`, marginLeft, yPosition);
  yPosition += 10;

  // Mantendo a mesma altura para o Entrevistado, alinhado ao lado direito
  let yPositionEntrevistado = 40; // Iniciando a posição do entrevistado com o mesmo espaçamento

  doc.setFontSize(14);
  doc.text('Entrevistado:', marginRight, yPositionEntrevistado);
  yPositionEntrevistado += 10;
  doc.setFontSize(12);
  doc.text(`Nome: ${survey.entrevistadoName || 'Não disponível'}`, marginRight, yPositionEntrevistado);
  yPositionEntrevistado += 6;
  doc.text(`Cargo: ${survey.entrevistadoJobTitle || 'Não disponível'}`, marginRight, yPositionEntrevistado);
  yPositionEntrevistado += 6;
  doc.text(`Localização: ${survey.entrevistadoLocation || 'Não disponível'}`, marginRight, yPositionEntrevistado);
  yPositionEntrevistado += 6;
  doc.text(`Área Funcional: ${survey.entrevistadoFunctional_area || 'Não disponível'}`, marginRight, yPositionEntrevistado);
  yPositionEntrevistado += 10;

  // Desenhando uma linha vertical entre as colunas do entrevistador e entrevistado
  doc.setLineWidth(0.5);
  doc.line(marginRight - 10, 30, marginRight - 10, yPositionEntrevistado); // Linha vertical separando as duas colunas

  // Adicionando um espaçamento maior entre as listas do entrevistador/entrevistado e os detalhes da entrevista
  yPositionEntrevistado += 20; // Aqui aumentamos o espaçamento entre as seções

  // Iniciando a seção de detalhes da entrevista abaixo das listas do entrevistador e entrevistado
  doc.setFontSize(14);
  doc.text('Detalhes da Entrevista:', marginLeft, yPositionEntrevistado);
  yPositionEntrevistado += 10;

  // Iterando sobre as perguntas e respostas
  survey.surveyDetails.forEach((question, index) => {
    // Pergunta em negrito
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Pergunta ${index + 1}: ${question.Pergunta}`, marginLeft, yPositionEntrevistado, { maxWidth: 180 });
    yPositionEntrevistado += 10;

    // Removendo o espaçamento entre "Pergunta" e "Âmbito"
    doc.setFont('helvetica', 'normal');
    doc.text(`Resposta: ${question.Resposta || 'Não disponível'}`, marginLeft, yPositionEntrevistado, { maxWidth: 180 });
    yPositionEntrevistado += 6;  // Espaço reduzido entre Âmbito e Índice

    // Detalhes da Pergunta
    doc.text(`Comentários: ${question.Comentarios || 'Não disponível'}`, marginLeft, yPositionEntrevistado, { maxWidth: 180 });
    yPositionEntrevistado += 6;

    // Resposta
    doc.text(`Indice Pergunta: ${question.Indice_Pergunta || 'Não disponível'}`, marginLeft, yPositionEntrevistado, { maxWidth: 180 });
    yPositionEntrevistado += 6;

    // Comentários
    doc.text(`Âmbito: ${question.Ambito || 'Nenhum comentário'}`, marginLeft, yPositionEntrevistado, { maxWidth: 180 });
    yPositionEntrevistado += 10;

    doc.text(`Normas Aplicáveis: ${question.Normas_aplicaveis || 'Nenhum comentário'}`, marginLeft, yPositionEntrevistado, { maxWidth: 180 });
    yPositionEntrevistado += 10;


    // Verificar se a posição y está muito próxima do final da página
    if (yPositionEntrevistado > 270) { // 270 é a margem inferior do PDF
      doc.addPage(); // Adiciona uma nova página se a posição y estiver muito alta
      yPositionEntrevistado = 20; // Reinicia a posição y na nova página
    }
  });

  return doc.output('arraybuffer'); // Retorna o PDF como um array buffer
};


// Gera o ZIP e força o download
const generateZIP = async (surveyData) => {
  const zip = new JSZip();
  const pdfBuffer = generatePDF(surveyData);

  // Adiciona o PDF ao ZIP
  zip.file(`${surveyData.entrevistadorName} - ${surveyData.entrevistadoName}.pdf`, pdfBuffer);

  // Array para armazenar as promessas de download de arquivos
  const downloadPromises = [];

  // Cria subpastas para perguntas e adiciona os arquivos associados
  surveyData.surveyDetails.forEach((question, index) => {
    if (question.Documentacao?.trim()) {
      const questionFolder = zip.folder(`Pergunta ${index + 1}`);
      const files = question.Documentacao.split(',');

      // Para cada arquivo, adiciona uma promessa de download
      files.forEach((fileName) => {
        const fileUrl = `http://localhost:4000/uploads/${fileName.trim()}`;
        const downloadPromise = axios
          .get(fileUrl, { responseType: 'arraybuffer' }) // Baixa o arquivo como arraybuffer
          .then((response) => {
            questionFolder.file(fileName.trim(), response.data); // Adiciona o arquivo ao ZIP
          })
          .catch((error) => {
            console.error(`Erro ao baixar arquivo "${fileName}":`, error);
          });

        downloadPromises.push(downloadPromise); // Armazena a promessa
      });
    }
  });

  // Aguarda todos os downloads serem concluídos antes de gerar o ZIP
  await Promise.all(downloadPromises);

  // Gera o arquivo ZIP como um blob
  zip.generateAsync({ type: 'blob' }).then((content) => {
    // Força o download do arquivo ZIP
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `${surveyData.entrevistadorName} - ${surveyData.entrevistadoName}.zip`;
    link.click();
  });
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
      {/* Botão para redirecionar à página de UserInfo */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button className='back-home'
          onClick={() => navigate('/')}>
          Voltar para Página Inicial
        </button>
      </div>

      <h1>Entrevistas Realizadas</h1>

      {/* Exibir as entrevistas da página atual */}
      {currentSurveys.map((survey) => (
        
        <div key={survey.id_entrevista} className="survey">
          {/* Cabeçalho da entrevista com a data formatada */}
          <div
            className="survey-header"
            onClick={() => toggleSurveyExpansion(survey.entrevista_id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              position: 'relative'  // Definir o container como relativo para posicionar o botão
            }}
          >
            <h2>
              <strong>Entrevistador:</strong> {survey.entrevistadorName || 'Sem nome do entrevistador'} |
              <strong> Entrevistado:</strong> {survey.entrevistadoName || 'Sem nome do entrevistado'}
            </h2>

            {/* ID da Entrevista embaixo do título */}
            <p style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '5px', marginBottom: '5px' }}>
              ID da Entrevista: {survey.entrevista_id}
            </p>

            {/* Botão de Download com Ícone */}
            <button
              className="download-button"
              onClick={() => generateZIP(survey)}
              style={{
                position: 'absolute',   // Posicionar o botão no lado direito
                right: '0',             // Alinhar o botão à direita
                top: '50%',             // Alinhar o botão verticalmente
                transform: 'translateY(-50%)',  // Ajustar o alinhamento vertical do botão
                padding: '5px 10px',    // Estilizando o botão
                backgroundColor: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              <FaDownload size={16} />
            </button>
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
                    <div key={index} className="question-container">
                      {/* Linha de pergunta com a seta ao lado esquerdo */}
                      <div
                        style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                        onClick={() => toggleQuestionExpansion(survey.id_entrevista, index)}
                      >
                        <span
                          style={{
                            marginRight: '10px', // Espaçamento entre a seta e o texto
                            transform: expandedQuestions[questionKey] ? 'rotate(90deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s ease',
                          }}
                        >
                          ➔
                        </span>
                        <p><strong>Pergunta {index + 1}:</strong> {question.Pergunta}</p>
                      </div>

                      {/* Detalhes expandidos */}
                      {expandedQuestions[questionKey] && (
                        <>
                          <div className="question-details">
                            <p><strong>Resposta:</strong> {question.Resposta}</p>
                            <p><strong>Comentários:</strong> {question.Comentarios || 'Nenhum comentário'}</p>
                            <p><strong>Normas Aplicáveis:</strong> {question.Normas_aplicaveis}</p>
                            <p><strong>Índice da Pergunta:</strong> {question.Indice_Pergunta}</p>
                            <p><strong>Âmbito:</strong> {question.Ambito}</p>

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
                          </div>
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

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
  {/* Texto da página */}
  <div style={{ marginBottom: '10px' }}>
    Página {currentPage} de {Math.ceil(surveys.length / surveysPerPage)}
  </div>

  {/* Contêiner para os botões de navegação */}
  <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
    {/* Botão "Anterior" */}
    <button
    className='back-surveys'
      onClick={prevPage}
      disabled={currentPage === 1}
      style={{
        
        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
        
      }}
    >
      Anterior
    </button>

    {/* Botão "Próximo" */}
    <button className='next-surveys'
      onClick={nextPage}
      disabled={currentPage * surveysPerPage >= surveys.length}
      style={{cursor: currentPage * surveysPerPage >= surveys.length ? 'not-allowed' : 'pointer'}}
    >
      Próximo
    </button>
  </div>
</div>

    </div>
  );
};

export default AllSurveys;

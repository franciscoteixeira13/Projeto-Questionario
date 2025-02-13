import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Importa o hook para navegação
import axios from 'axios';
import { jsPDF } from 'jspdf'; // Importando jsPDF para criar o PDF
import JSZip from 'jszip'; // Importando JSZip
import { FaDownload } from 'react-icons/fa'; // Importando o ícone de download do react-icons
import './AllSurveys.css';
import logo from './images/img1.png'

const AllSurveys = () => {

  const navigate = useNavigate(); // Hook para redirecionamento
  const [surveys, setSurveys] = useState([]);
  const [expandedSurveyId, setExpandedSurveyId] = useState(null); // Controla qual título está expandido
  const [expandedQuestions, setExpandedQuestions] = useState({}); // Controla as perguntas expandidas por entrevista
  const [currentPage, setCurrentPage] = useState(1); // Página atual
  const [surveysPerPage] = useState(10); // Número de entrevistas por página
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSurveys, setFilteredSurveys] = useState(surveys);

  // Carregar os dados da API
  useEffect(() => {
    axios
      .get('http://localhost:4000/api/surveys')
      .then((response) => {
        setSurveys(response.data)
        setFilteredSurveys(response.data)
      })
      .catch((error) => console.error('Erro ao obter as entrevistas:', error));
  }, []);

  const filterSurveys = (term) => {
    const filtered = surveys.filter((survey) => {
      const { entrevistadoName, entrevistadorName, entrevista_id } = survey;
      return (
        (entrevistadoName && entrevistadoName.toLowerCase().includes(term.toLowerCase())) ||
        (entrevistadorName && entrevistadorName.toLowerCase().includes(term.toLowerCase())) ||
        (entrevista_id && entrevista_id.toString().includes(term))
      );
    });
    setFilteredSurveys(filtered);
  };

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

  const handleDeleteSurvey = (surveyId) => {
    // Exibe a mensagem de confirmação
    const isConfirmed = window.confirm('Deseja excluir esta entrevista?');
  
    if (isConfirmed) {
      // Se o usuário confirmar, chama a função para deletar a entrevista
      deleteSurvey(surveyId);
    }
  };


  const deleteSurvey = async (surveyId) => {
    try {
      const response = await fetch(`http://localhost:4000/api/delete-survey/${surveyId}`, {
        method: 'DELETE',
      });
  
      if (response.ok) {
        // Sucesso ao excluir, você pode atualizar a lista de entrevistas ou mostrar uma mensagem de sucesso
        alert('Entrevista excluída com sucesso!');
        window.location.reload()
      } else {
        alert('Erro ao excluir a entrevista.');
      }
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir a entrevista.');
    }
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

  // Carregar o logotipo
  const logoPath = logo;  
  
  // Obter o tamanho da página
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const marginBottom = 10; 
  
  // Definir o tamanho do logotipo
  const logoWidth = 43;  
  const logoHeight = 25; 
  
 
  const logoX = 10;
  const logoY = 10;  

  // Adicionar logotipo no topo, centralizado
  doc.addImage(logo, 'PNG', logoX, logoY, logoWidth, logoHeight);

  // Título centralizado no topo
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  const title = "Informações da Entrevista";
  const titleWidth = doc.getTextWidth(title);
  doc.text(title, (pageWidth - titleWidth) / 2, 40);  

  // ID da Entrevista abaixo do título
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  const idText = `ID da Entrevista: ${survey.entrevista_id || 'N/A'}`;
  const idWidth = doc.getTextWidth(idText);
  doc.text(idText, (pageWidth - idWidth) / 2, 50);  // Ajustado para considerar o espaço do título

  // Informações do Entrevistador e Entrevistado
  let yPosition = 70; 
  const marginLeft = 14;
  const marginRight = pageWidth / 2 + 10;

  // Entrevistador
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

  // Entrevistado
  let yPositionEntrevistado = 70;
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

  // Linha separadora
  doc.setLineWidth(0.5);
  doc.line(pageWidth / 2 - 10, 60, pageWidth / 2 - 10, Math.max(yPosition, yPositionEntrevistado));

  // Título "Detalhes da Entrevista"
  const detailsTitle = "Detalhes da Entrevista";
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  const detailsTitleWidth = doc.getTextWidth(detailsTitle);
  yPosition = Math.max(yPosition, yPositionEntrevistado) + 20;
  doc.text(detailsTitle, (pageWidth - detailsTitleWidth) / 2, yPosition);

  // Detalhes das perguntas
  yPosition += 20;
  survey.surveyDetails.forEach((question, index) => {
    
    const nextYPosition = yPosition + 40; 
    if (nextYPosition > pageHeight - marginBottom) {
      doc.addPage(); 
      yPosition = 20; 
    }

    // Título da pergunta
    const questionTitle = `Pergunta ${index + 1}`;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const questionTitleWidth = doc.getTextWidth(questionTitle);
    doc.text(questionTitle, (pageWidth - questionTitleWidth) / 2, yPosition);

    yPosition += 10;

    // Pergunta em negrito e com quebra de linha automática
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    const questionText = question.Pergunta || 'Pergunta não disponível';
    
    // Quebra automática de texto
    const questionLines = doc.splitTextToSize(questionText, 180); 
    doc.text(questionLines, marginLeft, yPosition);
    yPosition += 6 * questionLines.length; 

    // Resposta
    doc.setFont('helvetica', 'normal');
    const responseText = `Resposta: ${question.Resposta || 'Não disponível'}`;
    const responseLines = doc.splitTextToSize(responseText, 180);
    doc.text(responseLines, marginLeft, yPosition);
    yPosition += 6 * responseLines.length;

    // Comentários
    const commentsText = `Comentários: ${question.Comentarios || 'Não disponível'}`;
    const commentsLines = doc.splitTextToSize(commentsText, 180);
    doc.text(commentsLines, marginLeft, yPosition);
    yPosition += 6 * commentsLines.length;

    // Índice da Pergunta
    const indexText = `Índice Pergunta: ${question.Indice_Pergunta || 'Não disponível'}`;
    const indexLines = doc.splitTextToSize(indexText, 180);
    doc.text(indexLines, marginLeft, yPosition);
    yPosition += 6 * indexLines.length;

    // Âmbito
    const scopeText = `Âmbito: ${question.Ambito || 'Nenhum comentário'}`;
    const scopeLines = doc.splitTextToSize(scopeText, 180);
    doc.text(scopeLines, marginLeft, yPosition);
    yPosition += 6 * scopeLines.length;

    // Normas Aplicáveis
    const normsText = `Normas Aplicáveis: ${question.Normas_aplicaveis || 'Nenhum comentário'}`;
    const normsLines = doc.splitTextToSize(normsText, 180);
    doc.text(normsLines, marginLeft, yPosition);
    yPosition += 6 * normsLines.length;

    // Adicionar nova página se necessário
    const nextPositionCheck = yPosition + 10; 
    if (nextPositionCheck > pageHeight - marginBottom) {
      doc.addPage();
      yPosition = 20; 
    }
  });

  return doc.output('arraybuffer');
};



// Gera o ZIP e força o download
const generateZIP = async (surveyData) => {
  const zip = new JSZip();
  const pdfBuffer = generatePDF(surveyData);

  // Adiciona o PDF ao ZIP
  zip.file(`Questionário - ${surveyData.entrevistadorName} - ${surveyData.entrevistadoName} - ID ${surveyData.entrevista_id}.pdf`, pdfBuffer);

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
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = `Questionário - ${surveyData.entrevistadorName} - ${surveyData.entrevistadoName}.zip`;
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
      
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button className='back-home' onClick={() => navigate('/')}>
          Voltar para a Página Inicial
        </button>
      </div>
  
      <h1>Entrevistas Realizadas</h1>
  
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Pesquise por nome do entrevistado, entrevistador ou ID"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            filterSurveys(e.target.value);
          }}
          style={{
            padding: '10px',
            width: '70%',
            fontSize: '16px',
            borderRadius: '4px',
            border: '1px solid #ddd',
          }}
        />
      </div>
  
      {/* Exibir as entrevistas da página atual */}
      {filteredSurveys.map((survey) => (
        <div key={survey.id_entrevista} className="survey">
          {/* Cabeçalho da entrevista com a data formatada */}
          <div
            className="survey-header"
            onClick={() => toggleSurveyExpansion(survey.entrevista_id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              position: 'relative',  // Definir o container como relativo para posicionar o botão
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
                transform: 'translateY(-50%)', 
              }}
            >
              <FaDownload size={16} />
            </button>
  
            {/* Botão de Excluir entrevista */}
            <button
              className="delete-button"
              onClick={() => handleDeleteSurvey(survey.entrevista_id)} // Chama a função de exclusão
              style={{
                transform: 'translateY(-50%)', // Ajuste para alinhar com o botão de download
                marginLeft: '10px',
              }}
            >
              Excluir
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
        <div style={{ marginBottom: '10px' }}>
          Página {currentPage} de {Math.ceil(surveys.length / surveysPerPage)}
        </div>
  
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
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
  
          <button
            className='next-surveys'
            onClick={nextPage}
            disabled={currentPage * surveysPerPage >= surveys.length}
            style={{ cursor: currentPage * surveysPerPage >= surveys.length ? 'not-allowed' : 'pointer' }}
          >
            Próximo
          </button>
        </div>
      </div>
    </div>
  );
  
};

export default AllSurveys;

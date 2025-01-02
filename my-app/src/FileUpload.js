import React, { useState, useEffect } from 'react';
import './FileUpload.css'; // Adicione o estilo de acordo

const FileUpload = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [currentFile, setCurrentFile] = useState(''); // Para armazenar o nome do arquivo atual na pasta

    // Função para obter o nome do arquivo atual na pasta 'ficheiro-excel'
    useEffect(() => {
        fetch('http://localhost:4000/api/excel-file') // Chama a API para obter o nome do arquivo atual
            .then((response) => response.json())
            .then((data) => {
                if (data.fileName) {
                    // Extraímos apenas o nome do arquivo, sem o caminho completo
                    const fileName = data.fileName.split('/').pop();
                    setCurrentFile(fileName); // Atualiza o nome do arquivo atual
                }
            })
            .catch((error) => console.error('Erro ao obter o arquivo atual:', error));
    }, []);

    // Função para selecionar o arquivo
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel')) {
            setSelectedFile(file);
            setFileName(file.name); // Exibe o nome do arquivo
        } else {
            alert('Por favor, selecione um arquivo Excel válido (.xlsx ou .xls)');
        }
    };

    // Função para fazer o upload do arquivo
    const handleFileUpload = () => {
        if (selectedFile) {
            const formData = new FormData();
            formData.append('file', selectedFile);

            fetch('http://localhost:4000/api/upload-file', {
                headers:{
                    'Content-Type ': 'application/json'
                },
                method: 'POST',
                body: formData,
            })
            .then((response) => response.json())
            .then((data) => {
                alert('Arquivo carregado com sucesso!');
                console.log(data);
            })
            .catch((error) => {
                console.error('Erro ao carregar o arquivo:', error);
                alert('Erro ao carregar o arquivo!');
            });
        } else {
            alert('Por favor, selecione um arquivo primeiro.');
        }
    };

    // Função para fazer o reset para o arquivo padrão
    const handleResetFile = () => {
        fetch('http://localhost:4000/api/reset-file', {
            method: 'POST',
        })
        .then((response) => response.json())
        .then((data) => {
            alert('Arquivo resetado com sucesso!');
            console.log(data);
        })
        .catch((error) => {
            console.error('Erro ao resetar o arquivo:', error);
            alert('Erro ao resetar o arquivo!');
        });
    };

    // Função para fazer o download do arquivo atual
    // Função para fazer o download do arquivo atual
const handleDownloadFile = () => {
    if (currentFile) {
        const fileUrl = `http://localhost:4000/ficheiro-excel/${currentFile}`;
        
        // Criação de um link de download
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = currentFile; // Definindo o nome do arquivo a ser baixado
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link); // Remove o link da página após o clique
    } else {
        alert('Arquivo não encontrado!');
    }
};

    return (
        <div className="file-upload-container">
        <h2>Carregar Ficheiro Excel</h2>
    
        {currentFile && (
            <div className="current-file-container">
                <p><strong>Arquivo a ser utilizado atualmente: </strong>
                    <span 
                        style={{ color: 'blue', cursor: 'pointer' }} 
                        onClick={handleDownloadFile}
                    >
                        {currentFile}
                    </span>
                </p>
            </div>
        )}
    
        <button
            className="select-file-button"
            onClick={() => document.getElementById('file-input').click()}
        >
            Escolher Arquivo
        </button>
        <input
            type="file"
            id="file-input"
            accept=""
            multiple
            onChange={handleFileChange}
            style={{ display: 'none' }} // Esconde o input real
        />
    
        {/* Nome do arquivo selecionado */}
        {fileName && <p><strong>Arquivo selecionado:</strong> {fileName}</p>}
    
        {/* Botão de "Inserir Ficheiro" só aparece se um arquivo for selecionado */}
        {selectedFile && (
            <button className="insert-button" onClick={handleFileUpload}>
                Inserir Ficheiro
            </button>
        )}
    
        <button
            className="reset-button"
            onClick={handleResetFile}
            style={{ color: 'white', marginTop: '10px' }}
        >
            Resetar Arquivo para Padrão
        </button>
    </div>

    );
};

export default FileUpload;

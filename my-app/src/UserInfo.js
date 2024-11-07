import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserInfo.css';

const UserInfo = ({ setUserInfo }) => {
    const [name, setName] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [location, setLocation] = useState('');
    const [functionalArea, setFunctionalArea] = useState('');

    // Dados do entrevistador
    const [interviewerName, setInterviewerName] = useState('');
    const [interviewerJobTitle, setInterviewerJobTitle] = useState('');
    const [interviewerLocation, setInterviewerLocation] = useState('');
    const [interviewerFunctionalArea, setInterviewerFunctionalArea] = useState('');

    // Estados de visibilidade
    const [isInterviewerVisible, setInterviewerVisible] = useState(true);
    const [isIntervieweeVisible, setIntervieweeVisible] = useState(false);

    const [formValid, setFormValid] = useState(false); // Estado para controlar a validação do formulário
    const navigate = useNavigate();

    // Função para validar os campos obrigatórios
    const validateForm = () => {
        const isValid = name.trim() !== '' && jobTitle.trim() !== '' && location.trim() !== '' && functionalArea.trim() !== '' &&
            interviewerName.trim() !== '' && interviewerJobTitle.trim() !== '' && interviewerLocation.trim() !== '' && interviewerFunctionalArea.trim() !== '';
        setFormValid(isValid); // Atualiza o estado de validação
    };

    // Função para alternar a visibilidade das seções
    const toggleVisibility = (section) => {
        if (section === 'interviewer') {
            setInterviewerVisible(!isInterviewerVisible);
        } else if (section === 'interviewee') {
            setIntervieweeVisible(!isIntervieweeVisible);
        }
    };

    // Efeito para validar os campos sempre que algo mudar
    useEffect(() => {
        validateForm();
    }, [name, jobTitle, location, functionalArea, interviewerName, interviewerJobTitle, interviewerLocation, interviewerFunctionalArea]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Cria os objetos userInfo e interviewerInfo com os dados do formulário
        let userInfo = { name, jobTitle, location, functionalArea };
        let interviewerInfo = { interviewerName, interviewerJobTitle, interviewerLocation, interviewerFunctionalArea };

        // Armazena as informações no estado
        setUserInfo({ userInfo, interviewerInfo });

        // Limpa os campos do formulário
        setName('');
        setJobTitle('');
        setLocation('');
        setFunctionalArea('');
        setInterviewerName('');
        setInterviewerJobTitle('');
        setInterviewerLocation('');
        setInterviewerFunctionalArea('');

        // Navega para a próxima página
        navigate('/select-questions', { state: { userInfo, interviewerInfo } });
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Dados do Entrevistador */}
            <div className="section-header" onClick={() => toggleVisibility('interviewer')}>
                <span className="toggle-icon">{isInterviewerVisible ? '▼' : '▲'}</span>
                <h3>Dados do Entrevistador</h3>
            </div>
            {isInterviewerVisible && (
                <div className="dados-entrevistador">
                    <label htmlFor="interviewerName">Nome do Entrevistador:</label>
                    <input
                        minLength='3'
                        maxLength='100'
                        type="text"
                        id="interviewerName"
                        value={interviewerName}
                        onChange={(e) => setInterviewerName(e.target.value)}
                        required
                    />
                </div>
            )}
            {isInterviewerVisible && (
                <div className="dados-entrevistador">
                    <label htmlFor="interviewerJobTitle">Cargo do Entrevistador:</label>
                    <input
                        minLength='3'
                        maxLength='40'
                        type="text"
                        id="interviewerJobTitle"
                        value={interviewerJobTitle}
                        onChange={(e) => setInterviewerJobTitle(e.target.value)}
                        required
                    />
                </div>
            )}
            {isInterviewerVisible && (
                <div className="dados-entrevistador">
                    <label htmlFor="interviewerLocation">Localização do Entrevistador:</label>
                    <input
                        minLength='3'
                        maxLength='40'
                        type="text"
                        id="interviewerLocation"
                        value={interviewerLocation}
                        onChange={(e) => setInterviewerLocation(e.target.value)}
                        required
                    />
                </div>
            )}
            {isInterviewerVisible && (
                <div className="dados-entrevistador">
                    <label htmlFor="interviewerFunctionalArea">Área Funcional do Entrevistador:</label>
                    <input
                        minLength='3'
                        maxLength='70'
                        type="text"
                        id="interviewerFunctionalArea"
                        value={interviewerFunctionalArea}
                        onChange={(e) => setInterviewerFunctionalArea(e.target.value)}
                        required
                    />
                </div>
            )}

            {/* Dados do Entrevistado */}
            <div className="section-header" onClick={() => toggleVisibility('interviewee')}>
                <span className="toggle-icon">{isIntervieweeVisible ? '▼' : '▲'}</span>
                <h3>Dados do Entrevistado</h3>
            </div>
            {isIntervieweeVisible && (
                <div className="dados-entrevistado">
                    <label htmlFor="name">Nome do Entrevistado:</label>
                    <input
                        minLength='3'
                        maxLength='100'
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
            )}
            {isIntervieweeVisible && (
                <div className="dados-entrevistado">
                    <label htmlFor="jobTitle">Função do Entrevistado:</label>
                    <input
                        minLength='5'
                        maxLength='40'
                        type="text"
                        id="jobTitle"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        required
                    />
                </div>
            )}
            {isIntervieweeVisible && (
                <div className="dados-entrevistado">
                    <label htmlFor="location">Localização do Entrevistado:</label>
                    <input
                        minLength='3'
                        maxLength='40'
                        type="text"
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                    />
                </div>
            )}
            {isIntervieweeVisible && (
                <div className="dados-entrevistado">
                    <label htmlFor="functionalArea">Área Funcional do Entrevistado:</label>
                    <input
                        minLength='3'
                        maxLength='70'
                        type="text"
                        id="functionalArea"
                        value={functionalArea}
                        onChange={(e) => setFunctionalArea(e.target.value)}
                        required
                    />
                </div>
            )}

            <div className='Lastbutton'>
                <button className='submit-button' disabled={!formValid}>Iniciar Questionário</button> {/* Botão desabilitado se o formulário não for válido */}
            </div>
        </form>
    );
};

export default UserInfo;
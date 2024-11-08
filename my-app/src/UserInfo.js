import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserInfo.css';

const UserInfo = ({ setUserInfo }) => {
    // Estados para os campos do entrevistado
    const [nomeEntrevistado, setNomeEntrevistado] = useState('');
    const [jobTitleEntrevistado, setJobTitleEntrevistado] = useState('');
    const [localizacaoEntrevistado, setLocalizacaoEntrevistado] = useState('');
    const [functionalAreaEntrevistado, setFunctionalAreaEntrevistado] = useState('');

    // Estados para os campos do entrevistador
    const [nomeEntrevistador, setNomeEntrevistador] = useState('');
    const [jobTitleEntrevistador, setJobTitleEntrevistador] = useState('');
    const [localizacaoEntrevistador, setLocalizacaoEntrevistador] = useState('');
    const [functionalAreaEntrevistador, setFunctionalAreaEntrevistador] = useState('');

    // Controle de visibilidade das seções
    const [isInterviewerVisible, setInterviewerVisible] = useState(true);
    const [isIntervieweeVisible, setIntervieweeVisible] = useState(false);

    const navigate = useNavigate();

    // Função para validar os campos obrigatórios
    const validateForm = () => {
        return (
            nomeEntrevistado.trim() !== '' &&
            jobTitleEntrevistado.trim() !== '' &&
            localizacaoEntrevistado.trim() !== '' &&
            functionalAreaEntrevistado.trim() !== '' &&
            nomeEntrevistador.trim() !== '' &&
            jobTitleEntrevistador.trim() !== '' &&
            localizacaoEntrevistador.trim() !== '' &&
            functionalAreaEntrevistador.trim() !== ''
        );
    };

    // Função para alternar a visibilidade das seções
    const toggleVisibility = (section) => {
        if (section === 'interviewer') {
            setInterviewerVisible(!isInterviewerVisible);
        } else if (section === 'interviewee') {
            setIntervieweeVisible(!isIntervieweeVisible);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Valida o formulário antes de prosseguir
        if (!validateForm()) {
            alert('Por favor, preencha todos os campos obrigatórios antes de continuar.');
            return;
        }

        // Cria os objetos com os dados do formulário
        const InfoEntrevistado = {
            nomeEntrevistado,
            jobTitleEntrevistado,
            localizacaoEntrevistado,
            functionalAreaEntrevistado,
        };

        const InfoEntrevistador = {
            nomeEntrevistador,
            jobTitleEntrevistador,
            localizacaoEntrevistador,
            functionalAreaEntrevistador,
        };

        // Armazena as informações no estado global
        setUserInfo({ InfoEntrevistado, InfoEntrevistador });

        // Limpa os campos do formulário
        setNomeEntrevistado('');
        setJobTitleEntrevistado('');
        setLocalizacaoEntrevistado('');
        setFunctionalAreaEntrevistado('');
        setNomeEntrevistador('');
        setJobTitleEntrevistador('');
        setLocalizacaoEntrevistador('');
        setFunctionalAreaEntrevistador('');

        // Navega para a próxima página
        navigate('/select-questions', {state: {InfoEntrevistador, InfoEntrevistado}});
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="section-header" onClick={() => toggleVisibility('interviewer')}>
                <span className="toggle-icon">{isInterviewerVisible ? '▼' : '▲'}</span>
                <h3>Dados do Entrevistador</h3>
            </div>
            {isInterviewerVisible && (
                <>
                    <div className="dados-entrevistador">
                        <label htmlFor="nomeEntrevistador">Nome do Entrevistador:</label>
                        <input
                            minLength="3"
                            maxLength="100"
                            type="text"
                            id="nomeEntrevistador"
                            value={nomeEntrevistador}
                            onChange={(e) => setNomeEntrevistador(e.target.value)}
                            required
                        />
                    </div>
                    <div className="dados-entrevistador">
                        <label htmlFor="jobTitleEntrevistador">Cargo do Entrevistador:</label>
                        <input
                            minLength="3"
                            maxLength="40"
                            type="text"
                            id="jobTitleEntrevistador"
                            value={jobTitleEntrevistador}
                            onChange={(e) => setJobTitleEntrevistador(e.target.value)}
                            required
                        />
                    </div>
                    <div className="dados-entrevistador">
                        <label htmlFor="localizacaoEntrevistador">Localização do Entrevistador:</label>
                        <input
                            minLength="3"
                            maxLength="40"
                            type="text"
                            id="localizacaoEntrevistador"
                            value={localizacaoEntrevistador}
                            onChange={(e) => setLocalizacaoEntrevistador(e.target.value)}
                            required
                        />
                    </div>
                    <div className="dados-entrevistador">
                        <label htmlFor="functionalAreaEntrevistador">Área Funcional do Entrevistador:</label>
                        <input
                            minLength="3"
                            maxLength="70"
                            type="text"
                            id="functionalAreaEntrevistador"
                            value={functionalAreaEntrevistador}
                            onChange={(e) => setFunctionalAreaEntrevistador(e.target.value)}
                            required
                        />
                    </div>
                </>
            )}

            <div className="section-header" onClick={() => toggleVisibility('interviewee')}>
                <span className="toggle-icon">{isIntervieweeVisible ? '▼' : '▲'}</span>
                <h3>Dados do Entrevistado</h3>
            </div>
            {isIntervieweeVisible && (
                <>
                    <div className="dados-entrevistado">
                        <label htmlFor="nomeEntrevistado">Nome do Entrevistado:</label>
                        <input
                            minLength="3"
                            maxLength="100"
                            type="text"
                            id="nomeEntrevistado"
                            value={nomeEntrevistado}
                            onChange={(e) => setNomeEntrevistado(e.target.value)}
                            required
                        />
                    </div>
                    <div className="dados-entrevistado">
                        <label htmlFor="jobTitleEntrevistado">Função do Entrevistado:</label>
                        <input
                            minLength="5"
                            maxLength="40"
                            type="text"
                            id="jobTitleEntrevistado"
                            value={jobTitleEntrevistado}
                            onChange={(e) => setJobTitleEntrevistado(e.target.value)}
                            required
                        />
                    </div>
                    <div className="dados-entrevistado">
                        <label htmlFor="localizacaoEntrevistado">Localização do Entrevistado:</label>
                        <input
                            minLength="3"
                            maxLength="40"
                            type="text"
                            id="localizacaoEntrevistado"
                            value={localizacaoEntrevistado}
                            onChange={(e) => setLocalizacaoEntrevistado(e.target.value)}
                            required
                        />
                    </div>
                    <div className="dados-entrevistado">
                        <label htmlFor="functionalAreaEntrevistado">Área Funcional do Entrevistado:</label>
                        <input
                            minLength="3"
                            maxLength="70"
                            type="text"
                            id="functionalAreaEntrevistado"
                            value={functionalAreaEntrevistado}
                            onChange={(e) => setFunctionalAreaEntrevistado(e.target.value)}
                            required
                        />
                    </div>
                </>
            )}

            <div className="Lastbutton">
                <button className="submit-button" type="submit">
                    Iniciar Questionário
                </button>
            </div>
        </form>
    );
};

export default UserInfo;

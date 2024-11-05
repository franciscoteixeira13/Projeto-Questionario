import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserInfo.css';

const UserInfo = ({ setUserInfo }) => {
    const [name, setName] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [location, setLocation] = useState('');
    const [functionalArea, setFunctionalArea] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Cria o objeto userInfo
        const userInfo = {
            name,
            jobTitle,
            location,
            functionalArea,
        };

        // Armazena as informações do usuário
        setUserInfo(userInfo);
        
         // Limpa os campos do formulário
         

        // Navega para o próximo componente
        navigate('/select-questions', { state: { userInfo } }); // Passa userInfo no estado
        
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="dados-entrevistado">
                <label htmlFor="name">Seu Nome:</label>
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
            <div className="dados-entrevistado">
                <label htmlFor="jobTitle">Sua Função na Empresa:</label>
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
            <div className="dados-entrevistado">
                <label htmlFor="location">Introduza a Localização da qual está a responder:</label>
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
            <div className="dados-entrevistado">
                <label htmlFor="functionalArea">Área Funcional(qualificação):</label>
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

            <div className='Lastbutton'>
                <button className='submit-button' type="submit">Iniciar Questionário</button>
            </div>
        </form>
    );
};

export default UserInfo;
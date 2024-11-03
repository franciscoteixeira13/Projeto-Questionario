import React, { useState } from 'react';
import './UserInfo.css'


const UserInfo = ({ setUserInfo }) => {
    const [name, setName] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [location, setLocation] = useState('');
    const [functionalArea, setFunctionalArea] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setUserInfo({
            name,
            jobTitle,
            location,
            functionalArea,
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="dados-entrevistado">
                <label htmlFor="name">Seu Nome:</label>
                <input 
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
                    type="text"
                    id="functionalArea"
                    value={functionalArea}
                    onChange={(e) => setFunctionalArea(e.target.value)}
                    required
                />
            </div>
            <button type="submit">Iniciar Questionário</button>
        </form>
    );
};

export default UserInfo;
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';  // Adicione o Link
import { useLocation } from 'react-router-dom';
import UserInfo from './UserInfo';
import Survey from './Survey';
import SelectQuestions from './SelectQuestions';
import SurveySummary from './SurveySummary';
import AllSurveys from './AllSurveys';  // Importe o componente AllSurveys
import ThemeProvider, { ThemeContext } from './ThemeContext';
import './styles.css';
import Footer from './components/Footer';

function App() {
    const [userInfo, setUserInfo] = useState(null);
    const [selectedQuestions, setSelectedQuestions] = useState([]);

    const Title = () => {
        const location = useLocation(); // Captura a localização atual
    
        // Função para determinar o título com base na rota atual
        const getTitle = () => {
            if (location.pathname === '/') {
                return 'Informações Pessoais';
            } else if (location.pathname === '/select-questions') {
                return 'Selecionar Questões';
            } else if (location.pathname === '/survey') {
                return 'Questionário - CCAM Leiria';
            } else if (location.pathname === '/survey-summary') {
                return 'Resumo do Seu Questionário';
            } else if (location.pathname === '/all-surveys') {
                return 'Todas as Entrevistas';
            } else {
                return ''; // Para rotas não definidas, retorne uma string vazia
            }
        };
    
        return <h1>{getTitle()}</h1>; // Renderiza o título
    };

    return (
        <ThemeProvider>
            <Router>
                <ThemeContext.Consumer>
                    {({ theme, toggleTheme }) => (
                        <div className={theme}>
                            <div className="container">
                                
                                <Title />
                                <Routes>
                                    <Route path="/" element={<UserInfo setUserInfo={setUserInfo} />} />
                                    <Route path="/select-questions" element={<SelectQuestions onStartSurvey={setSelectedQuestions} />} />
                                    <Route path="/survey" element={<Survey selectedQuestions={selectedQuestions} userInfo={userInfo} />} />
                                    <Route path="/survey-summary" element={<SurveySummary />} />
                                    <Route path="/all-surveys" element={<AllSurveys />} /> {/* Rota para AllSurveys */}
                                </Routes>
                            </div>
                            <Footer />
                        </div>
                    )}
                </ThemeContext.Consumer>
            </Router>
        </ThemeProvider>
    );
}

export default App;

import React, { useState, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ThemeProvider, { ThemeContext } from './ThemeContext'; // Correção na importação
import UserInfo from './UserInfo';
import Survey from './Survey';
import SelectQuestions from './SelectQuestions';
import './styles.css';
import Footer from './components/Footer';

function App() {
    const [userInfo, setUserInfo] = useState(null);
    const [selectedQuestions, setSelectedQuestions] = useState([]);

    return (
        <ThemeProvider>
            <Router>
                <ThemeContext.Consumer>
                    {({ theme, toggleTheme }) => (
                        <div className={theme}>
                            <button onClick={toggleTheme}>
                                Alternar para o modo {theme === 'light' ? 'escuro' : 'claro'}
                            </button>
                            <div className="container">
                                <h1>Questionário</h1>
                                <Routes>
                                    <Route path="/" element={userInfo ? <SelectQuestions onStartSurvey={setSelectedQuestions} /> : <UserInfo setUserInfo={setUserInfo} />} />
                                    <Route path="/select-questions" element={<SelectQuestions onStartSurvey={setSelectedQuestions} />} />
                                    <Route path="/survey" element={<Survey selectedQuestions={selectedQuestions} userInfo={userInfo} />} />
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
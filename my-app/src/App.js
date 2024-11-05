import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserInfo from './UserInfo';
import Survey from './Survey';
import SelectQuestions from './SelectQuestions';
import SurveySummary from './SurveySummary';
import ThemeProvider, { ThemeContext } from './ThemeContext';
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
                            
                            <div className="container">
                                <h1>Questionário</h1>
                                <Routes>
                                    <Route path="/" element={userInfo ? <SelectQuestions onStartSurvey={setSelectedQuestions} /> : <UserInfo setUserInfo={setUserInfo} />} />
                                    <Route path="/select-questions" element={<SelectQuestions onStartSurvey={setSelectedQuestions} />} />
                                    <Route path="/survey" element={<Survey selectedQuestions={selectedQuestions} userInfo={userInfo} />} />
                                    <Route path="/survey-summary" element={<SurveySummary />} />
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
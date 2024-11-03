import React, { useState,useContext } from 'react';
import ThemeContext from './ThemeContext';
import UserInfo from './UserInfo';
import Survey from './Survey';
import './styles.css';
import Footer from './components/Footer';

function App() {
    const [userInfo, setUserInfo] = useState(null);
    const {theme, toggleTheme } = useContext(ThemeContext);
    return (

        <div>
            <button onClick={toggleTheme}>
                Alternar para o modo {theme === 'light' ? 'escuro' : 'claro'}
            </button>
            <div className="container">
                <h1>Questionário</h1>
                {userInfo ? (
                    <Survey userInfo={userInfo} />
                ) : (
                    <UserInfo setUserInfo={setUserInfo} />
                )}
            </div>
            
            <Footer />
        </div>
            
       
    );
}

export default App;
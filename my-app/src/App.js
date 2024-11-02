import React, { useState } from 'react';
import UserInfo from './UserInfo';
import Survey from './Survey';
import './styles.css';
import Footer from './components/Footer';

function App() {
    const [userInfo, setUserInfo] = useState(null);

    return (

        <div>

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
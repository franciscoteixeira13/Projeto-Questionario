import React from 'react';
import './Main.css'
import App from './App'
export default function Main() {


/* const Home = ({ setKey }) => {
  const createConversation = async () => {
    const response = await fetch('http://localhost:3001/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    setKey(data.key);
  };
 */
return (
    <>
    <div>
      <h1>Painel de Entrevistas</h1>
      
      <App />
      
      
    </div> 
          
    
    </>
    
      
    
  );
}
//}

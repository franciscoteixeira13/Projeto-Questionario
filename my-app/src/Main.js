import React from 'react';
import Header from './components/Header'
import Footer from './components/Footer'
import './Main.css'
import { useState } from 'react';
import Questionario from './Survey';
import About from './about'

import App from './App'
import {BrowserRouter, Routes, Route } from 'react-router-dom';
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

import React from 'react';
import Header from './components/Header'
import Footer from './components/Footer'
import './Main.css'
import LoginSignup from './components/LoginSignup'
import { useState } from 'react';
import Questionario from './Survey';
import Chat from './Chat'
import About from './about'

import App from './App'
import { Link, useNavigate } from 'react-router-dom';
import {BrowserRouter, Routes, Route } from 'react-router-dom';
import Chat1 from './Chat1';
export default function Main() {
  
let navigate = useNavigate();

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

import React, { createContext, useState } from 'react';

// Cria o contexto
export const ThemeContext = createContext();

// Componente que fornece o contexto
export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('light');

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// Você deve também ter a exportação padrão do ThemeProvider
export default ThemeProvider;
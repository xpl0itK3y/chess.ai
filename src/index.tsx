/**
 * Точка входа в React-приложение
 * 
 * Этот файл рендерит главный компонент App в DOM-элемент с id="root"
 */
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

// Рендерим главный компонент приложения в корневой элемент DOM
ReactDOM.render(
    <App />,
  document.getElementById('root')
);


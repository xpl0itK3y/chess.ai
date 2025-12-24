import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

/**
 * Точка входа в React приложение
 * Рендерит главный компонент App в DOM элемент с id="root"
 * Этот элемент находится в public/index.html
 */
ReactDOM.render(
    <App />, // Главный компонент приложения
  document.getElementById('root') // Контейнер где будет отрисовано приложение
);


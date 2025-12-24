/**
 * Компонент для отображения сбитых фигур
 * 
 * Показывает список фигур, которые были съедены в процессе игры
 */
import React, {FC} from 'react';
import {Figure} from "../models/figures/Figure";

/**
 * Интерфейс пропсов компонента сбитых фигур
 */
interface LostFiguresProps {
  title: string; // Заголовок (например, "Сбитые черные фигуры")
  figures: Figure[] // Массив сбитых фигур
}

const LostFigures: FC<LostFiguresProps> = ({title, figures}) => {
  return (
    <div className="lost">
      {/* Заголовок списка фигур */}
      <h3>{title}</h3>
      {/* Рендеринг всех сбитых фигур */}
      {figures.map(figure =>
        <div key={figure.id}>
          {/* Название фигуры и ее изображение */}
          {figure.name} {figure.logo && <img width={20} height={20} src={figure.logo}/>}
        </div>
      )}
    </div>
  );
};

export default LostFigures;

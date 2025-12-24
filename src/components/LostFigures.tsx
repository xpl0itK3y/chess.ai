import React, {FC} from 'react';
import {Figure} from "../models/figures/Figure";

/**
 * Интерфейс пропсов компонента съеденных фигур
 */
interface LostFiguresProps {
  title: string;    // Заголовок (белые/черные фигуры)
  figures: Figure[] // Массив съеденных фигур
}

/**
 * Компонент для отображения съеденных фигур
 * Показывает список фигур которые были взяты в игре
 */
const LostFigures: FC<LostFiguresProps> = ({title, figures}) => {
  return (
    <div className="lost">
      {/* Заголовок панели */}
      <h3>{title}</h3>
      
      {/* Проходим по всем съеденным фигурам и отображаем их */}
      {figures.map(figure =>
        <div key={figure.id}>
          {figure.name} {figure.logo && <img width={20} height={20} src={figure.logo} alt={figure.name}/>}
        </div>
      )}
    </div>
  );
};

export default LostFigures;

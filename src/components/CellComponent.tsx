/**
 * Компонент клетки шахматной доски
 * 
 * Отображает одну клетку доски с фигурой или без нее
 */
import React, {FC} from 'react';
import {Cell} from "../models/Cell";

/**
 * Интерфейс пропсов компонента клетки
 */
interface CellProps {
  cell: Cell; // Модель клетки
  selected: boolean; // Флаг, выбрана ли клетка
  click: (cell: Cell) => void; // Функция обработчика клика
}

const CellComponent: FC<CellProps> = ({cell, selected, click}) => {
  return (
    <div
      // CSS классы: базовый cell, цвет клетки, selected если выбрана
      className={['cell', cell.color, selected ? "selected" : ''].join(' ')}
      onClick={() => click(cell)}
      // Зеленый фон если клетка доступна и на ней стоит фигура противника
      style={{background: cell.available && cell.figure ? 'green' : ''}}
    >
      {/* Индикатор доступной пустой клетки */}
      {cell.available && !cell.figure && <div className={"available"}/>}
      {/* Отображение фигуры если она есть */}
      {cell.figure?.logo && <img src={cell.figure.logo} alt=""/>}
    </div>
  );
};

export default CellComponent;

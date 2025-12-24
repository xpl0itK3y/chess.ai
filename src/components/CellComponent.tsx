import React, {FC} from 'react';
import {Cell} from "../models/Cell";

/**
 * Интерфейс пропсов компонента клетки
 */
interface CellProps {
  cell: Cell;                       // Клетка для отображения
  selected: boolean;                // Выделена ли клетка
  click: (cell: Cell) => void;     // Функция обработки клика
}

/**
 * Компонент отдельной шахматной клетки
 * Отображает клетку, фигуру на ней и подсветку возможных ходов
 */
const CellComponent: FC<CellProps> = ({cell, selected, click}) => {
  return (
    <div
      // Формируем CSS классы: базовый класс cell + цвет клетки + selected если выделена
      className={['cell', cell.color, selected ? "selected" : ''].join(' ')}
      onClick={() => click(cell)} // Обработчик клика по клетке
      // Подсвечиваем зелененьким если можно съесть фигуру на этой клетке
      style={{background: cell.available && cell.figure ? 'green' : ''}}
    >
      {/* Показываем зеленую точку если клетка доступна для хода и пуста */}
      {cell.available && !cell.figure && <div className={"available"}/>}
      
      {/* Показываем иконку фигуры если на клетке есть фигура */}
      {cell.figure?.logo && <img src={cell.figure.logo} alt=""/>}
    </div>
  );
};

export default CellComponent;

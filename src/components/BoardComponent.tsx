import React, {FC, useEffect, useState} from 'react';
import {Board} from "../models/Board";
import CellComponent from "./CellComponent";
import {Cell} from "../models/Cell";
import {Player} from "../models/Player";

/**
 * Интерфейс пропсов компонента доски
 */
interface BoardProps {
  board: Board;                           // Текущая доска с клетками и фигурами
  setBoard: (board: Board) => void;      // Функция обновления доски
  currentPlayer: Player | null;          // Текущий игрок
  swapPlayer: () => void;                // Функция переключения хода
}

/**
 * Компонент шахматной доски
 * Отвечает за отображение доски, обработку кликов по клеткам и управление ходами
 */
const BoardComponent: FC<BoardProps> = ({board, setBoard, currentPlayer, swapPlayer}) => {
  // Выбранная клетка (чей-то ход сейчас)
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);

  /**
   * Обработчик клика по клетке
   * @param cell - клетка на которую кликнули
   */
  function click(cell: Cell) {
    // Если уже есть выбранная клетка, и мы кликаем на другую клетку
    if (selectedCell && selectedCell !== cell && selectedCell.figure?.canMove(cell)) {
      selectedCell.moveFigure(cell); // Перемещаем фигуру
      swapPlayer()                    // Переключаем игрока
      setSelectedCell(null);          // Снимаем выделение
      updateBoard()                    // Обновляем доску для React
    } else {
      // Если кликаем на свою фигуру - выделяем ее
      if (cell.figure?.color === currentPlayer?.color) {
        setSelectedCell(cell);
      }
    }
  }

  /**
   * Эффект: при изменении выбранной клетки подсвечиваем возможные ходы
   */
  useEffect(() => {
    highlightCells()
  }, [selectedCell]) // Запускается только при изменении selectedCell

  /**
   * Подсвечивает клетки куда может пойти выбранная фигура
   */
  function highlightCells() {
    board.highlightCells(selectedCell) // Вызываем метод доски для подсветки
    updateBoard()                     // Обновляем доску
  }

  /**
   * Создает копию доски и обновляет состояние
   * Нужно чтобы React отследил изменения и перерисовал компоненты
   */
  function updateBoard() {
    const newBoard = board.getCopyBoard() // Создаем копию доски
    setBoard(newBoard)                    // Обновляем состояние
  }

  return (
    <div>
      <h3>Текущий игрок {currentPlayer?.color}</h3>
      <div className="board">
        {board.cells.map((row, index) =>
          <React.Fragment key={index}>
            {row.map(cell =>
              <CellComponent
                click={click}
                cell={cell}
                key={cell.id}
                selected={cell.x === selectedCell?.x && cell.y === selectedCell?.y}
              />
            )}
          </React.Fragment>
        )}
      </div>
    </div>
  );
};

export default BoardComponent;

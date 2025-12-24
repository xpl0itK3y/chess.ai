/**
 * Компонент шахматной доски
 * 
 * Отображает доску с фигурами и обрабатывает ходы игроков
 */
import React, {FC, useEffect, useState} from 'react';
import {Board} from "../models/Board";
import CellComponent from "./CellComponent";
import {Cell} from "../models/Cell";
import {Player} from "../models/Player";

/**
 * Интерфейс пропсов компонента доски
 */
interface BoardProps {
  board: Board; // Состояние доски
  setBoard: (board: Board) => void; // Функция для обновления состояния доски
  currentPlayer: Player | null; // Текущий игрок
  swapPlayer: () => void; // Функция для переключения игрока
}

const BoardComponent: FC<BoardProps> = ({board, setBoard, currentPlayer, swapPlayer}) => {
  // Состояние выбранной клетки
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);

  /**
   * Обрабатывает клик по клетке
   * @param cell Клетка, по которой кликнули
   */
  function click(cell: Cell) {
    // Если выбрана клетка с фигурой и можно сделать ход
    if (selectedCell && selectedCell !== cell && selectedCell.figure?.canMove(cell)) {
      selectedCell.moveFigure(cell);
      swapPlayer()
      setSelectedCell(null);
      updateBoard()
    } else {
      // Если кликаем по фигуре текущего игрока, выбираем ее
      if (cell.figure?.color === currentPlayer?.color) {
        setSelectedCell(cell);
      }
    }
  }

  // Подсвечиваем доступные для хода клетки при изменении выбранной клетки
  useEffect(() => {
    highlightCells()
  }, [selectedCell])

  /**
   * Подсвечивает доступные для хода клетки
   */
  function highlightCells() {
    board.highlightCells(selectedCell)
    updateBoard()
  }

  /**
   * Обновляет состояние доски для рендеринга изменений
   */
  function updateBoard() {
    const newBoard = board.getCopyBoard()
    setBoard(newBoard)
  }

  return (
    <div>
      {/* Отображение текущего игрока */}
      <h3>Текущий игрок {currentPlayer?.color}</h3>
      {/* Контейнер шахматной доски */}
      <div className="board">
        {/* Рендеринг всех клеток доски по строкам */}
        {board.cells.map((row, index) =>
          <React.Fragment key={index}>
            {row.map(cell =>
              <CellComponent
                click={click}
                cell={cell}
                key={cell.id}
                // Подсветка выбранной клетки
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

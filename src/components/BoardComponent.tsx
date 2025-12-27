/**
 * Компонент шахматной доски
 * 
 * Отображает доску с фигурами и обрабатывает ходы игроков
 */
import React, { FC, useEffect, useState } from 'react';
import { Board } from "../models/Board";
import CellComponent from "./CellComponent";
import { Cell } from "../models/Cell";
import { Player } from "../models/Player";
import PromotionModal, { PromotionChoice } from "./PromotionModal";
import { Queen } from "../models/figures/Queen";
import { Rook } from "../models/figures/Rook";
import { Bishop } from "../models/figures/Bishop";
import { Knight } from "../models/figures/Knight";
import { Colors } from "../models/Colors";

/**
 * Интерфейс пропсов компонента доски
 */
interface BoardProps {
  board: Board; // Состояние доски
  setBoard: (board: Board) => void; // Функция для обновления состояния доски
  currentPlayer: Player | null; // Текущий игрок
  swapPlayer: () => void; // Функция для переключения игрока
  isAIThinking?: boolean; // Думает ли AI в данный момент
}

const BoardComponent: FC<BoardProps> = ({ board, setBoard, currentPlayer, swapPlayer, isAIThinking = false }) => {
  // Состояние выбранной клетки
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  // Состояние для превращения пешки
  const [promotionCell, setPromotionCell] = useState<Cell | null>(null);
  // Статус игры
  const [gameStatus, setGameStatus] = useState<'playing' | 'check' | 'checkmate' | 'stalemate'>('playing');

  /**
   * Обрабатывает клик по клетке
   * @param cell Клетка, по которой кликнули
   */
  function click(cell: Cell) {
    // Если игра закончена или AI думает, ходы запрещены
    if (gameStatus === 'checkmate' || gameStatus === 'stalemate' || isAIThinking) {
      return;
    }

    // Если выбрана клетка с фигурой и можно сделать ход
    if (selectedCell && selectedCell !== cell && selectedCell.figure?.canMove(cell)) {
      // Проверяем легальность хода
      if (!board.isMoveLegal(selectedCell, cell)) {
        return;
      }

      const needsPromotion = selectedCell.moveFigure(cell);

      if (needsPromotion) {
        setPromotionCell(cell);
        setSelectedCell(null);
        updateBoard();
      } else {
        completeMove();
      }
    } else {
      // Если кликаем по фигуре текущего игрока, выбираем ее
      if (cell.figure?.color === currentPlayer?.color) {
        setSelectedCell(cell);
      }
    }
  }

  /**
   * Завершает ход и проверяет статус игры
   */
  function completeMove() {
    swapPlayer();
    setSelectedCell(null);
    updateBoard();
  }

  /**
   * Обрабатывает выбор фигуры для превращения пешки
   */
  function handlePromotion(choice: PromotionChoice) {
    if (!promotionCell || !promotionCell.figure) return;

    const color = promotionCell.figure.color;

    // Удаляем пешку
    promotionCell.figure = null;

    // Создаем выбранную фигуру
    switch (choice) {
      case 'queen':
        new Queen(color, promotionCell);
        break;
      case 'rook':
        new Rook(color, promotionCell);
        break;
      case 'bishop':
        new Bishop(color, promotionCell);
        break;
      case 'knight':
        new Knight(color, promotionCell);
        break;
    }

    setPromotionCell(null);
    completeMove();
  }

  // Проверяем статус игры при смене игрока
  useEffect(() => {
    if (!currentPlayer) return;

    if (board.isCheckmate(currentPlayer.color)) {
      setGameStatus('checkmate');
    } else if (board.isStalemate(currentPlayer.color)) {
      setGameStatus('stalemate');
    } else if (board.isKingUnderAttack(currentPlayer.color)) {
      setGameStatus('check');
    } else {
      setGameStatus('playing');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlayer]);

  // Подсвечиваем доступные для хода клетки при изменении выбранной клетки
  useEffect(() => {
    highlightCells()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  /**
   * Возвращает текст статуса игры
   */
  function getStatusText(): string {
    switch (gameStatus) {
      case 'check':
        return '⚠️ ШАХ!';
      case 'checkmate':
        const winner = currentPlayer?.color === Colors.WHITE ? 'Черные' : 'Белые';
        return `👑 МАТ! ${winner} победили!`;
      case 'stalemate':
        return '🤝 ПАТ! Ничья!';
      default:
        return '';
    }
  }

  return (
    <div>
      {/* Отображение текущего игрока */}
      <h3>
        Текущий игрок: {currentPlayer?.color === Colors.WHITE ? 'Белые' : 'Черные'}
        {isAIThinking && ' (AI думает...)'}
      </h3>

      {/* Статус игры */}
      {gameStatus !== 'playing' && (
        <div className={`game-status ${gameStatus}`}>
          {getStatusText()}
        </div>
      )}

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

      {/* Модальное окно превращения пешки */}
      {promotionCell && currentPlayer && (
        <PromotionModal
          color={promotionCell.figure?.color || currentPlayer.color}
          onSelect={handlePromotion}
        />
      )}
    </div>
  );
};

export default BoardComponent;

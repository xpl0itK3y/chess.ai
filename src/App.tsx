/**
 * Главный компонент приложения шахматной игры
 * 
 * Компонент управляет состоянием игры, включая:
 * - Шахматную доску
 * - Игроков (белый и черный)
 * - Текущего игрока
 * - Перезапуск игры
 */
import React, {useEffect, useState} from 'react';
import "./App.css";
import BoardComponent from "./components/BoardComponent";
import {Board} from "./models/Board";
import {Player} from "./models/Player";
import {Colors} from "./models/Colors";
import LostFigures from "./components/LostFigures";
import Timer from "./components/Timer";

const App = () => {
  // Состояние шахматной доски - содержит все фигуры и их позиции
  const [board, setBoard] = useState(new Board())
  // Игрок, играющий белыми фигурами
  const [whitePlayer, setWhitePlayer] = useState(new Player(Colors.WHITE))
  // Игрок, играющий черными фигурами
  const [blackPlayer, setBlackPlayer] = useState(new Player(Colors.BLACK))
  // Текущий игрок, чей ход сейчас
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

  // Хук useEffect выполняется при первом рендере компонента
  // Инициализирует доску и устанавливает первого игрока (белые)
  useEffect(() => {
    restart()
    setCurrentPlayer(whitePlayer);
  }, [])

  /**
   * Перезапускает игру:
   * - Создает новую доску
   * - Инициализирует все клетки доски
   * - Расставляет фигуры в начальные позиции
   * - Обновляет состояние доски
   */
  function restart() {
    const newBoard = new Board();
    newBoard.initCells()
    newBoard.addFigures()
    setBoard(newBoard)
  }

  /**
   * Переключает текущего игрока:
   * Если сейчас ход белых, делает ход черных, и наоборот
   */
  function swapPlayer() {
    setCurrentPlayer(currentPlayer?.color === Colors.WHITE ? blackPlayer : whitePlayer)
  }

  return (
    <div className="app">
      {/* Компонент таймера для отслеживания времени игры */}
      <Timer
        restart={restart}
        currentPlayer={currentPlayer}
      />
      {/* Основной компонент шахматной доски */}
      <BoardComponent
        board={board}
        setBoard={setBoard}
        currentPlayer={currentPlayer}
        swapPlayer={swapPlayer}
      />
      {/* Панель для отображения сбитых фигур */}
      <div>
        {/* Сбитые черные фигуры */}
        <LostFigures
          title="Черные фигуры"
          figures={board.lostBlackFigures}
        />
        {/* Сбитые белые фигуры */}
        <LostFigures
          title="Белые фигуры"
          figures={board.lostWhiteFigures}
        />
      </div>
    </div>
  );
};

export default App;

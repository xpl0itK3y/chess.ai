/**
 * Главный компонент приложения шахматной игры
 * 
 * Компонент управляет состоянием игры, включая:
 * - Шахматную доску
 * - Игроков (белый и черный)
 * - Текущего игрока
 * - Перезапуск игры
 */
import {useEffect, useState} from 'react';
import "./App.css";
import BoardComponent from "./components/BoardComponent";
import {Board} from "./models/Board";
import {Player} from "./models/Player";
import {Colors} from "./models/Colors";
import LostFigures from "./components/LostFigures";
import Timer from "./components/Timer";
import ApiTestComponent from "./components/ApiTestComponent";

const App = () => {
  // Состояние шахматной доски - содержит все фигуры и их позиции
  const [board, setBoard] = useState(new Board())
  // Игрок, играющий белыми фигурами
const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

  useEffect(() => {
    restart()
  }, [])

  function restart() {
    const newBoard = new Board();
    newBoard.initCells()
    newBoard.addFigures()
    setBoard(newBoard)
    // Устанавливаем белого игрока первым
    setCurrentPlayer(new Player(Colors.WHITE));
  }

  /**
   * Переключает текущего игрока:
   * Если сейчас ход белых, делает ход черных, и наоборот
   */
  function swapPlayer() {
    setCurrentPlayer(currentPlayer?.color === Colors.WHITE ? new Player(Colors.BLACK) : new Player(Colors.WHITE))
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
      {/* Компонент для проверки OpenAI API */}
      <ApiTestComponent />
    </div>
  );
};

export default App;

import React, {useEffect, useState} from 'react';
import "./App.css";
import BoardComponent from "./components/BoardComponent";
import {Board} from "./models/Board";
import {Player} from "./models/Player";
import {Colors} from "./models/Colors";
import LostFigures from "./components/LostFigures";
import Timer from "./components/Timer";

/**
 * Главный компонент приложения шахмат
 * Управляет состоянием игры, доской, игроками и переключением ходов
 */
const App = () => {
  // Состояние доски - содержит все клетки и фигуры
  const [board, setBoard] = useState(new Board())
  
  // Создаем игроков (в будущем можно будет сделать динамически)
  const whitePlayer = new Player(Colors.WHITE)
  const blackPlayer = new Player(Colors.BLACK)
  
  // Текущий игрок чей сейчас ход
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

  /**
   * Инициализация игры при первом рендере
   * Создает доску, расставляет фигуры и устанавливает первого игрока
   */
  useEffect(() => {
    restart()            // Создаем и настраиваем доску
    setCurrentPlayer(whitePlayer); // Белые начинают игру
  }, []) // Пустой массив означает - выполнить только один раз при монтировании

  /**
   * Перезапускает игру
   * Создает новую доску и расставляет все фигуры в начальную позицию
   */
  function restart() {
    const newBoard = new Board();
    newBoard.initCells()  // Создаем пустые клетки
    newBoard.addFigures() // Расставляем фигуры
    setBoard(newBoard)    // Обновляем состояние доски
  }

  /**
   * Переключает текущего игрока
   * Вызывается после каждого хода
   */
  function swapPlayer() {
    // Если текущий игрок белый, переключаем на черного, и наоборот
    setCurrentPlayer(currentPlayer?.color === Colors.WHITE ? blackPlayer : whitePlayer)
  }

  return (
    <div className="app">
      <Timer
        restart={restart}
        currentPlayer={currentPlayer}
      />
      <BoardComponent
        board={board}
        setBoard={setBoard}
        currentPlayer={currentPlayer}
        swapPlayer={swapPlayer}
      />
      <div>
        <LostFigures
          title="Черные фигуры"
          figures={board.lostBlackFigures}
        />
        <LostFigures
          title="Белые фигуры"
          figures={board.lostWhiteFigures}
        />
      </div>
    </div>
  );
};

export default App;

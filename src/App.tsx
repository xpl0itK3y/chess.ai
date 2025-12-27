/**
 * Главный компонент приложения шахматной игры
 * 
 * Компонент управляет состоянием игры, включая:
 * - Шахматную доску
 * - Игроков (белый и черный)
 * - Текущего игрока
 * - Перезапуск игры
 * - Режим игры (человек vs человек / человек vs AI)
 */
import { useEffect, useState } from 'react';
import "./App.css";
import BoardComponent from "./components/BoardComponent";
import { Board } from "./models/Board";
import { Player } from "./models/Player";
import { Colors } from "./models/Colors";
import LostFigures from "./components/LostFigures";
import Timer from "./components/Timer";
import ApiTestComponent from "./components/ApiTestComponent";
import { runAllTests } from "./tests/chessTests";
import { getAIMove } from "./services/AIService";
import { Queen } from "./models/figures/Queen";
import { Rook } from "./models/figures/Rook";
import { Bishop } from "./models/figures/Bishop";
import { Knight } from "./models/figures/Knight";

// Делаем тесты доступными в консоли браузера
(window as any).runChessTests = runAllTests;

const App = () => {
  // Состояние шахматной доски - содержит все фигуры и их позиции
  const [board, setBoard] = useState(new Board())
  // Игрок, играющий белыми фигурами
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  // Режим игры: 'human' - два человека, 'easy' - простой AI, 'hard' - сильный AI
  const [gameMode, setGameMode] = useState<'human' | 'easy' | 'hard'>('hard');
  // Состояние загрузки AI хода
  const [isAIThinking, setIsAIThinking] = useState(false);

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
    setIsAIThinking(false);
  }

  /**
   * Переключает текущего игрока:
   * Если сейчас ход белых, делает ход черных, и наоборот
   */
  function swapPlayer() {
    setCurrentPlayer(currentPlayer?.color === Colors.WHITE ? new Player(Colors.BLACK) : new Player(Colors.WHITE))
  }

  /**
   * Обрабатывает ход AI
   */
  useEffect(() => {
    const makeAIMove = async () => {
      if (gameMode === 'human' || !currentPlayer || currentPlayer.color !== Colors.BLACK || isAIThinking) {
        return;
      }

      setIsAIThinking(true);
      
      try {
        const aiMove = await getAIMove(board, Colors.BLACK, gameMode === 'easy' ? 'easy' : 'hard');
        
        if (aiMove.success && aiMove.from && aiMove.to) {
          const fromCell = board.getCell(aiMove.from.x, aiMove.from.y);
          const toCell = board.getCell(aiMove.to.x, aiMove.to.y);
          
          // Дополнительная проверка что это черная фигура
          if (!fromCell.figure || fromCell.figure.color !== Colors.BLACK) {
            console.error('AI tried to move non-black piece:', aiMove);
            swapPlayer();
            return;
          }
          
          if (fromCell.figure && fromCell.figure.canMove(toCell) && board.isMoveLegal(fromCell, toCell)) {
            const needsPromotion = fromCell.moveFigure(toCell);
            
            if (needsPromotion && aiMove.promotion) {
              // Автоматически выбираем ферзя для превращения пешки
              toCell.figure = null;
              
              switch (aiMove.promotion.toLowerCase()) {
                case 'q':
                  new Queen(Colors.BLACK, toCell);
                  break;
                case 'r':
                  new Rook(Colors.BLACK, toCell);
                  break;
                case 'b':
                  new Bishop(Colors.BLACK, toCell);
                  break;
                case 'n':
                  new Knight(Colors.BLACK, toCell);
                  break;
                default:
                  new Queen(Colors.BLACK, toCell);
              }
            }
            
            // Обновляем доску и переключаем игрока
            updateBoard();
            swapPlayer();
          } else {
            console.error('AI move validation failed:', aiMove);
            console.error('From figure:', fromCell.figure);
            console.error('Can move:', fromCell.figure?.canMove(toCell));
            console.error('Is legal:', board.isMoveLegal(fromCell, toCell));
            // Если ход невалидный, пропускаем ход AI и передаем управление обратно человеку
            swapPlayer();
          }
        } else {
          console.error('AI move failed:', aiMove.error);
          // Если AI не смог сделать ход, передаем управление человеку
          swapPlayer();
        }
      } catch (error) {
        console.error('AI move failed:', error);
        // В случае ошибки, передаем управление человеку
        swapPlayer();
      } finally {
        setIsAIThinking(false);
      }
    };

    const timer = setTimeout(makeAIMove, 1000); // Задержка 1 секунда для лучшего UX
    return () => clearTimeout(timer);
  }, [currentPlayer, gameMode, board]);

  /**
   * Обновляет состояние доски
   */
  function updateBoard() {
    const newBoard = board.getCopyBoard();
    setBoard(newBoard);
  }

  return (
    <div className="app">
      {/* Управление режимом игры */}
      <div style={{ 
        padding: '10px', 
        margin: '10px', 
        textAlign: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: '8px'
      }}>
        <h4>Режим игры:</h4>
        <div style={{ marginBottom: '10px' }}>
          <button
            onClick={() => {
              setGameMode('human');
              restart();
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: gameMode === 'human' ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              margin: '0 5px'
            }}
          >
            👥 Человек vs Человек
          </button>
          <button
            onClick={() => {
              setGameMode('easy');
              restart();
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: gameMode === 'easy' ? '#ffc107' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              margin: '0 5px'
            }}
          >
            🤖 AI: Легкий
          </button>
          <button
            onClick={() => {
              setGameMode('hard');
              restart();
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: gameMode === 'hard' ? '#dc3545' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              margin: '0 5px'
            }}
          >
            🧠 AI: Сильный (GPT-4)
          </button>
        </div>
        {isAIThinking && gameMode !== 'human' && (
          <div style={{ 
            color: '#666',
            fontStyle: 'italic'
          }}>
            🤔 {gameMode === 'easy' ? 'Простой AI думает...' : 'Сильный AI анализирует...'}
          </div>
        )}
      </div>

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
        isAIThinking={isAIThinking}
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

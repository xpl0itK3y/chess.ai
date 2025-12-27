export default async function handler(req, res) {
  // CORS headers
  const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? ['https://chess-ai-xpl0itk3y.vercel.app', 'https://chessai-lac.vercel.app', 'https://your-vercel-app.vercel.app']
    : ['http://localhost:3000'];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { board, currentColor } = req.body;
    console.log('Smart AI Request received:', { currentColor, hasBoard: !!board });

    if (!board || !board.cells) {
      return res.status(400).json({
        success: false,
        error: 'Invalid board data'
      });
    }

    // Расширенная оценка позиции
    const evaluatePosition = (board, color) => {
      let score = 0;
      const pieceValues = {
        'Пешка': 100,
        'Конь': 320,
        'Слон': 330,
        'Ладья': 500,
        'Ферзь': 900,
        'Король': 20000
      };

      // Позиционные бонусы для пешек
      const pawnTable = [
        [0,  0,  0,  0,  0,  0,  0,  0],
        [50, 50, 50, 50, 50, 50, 50, 50],
        [10, 10, 20, 30, 30, 20, 10, 10],
        [5,  5, 10, 25, 25, 10,  5,  5],
        [0,  0,  0, 20, 20,  0,  0,  0],
        [5, -5,-10,  0,  0,-10, -5,  5],
        [5, 10, 10,-20,-20, 10, 10,  5],
        [0,  0,  0,  0,  0,  0,  0,  0]
      ];

      // Позиционные бонусы для коней
      const knightTable = [
        [-50,-40,-30,-30,-30,-30,-40,-50],
        [-40,-20,  0,  0,  0,  0,-20,-40],
        [-30,  0, 10, 15, 15, 10,  0,-30],
        [-30,  5, 15, 20, 20, 15,  5,-30],
        [-30,  0, 15, 20, 20, 15,  0,-30],
        [-30,  5, 10, 15, 15, 10,  5,-30],
        [-40,-20,  0,  5,  5,  0,-20,-40],
        [-50,-40,-30,-30,-30,-30,-40,-50]
      ];

      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const cell = board.cells[y][x];
          if (!cell.figure) continue;

          const pieceValue = pieceValues[cell.figure.name] || 0;
          const multiplier = cell.figure.color === color ? 1 : -1;
          
          score += pieceValue * multiplier;

          // Позиционные бонусы
          if (cell.figure.name === 'Пешка') {
            const tableY = cell.figure.color === 'BLACK' ? 7 - y : y;
            score += pawnTable[tableY][x] * multiplier;
          } else if (cell.figure.name === 'Конь') {
            const tableY = cell.figure.color === 'BLACK' ? 7 - y : y;
            score += knightTable[tableY][x] * multiplier;
          }
        }
      }

      return score;
    };

    // Оценка конкретного хода
    const evaluateMove = (fromX, fromY, toX, toY, board, color) => {
      let score = 0;
      
      const fromCell = board.cells[fromY][fromX];
      const toCell = board.cells[toY][toX];
      
      if (!fromCell || !fromCell.figure) return -Infinity;
      
      // Бонус за взятие
      if (toCell.figure) {
        const pieceValues = {
          'Пешка': 1,
          'Конь': 3,
          'Слон': 3,
          'Ладья': 5,
          'Ферзь': 9,
          'Король': 100
        };
        score += (pieceValues[toCell.figure.name] || 0) * 100;
      }
      
      // Моделируем ход для оценки позиции
      const originalPiece = toCell.figure;
      const originalFromFigure = fromCell.figure;
      
      toCell.figure = fromCell.figure;
      fromCell.figure = null;
      
      // Оценим позицию после хода
      const positionScore = evaluatePosition(board, color);
      
      // Восстанавливаем позицию
      fromCell.figure = originalFromFigure;
      toCell.figure = originalPiece;
      
      score += positionScore * 0.1;
      
      // Бонус за контроль центра
      const centerDistance = Math.abs(toX - 3.5) + Math.abs(toY - 3.5);
      score += (7 - centerDistance) * 5;
      
      // Бонус за развитие в начале игры
      const isEarlyGame = board.cells.flat().filter(cell => cell.figure).length > 28;
      if (isEarlyGame) {
        const backRank = color === 'BLACK' ? 0 : 7;
        if (fromY === backRank && toY !== backRank) {
          score += 30;
        }
      }
      
      // Бонус за безопасность короля в эндшпиле
      const isEndgame = board.cells.flat().filter(cell => cell.figure).length < 13;
      if (isEndgame) {
        // В эндшпиле король должен быть активным
        if (fromCell.figure.name === 'Король') {
          score += 20;
        }
      }
      
      // Штраф за ходы на атакованные поля
      const isUnderAttack = isCellUnderAttack(toX, toY, board, color === 'BLACK' ? 'WHITE' : 'BLACK');
      if (isUnderAttack && originalPiece === null) {
        score -= 50; // Штраф за ход фигурой под атаку
      }
      
      return score;
    };

    // Проверка атакованности поля
    const isCellUnderAttack = (x, y, board, byColor) => {
      for (let ty = 0; ty < 8; ty++) {
        for (let tx = 0; tx < 8; tx++) {
          const cell = board.cells[ty][tx];
          if (cell.figure && cell.figure.color === byColor) {
            if (cell.figure && cell.figure.canMove && cell.figure.canMove(board.cells[y][x])) {
              return true;
            }
          }
        }
      }
      return false;
    };

    // Минимакс с альфа-бета отсечением (глубина 2)
    const minimax = (board, depth, alpha, beta, maximizingPlayer, color) => {
      if (depth === 0) {
        return evaluatePosition(board, color);
      }

      const currentColor = maximizingPlayer ? color : (color === 'BLACK' ? 'WHITE' : 'BLACK');
      const moves = [];
      
      // Генерируем все возможные ходы
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const fromCell = board.cells[y][x];
          if (fromCell.figure && fromCell.figure.color === currentColor) {
            for (let ty = 0; ty < 8; ty++) {
              for (let tx = 0; tx < 8; tx++) {
                const toCell = board.cells[ty][tx];
                if (fromCell.figure && fromCell.figure.canMove && fromCell.figure.canMove(toCell)) {
                  moves.push({ fromX: x, fromY: y, toX: tx, toY: ty });
                }
              }
            }
          }
        }
      }

      if (moves.length === 0) {
        // Мат или пат
        const isCheck = isCellUnderAttack(
          ...findKingPosition(board, currentColor),
          board,
          currentColor === 'BLACK' ? 'WHITE' : 'BLACK'
        );
        return isCheck ? (maximizingPlayer ? -10000 : 10000) : 0;
      }

      if (maximizingPlayer) {
        let maxEval = -Infinity;
        for (const move of moves) {
          // Делаем ход
          const originalPiece = board.cells[move.toY][move.toX].figure;
          const movingPiece = board.cells[move.fromY][move.fromX].figure;
          board.cells[move.toY][move.toX].figure = movingPiece;
          board.cells[move.fromY][move.fromX].figure = null;
          
          const evalScore = minimax(board, depth - 1, alpha, beta, false, color);
          
          // Отменяем ход
          board.cells[move.fromY][move.fromX].figure = movingPiece;
          board.cells[move.toY][move.toX].figure = originalPiece;
          
          maxEval = Math.max(maxEval, evalScore);
          alpha = Math.max(alpha, eval);
          if (beta <= alpha) break;
        }
        return maxEval;
      } else {
        let minEval = Infinity;
        for (const move of moves) {
          // Делаем ход
          const originalPiece = board.cells[move.toY][move.toX].figure;
          const movingPiece = board.cells[move.fromY][move.fromX].figure;
          board.cells[move.toY][move.toX].figure = movingPiece;
          board.cells[move.fromY][move.fromX].figure = null;
          
          const evalScore = minimax(board, depth - 1, alpha, beta, true, color);
          
          // Отменяем ход
          board.cells[move.fromY][move.fromX].figure = movingPiece;
          board.cells[move.toY][move.toX].figure = originalPiece;
          
          minEval = Math.min(minEval, evalScore);
          beta = Math.min(beta, eval);
          if (beta <= alpha) break;
        }
        return minEval;
      }
    };

    // Находим позицию короля
    const findKingPosition = (board, color) => {
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const cell = board.cells[y][x];
          if (cell.figure && cell.figure.name === 'Король' && cell.figure.color === color) {
            return [x, y];
          }
        }
      }
      return [0, 0];
    };

    // Ищем лучший ход
    let bestMove = null;
    let bestScore = -Infinity;
    const moves = [];
    
    // Генерируем все возможные ходы
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const fromCell = board.cells[y][x];
        if (fromCell.figure && fromCell.figure.color === currentColor) {
          
          for (let ty = 0; ty < 8; ty++) {
            for (let tx = 0; tx < 8; tx++) {
              const toCell = board.cells[ty][tx];
              
              if (fromCell.figure && fromCell.figure.canMove && fromCell.figure.canMove(toCell)) {
                const score = evaluateMove(x, y, tx, ty, board, currentColor);
                moves.push({
                  from: { x, y },
                  to: { x: tx, y: ty },
                  score: score
                });
              }
            }
          }
        }
      }
    }

    if (moves.length === 0) {
      return res.status(200).json({
        success: true,
        move: null,
        model: 'smart-ai-checkmate',
        message: `Checkmate! No legal moves for ${currentColor}`
      });
    }

    // Сортируем ходы по начальной оценке для альфа-бета
    moves.sort((a, b) => b.score - a.score);
    
    // Берем топ-10 ходов для детального анализа
    const topMoves = moves.slice(0, Math.min(10, moves.length));
    
    // Анализируем топ-ходы с помощью минимакса
    for (const move of topMoves) {
      // Делаем ход
      const originalPiece = board.cells[move.to.y][move.to.x].figure;
      const movingPiece = board.cells[move.from.y][move.from.x].figure;
      board.cells[move.to.y][move.to.x].figure = movingPiece;
      board.cells[move.from.y][move.from.x].figure = null;
      
      const score = minimax(board, 1, -Infinity, Infinity, false, currentColor);
      
      // Отменяем ход
      board.cells[move.from.y][move.from.x].figure = movingPiece;
      board.cells[move.to.y][move.to.x].figure = originalPiece;
      
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    // Конвертируем в нотацию
    const fromCell = board.cells[bestMove.from.y][bestMove.from.x];
    const toCell = board.cells[bestMove.to.y][bestMove.to.x];
    
    const fromFile = String.fromCharCode(bestMove.from.x + 97);
    const toFile = String.fromCharCode(bestMove.to.x + 97);
    const toRank = 8 - bestMove.to.y;
    
    const isCapture = board.cells[bestMove.to.y][bestMove.to.x].figure !== null;
    
    let moveNotation;
    if (fromCell.figure.name === 'Пешка') {
      if (isCapture) {
        moveNotation = `${fromFile}x${toFile}${toRank}`;
      } else {
        moveNotation = `${toFile}${toRank}`;
      }
    } else {
      const pieceNotation = {
        'Король': 'K',
        'Ферзь': 'Q',
        'Ладья': 'R', 
        'Слон': 'B',
        'Конь': 'N'
      }[fromCell.figure.name];
      
      if (isCapture) {
        moveNotation = `${pieceNotation}${fromFile}x${toFile}${toRank}`;
      } else {
        moveNotation = `${pieceNotation}${toFile}${toRank}`;
      }
    }
    
    console.log(`Smart AI selected: ${moveNotation} (score: ${bestScore})`);

    return res.status(200).json({
      success: true,
      move: moveNotation,
      model: 'smart-ai-minimax',
      score: bestScore,
      moves_analyzed: topMoves.length,
      message: `Smart AI move for ${currentColor}`
    });

  } catch (error) {
    console.error('Smart AI Error:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}
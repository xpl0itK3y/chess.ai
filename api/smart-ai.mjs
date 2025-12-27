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

    // Умный анализ позиции
    const analyzePosition = (board, color) => {
      const targetColor = color === 'BLACK' ? 'WHITE' : 'BLACK';
      let bestMoves = [];
      
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const fromCell = board.cells[y][x];
          if (fromCell.figure && fromCell.figure.color === color) {
            
            for (let ty = 0; ty < 8; ty++) {
              for (let tx = 0; tx < 8; tx++) {
                const toCell = board.cells[ty][tx];
                
                if (fromCell.figure.canMove(toCell)) {
                  const move = {
                    from: { x, y },
                    to: { x: tx, y: ty },
                    piece: fromCell.figure.name,
                    capture: toCell.figure !== null,
                    captureValue: getPieceValue(toCell.figure),
                    centerControl: isCenterControl({ x: tx, y: ty }),
                    development: isDevelopmentMove(fromCell, toCell)
                  };
                  
                  bestMoves.push(move);
                }
              }
            }
          }
        }
      }
      
      return bestMoves;
    };

    const getPieceValue = (figure) => {
      if (!figure) return 0;
      const values = {
        'Пешка': 1,
        'Конь': 3,
        'Слон': 3,
        'Ладья': 5,
        'Ферзь': 9,
        'Король': 100
      };
      return values[figure.name] || 0;
    };

    const isCenterControl = (pos) => {
      return (pos.x >= 3 && pos.x <= 4 && pos.y >= 3 && pos.y <= 4) ? 1 : 0;
    };

    const isDevelopmentMove = (from, to) => {
      const backRank = from.figure.color === 'BLACK' ? 0 : 7;
      return from.y === backRank && to.y !== backRank ? 1 : 0;
    };

    // Оценка ходов
    const evaluateMove = (move) => {
      let score = 0;
      
      // Взятия - высший приоритет
      if (move.capture) {
        score += move.captureValue * 10;
      }
      
      // Контроль центра
      score += move.centerControl * 2;
      
      // Развитие фигур
      score += move.development * 1.5;
      
      // Бонусы за тип фигур
      const pieceBonus = {
        'Ферзь': 2,
        'Ладья': 1.5,
        'Слон': 1,
        'Конь': 1.2,
        'Пешка': 0.5
      };
      score += pieceBonus[move.piece] || 0;
      
      return score;
    };

    const moves = analyzePosition(board, currentColor);
    
    if (moves.length === 0) {
      return res.status(200).json({
        success: true,
        move: null,
        model: 'smart-ai-no-moves',
        usage: null,
        message: `No legal moves found for ${currentColor}`
      });
    }

    // Сортируем по оценке
    moves.sort((a, b) => evaluateMove(b) - evaluateMove(a));
    
    // Выбираем из лучших ходов (топ 5)
    const topMoves = moves.slice(0, Math.min(5, moves.length));
    const selectedMove = topMoves[Math.floor(Math.random() * topMoves.length)];
    
    // Конвертируем в нотацию
    const moveNotation = convertMoveToNotation(selectedMove);
    
    console.log(`Smart AI selected: ${moveNotation} (score: ${evaluateMove(selectedMove)})`);

    return res.status(200).json({
      success: true,
      move: moveNotation,
      model: 'smart-ai',
      usage: null,
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

const convertMoveToNotation = (move) => {
  const fromFile = String.fromCharCode(move.from.x + 97);
  const toFile = String.fromCharCode(move.to.x + 97);
  const toRank = 8 - move.to.y;
  
  if (move.piece === 'Пешка') {
    if (move.capture) {
      return `${fromFile}x${toFile}${toRank}`;
    } else {
      return `${toFile}${toRank}`;
    }
  }
  
  const pieceNotation = {
    'Король': 'K',
    'Ферзь': 'Q',
    'Ладья': 'R', 
    'Слон': 'B',
    'Конь': 'N'
  }[move.piece];
  
  if (move.capture) {
    return `${pieceNotation}${fromFile}x${toFile}${toRank}`;
  } else {
    return `${pieceNotation}${toFile}${toRank}`;
  }
};
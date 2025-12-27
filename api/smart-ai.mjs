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

    // Простая функция для оценки ходов
    const evaluateMove = (fromX, fromY, toX, toY, board) => {
      let score = Math.random() * 10; // базовая случайность
      
      const fromCell = board.cells[fromY][fromX];
      const toCell = board.cells[toY][toX];
      
      if (!fromCell || !fromCell.figure) return -1;
      
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
        score += (pieceValues[toCell.figure.name] || 0) * 15;
      }
      
      // Бонус за контроль центра
      if (toX >= 3 && toX <= 4 && toY >= 3 && toY <= 4) {
        score += 5;
      }
      
      // Бонус за развитие
      const backRank = fromCell.figure.color === 'BLACK' ? 0 : 7;
      if (fromY === backRank && toY !== backRank) {
        score += 3;
      }
      
      return score;
    };

    // Ищем лучший ход
    let bestMove = null;
    let bestScore = -1;
    
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const fromCell = board.cells[y][x];
        if (fromCell.figure && fromCell.figure.color === currentColor) {
          
          for (let ty = 0; ty < 8; ty++) {
            for (let tx = 0; tx < 8; tx++) {
              const toCell = board.cells[ty][tx];
              
              if (fromCell.figure && fromCell.figure.canMove && fromCell.figure.canMove(toCell)) {
                const score = evaluateMove(x, y, tx, ty, board);
                
                if (score > bestScore) {
                  bestScore = score;
                  bestMove = {
                    from: { x, y },
                    to: { x: tx, y: ty }
                  };
                }
              }
            }
          }
        }
      }
    }

    if (!bestMove) {
      return res.status(200).json({
        success: true,
        move: null,
        model: 'smart-ai-no-moves',
        usage: null,
        message: `No legal moves found for ${currentColor}`
      });
    }

    // Конвертируем в нотацию
    const fromFile = String.fromCharCode(bestMove.from.x + 97);
    const toFile = String.fromCharCode(bestMove.to.x + 97);
    const toRank = 8 - bestMove.to.y;
    
    const fromCell = board.cells[bestMove.from.y][bestMove.from.x];
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
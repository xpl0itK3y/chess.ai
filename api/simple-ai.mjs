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
    console.log('Simple AI Request received:', { currentColor, hasBoard: !!board });

    if (!board || !board.cells) {
      return res.status(400).json({
        success: false,
        error: 'Invalid board data'
      });
    }

    // Оценка хода с учётом стратегии
    const evaluateMove = (fromCell, toCell) => {
      let score = Math.random() * 5;
      
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
        score += (pieceValues[toCell.figure.name] || 0) * 20;
      }
      
      // Бонус за контроль центра
      if (toCell.x >= 3 && toCell.x <= 4 && toCell.y >= 3 && toCell.y <= 4) {
        score += 8;
      }
      
      return score;
    };

    // Конвертируем ход в алгебраическую нотацию
    const convertMoveToNotation = (fromCell, toCell) => {
      const piece = fromCell.figure.name;
      const pieceNotation = {
        'Король': 'K',
        'Ферзь': 'Q',
        'Ладья': 'R', 
        'Слон': 'B',
        'Конь': 'N',
        'Пешка': ''
      }[piece];
      
      const fromFile = String.fromCharCode(fromCell.x + 97);
      const toFile = String.fromCharCode(toCell.x + 97);
      const toRank = 8 - toCell.y;
      
      if (piece === 'Пешка') {
        if (toCell.figure) {
          return `${fromFile}x${toFile}${toRank}`;
        } else {
          return `${toFile}${toRank}`;
        }
      } else {
        if (toCell.figure) {
          return `${pieceNotation}${fromFile}x${toFile}${toRank}`;
        } else {
          return `${pieceNotation}${toFile}${toRank}`;
        }
      }
    };

    // Ищем все возможные ходы с оценкой
    const allMoves = [];
    
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const fromCell = board.cells[y][x];
        if (fromCell.figure && fromCell.figure.color === currentColor) {
          
          for (let ty = 0; ty < 8; ty++) {
            for (let tx = 0; tx < 8; tx++) {
              const toCell = board.cells[ty][tx];
              
              if (fromCell.figure && fromCell.figure.canMove && fromCell.figure.canMove(toCell)) {
                const score = evaluateMove(fromCell, toCell);
                const moveNotation = convertMoveToNotation(fromCell, toCell);
                
                allMoves.push({
                  from: { x, y },
                  to: { x: tx, y: ty },
                  notation: moveNotation,
                  score: score,
                  isCapture: toCell.figure !== null
                });
              }
            }
          }
        }
      }
    }
    
    if (allMoves.length === 0) {
      return res.status(200).json({
        success: true,
        move: null,
        model: 'simple-ai',
        message: `No valid moves found for ${currentColor}`
      });
    }

    // Сортируем по оценке
    allMoves.sort((a, b) => b.score - a.score);
    
    // Для легкого режима: 70% лучший ход, 30% случайный из топ-3
    let selectedMove;
    if (Math.random() < 0.7 && allMoves.length > 0) {
      selectedMove = allMoves[0];
      console.log(`Selected best move: ${selectedMove.notation} (score: ${selectedMove.score})`);
    } else {
      const topMoves = allMoves.slice(0, Math.min(3, allMoves.length));
      selectedMove = topMoves[Math.floor(Math.random() * topMoves.length)];
      console.log(`Selected random from top moves: ${selectedMove.notation} (score: ${selectedMove.score})`);
    }

    console.log(`Simple AI selected: ${selectedMove.notation} for ${currentColor}`);

    return res.status(200).json({
      success: true,
      move: selectedMove.notation,
      model: 'simple-ai-improved',
      score: selectedMove.score,
      message: `Simple AI move for ${currentColor}`
    });

  } catch (error) {
    console.error('Simple AI Error:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}
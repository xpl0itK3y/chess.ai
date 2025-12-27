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
    console.log('Basic AI Request received:', { currentColor });

    if (!board || !board.cells) {
      return res.status(400).json({
        success: false,
        error: 'Invalid board data'
      });
    }

    // Простой и надежный AI без сложной логики
    const findValidMoves = (board, color) => {
      const moves = [];
      
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const fromCell = board.cells[y][x];
          
          if (fromCell.figure && fromCell.figure.color === color) {
            // Проверяем все возможные цели
            for (let ty = 0; ty < 8; ty++) {
              for (let tx = 0; tx < 8; tx++) {
                const toCell = board.cells[ty][tx];
                
                // Простая проверка базовых правил
                if (fromCell.figure && fromCell.figure.canMove && fromCell.figure.canMove(toCell)) {
                  moves.push({
                    from: { x, y },
                    to: { x: tx, y: ty },
                    piece: fromCell.figure.name,
                    capture: toCell.figure !== null
                  });
                }
              }
            }
          }
        }
      }
      
      return moves;
    };

    // Находим валидные ходы
    const validMoves = findValidMoves(board, currentColor);
    
    // Выбираем случайный ход из доступных
    if (validMoves.length === 0) {
      return res.status(200).json({
        success: true,
        move: null,
        model: 'basic-ai',
        message: `No valid moves found for ${currentColor}`
      });
    }

    // Выбираем случайный ход с небольшим приоритетом
    const selectedMove = validMoves[Math.floor(Math.random() * validMoves.length)];
    
    const fromCell = board.cells[selectedMove.from.y][selectedMove.from.x];
    const toCell = board.cells[selectedMove.to.y][selectedMove.to.x];
    
    // Конвертируем в алгебраическую нотацию
    const fromFile = String.fromCharCode(selectedMove.from.x + 97);
    const toFile = String.fromCharCode(selectedMove.to.x + 97);
    const toRank = 8 - selectedMove.to.y;
    
    const isCapture = board.cells[selectedMove.to.y][selectedMove.to.x].figure !== null;
    
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
    
    console.log(`Basic AI selected: ${moveNotation}`);

    return res.status(200).json({
      success: true,
      move: moveNotation,
      model: 'basic-ai',
      message: `Basic AI move for ${currentColor}`
    });

  } catch (error) {
    console.error('Basic AI Error:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}
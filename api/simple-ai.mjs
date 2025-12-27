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
    console.log('Request received:', { currentColor, hasBoard: !!board });

    // Ищем взятия на доске
    const findCaptures = (board, color) => {
      const captures = [];
      const targetColor = color === 'BLACK' ? 'WHITE' : 'BLACK';
      
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const fromCell = board.cells[y][x];
          if (fromCell.figure && fromCell.figure.color === color) {
            
            for (let ty = 0; ty < 8; ty++) {
              for (let tx = 0; tx < 8; tx++) {
                const toCell = board.cells[ty][tx];
                if (toCell.figure && toCell.figure.color === targetColor) {
                  // Проверяем может ли фигура взять
                  if (fromCell.figure.canMove(toCell)) {
                    const captureNotation = convertMoveToNotation(fromCell, toCell, board);
                    captures.push(captureNotation);
                  }
                }
              }
            }
          }
        }
      }
      return captures;
    };

    // Конвертируем ход в алгебраическую нотацию
    const convertMoveToNotation = (from, to, board) => {
      const piece = from.figure.name;
      const pieceNotation = {
        'Король': 'K',
        'Ферзь': 'Q',
        'Ладья': 'R', 
        'Слон': 'B',
        'Конь': 'N',
        'Пешка': ''
      }[piece];
      
      const fromFile = String.fromCharCode(from.x + 97);
      const toFile = String.fromCharCode(to.x + 97);
      const toRank = 8 - to.y;
      
      if (piece === 'Пешка') {
        // Взятие пешкой
        return `${fromFile}x${toFile}${toRank}`;
      } else {
        // Взятие фигурой
        return `${pieceNotation}${fromFile}x${toFile}${toRank}`;
      }
    };

    // Ищем взятия
    const captures = findCaptures(board, currentColor);
    
    // Если есть взятия, приоритет им (70% шанс)
    if (captures.length > 0 && Math.random() < 0.7) {
      const randomCapture = captures[Math.floor(Math.random() * captures.length)];
      console.log(`Found capture move: ${randomCapture}`);
      return res.status(200).json({
        success: true,
        move: randomCapture,
        model: 'simple-ai-capture',
        usage: null,
        message: `Simple AI capture move for ${currentColor}`
      });
    }

    // Иначе обычные ходы
    const simpleMoves = {
      'BLACK': ['e5', 'd5', 'Nf6', 'Nc6', 'Bc5', 'Bb4', 'g6', 'b6'],
      'WHITE': ['e4', 'd4', 'Nf3', 'Nc3', 'Bc4', 'Bb5', 'g3', 'b3']
    };

    const availableMoves = simpleMoves[currentColor] || [];
    const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];

    console.log(`Selected move for ${currentColor}: ${randomMove}`);

    return res.status(200).json({
      success: true,
      move: randomMove,
      model: 'simple-ai',
      usage: null,
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
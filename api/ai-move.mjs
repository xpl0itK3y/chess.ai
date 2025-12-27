import { OpenAI } from 'openai';

export default async function handler(req, res) {
  // CORS headers
  const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? ['https://chess-ai-xpl0itk3y.vercel.app', 'https://your-vercel-app.vercel.app']
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
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ 
        success: false, 
        error: 'OpenAI API key not configured' 
      });
    }

    const { board, currentColor } = req.body;

    if (!board || !currentColor) {
      return res.status(400).json({ 
        success: false, 
        error: 'Board and currentColor are required' 
      });
    }

    const openaiClient = new OpenAI({
      apiKey: apiKey,
    });

    // Конвертируем доску в FEN нотацию для лучшего понимания
    const boardToFen = (board) => {
      let fen = '';
      for (let y = 0; y < 8; y++) {
        let emptyCount = 0;
        for (let x = 0; x < 8; x++) {
          const cell = board.cells[y][x];
          if (cell.figure) {
            if (emptyCount > 0) {
              fen += emptyCount;
              emptyCount = 0;
            }
            const piece = cell.figure.name;
            const color = cell.figure.color === 'WHITE' ? 'w' : 'b';
            
            // Unicode символы для фигур в FEN
            const pieceMap = {
              'Король': color === 'w' ? 'K' : 'k',
              'Ферзь': color === 'w' ? 'Q' : 'q', 
              'Ладья': color === 'w' ? 'R' : 'r',
              'Слон': color === 'w' ? 'B' : 'b',
              'Конь': color === 'w' ? 'N' : 'n',
              'Пешка': color === 'w' ? 'P' : 'p'
            };
            fen += pieceMap[piece] || '';
          } else {
            emptyCount++;
          }
        }
        if (emptyCount > 0) {
          fen += emptyCount;
        }
        if (y < 7) fen += '/';
      }
      return fen;
    };

    const fenBoard = boardToFen(board);
    const playerColor = currentColor === 'BLACK' ? 'черных' : 'белых';

    const prompt = `Ты - шахматный мастер. Анализируй позицию и сделай лучший ход для ${playerColor}.

Доска в FEN нотации: ${fenBoard}
Текущий ход: ${playerColor}

Правила:
1. Верни только ход в алгебраической нотации (например: "e4", "Nf3", "O-O")
2. Ход должен быть легальным и безопасным
3. Предпочитай развивающие и атакующие ходы
4. Защищайся от угроз если нужно
5. Не пиши объяснений, только ход

Возможные форматы:
- Пешка: e4, d5, a3
- Конь: Nf3, Nc6, Bxe5
- Ладья: Ra1, Rd8, Rxf7
- Слон: Bc4, Be6, Bxb5
- Ферзь: Qh5, Qd1, Qxh7
- Король: Ke2, Kg8, O-O, O-O-O

Лучший ход для ${playerColor}:`;

    const response = await openaiClient.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Ты шахматный эксперт. Отвечай только одним ходом в алгебраической нотации без объяснений."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 10,
      temperature: 0.7,
    });

    const aiMove = response.choices[0].message.content?.trim();

    if (!aiMove) {
      return res.status(500).json({
        success: false,
        error: 'AI failed to generate a move'
      });
    }

    // Валидация формата хода
    const validMovePattern = /^[KQRBN]?[a-h][1-8](x[a-h][1-8])?([+#=][QRBN])?$|^O-O(-O)?$/i;
    
    if (!validMovePattern.test(aiMove)) {
      return res.status(500).json({
        success: false,
        error: 'Invalid move format generated',
        aiMove: aiMove
      });
    }

    return res.status(200).json({
      success: true,
      move: aiMove,
      fen: fenBoard,
      model: response.model,
      usage: response.usage
    });

  } catch (error) {
    console.error('AI Move Error:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      details: error.response?.data || 'No additional details'
    });
  }
}
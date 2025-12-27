import { OpenAI } from 'openai';

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
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ 
        success: false, 
        error: 'OpenAI API key not configured' 
      });
    }

    console.log('Request body:', req.body);
    const { board, currentColor } = req.body;

    if (!board || !currentColor) {
      console.log('Missing required data:', { board: !!board, currentColor });
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
      return fen + ' ' + (currentColor === 'BLACK' ? 'b' : 'w') + ' - - 0 1';
    };

    const fenBoard = boardToFen(board);
    const playerColor = currentColor === 'BLACK' ? 'черных' : 'белых';

    console.log(`FEN: ${fenBoard}`);
    console.log(`Player: ${playerColor}`);

// Анализ позиции для гроссмейстера
    const analyzePosition = (fen, player) => {
      return `
АНАЛИЗ ПОЗИЦИИ ГРОССМЕЙСТЕРА:
FEN: ${fen}
Ход: ${player === 'черных' ? 'ЧЕРНЫХ' : 'БЕЛЫХ'}

КЛЮЧЕВЫЕ ФАКТОРЫ:
1. 🧠 МАТЕРИАЛЬНЫЙ ПРЕИМУЩЕСТВО - оценивай баланс фигур
2. ⚡ АКТИВНОСТЬ ФИГУР - централизация, мобильность
3. 👑 БЕЗОПАСНОСТЬ КОРОЛЯ - слабые поля, угрозы мата
4. 🏗️ ПЕШЕЧНАЯ СТРУКТУРА - проходные, изолированные, сдвоенные
5. 🎯 ПОЗИЦИОННЫЙ САКЖИМ - контроль центра, открытые линии

СТРАТЕГИЧЕСКИЕ ПРИОРИТЕТЫ:
🔥 ВЫСШИЙ ПРИОРИТЕТ:
- МАТОВЫЕ АТАКИ на не защищенного короля
- ВЗЯТИЕ фигуры с преимущественным обменом
- ДВОЙНЫЕ УДАРЫ и вилки

⚡ СРЕДНИЙ ПРИОРИТЕТ:  
- РАЗВИТИЕ НЕАКТИВНЫХ фигур
- ЗАХВАТ ЦЕНТРА и контроль ключевых полей
- СОЗДАНИЕ УГРОЗ фигурам противника

🛡️ НИЗКИЙ ПРИОРИТЕТ:
- ПРОСТОЕ РАЗВИТИЕ без конкретной цели
- ПАССИВНАЯ ЗАЩИТА
- РОКИРОВКА (если нет немедленных угроз)

ТАКТИЧЕСКИЕ МОТИВЫ:
🎯 ВИЛКА: нападение на две фигуры одновременно  
⚔️ СВЯЗКА: ограничение движения фигуры
🔪 ОТКРЫТАЯ АТАКА: нападение через фигуру
🎪 ДВОЙНОЙ ШАХ: максимальная угроза королю

СДЕЛАЙ ЛУЧШИЙ ХОД как гроссмейстер:
`;
    };

    const prompt = analyzePosition(fenBoard, currentColor) + `

Ход: `;

    console.log('Sending to OpenAI:', prompt);
    
    let response;
    try {
      console.log('Sending to OpenAI:', prompt);
      
      response = await openaiClient.chat.completions.create({
        model: "gpt-4", // Улучшенная модель
        messages: [
          {
            role: "system",
            content: "Ты - гроссмейстер с рейтингом 2850+. Анализируй позицию на глубину 8-10 ходов вперед. Учитывай: 1) Матовые комбинации 2) Тактические удары (вилки, связки, двойные удары) 3) Позиционное преимущество 4) Эндшпильную технику 5) Психологию противника. Приоритет - форсированные варианты и матовые атаки. Отвечай только одним лучшим ходом в алгебраической нотации."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 20,
        temperature: 0.2, // Минимум случайности
      });
      
      console.log('OpenAI response:', response);
    } catch (openaiError) {
      console.error('OpenAI API Error:', openaiError);
      
      // Fallback to simple moves
      const fallbackMoves = currentColor === 'BLACK' 
        ? ['e5', 'd5', 'Nf6', 'Nc6', 'Bc5', 'Bb4']
        : ['e4', 'd4', 'Nf3', 'Nc3', 'Bc4', 'Bb5'];
      
      const randomMove = fallbackMoves[Math.floor(Math.random() * fallbackMoves.length)];
      console.log('Using fallback move:', randomMove);
      
      return res.status(200).json({
        success: true,
        move: randomMove,
        model: 'fallback',
        usage: null
      });
    }
    
    console.log('OpenAI response:', response);

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
    console.error('Error stack:', error.stack);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      details: error.response?.data || 'No additional details',
      stack: error.stack
    });
  }
}
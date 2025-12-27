import axios from 'axios';
import { Board } from '../models/Board';
import { Colors } from '../models/Colors';

export interface AIMoveResult {
  success: boolean;
  move?: string;
  error?: string;
  from?: { x: number; y: number };
  to?: { x: number; y: number };
  promotion?: string;
}

/**
 * Конвертирует алгебраическую нотацию в координаты
 */
export function parseAlgebraicMove(move: string, board: Board): AIMoveResult {
  try {
    console.log(`Parsing move: ${move}`);
    
    // Обработка рокировки
    if (move === 'O-O') { // короткая рокировка
      const kingRow = board.findKing(Colors.BLACK)?.y || 0;
      console.log(`Castling short: from (4,${kingRow}) to (6,${kingRow})`);
      
      // Проверяем что рокировка легальна
      const kingCell = board.getCell(4, kingRow);
      const rookCell = board.getCell(7, kingRow);
      
      if (!kingCell?.figure || !rookCell?.figure) {
        return { success: false, error: 'Castling: missing pieces' };
      }
      
      const castlingMove = {
        success: true,
        from: { x: 4, y: kingRow },
        to: { x: 6, y: kingRow }
      };
      
      // Проверяем что король может сделать рокировку
      const targetCell = board.getCell(6, kingRow);
      if (!kingCell.figure.canMove(targetCell)) {
        return { success: false, error: 'Castling move not legal' };
      }
      
      return castlingMove;
    }
    
    if (move === 'O-O-O') { // длинная рокировка
      const kingRow = board.findKing(Colors.BLACK)?.y || 0;
      console.log(`Castling long: from (4,${kingRow}) to (2,${kingRow})`);
      
      // Проверяем что рокировка легальна
      const kingCell = board.getCell(4, kingRow);
      const rookCell = board.getCell(0, kingRow);
      
      if (!kingCell?.figure || !rookCell?.figure) {
        return { success: false, error: 'Castling: missing pieces' };
      }
      
      const castlingMove = {
        success: true,
        from: { x: 4, y: kingRow },
        to: { x: 2, y: kingRow }
      };
      
      // Проверяем что король может сделать рокировку
      const targetCell = board.getCell(2, kingRow);
      if (!kingCell.figure.canMove(targetCell)) {
        return { success: false, error: 'Castling move not legal' };
      }
      
      return castlingMove;
    }

    // Проверяем на очевидно неправильные ходы для черных
    const blackInvalidMoves = ['e4', 'd4', 'f4', 'c4', 'Bc4', 'Nf3', 'Nc3', 'Bb5', 'Qh5'];
    if (blackInvalidMoves.includes(move)) {
      console.log(`Invalid move for black pieces: ${move}`);
      return {
        success: false,
        error: `Invalid move for black pieces: ${move}. Black cannot move to white starting positions.`
      };
    }

    // Парсинг обычных ходов (например: "e4", "Nf3", "Bxe5", "Qh5+")
    const captureMatch = move.match(/^([KQRBN])?([a-h])([1-8])?x([a-h])([1-8])([=][QRBN])?([+#])?$/);
    const normalMatch = move.match(/^([KQRBN])?([a-h])([1-8])([=][QRBN])?([+#])?$/);
    const pawnCaptureMatch = move.match(/^([a-h])x([a-h])([1-8])([=][QRBN])?([+#])?$/);
    
    let from: { x: number; y: number } | null = null;
    let to: { x: number; y: number } | null = null;
    let promotion: string | undefined;

    if (captureMatch) {
      // Ход со взятием (например: "Nxe5", "Bxc4")
      const piece = captureMatch[1];
      const disambiguation = captureMatch[2]; // Может быть undefined для простых взятий
      to = { x: captureMatch[3].charCodeAt(0) - 97, y: 8 - parseInt(captureMatch[4]) };
      promotion = captureMatch[5]?.replace('=', '');
      
      // Если есть дизамбигуация (например: "Nbxd4"), используем ее
      if (disambiguation && captureMatch[2].length === 1) {
        from = findPiecePosition(piece || 'P', to, board, disambiguation);
      } else {
        from = findPiecePosition(piece || 'P', to, board);
      }
      
      console.log(`Parsing capture: ${move}, piece: ${piece || 'P'}, from: ${from}, to: (${to.x},${to.y})`);
    } else if (normalMatch) {
      // Обычный ход (например: "e4", "Nf3")
      const piece = normalMatch[1];
      to = { x: normalMatch[2].charCodeAt(0) - 97, y: 8 - parseInt(normalMatch[3]) };
      promotion = normalMatch[4]?.replace('=', '');
      from = findPiecePosition(piece || 'P', to, board);
    } else if (pawnCaptureMatch) {
      // Взятие пешкой (например: "dxe5")
      to = { x: pawnCaptureMatch[2].charCodeAt(0) - 97, y: 8 - parseInt(pawnCaptureMatch[3]) };
      promotion = pawnCaptureMatch[4]?.replace('=', '');
      from = findPiecePosition('P', to, board, pawnCaptureMatch[1]);
    } else {
      // Простая нотация поля (например: "e4")
      const simpleMatch = move.match(/^([a-h])([1-8])$/);
      if (simpleMatch) {
        to = { x: simpleMatch[1].charCodeAt(0) - 97, y: 8 - parseInt(simpleMatch[2]) };
        console.log(`Simple move to: (${to.x},${to.y})`);
        
        // Сначала пробуем как ход пешки (самый частый случай)
        from = findPiecePosition('P', to, board);
        if (!from) {
          console.log("No pawn found, searching for any piece...");
          // Ищем любую фигуру, которая может сделать этот ход
          from = findAnyPieceForMove(to, board);
        }
        
        // Если все еще не нашли, проверяем есть ли вообще фигуры на доске
        if (!from) {
          console.log("Debug: listing all black pieces that can move:");
          for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
              const cell = board.getCell(x, y);
              if (cell.figure && cell.figure.color === Colors.BLACK) {
                // Проверяем может ли фигура вообще ходить
                const targetCell = board.getCell(to.x, to.y);
                if (cell.figure.canMove(targetCell)) {
                  console.log(`✓ ${cell.figure.name} at (${x},${y}) CAN move to (${to.x},${to.y})`);
                } else {
                  console.log(`✗ ${cell.figure.name} at (${x},${y}) CANNOT move to (${to.x},${to.y})`);
                }
              }
            }
          }
        }
        
        if (!from) {
          console.log(`No piece found that can move to (${to.x},${to.y})`);
        }
      } else {
        return { success: false, error: `Invalid move format: ${move}` };
      }
    }

    if (!from || !to) {
      return { success: false, error: `Could not find piece for move: ${move}` };
    }

    return {
      success: true,
      from,
      to,
      promotion
    };
  } catch (error) {
    return { 
      success: false, 
      error: `Error parsing move ${move}: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

/**
 * Находит позицию фигуры для хода
 */
function findPiecePosition(piece: string, target: { x: number; y: number }, board: Board, disambiguation?: string): { x: number; y: number } | null {
  const pieceMap: { [key: string]: string } = {
    'K': 'Король',
    'Q': 'Ферзь', 
    'R': 'Ладья',
    'B': 'Слон',
    'N': 'Конь',
    'P': 'Пешка'
  };

  const pieceName = pieceMap[piece] || 'Пешка';
  const candidates: { x: number; y: number }[] = [];

  // Ищем все фигуры нужного типа, которые могут пойти на target
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const cell = board.getCell(x, y);
      if (cell.figure && 
          cell.figure.name === pieceName && 
          cell.figure.color === Colors.BLACK) {
        
        if (cell.figure.canMove(board.getCell(target.x, target.y))) {
          candidates.push({ x, y });
        }
      }
    }
  }

  // Применяем дизамбигуацию если есть (например: "Nbd2" - конь с линии b)
  if (disambiguation) {
    const filtered = candidates.filter(c => {
      const file = String.fromCharCode(c.x + 97);
      return file === disambiguation;
    });
    if (filtered.length === 1) return filtered[0];
  }

  // Если только один кандидат - выбираем его
  if (candidates.length === 1) return candidates[0];

  // Если несколько кандидатов - выбираем первый (можно улучшить логику)
  return candidates[0] || null;
}

/**
 * Находит любую фигуру, которая может сделать ход на целевую клетку
 */
function findAnyPieceForMove(target: { x: number; y: number }, board: Board): { x: number; y: number } | null {
  const candidates: { x: number; y: number }[] = [];

  // Ищем любую черную фигуру, которая может пойти на target
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const cell = board.getCell(x, y);
      if (cell.figure && cell.figure.color === Colors.BLACK) {
        if (cell.figure.canMove(board.getCell(target.x, target.y))) {
          candidates.push({ x, y });
          console.log(`Found candidate: ${cell.figure.name} at (${x},${y}) can move to (${target.x},${target.y})`);
        }
      }
    }
  }

  console.log(`Total candidates found: ${candidates.length}`);

  // Если только один кандидат - выбираем его
  if (candidates.length === 1) return candidates[0];

  // Если несколько кандидатов - выбираем наиболее подходящую фигуру
  if (candidates.length > 1) {
    // Приоритет: пешки > кони > слоны > ладьи > ферзь > король
    const priority = ['Пешка', 'Конь', 'Слон', 'Ладья', 'Ферзь', 'Король'];
    for (const pieceName of priority) {
      const piece = candidates.find(c => {
        const cell = board.getCell(c.x, c.y);
        return cell.figure?.name === pieceName;
      });
      if (piece) {
        console.log(`Selected priority piece: ${pieceName}`);
        return piece;
      }
    }
    return candidates[0];
  }

  return null;
}

/**
 * Получает ход от AI
 */
export async function getAIMove(board: Board, currentColor: Colors, difficulty: 'easy' | 'hard' = 'hard'): Promise<AIMoveResult> {
  console.log(`Getting ${difficulty} AI move for ${currentColor}`);
  try {
    console.log(`Getting AI move for ${currentColor}`);
    
    const boardData = {
      cells: board.cells.map(row => 
        row.map(cell => ({
          x: cell.x,
          y: cell.y,
          figure: cell.figure ? {
            name: cell.figure.name,
            color: cell.figure.color
          } : null
        }))
      ),
      lostBlackFigures: board.lostBlackFigures,
      lostWhiteFigures: board.lostWhiteFigures
    };

    // Легкий режим - только простой AI
    if (difficulty === 'easy') {
      try {
        const simpleResponse = await axios.post('/api/simple-ai', {
          board: boardData,
          currentColor: currentColor
        });

        if (simpleResponse.data.success && simpleResponse.data.move) {
          const parsedMove = parseAlgebraicMove(simpleResponse.data.move, board);
          console.log("Simple AI response:", simpleResponse.data);
          
          if (parsedMove.success) {
            return parsedMove;
          }
        }
      } catch (simpleError: any) {
        console.log("Simple AI failed:", simpleError.message);
      }
    }

    // Сложный режим - умный AI + OpenAI GPT-4
    if (difficulty === 'hard') {
      // 1. Сначала пробуем умный AI (самый сильный)
      try {
        const smartResponse = await axios.post('/api/smart-ai', {
          board: boardData,
          currentColor: currentColor
        });

        if (smartResponse.data.success && smartResponse.data.move) {
          const parsedMove = parseAlgebraicMove(smartResponse.data.move, board);
          console.log("Smart AI response:", smartResponse.data);
          
          if (parsedMove.success) {
            return parsedMove;
          }
        }
      } catch (smartError: any) {
        console.log("Smart AI failed:", smartError.message);
      }

      // 2. Пробуем OpenAI GPT-4 (гроссмейстер)
      try {
        const openaiResponse = await axios.post('/api/ai-move', {
          board: boardData,
          currentColor: currentColor
        });

        if (openaiResponse.data.success && openaiResponse.data.move) {
          const parsedMove = parseAlgebraicMove(openaiResponse.data.move, board);
          console.log("OpenAI GPT-4 response:", openaiResponse.data);
          
          if (parsedMove.success) {
            return parsedMove;
          }
        }
      } catch (openaiError: any) {
        console.log("OpenAI GPT-4 failed:", openaiError.message);
      }
    }

    // 4. Локальный fallback - самый надежный
    console.log("All APIs failed, using local fallback...");
    return getRandomBlackMove(board);

  } catch (error: any) {
    console.error("Network error, using local fallback:", error.message);
    return getRandomBlackMove(board);
  }
}

/**
   * Fallback функция - выбирает случайный легальный ход для черных
   */
function getRandomBlackMove(board: Board): AIMoveResult {
  const possibleMoves: { from: { x: number; y: number }, to: { x: number; y: number }, isCapture: boolean }[] = [];
  
  // Ищем все возможные ходы для черных фигур
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const fromCell = board.getCell(x, y);
      if (fromCell.figure && fromCell.figure.color === Colors.BLACK) {
        
        // Проверяем все возможные цели
        for (let ty = 0; ty < 8; ty++) {
          for (let tx = 0; tx < 8; tx++) {
            const toCell = board.getCell(tx, ty);
            if (fromCell.figure.canMove(toCell) && board.isMoveLegal(fromCell, toCell)) {
              const isCapture = toCell.figure !== null;
              possibleMoves.push({
                from: { x, y },
                to: { x: tx, y: ty },
                isCapture
              });
            }
          }
        }
      }
    }
  }
  
  if (possibleMoves.length === 0) {
    return {
      success: false,
      error: 'No legal moves found'
    };
  }
  
  // Приоритет взятиям (70% шанс если есть взятия)
  const captures = possibleMoves.filter(move => move.isCapture);
  const nonCaptures = possibleMoves.filter(move => !move.isCapture);
  
  let selectedMove;
  if (captures.length > 0 && Math.random() < 0.7) {
    selectedMove = captures[Math.floor(Math.random() * captures.length)];
    console.log(`Fallback: selected CAPTURE from (${selectedMove.from.x},${selectedMove.from.y}) to (${selectedMove.to.x},${selectedMove.to.y})`);
  } else {
    selectedMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    console.log(`Fallback: selected move from (${selectedMove.from.x},${selectedMove.from.y}) to (${selectedMove.to.x},${selectedMove.to.y})`);
  }
  
  return {
    success: true,
    from: selectedMove.from,
    to: selectedMove.to
  };
}
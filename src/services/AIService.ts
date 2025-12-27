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
export async function getAIMove(board: Board, currentColor: Colors): Promise<AIMoveResult> {
  try {
    console.log(`Getting AI move for ${currentColor}`);
    
    const boardData = {
      cells: board.cells.map(row => 
        row.map(cell => ({
          x: cell.x,
          y: cell.y,
          figure: cell.figure ? {
            name: cell.figure.name,
            color: cell.figure.color,
            logo: cell.figure.logo
          } : null
        }))
      ),
      lostBlackFigures: board.lostBlackFigures,
      lostWhiteFigures: board.lostWhiteFigures
    };

    // Сначала пробуем простой AI
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

    // Если простой AI не сработал, пробуем полный AI
    const response = await axios.post('/api/ai-move', {
      board: boardData,
      currentColor: currentColor
    });

    console.log('Full AI response:', response.data);

    if (response.data.success && response.data.move) {
      const parsedMove = parseAlgebraicMove(response.data.move, board);
      
      // Если AI дал плохой ход, пробуем fallback
      if (!parsedMove.success && currentColor === Colors.BLACK) {
        console.log("AI gave invalid move, trying fallback...");
        return getRandomBlackMove(board);
      }
      
      return parsedMove;
    } else {
      // Если API упал, пробуем локальный fallback
      console.log("API failed, using local fallback...");
      return getRandomBlackMove(board);
    }
  } catch (error: any) {
    console.error("Network error, using local fallback:", error.message);
    // Если упал сетевой запрос, используем локальный fallback
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
            if (fromCell.figure.canMove(toCell)) {
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
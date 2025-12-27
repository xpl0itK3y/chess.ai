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
    // Обработка рокировки
    if (move === 'O-O') { // короткая рокировка
      const kingRow = board.findKing(Colors.BLACK)?.y || 0;
      return {
        success: true,
        from: { x: 4, y: kingRow },
        to: { x: 6, y: kingRow }
      };
    }
    
    if (move === 'O-O-O') { // длинная рокировка
      const kingRow = board.findKing(Colors.BLACK)?.y || 0;
      return {
        success: true,
        from: { x: 4, y: kingRow },
        to: { x: 2, y: kingRow }
      };
    }

    // Парсинг обычных ходов (например: "e4", "Nf3", "Bxe5", "Qh5+")
    const captureMatch = move.match(/^([KQRBN])?([a-h])([1-8])x([a-h])([1-8])([=][QRBN])?([+#])?$/);
    const normalMatch = move.match(/^([KQRBN])?([a-h])([1-8])([=][QRBN])?([+#])?$/);
    const pawnCaptureMatch = move.match(/^([a-h])x([a-h])([1-8])([=][QRBN])?([+#])?$/);
    
    let from: { x: number; y: number } | null = null;
    let to: { x: number; y: number } | null = null;
    let promotion: string | undefined;

    if (captureMatch) {
      // Ход со взятием (например: "Nf3xe5")
      const piece = captureMatch[1];
      to = { x: captureMatch[4].charCodeAt(0) - 97, y: 8 - parseInt(captureMatch[5]) };
      promotion = captureMatch[6]?.replace('=', '');
      from = findPiecePosition(piece || 'P', to, board);
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
        from = findPiecePosition('P', to, board);
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
 * Получает ход от AI
 */
export async function getAIMove(board: Board, currentColor: Colors): Promise<AIMoveResult> {
  try {
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

    const apiUrl = process.env.NODE_ENV === 'production' 
      ? '/api/ai-move' 
      : 'http://localhost:3000/api/ai-move';

    const response = await axios.post(apiUrl, {
      board: boardData,
      currentColor: currentColor
    });

    if (response.data.success && response.data.move) {
      const parsedMove = parseAlgebraicMove(response.data.move, board);
      return parsedMove;
    } else {
      return {
        success: false,
        error: response.data.error || 'AI failed to generate move'
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to get AI move'
    };
  }
}
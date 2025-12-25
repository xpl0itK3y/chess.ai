/**
 * Класс шахматной доски
 * 
 * Управляет состоянием доски, включая:
 * - Расположение всех клеток
 * - Сбитые фигуры
 * - Расстановку фигур в начале игры
 * - Подсветку доступных ходов
 * - Проверку шаха и мата
 */
import { Cell } from "./Cell";
import { Colors } from "./Colors";
import { Pawn } from "./figures/Pawn";
import { King } from "./figures/King";
import { Queen } from "./figures/Queen";
import { Bishop } from "./figures/Bishop";
import { Knight } from "./figures/Knight";
import { Rook } from "./figures/Rook";
import { Figure, FigureNames } from "./figures/Figure";

export class Board {
  // Двумерный массив клеток 8x8
  cells: Cell[][] = []
  // Массив сбитых черных фигур
  lostBlackFigures: Figure[] = []
  // Массив сбитых белых фигур
  lostWhiteFigures: Figure[] = []
  // Последняя пешка, которая сделала ход на 2 клетки (для en passant)
  lastMovedPawn: Pawn | null = null

  /**
   * Инициализирует клетки доски
   * 
   * Создает доску 8x8 с чередующимися черными и белыми клетками
   * Используется формула (x + y) % 2 для определения цвета клетки
   */
  public initCells() {
    for (let i = 0; i < 8; i++) {
      const row: Cell[] = []
      for (let j = 0; j < 8; j++) {
        if ((i + j) % 2 !== 0) {
          // Черные клетки (темные)
          row.push(new Cell(this, j, i, Colors.BLACK, null))
        } else {
          // Белые клетки (светлые)
          row.push(new Cell(this, j, i, Colors.WHITE, null))
        }
      }
      this.cells.push(row);
    }
  }

  /**
   * Создает копию доски
   * 
   * @returns Новая доска с тем же состоянием клеток и сбитых фигур
   */
  public getCopyBoard(): Board {
    const newBoard = new Board();
    newBoard.cells = this.cells;
    newBoard.lostWhiteFigures = this.lostWhiteFigures
    newBoard.lostBlackFigures = this.lostBlackFigures
    newBoard.lastMovedPawn = this.lastMovedPawn
    return newBoard;
  }

  /**
   * Подсветка доступных для хода клеток
   * 
   * Проходит по всем клеткам доски и устанавливает флаг available
   * для тех клеток, куда может переместиться фигура из selectedCell
   * 
   * @param selectedCell Выбранная клетка с фигурой
   */
  public highlightCells(selectedCell: Cell | null) {
    for (let i = 0; i < this.cells.length; i++) {
      const row = this.cells[i];
      for (let j = 0; j < row.length; j++) {
        const target = row[j];
        // Проверяем, может ли фигура переместиться на эту клетку
        // и не оставит ли это короля под шахом
        target.available = !!selectedCell?.figure?.canMove(target) &&
          this.isMoveLegal(selectedCell, target);
      }
    }
  }

  /**
   * Проверяет, является ли ход легальным (не оставляет короля под шахом)
   */
  public isMoveLegal(from: Cell, to: Cell): boolean {
    const figure = from.figure;
    if (!figure) return false;

    // Сохраняем текущее состояние
    const targetFigure = to.figure;
    const originalCell = figure.cell;

    // Симулируем ход
    to.figure = figure;
    figure.cell = to;
    from.figure = null;

    // Проверяем, под шахом ли король
    const isUnderAttack = this.isKingUnderAttack(figure.color);

    // Восстанавливаем состояние
    from.figure = figure;
    figure.cell = originalCell;
    to.figure = targetFigure;

    return !isUnderAttack;
  }

  /**
   * Получает клетку по координатам
   * 
   * @param x Координата по горизонтали (0-7)
   * @param y Координата по вертикали (0-7)
   * @returns Клетка с указанными координатами
   */
  public getCell(x: number, y: number) {
    return this.cells[y][x]
  }

  /**
   * Находит короля указанного цвета
   */
  public findKing(color: Colors): Cell | null {
    for (let i = 0; i < this.cells.length; i++) {
      for (let j = 0; j < this.cells[i].length; j++) {
        const cell = this.cells[i][j];
        if (cell.figure?.name === FigureNames.KING && cell.figure.color === color) {
          return cell;
        }
      }
    }
    return null;
  }

  /**
   * Проверяет, находится ли король под шахом
   */
  public isKingUnderAttack(color: Colors): boolean {
    const kingCell = this.findKing(color);
    if (!kingCell) return false;
    return this.isCellUnderAttack(kingCell, color);
  }

  /**
   * Проверяет, атакуется ли клетка фигурами противника
   */
  public isCellUnderAttack(cell: Cell, defenderColor: Colors): boolean {
    for (let i = 0; i < this.cells.length; i++) {
      for (let j = 0; j < this.cells[i].length; j++) {
        const currentCell = this.cells[i][j];
        const figure = currentCell.figure;

        if (figure && figure.color !== defenderColor) {
          // Для короля проверяем только соседние клетки (избегаем рекурсии)
          if (figure.name === FigureNames.KING) {
            const dx = Math.abs(currentCell.x - cell.x);
            const dy = Math.abs(currentCell.y - cell.y);
            if (dx <= 1 && dy <= 1 && (dx > 0 || dy > 0)) {
              return true;
            }
          } else if (figure.canMoveWithoutCheck(cell)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * Проверяет мат
   */
  public isCheckmate(color: Colors): boolean {
    if (!this.isKingUnderAttack(color)) return false;
    return !this.hasAnyLegalMove(color);
  }

  /**
   * Проверяет пат (нет легальных ходов, но не шах)
   */
  public isStalemate(color: Colors): boolean {
    if (this.isKingUnderAttack(color)) return false;
    return !this.hasAnyLegalMove(color);
  }

  /**
   * Проверяет, есть ли хоть один легальный ход
   */
  private hasAnyLegalMove(color: Colors): boolean {
    let movesChecked = 0;
    for (let i = 0; i < this.cells.length; i++) {
      for (let j = 0; j < this.cells[i].length; j++) {
        const cell = this.cells[i][j];
        if (cell.figure && cell.figure.color === color) {
          // Проверяем все возможные ходы этой фигуры
          for (let ti = 0; ti < this.cells.length; ti++) {
            for (let tj = 0; tj < this.cells[ti].length; tj++) {
              const target = this.cells[ti][tj];
              const canMove = cell.figure.canMove(target);
              if (canMove) {
                movesChecked++;
                const isLegal = this.isMoveLegal(cell, target);
                if (isLegal) {
                  // Логируем найденный легальный ход
                  console.log(`Легальный ход найден: ${cell.figure.name} с (${cell.x},${cell.y}) на (${target.x},${target.y})`);
                  return true;
                }
              }
            }
          }
        }
      }
    }
    console.log(`Легальных ходов НЕТ для ${color} - это МАТ или ПАТ! (проверено ${movesChecked} возможных ходов)`);
    return false;
  }

  /**
   * Расставляет пешки на доске
   * Черные пешки на строке 1, белые на строке 6
   */
  private addPawns() {
    for (let i = 0; i < 8; i++) {
      new Pawn(Colors.BLACK, this.getCell(i, 1))
      new Pawn(Colors.WHITE, this.getCell(i, 6))
    }
  }

  /**
   * Расставляет королей на доске
   * Черный король на e1, белый на e8
   */
  private addKings() {
    new King(Colors.BLACK, this.getCell(4, 0))
    new King(Colors.WHITE, this.getCell(4, 7))
  }

  /**
   * Расставляет ферзей на доске
   * Черный ферзь на d1, белый на d8
   */
  private addQueens() {
    new Queen(Colors.BLACK, this.getCell(3, 0))
    new Queen(Colors.WHITE, this.getCell(3, 7))
  }

  /**
   * Расставляет слонов на доске
   * Черные слоны на c1 и f1, белые на c8 и f8
   */
  private addBishops() {
    new Bishop(Colors.BLACK, this.getCell(2, 0))
    new Bishop(Colors.BLACK, this.getCell(5, 0))
    new Bishop(Colors.WHITE, this.getCell(2, 7))
    new Bishop(Colors.WHITE, this.getCell(5, 7))
  }

  /**
   * Расставляет коней на доске
   * Черные кони на b1 и g1, белые на b8 и g8
   */
  private addKnights() {
    new Knight(Colors.BLACK, this.getCell(1, 0))
    new Knight(Colors.BLACK, this.getCell(6, 0))
    new Knight(Colors.WHITE, this.getCell(1, 7))
    new Knight(Colors.WHITE, this.getCell(6, 7))
  }

  /**
   * Расставляет ладьи на доске
   * Черные ладьи на a1 и h1, белые на a8 и h8
   */
  private addRooks() {
    new Rook(Colors.BLACK, this.getCell(0, 0))
    new Rook(Colors.BLACK, this.getCell(7, 0))
    new Rook(Colors.WHITE, this.getCell(0, 7))
    new Rook(Colors.WHITE, this.getCell(7, 7))
  }

  /**
   * Расставляет все фигуры в начальные позиции
   * Вызывает все методы добавления фигур в правильном порядке
   */
  public addFigures() {
    this.addPawns()
    this.addKnights()
    this.addKings()
    this.addBishops()
    this.addQueens()
    this.addRooks()
  }
}

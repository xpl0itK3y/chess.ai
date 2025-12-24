import {Cell} from "./Cell";
import {Colors} from "./Colors";
import {Pawn} from "./figures/Pawn";
import {King} from "./figures/King";
import {Queen} from "./figures/Queen";
import {Bishop} from "./figures/Bishop";
import {Knight} from "./figures/Knight";
import {Rook} from "./figures/Rook";
import {Figure} from "./figures/Figure";

/**
 * Класс шахматной доски
 * Управляет всеми клетками, фигурами и состоянием игры
 */
export class Board {
  cells: Cell[][] = []           // Двумерный массив клеток 8x8
  lostBlackFigures: Figure[] = [] // Съеденные черные фигуры
  lostWhiteFigures: Figure[] = [] // Съеденные белые фигуры

  /**
   * Инициализирует пустую шахматную доску
   * Создает 64 клетки в шахматном порядке
   */
  public initCells() {
    for (let i = 0; i < 8; i++) {        // Проходим по строкам (y)
      const row: Cell[] = []
      for (let j = 0; j < 8; j++) {      // Проходим по колонкам (x)
        // Определяем цвет клетки: если сумма координат нечетная - черная
        if ((i + j) % 2 !== 0) {
          row.push(new Cell(this, j, i, Colors.BLACK, null)) // Черные ячейки
        } else {
          row.push(new Cell(this, j, i, Colors.WHITE, null)) // Белые ячейки
        }
      }
      this.cells.push(row); // Добавляем строку в массив доски
    }
  }

  /**
   * Создает копию доски
   * Нужно для React чтобы он отслеживал изменения состояния
   * @returns новая доска с теми же клетками и фигурами
   */
  public getCopyBoard(): Board {
    const newBoard = new Board();
    // Создаем поверхностную копию массива клеток
    newBoard.cells = this.cells.map(row => [...row]);
    // Копируем массивы съеденных фигур
    newBoard.lostWhiteFigures = [...this.lostWhiteFigures];
    newBoard.lostBlackFigures = [...this.lostBlackFigures];
    return newBoard;
  }

  /**
   * Подсвечивает клетки, куда может пойти выбранная фигура
   * @param selectedCell - выбранная клетка с фигурой
   */
  public highlightCells(selectedCell: Cell | null) {
    // Проходим по всем клеткам доски
    for (let i = 0; i < this.cells.length; i++) {
      const row = this.cells[i];
      for (let j = 0; j < row.length; j++) {
        const target = row[j];
        // Проверяем может ли фигура пойти на эту клетку
        target.available = !!selectedCell?.figure?.canMove(target)
      }
    }
  }

  /**
   * Получает клетку по координатам
   * @param x - координата X (0-7)
   * @param y - координата Y (0-7)
   * @returns клетка с указанными координатами
   */
  public getCell(x: number, y: number) {
    return this.cells[y][x]
  }

  /**
   * Расставляет пешки на доске
   * Черные пешки на строке 1, белые на строке 6
   */
  private addPawns() {
    for (let i = 0; i < 8; i++) {
      new Pawn(Colors.BLACK, this.getCell(i, 1)) // Черные пешки на второй строке
      new Pawn(Colors.WHITE, this.getCell(i, 6)) // Белые пешки на седьмой строке
    }
  }

  /**
   * Расставляет королей на доске
   * Черный король на e1 (4,0), белый на e8 (4,7)
   */
  private addKings() {
    new King(Colors.BLACK, this.getCell(4, 0))
    new King(Colors.WHITE, this.getCell(4, 7))
  }

  /**
   * Расставляет ферзей на доске
   * Черный ферзь на d1 (3,0), белый на d8 (3,7)
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
    new Bishop(Colors.BLACK, this.getCell(2, 0))  // c1
    new Bishop(Colors.BLACK, this.getCell(5, 0))  // f1
    new Bishop(Colors.WHITE, this.getCell(2, 7))  // c8
    new Bishop(Colors.WHITE, this.getCell(5, 7))  // f8
  }

  /**
   * Расставляет коней на доске
   * Черные кони на b1 и g1, белые на b8 и g8
   */
  private addKnights() {
    new Knight(Colors.BLACK, this.getCell(1, 0))  // b1
    new Knight(Colors.BLACK, this.getCell(6, 0))  // g1
    new Knight(Colors.WHITE, this.getCell(1, 7))  // b8
    new Knight(Colors.WHITE, this.getCell(6, 7))  // g8
  }

  /**
   * Расставляет ладьи на доске
   * Черные ладьи на a1 и h1, белые на a8 и h8
   */
  private addRooks() {
    new Rook(Colors.BLACK, this.getCell(0, 0))   // a1
    new Rook(Colors.BLACK, this.getCell(7, 0))   // h1
    new Rook(Colors.WHITE, this.getCell(0, 7))   // a8
    new Rook(Colors.WHITE, this.getCell(7, 7))   // h8
  }

  /**
   * Расставляет все фигуры на доске в начальной позиции
   */
  public addFigures() {
    this.addPawns()      // Сначала пешки
    this.addKnights()     // Затем кони
    this.addKings()       // Короли
    this.addBishops()     // Слоны
    this.addQueens()      // Ферзи
    this.addRooks()       // Ладьи
  }
}

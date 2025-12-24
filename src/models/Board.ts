/**
 * Класс шахматной доски
 * 
 * Управляет состоянием доски, включая:
 * - Расположение всех клеток
 * - Сбитые фигуры
 * - Расстановку фигур в начале игры
 * - Подсветку доступных ходов
 */
import {Cell} from "./Cell";
import {Colors} from "./Colors";
import {Pawn} from "./figures/Pawn";
import {King} from "./figures/King";
import {Queen} from "./figures/Queen";
import {Bishop} from "./figures/Bishop";
import {Knight} from "./figures/Knight";
import {Rook} from "./figures/Rook";
import {Figure} from "./figures/Figure";

export class Board {
  // Двумерный массив клеток 8x8
  cells: Cell[][] = []
  // Массив сбитых черных фигур
  lostBlackFigures: Figure[] = []
  // Массив сбитых белых фигур
  lostWhiteFigures: Figure[] = []

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
        target.available = !!selectedCell?.figure?.canMove(target)
      }
    }
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

  // Зарезервировано для реализации расстановки фигур в стиле Фишера
  // public addFisherFigures() {
  //
  // }

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

import {Colors} from "./Colors";
import {Figure} from "./figures/Figure";
import {Board} from "./Board";

/**
 * Класс шахматной клетки
 * Каждая клетка имеет координаты, цвет и может содержать фигуру
 */
export class Cell {
  readonly x: number;           // Координата X (0-7, слева направо)
  readonly y: number;           // Координата Y (0-7, сверху вниз)
  readonly color: Colors;       // Цвет клетки (белая или черная)
  figure: Figure | null;        // Фигура на клетке (null если пуста)
  board: Board;                 // Ссылка на доску для доступа к другим клеткам
  available: boolean;           // Доступна ли клетка для хода (подсветка)
  id: number;                   // Уникальный ID для React ключей

  /**
   * Создает новую шахматную клетку
   * @param board - доска, которой принадлежит клетка
   * @param x - координата X
   * @param y - координата Y  
   * @param color - цвет клетки
   * @param figure - фигура на клетке (может быть null)
   */
  constructor(board: Board, x: number, y: number, color: Colors, figure: Figure | null) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.figure = figure;
    this.board = board;
    this.available = false;
    this.id = Math.random() // Для React нужны уникальные ключи
  }

  /**
   * Проверяет, пуста ли клетка
   * @returns true если на клетке нет фигуры
   */
  isEmpty(): boolean {
    return this.figure === null;
  }

  /**
   * Проверяет, является ли фигура на целевой клетке врагом
   * @param target - целевая клетка для проверки
   * @returns true если на целевой клетке есть фигура противника
   */
  isEnemy(target: Cell): boolean {
    if (target.figure) {
      return this.figure?.color !== target.figure.color;
    }
    return false;
  }

  /**
   * Проверяет, пуст ли вертикальный путь между двумя клетками
   * Используется для ладьи и ферзя
   * @param target - целевая клетка
   * @returns true если путь свободен
   */
  isEmptyVertical(target: Cell): boolean {
    // Проверяем, что клетки на одной вертикали
    if (this.x !== target.x) {
      return false;
    }

    const min = Math.min(this.y, target.y);
    const max = Math.max(this.y, target.y);
    // Проверяем все клетки между текущей и целевой
    for (let y = min + 1; y < max; y++) {
      if(!this.board.getCell(this.x, y).isEmpty()) {
        return false
      }
    }
    return true;
  }

  /**
   * Проверяет, пуст ли горизонтальный путь между двумя клетками
   * Используется для ладьи и ферзя
   * @param target - целевая клетка
   * @returns true если путь свободен
   */
  isEmptyHorizontal(target: Cell): boolean {
    // Проверяем, что клетки на одной горизонтали
    if (this.y !== target.y) {
      return false;
    }

    const min = Math.min(this.x, target.x);
    const max = Math.max(this.x, target.x);
    // Проверяем все клетки между текущей и целевой
    for (let x = min + 1; x < max; x++) {
      if(!this.board.getCell(x, this.y).isEmpty()) {
        return false
      }
    }
    return true;
  }

  /**
   * Проверяет, пуст ли диагональный путь между двумя клетками
   * Используется для слона и ферзя
   * @param target - целевая клетка
   * @returns true если путь свободен
   */
  isEmptyDiagonal(target: Cell): boolean {
    const absX = Math.abs(target.x - this.x);
    const absY = Math.abs(target.y - this.y);
    // Проверяем, что клетки на одной диагонали (разница координат одинакова)
    if(absY !== absX)
      return false;

    // Определяем направление движения по диагонали
    const dy = this.y < target.y ? 1 : -1
    const dx = this.x < target.x ? 1 : -1

    // Проверяем все клетки на пути по диагонали
    for (let i = 1; i < absY; i++) {
      if(!this.board.getCell(this.x + dx*i, this.y + dy * i).isEmpty())
        return false;
    }
    return true;
  }

  /**
   * Размещает фигуру на клетке
   * Также обновляет ссылку на клетку в самой фигуре
   * @param figure - фигура для размещения
   */
  setFigure(figure: Figure) {
    this.figure = figure;
    this.figure.cell = this; // Фигура должна знать где она стоит
  }

  /**
   * Добавляет съеденную фигуру в список потерянных
   * @param figure - съеденная фигура
   */
  addLostFigure(figure: Figure) {
    figure.color === Colors.BLACK
      ? this.board.lostBlackFigures.push(figure)
      : this.board.lostWhiteFigures.push(figure)
  }

  /**
   * Перемещает фигуру с текущей клетки на целевую
   * @param target - клетка куда нужно переместить фигуру
   */
  moveFigure(target: Cell) {
    // Проверяем что есть фигура и она может сделать такой ход
    if(this.figure && this.figure?.canMove(target)) {
      this.figure.moveFigure(target) // Вызываем метод moveFigure самой фигуры
      if (target.figure) {
        console.log(target.figure) // Логируем съеденную фигуру (можно убрать)
        this.addLostFigure(target.figure); // Добавляем съеденную фигуру в список потерянных
      }
      target.setFigure(this.figure); // Размещаем фигуру на новой клетке
      this.figure = null; // Очищаем текущую клетку
    }
  }
}

import logo from '../../assets/black-king.png'
import {Colors} from "../Colors";
import {Cell} from "../Cell";

/**
 * Перечисление названий шахматных фигур
 * Используется для идентификации типа фигуры
 */
export enum FigureNames {
  FIGURE = "Фигура",    // Базовый тип для всех фигур
  KING = "Король",      // Король
  KNIGHT = "Конь",      // Конь (лошадь)
  PAWN = "Пешка",       // Пешка
  QUEEN = "Ферзь",      // Ферзь (королева)
  ROOK = "Ладья",       // Ладья
  BISHOP = "Слон",      // Слон (офицер)
}

/**
 * Базовый класс для всех шахматных фигур
 * Содержит общие свойства и методы для всех фигур
 */
export class Figure {
  color: Colors;                 // Цвет фигуры (белый/черный)
  logo: typeof logo | null;      // Изображение фигуры (иконка)
  cell: Cell;                    // Текущая клетка где стоит фигура
  name: FigureNames;             // Название фигуры
  id: number;                    // Уникальный идентификатор

  /**
   * Создает новую фигуру
   * @param color - цвет фигуры
   * @param cell - клетка где размещается фигура
   */
  constructor(color: Colors, cell: Cell) {
    this.color = color;
    this.cell = cell;
    this.cell.figure = this;     // Устанавливаем себя на клетку
    this.logo = null;            // По умолчанию нет иконки (устанавливается в дочерних классах)
    this.name = FigureNames.FIGURE // Базовое название
    this.id = Math.random()      // Уникальный ID для React
  }

  /**
   * Проверяет может ли фигура переместиться на целевую клетку
   * Базовая проверка для всех фигур
   * @param target - целевая клетка
   * @returns true если ход возможен
   */
  canMove(target: Cell) : boolean {
    // Нельзя ходить на клетку где стоит фигура того же цвета
    if(target.figure?.color === this.color)
      return false
    // Нельзя съедать короля (правило шахмат)
    if(target.figure?.name === FigureNames.KING)
      return false
    return true; // В остальных случаях базовая проверка пройдена
  }

  /**
   * Перемещает фигуру на целевую клетку
   * Базовый метод - переопределяется в дочерних классах
   * @param target - целевая клетка
   */
  moveFigure(target: Cell) {}
}

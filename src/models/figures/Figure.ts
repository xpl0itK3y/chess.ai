/**
 * Базовый класс для всех шахматных фигур
 */
import logo from '../../assets/black-king.png'
import {Colors} from "../Colors";
import {Cell} from "../Cell";

/**
 * Перечисление названий всех шахматных фигур
 */
export enum FigureNames {
  FIGURE = "Фигура",
  KING = "Король",
  KNIGHT = "Конь",
  PAWN = "Пешка",
  QUEEN = "Ферзь",
  ROOK = "Ладья",
  BISHOP = "Слон",
}

/**
 * Абстрактный класс фигуры
 * Содержит общие свойства и методы для всех шахматных фигур
 */
export class Figure {
  // Цвет фигуры (белый или черный)
  color: Colors;
  // Логотип фигуры для отображения на доске
  logo: typeof logo | null;
  // Ссылка на клетку, на которой стоит фигура
  cell: Cell;
  // Название фигуры из перечисления FigureNames
  name: FigureNames;
  // Уникальный идентификатор для React ключей
  id: number;

  constructor(color: Colors, cell: Cell) {
    this.color = color;
    this.cell = cell;
    this.cell.figure = this;
    this.logo = null;
    this.name = FigureNames.FIGURE
    this.id = Math.random()
  }

  /**
   * Проверяет, может ли фигура переместиться на целевую клетку
   * Базовая проверка: нельзя атаковать свои фигуры и короля
   * @param target Целевая клетка
   * @returns true если ход возможен
   */
  canMove(target: Cell) : boolean {
    if(target.figure?.color === this.color)
      return false
    if(target.figure?.name === FigureNames.KING)
      return false
    return true;
  }

  /**
   * Перемещает фигуру на целевую клетку
   * В базовом классе не реализуется, переопределяется в наследниках
   * @param target Целевая клетка
   */
  moveFigure(target: Cell) {}
}

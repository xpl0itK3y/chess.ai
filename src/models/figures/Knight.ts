import {Figure, FigureNames} from "./Figure";
import {Colors} from "../Colors";
import {Cell} from "../Cell";
import blackLogo from "../../assets/black-knight.png";
import whiteLogo from "../../assets/white-knight.png";

/**
 * Класс шахматного коня (лошади)
 * Конь ходит буквой "Г": 2 клетки в одном направлении и 1 в перпендикулярном
 */
export class Knight extends Figure {
  /**
   * Создает нового коня
   * @param color - цвет коня
   * @param cell - начальная клетка
   */
  constructor(color: Colors, cell: Cell) {
    super(color, cell);
    this.logo = color === Colors.BLACK ? blackLogo : whiteLogo;
    this.name = FigureNames.KNIGHT;
  }

  /**
   * Проверяет может ли конь переместиться на целевую клетку
   * Конь ходит буквой "Г": 2 клетки по одной оси и 1 по другой
   * @param target - целевая клетка
   * @returns true если ход возможен
   */
  canMove(target: Cell): boolean {
    // Сначала проверяем базовые правила
    if(!super.canMove(target))
      return false;
    
    // Вычисляем разницу координат между текущей и целевой клеткой
    const dx = Math.abs(this.cell.x - target.x); // Разница по горизонтали
    const dy = Math.abs(this.cell.y - target.y); // Разница по вертикали

    // Конь ходит буквой "Г":
    // Либо 1 клетка по горизонтали и 2 по вертикали
    // Либо 2 клетки по горизонтали и 1 по вертикали
    return (dx === 1 && dy === 2) || (dx === 2 && dy === 1)
  }
}

import {Figure, FigureNames} from "./Figure";
import {Colors} from "../Colors";
import {Cell} from "../Cell";
import blackLogo from "../../assets/black-king.png";
import whiteLogo from "../../assets/white-king.png";

/**
 * Класс шахматного короля
 * Король может двигаться на 1 клетку в любом направлении
 */
export class King extends Figure {
  /**
   * Создает нового короля
   * @param color - цвет короля
   * @param cell - начальная клетка
   */
  constructor(color: Colors, cell: Cell) {
    super(color, cell);
    this.logo = color === Colors.BLACK ? blackLogo : whiteLogo;
    this.name = FigureNames.KING;
  }

  /**
   * Проверяет может ли король переместиться на целевую клетку
   * Король ходит на 1 клетку в любом направлении
   * @param target - целевая клетка
   * @returns true если ход возможен
   */
  canMove(target: Cell): boolean {
    // Сначала проверяем базовые правила
    if(!super.canMove(target))
      return false;
    
    // Вычисляем разницу координат между текущей и целевой клеткой
    const absX = Math.abs(target.x - this.cell.x);
    const absY = Math.abs(target.y - this.cell.y);
    
    // Король может ходить на 1 клетку в любом направлении
    // absX <= 1 && absY <= 1 означает: 0 или 1 по горизонтали И 0 или 1 по вертикали
    // Это позволяет ходить прямо, по диагонали и оставаться на месте (но оставаться не нужно)
    return absX <= 1 && absY <= 1 && (absX > 0 || absY > 0);
  }
}

import {Figure, FigureNames} from "./Figure";
import {Colors} from "../Colors";
import {Cell} from "../Cell";
import blackLogo from "../../assets/black-queen.png";
import whiteLogo from "../../assets/white-queen.png";

/**
 * Класс шахматного ферзя (королевы)
 * Ферзь - самая сильная фигура, может ходить как ладья и слон вместе
 */
export class Queen extends Figure {
  /**
   * Создает нового ферзя
   * @param color - цвет ферзя
   * @param cell - начальная клетка
   */
  constructor(color: Colors, cell: Cell) {
    super(color, cell);
    this.logo = color === Colors.BLACK ? blackLogo : whiteLogo;
    this.name = FigureNames.QUEEN;
  }

  /**
   * Проверяет может ли ферзь переместиться на целевую клетку
   * Ферзь ходит по вертикали, горизонтали и диагонали
   * @param target - целевая клетка
   * @returns true если ход возможен
   */
  canMove(target: Cell): boolean {
    // Сначала проверяем базовые правила
    if(!super.canMove(target))
      return false;
    
    // Ферзь может ходить по вертикали (как ладья)
    if(this.cell.isEmptyVertical(target))
      return true;
    
    // Ферзь может ходить по горизонтали (как ладья)
    if(this.cell.isEmptyHorizontal(target))
      return true;
    
    // Ферзь может ходить по диагонали (как слон)
    if(this.cell.isEmptyDiagonal(target))
      return true;
    
    return false; // Путь заблокирован или недопустим
  }
}

import {Figure, FigureNames} from "./Figure";
import {Colors} from "../Colors";
import {Cell} from "../Cell";
import blackLogo from "../../assets/black-rook.png";
import whiteLogo from "../../assets/white-rook.png";

/**
 * Класс шахматной ладьи
 * Ладья может ходить по вертикали и горизонтали на любое расстояние
 */
export class Rook extends Figure {
  /**
   * Создает новую ладью
   * @param color - цвет ладьи
   * @param cell - начальная клетка
   */
  constructor(color: Colors, cell: Cell) {
    super(color, cell);
    this.logo = color === Colors.BLACK ? blackLogo : whiteLogo;
    this.name = FigureNames.ROOK;
  }

  /**
   * Проверяет может ли ладья переместиться на целевую клетку
   * Ладья ходит только по вертикали или горизонтали
   * @param target - целевая клетка
   * @returns true если ход возможен
   */
  canMove(target: Cell): boolean {
    // Сначала проверяем базовые правила
    if(!super.canMove(target))
      return false;
    
    // Ладья может ходить по вертикали (вверх/вниз)
    if(this.cell.isEmptyVertical(target))
      return true
    
    // Ладья может ходить по горизонтали (влево/вправо)
    if(this.cell.isEmptyHorizontal(target))
      return true
    
    return false; // Ход не соответствует правилам ладьи
  }
}

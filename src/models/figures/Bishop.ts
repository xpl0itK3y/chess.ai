import {Figure, FigureNames} from "./Figure";
import {Colors} from "../Colors";
import {Cell} from "../Cell";
import blackLogo from '../../assets/black-bishop.png'
import whiteLogo from '../../assets/white-bishop.png'

/**
 * Класс шахматного слона (офицера)
 * Слон может ходить только по диагонали на любое расстояние
 */
export class Bishop extends Figure {
  /**
   * Создает нового слона
   * @param color - цвет слона
   * @param cell - начальная клетка
   */
  constructor(color: Colors, cell: Cell) {
    super(color, cell);
    this.logo = color === Colors.BLACK ? blackLogo : whiteLogo;
    this.name = FigureNames.BISHOP;
  }

  /**
   * Проверяет может ли слон переместиться на целевую клетку
   * Слон ходит только по диагонали
   * @param target - целевая клетка
   * @returns true если ход возможен
   */
  canMove(target: Cell): boolean {
    // Сначала проверяем базовые правила
    if(!super.canMove(target))
      return false;
    
    // Слон может ходить только по диагонали
    if(this.cell.isEmptyDiagonal(target))
      return true
    
    return false; // Ход не по диагонали
  }
}

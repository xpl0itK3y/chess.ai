/**
 * Класс слона
 * 
 * Слон может перемещаться на любое количество клеток только по диагонали
 */
import {Figure, FigureNames} from "./Figure";
import {Colors} from "../Colors";
import {Cell} from "../Cell";
import blackLogo from '../../assets/black-bishop.png'
import whiteLogo from '../../assets/white-bishop.png'

export class Bishop extends Figure {
  constructor(color: Colors, cell: Cell) {
    super(color, cell);
    // Устанавливаем соответствующий логотип в зависимости от цвета
    this.logo = color === Colors.BLACK ? blackLogo : whiteLogo;
    this.name = FigureNames.BISHOP;
  }

  /**
   * Проверяет, может ли слон переместиться на целевую клетку
   * @param target Целевая клетка
   * @returns true если слон может сделать ход
   */
  canMove(target: Cell): boolean {
    // Сначала выполняем базовую проверку из родительского класса
    if(!super.canMove(target))
      return false;
    
    // Слон может двигаться только по диагонали, если путь свободен
    if(this.cell.isEmptyDiagonal(target))
      return true
    
    return false
  }
}

/**
 * Класс ферзя
 * 
 * Ферзь может перемещаться на любое количество клеток по вертикали, горизонтали или диагонали
 */
import {Figure, FigureNames} from "./Figure";
import {Colors} from "../Colors";
import {Cell} from "../Cell";
import blackLogo from "../../assets/black-queen.png";
import whiteLogo from "../../assets/white-queen.png";

export class Queen extends Figure {
  constructor(color: Colors, cell: Cell) {
    super(color, cell);
    // Устанавливаем соответствующий логотип в зависимости от цвета
    this.logo = color === Colors.BLACK ? blackLogo : whiteLogo;
    this.name = FigureNames.QUEEN;
  }

  /**
   * Проверяет, может ли ферзь переместиться на целевую клетку
   * @param target Целевая клетка
   * @returns true если ферзь может сделать ход
   */
  canMove(target: Cell): boolean {
    // Сначала выполняем базовую проверку из родительского класса
    if(!super.canMove(target))
      return false;
    
    // Ферзь может двигаться по вертикали, если путь свободен
    if(this.cell.isEmptyVertical(target))
      return true;
    
    // Ферзь может двигаться по горизонтали, если путь свободен
    if(this.cell.isEmptyHorizontal(target))
      return true;
    
    // Ферзь может двигаться по диагонали, если путь свободен
    if(this.cell.isEmptyDiagonal(target))
      return true;
    
    return false
  }
}

/**
 * Класс короля
 * 
 * Король может перемещаться на одну клетку в любом направлении
 */
import {Figure, FigureNames} from "./Figure";
import {Colors} from "../Colors";
import {Cell} from "../Cell";
import blackLogo from "../../assets/black-king.png";
import whiteLogo from "../../assets/white-king.png";

export class King extends Figure {
  constructor(color: Colors, cell: Cell) {
    super(color, cell);
    // Устанавливаем соответствующий логотип в зависимости от цвета
    this.logo = color === Colors.BLACK ? blackLogo : whiteLogo;
    this.name = FigureNames.KING;
  }
  
  /**
   * Проверяет, может ли король переместиться на целевую клетку
   * @param target Целевая клетка
   * @returns true если король может сделать ход
   */
  canMove(target: Cell): boolean {
    // Сначала выполняем базовую проверку из родительского класса
    if(!super.canMove(target))
      return false;
    
    // Король может переместиться только на одну клетку в любом направлении
    const deltaX = Math.abs(this.cell.x - target.x);
    const deltaY = Math.abs(this.cell.y - target.y);
    
    // Проверяем, что перемещение не более чем на 1 клетку по горизонтали и вертикали
    return deltaX <= 1 && deltaY <= 1;
  }
}

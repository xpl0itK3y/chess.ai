/**
 * Класс ладьи
 * 
 * Ладья может перемещаться на любое количество клеток по вертикали или горизонтали
 */
import {Figure, FigureNames} from "./Figure";
import {Colors} from "../Colors";
import {Cell} from "../Cell";
import blackLogo from "../../assets/black-rook.png";
import whiteLogo from "../../assets/white-rook.png";

export class Rook extends Figure {
  constructor(color: Colors, cell: Cell) {
    super(color, cell);
    // Устанавливаем соответствующий логотип в зависимости от цвета
    this.logo = color === Colors.BLACK ? blackLogo : whiteLogo;
    this.name = FigureNames.ROOK;
  }

  /**
   * Проверяет, может ли ладья переместиться на целевую клетку
   * @param target Целевая клетка
   * @returns true если ладья может сделать ход
   */
  canMove(target: Cell): boolean {
    // Сначала выполняем базовую проверку из родительского класса
    if(!super.canMove(target))
      return false;
    
    // Ладья может двигаться по вертикали, если путь свободен
    if(this.cell.isEmptyVertical(target))
      return true
    
    // Ладья может двигаться по горизонтали, если путь свободен
    if(this.cell.isEmptyHorizontal(target))
      return true
    
    return false
  }
}

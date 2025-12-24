/**
 * Класс коня
 * 
 * Конь перемещается по букве "Г": на две клетки в одном направлении
 * и на одну клетку в перпендикулярном направлении
 */
import {Figure, FigureNames} from "./Figure";
import {Colors} from "../Colors";
import {Cell} from "../Cell";
import blackLogo from "../../assets/black-knight.png";
import whiteLogo from "../../assets/white-knight.png";

export class Knight extends Figure {
  constructor(color: Colors, cell: Cell) {
    super(color, cell);
    // Устанавливаем соответствующий логотип в зависимости от цвета
    this.logo = color === Colors.BLACK ? blackLogo : whiteLogo;
    this.name = FigureNames.KNIGHT;
  }

  /**
   * Проверяет, может ли конь переместиться на целевую клетку
   * @param target Целевая клетка
   * @returns true если конь может сделать ход
   */
  canMove(target: Cell): boolean {
    // Сначала выполняем базовую проверку из родительского класса
    if(!super.canMove(target))
      return false;
    
    // Вычисляем разницу в координатах
    const dx = Math.abs(this.cell.x - target.x);
    const dy = Math.abs(this.cell.y - target.y);

    // Конь ходит буквой "Г": 2 клетки в одном направлении, 1 в другом
    return (dx === 1 && dy === 2) || (dx === 2 && dy === 1)
  }
}

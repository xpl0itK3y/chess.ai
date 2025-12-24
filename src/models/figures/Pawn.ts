/**
 * Класс пешки
 * 
 * Пешка может двигаться вперед на одну клетку,
 * с первого хода - на две клетки, атакует по диагонали
 */
import {Figure, FigureNames} from "./Figure";
import {Colors} from "../Colors";
import {Cell} from "../Cell";
import blackLogo from "../../assets/black-pawn.png";
import whiteLogo from "../../assets/white-pawn.png";

export class Pawn extends Figure {
  // Флаг, указывающий, что пешка делает первый ход
  isFirstStep: boolean = true;

  constructor(color: Colors, cell: Cell) {
    super(color, cell);
    this.logo = color === Colors.BLACK ? blackLogo : whiteLogo;
    this.name = FigureNames.PAWN;
  }

  /**
   * Проверяет, может ли пешка переместиться на целевую клетку
   * @param target Целевая клетка
   * @returns true если пешка может сделать ход
   */
  canMove(target: Cell): boolean {
    // Сначала выполняем базовую проверку из родительского класса
    if(!super.canMove(target))
      return false;
    
    // Направление движения: черные вниз (+1), белые вверх (-1)
    const direction = this.cell.figure?.color === Colors.BLACK ? 1 : -1
    // Направление для первого хода: черные на 2 клетки вниз, белые на 2 вверх
    const firstStepDirection = this.cell.figure?.color === Colors.BLACK ? 2 : -2

    // Движение вперед на 1 клетку или на 2 клетки с первого хода
    if ((target.y === this.cell.y + direction || this.isFirstStep
        && (target.y === this.cell.y + firstStepDirection))
      && target.x === this.cell.x
      && this.cell.board.getCell(target.x, target.y).isEmpty()) {
      return true;
    }

    // Атака по диагонали: пешка может атаковать фигуры противника по диагонали
    if(target.y === this.cell.y + direction
    && (target.x === this.cell.x + 1 || target.x === this.cell.x - 1)
    && this.cell.isEnemy(target)) {
      return true;
    }

    return false;
  }

  /**
   * Перемещает пешку на целевую клетку и сбрасывает флаг первого хода
   * @param target Целевая клетка
   */
  moveFigure(target: Cell) {
    super.moveFigure(target);
    // После первого хода сбрасываем флаг isFirstStep
    this.isFirstStep = false;
  }
}

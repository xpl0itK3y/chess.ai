import {Figure, FigureNames} from "./Figure";
import {Colors} from "../Colors";
import {Cell} from "../Cell";
import blackLogo from "../../assets/black-pawn.png";
import whiteLogo from "../../assets/white-pawn.png";

/**
 * Класс шахматной пешки
 * Пешка имеет особые правила движения: вперед на 1 клетку, в первый ход на 2, бьет по диагонали
 */
export class Pawn extends Figure {
  isFirstStep: boolean = true; // Флаг первого хода (нужен для хода на 2 клетки)

  /**
   * Создает новую пешку
   * @param color - цвет пешки
   * @param cell - начальная клетка
   */
  constructor(color: Colors, cell: Cell) {
    super(color, cell);
    // Устанавливаем иконку в зависимости от цвета
    this.logo = color === Colors.BLACK ? blackLogo : whiteLogo;
    this.name = FigureNames.PAWN;
  }

  /**
   * Проверяет может ли пешка переместиться на целевую клетку
   * @param target - целевая клетка
   * @returns true если ход возможен
   */
  canMove(target: Cell): boolean {
    // Сначала проверяем базовые правила (нельзя есть свои, нельзя есть короля)
    if(!super.canMove(target))
      return false;
    
    // Определяем направление движения: черные вниз (+1), белые вверх (-1)
    const direction = this.cell.figure?.color === Colors.BLACK ? 1 : -1
    // Направление для первого хода: черные на +2, белые на -2
    const firstStepDirection = this.cell.figure?.color === Colors.BLACK ? 2 : -2

    // Проверяем движение вперед: на 1 клетку всегда, на 2 только если первый ход
    if (target.x === this.cell.x                                    // Движение строго по вертикали
      && this.cell.board.getCell(target.x, target.y).isEmpty()       // Целевая клетка пуста
      && (target.y === this.cell.y + direction                      // Ход на 1 клетку
          || (this.isFirstStep && target.y === this.cell.y + firstStepDirection))) { // Или ход на 2 клетки если первый ход
      return true;
    }

    // Проверяем взятие фигуры по диагонали
    if(target.y === this.cell.y + direction                         // На 1 клетку вперед по диагонали
    && (target.x === this.cell.x + 1 || target.x === this.cell.x - 1) // На 1 клетку влево или вправо
    && this.cell.isEnemy(target)) {                                  // На клетке есть вражеская фигура
      return true;
    }

    return false; // Ход невозможен
  }

  /**
   * Перемещает пешку на целевую клетку
   * После первого хода устанавливает флаг isFirstStep в false
   * @param target - целевая клетка
   */
  moveFigure(target: Cell) {
    super.moveFigure(target); // Вызываем базовый метод перемещения
    this.isFirstStep = false; // После первого хода пешка больше не может ходить на 2 клетки
  }
}

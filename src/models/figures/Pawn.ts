/**
 * Класс пешки
 * 
 * Пешка может двигаться вперед на одну клетку,
 * с первого хода - на две клетки, атакует по диагонали
 * Поддерживает взятие на проходе (en passant)
 */
import { Figure, FigureNames } from "./Figure";
import { Colors } from "../Colors";
import { Cell } from "../Cell";
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
    if (!super.canMove(target))
      return false;

    // Направление движения: черные вниз (+1), белые вверх (-1)
    const direction = this.cell.figure?.color === Colors.BLACK ? 1 : -1
    // Направление для первого хода: черные на 2 клетки вниз, белые на 2 вверх
    const firstStepDirection = this.cell.figure?.color === Colors.BLACK ? 2 : -2

    // Движение вперед на 1 клетку (только если НЕ en passant)
    if (target.y === this.cell.y + direction
      && target.x === this.cell.x
      && this.cell.board.getCell(target.x, target.y).isEmpty()
      && !this.canEnPassant(target)) {
      return true;
    }

    // Движение на 2 клетки с первого хода (только если НЕ en passant)
    if (this.isFirstStep
      && target.y === this.cell.y + firstStepDirection
      && target.x === this.cell.x
      && this.cell.board.getCell(target.x, target.y).isEmpty()
      && this.cell.board.getCell(target.x, this.cell.y + direction).isEmpty()
      && !this.canEnPassant(target)) {
      return true;
    }

    // Атака по диагонали: пешка может атаковать фигуры противника по диагонали
    const isDiagonalMove = (target.y === this.cell.y + direction)
      && ((target.x === this.cell.x + 1) || (target.x === this.cell.x - 1));

    if (isDiagonalMove) {
      const hasEnemy = this.cell.isEnemy(target);
      console.log(`Пешка (${this.cell.x},${this.cell.y}) -> (${target.x},${target.y}): диагональ=${isDiagonalMove}, враг=${hasEnemy}, фигура на цели=${target.figure?.name || 'пусто'}`);
      if (hasEnemy) {
        return true;
      }
    }

    // Взятие на проходе (en passant)
    if (this.canEnPassant(target)) {
      return true;
    }

    return false;
  }

  /**
   * Проверяет возможность взятия на проходе
   */
  private canEnPassant(target: Cell): boolean {
    const direction = this.color === Colors.BLACK ? 1 : -1;
    const enPassantRow = this.color === Colors.BLACK ? 4 : 3; // Ряд, где возможно en passant

    // Проверяем, что пешка находится на правильном ряду
    if (this.cell.y !== enPassantRow) return false;

    // Проверяем, что ход по диагонали вперед
    if (target.y !== this.cell.y + direction) return false;
    if (Math.abs(target.x - this.cell.x) !== 1) return false;

    // Проверяем, что целевая клетка пуста
    if (!target.isEmpty()) return false;

    // Проверяем, что рядом стоит пешка, которая только что сделала ход на 2 клетки
    const adjacentCell = this.cell.board.getCell(target.x, this.cell.y);
    const lastMovedPawn = this.cell.board.lastMovedPawn;

    if (adjacentCell.figure instanceof Pawn
      && adjacentCell.figure.color !== this.color
      && lastMovedPawn === adjacentCell.figure) {
      return true;
    }

    return false;
  }

  /**
   * Проверка атаки для определения шаха (без en passant)
   */
  canMoveWithoutCheck(target: Cell): boolean {
    const direction = this.color === Colors.BLACK ? 1 : -1;

    // Пешка атакует только по диагонали
    if (target.y === this.cell.y + direction
      && Math.abs(target.x - this.cell.x) === 1) {
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

    const direction = this.color === Colors.BLACK ? 1 : -1;

    // Обработка взятия на проходе - удаляем взятую пешку
    if (target.isEmpty()
      && Math.abs(target.x - this.cell.x) === 1
      && target.y === this.cell.y + direction) {
      const capturedCell = this.cell.board.getCell(target.x, this.cell.y);
      if (capturedCell.figure) {
        this.cell.addLostFigure(capturedCell.figure);
        capturedCell.figure = null;
      }
    }

    // Если пешка сделала ход на 2 клетки, запоминаем её для en passant
    if (this.isFirstStep && Math.abs(target.y - this.cell.y) === 2) {
      this.cell.board.lastMovedPawn = this;
    } else {
      // Сбрасываем lastMovedPawn если это не ход пешки на 2 клетки
      if (this.cell.board.lastMovedPawn?.color === this.color) {
        this.cell.board.lastMovedPawn = null;
      }
    }

    // После первого хода сбрасываем флаг isFirstStep
    this.isFirstStep = false;
  }
}

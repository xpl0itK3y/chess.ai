/**
 * Класс короля
 * 
 * Король может перемещаться на одну клетку в любом направлении
 * Также может выполнять рокировку
 */
import { Figure, FigureNames } from "./Figure";
import { Colors } from "../Colors";
import { Cell } from "../Cell";
import blackLogo from "../../assets/black-king.png";
import whiteLogo from "../../assets/white-king.png";
import { Rook } from "./Rook";

export class King extends Figure {
  // Флаг первого хода (для рокировки)
  isFirstMove: boolean = true;

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
    if (!super.canMove(target))
      return false;

    const deltaX = Math.abs(this.cell.x - target.x);
    const deltaY = Math.abs(this.cell.y - target.y);

    // Обычный ход короля (на одну клетку в любом направлении)
    if (deltaX <= 1 && deltaY <= 1) {
      return true;
    }

    // Проверка рокировки
    if (this.isFirstMove && deltaY === 0 && deltaX === 2) {
      return this.canCastle(target);
    }

    return false;
  }

  /**
   * Проверяет возможность рокировки
   * @param target Целевая клетка для короля
   * @returns true если рокировка возможна
   */
  private canCastle(target: Cell): boolean {
    // Определяем направление рокировки
    const direction = target.x > this.cell.x ? 1 : -1;
    const rookX = direction === 1 ? 7 : 0; // Короткая или длинная рокировка
    const rookCell = this.cell.board.getCell(rookX, this.cell.y);
    const rook = rookCell.figure;

    // Проверяем, что на клетке стоит ладья того же цвета и она не двигалась
    if (!(rook instanceof Rook) || rook.color !== this.color || !rook.isFirstMove) {
      return false;
    }

    // Проверяем, что все клетки между королем и ладьей пусты
    const startX = Math.min(this.cell.x, rookX) + 1;
    const endX = Math.max(this.cell.x, rookX);
    for (let x = startX; x < endX; x++) {
      if (!this.cell.board.getCell(x, this.cell.y).isEmpty()) {
        return false;
      }
    }

    // Проверяем, что король не находится под шахом
    if (this.cell.board.isKingUnderAttack(this.color)) {
      return false;
    }

    // Проверяем, что король не проходит через атакуемые клетки
    const kingPath = direction === 1 ? [5, 6] : [2, 3];
    for (const x of kingPath) {
      if (x === target.x || x === this.cell.x) continue;
      if (this.cell.board.isCellUnderAttack(this.cell.board.getCell(x, this.cell.y), this.color)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Перемещает короля и выполняет рокировку при необходимости
   */
  moveFigure(target: Cell) {
    const originalX = this.cell.x;
    const originalY = this.cell.y;
    
    super.moveFigure(target);

    const deltaX = Math.abs(originalX - target.x);

    // Если это рокировка, перемещаем ладью
    if (this.isFirstMove && deltaX === 2) {
      const direction = target.x > this.cell.x ? 1 : -1;
      const rookX = direction === 1 ? 7 : 0;
      const newRookX = direction === 1 ? 5 : 3;

      const rookCell = this.cell.board.getCell(rookX, this.cell.y);
      const rook = rookCell.figure as Rook;
      const newRookCell = this.cell.board.getCell(newRookX, this.cell.y);

      // Перемещаем ладью
      rook.isFirstMove = false;
      newRookCell.setFigure(rook);
      rookCell.figure = null;
    }

    this.isFirstMove = false;
  }
}

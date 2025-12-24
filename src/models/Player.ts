/**
 * Класс игрока
 * 
 * Представляет игрока с определенным цветом фигур
 */
import {Colors} from "./Colors";

export class Player {
  // Цвет фигур игрока (белый или черный)
  color: Colors;

  /**
   * Создает нового игрока с указанным цветом фигур
   * @param color Цвет фигур игрока
   */
  constructor(color: Colors) {
    this.color = color;
  }
}

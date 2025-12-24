import {Colors} from "./Colors";

/**
 * Класс игрока в шахматы
 * Содержит информацию о цвете фигур игрока
 * В будущем можно будет расширить: имя, рейтинг, время и т.д.
 */
export class Player {
  color: Colors;  // Цвет фигур игрока (белые или черные)

  /**
   * Создает нового игрока
   * @param color - цвет фигур игрока
   */
  constructor(color: Colors) {
    this.color = color;
  }
}

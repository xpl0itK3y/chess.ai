/**
 * Тестовый скрипт для проверки шахматной логики
 * Запуск: npx ts-node src/tests/chessTests.ts
 */

import { Board } from "../models/Board";
import { Colors } from "../models/Colors";
import { King } from "../models/figures/King";
import { Queen } from "../models/figures/Queen";
import { Rook } from "../models/figures/Rook";
import { Pawn } from "../models/figures/Pawn";
import { Knight } from "../models/figures/Knight";
import { Bishop } from "../models/figures/Bishop";

// Утилита для создания пустой доски
function createEmptyBoard(): Board {
  const board = new Board();
  board.initCells();
  return board;
}

// Утилита для вывода результатов теста
function testResult(name: string, passed: boolean) {
  const status = passed ? "✅ PASS" : "❌ FAIL";
  console.log(`${status}: ${name}`);
  return passed;
}

function testBasicCheck(): boolean {
  console.log("\n=== Тест 1: Базовый шах ===");
  const board = createEmptyBoard();

  // Белый король на e1, чёрный ферзь на e8
  new King(Colors.WHITE, board.getCell(4, 7)); // e1
  new Queen(Colors.BLACK, board.getCell(4, 0)); // e8
  new King(Colors.BLACK, board.getCell(0, 0)); // a8 - чёрный король в углу

  const isCheck = board.isKingUnderAttack(Colors.WHITE);
  console.log(`  Белый король на e1, чёрный ферзь на e8`);
  console.log(`  Шах белому королю: ${isCheck}`);

  return testResult("Ферзь даёт шах королю по вертикали", isCheck === true);
}

function testNoCheck(): boolean {
  console.log("\n=== Тест 2: Нет шаха ===");
  const board = createEmptyBoard();

  // Белый король на e1, чёрный ферзь на a8 (не атакует)
  new King(Colors.WHITE, board.getCell(4, 7)); // e1
  new Queen(Colors.BLACK, board.getCell(0, 0)); // a8
  new King(Colors.BLACK, board.getCell(7, 0)); // h8

  const isCheck = board.isKingUnderAttack(Colors.WHITE);
  console.log(`  Белый король на e1, чёрный ферзь на a8`);
  console.log(`  Шах белому королю: ${isCheck}`);

  return testResult("Ферзь не даёт шах (не на линии атаки)", isCheck === false);
}

function testFoolsMateCheckmate(): boolean {
  console.log("\n=== Тест 3: Спёртый мат (Smothered Mate) ===");
  const board = createEmptyBoard();

  // Спёртый мат: король окружён своими фигурами, конь даёт мат
  // Белый король h1, окружён пешками g2, h2 и ладьёй g1
  // Чёрный конь на f2 даёт мат

  new King(Colors.WHITE, board.getCell(7, 7)); // h1
  new Pawn(Colors.WHITE, board.getCell(6, 6)); // g2
  new Pawn(Colors.WHITE, board.getCell(7, 6)); // h2
  new Rook(Colors.WHITE, board.getCell(6, 7)); // g1 - блокирует выход

  new Knight(Colors.BLACK, board.getCell(5, 6)); // f2 - даёт мат!
  new King(Colors.BLACK, board.getCell(4, 0)); // e8

  console.log(`  Белый король h1, пешки g2/h2, ладья g1`);
  console.log(`  Чёрный конь f2 даёт мат`);

  const isCheck = board.isKingUnderAttack(Colors.WHITE);
  const isCheckmate = board.isCheckmate(Colors.WHITE);

  // Логируем все легальные ходы белых
  console.log("  Ищем все легальные ходы белых:");
  let legalMoves: string[] = [];
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const cell = board.getCell(i, j);
      if (cell.figure && cell.figure.color === Colors.WHITE) {
        for (let ti = 0; ti < 8; ti++) {
          for (let tj = 0; tj < 8; tj++) {
            const target = board.getCell(ti, tj);
            if (
              cell.figure.canMove(target) &&
              board.isMoveLegal(cell, target)
            ) {
              legalMoves.push(
                `  -> ${cell.figure.name} (${i},${j}) -> (${ti},${tj})`,
              );
            }
          }
        }
      }
    }
  }
  if (legalMoves.length > 0) {
    legalMoves.forEach((m) => console.log(m));
  } else {
    console.log("  -> Нет легальных ходов!");
  }

  console.log(`  Спёртый мат: конь f2`);
  console.log(`  Шах: ${isCheck}, Мат: ${isCheckmate}`);

  return testResult(
    "Спёртый мат определяется правильно",
    isCheck === true && isCheckmate === true,
  );
}

function testBackRankMate(): boolean {
  console.log("\n=== Тест 4: Мат на последней горизонтали ===");
  const board = createEmptyBoard();

  // Белый король на g1, заблокирован пешками f2, g2, h2
  // Чёрная ладья на e1 даёт мат
  new King(Colors.WHITE, board.getCell(6, 7)); // g1
  new Pawn(Colors.WHITE, board.getCell(5, 6)); // f2
  new Pawn(Colors.WHITE, board.getCell(6, 6)); // g2
  new Pawn(Colors.WHITE, board.getCell(7, 6)); // h2
  new Rook(Colors.BLACK, board.getCell(4, 7)); // e1 - даёт мат
  new King(Colors.BLACK, board.getCell(4, 0)); // e8

  const isCheck = board.isKingUnderAttack(Colors.WHITE);
  const isCheckmate = board.isCheckmate(Colors.WHITE);

  console.log(`  Король g1, пешки f2-g2-h2, ладья e1`);
  console.log(`  Шах: ${isCheck}, Мат: ${isCheckmate}`);

  return testResult(
    "Мат на последней горизонтали",
    isCheck === true && isCheckmate === true,
  );
}

function testCheckButNotMate(): boolean {
  console.log("\n=== Тест 5: Шах, но не мат (можно уйти) ===");
  const board = createEmptyBoard();

  // Белый король на e1, может уйти
  new King(Colors.WHITE, board.getCell(4, 7)); // e1
  new Rook(Colors.BLACK, board.getCell(4, 0)); // e8 - даёт шах
  new King(Colors.BLACK, board.getCell(0, 0)); // a8

  const isCheck = board.isKingUnderAttack(Colors.WHITE);
  const isCheckmate = board.isCheckmate(Colors.WHITE);

  console.log(`  Король e1, ладья e8 даёт шах`);
  console.log(`  Шах: ${isCheck}, Мат: ${isCheckmate}`);
  console.log(`  Король может уйти на d1, f1, d2, f2`);

  return testResult(
    "Шах, но не мат - король может уйти",
    isCheck === true && isCheckmate === false,
  );
}

function testCheckCanBeBlocked(): boolean {
  console.log("\n=== Тест 6: Шах можно перекрыть ===");
  const board = createEmptyBoard();

  // Белый король на e1, ладья на e8 даёт шах (вертикаль e открыта!)
  // Белая ладья на c5 может перекрыть
  new King(Colors.WHITE, board.getCell(4, 7)); // e1
  new Rook(Colors.WHITE, board.getCell(3, 7)); // d1 - блокирует выход влево
  new Rook(Colors.WHITE, board.getCell(5, 7)); // f1 - блокирует выход вправо
  new Pawn(Colors.WHITE, board.getCell(3, 6)); // d2 - блокирует d2
  // БЕЗ пешки e2 - вертикаль открыта для шаха!
  new Pawn(Colors.WHITE, board.getCell(5, 6)); // f2
  new Rook(Colors.WHITE, board.getCell(2, 3)); // c5 - МОЖЕТ заблокировать на e5

  new Rook(Colors.BLACK, board.getCell(4, 0)); // e8 - даёт шах по вертикали
  new King(Colors.BLACK, board.getCell(0, 0)); // a8

  const isCheck = board.isKingUnderAttack(Colors.WHITE);
  const isCheckmate = board.isCheckmate(Colors.WHITE);

  console.log(`  Король e1 заблокирован, ладья e8 даёт шах`);
  console.log(`  Слон c1 может перекрыть`);
  console.log(`  Шах: ${isCheck}, Мат: ${isCheckmate}`);

  return testResult(
    "Шах можно перекрыть слоном",
    isCheck === true && isCheckmate === false,
  );
}

function testStalemate(): boolean {
  console.log("\n=== Тест 7: Пат ===");
  const board = createEmptyBoard();

  // Классическая позиция пата
  // Белый король на a1, чёрный ферзь на b3, чёрный король на c2
  // Белому некуда ходить, но он НЕ под шахом
  new King(Colors.WHITE, board.getCell(0, 7)); // a1
  new Queen(Colors.BLACK, board.getCell(1, 5)); // b3
  new King(Colors.BLACK, board.getCell(2, 6)); // c2

  const isCheck = board.isKingUnderAttack(Colors.WHITE);
  const isStalemate = board.isStalemate(Colors.WHITE);

  console.log(`  Белый король a1, чёрный ферзь b3, чёрный король c2`);
  console.log(`  Шах: ${isCheck}, Пат: ${isStalemate}`);

  return testResult(
    "Пат определяется правильно",
    isCheck === false && isStalemate === true,
  );
}

function testPawnCanCaptureAttacker(): boolean {
  console.log("\n=== Тест 8: Пешка может срубить атакующую фигуру ===");
  const board = createEmptyBoard();

  // Для ЧЁРНОЙ пешки: y увеличивается = вперёд
  // Чёрная пешка на d3 (x=3, y=5) может срубить белую фигуру на e4 (x=4, y=4)?
  // y: 5 -> 4, это уменьшение, для чёрной пешки это НАЗАД. Нет.
  // Чёрная пешка на d3 (y=5) идёт вперёд на y=6, может срубить c4 (4,6) или e4 (4,6)?
  // y=5 -> y=6, x±1. d3=(3,5) -> c4=(2,6) или e4=(4,6).
  // Но e4 это (4,4), не (4,6).

  // Ладно, сделаем чёрную пешку атакует белого ферзя, который даёт шах чёрному королю
  new King(Colors.BLACK, board.getCell(4, 0)); // e8
  new Pawn(Colors.BLACK, board.getCell(3, 2)); // d6 (x=3, y=2)
  new Queen(Colors.WHITE, board.getCell(4, 3)); // e5 (x=4, y=3) - даёт шах?
  new King(Colors.WHITE, board.getCell(0, 7)); // a1

  // e5 атакует e8 по вертикали. Да!
  // Чёрная пешка d6 (3,2) может срубить e5 (4,3)?
  // y: 2 -> 3 (увеличение = вперёд для чёрных), x: 3 -> 4 (±1). Да!

  const isCheck = board.isKingUnderAttack(Colors.BLACK);
  const pawn = board.getCell(3, 2).figure;
  const queenCell = board.getCell(4, 3);
  const canCapture = pawn?.canMove(queenCell);
  const isLegal = board.isMoveLegal(board.getCell(3, 2), queenCell);
  const isCheckmate = board.isCheckmate(Colors.BLACK);

  console.log(`  Чёрный король e8, белый ферзь e5 даёт шах`);
  console.log(`  Чёрная пешка d6 может срубить ферзя e5`);
  console.log(`  Шах: ${isCheck}`);
  console.log(`  Пешка может пойти (canMove): ${canCapture}`);
  console.log(`  Ход легален (isMoveLegal): ${isLegal}`);
  console.log(`  Мат: ${isCheckmate}`);

  return testResult(
    "Пешка может срубить атакующего - не мат",
    isCheck === true &&
      canCapture === true &&
      isLegal === true &&
      isCheckmate === false,
  );
}

function testKnightCheck(): boolean {
  console.log("\n=== Тест 9: Шах от коня ===");
  const board = createEmptyBoard();

  // Белый король на e1, чёрный конь на f3 даёт шах
  new King(Colors.WHITE, board.getCell(4, 7)); // e1
  new Knight(Colors.BLACK, board.getCell(5, 5)); // f3
  new King(Colors.BLACK, board.getCell(0, 0)); // a8

  const isCheck = board.isKingUnderAttack(Colors.WHITE);

  console.log(`  Белый король e1, чёрный конь f3`);
  console.log(`  Шах: ${isCheck}`);

  return testResult("Конь даёт шах", isCheck === true);
}

function testDoubleCheck(): boolean {
  console.log("\n=== Тест 10: Двойной шах ===");
  const board = createEmptyBoard();

  // Белый король на e1, атакован ладьёй e8 и слоном b4
  new King(Colors.WHITE, board.getCell(4, 7)); // e1
  new Rook(Colors.BLACK, board.getCell(4, 0)); // e8 - шах по вертикали
  new Bishop(Colors.BLACK, board.getCell(1, 4)); // b4 - шах по диагонали
  new King(Colors.BLACK, board.getCell(0, 0)); // a8

  const isCheck = board.isKingUnderAttack(Colors.WHITE);

  console.log(`  Белый король e1, ладья e8 + слон b4`);
  console.log(`  Шах: ${isCheck}`);

  return testResult("Двойной шах определяется", isCheck === true);
}

// === ТЕСТЫ ДВИЖЕНИЯ ФИГУР ===

function testPawnBasicMove(): boolean {
  console.log("\n=== Тест 11: Базовое движение пешки ===");
  const board = createEmptyBoard();

  // Белая пешка на e2 может пойти на e3 и e4 с первого хода
  const pawn = new Pawn(Colors.WHITE, board.getCell(4, 6)); // e2
  new King(Colors.WHITE, board.getCell(4, 7)); // e1
  new King(Colors.BLACK, board.getCell(0, 0)); // a8

  const canMoveOne = pawn.canMove(board.getCell(4, 5)); // e3
  const canMoveTwo = pawn.canMove(board.getCell(4, 4)); // e4
  const canMoveThree = pawn.canMove(board.getCell(4, 3)); // e5 (слишком далеко)

  console.log(`  Пешка e2 может пойти на e3: ${canMoveOne}`);
  console.log(`  Пешка e2 может пойти на e4 (сначала): ${canMoveTwo}`);
  console.log(`  Пешка e2 может пойти на e5 (нельзя): ${canMoveThree}`);

  return testResult(
    "Базовое движение пешки",
    canMoveOne === true && canMoveTwo === true && canMoveThree === false
  );
}

function testPawnDiagonalCapture(): boolean {
  console.log("\n=== Тест 12: Диагональное взятие пешкой ===");
  const board = createEmptyBoard();

  const pawn = new Pawn(Colors.WHITE, board.getCell(4, 5)); // e3
  new Pawn(Colors.BLACK, board.getCell(3, 4)); // d4 (враг для взятия)
  new King(Colors.WHITE, board.getCell(4, 7)); // e1
  new King(Colors.BLACK, board.getCell(0, 0)); // a8

  const canCaptureLeft = pawn.canMove(board.getCell(3, 4)); // d4
  const canCaptureEmpty = pawn.canMove(board.getCell(5, 4)); // f4 (пусто)
  new Pawn(Colors.WHITE, board.getCell(5, 4)); // f4 (своя)
  const canCaptureOwnPiece = pawn.canMove(board.getCell(5, 4));

  console.log(`  Пешка e3 может взять d4: ${canCaptureLeft}`);
  console.log(`  Пешка e3 может пойти на f4 (пусто): ${canCaptureEmpty}`);
  console.log(`  Пешка e3 может взять f4 (своя): ${canCaptureOwnPiece}`);

  return testResult(
    "Диагональное взятие пешкой",
    canCaptureLeft === true && canCaptureEmpty === false && canCaptureOwnPiece === false
  );
}

function testRookBasicMove(): boolean {
  console.log("\n=== Тест 13: Базовое движение ладьи ===");
  const board = createEmptyBoard();

  const rook = new Rook(Colors.WHITE, board.getCell(3, 3)); // d5
  new King(Colors.WHITE, board.getCell(4, 7)); // e1
  new King(Colors.BLACK, board.getCell(0, 0)); // a8

  const canMoveHorizontal = rook.canMove(board.getCell(7, 3)); // h5
  const canMoveVertical = rook.canMove(board.getCell(3, 0)); // d8
  const canMoveDiagonal = rook.canMove(board.getCell(7, 7)); // h8
  const canMoveKnight = rook.canMove(board.getCell(5, 5)); // f6

  console.log(`  Ладья d5 может пойти на h5 (горизонталь): ${canMoveHorizontal}`);
  console.log(`  Ладья d5 может пойти на d8 (вертикаль): ${canMoveVertical}`);
  console.log(`  Ладья d5 может пойти на h8 (диагональ): ${canMoveDiagonal}`);
  console.log(`  Ладья d5 может пойти на f6 (ход коня): ${canMoveKnight}`);

  return testResult(
    "Базовое движение ладьи",
    canMoveHorizontal === true && canMoveVertical === true && 
    canMoveDiagonal === false && canMoveKnight === false
  );
}

function testRookBlockedPath(): boolean {
  console.log("\n=== Тест 14: Блокировка пути ладьи ===");
  const board = createEmptyBoard();

  const rook = new Rook(Colors.WHITE, board.getCell(3, 3)); // d5
  new Pawn(Colors.WHITE, board.getCell(5, 3)); // f5 блокирует горизонталь
  new Pawn(Colors.WHITE, board.getCell(3, 1)); // d7 блокирует вертикаль
  new King(Colors.WHITE, board.getCell(4, 7)); // e1
  new King(Colors.BLACK, board.getCell(0, 0)); // a8

  const canMoveThroughOwn = rook.canMove(board.getCell(7, 3)); // h5 (через свою)
  const canMoveThroughOwnVertical = rook.canMove(board.getCell(3, 0)); // d8 (через свою)
  const canCaptureOwn = rook.canMove(board.getCell(5, 3)); // f5 (свою фигуру)

  console.log(`  Ладья d5 может пойти на h5 (через свою пешку): ${canMoveThroughOwn}`);
  console.log(`  Ладья d5 может пойти на d8 (через свою пешку): ${canMoveThroughOwnVertical}`);
  console.log(`  Ладья d5 может взять свою пешку на f5: ${canCaptureOwn}`);

  return testResult(
    "Блокировка пути ладьи",
    canMoveThroughOwn === false && canMoveThroughOwnVertical === false && canCaptureOwn === false
  );
}

function testBishopBasicMove(): boolean {
  console.log("\n=== Тест 15: Базовое движение слона ===");
  const board = createEmptyBoard();

const bishop = new Bishop(Colors.WHITE, board.getCell(3, 3)); // d5
  new King(Colors.WHITE, board.getCell(4, 7)); // e1
  new King(Colors.BLACK, board.getCell(7, 0)); // h8 (убрали с пути слона)

  // d5 (3,3) - h8 (7,7): dx=4, dy=4 - диагональ ✅
  const canMoveDiagonal1 = bishop.canMove(board.getCell(7, 7)); // h8
  // d5 (3,3) - a8 (0,0): dx=3, dy=3 - диагональ ✅
  const canMoveDiagonal2 = bishop.canMove(board.getCell(0, 0)); // a8 - там НЕТ короля
  const canMoveDiagonal3 = bishop.canMove(board.getCell(6, 6)); // g7
  const canMoveHorizontal = bishop.canMove(board.getCell(7, 3)); // h5
  const canMoveVertical = bishop.canMove(board.getCell(3, 0)); // d8

  console.log(`  Слон d5 может пойти на h8 (диагональ): ${canMoveDiagonal1}`);
  console.log(`  Слон d5 может пойти на a1 (диагональ): ${canMoveDiagonal2}`);
  console.log(`  Слон d5 может пойти на g7 (диагональ): ${canMoveDiagonal3}`);
  console.log(`  Слон d5 может пойти на h5 (горизонталь): ${canMoveHorizontal}`);
  console.log(`  Слон d5 может пойти на d8 (вертикаль): ${canMoveVertical}`);

  return testResult(
    "Базовое движение слона",
    canMoveDiagonal1 === true && canMoveDiagonal2 === true && canMoveDiagonal3 === true &&
    canMoveHorizontal === false && canMoveVertical === false
  );
}

function testKnightBasicMove(): boolean {
  console.log("\n=== Тест 16: Базовое движение коня ===");
  const board = createEmptyBoard();

  const knight = new Knight(Colors.WHITE, board.getCell(3, 3)); // d5
  new King(Colors.WHITE, board.getCell(4, 7)); // e1
  new King(Colors.BLACK, board.getCell(0, 0)); // a8

  const knightMoves = [
    board.getCell(5, 4), // f6
    board.getCell(5, 2), // f4
    board.getCell(1, 4), // b6
    board.getCell(1, 2), // b4
    board.getCell(4, 5), // e6
    board.getCell(4, 1), // e4
    board.getCell(2, 5), // c6
    board.getCell(2, 1), // c4
  ];

  const canMoveKnight = knightMoves.every(cell => knight.canMove(cell));
  const cannotMoveStraight = !knight.canMove(board.getCell(7, 3)); // h5
  const cannotMoveDiagonal = !knight.canMove(board.getCell(7, 7)); // h8

  console.log(`  Конь d5 может сделать все 8 ходов: ${canMoveKnight}`);
  console.log(`  Конь d5 не может пойти по прямой: ${cannotMoveStraight}`);
  console.log(`  Конь d5 не может пойти по диагонали: ${cannotMoveDiagonal}`);

  return testResult(
    "Базовое движение коня",
    canMoveKnight === true && cannotMoveStraight === true && cannotMoveDiagonal === true
  );
}

function testQueenBasicMove(): boolean {
  console.log("\n=== Тест 17: Базовое движение ферзя ===");
  const board = createEmptyBoard();

  const queen = new Queen(Colors.WHITE, board.getCell(3, 3)); // d5
  new King(Colors.WHITE, board.getCell(4, 7)); // e1
  new King(Colors.BLACK, board.getCell(6, 0)); // h8 (не на пути ферзя)

  const canMoveHorizontal = queen.canMove(board.getCell(7, 3)); // h5
  const canMoveVertical = queen.canMove(board.getCell(3, 0)); // d8
  const canMoveDiagonal1 = queen.canMove(board.getCell(7, 7)); // h8
  const canMoveDiagonal2 = queen.canMove(board.getCell(1, 0)); // b8 - там НЕТ короля
  const cannotMoveKnight = !queen.canMove(board.getCell(5, 5)); // f6

  console.log(`  Ферзь d5 может пойти на h5 (горизонталь): ${canMoveHorizontal}`);
  console.log(`  Ферзь d5 может пойти на d8 (вертикаль): ${canMoveVertical}`);
  console.log(`  Ферзь d5 может пойти на h8 (диагональ): ${canMoveDiagonal1}`);
  console.log(`  Ферзь d5 может пойти на h1 (диагональ): ${canMoveDiagonal2}`);
  console.log(`  Ферзь d5 не может пойти на f6 (как конь): ${cannotMoveKnight}`);

  console.log(`  DEBUG: canMoveHorizontal=${canMoveHorizontal}, canMoveVertical=${canMoveVertical}, canMoveDiagonal1=${canMoveDiagonal1}, canMoveDiagonal2=${canMoveDiagonal2}, cannotMoveKnight=${cannotMoveKnight}`);
  console.log(`  Проверяем a8: черный король на h8=${board.getCell(7, 0).figure !== null}`);

  return testResult(
    "Базовое движение ферзя",
    canMoveHorizontal === true && canMoveVertical === true && 
    canMoveDiagonal1 === true && canMoveDiagonal2 === true && cannotMoveKnight === true
  );
}

function testKingBasicMove(): boolean {
  console.log("\n=== Тест 18: Базовое движение короля ===");
  const board = createEmptyBoard();

  const king = new King(Colors.WHITE, board.getCell(3, 3)); // d5
  new King(Colors.BLACK, board.getCell(0, 0)); // a8

  const canMoveOneStep = king.canMove(board.getCell(4, 3)); // e5 (1 шаг)
  const canMoveDiagonal = king.canMove(board.getCell(4, 4)); // e6 (1 шаг по диагонали)
  const cannotMoveTwoSteps = !king.canMove(board.getCell(5, 3)); // f5 (2 шага)
  const cannotMoveKnight = !king.canMove(board.getCell(5, 4)); // f6 (ход коня)

  console.log(`  Король d5 может пойти на e5 (1 шаг): ${canMoveOneStep}`);
  console.log(`  Король d5 может пойти на e6 (1 по диагонали): ${canMoveDiagonal}`);
  console.log(`  Король d5 не может пойти на f5 (2 шага): ${cannotMoveTwoSteps}`);
  console.log(`  Король d5 не может пойти на f6 (как конь): ${cannotMoveKnight}`);

  return testResult(
    "Базовое движение короля",
    canMoveOneStep === true && canMoveDiagonal === true && 
    cannotMoveTwoSteps === true && cannotMoveKnight === true
  );
}

function testKingCannotMoveIntoCheck(): boolean {
  console.log("\n=== Тест 19: Король не может ходить под шах ===");
  const board = createEmptyBoard();

  const whiteKing = new King(Colors.WHITE, board.getCell(4, 7)); // e1
  new Rook(Colors.BLACK, board.getCell(4, 0)); // e8 - даёт шах по вертикали
  new King(Colors.BLACK, board.getCell(0, 0)); // a8

// Король не может пойти на e2 (все еще под шахом) - НЕ ДОЛЖЕН МОЧЬ
  // Но canMove() не проверяет шах, только базовое движение!
  const canMoveIntoCheckBasic = whiteKing.canMove(board.getCell(4, 6)); // e2 - базово может
  // Король может пойти на d1 (вне шаха)
  const canMoveOutOfCheckBasic = whiteKing.canMove(board.getCell(3, 7)); // d1 - базово может

  console.log(`  Король e1 базово может пойти на e2: ${canMoveIntoCheckBasic}`);
  console.log(`  Король e1 базово может пойти на d1: ${canMoveOutOfCheckBasic}`);

  // Проверяем легальность хода
  const isMoveIntoCheckLegal = board.isMoveLegal(board.getCell(4, 7), board.getCell(4, 6));
  const isMoveOutOfCheckLegal = board.isMoveLegal(board.getCell(4, 7), board.getCell(3, 7));

  return testResult(
    "Король не может ходить под шах",
    isMoveIntoCheckLegal === false && isMoveOutOfCheckLegal === true
  );
}

// === ТЕСТЫ СПЕЦИАЛЬНЫХ ХОДОВ ===

function testCastlingKingside(): boolean {
  console.log("\n=== Тест 20: Короткая рокировка ===");
  const board = createEmptyBoard();

  const whiteKing = new King(Colors.WHITE, board.getCell(4, 7)); // e1
  const whiteRook = new Rook(Colors.WHITE, board.getCell(7, 7)); // h1
  new King(Colors.BLACK, board.getCell(0, 0)); // a8

  // Проверяем, что король и ладья не двигались
  const canCastle = whiteKing.canMove(board.getCell(6, 7)); // g1
  const isMoveLegal = board.isMoveLegal(board.getCell(4, 7), board.getCell(6, 7));

  console.log(`  Белый король e1 может рокироваться на g1: ${canCastle}`);
  console.log(`  Рокировка легальна: ${isMoveLegal}`);

  // Выполняем рокировку
  const originalKingCell = board.getCell(4, 7); // e1
  const originalRookCell = board.getCell(7, 7); // h1
  
  // Проверяем состояние ПЕРЕД рокировкой
  const hadKingOnE1 = originalKingCell.figure === whiteKing;
  const hadRookOnH1 = originalRookCell.figure === whiteRook;
  
  whiteKing.moveFigure(board.getCell(6, 7)); // g1

  const kingOnG1 = board.getCell(6, 7).figure === whiteKing;
  const rookOnF1 = board.getCell(5, 7).figure === whiteRook;
  const kingMoved = !whiteKing.isFirstMove;
  const rookMoved = !(board.getCell(5, 7).figure as Rook)?.isFirstMove;
  // Проверяем что исходные клетки теперь пустые
  const kingMovedFromE1 = originalKingCell.figure === null;
  const rookMovedFromH1 = originalRookCell.figure === null;

  console.log(`  Король на g1: ${kingOnG1}`);
console.log(`  Ладья на f1: ${rookOnF1}`);
  console.log(`  Король двигался: ${kingMoved}`);
  console.log(`  Ладья двигалась: ${rookMoved}`);
  console.log(`  Король был на e1 ПЕРЕД рокировкой: ${hadKingOnE1}`);
  console.log(`  Ладья была на h1 ПЕРЕД рокировкой: ${hadRookOnH1}`);
  console.log(`  Король ушел с e1: ${kingMovedFromE1}`);
  console.log(`  Ладья ушла с h1: ${rookMovedFromH1}`);

  return testResult(
    "Короткая рокировка",
    canCastle === true && isMoveLegal === true &&
    kingOnG1 === true && rookOnF1 === true &&
    kingMoved === true && rookMoved === true &&
    kingMovedFromE1 === true && rookMovedFromH1 === true
  );
}

function testCastlingQueenside(): boolean {
  console.log("\n=== Тест 21: Длинная рокировка ===");
  const board = createEmptyBoard();

  const whiteKing = new King(Colors.WHITE, board.getCell(4, 7)); // e1
  const whiteRook = new Rook(Colors.WHITE, board.getCell(0, 7)); // a1
  new King(Colors.BLACK, board.getCell(0, 0)); // a8

  const canCastle = whiteKing.canMove(board.getCell(2, 7)); // c1
  const isMoveLegal = board.isMoveLegal(board.getCell(4, 7), board.getCell(2, 7));

  console.log(`  Белый король e1 может рокироваться на c1: ${canCastle}`);
  console.log(`  Рокировка легальна: ${isMoveLegal}`);

  // Выполняем рокировку
  whiteKing.moveFigure(board.getCell(2, 7));

  const kingOnC1 = board.getCell(2, 7).figure === whiteKing;
  const rookOnD1 = board.getCell(3, 7).figure === whiteRook;

  console.log(`  Король на c1: ${kingOnC1}`);
  console.log(`  Ладья на d1: ${rookOnD1}`);

  return testResult(
    "Длинная рокировка",
    canCastle === true && isMoveLegal === true &&
    kingOnC1 === true && rookOnD1 === true
  );
}

function testCastlingBlocked(): boolean {
  console.log("\n=== Тест 22: Рокировка заблокирована ===");
  const board = createEmptyBoard();

  const whiteKing = new King(Colors.WHITE, board.getCell(4, 7)); // e1
  new Rook(Colors.WHITE, board.getCell(7, 7)); // h1
  // Блокируем путь рокировки пешкой
  new Pawn(Colors.WHITE, board.getCell(5, 6)); // f2
  new King(Colors.BLACK, board.getCell(0, 0)); // a8

  const canCastleKingside = whiteKing.canMove(board.getCell(6, 7)); // g1

  // Тест с ладьей которая двигалась
  const board2 = createEmptyBoard();
  const king2 = new King(Colors.WHITE, board2.getCell(4, 7)); // e1
  const rook2 = new Rook(Colors.WHITE, board2.getCell(7, 7)); // h1
  rook2.isFirstMove = false; // Ладья двигалась
  new King(Colors.BLACK, board2.getCell(0, 0)); // a8

  const canCastleWithMovedRook = king2.canMove(board2.getCell(6, 7)); // g1

  console.log(`  Рокировка заблокирована пешкой f2: ${!canCastleKingside}`);
  console.log(`  Рокировка невозможна если ладья двигалась: ${!canCastleWithMovedRook}`);

  return testResult(
    "Рокировка заблокирована",
    canCastleKingside === false && canCastleWithMovedRook === false
  );
}

function testCastlingUnderAttack(): boolean {
  console.log("\n=== Тест 23: Рокировка под атакой ===");
  const board = createEmptyBoard();

  const whiteKing = new King(Colors.WHITE, board.getCell(4, 7)); // e1
  const whiteRook = new Rook(Colors.WHITE, board.getCell(7, 7)); // h1
  // Черный конь атакует поле f2 (через которое проходит король)
  new Knight(Colors.BLACK, board.getCell(5, 5)); // f3
  new King(Colors.BLACK, board.getCell(0, 0)); // a8

  const canCastleKingside = whiteKing.canMove(board.getCell(6, 7)); // g1
  const isMoveLegal = board.isMoveLegal(board.getCell(4, 7), board.getCell(6, 7));

  // Король под шахом
  const board2 = createEmptyBoard();
  const king2 = new King(Colors.WHITE, board2.getCell(4, 7)); // e1
  const rook2 = new Rook(Colors.WHITE, board2.getCell(7, 7)); // h1
  new Rook(Colors.BLACK, board2.getCell(4, 0)); // e8 - даёт шах королю
  new King(Colors.BLACK, board2.getCell(0, 0)); // a8

  const canCastleUnderCheck = king2.canMove(board2.getCell(6, 7)); // g1

  console.log(`  Рокировка невозможна под атакой f3: ${!canCastleKingside}`);
  console.log(`  Рокировка невозможна под шахом: ${!canCastleUnderCheck}`);

  return testResult(
    "Рокировка под атакой",
    canCastleKingside === false && isMoveLegal === false &&
    canCastleUnderCheck === false
  );
}

function testEnPassant(): boolean {
  console.log("\n=== Тест 24: Взятие на проходе ===");
  const board = createEmptyBoard();

  // Черная пешка делает ход на 2 клетки
  const blackPawn = new Pawn(Colors.BLACK, board.getCell(4, 1)); // e7
  blackPawn.isFirstStep = true;
  
  // Белая пешка на d5
  const whitePawn = new Pawn(Colors.WHITE, board.getCell(3, 3)); // d5
  new King(Colors.WHITE, board.getCell(4, 7)); // e1
  new King(Colors.BLACK, board.getCell(0, 0)); // a8

  // Черная пешка ходит с e7 на e5
  blackPawn.moveFigure(board.getCell(4, 3)); // e5
  board.lastMovedPawn = blackPawn;

  // Теперь белая пешка может взять черную на проходе
  const canEnPassant = whitePawn.canMove(board.getCell(4, 2)); // e6
  console.log(`  Белая пешка d5 может взять на проходе e6: ${canEnPassant}`);
  console.log(`  DEBUG: lastMovedPawn установлен: ${board.lastMovedPawn === blackPawn}`);
  console.log(`  DEBUG: Черная пешка на e5: ${board.getCell(4, 3).figure === blackPawn}`);

  // Выполняем взятие на проходе
  const targetCell = board.getCell(4, 2); // e6
  whitePawn.moveFigure(targetCell);

  const pawnOnE6 = board.getCell(4, 2).figure === whitePawn;
  const blackPawnCaptured = board.getCell(4, 3).figure !== blackPawn;
  const blackPawnInLostFigures = board.lostBlackFigures.includes(blackPawn);

  console.log(`  Белая пешка на e6: ${pawnOnE6}`);
  console.log(`  Черная пешка сбита: ${blackPawnCaptured}`);
  console.log(`  Черная пешка в списке сбитых: ${blackPawnInLostFigures}`);

  return testResult(
    "Взятие на проходе",
    canEnPassant === true && pawnOnE6 === true &&
    blackPawnCaptured === true && blackPawnInLostFigures === true
  );
}

function testEnPassantNotPossible(): boolean {
  console.log("\n=== Тест 25: Взятие на проходе невозможно ===");
  const board = createEmptyBoard();

  // Ситуация где взятие на проходе невозможно
  const blackPawn = new Pawn(Colors.BLACK, board.getCell(3, 1)); // d7
  const whitePawn = new Pawn(Colors.WHITE, board.getCell(2, 4)); // c4 (не на правильной линии)
  new King(Colors.WHITE, board.getCell(4, 7)); // e1
  new King(Colors.BLACK, board.getCell(0, 0)); // a8

  // Черная пешка ходит на 2 клетки
  blackPawn.moveFigure(board.getCell(3, 3)); // d5
  board.lastMovedPawn = blackPawn;

  // Белая пешка на c4 НЕ может взять на проходе
  const cannotEnPassant = !whitePawn.canMove(board.getCell(3, 2)); // d6

  console.log(`  Пешка c4 не может взять на проходе: ${cannotEnPassant}`);

  return testResult(
    "Взятие на проходе невозможно",
    cannotEnPassant === true
  );
}

function testPawnPromotion(): boolean {
  console.log("\n=== Тест 26: Превращение пешки ===");
  const board = createEmptyBoard();

  // Белая пешка на 7-й горизонтали (одно поле до превращения)
  const whitePawn = new Pawn(Colors.WHITE, board.getCell(3, 1)); // d7
  new King(Colors.WHITE, board.getCell(4, 7)); // e1
  new King(Colors.BLACK, board.getCell(0, 0)); // a8

  // Проверяем, что при ходе на 8-ю горизонталь нужно превращение
  const needsPromotion = board.getCell(3, 1).isPawnPromotion(whitePawn, 0); // d8

  console.log(`  Пешка d7 при ходе на d8 требует превращения: ${needsPromotion}`);

  // Черная пешка на 2-й горизонтали
  const blackPawn = new Pawn(Colors.BLACK, board.getCell(3, 6)); // d2
  const needsPromotionBlack = board.getCell(3, 6).isPawnPromotion(blackPawn, 7); // d1

  console.log(`  Черная пешка d2 при ходе на d1 требует превращения: ${needsPromotionBlack}`);

  // Пешка не в позиции превращения
  const pawnNotInPosition = new Pawn(Colors.WHITE, board.getCell(3, 2)); // d6
  // Проверяем превращение при ходе с d6 на d8
  const noPromotionNeeded = board.getCell(3, 2).isPawnPromotion(pawnNotInPosition, 0);

  console.log(`  Пешка d6 при ходе на d8 требует превращения: ${noPromotionNeeded}`);

  return testResult(
    "Превращение пешки",
    needsPromotion === true && needsPromotionBlack === true && noPromotionNeeded === true
  );
}

function testPawnPromotionWithMove(): boolean {
  console.log("\n=== Тест 27: Превращение пешки при ходе ===");
  const board = createEmptyBoard();

  const whitePawn = new Pawn(Colors.WHITE, board.getCell(3, 1)); // d7
  new King(Colors.WHITE, board.getCell(4, 7)); // e1
  new King(Colors.BLACK, board.getCell(0, 0)); // a8

  // Ход пешкой на последнюю горизонталь
  const needsPromotion = board.getCell(3, 1).moveFigure(board.getCell(3, 0)); // d8

  console.log(`  Ход d7-d8 требует превращения: ${needsPromotion}`);
  console.log(`  Пешка осталась на d7: ${board.getCell(3, 1).figure === whitePawn}`);
  console.log(`  На d8 пусто (ожидают фигуру): ${board.getCell(3, 0).figure === null}`);

  return testResult(
    "Превращение пешки при выполнении хода",
    needsPromotion === true
  );
}

// === ТЕСТЫ ГРАНИЦ И НЕКОРРЕКТНЫХ ХОДОВ ===

function testFigureBoardBoundaries(): boolean {
  console.log("\n=== Тест 28: Границы доски для фигур ===");
  const board = createEmptyBoard();

  // Фигуры в углах и на краях доски
  const cornerRook = new Rook(Colors.WHITE, board.getCell(0, 0)); // a1
  const edgeKing = new King(Colors.WHITE, board.getCell(0, 4)); // a5
  const centerQueen = new Queen(Colors.WHITE, board.getCell(4, 4)); // e5
  new King(Colors.BLACK, board.getCell(7, 0)); // h8

  // Проверяем ходы за пределы доски (должны быть невозможны)
  // Создаем временные клетки за пределами доски
  const leftCell = { x: -1, y: 0, figure: null } as any;
  const rightCell = { x: 8, y: 0, figure: null } as any;
  const upCell = { x: 0, y: -1, figure: null } as any;
  const downCell = { x: 0, y: 8, figure: null } as any;
  
  const canMoveOffBoardLeft = !cornerRook.canMove(leftCell);
  const canMoveOffBoardRight = !cornerRook.canMove(rightCell);
  const canMoveOffBoardUp = !cornerRook.canMove(upCell);
  const canMoveOffBoardDown = !cornerRook.canMove(downCell);

  // Проверяем нормальные ходы в пределах доски
  const canMoveOnBoard = cornerRook.canMove(board.getCell(0, 7)); // a8
  const kingCanMove = edgeKing.canMove(board.getCell(1, 4)); // b5
  const queenCanMove = centerQueen.canMove(board.getCell(7, 4)); // h5

  console.log(`  Ладья a1 не может ходить за пределы доски: ${canMoveOffBoardLeft && canMoveOffBoardRight && canMoveOffBoardUp && canMoveOffBoardDown}`);
  console.log(`  Ладья a1 может ходить на a8: ${canMoveOnBoard}`);
  console.log(`  Король a5 может ходить на b5: ${kingCanMove}`);
  console.log(`  Ферзь e5 может ходить на h5: ${queenCanMove}`);

  return testResult(
    "Границы доски для фигур",
    canMoveOffBoardLeft && canMoveOffBoardRight && canMoveOffBoardUp && canMoveOffBoardDown &&
    canMoveOnBoard && kingCanMove && queenCanMove
  );
}

function testInvalidKnightMoves(): boolean {
  console.log("\n=== Тест 29: Некорректные ходы коня ===");
  const board = createEmptyBoard();

  const knight = new Knight(Colors.WHITE, board.getCell(3, 3)); // d5
  new King(Colors.BLACK, board.getCell(0, 0)); // a8

  // Конь не должен ходить как другие фигуры
  const cannotMoveStraight = !knight.canMove(board.getCell(3, 7)); // d8 (прямо)
  const cannotMoveDiagonal = !knight.canMove(board.getCell(7, 7)); // h8 (по диагонали)
  const cannotMoveOneStep = !knight.canMove(board.getCell(4, 3)); // e5 (на 1 шаг)
  const cannotMoveThreeSteps = !knight.canMove(board.getCell(6, 3)); // g5 (на 3 шага)

  // Корректные ходы конем
  const canMoveLShape = knight.canMove(board.getCell(5, 4)); // f6 (буквой Г)

  console.log(`  Конь не может ходить прямо: ${cannotMoveStraight}`);
  console.log(`  Конь не может ходить по диагонали: ${cannotMoveDiagonal}`);
  console.log(`  Конь не может ходить на 1 шаг: ${cannotMoveOneStep}`);
  console.log(`  Конь не может ходить на 3 шага: ${cannotMoveThreeSteps}`);
  console.log(`  Конь может ходить буквой Г: ${canMoveLShape}`);

  return testResult(
    "Некорректные ходы коня",
    cannotMoveStraight && cannotMoveDiagonal && cannotMoveOneStep && 
    cannotMoveThreeSteps && canMoveLShape
  );
}

function testPawnWrongDirection(): boolean {
  console.log("\n=== Тест 30: Пешка не может ходить назад ===");
  const board = createEmptyBoard();

  // Белая пешка не может ходить вниз (вперед = вверх, y уменьшается)
  const whitePawn = new Pawn(Colors.WHITE, board.getCell(4, 4)); // e4
  // Черная пешка не может ходить вверх (вперед = вниз, y увеличивается)
  const blackPawn = new Pawn(Colors.BLACK, board.getCell(3, 3)); // d6
  new King(Colors.WHITE, board.getCell(4, 7)); // e1
  new King(Colors.BLACK, board.getCell(0, 0)); // a8

  // Белая пешка не может ходить вниз
  const whiteCannotMoveDown = !whitePawn.canMove(board.getCell(4, 5)); // e3 (назад)
  const whiteCannotCaptureBack = !whitePawn.canMove(board.getCell(3, 5)); // d3 (назад по диагонали)

  // Черная пешка не может ходить вверх
  const blackCannotMoveUp = !blackPawn.canMove(board.getCell(3, 2)); // d7 (назад)
  const blackCannotCaptureBack = !blackPawn.canMove(board.getCell(4, 2)); // e7 (назад по диагонали)

  console.log(`  Белая пешка e4 не может ходить на e3 (назад): ${whiteCannotMoveDown}`);
  console.log(`  Белая пешка e4 не может брать на d3 (назад): ${whiteCannotCaptureBack}`);
  console.log(`  Черная пешка d6 не может ходить на d7 (назад): ${blackCannotMoveUp}`);
  console.log(`  Черная пешка d6 не может брать на e7 (назад): ${blackCannotCaptureBack}`);

  return testResult(
    "Пешка не может ходить назад",
    whiteCannotMoveDown && whiteCannotCaptureBack && 
    blackCannotMoveUp && blackCannotCaptureBack
  );
}

function testCannotCaptureOwnPiece(): boolean {
  console.log("\n=== Тест 31: Нельзя брать свои фигуры ===");
  const board = createEmptyBoard();

  const whiteQueen = new Queen(Colors.WHITE, board.getCell(4, 4)); // e5
  new Pawn(Colors.WHITE, board.getCell(5, 4)); // f5 (своя фигура)
  new Pawn(Colors.BLACK, board.getCell(6, 4)); // g5 (вражеская фигура)
  new King(Colors.WHITE, board.getCell(4, 7)); // e1
  new King(Colors.BLACK, board.getCell(0, 0)); // a8

  const cannotCaptureOwn = !whiteQueen.canMove(board.getCell(5, 4)); // нельзя брать свою пешку
  const canCaptureEnemy = whiteQueen.canMove(board.getCell(6, 4)); // можно брать вражескую пешку

  console.log(`  Ферзь не может взять свою пешку: ${cannotCaptureOwn}`);
  console.log(`  Ферзь может взять вражескую пешку: ${canCaptureEnemy}`);

  return testResult(
    "Нельзя брать свои фигуры",
    cannotCaptureOwn && canCaptureEnemy
  );
}

function testKingNearKing(): boolean {
  console.log("\n=== Тест 32: Короли не могут стоять рядом ===");
  const board = createEmptyBoard();

  const whiteKing = new King(Colors.WHITE, board.getCell(4, 7)); // e1
  const blackKing = new King(Colors.BLACK, board.getCell(3, 6)); // d2 (рядом с белым)
  new King(Colors.BLACK, board.getCell(0, 0)); // a8

  // Черный король не может подойти к белому ближе чем на 1 клетку
  const cannotMoveNearWhite = !blackKing.canMove(board.getCell(4, 6)); // e2 (рядом с белым)
  const canMoveAway = blackKing.canMove(board.getCell(2, 6)); // c2 (достаточно далеко)

  // Белый король не может подойти к черному
  const whiteCannotMoveNearBlack = !whiteKing.canMove(board.getCell(3, 6)); // d2 (занято черным)
  const whiteCanMoveAway = whiteKing.canMove(board.getCell(4, 6)); // e2 (подходит?)

  console.log(`  Черный король не может подойти к белому: ${cannotMoveNearWhite}`);
  console.log(`  Черный король может уйти прочь: ${canMoveAway}`);
  console.log(`  Белый король не может занять клетку черного: ${whiteCannotMoveNearBlack}`);

  return testResult(
    "Короли не могут стоять рядом",
    cannotMoveNearWhite && canMoveAway && whiteCannotMoveNearBlack
  );
}

function testBlockedByPieces(): boolean {
  console.log("\n=== Тест 33: Фигуры блокируют путь друг другу ===");
  const board = createEmptyBoard();

  // Ладья заблокирована своими пешками
  const rook = new Rook(Colors.WHITE, board.getCell(3, 3)); // d5
  new Pawn(Colors.WHITE, board.getCell(3, 4)); // d6 (блокирует вверх)
  new Pawn(Colors.WHITE, board.getCell(2, 3)); // c5 (блокирует влево)
  new King(Colors.WHITE, board.getCell(4, 7)); // e1
  new King(Colors.BLACK, board.getCell(0, 0)); // a8

  const cannotMoveThroughOwnUp = !rook.canMove(board.getCell(3, 7)); // d8 (через пешку)
  const cannotMoveThroughOwnLeft = !rook.canMove(board.getCell(0, 3)); // a5 (через пешку)
  // Ладья может взять вражескую пешку на d6 (черная)
  new Pawn(Colors.BLACK, board.getCell(3, 4)); // d6
  const canCaptureEnemy = rook.canMove(board.getCell(3, 4)); // может взять врага? Да!

  // Слон заблокирован
  const bishop = new Bishop(Colors.WHITE, board.getCell(2, 2)); // c6
  new Pawn(Colors.WHITE, board.getCell(3, 3)); // d5 (блокирует диагональ)
  const cannotMoveDiagonalBlocked = !bishop.canMove(board.getCell(4, 4)); // e4 (через пешку)

  console.log(`  Ладья не может пройти через свою пешку вверх: ${cannotMoveThroughOwnUp}`);
  console.log(`  Ладья не может пройти через свою пешку влево: ${cannotMoveThroughOwnLeft}`);
  console.log(`  Слон не может пройти через свою пешку по диагонали: ${cannotMoveDiagonalBlocked}`);

  return testResult(
    "Фигуры блокируют путь",
    cannotMoveThroughOwnUp && cannotMoveThroughOwnLeft && cannotMoveDiagonalBlocked
  );
}

function testIllegalMovesPrevention(): boolean {
  console.log("\n=== Тест 34: Предотвращение нелегальных ходов ===");
  const board = createEmptyBoard();

  const whiteKing = new King(Colors.WHITE, board.getCell(4, 7)); // e1
  const whiteRook = new Rook(Colors.WHITE, board.getCell(3, 7)); // d1
  new King(Colors.BLACK, board.getCell(0, 0)); // a8

  // Создаем шах белому королю
  new Queen(Colors.BLACK, board.getCell(4, 0)); // e8

  // Белые фигуры не могут делать ходы, которые оставляют короля под шахом
  const cannotMoveRookWhileInCheck = !board.isMoveLegal(board.getCell(3, 7), board.getCell(3, 0)); // d1-d8 оставляет короля под шахом

  // Король не может ходить под шах
  const cannotMoveKingIntoCheck = !board.isMoveLegal(board.getCell(4, 7), board.getCell(5, 7)); // e1-f1 под шахом от e8

  // Но король может уйти из-под шаха
  const canMoveKingOutOfCheck = board.isMoveLegal(board.getCell(4, 7), board.getCell(3, 7)); // e1-d1 (укрыться за ладьей)

  console.log(`  Ладья не может ходить пока король под шахом: ${cannotMoveRookWhileInCheck}`);
  console.log(`  Король не может ходить под шах: ${cannotMoveKingIntoCheck}`);
  console.log(`  Король может уйти из-под шаха: ${canMoveKingOutOfCheck}`);

  return testResult(
    "Предотвращение нелегальных ходов",
    cannotMoveRookWhileInCheck && cannotMoveKingIntoCheck && canMoveKingOutOfCheck
  );
}

// === ТЕСТЫ БЛОКИРОВКИ И ПЕРЕКРЫТИЯ АТАК ===

function testBlockCheckWithPiece(): boolean {
  console.log("\n=== Тест 35: Перекрытие шаха фигурой ===");
  const board = createEmptyBoard();

  const whiteKing = new King(Colors.WHITE, board.getCell(4, 7)); // e1
  const blackRook = new Rook(Colors.BLACK, board.getCell(4, 0)); // e8 - дает шах по вертикали
  const whiteBishop = new Bishop(Colors.WHITE, board.getCell(3, 3)); // d5 - может перекрыть
  new King(Colors.BLACK, board.getCell(0, 0)); // a8

  const isCheck = board.isKingUnderAttack(Colors.WHITE);
  const canBlock = whiteBishop.canMove(board.getCell(4, 3)); // e4 перекрывает шах
  const isCheckmate = board.isCheckmate(Colors.WHITE);

  console.log(`  Черная ладья e8 дает шах белому королю: ${isCheck}`);
  console.log(`  Белый слон d5 может перекрыть на e4: ${canBlock}`);
  console.log(`  Это не мат (можно перекрыть): ${isCheckmate === false}`);

  return testResult(
    "Перекрытие шаха фигурой",
    isCheck === true && canBlock === true && isCheckmate === false
  );
}

function testCannotBlockKnightCheck(): boolean {
  console.log("\n=== Тест 36: Нельзя перекрыть шах от коня ===");
  const board = createEmptyBoard();

  const whiteKing = new King(Colors.WHITE, board.getCell(4, 7)); // e1
  const blackKnight = new Knight(Colors.BLACK, board.getCell(5, 5)); // f3 - дает шах
  const whitePawn = new Pawn(Colors.WHITE, board.getCell(4, 6)); // e2
  new King(Colors.BLACK, board.getCell(0, 0)); // a8

  const isCheck = board.isKingUnderAttack(Colors.WHITE);
  // Пешка не может перекрыть атаку коня (у коня нет линии атаки)
  const cannotBlock = !whitePawn.canMove(board.getCell(4, 5)); // e3 (попытка перекрыть)
  const isCheckmate = board.isCheckmate(Colors.WHITE);

  console.log(`  Черный конь f3 дает шах: ${isCheck}`);
  console.log(`  Белая пешка не может перекрыть атаку коня: ${cannotBlock}`);
  console.log(`  Король должен ходить сам: ${isCheckmate === false}`);

  return testResult(
    "Нельзя перекрыть шах от коня",
    isCheck === true && cannotBlock === true && isCheckmate === false
  );
}

function testBlockDiagonalCheck(): boolean {
  console.log("\n=== Тест 37: Перекрытие диагонального шаха ===");
  const board = createEmptyBoard();

  const whiteKing = new King(Colors.WHITE, board.getCell(3, 7)); // d1
  const blackBishop = new Bishop(Colors.BLACK, board.getCell(0, 4)); // a5 - дает шах по диагонали
  const whitePawn = new Pawn(Colors.WHITE, board.getCell(1, 6)); // b2 - может перекрыть
  new King(Colors.BLACK, board.getCell(7, 0)); // h8

  const isCheck = board.isKingUnderAttack(Colors.WHITE);
  const canBlock = whitePawn.canMove(board.getCell(1, 5)); // c3 перекрывает диагональ
  const isNotCheckmate = !board.isCheckmate(Colors.WHITE);

  console.log(`  Черный слон a5 дает шах по диагонали: ${isCheck}`);
  console.log(`  Белая пешка b2 может перекрыть на c3: ${canBlock}`);
  console.log(`  Не мат (можно перекрыть): ${isNotCheckmate}`);

  return testResult(
    "Перекрытие диагонального шаха",
    isCheck === true && canBlock === true && isNotCheckmate === true
  );
}

function testCaptureAttackerInsteadOfBlocking(): boolean {
  console.log("\n=== Тест 38: Взятие атакующей вместо перекрытия ===");
  const board = createEmptyBoard();

  const whiteKing = new King(Colors.WHITE, board.getCell(4, 7)); // e1
  const blackRook = new Rook(Colors.BLACK, board.getCell(4, 4)); // e5 - дает шах
  const whiteQueen = new Queen(Colors.WHITE, board.getCell(2, 6)); // c2
  new King(Colors.BLACK, board.getCell(0, 0)); // a8

  const isCheck = board.isKingUnderAttack(Colors.WHITE);
  const canCaptureAttacker = whiteQueen.canMove(board.getCell(4, 4)); // c2-e5 взять ладью
  const isNotCheckmate = !board.isCheckmate(Colors.WHITE);

  console.log(`  Черная ладья e5 дает шах: ${isCheck}`);
  console.log(`  Белый ферзь c2 может взять ладью: ${canCaptureAttacker}`);
  console.log(`  Не мат (можно взять атакующего): ${isNotCheckmate}`);

  return testResult(
    "Взятие атакующей вместо перекрытия",
    isCheck === true && canCaptureAttacker === true && isNotCheckmate === true
  );
}

function testDoubleCheckNoBlock(): boolean {
  console.log("\n=== Тест 39: Двойной шах нельзя перекрыть ===");
  const board = createEmptyBoard();

  const whiteKing = new King(Colors.WHITE, board.getCell(4, 7)); // e1
  const blackRook = new Rook(Colors.BLACK, board.getCell(4, 0)); // e8 - шах по вертикали
  const blackBishop = new Bishop(Colors.BLACK, board.getCell(1, 4)); // b4 - шах по диагонали
  const whitePawn = new Pawn(Colors.WHITE, board.getCell(3, 6)); // d2

  const isCheck = board.isKingUnderAttack(Colors.WHITE);
  const isDoubleCheck = board.isCellUnderAttack(board.getCell(4, 7), Colors.WHITE); // проверяем двойную атаку
  const canBlock = whitePawn.canMove(board.getCell(4, 6)); // e3 попытка перекрыть
  const isCheckmate = board.isCheckmate(Colors.WHITE);

  console.log(`  Двойной шах белому королю: ${isCheck}`);
  console.log(`  Пешка не может перекрыть двойной шах: ${!canBlock}`);
  console.log(`  Только король может ходить: ${isCheckmate === false}`);

  return testResult(
    "Двойной шах нельзя перекрыть",
    isCheck === true && canBlock === false && isCheckmate === false
  );
}

function testDiscoveredCheck(): boolean {
  console.log("\n=== Тест 40: Открытый шах ===");
  const board = createEmptyBoard();

  const blackKing = new King(Colors.BLACK, board.getCell(4, 0)); // e8
  const whiteRook = new Rook(Colors.WHITE, board.getCell(4, 2)); // e7
  const whitePawn = new Pawn(Colors.WHITE, board.getCell(4, 3)); // e6 - блокирует ладью
  new King(Colors.WHITE, board.getCell(0, 7)); // a1

  // Изначально нет шаха (пешка блокирует)
  const isNotCheckBefore = !board.isKingUnderAttack(Colors.BLACK);
  
  // Пешка ходит, открывая ладью
  whitePawn.moveFigure(board.getCell(4, 4)); // e5
  
  const isDiscoveredCheck = board.isKingUnderAttack(Colors.BLACK);
  const isCheckmate = board.isCheckmate(Colors.BLACK);

  console.log(`  До хода пешки нет шаха: ${isNotCheckBefore}`);
  console.log(`  После хода пешки открытый шах: ${isDiscoveredCheck}`);
  console.log(`  Не мат (король может уйти): ${isCheckmate === false}`);

  return testResult(
    "Открытый шах",
    isNotCheckBefore === true && isDiscoveredCheck === true && isCheckmate === false
  );
}

function testPinCannotMove(): boolean {
  console.log("\n=== Тест 41: Связанная фигура не может ходить ===");
  const board = createEmptyBoard();

  const whiteKing = new King(Colors.WHITE, board.getCell(4, 7)); // e1
  const blackBishop = new Bishop(Colors.BLACK, board.getCell(0, 4)); // a5
  const whiteKnight = new Knight(Colors.WHITE, board.getCell(2, 6)); // c2 - между королем и слоном
  new King(Colors.BLACK, board.getCell(0, 0)); // a8

  // Слон атакует короля по диагонали a5-e1, конь связан
  const isKingInAttack = board.isCellUnderAttack(board.getCell(4, 7), Colors.WHITE);
  
  // Конь не может ходить (связан)
  const knightCanMove = whiteKnight.canMove(board.getCell(3, 4)); // d5
  const knightMoveIsIllegal = !board.isMoveLegal(board.getCell(2, 6), board.getCell(3, 4));

  console.log(`  Король под атакой слона: ${isKingInAttack}`);
  console.log(`  Конь не может ходить (связан): ${!knightCanMove}`);
  console.log(`  Ход коня нелегален: ${knightMoveIsIllegal}`);

  return testResult(
    "Связанная фигура не может ходить",
    isKingInAttack === true && !knightCanMove === true && knightMoveIsIllegal === true
  );
}

// === ТЕСТЫ РЕАЛЬНЫХ ИГРОВЫХ СЦЕНАРИЕВ ===

function testScholarsMate(): boolean {
  console.log("\n=== Тест 42: Мат ученого (Scholar's Mate) ===");
  const board = createEmptyBoard();

  // Классическая позиция мата ученого
  // Белые: король g1, ферзь f7 дает мат
  // Черные: король e8, пешка g7 блокирует
  new King(Colors.WHITE, board.getCell(6, 7)); // g1
  new Queen(Colors.WHITE, board.getCell(5, 1)); // f7
  
  new King(Colors.BLACK, board.getCell(4, 0)); // e8
  new Pawn(Colors.BLACK, board.getCell(6, 1)); // g7 блокирует
  
  const isCheck = board.isKingUnderAttack(Colors.BLACK);
  const isCheckmate = board.isCheckmate(Colors.BLACK);

  console.log(`  Белый ферзь f7 атакует черного короля: ${isCheck}`);
  console.log(`  Черная пешка g7 блокирует выход королю: ${isCheckmate}`);

  return testResult(
    "Мат ученого",
    isCheck === true && isCheckmate === true
  );
}

function testBackRankDefense(): boolean {
  console.log("\n=== Тест 43: Защита последней горизонтали ===");
  const board = createEmptyBoard();

  // Позиция где ладья дает мат, но есть защита
  new King(Colors.WHITE, board.getCell(4, 7)); // e1
  new Rook(Colors.WHITE, board.getCell(3, 3)); // d5 - может перекрыть
  new Rook(Colors.BLACK, board.getCell(4, 0)); // e8 - дает шах
  
  new King(Colors.BLACK, board.getCell(0, 0)); // a8

  const isCheck = board.isKingUnderAttack(Colors.WHITE);
  const canBlock = board.getCell(3, 3).figure?.canMove(board.getCell(4, 3)); // e4
  const isNotCheckmate = !board.isCheckmate(Colors.WHITE);

  console.log(`  Черная ладья e8 дает шах: ${isCheck}`);
  console.log(`  Белая ладья d5 может перекрыть на e4: ${canBlock}`);
  console.log(`  Не мат (есть защита): ${isNotCheckmate}`);

  return testResult(
    "Защита последней горизонтали",
    isCheck === true && canBlock === true && isNotCheckmate === true
  );
}

function testForkKnight(): boolean {
  console.log("\n=== Тест 44: Вилка конем ===");
  const board = createEmptyBoard();

  // Конь атакует одновременно короля и ферзя
  new King(Colors.WHITE, board.getCell(4, 7)); // e1
  new Queen(Colors.WHITE, board.getCell(0, 7)); // a8
  
  new Knight(Colors.BLACK, board.getCell(3, 5)); // d3 - атакует e1 и a8
  new King(Colors.BLACK, board.getCell(7, 0)); // h8

  const attacksKing = board.getCell(3, 5).figure?.canMove(board.getCell(4, 7)); // e1
  const attacksQueen = board.getCell(3, 5).figure?.canMove(board.getCell(0, 7)); // a8
  const isCheck = board.isKingUnderAttack(Colors.WHITE);

  console.log(`  Черный конь d3 атакует короля e1: ${attacksKing}`);
  console.log(`  Черный конь d3 атакует ферзя a8: ${attacksQueen}`);
  console.log(`  Белому королю шах: ${isCheck}`);

  return testResult(
    "Вилка конем",
    attacksKing === true && attacksQueen === true && isCheck === true
  );
}

function testPinAndWin(): boolean {
  console.log("\n=== Тест 45: Связывание и выигрыш ===");
  const board = createEmptyBoard();

  // Ладья связывает ферзя с королем
  new King(Colors.BLACK, board.getCell(4, 0)); // e8
  new Queen(Colors.BLACK, board.getCell(2, 2)); // c6 - связана с королем
  
  new Rook(Colors.WHITE, board.getCell(2, 7)); // a1 связывает ферзя
  new King(Colors.WHITE, board.getCell(7, 7)); // h8

  const queenIsPinned = !board.isMoveLegal(board.getCell(2, 2), board.getCell(3, 2)); // ферзь не может ходить
  const isKingInCheck = board.isKingUnderAttack(Colors.BLACK);

  console.log(`  Черный ферзь связан с королем: ${queenIsPinned}`);
  console.log(`  Черный король под шахом: ${isKingInCheck}`);

  return testResult(
    "Связывание и выигрыш",
    queenIsPinned === true && isKingInCheck === true
  );
}

function testEndgameKingAndQueen(): boolean {
  console.log("\n=== Тест 46: Эндшпиль король против ферзя ===");
  const board = createEmptyBoard();

  // Элементарный мат королем и ферзем
  new King(Colors.WHITE, board.getCell(6, 6)); // g2
  new Queen(Colors.WHITE, board.getCell(3, 3)); // d5
  
  new King(Colors.BLACK, board.getCell(4, 0)); // e8

  // Король в углу, ферзь дает мат
  const isCheck = board.isKingUnderAttack(Colors.BLACK);
  const isCheckmate = board.isCheckmate(Colors.BLACK);

  console.log(`  Белый ферзь и король против черного короля: ${isCheck}`);
  console.log(`  Черному королю мат: ${isCheckmate}`);

  return testResult(
    "Эндшпиль король против ферзя",
    isCheck === true && isCheckmate === true
  );
}

function testOpposition(): boolean {
  console.log("\n=== Тест 47: Оппозиция королей ===");
  const board = createEmptyBoard();

  // Короли в оппозиции - ключевой концепт эндшпиля
  new King(Colors.WHITE, board.getCell(4, 4)); // e5
  new King(Colors.BLACK, board.getCell(4, 2)); // e7
  
  const whiteKingCannotMoveToE6 = !board.getCell(4, 4).figure?.canMove(board.getCell(4, 3)); // e6 (близко к черному)
  const blackKingCannotMoveToE6 = !board.getCell(4, 2).figure?.canMove(board.getCell(4, 3)); // e6 (близко к белому)
  const whiteCanMoveAway = board.getCell(4, 4).figure?.canMove(board.getCell(5, 4)); // f5

  console.log(`  Белый король не может подойти к черному: ${whiteKingCannotMoveToE6}`);
  console.log(`  Черный король не может подойти к белому: ${blackKingCannotMoveToE6}`);
  console.log(`  Белый король может ходить в сторону: ${whiteCanMoveAway}`);

  return testResult(
    "Оппозиция королей",
    whiteKingCannotMoveToE6 === true && blackKingCannotMoveToE6 === true && whiteCanMoveAway === true
  );
}

function testZugzwang(): boolean {
  console.log("\n=== Тест 48: Цугцванг ===");
  const board = createEmptyBoard();

  // Позиция где любой ход ухудшает ситуацию
  new King(Colors.WHITE, board.getCell(6, 7)); // g1
  new Pawn(Colors.WHITE, board.getCell(6, 6)); // g2
  
  new King(Colors.BLACK, board.getCell(4, 0)); // e8
  new Queen(Colors.BLACK, board.getCell(5, 2)); // f6 - готова дать мат

  const whiteNotCheckmate = !board.isCheckmate(Colors.WHITE);
  const blackNotCheckmate = !board.isCheckmate(Colors.BLACK);
  
  console.log(`  У белых есть легальные ходы: ${whiteNotCheckmate}`);
  console.log(`  У черных есть легальные ходы: ${blackNotCheckmate}`);

  // Проверяем что ход белых может привести к мату
  const isCheck = board.isKingUnderAttack(Colors.WHITE);
  console.log(`  Белому королю сейчас шах: ${isCheck}`);

  return testResult(
    "Цугцванг (любой ход плох)",
    whiteNotCheckmate === true && blackNotCheckmate === true
  );
}

function testUnderpromotion(): boolean {
  console.log("\n=== Тест 49: Неполноценное превращение пешки ===");
  const board = createEmptyBoard();

  // Пешка превращается не в ферзя
  const whitePawn = new Pawn(Colors.WHITE, board.getCell(3, 1)); // d7
  
  new King(Colors.WHITE, board.getCell(4, 7)); // e1
  new King(Colors.BLACK, board.getCell(0, 0)); // a8

  // Ход на последнюю горизонталь
  const needsPromotion = board.getCell(3, 1).moveFigure(board.getCell(3, 0)); // d8

  // Проверяем что можно превратить в любую фигуру
  const canPromoteToKnight = new Knight(Colors.WHITE, board.getCell(3, 0));
  const canPromoteToBishop = new Bishop(Colors.WHITE, board.getCell(3, 0));
  const canPromoteToRook = new Rook(Colors.WHITE, board.getCell(3, 0));
  const canPromoteToQueen = new Queen(Colors.WHITE, board.getCell(3, 0));

  console.log(`  Ход d7-d8 требует превращения: ${needsPromotion}`);
  console.log(`  Можно превратить в коня: ${!!canPromoteToKnight}`);
  console.log(`  Можно превратить в слона: ${!!canPromoteToBishop}`);
  console.log(`  Можно превратить в ладью: ${!!canPromoteToRook}`);
  console.log(`  Можно превратить в ферзя: ${!!canPromoteToQueen}`);

  return testResult(
    "Неполноценное превращение пешки",
    needsPromotion === true
  );
}

function testRealGamePosition(): boolean {
  console.log("\n=== Тест 50: Реальная игровая позиция ===");
  const board = createEmptyBoard();

  // Симулируем среднегеймовую позицию
  // Белые: король g1, ферзь d1, ладьи a1, h1, слоны c1, f1, кони b1, g1, пешки a2, b2, c3, d4, e4, f3, g2, h2
  // Черные: король g8, ферзь d8, ладьи a8, f8, слоны c8, f5, кони b8, c6, пешки a7, b7, c7, e5, g7, h7
  
  new King(Colors.WHITE, board.getCell(6, 7)); // g1
  new Queen(Colors.WHITE, board.getCell(3, 7)); // d1
  new Rook(Colors.WHITE, board.getCell(0, 7)); // a1
  new Rook(Colors.WHITE, board.getCell(7, 7)); // h1
  new Bishop(Colors.WHITE, board.getCell(2, 7)); // c1
  new Bishop(Colors.WHITE, board.getCell(5, 7)); // f1
  new Knight(Colors.WHITE, board.getCell(1, 7)); // b1
  new Knight(Colors.WHITE, board.getCell(6, 6)); // g2
  
  new King(Colors.BLACK, board.getCell(6, 0)); // g8
  new Queen(Colors.BLACK, board.getCell(3, 0)); // d8
  new Rook(Colors.BLACK, board.getCell(0, 0)); // a8
  new Rook(Colors.BLACK, board.getCell(5, 0)); // f8
  new Bishop(Colors.BLACK, board.getCell(2, 0)); // c8
  new Bishop(Colors.BLACK, board.getCell(5, 2)); // f5
  
  const whiteNotCheckmate = !board.isCheckmate(Colors.WHITE);
  const blackNotCheckmate = !board.isCheckmate(Colors.BLACK);
  const whiteNotInCheck = !board.isKingUnderAttack(Colors.WHITE);
  const blackNotInCheck = !board.isKingUnderAttack(Colors.BLACK);

  console.log(`  У белых есть легальные ходы: ${whiteNotCheckmate}`);
  console.log(`  У черных есть легальные ходы: ${blackNotCheckmate}`);
  console.log(`  Белому королю не шах: ${whiteNotInCheck}`);
  console.log(`  Черному королю не шах: ${blackNotInCheck}`);

  return testResult(
    "Реальная игровая позиция",
    whiteNotCheckmate === true && blackNotCheckmate === true &&
    whiteNotInCheck === true && blackNotInCheck === true
  );
}

function runAllTests() {
  console.log("ТЕСТЫ ЛОГИКИ");

  const results: boolean[] = [];

  results.push(testBasicCheck());
  results.push(testNoCheck());
  results.push(testFoolsMateCheckmate());
  results.push(testBackRankMate());
  results.push(testCheckButNotMate());
  results.push(testCheckCanBeBlocked());
  results.push(testStalemate());
  results.push(testPawnCanCaptureAttacker());
  results.push(testKnightCheck());
  results.push(testDoubleCheck());
  
  // Новые тесты движения фигур
  results.push(testPawnBasicMove());
  results.push(testPawnDiagonalCapture());
  results.push(testRookBasicMove());
  results.push(testRookBlockedPath());
  results.push(testBishopBasicMove());
  results.push(testKnightBasicMove());
  results.push(testQueenBasicMove());
  results.push(testKingBasicMove());
  results.push(testKingCannotMoveIntoCheck());
  
  // Тесты специальных ходов
  results.push(testCastlingKingside());
  results.push(testCastlingQueenside());
  results.push(testCastlingBlocked());
  results.push(testCastlingUnderAttack());
  results.push(testEnPassant());
  results.push(testEnPassantNotPossible());
  results.push(testPawnPromotion());
  results.push(testPawnPromotionWithMove());

  // Тесты границ и некорректных ходов
  results.push(testFigureBoardBoundaries());
  results.push(testInvalidKnightMoves());
  results.push(testPawnWrongDirection());
  results.push(testCannotCaptureOwnPiece());
  results.push(testKingNearKing());
  results.push(testBlockedByPieces());
  results.push(testIllegalMovesPrevention());

  // Тесты блокировки и перекрытия атак
  results.push(testBlockCheckWithPiece());
  results.push(testCannotBlockKnightCheck());
  results.push(testBlockDiagonalCheck());
  results.push(testCaptureAttackerInsteadOfBlocking());
  results.push(testDoubleCheckNoBlock());
  results.push(testDiscoveredCheck());
  results.push(testPinCannotMove());

  // Тесты реальных игровых сценариев
  results.push(testScholarsMate());
  results.push(testBackRankDefense());
  results.push(testForkKnight());
  results.push(testPinAndWin());
  results.push(testEndgameKingAndQueen());
  results.push(testOpposition());
  results.push(testZugzwang());
  results.push(testUnderpromotion());
  results.push(testRealGamePosition());

  const passed = results.filter((r) => r).length;
  const total = results.length;
  console.log(`ИТОГО: ${passed}/${total} тестов пройдено`);

  if (passed === total) {
    console.log("🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ!");
  } else {
    console.log("⚠️ Есть провалившиеся тесты");
  }
}

// Экспортируем для использования в браузере
export { runAllTests };

// Запуск если файл выполняется напрямую
if (typeof window !== "undefined") {
  (window as any).runChessTests = runAllTests;
  console.log("Тесты загружены. Вызовите runChessTests() в консоли браузера.");
}
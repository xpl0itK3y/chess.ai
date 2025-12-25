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

  // Белый король на e1, чёрный слон на f2 даёт шах
  // Белая пешка на e3 может срубить слона на f2 (для белых: e3 = y=5, f2 = y=6)
  // Нет, пешки ходят ВПЕРЁД (уменьшение y для белых)
  // Для белых пешка на g3 (x=6, y=5) может срубить на f2 (x=5, y=6)? Нет, это назад

  // Давайте сделаем проще: чёрный слон на d2 атакует белого короля на e1
  // Белая пешка на e3 может срубить? Для белой пешки на e3 (y=5) диагональ это d2 (y=6) или f2 (y=6)
  // Но белые пешки ходят ВВЕРХ (y уменьшается), значит пешка на e3 НЕ может пойти на d2 или f2

  // Правильно: белая пешка на c3 (x=2, y=5), чёрный слон на d2 (x=3, y=6)
  // Пешка идёт вверх (y уменьшается), так что c3->d2 это НАЗАД, не работает

  // Для белой пешки идущей ВВЕРХ (y-1), чтобы срубить врага:
  // Пешка на c3 (y=5) может срубить на b2 (y=4) или d2 (y=4). Но y=4 это ВЫШЕ y=5.
  // Так: пешка на e3 (x=4, y=5) может срубить на d4 (x=3, y=4) или f4 (x=5, y=4)

  // Чёрный слон на d4 атакует короля на e5? Нет, слишком сложно.
  // Давайте сделаем проще:

  new King(Colors.WHITE, board.getCell(4, 7)); // e1
  new Queen(Colors.BLACK, board.getCell(3, 6)); // d2 - даёт шах
  new Pawn(Colors.WHITE, board.getCell(4, 6)); // e2 - может срубить d1? Нет...
  new King(Colors.BLACK, board.getCell(0, 0)); // a8

  // Для белой пешки на e2 (x=4, y=6) диагональ вперёд это d1 (x=3, y=7) или f1 (x=5, y=7)
  // Но ферзь на d2 это (x=3, y=6) - не диагональ для пешки e2

  // Исправим: пешка на c3 может срубить ферзя на d2?
  // c3 = (x=2, y=5), d2 = (x=3, y=6). y увеличивается (5->6) значит это НАЗАД для белой пешки. Не работает.

  // Хорошо, сделаем по-другому: пешка на e3 (x=4, y=5), ферзь даёт шах с d4 (x=3, y=4)
  // Пешка e3 может срубить d4? e3=(4,5), d4=(3,4). y уменьшается (5->4), x меняется на 1. Да, это диагональ вперёд!

  const board2 = createEmptyBoard();
  new King(Colors.WHITE, board2.getCell(4, 7)); // e1
  new Pawn(Colors.WHITE, board2.getCell(4, 5)); // e3
  new Queen(Colors.BLACK, board2.getCell(3, 4)); // d4 - даёт шах? Проверим
  new King(Colors.BLACK, board2.getCell(0, 0)); // a8

  // d4 атакует e1? По диагонали d4-e3-f2-g1 - нет
  // d4-c3-b2-a1? Нет
  // d4-e5-f6-g7-h8? Нет
  // По вертикали/горизонтали d4 может пойти на d1? Да! d4-d1 вертикаль
  // Но там e1, не d1. Ферзь d4 атакует e1? Нет напрямую.

  // Давайте просто: ферзь на e4 атакует короля на e1 по вертикали
  // Пешка на d5 может срубить ферзя на e4
  const board3 = createEmptyBoard();
  new King(Colors.WHITE, board3.getCell(4, 7)); // e1
  new Pawn(Colors.WHITE, board3.getCell(3, 3)); // d5 (x=3, y=3)
  new Queen(Colors.BLACK, board3.getCell(4, 4)); // e4 (x=4, y=4) - даёт шах по вертикали
  new King(Colors.BLACK, board3.getCell(0, 0)); // a8

  // Пешка d5 (3,3) может срубить e4 (4,4)?
  // y: 3 -> 4 (увеличение для белой пешки = назад). Нет!

  // Для ЧЁРНОЙ пешки: y увеличивается = вперёд
  // Чёрная пешка на d3 (x=3, y=5) может срубить белую фигуру на e4 (x=4, y=4)?
  // y: 5 -> 4, это уменьшение, для чёрной пешки это НАЗАД. Нет.
  // Чёрная пешка на d3 (y=5) идёт вперёд на y=6, может срубить c4 (4,6) или e4 (4,6)?

  // y=5 -> y=6, x±1. d3=(3,5) -> c4=(2,6) или e4=(4,6).
  // Но e4 это (4,4), не (4,6).

  // Ладно, сделаем чёрную пешку атакует белого ферзя, который даёт шах чёрному королю
  const board4 = createEmptyBoard();
  new King(Colors.BLACK, board4.getCell(4, 0)); // e8
  new Pawn(Colors.BLACK, board4.getCell(3, 2)); // d6 (x=3, y=2)
  new Queen(Colors.WHITE, board4.getCell(4, 3)); // e5 (x=4, y=3) - даёт шах?
  new King(Colors.WHITE, board4.getCell(0, 7)); // a1

  // e5 атакует e8 по вертикали. Да!
  // Чёрная пешка d6 (3,2) может срубить e5 (4,3)?
  // y: 2 -> 3 (увеличение = вперёд для чёрных), x: 3 -> 4 (±1). Да!

  const isCheck = board4.isKingUnderAttack(Colors.BLACK);
  const pawn = board4.getCell(3, 2).figure;
  const queenCell = board4.getCell(4, 3);
  const canCapture = pawn?.canMove(queenCell);
  const isLegal = board4.isMoveLegal(board4.getCell(3, 2), queenCell);
  const isCheckmate = board4.isCheckmate(Colors.BLACK);

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

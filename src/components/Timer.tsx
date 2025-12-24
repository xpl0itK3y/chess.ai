import React, {FC, useEffect, useRef, useState} from 'react';
import {Player} from "../models/Player";
import {Colors} from "../models/Colors";

/**
 * Интерфейс пропсов компонента таймера
 */
interface TimerProps {
  currentPlayer: Player | null; // Текущий игрок чей ход
  restart: () => void;           // Функция перезапуска игры
}

/**
 * Компонент таймера для обратного отсчета времени игроков
 * Каждый игрок имеет 5 минут (300 секунд) на все ходы
 */
const Timer: FC<TimerProps> = ({currentPlayer, restart}) => {
  // Время оставшееся у каждого игрока в секундах
  const [blackTime, setBlackTime] = useState(300) // 5 минут для черных
  const [whiteTime, setWhiteTime] = useState(300); // 5 минут для белых
  
  // Ссылка на интервал для возможности его очистки
  const timer = useRef<null | ReturnType<typeof setInterval>>(null)

  /**
   * Эффект: при смене игрока запускаем/перезапускаем таймер
   */
  useEffect(() => {
    startTimer()
  }, [currentPlayer]) // Запускается при изменении currentPlayer

  /**
   * Запускает таймер для текущего игрока
   * Очищает предыдущий таймер и запускает новый
   */
  function startTimer() {
    // Очищаем предыдущий таймер если он был
    if (timer.current) {
      clearInterval(timer.current)
    }
    
    // Определяем какую функцию запускать в зависимости от текущего игрока
    const callback = currentPlayer?.color === Colors.WHITE ? decrementWhiteTimer : decrementBlackTimer
    
    // Запускаем таймер который будет уменьшать время каждую секунду
    timer.current = setInterval(callback, 1000)
  }

  /**
   * Уменьшает время черного игрока на 1 секунду
   */
  function decrementBlackTimer() {
    setBlackTime(prev => prev - 1)
  }
  
  /**
   * Уменьшает время белого игрока на 1 секунду
   */
  function decrementWhiteTimer() {
    setWhiteTime(prev => prev - 1)
  }

  /**
   * Обработчик кнопки перезапуска игры
   * Сбрасывает таймеры до начальных 5 минут
   */
  const handleRestart = () => {
    setWhiteTime(300)  // Сбрасываем время белых
    setBlackTime(300)  // Сбрасываем время черных
    restart()          // Вызываем функцию перезапуска игры
  }

  return (
    <div>
      <div>
        <button onClick={handleRestart}>Restart game</button>
      </div>
      <h2>Черные - {blackTime}</h2>
      <h2>Белые - {whiteTime}</h2>
    </div>
  );
};

export default Timer;

/**
 * Компонент таймера игры
 * 
 * Отслеживает время каждого игрока и позволяет перезапустить игру
 */
import React, {FC, useEffect, useRef, useState} from 'react';
import {Player} from "../models/Player";
import {Colors} from "../models/Colors";

/**
 * Интерфейс пропсов компонента таймера
 */
interface TimerProps {
  currentPlayer: Player | null; // Текущий игрок
  restart: () => void; // Функция перезапуска игры
}

const Timer: FC<TimerProps> = ({currentPlayer, restart}) => {
  // Время черного игрока в секундах (5 минут по умолчанию)
  const [blackTime, setBlackTime] = useState(300)
  // Время белого игрока в секундах (5 минут по умолчанию)
  const [whiteTime, setWhiteTime] = useState(300);
  // Ссылка на интервал таймера
  const timer = useRef<null | ReturnType<typeof setInterval>>(null)

  // Запускаем таймер при смене игрока
  useEffect(() => {
    startTimer()
  }, [currentPlayer])

  /**
   * Запускает или перезапускает таймер для текущего игрока
   */
  function startTimer() {
    // Останавливаем предыдущий таймер если он был
    if (timer.current) {
      clearInterval(timer.current)
    }
    // Выбираем callback в зависимости от текущего игрока
    const callback = currentPlayer?.color === Colors.WHITE ? decrementWhiteTimer : decrementBlackTimer
    // Запускаем таймер с интервалом 1 секунда
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
   * Обрабатывает перезапуск игры: сбрасывает таймеры и вызывает родительскую функцию
   */
  const handleRestart = () => {
    setWhiteTime(300)
    setBlackTime(300)
    restart()
  }

  return (
    <div>
      {/* Кнопка перезапуска игры */}
      <div>
        <button onClick={handleRestart}>Restart game</button>
      </div>
      {/* Отображение времени игроков */}
      <h2>Черные - {blackTime}</h2>
      <h2>Белые - {whiteTime}</h2>
    </div>
  );
};

export default Timer;

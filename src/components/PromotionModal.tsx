/**
 * Компонент модального окна для превращения пешки
 * 
 * Позволяет игроку выбрать фигуру для превращения пешки
 */
import React, { FC } from 'react';
import { Colors } from "../models/Colors";

// Импорт изображений фигур
import blackQueen from "../assets/black-queen.png";
import whiteQueen from "../assets/white-queen.png";
import blackRook from "../assets/black-rook.png";
import whiteRook from "../assets/white-rook.png";
import blackBishop from "../assets/black-bishop.png";
import whiteBishop from "../assets/white-bishop.png";
import blackKnight from "../assets/black-knight.png";
import whiteKnight from "../assets/white-knight.png";

export type PromotionChoice = 'queen' | 'rook' | 'bishop' | 'knight';

interface PromotionModalProps {
    color: Colors;
    onSelect: (choice: PromotionChoice) => void;
}

const PromotionModal: FC<PromotionModalProps> = ({ color, onSelect }) => {
    const isBlack = color === Colors.BLACK;

    const options: { choice: PromotionChoice; name: string; logo: string }[] = [
        { choice: 'queen', name: 'Ферзь', logo: isBlack ? blackQueen : whiteQueen },
        { choice: 'rook', name: 'Ладья', logo: isBlack ? blackRook : whiteRook },
        { choice: 'bishop', name: 'Слон', logo: isBlack ? blackBishop : whiteBishop },
        { choice: 'knight', name: 'Конь', logo: isBlack ? blackKnight : whiteKnight },
    ];

    return (
        <div className="promotion-overlay">
            <div className="promotion-modal">
                <h3>Превращение пешки</h3>
                <p>Выберите фигуру:</p>
                <div className="promotion-options">
                    {options.map(option => (
                        <div
                            key={option.choice}
                            className="promotion-option"
                            onClick={() => onSelect(option.choice)}
                            title={option.name}
                        >
                            <img src={option.logo} alt={option.name} />
                            <span>{option.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PromotionModal;

// Componente de texto para nombres, unidades, valores

import React from 'react';
import { Point } from '../model/graphicModel';

interface LabelProps {
    position: Point;
    text: string;
    fontSize?: number;
    scale: number;
    color?: string;
    backgroundColor?: string;
    textAnchor?: 'start' | 'middle' | 'end';
}

const Label: React.FC<LabelProps> = ({
    position,
    text,
    fontSize = 12,
    scale,
    color = '#374151',
    backgroundColor = 'rgba(255, 255, 255, 0.8)',
    textAnchor = 'middle'
}) => {
    const x = position.x * scale;
    const y = position.y * scale;

    // Calcular dimensiones aproximadas del texto para el fondo
    const textWidth = text.length * fontSize * 0.6;
    const textHeight = fontSize + 4;

    return (
        <g>
            {/* Fondo opcional para mejor legibilidad */}
            {backgroundColor && (
                <rect
                    x={x - textWidth / 2}
                    y={y - textHeight / 2}
                    width={textWidth}
                    height={textHeight}
                    fill={backgroundColor}
                    stroke="none"
                    rx={2}
                />
            )}

            {/* Texto principal */}
            <text
                x={x}
                y={y + fontSize / 3}
                fontSize={fontSize}
                fill={color}
                textAnchor={textAnchor}
                fontFamily="Arial, sans-serif"
                fontWeight="500"
            >
                {text}
            </text>
        </g>
    );
};

export default Label;
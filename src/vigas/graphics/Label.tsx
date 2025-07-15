// Componente de etiquetas adaptable

import React, { useMemo } from 'react';
import { Point } from '../model/graphicModel';

interface LabelProps {
    position: Point;
    text: string;
    fontSize?: number;
    scale: number;
    structureSize?: number;
    color?: string;
    backgroundColor?: string;
    textAnchor?: 'start' | 'middle' | 'end';
}

const LabelComponent: React.FC<LabelProps> = (({
    position,
    text,
    fontSize = 12,
    scale,
    structureSize = 10,
    color = '#374151',
    backgroundColor = 'rgba(255, 255, 255, 0.9)',
    textAnchor = 'middle'
}) => {
    const labelProps = useMemo(() => {
        const x = position.x * scale;
        const y = position.y * scale;

        // Tamaño de fuente adaptativo
        const adaptiveFontSize = scale === 1
            ? Math.max(structureSize / 80, 0.08)
            : fontSize;

        // Dimensiones del fondo
        const textWidth = text.length * adaptiveFontSize * 0.6;
        const textHeight = adaptiveFontSize + (adaptiveFontSize * 0.3);

        return {
            x, y,
            adaptiveFontSize,
            textWidth,
            textHeight
        };
    }, [position, text, fontSize, scale, structureSize]);

    return (
        <g>
            {/* Fondo para mejor legibilidad */}
            {backgroundColor && (
                <rect
                    x={labelProps.x - labelProps.textWidth / 2}
                    y={labelProps.y - labelProps.textHeight / 2}
                    width={labelProps.textWidth}
                    height={labelProps.textHeight}
                    fill={backgroundColor}
                    stroke="none"
                    rx={labelProps.adaptiveFontSize * 0.1}
                />
            )}

            {/* Texto principal */}
            <text
                x={labelProps.x}
                y={labelProps.y + labelProps.adaptiveFontSize / 3}
                fontSize={labelProps.adaptiveFontSize}
                fill={color}
                textAnchor={textAnchor}
                fontFamily="Arial, sans-serif"
                fontWeight="500"
            >
                {text}
            </text>
        </g>
    );
});
const Label = React.memo(LabelComponent);
Label.displayName='Label';
export default Label;
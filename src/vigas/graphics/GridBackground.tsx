// Componente opcional para fondo técnico con líneas cada metro

import React from 'react';

interface GridBackgroundProps {
    width: number;
    height: number;
    scale: number; // metros por pixel
    gridColor?: string;
    gridOpacity?: number;
}

const GridBackground: React.FC<GridBackgroundProps> = ({
    width,
    height,
    scale,
    gridColor = '#e5e7eb',
    gridOpacity = 0.5
}) => {
    const gridSpacing = scale; // espacio entre líneas de grilla (1 metro)

    // Generar líneas verticales
    const verticalLines = [];
    for (let x = 0; x <= width; x += gridSpacing) {
        verticalLines.push(
            <line
                key={`v-${x}`}
                x1={x}
                y1={0}
                x2={x}
                y2={height}
                stroke={gridColor}
                strokeWidth={1}
                opacity={gridOpacity}
            />
        );
    }

    // Generar líneas horizontales
    const horizontalLines = [];
    for (let y = 0; y <= height; y += gridSpacing) {
        horizontalLines.push(
            <line
                key={`h-${y}`}
                x1={0}
                y1={y}
                x2={width}
                y2={y}
                stroke={gridColor}
                strokeWidth={1}
                opacity={gridOpacity}
            />
        );
    }

    return (
        <g id="grid-background">
            {verticalLines}
            {horizontalLines}
        </g>
    );
};

export default GridBackground;
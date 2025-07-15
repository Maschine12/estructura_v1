// Grid completamente adaptable que se ajusta automáticamente al tamaño

import React, { JSX, useMemo } from 'react';

interface GridBackgroundProps {
    structureWidth: number;
    structureHeight: number;
    minX: number;
    minY: number;
    adaptiveScale: number;
    gridColor?: string;
    gridOpacity?: number;
}

const GridBackground: React.FC<GridBackgroundProps> = ({
    structureWidth,
    structureHeight,
    minX,
    minY,
    adaptiveScale,
    gridColor = '#e5e7eb',
    gridOpacity = 0.4
}) => {

    const gridConfig = useMemo(() => {
        // Determinar espaciado del grid según el tamaño de la estructura
        let majorSpacing: number;
        let minorSpacing: number;
        let showMinor = true;

        if (structureWidth <= 2) {
            majorSpacing = 0.5;
            minorSpacing = 0.1;
        } else if (structureWidth <= 5) {
            majorSpacing = 1;
            minorSpacing = 0.2;
        } else if (structureWidth <= 20) {
            majorSpacing = 2;
            minorSpacing = 0.5;
        } else if (structureWidth <= 100) {
            majorSpacing = 10;
            minorSpacing = 2;
        } else {
            majorSpacing = 50;
            minorSpacing = 10;
            showMinor = false; // Para estructuras muy grandes, no mostrar grid menor
        }

        // Área del grid con padding
        const padding = Math.max(structureWidth * 0.1, 1);
        const gridMinX = minX - padding;
        const gridMaxX = minX + structureWidth + padding;
        const gridMinY = minY - padding;
        const gridMaxY = minY + structureHeight + padding;

        // Tamaño de texto adaptativo
        const fontSize = Math.max(0.1, Math.min(structureWidth / 100, 0.4));

        return {
            majorSpacing,
            minorSpacing,
            showMinor,
            gridMinX,
            gridMaxX,
            gridMinY,
            gridMaxY,
            fontSize
        };
    }, [structureWidth, structureHeight, minX, minY]);

    const gridElements = useMemo(() => {
        const {
            majorSpacing,
            minorSpacing,
            showMinor,
            gridMinX,
            gridMaxX,
            gridMinY,
            gridMaxY,
            fontSize
        } = gridConfig;

        const elements: JSX.Element[] = [];

        // Líneas verticales principales
        const startMajorX = Math.ceil(gridMinX / majorSpacing) * majorSpacing;
        for (let x = startMajorX; x <= gridMaxX; x += majorSpacing) {
            elements.push(
                <g key={`major-v-${x}`}>
                    <line
                        x1={x}
                        y1={gridMinY}
                        x2={x}
                        y2={gridMaxY}
                        stroke={gridColor}
                        strokeWidth={0.01}
                        opacity={gridOpacity}
                    />
                    {/* Etiqueta de coordenada */}
                    {x >= minX && x <= minX + structureWidth && (
                        <text
                            x={x}
                            y={gridMaxY - 0.1}
                            fontSize={fontSize}
                            fill={gridColor}
                            textAnchor="middle"
                            opacity={gridOpacity * 0.8}
                        >
                            {x % 1 === 0 ? x.toFixed(0) : x.toFixed(1)}
                        </text>
                    )}
                </g>
            );
        }

        // Líneas horizontales principales
        const startMajorY = Math.ceil(gridMinY / majorSpacing) * majorSpacing;
        for (let y = startMajorY; y <= gridMaxY; y += majorSpacing) {
            elements.push(
                <g key={`major-h-${y}`}>
                    <line
                        x1={gridMinX}
                        y1={y}
                        x2={gridMaxX}
                        y2={y}
                        stroke={gridColor}
                        strokeWidth={0.01}
                        opacity={gridOpacity}
                    />
                    {/* Etiqueta de coordenada */}
                    {y >= minY && y <= minY + structureHeight && (
                        <text
                            x={gridMinX + 0.2}
                            y={y + fontSize / 3}
                            fontSize={fontSize}
                            fill={gridColor}
                            textAnchor="start"
                            opacity={gridOpacity * 0.8}
                        >
                            {y % 1 === 0 ? y.toFixed(0) : y.toFixed(1)}
                        </text>
                    )}
                </g>
            );
        }

        // Líneas menores (solo si showMinor es true)
        if (showMinor) {
            // Verticales menores
            const startMinorX = Math.ceil(gridMinX / minorSpacing) * minorSpacing;
            for (let x = startMinorX; x <= gridMaxX; x += minorSpacing) {
                if (Math.abs(x % majorSpacing) > 0.01) {
                    elements.push(
                        <line
                            key={`minor-v-${x}`}
                            x1={x}
                            y1={gridMinY}
                            x2={x}
                            y2={gridMaxY}
                            stroke={gridColor}
                            strokeWidth={0.005}
                            opacity={gridOpacity * 0.3}
                        />
                    );
                }
            }

            // Horizontales menores
            const startMinorY = Math.ceil(gridMinY / minorSpacing) * minorSpacing;
            for (let y = startMinorY; y <= gridMaxY; y += minorSpacing) {
                if (Math.abs(y % majorSpacing) > 0.01) {
                    elements.push(
                        <line
                            key={`minor-h-${y}`}
                            x1={gridMinX}
                            y1={y}
                            x2={gridMaxX}
                            y2={y}
                            stroke={gridColor}
                            strokeWidth={0.005}
                            opacity={gridOpacity * 0.3}
                        />
                    );
                }
            }
        }

        return elements;
    }, [gridConfig, gridColor, gridOpacity, minX, minY, structureWidth, structureHeight]);

    return (
        <g id="adaptive-grid">
            {gridElements}

            {/* Información del grid */}
            <text
                x={gridConfig.gridMinX + 0.3}
                y={gridConfig.gridMinY + 0.6}
                fontSize={gridConfig.fontSize * 0.7}
                fill={gridColor}
                opacity={gridOpacity * 0.6}
            >
                Grid: {gridConfig.majorSpacing >= 1 ? `${gridConfig.majorSpacing}m` : `${(gridConfig.majorSpacing * 100).toFixed(0)}cm`}
            </text>
        </g>
    );
};

export default React.memo(GridBackground);
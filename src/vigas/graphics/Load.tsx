// Componente para dibujar cargas (puntuales, distribuidas, momentos)

import React from 'react';
import { GraphicLoad } from '../model/graphicModel';

interface LoadProps {
    load: GraphicLoad;
    scale: number;
}

const Load: React.FC<LoadProps> = ({ load, scale }) => {
    const { position, type, magnitude, direction, length = 0, unit = 'kN' } = load;

    const x = position.x * scale;
    const y = position.y * scale;
    const arrowLength = Math.min(Math.abs(magnitude) * 2, 40); // limitar longitud

    // Definir dirección de la flecha
    const getArrowDirection = () => {
        switch (direction) {
            case 'up':
                return { dx: 0, dy: -arrowLength };
            case 'down':
                return { dx: 0, dy: arrowLength };
            case 'left':
                return { dx: -arrowLength, dy: 0 };
            case 'right':
                return { dx: arrowLength, dy: 0 };
            default:
                return { dx: 0, dy: arrowLength };
        }
    };

    const { dx, dy } = getArrowDirection();

    // Carga puntual
    const PointLoad = () => (
        <g>
            {/* Flecha */}
            <line
                x1={x}
                y1={y}
                x2={x + dx}
                y2={y + dy}
                stroke="#dc2626"
                strokeWidth={2}
                markerEnd="url(#arrowhead)"
            />

            {/* Etiqueta con magnitud */}
            <text
                x={x + dx / 2 + (direction === 'left' ? -10 : 10)}
                y={y + dy / 2 - 5}
                fontSize="12"
                fill="#dc2626"
                textAnchor="middle"
            >
                {magnitude} {unit}
            </text>
        </g>
    );

    // Carga distribuida
    const DistributedLoad = () => {
        const loadLength = length * scale;
        const arrowSpacing = 30; // espaciado entre flechas
        const numArrows = Math.floor(loadLength / arrowSpacing) + 1;

        return (
            <g>
                {/* Línea superior de la carga distribuida */}
                <line
                    x1={x}
                    y1={y + dy}
                    x2={x + loadLength}
                    y2={y + dy}
                    stroke="#dc2626"
                    strokeWidth={2}
                />

                {/* Flechas múltiples */}
                {Array.from({ length: numArrows }, (_, i) => {
                    const arrowX = x + (i * arrowSpacing);
                    if (arrowX > x + loadLength) return null;

                    return (
                        <line
                            key={i}
                            x1={arrowX}
                            y1={y + dy}
                            x2={arrowX}
                            y2={y}
                            stroke="#dc2626"
                            strokeWidth={2}
                            markerEnd="url(#arrowhead)"
                        />
                    );
                })}

                {/* Etiqueta */}
                <text
                    x={x + loadLength / 2}
                    y={y + dy - 10}
                    fontSize="12"
                    fill="#dc2626"
                    textAnchor="middle"
                >
                    {magnitude} {unit}/m
                </text>
            </g>
        );
    };

    // Momento
    const MomentLoad = () => (
        <g>
            {/* Arco del momento */}
            <path
                d={`M ${x - 15} ${y} A 15 15 0 1 1 ${x + 15} ${y}`}
                fill="none"
                stroke="#7c3aed"
                strokeWidth={2}
                markerEnd="url(#arrowhead)"
            />

            {/* Etiqueta */}
            <text
                x={x}
                y={y - 25}
                fontSize="12"
                fill="#7c3aed"
                textAnchor="middle"
            >
                {magnitude} {unit}·m
            </text>
        </g>
    );

    const renderLoad = () => {
        switch (type) {
            case 'point':
                return <PointLoad />;
            case 'distributed':
                return <DistributedLoad />;
            case 'moment':
                return <MomentLoad />;
            default:
                return <PointLoad />;
        }
    };

    return (
        <g>
            {/* Definir marcador de flecha */}
            <defs>
                <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                >
                    <polygon
                        points="0 0, 10 3.5, 0 7"
                        fill="#dc2626"
                    />
                </marker>
            </defs>

            {renderLoad()}
        </g>
    );
};

export default Load;
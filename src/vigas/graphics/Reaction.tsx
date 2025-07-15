// Componente para dibujar reacciones (con dirección y magnitud)

import React from 'react';
import { GraphicReaction } from '../model/graphicModel';

interface ReactionProps {
    reaction: GraphicReaction;
    scale: number;
}

const Reaction: React.FC<ReactionProps> = ({ reaction, scale }) => {
    const { position, type, magnitude, direction, unit = 'kN' } = reaction;

    const x = position.x * scale;
    const y = position.y * scale;
    const arrowLength = Math.min(Math.abs(magnitude) * 2, 35);

    // Definir dirección de la flecha de reacción
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
                return { dx: 0, dy: -arrowLength };
        }
    };

    const { dx, dy } = getArrowDirection();

    // Reacción vertical u horizontal
    const ForceReaction = () => (
        <g>
            {/* Flecha de reacción */}
            <line
                x1={x}
                y1={y}
                x2={x + dx}
                y2={y + dy}
                stroke="#059669"
                strokeWidth={3}
                markerEnd="url(#reactionArrow)"
            />

            {/* Etiqueta con magnitud */}
            <text
                x={x + dx / 2 + (direction === 'left' ? -15 : 15)}
                y={y + dy / 2 + (direction === 'up' ? -8 : 8)}
                fontSize="11"
                fill="#059669"
                textAnchor="middle"
                fontWeight="bold"
            >
                {magnitude.toFixed(1)} {unit}
            </text>
        </g>
    );

    // Reacción de momento
    const MomentReaction = () => (
        <g>
            {/* Arco del momento de reacción */}
            <path
                d={`M ${x - 20} ${y} A 20 20 0 1 0 ${x + 20} ${y}`}
                fill="none"
                stroke="#059669"
                strokeWidth={3}
                markerEnd="url(#reactionArrow)"
            />

            {/* Etiqueta */}
            <text
                x={x}
                y={y - 30}
                fontSize="11"
                fill="#059669"
                textAnchor="middle"
                fontWeight="bold"
            >
                {magnitude.toFixed(1)} {unit}·m
            </text>
        </g>
    );

    const renderReaction = () => {
        switch (type) {
            case 'vertical':
            case 'horizontal':
                return <ForceReaction />;
            case 'moment':
                return <MomentReaction />;
            default:
                return <ForceReaction />;
        }
    };

    return (
        <g>
            {/* Definir marcador de flecha para reacciones */}
            <defs>
                <marker
                    id="reactionArrow"
                    markerWidth="12"
                    markerHeight="8"
                    refX="11"
                    refY="4"
                    orient="auto"
                >
                    <polygon
                        points="0 0, 12 4, 0 8"
                        fill="#059669"
                    />
                </marker>
            </defs>

            {renderReaction()}
        </g>
    );
};

export default Reaction;
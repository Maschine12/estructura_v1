// Componente para reacciones con mejor posicionamiento

import React, { useMemo } from 'react';
import { GraphicReaction } from '../model/graphicModel';

interface ReactionProps {
    reaction: GraphicReaction;
    scale: number;
    structureSize?: number;
}
//Componente nombrado
const ReactionComponent: React.FC<ReactionProps> = (({ reaction, scale, structureSize = 10 }) => {
    const reactionProps = useMemo(() => {
        const { position, type, magnitude, direction, unit = 'kN' } = reaction;

        const x = position.x * scale;
        const y = position.y * scale;

        // Longitud de flecha adaptativa
        const arrowLength = scale === 1
            ? Math.max(structureSize / 25, 0.25)
            : Math.min(Math.abs(magnitude) * 2, 35);

        // Offset para separar reacciones de soportes
        const offsetDistance = scale === 1 ? structureSize / 25 : 20;

        // Calcular posición ajustada según dirección
        let adjustedX = x;
        let adjustedY = y;
        let dx = 0, dy = 0;

        switch (direction) {
            case 'up':
                dx = 0;
                dy = -arrowLength;
                adjustedY = y - offsetDistance * 1.5; // Más separación hacia arriba
                break;
            case 'down':
                dx = 0;
                dy = arrowLength;
                adjustedY = y + offsetDistance * 1.5; // Más separación hacia abajo
                break;
            case 'left':
                dx = -arrowLength;
                dy = 0;
                adjustedX = x - offsetDistance;
                break;
            case 'right':
                dx = arrowLength;
                dy = 0;
                adjustedX = x + offsetDistance;
                break;
            default:
                dx = 0;
                dy = -arrowLength;
                adjustedY = y - offsetDistance * 1.5;
        }

        const fontSize = scale === 1 ? Math.max(structureSize / 100, 0.07) : 11;
        const strokeWidth = scale === 1 ? Math.max(structureSize / 150, 0.025) : 3;

        return {
            x: adjustedX, y: adjustedY, dx, dy, arrowLength, fontSize, strokeWidth,
            magnitude, direction, type, unit
        };
    }, [reaction, scale, structureSize]);

    // ID único para el marcador de flecha
    const arrowId = `reactionArrow-${reaction.id}`;

    return (
        <g>
            {/* Definir marcador único para reacciones */}
            <defs>
                <marker
                    id={arrowId}
                    markerWidth="12"
                    markerHeight="8"
                    refX="11"
                    refY="4"
                    orient="auto"
                    markerUnits="strokeWidth"
                >
                    <polygon
                        points="0 0, 12 4, 0 8"
                        fill="#059669"
                    />
                </marker>
            </defs>

            {(reactionProps.type === 'vertical' || reactionProps.type === 'horizontal') && (
                <g>
                    {/* Flecha de reacción */}
                    <line
                        x1={reactionProps.x}
                        y1={reactionProps.y}
                        x2={reactionProps.x + reactionProps.dx}
                        y2={reactionProps.y + reactionProps.dy}
                        stroke="#059669"
                        strokeWidth={reactionProps.strokeWidth}
                        markerEnd={`url(#${arrowId})`}
                    />

                    {/* Etiqueta con magnitud */}
                    <text
                        x={reactionProps.x + reactionProps.dx / 2 + (reactionProps.direction === 'left' ? -0.3 : 0.3)}
                        y={reactionProps.y + reactionProps.dy / 2 + (reactionProps.direction === 'up' ? -0.15 : 0.15)}
                        fontSize={reactionProps.fontSize}
                        fill="#059669"
                        textAnchor="middle"
                        fontWeight="bold"
                    >
                        {reactionProps.magnitude.toFixed(1)} {reactionProps.unit}
                    </text>
                </g>
            )}

            {reactionProps.type === 'moment' && (
                <g>
                    {/* Arco del momento de reacción */}
                    <path
                        d={`M ${reactionProps.x - reactionProps.arrowLength} ${reactionProps.y} A ${reactionProps.arrowLength} ${reactionProps.arrowLength} 0 1 0 ${reactionProps.x + reactionProps.arrowLength} ${reactionProps.y}`}
                        fill="none"
                        stroke="#059669"
                        strokeWidth={reactionProps.strokeWidth}
                        markerEnd={`url(#${arrowId})`}
                    />

                    {/* Etiqueta */}
                    <text
                        x={reactionProps.x}
                        y={reactionProps.y - reactionProps.arrowLength * 1.5}
                        fontSize={reactionProps.fontSize}
                        fill="#059669"
                        textAnchor="middle"
                        fontWeight="bold"
                    >
                        {reactionProps.magnitude.toFixed(1)} {reactionProps.unit}·m
                    </text>
                </g>
            )}
        </g>
    );
});
const Reaction= React.memo(ReactionComponent);
Reaction.displayName='Reaction';
export default Reaction;
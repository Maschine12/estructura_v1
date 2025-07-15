// Componente para cargas con posicionamiento mejorado para evitar superposiciones

import React, { useMemo } from 'react';
import { GraphicLoad } from '../model/graphicModel';

interface LoadProps {
    load: GraphicLoad;
    scale: number;
    structureSize?: number;
}

// Componente nombrado
const LoadComponent: React.FC<LoadProps> = ({ load, scale, structureSize = 10 }) => {
    const loadProps = useMemo(() => {
        const { position, type, magnitude, direction, length = 0, unit = 'kN' } = load;

        const x = position.x * scale;
        const y = position.y * scale;

        const arrowLength = scale === 1
            ? Math.max(structureSize / 20, 0.3)
            : Math.min(Math.abs(magnitude) * 2, 40);

        const offsetDistance = scale === 1 ? structureSize / 30 : 15;

        let adjustedY = y;
        let dx = 0, dy = 0;

        switch (direction) {
            case 'up': dy = -arrowLength; adjustedY = y - offsetDistance; break;
            case 'down': dy = arrowLength; adjustedY = y + offsetDistance; break;
            case 'left': dx = -arrowLength; break;
            case 'right': dx = arrowLength; break;
            default: dy = arrowLength; adjustedY = y + offsetDistance;
        }

        const fontSize = scale === 1 ? Math.max(structureSize / 80, 0.08) : 12;
        const strokeWidth = scale === 1 ? Math.max(structureSize / 200, 0.02) : 2;

        return {
            x, y: adjustedY, dx, dy, arrowLength, fontSize, strokeWidth,
            magnitude, direction, type, length, unit
        };
    }, [load, scale, structureSize]);

    const arrowId = `arrowhead-load-${load.id}`;

    return (
        <g>
            <defs>
                <marker
                    id={arrowId}
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                    markerUnits="strokeWidth"
                >
                    <polygon points="0 0, 10 3.5, 0 7" fill="#dc2626" />
                </marker>
            </defs>

            {loadProps.type === 'point' && (
                <g>
                    <line
                        x1={loadProps.x}
                        y1={loadProps.y}
                        x2={loadProps.x + loadProps.dx}
                        y2={loadProps.y + loadProps.dy}
                        stroke="#dc2626"
                        strokeWidth={loadProps.strokeWidth}
                        markerEnd={`url(#${arrowId})`}
                    />
                    <text
                        x={loadProps.x + loadProps.dx / 2 + (loadProps.direction === 'left' ? -0.2 : 0.2)}
                        y={loadProps.y + loadProps.dy / 2 - 0.1}
                        fontSize={loadProps.fontSize}
                        fill="#dc2626"
                        textAnchor="middle"
                        fontWeight="bold"
                    >
                        {loadProps.magnitude} {loadProps.unit}
                    </text>
                </g>
            )}

            {loadProps.type === 'distributed' && (
                <g>
                    <line
                        x1={loadProps.x}
                        y1={loadProps.y + loadProps.dy}
                        x2={loadProps.x + (loadProps.length * scale)}
                        y2={loadProps.y + loadProps.dy}
                        stroke="#dc2626"
                        strokeWidth={loadProps.strokeWidth}
                    />
                    {Array.from({ length: Math.max(3, Math.floor(loadProps.length * scale / 0.3)) }, (_, i) => {
                        const arrowX = loadProps.x + (i * loadProps.length * scale / Math.max(3, Math.floor(loadProps.length * scale / 0.3)));
                        if (arrowX > loadProps.x + loadProps.length * scale) return null;
                        return (
                            <line
                                key={i}
                                x1={arrowX}
                                y1={loadProps.y + loadProps.dy}
                                x2={arrowX}
                                y2={loadProps.y}
                                stroke="#dc2626"
                                strokeWidth={loadProps.strokeWidth}
                                markerEnd={`url(#${arrowId})`}
                            />
                        );
                    })}
                    <text
                        x={loadProps.x + (loadProps.length * scale) / 2}
                        y={loadProps.y + loadProps.dy - 0.2}
                        fontSize={loadProps.fontSize}
                        fill="#dc2626"
                        textAnchor="middle"
                        fontWeight="bold"
                    >
                        {loadProps.magnitude} {loadProps.unit}/m
                    </text>
                </g>
            )}

            {loadProps.type === 'moment' && (
                <g>
                    <path
                        d={`M ${loadProps.x - loadProps.arrowLength / 2} ${loadProps.y} A ${loadProps.arrowLength / 2} ${loadProps.arrowLength / 2} 0 1 1 ${loadProps.x + loadProps.arrowLength / 2} ${loadProps.y}`}
                        fill="none"
                        stroke="#7c3aed"
                        strokeWidth={loadProps.strokeWidth}
                        markerEnd={`url(#${arrowId})`}
                    />
                    <text
                        x={loadProps.x}
                        y={loadProps.y - loadProps.arrowLength}
                        fontSize={loadProps.fontSize}
                        fill="#7c3aed"
                        textAnchor="middle"
                        fontWeight="bold"
                    >
                        {loadProps.magnitude} {loadProps.unit}·m
                    </text>
                </g>
            )}
        </g>
    );
};

// Memo y nombre explícito
const Load = React.memo(LoadComponent);
Load.displayName = 'Load';

export default Load;

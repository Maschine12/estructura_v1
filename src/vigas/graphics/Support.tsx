// Componente de soportes adaptable con mejor definición

import React, { useMemo } from 'react';
import { GraphicSupport } from '../model/graphicModel';

interface SupportProps {
    support: GraphicSupport;
    scale: number;
    structureSize?: number;
}

const SupportComponent: React.FC<SupportProps> = (({ support, scale, structureSize = 10 }) => {
    const supportProps = useMemo(() => {
        const { position, type, angle = 0 } = support;

        const x = position.x * scale;
        const y = position.y * scale;

        // Tamaño adaptativo del soporte
        const size = scale === 1
            ? Math.max(structureSize / 40, 0.15) // Proporcional al tamaño de estructura
            : 20;

        const strokeWidth = scale === 1 ? size / 12 : 2;

        return { x, y, size, strokeWidth, type, angle };
    }, [support, scale, structureSize]);

    const renderSupport = () => {
        const { x, y, size, strokeWidth, type } = supportProps;

        switch (type) {
            case 'simple':
                return (
                    <g>
                        {/* Triángulo principal */}
                        <polygon
                            points={`${x},${y} ${x - size / 2},${y + size} ${x + size / 2},${y + size}`}
                            fill="white"
                            stroke="#374151"
                            strokeWidth={strokeWidth}
                        />
                        {/* Líneas de sombreado del suelo */}
                        <g stroke="#6b7280" strokeWidth={strokeWidth / 2} opacity={0.7}>
                            {Array.from({ length: 5 }, (_, i) => {
                                const offsetX = x - size / 2 + (i * size / 4);
                                return (
                                    <line
                                        key={i}
                                        x1={offsetX}
                                        y1={y + size}
                                        x2={offsetX - size / 5}
                                        y2={y + size + size / 5}
                                    />
                                );
                            })}
                        </g>
                    </g>
                );

            case 'fixed':
                return (
                    <g>
                        {/* Rectángulo empotrado */}
                        <rect
                            x={x - size / 4}
                            y={y}
                            width={size / 2}
                            height={size}
                            fill="white"
                            stroke="#374151"
                            strokeWidth={strokeWidth}
                        />
                        {/* Líneas de empotramiento */}
                        <g stroke="#6b7280" strokeWidth={strokeWidth / 2} opacity={0.7}>
                            {Array.from({ length: 4 }, (_, i) => (
                                <line
                                    key={i}
                                    x1={x - size / 4}
                                    y1={y + (i + 1) * size / 5}
                                    x2={x - size / 2}
                                    y2={y + (i + 1) * size / 5}
                                />
                            ))}
                        </g>
                    </g>
                );

            case 'roller':
                return (
                    <g>
                        {/* Triángulo */}
                        <polygon
                            points={`${x},${y} ${x - size / 2},${y + size * 0.7} ${x + size / 2},${y + size * 0.7}`}
                            fill="white"
                            stroke="#374151"
                            strokeWidth={strokeWidth}
                        />
                        {/* Círculo del rodillo */}
                        <circle
                            cx={x}
                            cy={y + size * 0.85}
                            r={size / 8}
                            fill="white"
                            stroke="#374151"
                            strokeWidth={strokeWidth}
                        />
                        {/* Líneas de sombreado del suelo */}
                        <g stroke="#6b7280" strokeWidth={strokeWidth / 2} opacity={0.7}>
                            {Array.from({ length: 5 }, (_, i) => {
                                const offsetX = x - size / 2 + (i * size / 4);
                                return (
                                    <line
                                        key={i}
                                        x1={offsetX}
                                        y1={y + size}
                                        x2={offsetX - size / 5}
                                        y2={y + size + size / 5}
                                    />
                                );
                            })}
                        </g>
                    </g>
                );

            default:
                return null;
        }
    };

    return (
        <g transform={supportProps.angle !== 0 ? `rotate(${supportProps.angle}, ${supportProps.x}, ${supportProps.y})` : undefined}>
            {renderSupport()}
        </g>
    );
});
const Support = React.memo(SupportComponent);
Support.displayName='Support';
export default Support;
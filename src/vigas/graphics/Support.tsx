// Componente para dibujar apoyos (simple, empotrado, rodillo)

import React from 'react';
import { GraphicSupport } from '../model/graphicModel';

interface SupportProps {
    support: GraphicSupport;
    scale: number;
}

const Support: React.FC<SupportProps> = ({ support, scale }) => {
    const { position, type, angle = 0 } = support;

    const x = position.x * scale;
    const y = position.y * scale;
    const size = 20; // tamaño base del apoyo

    // Apoyo simple (triángulo)
    const SimpleSupport = () => (
        <g>
            <polygon
                points={`${x},${y} ${x - size / 2},${y + size} ${x + size / 2},${y + size}`}
                fill="none"
                stroke="#374151"
                strokeWidth={2}
            />
            {/* Líneas de sombreado */}
            <g stroke="#6b7280" strokeWidth={1}>
                <line x1={x - size / 2} y1={y + size} x2={x - size / 2 - 8} y2={y + size + 8} />
                <line x1={x - size / 4} y1={y + size} x2={x - size / 4 - 8} y2={y + size + 8} />
                <line x1={x} y1={y + size} x2={x - 8} y2={y + size + 8} />
                <line x1={x + size / 4} y1={y + size} x2={x + size / 4 - 8} y2={y + size + 8} />
                <line x1={x + size / 2} y1={y + size} x2={x + size / 2 - 8} y2={y + size + 8} />
            </g>
        </g>
    );

    // Apoyo empotrado (rectángulo con líneas)
    const FixedSupport = () => (
        <g>
            <rect
                x={x - 6}
                y={y}
                width={12}
                height={size}
                fill="none"
                stroke="#374151"
                strokeWidth={2}
            />
            {/* Líneas de sombreado */}
            <g stroke="#6b7280" strokeWidth={1}>
                <line x1={x - 6} y1={y + 4} x2={x - 14} y2={y + 4} />
                <line x1={x - 6} y1={y + 8} x2={x - 14} y2={y + 8} />
                <line x1={x - 6} y1={y + 12} x2={x - 14} y2={y + 12} />
                <line x1={x - 6} y1={y + 16} x2={x - 14} y2={y + 16} />
            </g>
        </g>
    );

    // Apoyo de rodillo (triángulo + círculo)
    const RollerSupport = () => (
        <g>
            <polygon
                points={`${x},${y} ${x - size / 2},${y + size - 8} ${x + size / 2},${y + size - 8}`}
                fill="none"
                stroke="#374151"
                strokeWidth={2}
            />
            <circle
                cx={x}
                cy={y + size - 2}
                r={6}
                fill="none"
                stroke="#374151"
                strokeWidth={2}
            />
            {/* Líneas de sombreado */}
            <g stroke="#6b7280" strokeWidth={1}>
                <line x1={x - size / 2} y1={y + size + 4} x2={x - size / 2 - 8} y2={y + size + 12} />
                <line x1={x - size / 4} y1={y + size + 4} x2={x - size / 4 - 8} y2={y + size + 12} />
                <line x1={x} y1={y + size + 4} x2={x - 8} y2={y + size + 12} />
                <line x1={x + size / 4} y1={y + size + 4} x2={x + size / 4 - 8} y2={y + size + 12} />
                <line x1={x + size / 2} y1={y + size + 4} x2={x + size / 2 - 8} y2={y + size + 12} />
            </g>
        </g>
    );

    const renderSupport = () => {
        switch (type) {
            case 'simple':
                return <SimpleSupport />;
            case 'fixed':
                return <FixedSupport />;
            case 'roller':
                return <RollerSupport />;
            default:
                return <SimpleSupport />;
        }
    };

    return (
        <g transform={`rotate(${angle}, ${x}, ${y})`}>
            {renderSupport()}
        </g>
    );
};

export default Support;
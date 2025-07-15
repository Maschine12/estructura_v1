// Componente para mostrar diagramas (V(x), M(x))

import React from 'react';
import { GraphicDiagram } from '../model/graphicModel';

interface DiagramViewerProps {
    diagram: GraphicDiagram;
    scale: number;
}

const DiagramViewer: React.FC<DiagramViewerProps> = ({
    diagram,
    scale
}) => {
    const { type, points, color, yOffset = 0 } = diagram;

    // Convertir puntos a coordenadas SVG con protección contra NaN
    const svgPoints = points.map(point => ({
        x: Number(point.x) * scale,
        y: Number(point.y) * scale + yOffset
    }));

    // Crear línea del diagrama
    const createPath = () => {
        const validPoints = svgPoints.filter(p => !isNaN(p.x) && !isNaN(p.y));
        if (validPoints.length === 0) return '';

        let path = `M ${validPoints[0].x} ${validPoints[0].y}`;
        for (let i = 1; i < validPoints.length; i++) {
            path += ` L ${validPoints[i].x} ${validPoints[i].y}`;
        }

        return path;
    };

    // Obtener título del diagrama
    const getTitle = () => {
        switch (type) {
            case 'shear':
                return 'Diagrama de Corte V(x)';
            case 'moment':
                return 'Diagrama de Momento M(x)';
            case 'axial':
                return 'Diagrama Axial N(x)';
            default:
                return 'Diagrama';
        }
    };

    return (
        <g>
            {/* Título del diagrama */}
            <text
                x={10}
                y={yOffset - 10}
                fontSize="14"
                fill={color}
                fontWeight="bold"
            >
                {getTitle()}
            </text>

            {/* Línea del diagrama */}
            <path
                d={createPath()}
                fill="none"
                stroke={color}
                strokeWidth={2}
            />

            {/* Puntos de valores importantes */}
            {svgPoints.map((point, index) => {
                if (isNaN(point.x) || isNaN(point.y)) return null;

                return (
                    <circle
                        key={index}
                        cx={point.x}
                        cy={point.y}
                        r={3}
                        fill={color}
                    />
                );
            })}
        </g>
    );
};

export default DiagramViewer;

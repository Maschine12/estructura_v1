// Componente para dibujar elementos estructurales como vigas o barras

import React from 'react';
import { GraphicMember } from '../model/graphicModel';

interface StructuralMemberProps {
    member: GraphicMember;
    scale: number;
}

const StructuralMember: React.FC<StructuralMemberProps> = ({
    member,
    scale
}) => {
    const { startPoint, endPoint, type, thickness = 8 } = member;

    // Convertir coordenadas del modelo a pixeles
    const x1 = startPoint.x * scale;
    const y1 = startPoint.y * scale;
    const x2 = endPoint.x * scale;
    const y2 = endPoint.y * scale;

    // Definir estilos según el tipo de elemento
    const getStrokeColor = () => {
        switch (type) {
            case 'beam':
                return '#1f2937'; // gris oscuro
            case 'column':
                return '#dc2626'; // rojo
            case 'bar':
                return '#059669'; // verde
            default:
                return '#374151';
        }
    };

    return (
        <g>
            {/* Línea principal del elemento */}
            <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={getStrokeColor()}
                strokeWidth={thickness}
                strokeLinecap="round"
            />

            {/* Líneas de contorno para vigas (efecto 3D simple) */}
            {type === 'beam' && (
                <>
                    <line
                        x1={x1}
                        y1={y1 - thickness / 2}
                        x2={x2}
                        y2={y2 - thickness / 2}
                        stroke="#374151"
                        strokeWidth={1}
                    />
                    <line
                        x1={x1}
                        y1={y1 + thickness / 2}
                        x2={x2}
                        y2={y2 + thickness / 2}
                        stroke="#374151"
                        strokeWidth={1}
                    />
                </>
            )}
        </g>
    );
};

export default StructuralMember;
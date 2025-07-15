// Componente adaptable para elementos estructurales

import React, { useMemo } from 'react';
import { GraphicMember } from '../model/graphicModel';

interface StructuralMemberProps {
    member: GraphicMember;
    scale: number;
    structureSize?: number;
}

// Define el componente con nombre
const StructuralMemberComponent: React.FC<StructuralMemberProps> = ({
    member,
    scale,
    structureSize = 10
}) => {
    const memberProps = useMemo(() => {
        const { startPoint, endPoint, type, thickness = 8 } = member;

        const x1 = startPoint.x * scale;
        const y1 = startPoint.y * scale;
        const x2 = endPoint.x * scale;
        const y2 = endPoint.y * scale;

        const adaptiveThickness = scale === 1
            ? Math.max(structureSize / 150, 0.03)
            : thickness;

        const strokeColor = {
            'beam': '#1f2937',
            'column': '#dc2626',
            'bar': '#059669'
        }[type] || '#374151';

        return {
            x1, y1, x2, y2,
            adaptiveThickness,
            strokeColor,
            type
        };
    }, [member, scale, structureSize]);

    return (
        <g>
            <line
                x1={memberProps.x1}
                y1={memberProps.y1}
                x2={memberProps.x2}
                y2={memberProps.y2}
                stroke={memberProps.strokeColor}
                strokeWidth={memberProps.adaptiveThickness}
                strokeLinecap="round"
            />

            {memberProps.type === 'beam' && (
                <g opacity={0.6}>
                    <line
                        x1={memberProps.x1}
                        y1={memberProps.y1 - memberProps.adaptiveThickness / 2}
                        x2={memberProps.x2}
                        y2={memberProps.y2 - memberProps.adaptiveThickness / 2}
                        stroke="#374151"
                        strokeWidth={memberProps.adaptiveThickness / 12}
                    />
                    <line
                        x1={memberProps.x1}
                        y1={memberProps.y1 + memberProps.adaptiveThickness / 2}
                        x2={memberProps.x2}
                        y2={memberProps.y2 + memberProps.adaptiveThickness / 2}
                        stroke="#374151"
                        strokeWidth={memberProps.adaptiveThickness / 12}
                    />
                </g>
            )}
        </g>
    );
};

// Envuelve en memo y asigna displayName explícitamente
const StructuralMember = React.memo(StructuralMemberComponent);
StructuralMember.displayName = 'StructuralMember';

export default StructuralMember;

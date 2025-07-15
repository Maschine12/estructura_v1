// /app/vigas/graphics/StructuralCanvas.tsx

import React from 'react';
import { GraphicStructureModel } from '../model/graphicModel';
import StructuralMember from './StructuralMember';
import Support from './Support';
import Load from './Load';
import Reaction from './Reaction';
import Label from './Label';
import GridBackground from './GridBackground';

interface StructuralCanvasProps {
    model: GraphicStructureModel;
    width?: number;
    height?: number;
    showGrid?: boolean;
    className?: string;
}

const StructuralCanvas: React.FC<StructuralCanvasProps> = ({
    model,
    width = 800,
    height = 400,
    showGrid = true,
    className = ''
}) => {
    return (
        <div className={`relative ${className}`}>
            <svg
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                className="border border-gray-300 bg-white"
            >
                {/* Fondo con grilla opcional */}
                {showGrid && (
                    <GridBackground
                        width={width}
                        height={height}
                        scale={model.scale}
                    />
                )}

                {/* Dibujar elementos estructurales */}
                <g id="members">
                    {model.members.map((member) => (
                        <StructuralMember
                            key={member.id}
                            member={member}
                            scale={model.scale}
                        />
                    ))}
                </g>

                {/* Dibujar apoyos */}
                <g id="supports">
                    {model.supports.map((support) => (
                        <Support
                            key={support.id}
                            support={support}
                            scale={model.scale}
                        />
                    ))}
                </g>

                {/* Dibujar cargas */}
                <g id="loads">
                    {model.loads.map((load) => (
                        <Load
                            key={load.id}
                            load={load}
                            scale={model.scale}
                        />
                    ))}
                </g>

                {/* Dibujar reacciones */}
                <g id="reactions">
                    {model.reactions.map((reaction) => (
                        <Reaction
                            key={reaction.id}
                            reaction={reaction}
                            scale={model.scale}
                        />
                    ))}
                </g>

                {/* Dibujar etiquetas */}
                <g id="labels">
                    {model.labels?.map((label) => (
                        <Label
                            key={label.id}
                            position={label.position}
                            text={label.text}
                            fontSize={label.fontSize}
                            scale={model.scale}
                        />
                    ))}
                </g>
            </svg>
        </div>
    );
};

export default StructuralCanvas;
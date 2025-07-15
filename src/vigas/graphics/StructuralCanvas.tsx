// /app/vigas/graphics/StructuralCanvas.tsx
// Canvas adaptable que se ajusta automáticamente al tamaño de la estructura

import React, { useMemo } from 'react';
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
    padding?: number; // padding interno para elementos gráficos
}

const StructuralCanvas: React.FC<StructuralCanvasProps> = ({
    model,
    width = 800,
    height = 400,
    showGrid = true,
    className = '',
    padding = 50 // espacio extra para cargas, reacciones, etc.
}) => {

    // Calcular los límites de la estructura y escala adaptativa
    const { viewBox, adaptiveScale, structureBounds } = useMemo(() => {
        // Encontrar los límites de todos los elementos
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;

        // Analizar miembros estructurales
        model.members.forEach(member => {
            minX = Math.min(minX, member.startPoint.x, member.endPoint.x);
            maxX = Math.max(maxX, member.startPoint.x, member.endPoint.x);
            minY = Math.min(minY, member.startPoint.y, member.endPoint.y);
            maxY = Math.max(maxY, member.startPoint.y, member.endPoint.y);
        });

        // Analizar soportes
        model.supports.forEach(support => {
            minX = Math.min(minX, support.position.x);
            maxX = Math.max(maxX, support.position.x);
            minY = Math.min(minY, support.position.y);
            maxY = Math.max(maxY, support.position.y);
        });

        // Analizar cargas
        model.loads.forEach(load => {
            minX = Math.min(minX, load.position.x);
            maxX = Math.max(maxX, load.position.x);
            minY = Math.min(minY, load.position.y);
            maxY = Math.max(maxY, load.position.y);
        });

        // Analizar reacciones
        model.reactions.forEach(reaction => {
            minX = Math.min(minX, reaction.position.x);
            maxX = Math.max(maxX, reaction.position.x);
            minY = Math.min(minY, reaction.position.y);
            maxY = Math.max(maxY, reaction.position.y);
        });

        // Si no hay elementos, usar valores por defecto
        if (!isFinite(minX)) {
            minX = 0; maxX = 10;
            minY = 0; maxY = 5;
        }

        // Calcular dimensiones de la estructura
        const structureWidth = maxX - minX;
        const structureHeight = maxY - minY;

        // Calcular escala adaptativa para que quepa en el canvas
        const availableWidth = width - (padding * 2);
        const availableHeight = height - (padding * 2);

        const scaleX = availableWidth / structureWidth;
        const scaleY = availableHeight / structureHeight;

        // Usar la escala menor para mantener proporciones
        const adaptiveScale = Math.min(scaleX, scaleY, model.scale);

        // Calcular viewBox centrado
        const scaledWidth = structureWidth * adaptiveScale;
        const scaledHeight = structureHeight * adaptiveScale;

        const viewBoxX = (minX * adaptiveScale) - (width - scaledWidth) / 2;
        const viewBoxY = (minY * adaptiveScale) - (height - scaledHeight) / 2;

        return {
            viewBox: `${viewBoxX} ${viewBoxY} ${width} ${height}`,
            adaptiveScale,
            structureBounds: { minX, maxX, minY, maxY, structureWidth, structureHeight }
        };
    }, [model, width, height, padding]);

    return (
        <div className={`relative ${className}`}>
            {/* Información de escala (opcional) */}
            <div className="absolute top-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs text-gray-600 z-10">
                Escala: 1m = {adaptiveScale.toFixed(0)}px
                {structureBounds.structureWidth > 0 && (
                    <span className="ml-2">
                        L: {structureBounds.structureWidth.toFixed(1)}m
                    </span>
                )}
            </div>

            <svg
                width={width}
                height={height}
                viewBox={viewBox}
                className="border border-gray-300 bg-white"
                preserveAspectRatio="xMidYMid meet"
            >
                {/* Fondo con grilla opcional */}
                {showGrid && (
                    <GridBackground
                        width={width}
                        height={height}
                        scale={adaptiveScale}
                    />
                )}

                {/* Dibujar elementos estructurales */}
                <g id="members">
                    {model.members.map((member) => (
                        <StructuralMember
                            key={member.id}
                            member={member}
                            scale={adaptiveScale}
                        />
                    ))}
                </g>

                {/* Dibujar apoyos */}
                <g id="supports">
                    {model.supports.map((support) => (
                        <Support
                            key={support.id}
                            support={support}
                            scale={adaptiveScale}
                        />
                    ))}
                </g>

                {/* Dibujar cargas */}
                <g id="loads">
                    {model.loads.map((load) => (
                        <Load
                            key={load.id}
                            load={load}
                            scale={adaptiveScale}
                        />
                    ))}
                </g>

                {/* Dibujar reacciones */}
                <g id="reactions">
                    {model.reactions.map((reaction) => (
                        <Reaction
                            key={reaction.id}
                            reaction={reaction}
                            scale={adaptiveScale}
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
                            scale={adaptiveScale}
                        />
                    ))}
                </g>

                {/* Dibujar diagramas si existen */}
                {model.diagrams && (
                    <g id="diagrams">
                        {model.diagrams.map((diagram) => (
                            <g key={diagram.id}>
                                {/* Línea del diagrama */}
                                <path
                                    d={createDiagramPath(diagram.points, adaptiveScale)}
                                    fill="none"
                                    stroke={diagram.color}
                                    strokeWidth={2}
                                    transform={`translate(0, ${(diagram.yOffset || 0)})`}
                                />
                                {/* Puntos del diagrama */}
                                {diagram.points.map((point, index) => (
                                    <circle
                                        key={index}
                                        cx={point.x * adaptiveScale}
                                        cy={point.y * adaptiveScale + (diagram.yOffset || 0)}
                                        r={2}
                                        fill={diagram.color}
                                    />
                                ))}
                            </g>
                        ))}
                    </g>
                )}
            </svg>
        </div>
    );
};

// Función auxiliar para crear path de diagramas
function createDiagramPath(points: { x: number; y: number }[], scale: number): string {
    if (points.length === 0) return '';

    let path = `M ${points[0].x * scale} ${points[0].y * scale}`;

    for (let i = 1; i < points.length; i++) {
        path += ` L ${points[i].x * scale} ${points[i].y * scale}`;
    }

    return path;
}

export default StructuralCanvas;
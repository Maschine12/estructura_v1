// Canvas adaptable actualizado con grid inteligente y mejor ordenamiento de elementos

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
    paddingPercent?: number;
}

const StructuralCanvas: React.FC<StructuralCanvasProps> = ({
    model,
    width = 800,
    height = 400,
    showGrid = true,
    className = '',
    paddingPercent = 15
}) => {

    // Calcular límites y configuración adaptativa
    const canvasConfig = useMemo(() => {
        // Encontrar límites de todos los elementos
        const allPoints = [
            ...model.members.flatMap(m => [m.startPoint, m.endPoint]),
            ...model.supports.map(s => s.position),
            ...model.loads.map(l => l.position),
            ...model.reactions.map(r => r.position)
        ];

        if (allPoints.length === 0) {
            return {
                minX: 0, maxX: 10, minY: 0, maxY: 5,
                structureWidth: 10, structureHeight: 5,
                adaptiveScale: 1, viewBox: '0 0 10 5'
            };
        }

        const xs = allPoints.map(p => p.x);
        const ys = allPoints.map(p => p.y);

        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        const structureWidth = maxX - minX || 1;
        const structureHeight = maxY - minY || 1;

        // Padding en unidades de estructura
        const paddingX = Math.max(structureWidth * (paddingPercent / 100), 0.5);
        const paddingY = Math.max(structureHeight * (paddingPercent / 100), 0.5);

        // Calcular escala adaptativa para que quepa en el canvas
        const availableWidth = width - 40; // margen para UI
        const availableHeight = height - 40;

        const scaleX = availableWidth / (structureWidth + 2 * paddingX);
        const scaleY = availableHeight / (structureHeight + 2 * paddingY);

        // Usar la escala menor para mantener proporciones
        const adaptiveScale = Math.min(scaleX, scaleY);

        // ViewBox en coordenadas reales (unidades de estructura)
        const viewBoxMinX = minX - paddingX;
        const viewBoxMinY = minY - paddingY;
        const viewBoxWidth = structureWidth + 2 * paddingX;
        const viewBoxHeight = structureHeight + 2 * paddingY;

        return {
            minX, maxX, minY, maxY,
            structureWidth, structureHeight,
            adaptiveScale,
            viewBox: `${viewBoxMinX} ${viewBoxMinY} ${viewBoxWidth} ${viewBoxHeight}`,
            paddingX, paddingY
        };
    }, [model, width, height, paddingPercent]);

    return (
        <div className={`relative ${className}`}>
            {/* Información de la estructura */}
            <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-xs z-10">
                <div>L: {canvasConfig.structureWidth.toFixed(1)}m</div>
                <div className="text-gray-300">Escala: 1:{Math.round(1 / canvasConfig.adaptiveScale)}</div>
            </div>

            <svg
                width={width}
                height={height}
                viewBox={canvasConfig.viewBox}
                className="border border-gray-300 bg-white"
                preserveAspectRatio="xMidYMid meet"
            >
                {/* Grid adaptable */}
                {showGrid && (
                    <GridBackground
                        structureWidth={canvasConfig.structureWidth}
                        structureHeight={canvasConfig.structureHeight}
                        minX={canvasConfig.minX}
                        minY={canvasConfig.minY}
                        adaptiveScale={canvasConfig.adaptiveScale}
                    />
                )}

                {/* ORDEN IMPORTANTE: elementos de fondo primero */}

                {/* 1. Elementos estructurales (fondo) */}
                <g id="members">
                    {model.members.map((member) => (
                        <StructuralMember
                            key={member.id}
                            member={member}
                            scale={1} // Trabajamos en unidades puras
                            structureSize={canvasConfig.structureWidth}
                        />
                    ))}
                </g>

                {/* 2. Cargas (antes que soportes para que las flechas no se superpongan) */}
                <g id="loads">
                    {model.loads.map((load) => (
                        <Load
                            key={load.id}
                            load={load}
                            scale={1}
                            structureSize={canvasConfig.structureWidth}
                        />
                    ))}
                </g>

                {/* 3. Reacciones (antes que soportes) */}
                <g id="reactions">
                    {model.reactions.map((reaction) => (
                        <Reaction
                            key={reaction.id}
                            reaction={reaction}
                            scale={1}
                            structureSize={canvasConfig.structureWidth}
                        />
                    ))}
                </g>

                {/* 4. Soportes (encima de cargas/reacciones) */}
                <g id="supports">
                    {model.supports.map((support) => (
                        <Support
                            key={support.id}
                            support={support}
                            scale={1}
                            structureSize={canvasConfig.structureWidth}
                        />
                    ))}
                </g>

                {/* 5. Etiquetas (siempre al frente) */}
                <g id="labels">
                    {model.labels?.map((label) => (
                        <Label
                            key={label.id}
                            position={label.position}
                            text={label.text}
                            fontSize={label.fontSize}
                            scale={1}
                            structureSize={canvasConfig.structureWidth}
                        />
                    ))}
                </g>

                {/* 6. Diagramas si existen */}
                {model.diagrams && (
                    <g id="diagrams">
                        {model.diagrams.map((diagram) => (
                            <g key={diagram.id}>
                                <path
                                    d={createDiagramPath(diagram.points)}
                                    fill="none"
                                    stroke={diagram.color}
                                    strokeWidth={0.02}
                                    transform={`translate(0, ${diagram.yOffset || 0})`}
                                />
                                {diagram.points.map((point, index) => (
                                    <circle
                                        key={index}
                                        cx={point.x}
                                        cy={point.y + (diagram.yOffset || 0)}
                                        r={0.01}
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
function createDiagramPath(points: { x: number; y: number }[]): string {
    if (points.length === 0) return '';

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
        path += ` L ${points[i].x} ${points[i].y}`;
    }
    return path;
}

export default StructuralCanvas;
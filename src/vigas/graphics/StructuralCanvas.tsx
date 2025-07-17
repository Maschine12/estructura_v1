// /app/vigas/graphics/StructuralCanvas.tsx
// Canvas completamente responsivo que siempre ocupa el 90% del contenedor

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { GraphicStructureModel } from '../model/graphicModel';
import StructuralMember from './StructuralMember';
import Support from './Support';
import Load from './Load';
import Reaction from './Reaction';
import Label from './Label';
import GridBackground from './GridBackground';

interface StructuralCanvasProps {
    model: GraphicStructureModel;
    showGrid?: boolean;
    className?: string;
    paddingPercent?: number;
}

const StructuralCanvas: React.FC<StructuralCanvasProps> = ({
    model,
    showGrid = true,
    className = '',
    paddingPercent = 15
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerSize, setContainerSize] = useState({ width: 800, height: 400 });

    // Hook para detectar el tamaño del contenedor
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setContainerSize({
                    width: rect.width * 0.9, // 90% del ancho del contenedor
                    height: rect.height * 0.9 // 90% del alto del contenedor
                });
            }
        };

        // Actualizar al montar
        updateSize();

        // Actualizar en resize
        const resizeObserver = new ResizeObserver(updateSize);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => resizeObserver.disconnect();
    }, []);

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
                viewBox: '0 0 10 5'
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

        // ViewBox que incluye toda la estructura + padding
        const viewBoxMinX = minX - paddingX;
        const viewBoxMinY = minY - paddingY;
        const viewBoxWidth = structureWidth + 2 * paddingX;
        const viewBoxHeight = structureHeight + 2 * paddingY;

        return {
            minX, maxX, minY, maxY,
            structureWidth, structureHeight,
            viewBox: `${viewBoxMinX} ${viewBoxMinY} ${viewBoxWidth} ${viewBoxHeight}`,
            paddingX, paddingY
        };
    }, [model, paddingPercent]);

    return (
        <div
            ref={containerRef}
            className={`w-full h-full flex items-center justify-center ${className}`}
            style={{ minHeight: '400px' }} // altura mínima
        >
            {/* Información de la estructura */}
            {/* <div className="absolute top-4 right-4 bg-black bg-opacity-80 text-white px-3 py-2 rounded-lg text-sm z-20 shadow-lg">
                <div className="font-semibold">📏 {canvasConfig.structureWidth.toFixed(1)}m</div>
                <div className="text-gray-300 text-xs">
                    {containerSize.width.toFixed(0)} × {containerSize.height.toFixed(0)}px
                </div>
            </div> */}

            {/* SVG que siempre ocupa el 90% del contenedor */}
            <svg
                width={containerSize.width}
                height={containerSize.height}
                viewBox={canvasConfig.viewBox}
                className="border-2 border-gray-300 bg-white rounded-lg shadow-lg"
                preserveAspectRatio="xMidYMid meet"
                style={{
                    maxWidth: '90%',
                    maxHeight: '90%',
                    minWidth: '300px',
                    minHeight: '200px'
                }}
            >
                {/* Grid adaptable */}
                {showGrid && (
                    <GridBackground
                        structureWidth={canvasConfig.structureWidth}
                        structureHeight={canvasConfig.structureHeight}
                        minX={canvasConfig.minX}
                        minY={canvasConfig.minY}
                        adaptiveScale={1} // Ya no necesitamos escala, trabaja en unidades puras
                    />
                )}

                {/* ORDEN IMPORTANTE: elementos de fondo primero */}

                {/* 1. Elementos estructurales (fondo) */}
                <g id="members">
                    {model.members.map((member) => (
                        <StructuralMember
                            key={member.id}
                            member={member}
                            scale={1}
                            structureSize={canvasConfig.structureWidth}
                        />
                    ))}
                </g>

                {/* 2. Cargas (antes que soportes) */}
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
                            fontSize={label.fontSize || Math.max(canvasConfig.structureWidth / 80, 0.08)}
                            scale={1}
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
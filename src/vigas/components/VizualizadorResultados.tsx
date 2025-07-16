// Componente para mostrar resultados del análisis estructural

import React, { useState } from 'react';
import { ResultadoViga } from '../model/beamModel';
import { GraphicStructureModel } from '../model/graphicModel';
import StructuralCanvas from '../graphics/StructuralCanvas';
import DiagramViewer from '../graphics/DiagramViewer';
import { generarReporte } from '../integration/integrarSolverConGraficos';

interface VisualizadorResultadosProps {
    resultado: ResultadoViga;
    modeloGrafico: GraphicStructureModel;
    modeloDiagramas: GraphicStructureModel;
    className?: string;
}

const VisualizadorResultados: React.FC<VisualizadorResultadosProps> = ({
    resultado,
    modeloGrafico,
    modeloDiagramas,
    className = ''
}) => {
    const [vistaActiva, setVistaActiva] = useState<'estructura' | 'diagramas' | 'calculos'>('estructura');
    const [mostrarReporte, setMostrarReporte] = useState(false);

    if (!resultado.esValida) {
        return (
            <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
                <h2 className="text-xl font-bold text-red-800 mb-4">
                    Error en el Análisis
                </h2>
                <div className="text-red-700">
                    {resultado.errores?.map((error, index) => (
                        <p key={index}>• {error}</p>
                    ))}
                </div>
            </div>
        );
    }

    const navegacion = [
        { id: 'estructura', titulo: 'Estructura', icono: '🏗️' },
        { id: 'diagramas', titulo: 'Diagramas', icono: '📊' },
        { id: 'calculos', titulo: 'Cálculos', icono: '🧮' }
    ];

    return (
        <div className={`bg-white rounded-lg shadow-lg ${className}`}>
            {/* Navegación de tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                    {navegacion.map((tab) => (
                        <button
                            key={tab.id}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            onClick={() => setVistaActiva(tab.id as any)}
                            className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${vistaActiva === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <span className="mr-2">{tab.icono}</span>
                            {tab.titulo}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Contenido de las tabs */}
            <div className="p-6">
                {vistaActiva === 'estructura' && (
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">
                            Estructura con Reacciones
                        </h3>

                        <div className="mb-6">
                            <StructuralCanvas
                                model={modeloGrafico}
                                showGrid={true}
                                className="mx-auto"
                            />
                        </div>

                        {/* Resumen de reacciones */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-medium text-gray-800 mb-3">
                                Reacciones en los Apoyos:
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {resultado.reacciones.map((reaccion, index) => (
                                    <div key={index} className="flex justify-between">
                                        <span className="text-gray-600">
                                            {reaccion.soporteId}:
                                        </span>
                                        <span className="font-medium">
                                            {reaccion.magnitud.toFixed(2)} {reaccion.tipo === 'vertical' ? 'kN' : 'kN·m'}
                                            <span className="text-sm text-gray-500 ml-1">
                                                ({reaccion.direccion})
                                            </span>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {vistaActiva === 'diagramas' && (
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">
                            Diagramas de Esfuerzos
                        </h3>

                        {/* Diagrama de cortante */}
                        {modeloDiagramas.diagrams && modeloDiagramas.diagrams.length > 0 && (
                            <div className="space-y-6">
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h4 className="font-medium text-red-600 mb-3">
                                        Diagrama de Fuerza Cortante V(x)
                                    </h4>
                                    <svg width="700" height="200" className="border bg-gray-50">
                                        <DiagramViewer
                                            diagram={modeloDiagramas.diagrams[0]}
                                            scale={modeloGrafico.scale}
                                        />
                                    </svg>
                                </div>

                                {modeloDiagramas.diagrams[1] && (
                                    <div className="border border-gray-200 rounded-lg p-4">
                                        <h4 className="font-medium text-blue-600 mb-3">
                                            Diagrama de Momento Flector M(x)
                                        </h4>
                                        <svg width="700" height="200" className="border bg-gray-50">
                                            <DiagramViewer
                                                diagram={modeloDiagramas.diagrams[1]}
                                                scale={modeloGrafico.scale}
                                            />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Puntos críticos */}
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-red-50 rounded-lg p-4">
                                <h4 className="font-medium text-red-800 mb-3">
                                    Puntos Críticos - Cortante
                                </h4>
                                <div className="space-y-1 text-sm">
                                    {resultado.puntosCriticosCorte.map((punto, index) => (
                                        <p key={index} className="text-red-700">
                                            • {punto.descripcion}
                                        </p>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-blue-50 rounded-lg p-4">
                                <h4 className="font-medium text-blue-800 mb-3">
                                    Puntos Críticos - Momento
                                </h4>
                                <div className="space-y-1 text-sm">
                                    {resultado.puntosCriticosMomento.map((punto, index) => (
                                        <p key={index} className="text-blue-700">
                                            • {punto.descripcion}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {vistaActiva === 'calculos' && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">
                                Procedimiento de Cálculo
                            </h3>
                            <button
                                onClick={() => setMostrarReporte(!mostrarReporte)}
                                className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 transition-colors"
                            >
                                {mostrarReporte ? 'Ocultar' : 'Ver'} Reporte Completo
                            </button>
                        </div>

                        {/* Pasos del cálculo */}
                        <div className="space-y-4">
                            {resultado.pasosCalculos.map((paso) => (
                                <div key={paso.numero} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-start space-x-3">
                                        <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                                            {paso.numero}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-800 mb-2">
                                                {paso.titulo}
                                            </h4>
                                            <p className="text-gray-600 text-sm mb-2">
                                                {paso.descripcion}
                                            </p>

                                            {paso.ecuacion && (
                                                <div className="bg-gray-50 rounded p-2 mb-2">
                                                    <span className="text-xs text-gray-500">Ecuación:</span>
                                                    <p className="font-mono text-sm">{paso.ecuacion}</p>
                                                </div>
                                            )}

                                            {paso.calculo && (
                                                <div className="bg-gray-50 rounded p-2 mb-2">
                                                    <span className="text-xs text-gray-500">Cálculo:</span>
                                                    <p className="font-mono text-sm">{paso.calculo}</p>
                                                </div>
                                            )}

                                            {paso.resultado && (
                                                <div className="bg-green-50 rounded p-2">
                                                    <span className="text-xs text-green-600">Resultado:</span>
                                                    <p className="font-medium text-green-800">{paso.resultado}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Reporte completo */}
                        {mostrarReporte && (
                            <div className="mt-6 bg-gray-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-800 mb-3">
                                    Reporte Completo
                                </h4>
                                <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                                    {generarReporte(resultado)}
                                </pre>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VisualizadorResultados;
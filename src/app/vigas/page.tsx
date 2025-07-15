// Aplicación completa que integra formulario, solver y visualización
'use client'
import React, { useState } from 'react';
import { BeamModel, ResultadoViga } from '@/vigas/model/beamModel';
import { GraphicStructureModel } from '@/vigas/model/graphicModel';
import FormularioViga from '@/vigas/components/FormularioViga';
import VisualizadorResultados from '@/vigas/components/VizualizadorResultados';
import { resolverYVisualizar } from '@/vigas/integration/integrarSolverConGraficos';

const AppVigasCompleta: React.FC = () => {
    const [modeloActual, setModeloActual] = useState<BeamModel | null>(null);
    const [resultadoActual, setResultadoActual] = useState<ResultadoViga | null>(null);
    const [modeloGrafico, setModeloGrafico] = useState<GraphicStructureModel | null>(null);
    const [modeloDiagramas, setModeloDiagramas] = useState<GraphicStructureModel | null>(null);
    const [cargando, setCargando] = useState(false);

    const manejarModeloCreado = async (modelo: BeamModel) => {
        setCargando(true);
        setModeloActual(modelo);

        try {
            // Resolver la estructura y generar modelos gráficos
            const { resultado, modeloGrafico, modeloDiagramas } = resolverYVisualizar(modelo);

            setResultadoActual(resultado);
            setModeloGrafico(modeloGrafico);
            setModeloDiagramas(modeloDiagramas);

        } catch (error) {
            console.error('Error al resolver la estructura:', error);
            // Aquí podrías mostrar un mensaje de error al usuario
        } finally {
            setCargando(false);
        }
    };

    const reiniciarAnalisis = () => {
        setModeloActual(null);
        setResultadoActual(null);
        setModeloGrafico(null);
        setModeloDiagramas(null);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Análisis de Vigas Isostáticas
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Herramienta de cálculo estructural con visualización SVG
                            </p>
                        </div>

                        {modeloActual && (
                            <button
                                onClick={reiniciarAnalisis}
                                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Nuevo Análisis
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Panel izquierdo - Formulario */}
                    <div className="lg:col-span-4">
                        <FormularioViga
                            onModeloCreado={manejarModeloCreado}
                            className="sticky top-8"
                        />

                        {/* Información adicional */}
                        <div className="mt-6 bg-blue-50 rounded-lg p-4">
                            <h3 className="font-medium text-blue-800 mb-2">
                                ℹ️ Información
                            </h3>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• Solo vigas simplemente apoyadas</li>
                                <li>• Análisis por estática clásica</li>
                                <li>• Cargas puntuales y distribuidas</li>
                                <li>• Diagramas V(x) y M(x)</li>
                            </ul>
                        </div>
                    </div>

                    {/* Panel derecho - Resultados */}
                    <div className="lg:col-span-8">
                        {cargando && (
                            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Analizando estructura...</p>
                            </div>
                        )}

                        {!cargando && !resultadoActual && (
                            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                                <div className="text-6xl mb-4">🏗️</div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                    Listo para Analizar
                                </h2>
                                <p className="text-gray-600">
                                    Configure una viga en el panel izquierdo para comenzar el análisis estructural.
                                </p>
                            </div>
                        )}

                        {!cargando && resultadoActual && modeloGrafico && modeloDiagramas && (
                            <VisualizadorResultados
                                resultado={resultadoActual}
                                modeloGrafico={modeloGrafico}
                                modeloDiagramas={modeloDiagramas}
                            />
                        )}
                    </div>
                </div>

                {/* Información del modelo actual */}
                {modeloActual && (
                    <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">
                            Datos del Modelo Actual
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <h4 className="font-medium text-gray-600 mb-2">Geometría</h4>
                                <p className="text-sm">Longitud: {modeloActual.longitud} m</p>
                                <p className="text-sm">Soportes: {modeloActual.soportes.length}</p>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-600 mb-2">Cargas</h4>
                                <p className="text-sm">
                                    Puntuales: {modeloActual.cargasPuntuales.length}
                                </p>
                                <p className="text-sm">
                                    Distribuidas: {modeloActual.cargasDistribuidas?.length || 0}
                                </p>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-600 mb-2">Estado</h4>
                                <p className="text-sm">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${resultadoActual?.esValida
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}>
                                        {resultadoActual?.esValida ? '✓ Válida' : '✗ Inválida'}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="text-center text-sm text-gray-500">
                        <p>
                            Motor gráfico SVG + Solver estructural para vigas isostáticas
                        </p>
                        <p className="mt-1">
                            Desarrollado con Next.js, TypeScript y TailwindCSS
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default AppVigasCompleta;
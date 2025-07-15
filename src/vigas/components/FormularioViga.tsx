// Formulario para crear modelos de viga de forma interactiva

import React, { useState } from 'react';
import { BeamModel, CargaPuntual, Soporte } from '../model/beamModel';

interface FormularioVigaProps {
    onModeloCreado: (modelo: BeamModel) => void;
    className?: string;
}

const FormularioViga: React.FC<FormularioVigaProps> = ({
    onModeloCreado,
    className = ''
}) => {
    const [longitud, setLongitud] = useState<number>(6);
    const [cargas, setCargas] = useState<CargaPuntual[]>([]);
    const [nuevaCarga, setNuevaCarga] = useState({
        posicion: 3,
        magnitud: 10
    });

    // Crear modelo básico con dos apoyos
    const crearModelo = (): BeamModel => {
        const soportes: Soporte[] = [
            {
                id: 'apoyo-a',
                posicion: 0,
                tipo: 'simple'
            },
            {
                id: 'apoyo-b',
                posicion: longitud,
                tipo: 'roller'
            }
        ];

        return {
            id: `viga-${Date.now()}`,
            longitud,
            soportes,
            cargasPuntuales: cargas,
            cargasDistribuidas: []
        };
    };

    const agregarCarga = () => {
        if (nuevaCarga.posicion >= 0 && nuevaCarga.posicion <= longitud) {
            const carga: CargaPuntual = {
                id: `carga-${cargas.length + 1}`,
                posicion: nuevaCarga.posicion,
                magnitud: nuevaCarga.magnitud,
                direccion: 'down'
            };

            setCargas([...cargas, carga]);
            setNuevaCarga({ posicion: longitud / 2, magnitud: 10 });
        }
    };

    const eliminarCarga = (id: string) => {
        setCargas(cargas.filter(c => c.id !== id));
    };

    const calcularViga = () => {
        const modelo = crearModelo();
        onModeloCreado(modelo);
    };

    return (
        <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
            <h2 className="text-xl font-bold mb-6 text-gray-800">
                Configurar Viga Simplemente Apoyada
            </h2>

            {/* Longitud de la viga */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitud de la viga (m)
                </label>
                <input
                    type="number"
                    value={longitud}
                    onChange={(e) => setLongitud(Number(e.target.value))}
                    min="1"
                    max="20"
                    step="0.5"
                    className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Configurar cargas */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">
                    Cargas Puntuales
                </h3>

                {/* Lista de cargas existentes */}
                {cargas.length > 0 && (
                    <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-600 mb-2">
                            Cargas definidas:
                        </h4>
                        <div className="space-y-2">
                            {cargas.map((carga) => (
                                <div key={carga.id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                                    <span className="text-sm">
                                        {carga.magnitud} kN en x = {carga.posicion} m
                                    </span>
                                    <button
                                        onClick={() => eliminarCarga(carga.id)}
                                        className="text-red-600 hover:text-red-800 text-sm"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Agregar nueva carga */}
                <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-600 mb-3">
                        Agregar nueva carga:
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">
                                Posición (m)
                            </label>
                            <input
                                type="number"
                                value={nuevaCarga.posicion}
                                onChange={(e) => setNuevaCarga({
                                    ...nuevaCarga,
                                    posicion: Number(e.target.value)
                                })}
                                min="0"
                                max={longitud}
                                step="0.1"
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-gray-500 mb-1">
                                Magnitud (kN)
                            </label>
                            <input
                                type="number"
                                value={nuevaCarga.magnitud}
                                onChange={(e) => setNuevaCarga({
                                    ...nuevaCarga,
                                    magnitud: Number(e.target.value)
                                })}
                                min="0.1"
                                step="0.1"
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={agregarCarga}
                                className="w-full bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                            >
                                Agregar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Información de la configuración */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-2">
                    Configuración actual:
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Viga de {longitud} m de longitud</li>
                    <li>• Apoyo simple en x = 0 m (punto A)</li>
                    <li>• Apoyo de rodillo en x = {longitud} m (punto B)</li>
                    <li>• {cargas.length} carga(s) puntual(es)</li>
                </ul>
            </div>

            {/* Botón para calcular */}
            <button
                onClick={calcularViga}
                disabled={cargas.length === 0}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${cargas.length === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
            >
                {cargas.length === 0 ? 'Agregue al menos una carga' : 'Analizar Estructura'}
            </button>
        </div>
    );
};

export default FormularioViga;
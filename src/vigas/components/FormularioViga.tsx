// /src/vigas/components/FormularioViga.tsx
// Formulario refactorizado usando componentes reutilizables

import React, { useState } from 'react';
import { BeamModel, CargaPuntual, CargaDistribuida, Soporte, SoporteTipo } from '../model/beamModel';
import {
    Label,
    NumberInput,
    TextInput,
    Select,
    Field,
    FormGrid,
    SOPORTE_OPTIONS
} from '../../components/ui/InputComponents';

interface FormularioVigaProps {
    onModeloCreado: (modelo: BeamModel) => void;
    className?: string;
}

const FormularioViga: React.FC<FormularioVigaProps> = ({
    onModeloCreado,
    className = ''
}) => {
    const [longitud, setLongitud] = useState<number>(6);
    const [soportes, setSoportes] = useState<Soporte[]>([
        { id: 'apoyo-a', posicion: 0, tipo: 'simple' },
        { id: 'apoyo-b', posicion: 6, tipo: 'roller' }
    ]);
    const [cargasPuntuales, setCargasPuntuales] = useState<CargaPuntual[]>([]);
    const [cargasDistribuidas, setCargasDistribuidas] = useState<CargaDistribuida[]>([]);

    // Estados para nuevos elementos
    const [nuevaCargaPuntual, setNuevaCargaPuntual] = useState({
        posicion: 3,
        magnitud: 10
    });

    const [nuevaCargaDistribuida, setNuevaCargaDistribuida] = useState({
        inicio: 1,
        fin: 3,
        magnitud: 5
    });

    const [nuevoSoporte, setNuevoSoporte] = useState({
        posicion: 3,
        tipo: 'simple' as SoporteTipo
    });

    // Actualizar posiciones cuando cambia la longitud
    const actualizarLongitud = (nuevaLongitud: number) => {
        setLongitud(nuevaLongitud);
        setSoportes(prev => prev.map((soporte, index) => {
            if (index === 0) return { ...soporte, posicion: 0 };
            if (index === 1) return { ...soporte, posicion: nuevaLongitud };
            return soporte;
        }));
        setNuevaCargaPuntual(prev => ({ ...prev, posicion: nuevaLongitud / 2 }));
        setNuevaCargaDistribuida(prev => ({
            ...prev,
            inicio: nuevaLongitud * 0.2,
            fin: nuevaLongitud * 0.6
        }));
    };

    // Funciones para cargas puntuales
    const agregarCargaPuntual = () => {
        if (nuevaCargaPuntual.posicion >= 0 && nuevaCargaPuntual.posicion <= longitud) {
            const carga: CargaPuntual = {
                id: `carga-p-${cargasPuntuales.length + 1}`,
                posicion: nuevaCargaPuntual.posicion,
                magnitud: nuevaCargaPuntual.magnitud,
                direccion: 'down'
            };
            setCargasPuntuales([...cargasPuntuales, carga]);
            setNuevaCargaPuntual({ posicion: longitud / 2, magnitud: 10 });
        }
    };

    const eliminarCargaPuntual = (id: string) => {
        setCargasPuntuales(cargasPuntuales.filter(c => c.id !== id));
    };

    // Funciones para cargas distribuidas
    const agregarCargaDistribuida = () => {
        if (nuevaCargaDistribuida.inicio >= 0 &&
            nuevaCargaDistribuida.fin <= longitud &&
            nuevaCargaDistribuida.inicio < nuevaCargaDistribuida.fin) {

            const carga: CargaDistribuida = {
                id: `carga-d-${cargasDistribuidas.length + 1}`,
                inicio: nuevaCargaDistribuida.inicio,
                fin: nuevaCargaDistribuida.fin,
                magnitudInicio: nuevaCargaDistribuida.magnitud,
                magnitudFin: nuevaCargaDistribuida.magnitud,
                direccion: 'down'
            };
            setCargasDistribuidas([...cargasDistribuidas, carga]);
            setNuevaCargaDistribuida({
                inicio: longitud * 0.2,
                fin: longitud * 0.6,
                magnitud: 5
            });
        }
    };

    const eliminarCargaDistribuida = (id: string) => {
        setCargasDistribuidas(cargasDistribuidas.filter(c => c.id !== id));
    };

    // Funciones para soportes
    const agregarSoporte = () => {
        if (nuevoSoporte.posicion >= 0 &&
            nuevoSoporte.posicion <= longitud &&
            !soportes.some(s => Math.abs(s.posicion - nuevoSoporte.posicion) < 0.1)) {

            const soporte: Soporte = {
                id: `apoyo-${soportes.length + 1}`,
                posicion: nuevoSoporte.posicion,
                tipo: nuevoSoporte.tipo
            };
            setSoportes([...soportes, soporte].sort((a, b) => a.posicion - b.posicion));
            setNuevoSoporte({ posicion: longitud / 2, tipo: 'simple' });
        }
    };

    const eliminarSoporte = (id: string) => {
        if (soportes.length > 2) {
            setSoportes(soportes.filter(s => s.id !== id));
        }
    };

    const actualizarTipoSoporte = (id: string, nuevoTipo: SoporteTipo) => {
        setSoportes(soportes.map(s =>
            s.id === id ? { ...s, tipo: nuevoTipo } : s
        ));
    };

    // Crear modelo y calcular
    const crearModelo = (): BeamModel => {
        return {
            id: `viga-${Date.now()}`,
            longitud,
            soportes: soportes.sort((a, b) => a.posicion - b.posicion),
            cargasPuntuales,
            cargasDistribuidas
        };
    };

    const calcularViga = () => {
        const modelo = crearModelo();
        onModeloCreado(modelo);
    };

    const puedeCalcular = soportes.length >= 2 && (cargasPuntuales.length > 0 || cargasDistribuidas.length > 0);

    return (
        <div className={`bg-white rounded-lg shadow-lg p-6 ${className} max-h-screen overflow-y-auto`}>
            <h2 className="text-xl font-bold mb-6 text-gray-800">
                🏗️ Configurar Viga Estructural
            </h2>

            {/* Configuración básica */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-blue-800">
                    Geometría
                </h3>
                <Field
                    label="Longitud de la viga (m)"
                    required
                    hint="Entre 1 y 50 metros"
                    className="max-w-xs"
                >
                    <NumberInput
                        value={longitud}
                        onChange={actualizarLongitud}
                        min={1}
                        max={50}
                        step={0.5}
                    />
                </Field>
            </div>

            {/* Gestión de soportes */}
            <div className="mb-6 p-4 bg-green-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-green-800">
                    🔹 Apoyos actuales {soportes.length}
                </h3>

                {/* Lista de soportes existentes */}
                <div className="space-y-2 mb-4">
                    {soportes.map((soporte, index) => (
                        <div key={soporte.id} className="flex items-center justify-between bg-white px-3 py-2 rounded border">
                            <div className="flex items-center space-x-3">
                                <span className="text-sm font-medium text-black">
                                    {String.fromCharCode(65 + index)}: x = {soporte.posicion}m
                                </span>
                                <Select
                                    value={soporte.tipo}
                                    onChange={(value) => actualizarTipoSoporte(soporte.id, value as SoporteTipo)}
                                    options={SOPORTE_OPTIONS}
                                    size="sm"
                                    className="w-32"
                                />
                            </div>
                            {soportes.length > 2 && (
                                <button
                                    onClick={() => eliminarSoporte(soporte.id)}
                                    className="text-red-600 hover:text-red-800 text-sm"
                                >
                                    Eliminar
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Agregar nuevo soporte */}
                <div className="border border-green-200 rounded p-3">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Agregar apoyo:</h4>
                    <FormGrid columns={3}>
                        <Field label="Posición (m)" labelColor="green">
                            <NumberInput
                                value={nuevoSoporte.posicion}
                                onChange={(value) => setNuevoSoporte({
                                    ...nuevoSoporte,
                                    posicion: value
                                })}
                                min={0}
                                max={longitud}
                                step={0.1}
                                size="sm"
                            />
                        </Field>

                        <Field label="Tipo" labelColor="green">
                            <Select
                                value={nuevoSoporte.tipo}
                                onChange={(value) => setNuevoSoporte({
                                    ...nuevoSoporte,
                                    tipo: value as SoporteTipo
                                })}
                                options={SOPORTE_OPTIONS}
                                size="sm"
                            />
                        </Field>

                        <div className="flex items-end">
                            <button
                                onClick={agregarSoporte}
                                className="w-full bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                            >
                                Agregar
                            </button>
                        </div>
                    </FormGrid>
                </div>
            </div>

            {/* Gestión de cargas puntuales */}
            <div className="mb-6 p-4 bg-red-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-red-800">
                    ⬇️ Cargas Puntuales ({cargasPuntuales.length})
                </h3>

                {/* Lista de cargas puntuales */}
                {cargasPuntuales.length > 0 && (
                    <div className="space-y-2 mb-4">
                        {cargasPuntuales.map((carga) => (
                            <div key={carga.id} className="flex items-center justify-between bg-white px-3 py-2 rounded border">
                                <span className="text-sm">
                                    {carga.magnitud} kN en x = {carga.posicion} m
                                </span>
                                <button
                                    onClick={() => eliminarCargaPuntual(carga.id)}
                                    className="text-red-600 hover:text-red-800 text-sm hover:bg-red-100 px-2 py-1 rounded transition-colors"
                                >
                                    Eliminar
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Agregar nueva carga puntual */}
                <div className="border border-red-200 rounded p-3">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Agregar carga puntual:</h4>
                    <FormGrid columns={3}>
                        <Field label="Posición (m)" labelColor="red">
                            <NumberInput
                                value={nuevaCargaPuntual.posicion}
                                onChange={(value) => setNuevaCargaPuntual({
                                    ...nuevaCargaPuntual,
                                    posicion: value
                                })}
                                min={0}
                                max={longitud}
                                step={0.1}
                                size="sm"
                            />
                        </Field>

                        <Field label="Magnitud (kN)" labelColor="red">
                            <NumberInput
                                value={nuevaCargaPuntual.magnitud}
                                onChange={(value) => setNuevaCargaPuntual({
                                    ...nuevaCargaPuntual,
                                    magnitud: value
                                })}
                                min={0.1}
                                step={0.1}
                                size="sm"
                            />
                        </Field>

                        <div className="flex items-end">
                            <button
                                onClick={agregarCargaPuntual}
                                className="w-full bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                            >
                                Agregar
                            </button>
                        </div>
                    </FormGrid>
                </div>
            </div>

            {/* Gestión de cargas distribuidas */}
            <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-purple-800">
                    📊 Cargas Distribuidas ({cargasDistribuidas.length})
                </h3>

                {/* Lista de cargas distribuidas */}
                {cargasDistribuidas.length > 0 && (
                    <div className="space-y-2 mb-4">
                        {cargasDistribuidas.map((carga) => (
                            <div key={carga.id} className="flex items-center justify-between bg-white px-3 py-2 rounded border">
                                <span className="text-sm">
                                    {carga.magnitudInicio} kN/m desde x = {carga.inicio}m hasta x = {carga.fin}m
                                </span>
                                <button
                                    onClick={() => eliminarCargaDistribuida(carga.id)}
                                    className="text-purple-600 hover:text-purple-800 text-sm hover:bg-purple-100 px-2 py-1 rounded transition-colors"
                                >
                                    Eliminar
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Agregar nueva carga distribuida */}
                <div className="border border-purple-200 rounded p-3">
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Agregar carga distribuida:</h4>
                    <FormGrid columns={4}>
                        <Field label="Inicio (m)" labelColor="purple">
                            <NumberInput
                                value={nuevaCargaDistribuida.inicio}
                                onChange={(value) => setNuevaCargaDistribuida({
                                    ...nuevaCargaDistribuida,
                                    inicio: value
                                })}
                                min={0}
                                max={longitud}
                                step={0.1}
                                size="sm"
                            />
                        </Field>

                        <Field label="Fin (m)" labelColor="purple">
                            <NumberInput
                                value={nuevaCargaDistribuida.fin}
                                onChange={(value) => setNuevaCargaDistribuida({
                                    ...nuevaCargaDistribuida,
                                    fin: value
                                })}
                                min={0}
                                max={longitud}
                                step={0.1}
                                size="sm"
                            />
                        </Field>

                        <Field label="Magnitud (kN/m)" labelColor="purple">
                            <NumberInput
                                value={nuevaCargaDistribuida.magnitud}
                                onChange={(value) => setNuevaCargaDistribuida({
                                    ...nuevaCargaDistribuida,
                                    magnitud: value
                                })}
                                min={0.1}
                                step={0.1}
                                size="sm"
                            />
                        </Field>

                        <div className="flex items-end">
                            <button
                                onClick={agregarCargaDistribuida}
                                className="w-full bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors"
                            >
                                Agregar
                            </button>
                        </div>
                    </FormGrid>
                </div>
            </div>

            {/* Resumen de la configuración */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-800 mb-2">
                    📋 Resumen de la configuración:
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Viga de {longitud} m de longitud</li>
                    <li>• {soportes.length} apoyo(s): {soportes.map((s, i) => `${String.fromCharCode(65 + i)}(${s.tipo})`).join(', ')}</li>
                    <li>• {cargasPuntuales.length} carga(s) puntual(es)</li>
                    <li>• {cargasDistribuidas.length} carga(s) distribuida(s)</li>
                    <li className={puedeCalcular ? "text-green-600 font-medium" : "text-red-600"}>
                        {puedeCalcular ? "✓ Lista para analizar" : "⚠️ Necesita al menos una carga"}
                    </li>
                </ul>
            </div>

            {/* Botón para calcular */}
            <button
                onClick={calcularViga}
                disabled={!puedeCalcular}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${puedeCalcular
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
            >
                {!puedeCalcular
                    ? '⚠️ Agregue al menos una carga para continuar'
                    : '🚀 Analizar Estructura'
                }
            </button>

            {/* Ayuda rápida */}
            <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-2">
                    💡 Consejos rápidos:
                </h4>
                <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Mínimo 2 apoyos para estructura isostática</li>
                    <li>• Las cargas distribuidas se convierten automáticamente a equivalentes</li>
                    <li>• Los apoyos simples resisten fuerzas verticales</li>
                    <li>• Los rodillos permiten desplazamiento horizontal</li>
                </ul>
            </div>
        </div>
    );
};

export default FormularioViga;
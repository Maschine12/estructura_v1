// Integración entre el solver y el motor gráfico - VERSIÓN CORREGIDA

import { BeamModel, ResultadoViga } from '../model/beamModel';
import { GraphicStructureModel, Point } from '../model/graphicModel';
import { resolverVigaIsostatica } from '../model/vigaIsostatica';

/**
 * Función principal que resuelve una viga y genera el modelo gráfico
 */
export function resolverYVisualizar(modelo: BeamModel): {
    resultado: ResultadoViga;
    modeloGrafico: GraphicStructureModel;
    modeloDiagramas: GraphicStructureModel;
} {
    // 1. Resolver la estructura
    const resultado = resolverVigaIsostatica(modelo);

    // 2. Convertir a modelo gráfico principal
    const modeloGrafico = convertirAModeloGrafico(modelo, resultado);

    // 3. Crear modelo para diagramas
    const modeloDiagramas = crearModeloDiagramas(resultado, modelo.longitud);

    return {
        resultado,
        modeloGrafico,
        modeloDiagramas
    };
}

/**
 * Convierte BeamModel + ResultadoViga a GraphicStructureModel
 */
function convertirAModeloGrafico(
    modelo: BeamModel,
    resultado: ResultadoViga
): GraphicStructureModel {
    const escala = 100; // 1m = 100px
    const yViga = 2; // altura de la viga en coordenadas del modelo

    return {
        scale: escala,

        // Viga principal
        members: [
            {
                id: 'viga-principal',
                startPoint: { x: 0, y: yViga },
                endPoint: { x: modelo.longitud, y: yViga },
                type: 'beam',
                thickness: 12
            }
        ],

        // Soportes
        supports: modelo.soportes.map(soporte => ({
            id: soporte.id,
            position: { x: soporte.posicion, y: yViga },
            type: soporte.tipo as 'simple' | 'roller' // Conversión explícita de tipos
        })),

        // Cargas puntuales
        loads: [
            ...modelo.cargasPuntuales.map(carga => ({
                id: carga.id,
                position: { x: carga.posicion, y: yViga },
                type: 'point' as const,
                magnitude: carga.magnitud,
                direction: carga.direccion,
                unit: 'kN'
            })),

            // Cargas distribuidas
            ...(modelo.cargasDistribuidas?.map(carga => ({
                id: carga.id,
                position: { x: carga.inicio, y: yViga },
                type: 'distributed' as const,
                magnitude: carga.magnitudInicio,
                direction: carga.direccion,
                length: carga.fin - carga.inicio,
                unit: 'kN/m'
            })) || [])
        ],

        // Reacciones calculadas
        reactions: resultado.reacciones.map(reaccion => ({
            id: `reaccion-${reaccion.soporteId}`,
            position: { x: reaccion.posicion, y: yViga },
            type: reaccion.tipo === 'momento' ? 'moment' : reaccion.tipo as 'vertical' | 'horizontal',
            magnitude: reaccion.magnitud,
            direction: reaccion.direccion as 'up' | 'down' | 'left' | 'right',
            unit: 'kN'
        })),

        // Etiquetas informativas
        labels: [
            {
                id: 'longitud-viga',
                position: { x: modelo.longitud / 2, y: yViga + 1 },
                text: `L = ${modelo.longitud.toFixed(2)} m`,
                fontSize: 14
            },

            // Etiquetas de soportes
            ...modelo.soportes.map((soporte, index: number) => ({
                id: `etiqueta-${soporte.id}`,
                position: { x: soporte.posicion, y: yViga + 1.2 },
                text: String.fromCharCode(65 + index), // A, B, C...
                fontSize: 16
            }))
        ]
    };
}

/**
 * Crea modelo gráfico para mostrar diagramas V(x) y M(x)
 */
function crearModeloDiagramas(
    resultado: ResultadoViga,
    longitud: number
): GraphicStructureModel {
    const escala = 100;
    const factorEscalaDiagrama = 10; // escalar valores para visualización

    // Generar puntos para diagrama de cortante - TIPADO EXPLÍCITO
    const puntosCorte: Point[] = [];
    resultado.funcionesCorte.forEach(funcion => {
        funcion.puntos.forEach(punto => {
            puntosCorte.push({
                x: punto.x,
                y: -punto.valor / factorEscalaDiagrama // negativo para que hacia abajo sea positivo
            });
        });
    });

    // Generar puntos para diagrama de momento - TIPADO EXPLÍCITO
    const puntosMomento: Point[] = [];
    resultado.funcionesMomento.forEach(funcion => {
        funcion.puntos.forEach(punto => {
            puntosMomento.push({
                x: punto.x,
                y: -punto.valor / factorEscalaDiagrama
            });
        });
    });

    return {
        scale: escala,
        members: [],
        supports: [],
        loads: [],
        reactions: [],

        // Diagramas como elementos gráficos especiales
        diagrams: [
            {
                id: 'diagrama-cortante',
                type: 'shear',
                points: puntosCorte,
                color: '#dc2626',
                yOffset: 100 // separación vertical
            },
            {
                id: 'diagrama-momento',
                type: 'moment',
                points: puntosMomento,
                color: '#2563eb',
                yOffset: 250
            }
        ],

        // Etiquetas para diagramas
        labels: [
            {
                id: 'titulo-cortante',
                position: { x: longitud / 2, y: -0.5 },
                text: 'Diagrama de Fuerza Cortante V(x)',
                fontSize: 14
            },
            {
                id: 'titulo-momento',
                position: { x: longitud / 2, y: 2 },
                text: 'Diagrama de Momento Flector M(x)',
                fontSize: 14
            }
        ]
    };
}

/**
 * Genera reporte textual de los resultados
 */
export function generarReporte(resultado: ResultadoViga): string {
    let reporte = '=== REPORTE DE ANÁLISIS ESTRUCTURAL ===\n\n';

    // Estado de la estructura
    reporte += `Estado: ${resultado.esValida ? '✓ Válida' : '✗ Inválida'}\n`;
    if (resultado.errores) {
        reporte += `Errores: ${resultado.errores.join(', ')}\n`;
    }
    reporte += '\n';

    // Reacciones
    reporte += '--- REACCIONES EN APOYOS ---\n';
    resultado.reacciones.forEach(reaccion => {
        reporte += `${reaccion.soporteId}: ${reaccion.magnitud.toFixed(2)} ${reaccion.tipo === 'vertical' ? 'kN' : 'kN·m'} (${reaccion.direccion})\n`;
    });
    reporte += '\n';

    // Puntos críticos
    reporte += '--- PUNTOS CRÍTICOS ---\n';
    reporte += 'Fuerza Cortante:\n';
    resultado.puntosCriticosCorte.forEach(punto => {
        reporte += `  • ${punto.descripcion}\n`;
    });

    reporte += '\nMomento Flector:\n';
    resultado.puntosCriticosMomento.forEach(punto => {
        reporte += `  • ${punto.descripcion}\n`;
    });
    reporte += '\n';

    // Pasos de cálculo
    reporte += '--- PROCEDIMIENTO DE CÁLCULO ---\n';
    resultado.pasosCalculos.forEach(paso => {
        reporte += `${paso.numero}. ${paso.titulo}\n`;
        if (paso.descripcion) reporte += `   ${paso.descripcion}\n`;
        if (paso.ecuacion) reporte += `   Ecuación: ${paso.ecuacion}\n`;
        if (paso.calculo) reporte += `   Cálculo: ${paso.calculo}\n`;
        if (paso.resultado) reporte += `   Resultado: ${paso.resultado}\n`;
        reporte += '\n';
    });

    return reporte;
}
// /src/vigas/domain/vigaIsostaticaSolver.ts
// Solver principal para vigas simplemente apoyadas (isostáticas)

import {
    BeamModel,
    ResultadoViga,
    Reaccion,
    FuncionDiagrama,
    PuntoCritico,
    PasoCalculoResolucion,
    CargaPuntual
} from '../model/beamModel';

import {
    cargaDistribuidaAEquivalente,
    calcularMomento,
    generarPuntosLineales,
    encontrarCerosLineales,
    validarVigaIsostatica,
    redondear
} from '../model/estructuras';

/**
 * Función principal para resolver viga isostática
 */
export function resolverVigaIsostatica(modelo: BeamModel): ResultadoViga {
    const pasos: PasoCalculoResolucion[] = [];
    let numerosPaso = 1;

    // Paso 1: Validar estructura
    pasos.push({
        numero: numerosPaso++,
        titulo: "Validación de la estructura",
        descripcion: "Verificar que la viga sea isostática",
        calculo: `Soportes: ${modelo.soportes.length}, Longitud: ${modelo.longitud}m`,
        resultado: "✓ Estructura válida para análisis isostático"
    });

    if (!validarVigaIsostatica(modelo.soportes.length, 3)) {
        return {
            reacciones: [],
            funcionesCorte: [],
            funcionesMomento: [],
            puntosCriticosCorte: [],
            puntosCriticosMomento: [],
            pasosCalculos: pasos,
            esValida: false,
            errores: ["La estructura no es isostática"]
        };
    }

    // Paso 2: Convertir cargas distribuidas a equivalentes
    const cargasEquivalentes: CargaPuntual[] = [...modelo.cargasPuntuales];

    if (modelo.cargasDistribuidas && modelo.cargasDistribuidas.length > 0) {
        pasos.push({
            numero: numerosPaso++,
            titulo: "Conversión de cargas distribuidas",
            descripcion: "Convertir cargas distribuidas a cargas puntuales equivalentes"
        });

        modelo.cargasDistribuidas.forEach(cargaDist => {
            const equivalente = cargaDistribuidaAEquivalente(cargaDist);
            cargasEquivalentes.push(equivalente);

            pasos.push({
                numero: numerosPaso++,
                titulo: `Carga distribuida ${cargaDist.id}`,
                descripcion: "Cálculo de resultante y centroide",
                ecuacion: "P = w × L",
                calculo: `P = ${cargaDist.magnitudInicio} × ${cargaDist.fin - cargaDist.inicio} = ${equivalente.magnitud} kN`,
                resultado: `Resultante en x = ${redondear(equivalente.posicion)} m`
            });
        });
    }

    // Paso 3: Calcular reacciones
    const reacciones = calcularReacciones(modelo, cargasEquivalentes, pasos, numerosPaso);

    // Paso 4: Calcular funciones de corte V(x)
    const funcionesCorte = calcularFuncionesCorte(modelo, cargasEquivalentes, reacciones, pasos);

    // Paso 5: Calcular funciones de momento M(x)
    const funcionesMomento = calcularFuncionesMomento(modelo, cargasEquivalentes, reacciones, funcionesCorte, pasos);

    // Paso 6: Encontrar puntos críticos
    const puntosCriticosCorte = encontrarPuntosCriticos(funcionesCorte, 'corte');
    const puntosCriticosMomento = encontrarPuntosCriticos(funcionesMomento, 'momento');

    return {
        reacciones,
        funcionesCorte,
        funcionesMomento,
        puntosCriticosCorte,
        puntosCriticosMomento,
        pasosCalculos: pasos,
        esValida: true
    };
}

/**
 * Calcula las reacciones en los apoyos usando equilibrio estático
 */
function calcularReacciones(
    modelo: BeamModel,
    cargas: CargaPuntual[],
    pasos: PasoCalculoResolucion[],
    numeroPaso: number
): Reaccion[] {
    const reacciones: Reaccion[] = [];

    // Asumir dos apoyos: uno simple y uno de rodillo
    const soporteIzq = modelo.soportes[0];
    const soporteDer = modelo.soportes[1];

    pasos.push({
        numero: numeroPaso++,
        titulo: "Cálculo de reacciones",
        descripcion: "Aplicar ecuaciones de equilibrio estático",
        ecuacion: "∑Fy = 0, ∑MA = 0"
    });

    // Calcular suma de fuerzas aplicadas
    const sumaFuerzas = cargas.reduce((suma, carga) => {
        return suma + (carga.direccion === 'down' ? carga.magnitud : -carga.magnitud);
    }, 0);

    // Calcular momento respecto al apoyo izquierdo
    const momentoRespecttoA = cargas.reduce((suma, carga) => {
        const distancia = carga.posicion - soporteIzq.posicion;
        return suma + calcularMomento(carga.magnitud, distancia, carga.direccion);
    }, 0);

    // Ecuación de momento: ∑MA = 0
    // RB × L - momentos de cargas = 0
    const longitudEntreSoportes = soporteDer.posicion - soporteIzq.posicion;
    const reaccionB = -momentoRespecttoA / longitudEntreSoportes;

    // pasos.push({
    //     numero: numeroPaso++,
    //     titulo: "Equilibrio de momentos respecto al apoyo A",
    //     ecuacion: "∑MA = 0",
    //     calculo: `RB × ${longitudEntreSoportes} + ${redondear(momentoRespecttoA)} = 0`,
    //     resultado: `RB = ${redondear(reaccionB)} kN`
    // });

    // Ecuación de fuerzas: ∑Fy = 0
    // RA + RB - suma de cargas = 0
    const reaccionA = sumaFuerzas - reaccionB;

    // pasos.push({
    //     numero: numeroPaso++,
    //     titulo: "Equilibrio de fuerzas verticales",
    //     ecuacion: "∑Fy = 0",
    //     calculo: `RA + ${redondear(reaccionB)} - ${redondear(sumaFuerzas)} = 0`,
    //     resultado: `RA = ${redondear(reaccionA)} kN`
    // });

    // Crear objetos de reacción
    reacciones.push({
        soporteId: soporteIzq.id,
        posicion: soporteIzq.posicion,
        magnitud: Math.abs(reaccionA),
        tipo: 'vertical',
        direccion: reaccionA >= 0 ? 'up' : 'down'
    });

    reacciones.push({
        soporteId: soporteDer.id,
        posicion: soporteDer.posicion,
        magnitud: Math.abs(reaccionB),
        tipo: 'vertical',
        direccion: reaccionB >= 0 ? 'up' : 'down'
    });

    return reacciones;
}

/**
 * Calcula las funciones de fuerza cortante V(x)
 */
function calcularFuncionesCorte(
    modelo: BeamModel,
    cargas: CargaPuntual[],
    reacciones: Reaccion[],
    pasos: PasoCalculoResolucion[]
): FuncionDiagrama[] {
    const funciones: FuncionDiagrama[] = [];

    // Obtener todas las posiciones donde cambia el cortante
    const posicionesCriticas = [0];
    cargas.forEach(carga => posicionesCriticas.push(carga.posicion));
    reacciones.forEach(reaccion => posicionesCriticas.push(reaccion.posicion));
    posicionesCriticas.push(modelo.longitud);
    posicionesCriticas.sort((a, b) => a - b);

    pasos.push({
        numero: pasos.length + 1,
        titulo: "Diagrama de fuerza cortante V(x)",
        descripcion: "Calcular cortante en cada tramo de la viga"
    });

    // Calcular cortante en cada tramo
    for (let i = 0; i < posicionesCriticas.length - 1; i++) {
        const inicio = posicionesCriticas[i];
        const fin = posicionesCriticas[i + 1];

        // Calcular cortante acumulado hasta el inicio del tramo
        let cortante = 0;

        // Sumar reacciones hacia arriba antes de este punto
        reacciones.forEach(reaccion => {
            if (reaccion.posicion <= inicio) {
                cortante += reaccion.direccion === 'up' ? reaccion.magnitud : -reaccion.magnitud;
            }
        });

        // Restar cargas hacia abajo antes de este punto
        cargas.forEach(carga => {
            if (carga.posicion <= inicio) {
                cortante += carga.direccion === 'down' ? -carga.magnitud : carga.magnitud;
            }
        });

        const puntos = generarPuntosLineales(inicio, fin, cortante, cortante, 5);

        funciones.push({
            inicio,
            fin,
            ecuacion: `V = ${redondear(cortante)} kN`,
            puntos
        });
    }

    return funciones;
}

/**
 * Calcula las funciones de momento M(x)
 */
function calcularFuncionesMomento(
    modelo: BeamModel,
    cargas: CargaPuntual[],
    reacciones: Reaccion[],
    funcionesCorte: FuncionDiagrama[],
    pasos: PasoCalculoResolucion[]
): FuncionDiagrama[] {
    const funciones: FuncionDiagrama[] = [];

    pasos.push({
        numero: pasos.length + 1,
        titulo: "Diagrama de momento flector M(x)",
        descripcion: "Integrar fuerza cortante para obtener momento"
    });

    let momentoAnterior = 0;

    funcionesCorte.forEach(funcionCorte => {
        const cortante = funcionCorte.puntos[0].valor;
        const longitud = funcionCorte.fin - funcionCorte.inicio;

        // Para cortante constante: M(x) = M0 + V*x
        const momentoInicio = momentoAnterior;
        const momentoFin = momentoInicio + cortante * longitud;

        const puntos = generarPuntosLineales(
            funcionCorte.inicio,
            funcionCorte.fin,
            momentoInicio,
            momentoFin,
            20
        );

        funciones.push({
            inicio: funcionCorte.inicio,
            fin: funcionCorte.fin,
            ecuacion: `M = ${redondear(momentoInicio)} + ${redondear(cortante)} × (x - ${funcionCorte.inicio})`,
            puntos
        });

        momentoAnterior = momentoFin;
    });

    return funciones;
}

/**
 * Encuentra puntos críticos en las funciones
 */
function encontrarPuntosCriticos(
    funciones: FuncionDiagrama[],
    tipo: 'corte' | 'momento'
): PuntoCritico[] {
    const puntosCriticos: PuntoCritico[] = [];

    funciones.forEach(funcion => {
        const valorInicio = funcion.puntos[0].valor;
        const valorFin = funcion.puntos[funcion.puntos.length - 1].valor;

        // Buscar ceros
        const ceros = encontrarCerosLineales(funcion.inicio, funcion.fin, valorInicio, valorFin);
        ceros.forEach((cero) => {
            puntosCriticos.push({
                posicion: cero,
                valor: 0,
                tipo: 'cero',
                descripcion: `${tipo} = 0 en x = ${redondear(cero)} m`
            });
        });

        // Agregar puntos de discontinuidad
        if (Math.abs(valorInicio) > 0.001) {
            puntosCriticos.push({
                posicion: funcion.inicio,
                valor: valorInicio,
                tipo: 'discontinuidad',
                descripcion: `${tipo} = ${redondear(valorInicio)} en x = ${redondear(funcion.inicio)} m`
            });
        }
    });

    return puntosCriticos;
}
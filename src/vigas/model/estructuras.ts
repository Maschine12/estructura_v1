// Funciones auxiliares para cálculos estructurales

import { CargaDistribuida, CargaPuntual } from './beamModel';

/**
 * Convierte una carga distribuida uniforme a carga puntual equivalente
 */
export function cargaDistribuidaAEquivalente(carga: CargaDistribuida): CargaPuntual {
    const longitud = carga.fin - carga.inicio;
    const magnitudPromedio = (carga.magnitudInicio + carga.magnitudFin) / 2;
    const fuerzaTotal = magnitudPromedio * longitud;

    // Para carga uniforme, el centroide está a la mitad
    // Para carga triangular, el centroide está a 1/3 o 2/3
    let centroide: number;

    if (carga.magnitudInicio === carga.magnitudFin) {
        // Carga uniforme
        centroide = carga.inicio + longitud / 2;
    } else {
        // Carga triangular - usar centroide de triángulo
        if (carga.magnitudInicio === 0) {
            centroide = carga.inicio + (2 * longitud) / 3;
        } else if (carga.magnitudFin === 0) {
            centroide = carga.inicio + longitud / 3;
        } else {
            // Carga trapezoidal
            const a = carga.magnitudInicio;
            const b = carga.magnitudFin;
            centroide = carga.inicio + (longitud * (2 * b + a)) / (3 * (a + b));
        }
    }

    return {
        id: `equiv_${carga.id}`,
        posicion: centroide,
        magnitud: Math.abs(fuerzaTotal),
        direccion: carga.direccion
    };
}

/**
 * Calcula el momento de una fuerza respecto a un punto
 */
export function calcularMomento(
    fuerza: number,
    distancia: number,
    direccionFuerza: 'up' | 'down' = 'down'
): number {
    // Convención: momento positivo antihorario
    const signoFuerza = direccionFuerza === 'down' ? -1 : 1;
    return signoFuerza * fuerza * distancia;
}

/**
 * Genera puntos para una función lineal entre dos posiciones
 */
export function generarPuntosLineales(
    inicio: number,
    fin: number,
    valorInicio: number,
    valorFin: number,
    numPuntos: number = 20
) {
    const puntos = [];
    const paso = (fin - inicio) / (numPuntos - 1);
    const pendiente = (valorFin - valorInicio) / (fin - inicio);

    for (let i = 0; i < numPuntos; i++) {
        const x = inicio + i * paso;
        const valor = valorInicio + pendiente * (x - inicio);
        puntos.push({ x, valor });
    }

    return puntos;
}

/**
 * Encuentra los ceros de una función lineal
 */
export function encontrarCerosLineales(
    inicio: number,
    fin: number,
    valorInicio: number,
    valorFin: number
): number[] {
    const ceros: number[] = [];

    // Si hay cambio de signo, hay un cero
    if (valorInicio * valorFin <= 0 && valorInicio !== valorFin) {
        const pendiente = (valorFin - valorInicio) / (fin - inicio);
        if (pendiente !== 0) {
            const cero = inicio - valorInicio / pendiente;
            if (cero >= inicio && cero <= fin) {
                ceros.push(cero);
            }
        }
    }

    return ceros;
}

/**
 * Valida si una viga es isostática
 */
export function validarVigaIsostatica(numSoportes: number, numReacciones: number): boolean {
    // Para viga 2D: 3 ecuaciones de equilibrio = 3 reacciones máximo
    return numReacciones <= 3 && numSoportes >= 2;
}

/**
 * Redondea a un número específico de decimales
 */
export function redondear(valor: number, decimales: number = 3): number {
    return Math.round(valor * Math.pow(10, decimales)) / Math.pow(10, decimales);
}
// Tipos estructurales para el cálculo de vigas

export interface Punto {
    x: number;
    valor: number;
}

export interface CargaPuntual {
    id: string;
    posicion: number; // distancia desde el apoyo izquierdo (m)
    magnitud: number; // fuerza (kN)
    direccion: 'up' | 'down';
}

export interface CargaDistribuida {
    id: string;
    inicio: number; // posición inicial (m)
    fin: number; // posición final (m)
    magnitudInicio: number; // carga al inicio (kN/m)
    magnitudFin: number; // carga al final (kN/m)
    direccion: 'up' | 'down';
}

export type SoporteTipo = 'simple' | 'roller';

export interface Soporte {
    id: string;
    posicion: number; // distancia (m)
    tipo: SoporteTipo;
}

export interface BeamModel {
    id: string;
    longitud: number; // longitud total de la viga (m)
    soportes: Soporte[];
    cargasPuntuales: CargaPuntual[];
    cargasDistribuidas?: CargaDistribuida[];
}

export interface Reaccion {
    soporteId: string;
    posicion: number;
    magnitud: number;
    tipo: 'vertical' | 'momento';
    direccion: 'up' | 'down';
}

export interface FuncionDiagrama {
    inicio: number;
    fin: number;
    ecuacion: string; // ecuación como string para mostrar
    puntos: Punto[];
}

export interface PuntoCritico {
    posicion: number;
    valor: number;
    tipo: 'maximo' | 'minimo' | 'cero' | 'discontinuidad';
    descripcion: string;
}

export interface PasoCalculoResolucion {
    numero: number;
    titulo: string;
    descripcion: string;
    ecuacion?: string;
    calculo?: string;
    resultado?: string;
}

export interface ResultadoViga {
    reacciones: Reaccion[];
    funcionesCorte: FuncionDiagrama[];
    funcionesMomento: FuncionDiagrama[];
    puntosCriticosCorte: PuntoCritico[];
    puntosCriticosMomento: PuntoCritico[];
    pasosCalculos: PasoCalculoResolucion[];
    esValida: boolean;
    errores?: string[];
}
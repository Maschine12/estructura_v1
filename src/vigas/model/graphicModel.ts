// Interfaz principal del modelo gráfico estructural

export interface Point {
    x: number;
    y: number;
}

export interface GraphicMember {
    id: string;
    startPoint: Point;
    endPoint: Point;
    type: 'beam' | 'column' | 'bar';
    thickness?: number;
}

export interface GraphicSupport {
    id: string;
    position: Point;
    type: 'simple' | 'fixed' | 'roller';
    angle?: number; // rotación en grados
}

export interface GraphicLoad {
    id: string;
    position: Point;
    type: 'point' | 'distributed' | 'moment';
    magnitude: number;
    direction: 'up' | 'down' | 'left' | 'right';
    length?: number; // para cargas distribuidas
    unit?: string;
}

export interface GraphicReaction {
    id: string;
    position: Point;
    type: 'vertical' | 'horizontal' | 'moment';
    magnitude: number;
    direction: 'up' | 'down' | 'left' | 'right';
    unit?: string;
}

export interface GraphicDiagram {
    id: string;
    type: 'shear' | 'moment' | 'axial';
    points: Point[];
    color: string;
    yOffset?: number; // desplazamiento vertical del diagrama
}

export interface GraphicStructureModel {
    scale: number; // metros por pixel (ej: 1m = 100px)
    members: GraphicMember[];
    supports: GraphicSupport[];
    loads: GraphicLoad[];
    reactions: GraphicReaction[];
    diagrams?: GraphicDiagram[];
    labels?: {
        id: string;
        position: Point;
        text: string;
        fontSize?: number;
    }[];
}
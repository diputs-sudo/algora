export type GraphStepType = "start" | "visit" | "inspect-cell" | "skip-cell" | "push" | "backtrack" | "found" | "done";

export interface GridPoint {
    row: number;
    col: number;
}

export interface GraphData {
    width: number;
    height: number;
    start: GridPoint;
    target: GridPoint;
    walls: GridPoint[];
    weights?: Record<string, 0 | 1>;
    costs?: Record<string, number>;
    heuristic?: "manhattan" | "euclidean" | "chebyshev" | "octile";
}

export interface GraphWorkspaceRow {
    label: string;
    values: Array<string | number | null>;
    activeIndices?: number[];
}

export interface GraphWorkspaceState {
    title?: string;
    detail?: string;
    rows: GraphWorkspaceRow[];
}

export interface GraphStep {
    type: GraphStepType;
    graph: GraphData;
    current?: GridPoint;
    previous?: GridPoint;
    inspected?: GridPoint;
    visited: string[];
    secondaryVisited?: string[];
    stack: string[];
    secondaryStack?: string[];
    order: string[];
    path?: string[];
    meeting?: string[];
    edgeWeight?: number;
    distances?: Record<string, number>;
    counterLabel?: string;
    message: string;
    workspace?: GraphWorkspaceState;
}

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
    stack: string[];
    order: string[];
    path?: string[];
    message: string;
    workspace?: GraphWorkspaceState;
}

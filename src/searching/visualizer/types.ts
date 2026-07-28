export type SearchStepType = "inspect" | "narrow" | "found" | "miss" | "done";

export interface SearchWorkspaceRow {
    label: string;
    values: Array<number | string | null>;
    activeIndices?: number[];
}

export interface SearchWorkspaceState {
    title?: string;
    detail?: string;
    rows: SearchWorkspaceRow[];
}

export interface SearchPointer {
    label: string;
    index: number;
}

export interface SearchStep {
    type: SearchStepType;
    array: number[];
    target: number;
    low?: number;
    mid?: number;
    high?: number;
    highlightIndices?: number[];
    pointers?: SearchPointer[];
    resultIndex?: number;
    probes?: number;
    message?: string;
    workspace?: SearchWorkspaceState;
}

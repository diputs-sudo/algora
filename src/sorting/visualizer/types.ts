export type StepType = "compare" | "swap" | "done";

export interface WorkspaceRow {
    label: string;
    values: Array<number | null>;
    activeIndices?: number[];
}

export interface WorkspaceState {
    title?: string;
    detail?: string;
    rows: WorkspaceRow[];
}

export interface Step {
    type: StepType;
    indices?: number[];
    array: number[];
    memoryUsed?: number;
    memoryLabel?: string;
    memoryUnit?: string;
    workspace?: WorkspaceState;
}

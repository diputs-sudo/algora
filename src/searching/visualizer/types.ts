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

export interface InterpolationInsight {
    low: number;
    probe: number;
    high: number;
    lowValue: number;
    probeValue: number;
    highValue: number;
    target: number;
    valueDistance: number;
    valueSpan: number;
    ratio: number;
    indexSpan: number;
    note?: string;
}

export interface MetaBinaryBitState {
    bit: number;
    status: "kept" | "skipped" | "active" | "pending";
}

export interface MetaBinaryInsight {
    baseIndex: number;
    activeBit: number;
    testIndex: number;
    candidateIndex: number;
    testValue?: number | string;
    decision: "pending" | "keep" | "skip" | "outside" | "found" | "miss";
    comparison?: string;
    decisionText: string;
    bits: MetaBinaryBitState[];
    note: string;
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
    interpolation?: InterpolationInsight;
    metaBinary?: MetaBinaryInsight;
}

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

export interface UniformBinaryStepState {
    step: number;
    status: "used" | "active" | "upcoming";
}

export interface UniformBinaryInsight {
    low: number;
    mid: number;
    high: number;
    currentStepIndex: number;
    currentStep: number;
    nextStep?: number;
    direction: "start" | "left" | "right" | "found" | "miss";
    comparison?: string;
    decisionText: string;
    steps: UniformBinaryStepState[];
    note: string;
}

export interface FibonacciSearchInsight {
    offset: number;
    probe: number;
    fibM: number;
    fibM1: number;
    fibM2: number;
    windowStart: number;
    windowEnd: number;
    direction: "start" | "left" | "right" | "found" | "miss";
    comparison?: string;
    decisionText: string;
    note: string;
}

export interface RangeSearchInsight {
    title: string;
    phase: "expand" | "binary" | "found" | "miss";
    lower: number;
    probe: number;
    upper: number;
    jump?: number;
    nextJump?: number;
    comparison?: string;
    decisionText: string;
    note: string;
}

export interface JumpSearchInsight {
    phase: "jump" | "scan" | "found" | "miss";
    blockStart: number;
    blockEnd: number;
    current: number;
    jumpSize: number;
    nextStart?: number;
    comparison?: string;
    decisionText: string;
    note: string;
}

export interface SentinelLinearInsight {
    phase: "place" | "scan" | "verify" | "found" | "miss";
    current: number;
    sentinelIndex: number;
    savedLast: number;
    workingValue?: number;
    comparison?: string;
    decisionText: string;
    note: string;
}

export interface BitonicSearchInsight {
    phase: "peak" | "left" | "right" | "found" | "miss";
    left: number;
    mid: number;
    right: number;
    peak?: number;
    side?: "increasing" | "decreasing";
    comparison?: string;
    decisionText: string;
    note: string;
}

export interface FractionalCascadingInsight {
    phase: "first-search" | "cascade" | "found" | "miss";
    catalogIndex: number;
    catalogCount: number;
    anchorIndex: number;
    probeIndex: number;
    resultIndex?: number;
    comparison?: string;
    decisionText: string;
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
    uniformBinary?: UniformBinaryInsight;
    fibonacci?: FibonacciSearchInsight;
    rangeSearch?: RangeSearchInsight;
    jumpSearch?: JumpSearchInsight;
    sentinelLinear?: SentinelLinearInsight;
    bitonic?: BitonicSearchInsight;
    fractionalCascading?: FractionalCascadingInsight;
}

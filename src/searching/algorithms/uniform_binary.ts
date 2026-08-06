import { SearchStep, SearchWorkspaceState, UniformBinaryInsight } from "../visualizer/types.js";

function createStepTable(length: number): number[] {
    const steps: number[] = [];
    let step = Math.ceil(length / 2);

    while (step >= 1) {
        steps.push(step);
        step = Math.floor(step / 2);
    }

    return steps;
}

function createWorkspace(
    array: number[],
    target: number,
    low: number,
    mid: number,
    high: number,
    steps: number[],
    stepIndex: number,
    detail: string
): SearchWorkspaceState {
    return {
        title: "Uniform Binary Search Workspace",
        detail,
        rows: [
            {
                label: "Active Range",
                values: low <= high ? array.slice(low, high + 1) : [],
                activeIndices: mid >= low && mid <= high ? [mid - low] : []
            },
            {
                label: "Step Table",
                values: steps,
                activeIndices: stepIndex < steps.length ? [stepIndex] : []
            },
            {
                label: "Pointers",
                values: [`low ${low}`, `mid ${mid}`, `high ${high}`],
                activeIndices: [1]
            }
        ]
    };
}

function createUniformInsight(
    steps: number[],
    stepIndex: number,
    low: number,
    mid: number,
    high: number,
    direction: UniformBinaryInsight["direction"],
    note: string,
    comparison?: string,
    decisionText?: string
): UniformBinaryInsight {
    const currentStepIndex = Math.min(stepIndex, Math.max(steps.length - 1, 0));

    return {
        low,
        mid,
        high,
        currentStepIndex,
        currentStep: steps[currentStepIndex] ?? 0,
        nextStep: steps[stepIndex + 1],
        direction,
        comparison,
        decisionText: decisionText ?? "Use the active table entry to choose the current probe.",
        steps: steps.map((step, index) => ({
            step,
            status: index < stepIndex ? "used" : index === stepIndex ? "active" : "upcoming"
        })),
        note
    };
}

export function createUniformBinarySearchInitialStep(array: number[], target: number): SearchStep {
    const steps = createStepTable(array.length);
    const high = array.length - 1;
    const mid = array.length > 0 ? Math.floor(high / 2) : undefined;

    return {
        type: "narrow",
        array,
        target,
        low: array.length > 0 ? 0 : undefined,
        mid,
        high: array.length > 0 ? high : undefined,
        pointers: array.length > 0 && mid !== undefined ? [
            { label: "low", index: 0 },
            { label: "mid", index: mid },
            { label: "high", index: high }
        ] : [],
        message: "Build a fixed step table, then search the sorted range using decreasing offsets.",
        uniformBinary: array.length > 0 && mid !== undefined
            ? createUniformInsight(
                steps,
                0,
                0,
                mid,
                high,
                "start",
                "Uniform Binary Search follows the table from left to right; each entry represents the next smaller movement scale.",
                undefined,
                "Start with the first table entry near the center of the full range."
            )
            : undefined,
        workspace: array.length > 0 && mid !== undefined
            ? createWorkspace(array, target, 0, mid, high, steps, 0, "The first step starts near the center of the full range.")
            : {
                title: "Uniform Binary Search Workspace",
                detail: "There are no values to inspect.",
                rows: [{ label: "Target", values: [target] }]
            }
    };
}

export function* uniformBinarySearch(array: number[], target: number): Generator<SearchStep> {
    const steps = createStepTable(array.length);
    let low = 0;
    let high = array.length - 1;
    let stepIndex = 0;
    let probes = 0;

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const value = array[mid];
        probes += 1;

        yield {
            type: "inspect",
            array,
            target,
            low,
            mid,
            high,
            pointers: [
                { label: "low", index: low },
                { label: "mid", index: mid },
                { label: "high", index: high }
            ],
            probes,
            message: `Use table step ${steps[Math.min(stepIndex, steps.length - 1)]} to inspect index ${mid}: compare ${value} with ${target}.`,
            uniformBinary: createUniformInsight(
                steps,
                stepIndex,
                low,
                mid,
                high,
                "start",
                "The active table entry marks this round's movement scale before the next smaller step takes over.",
                `${value} ? ${target}`,
                `Compare the probe value at index ${mid} with the target.`
            ),
            workspace: createWorkspace(
                array,
                target,
                low,
                mid,
                high,
                steps,
                stepIndex,
                "Uniform Binary Search uses a precomputed sequence of decreasing step sizes."
            )
        };

        if (value === target) {
            yield {
                type: "found",
                array,
                target,
                low,
                mid,
                high,
                pointers: [{ label: "found", index: mid }],
                probes,
                resultIndex: mid,
                message: `Target ${target} found at index ${mid}.`,
                uniformBinary: createUniformInsight(
                    steps,
                    stepIndex,
                    low,
                    mid,
                    high,
                    "found",
                    `The active probe matches ${target}, so the table search stops here.`,
                    `${value} = ${target}`,
                    `Return index ${mid}.`
                ),
                workspace: createWorkspace(array, target, low, mid, high, steps, stepIndex, `Found ${target} at index ${mid}.`)
            };
            return;
        }

        stepIndex += 1;

        if (value < target) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }

        if (low <= high) {
            const nextMid = Math.floor((low + high) / 2);

            yield {
                type: "narrow",
                array,
                target,
                low,
                mid: nextMid,
                high,
                pointers: [
                    { label: "low", index: low },
                    { label: "mid", index: nextMid },
                    { label: "high", index: high }
                ],
                probes,
                message: value < target
                    ? `${value} is smaller than ${target}, so move right using the next smaller step.`
                    : `${value} is larger than ${target}, so move left using the next smaller step.`,
                uniformBinary: createUniformInsight(
                    steps,
                    stepIndex,
                    low,
                    nextMid,
                    high,
                    value < target ? "right" : "left",
                    "Advance to the next table entry and recenter inside the remaining half.",
                    value < target ? `${value} < ${target}` : `${value} > ${target}`,
                    value < target
                        ? `Discard everything through index ${mid}; the next probe moves right.`
                        : `Discard everything from index ${mid}; the next probe moves left.`
                ),
                workspace: createWorkspace(
                    array,
                    target,
                    low,
                    nextMid,
                    high,
                    steps,
                    stepIndex,
                    "Advance to the next entry in the step table for the smaller range."
                )
            };
        }
    }

    yield {
        type: "miss",
        array,
        target,
        low,
        high,
        probes,
        resultIndex: -1,
        message: `Target ${target} is not in the array.`,
        uniformBinary: createUniformInsight(
            steps,
            stepIndex,
            low,
            low,
            high,
            "miss",
            "The table is exhausted for the remaining bounds, and the active range is empty.",
            "empty range",
            `${target} is not present in the sorted array.`
        ),
        workspace: {
            title: "Uniform Binary Search Workspace",
            detail: "The active range is empty.",
            rows: [
                { label: "Step Table", values: steps },
                { label: "Final Bounds", values: [`low ${low}`, `high ${high}`] },
                { label: "Target", values: [target] }
            ]
        }
    };
}

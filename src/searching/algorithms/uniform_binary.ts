import { SearchStep, SearchWorkspaceState, UniformBinaryInsight } from "../visualizer/types.js";

function createStepTable(length: number): number[] {
    if (length === 0) return [];

    let largest = 1;
    while (largest <= Math.floor(length / 2)) largest *= 2;

    const steps: number[] = [];
    for (let step = largest; step >= 1; step = Math.floor(step / 2)) {
        steps.push(step);
        if (step === 1) break;
    }
    return steps;
}

function createWorkspace(
    array: number[],
    target: number,
    base: number,
    testIndex: number,
    steps: number[],
    stepIndex: number,
    detail: string
): SearchWorkspaceState {
    return {
        title: "Uniform Binary Search Workspace",
        detail,
        rows: [
            {
                label: "Candidate",
                values: [`base ${base}`, `test ${testIndex}`],
                activeIndices: [1]
            },
            {
                label: "Step Table",
                values: steps,
                activeIndices: stepIndex < steps.length ? [stepIndex] : []
            },
            {
                label: "Target",
                values: [target]
            }
        ]
    };
}

function createInsight(
    steps: number[],
    stepIndex: number,
    base: number,
    probeIndex: number,
    direction: UniformBinaryInsight["direction"],
    note: string,
    comparison?: string,
    decisionText?: string
): UniformBinaryInsight {
    const currentStepIndex = Math.min(stepIndex, Math.max(steps.length - 1, 0));
    return {
        low: Math.max(base + 1, 0),
        mid: probeIndex,
        high: steps.length > 0 ? Math.max(base + steps[currentStepIndex], probeIndex) : probeIndex,
        currentStepIndex,
        currentStep: steps[currentStepIndex] ?? 0,
        nextStep: steps[stepIndex + 1],
        direction,
        comparison,
        decisionText: decisionText ?? "Use the active offset to choose the next probe.",
        steps: steps.map((step, index) => ({
            step,
            status: index < stepIndex ? "used" : index === stepIndex ? "active" : "upcoming"
        })),
        note
    };
}

export function createUniformBinarySearchInitialStep(array: number[], target: number): SearchStep {
    const steps = createStepTable(array.length);
    const firstProbe = steps.length > 0 ? steps[0] - 1 : undefined;

    return {
        type: "narrow",
        array,
        target,
        low: array.length > 0 ? 0 : undefined,
        mid: firstProbe,
        high: array.length > 0 ? array.length - 1 : undefined,
        pointers: firstProbe === undefined ? [] : [{ label: "probe", index: firstProbe }],
        message: "Build fixed offsets, then probe base plus each offset from largest to smallest.",
        uniformBinary: firstProbe === undefined
            ? undefined
            : createInsight(
                steps,
                0,
                -1,
                firstProbe,
                "start",
                "The first offset probes the largest power-of-two position.",
                `${array[firstProbe]} ? ${target}`,
                "Compare the first fixed-step probe with the target."
            ),
        workspace: firstProbe === undefined
            ? {
                title: "Uniform Binary Search Workspace",
                detail: "There are no values to inspect.",
                rows: [{ label: "Target", values: [target] }]
            }
            : createWorkspace(array, target, -1, firstProbe, steps, 0, "The first fixed offset starts the search.")
    };
}

export function* uniformBinarySearch(array: number[], target: number): Generator<SearchStep> {
    const steps = createStepTable(array.length);
    let base = -1;
    let probes = 0;

    if (steps.length === 0) {
        yield {
            type: "miss",
            array,
            target,
            probes,
            resultIndex: -1,
            message: "The array is empty, so the target cannot be found.",
            workspace: {
                title: "Uniform Binary Search Workspace",
                detail: "There are no offsets to apply.",
                rows: [{ label: "Target", values: [target] }]
            }
        };
        return;
    }

    for (let stepIndex = 0; stepIndex < steps.length; stepIndex++) {
        const step = steps[stepIndex];
        const testIndex = base + step;
        const inside = testIndex < array.length;

        if (!inside) {
            yield {
                type: "inspect",
                array,
                target,
                low: Math.max(base + 1, 0),
                high: array.length - 1,
                pointers: [{ label: "base", index: Math.max(base, 0) }],
                probes,
                message: `Offset ${step} would leave the array, so skip it.`,
                uniformBinary: createInsight(
                    steps,
                    stepIndex,
                    base,
                    testIndex,
                    "left",
                    "The current offset is too large for the remaining suffix.",
                    `${testIndex} outside array`,
                    `Skip offset ${step}.`
                ),
                workspace: createWorkspace(array, target, base, testIndex, steps, stepIndex, "The offset is outside the array.")
            };
            continue;
        }

        probes += 1;
        const value = array[testIndex];
        yield {
            type: "inspect",
            array,
            target,
            low: Math.max(base + 1, 0),
            mid: testIndex,
            high: array.length - 1,
            pointers: [{ label: "base", index: Math.max(base, 0) }, { label: "probe", index: testIndex }],
            probes,
            message: `Probe index ${testIndex} with fixed offset ${step}: compare ${value} with ${target}.`,
            uniformBinary: createInsight(
                steps,
                stepIndex,
                base,
                testIndex,
                "start",
                "The current table entry supplies the probe offset.",
                `${value} ? ${target}`,
                "Compare the fixed-step probe with the target."
            ),
            workspace: createWorkspace(array, target, base, testIndex, steps, stepIndex, "Probe base plus the active fixed offset.")
        };

        if (value === target) {
            yield {
                type: "found",
                array,
                target,
                low: testIndex,
                mid: testIndex,
                high: testIndex,
                pointers: [{ label: "found", index: testIndex }],
                probes,
                resultIndex: testIndex,
                message: `Target ${target} found at index ${testIndex}.`,
                uniformBinary: createInsight(
                    steps,
                    stepIndex,
                    base,
                    testIndex,
                    "found",
                    "The fixed-step probe matches the target.",
                    `${value} = ${target}`,
                    `Return index ${testIndex}.`
                ),
                workspace: createWorkspace(array, target, base, testIndex, steps, stepIndex, "The target was found.")
            };
            return;
        }

        if (value < target) {
            base = testIndex;
        }

        if (stepIndex + 1 < steps.length) {
            const nextProbe = base + steps[stepIndex + 1];
            yield {
                type: "narrow",
                array,
                target,
                low: Math.max(base + 1, 0),
                mid: nextProbe < array.length ? nextProbe : undefined,
                high: array.length - 1,
                pointers: nextProbe < array.length ? [{ label: "base", index: Math.max(base, 0) }, { label: "next", index: nextProbe }] : [{ label: "base", index: Math.max(base, 0) }],
                probes,
                message: value < target
                    ? `${value} is smaller than ${target}; keep index ${testIndex} as the base and use the next offset.`
                    : `${value} is at least ${target}; keep the base and use the next offset.`,
                uniformBinary: createInsight(
                    steps,
                    stepIndex + 1,
                    base,
                    nextProbe,
                    value < target ? "right" : "left",
                    "Advance to the next smaller fixed offset.",
                    value < target ? `${value} < ${target}` : `${value} >= ${target}`,
                    "Apply the next offset from the current base."
                ),
                workspace: createWorkspace(array, target, base, nextProbe, steps, stepIndex + 1, "The next smaller offset refines the candidate.")
            };
        }
    }

    const candidate = base + 1;
    yield {
        type: "miss",
        array,
        target,
        low: candidate,
        high: array.length - 1,
        probes,
        resultIndex: -1,
        message: `Target ${target} is not in the array.`,
        uniformBinary: createInsight(
            steps,
            steps.length,
            base,
            candidate,
            "miss",
            "All fixed offsets are exhausted without a match.",
            candidate < array.length ? `${array[candidate]} != ${target}` : "insertion point at end",
            "The target is not present."
        ),
        workspace: {
            title: "Uniform Binary Search Workspace",
            detail: "The fixed-step search is complete.",
            rows: [
                { label: "Insertion Point", values: [candidate] },
                { label: "Target", values: [target] }
            ]
        }
    };
}


import { RangeSearchInsight, SearchStep, SearchWorkspaceState } from "../visualizer/types.js";

function clampIndex(index: number, length: number): number {
    return Math.max(0, Math.min(index, Math.max(length - 1, 0)));
}

function buildSequence(limit: number): number[] {
    const sequence: number[] = [1];
    let value = 2;

    while (value <= Math.max(limit, 1)) {
        sequence.push(value);
        value *= 2;
    }

    return sequence;
}

function createRangeBuilderInsight(
    array: number[],
    target: number,
    phase: RangeSearchInsight["phase"],
    previousBound: number,
    currentBound: number,
    discoveredLow: number | undefined,
    discoveredHigh: number | undefined,
    comparison: string,
    decisionText: string,
    note: string,
    nextJump?: number
): RangeSearchInsight {
    const cappedCurrent = clampIndex(currentBound, array.length);

    return {
        title: "Range Builder",
        kind: "exponential",
        phase,
        lower: discoveredLow ?? previousBound,
        probe: cappedCurrent,
        upper: discoveredHigh ?? cappedCurrent,
        jump: currentBound,
        nextJump,
        sequence: buildSequence(Math.max(currentBound, nextJump ?? currentBound, array.length - 1)),
        previousBound,
        currentBound,
        discoveredLow,
        discoveredHigh,
        transitionLabel: phase === "expand" ? "EXPANDING" : "EXPANDING -> BINARY SEARCH",
        probeValue: array.length === 0 ? "none" : array[cappedCurrent],
        comparison,
        decisionText,
        note
    };
}

function createExpansionWorkspace(
    array: number[],
    target: number,
    bound: number,
    detail: string
): SearchWorkspaceState {
    return {
        title: "Range Builder",
        detail,
        rows: [
            {
                label: "Expansion",
                values: array.map((value, index) => index <= Math.min(bound, array.length - 1) ? value : null),
                activeIndices: [Math.min(bound, array.length - 1)]
            },
            {
                label: "Bound",
                values: [`bound ${bound}`, `value ${array[Math.min(bound, array.length - 1)]}`],
                activeIndices: [0]
            },
            {
                label: "Target",
                values: [target]
            }
        ]
    };
}

function createBinaryWorkspace(
    array: number[],
    target: number,
    low: number,
    mid: number,
    high: number,
    detail: string
): SearchWorkspaceState {
    return {
        title: "Range Builder",
        detail,
        rows: [
            {
                label: "Discovered Range",
                values: low <= high ? array.slice(low, high + 1) : [],
                activeIndices: mid >= low && mid <= high ? [mid - low] : []
            },
            {
                label: "Pointers",
                values: [`low ${low}`, `mid ${mid}`, `high ${high}`],
                activeIndices: [1]
            },
            {
                label: "Target",
                values: [target]
            }
        ]
    };
}

export function createExponentialSearchInitialStep(array: number[], target: number): SearchStep {
    return {
        type: "narrow",
        array,
        target,
        low: array.length > 0 ? 0 : undefined,
        mid: array.length > 0 ? 0 : undefined,
        high: array.length > 0 ? 0 : undefined,
        pointers: array.length > 0 ? [{ label: "first", index: 0 }] : [],
        message: "Start by checking the first value, then expand the search bound by powers of two.",
        rangeSearch: array.length > 0
            ? createRangeBuilderInsight(
                array,
                target,
                "expand",
                0,
                1,
                undefined,
                undefined,
                `first value ${array[0]}`,
                "Check index 0 before doubling the bound.",
                "Exponential Search builds a range quickly, then switches to Binary Search.",
                2
            )
            : undefined,
        workspace: {
            title: "Range Builder",
            detail: "Exponential Search first finds a small sorted range that can contain the target.",
            rows: [
                { label: "Array", values: [...array], activeIndices: array.length > 0 ? [0] : [] },
                { label: "Target", values: [target] }
            ]
        }
    };
}

export function* exponentialSearch(array: number[], target: number): Generator<SearchStep> {
    const length = array.length;
    let probes = 0;

    if (length === 0) {
        yield {
            type: "miss",
            array,
            target,
            probes,
            resultIndex: -1,
            message: "The array is empty, so the target cannot be found.",
            rangeSearch: {
                title: "Range Builder",
                kind: "exponential",
                phase: "miss",
                lower: 0,
                probe: 0,
                upper: 0,
                sequence: [],
                previousBound: 0,
                currentBound: 0,
                transitionLabel: "EMPTY",
                probeValue: "none",
                comparison: "empty array",
                decisionText: "No range can be built.",
                note: "There are no values to inspect."
            },
            workspace: {
                title: "Range Builder",
                detail: "There are no values to inspect.",
                rows: [{ label: "Target", values: [target] }]
            }
        };
        return;
    }

    probes += 1;
    yield {
        type: "inspect",
        array,
        target,
        low: 0,
        mid: 0,
        high: 0,
        pointers: [{ label: "first", index: 0 }],
        probes,
        message: `Check index 0: compare ${array[0]} with target ${target}.`,
        rangeSearch: createRangeBuilderInsight(
            array,
            target,
            array[0] === target ? "found" : "expand",
            0,
            1,
            undefined,
            undefined,
            `${array[0]} ${array[0] === target ? "==" : "!="} ${target}`,
            array[0] === target ? "The first value is the target." : "The first value is not enough, so begin doubling bounds.",
            "The first index is a cheap early check before exponential growth.",
            2
        ),
        workspace: createExpansionWorkspace(
            array,
            target,
            0,
            "The first value is checked before range expansion begins."
        )
    };

    if (array[0] === target) {
        yield {
            type: "found",
            array,
            target,
            low: 0,
            mid: 0,
            high: 0,
            pointers: [{ label: "found", index: 0 }],
            probes,
            resultIndex: 0,
            message: `Target ${target} found at index 0.`,
            rangeSearch: createRangeBuilderInsight(array, target, "found", 0, 0, 0, 0, `${array[0]} == ${target}`, "Return index 0.", `Found ${target} at the first index.`),
            workspace: createExpansionWorkspace(array, target, 0, `Found ${target} at the first index.`)
        };
        return;
    }

    let previousBound = 0;
    let bound = 1;

    while (bound < length && array[bound] <= target) {
        probes += 1;

        yield {
            type: "inspect",
            array,
            target,
            low: previousBound,
            mid: bound,
            high: bound,
            pointers: [
                { label: "prev", index: previousBound },
                { label: "bound", index: bound }
            ],
            probes,
            message: `Bound index ${bound} has value ${array[bound]}, so double the bound.`,
            rangeSearch: createRangeBuilderInsight(
                array,
                target,
                "expand",
                previousBound,
                bound,
                undefined,
                undefined,
                `${array[bound]} <= ${target}`,
                `Accept bound ${bound}; double to ${bound * 2}.`,
                "The probe value is still not past the target, so the range must extend farther right.",
                bound * 2
            ),
            workspace: createExpansionWorkspace(
                array,
                target,
                bound,
                `${array[bound]} is less than or equal to ${target}, so the possible range is farther right.`
            )
        };

        previousBound = bound;
        bound *= 2;
    }

    const low = Math.floor(bound / 2);
    let left = low;
    let right = Math.min(bound, length - 1);
    const transitionProbe = clampIndex(bound, length);

    yield {
        type: "narrow",
        array,
        target,
        low: left,
        high: right,
        mid: Math.floor((left + right) / 2),
        pointers: [
            { label: "low", index: left },
            { label: "high", index: right }
        ],
        probes,
        message: `Search only the range from index ${left} to ${right}.`,
        rangeSearch: createRangeBuilderInsight(
            array,
            target,
            "binary",
            low,
            bound,
            left,
            right,
            bound >= length ? `bound ${bound} is outside array` : `${array[transitionProbe]} > ${target}`,
            `The discovered range is [${left}, ${right}], so switch to Binary Search.`,
            "This is the important phase transition: fast expansion becomes exact narrowing."
        ),
        workspace: createBinaryWorkspace(
            array,
            target,
            left,
            Math.floor((left + right) / 2),
            right,
            `The expansion phase found a candidate range from ${left} to ${right}.`
        )
    };

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const value = array[mid];
        probes += 1;

        yield {
            type: "inspect",
            array,
            target,
            low: left,
            mid,
            high: right,
            probes,
            message: `Binary phase: compare middle value ${value} at index ${mid} with target ${target}.`,
            rangeSearch: createRangeBuilderInsight(
                array,
                target,
                value === target ? "found" : "binary",
                low,
                bound,
                left,
                right,
                `${value} ? ${target}`,
                value === target ? `Return index ${mid}.` : "Use Binary Search rules inside the discovered range.",
                "The expensive unknown range problem is already solved; this is now ordinary Binary Search."
            ),
            workspace: createBinaryWorkspace(
                array,
                target,
                left,
                mid,
                right,
                `Run Binary Search inside the expanded range.`
            )
        };

        if (value === target) {
            yield {
                type: "found",
                array,
                target,
                low: left,
                mid,
                high: right,
                pointers: [{ label: "found", index: mid }],
                probes,
                resultIndex: mid,
                message: `Target ${target} found at index ${mid}.`,
                rangeSearch: createRangeBuilderInsight(array, target, "found", low, bound, left, right, `${value} == ${target}`, `Return index ${mid}.`, `Found ${target} at index ${mid}.`),
                workspace: createBinaryWorkspace(array, target, left, mid, right, `Found ${target} at index ${mid}.`)
            };
            return;
        }

        if (value < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }

        if (left <= right) {
            const nextMid = Math.floor((left + right) / 2);
            yield {
                type: "narrow",
                array,
                target,
                low: left,
                mid: nextMid,
                high: right,
                probes,
                message: value < target
                    ? `${value} is smaller than ${target}, so keep the right side.`
                    : `${value} is larger than ${target}, so keep the left side.`,
                rangeSearch: createRangeBuilderInsight(
                    array,
                    target,
                    "binary",
                    low,
                    bound,
                    left,
                    right,
                    value < target ? `${value} < ${target}` : `${value} > ${target}`,
                    value < target ? `Discard everything before index ${left}.` : `Discard everything after index ${right}.`,
                    "Binary Search keeps shrinking the range discovered by expansion."
                ),
                workspace: createBinaryWorkspace(
                    array,
                    target,
                    left,
                    nextMid,
                    right,
                    `Continue Binary Search inside the narrowed range.`
                )
            };
        }
    }

    yield {
        type: "miss",
        array,
        target,
        low: left,
        high: right,
        probes,
        resultIndex: -1,
        message: `Target ${target} is not in the expanded range.`,
        rangeSearch: createRangeBuilderInsight(array, target, "miss", low, bound, left, right, "range empty", `${target} is not present.`, "The discovered range was exhausted by Binary Search."),
        workspace: {
            title: "Range Builder",
            detail: `The binary range is empty, so ${target} is not present.`,
            rows: [
                { label: "Final Bounds", values: [`low ${left}`, `high ${right}`] },
                { label: "Target", values: [target] }
            ]
        }
    };
}

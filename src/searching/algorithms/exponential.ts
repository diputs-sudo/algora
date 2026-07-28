import { SearchStep, SearchWorkspaceState } from "../visualizer/types.js";

function createExpansionWorkspace(
    array: number[],
    target: number,
    bound: number,
    detail: string
): SearchWorkspaceState {
    return {
        title: "Exponential Search Workspace",
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
        title: "Binary Search Phase",
        detail,
        rows: [
            {
                label: "Active Range",
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
        workspace: {
            title: "Exponential Search Workspace",
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
            workspace: {
                title: "Exponential Search Workspace",
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
            workspace: createExpansionWorkspace(array, target, 0, `Found ${target} at the first index.`)
        };
        return;
    }

    let bound = 1;

    while (bound < length && array[bound] <= target) {
        probes += 1;

        yield {
            type: "inspect",
            array,
            target,
            low: Math.floor(bound / 2),
            mid: bound,
            high: bound,
            pointers: [
                { label: "range", index: Math.floor(bound / 2) },
                { label: "bound", index: bound }
            ],
            probes,
            message: `Bound index ${bound} has value ${array[bound]}, so double the bound.`,
            workspace: createExpansionWorkspace(
                array,
                target,
                bound,
                `${array[bound]} is less than or equal to ${target}, so the possible range is farther right.`
            )
        };

        bound *= 2;
    }

    const low = Math.floor(bound / 2);
    let left = low;
    let right = Math.min(bound, length - 1);

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
            yield {
                type: "narrow",
                array,
                target,
                low: left,
                mid: Math.floor((left + right) / 2),
                high: right,
                probes,
                message: value < target
                    ? `${value} is smaller than ${target}, so keep the right side.`
                    : `${value} is larger than ${target}, so keep the left side.`,
                workspace: createBinaryWorkspace(
                    array,
                    target,
                    left,
                    Math.floor((left + right) / 2),
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
        workspace: {
            title: "Binary Search Phase",
            detail: `The binary range is empty, so ${target} is not present.`,
            rows: [
                { label: "Final Bounds", values: [`low ${left}`, `high ${right}`] },
                { label: "Target", values: [target] }
            ]
        }
    };
}

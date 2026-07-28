import { SearchStep, SearchWorkspaceState } from "../visualizer/types.js";

function createPeakWorkspace(
    array: number[],
    target: number,
    left: number,
    mid: number,
    right: number,
    detail: string
): SearchWorkspaceState {
    return {
        title: "Peak Detection",
        detail,
        rows: [
            {
                label: "Active Range",
                values: left <= right ? array.slice(left, right + 1) : [],
                activeIndices: mid >= left && mid <= right ? [mid - left] : []
            },
            {
                label: "Slope Check",
                values: [`arr[${mid}] ${array[mid]}`, `arr[${mid + 1}] ${array[mid + 1]}`],
                activeIndices: [0, 1]
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
    peak: number,
    direction: "increasing" | "decreasing",
    detail: string
): SearchWorkspaceState {
    return {
        title: `${direction === "increasing" ? "Increasing" : "Decreasing"} Binary Search`,
        detail,
        rows: [
            {
                label: "Active Range",
                values: low <= high ? array.slice(low, high + 1) : [],
                activeIndices: mid >= low && mid <= high ? [mid - low] : []
            },
            {
                label: "Known Peak",
                values: [`index ${peak}`, array[peak]],
                activeIndices: [0, 1]
            },
            {
                label: "Target",
                values: [target]
            }
        ]
    };
}

export function createBitonicArraySearchInitialStep(array: number[], target: number): SearchStep {
    return {
        type: "narrow",
        array,
        target,
        low: array.length > 0 ? 0 : undefined,
        high: array.length > 0 ? array.length - 1 : undefined,
        pointers: array.length > 0
            ? [
                { label: "left", index: 0 },
                { label: "right", index: array.length - 1 }
            ]
            : [],
        message: "Start by finding the peak, where the array changes from increasing to decreasing.",
        workspace: {
            title: "Bitonic Array Search",
            detail: "A bitonic array rises to one peak and then falls. The peak splits the array into two searchable halves.",
            rows: [
                { label: "Array", values: [...array] },
                { label: "Target", values: [target] }
            ]
        }
    };
}

export function* bitonicArraySearch(array: number[], target: number): Generator<SearchStep> {
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
                title: "Bitonic Array Search",
                detail: "There are no values to inspect.",
                rows: [{ label: "Target", values: [target] }]
            }
        };
        return;
    }

    let left = 0;
    let right = length - 1;

    while (left < right) {
        const mid = Math.floor((left + right) / 2);
        probes += 1;

        yield {
            type: "inspect",
            array,
            target,
            low: left,
            mid,
            high: right,
            highlightIndices: [mid, mid + 1],
            pointers: [
                { label: "left", index: left },
                { label: "mid", index: mid },
                { label: "next", index: mid + 1 },
                { label: "right", index: right }
            ],
            probes,
            message: `Compare ${array[mid]} at index ${mid} with ${array[mid + 1]} at index ${mid + 1}.`,
            workspace: createPeakWorkspace(
                array,
                target,
                left,
                mid,
                right,
                "If the slope rises, the peak is to the right. If it falls, the peak is at mid or to the left."
            )
        };

        if (array[mid] < array[mid + 1]) {
            left = mid + 1;

            yield {
                type: "narrow",
                array,
                target,
                low: left,
                high: right,
                highlightIndices: [left],
                pointers: [
                    { label: "left", index: left },
                    { label: "right", index: right }
                ],
                probes,
                message: "The slope is rising, so move left past mid to search for the peak.",
                workspace: {
                    title: "Peak Detection",
                    detail: "The peak must be somewhere on the right side of the slope.",
                    rows: [
                        { label: "Peak Range", values: array.slice(left, right + 1), activeIndices: [0] },
                        { label: "Target", values: [target] }
                    ]
                }
            };
        } else {
            right = mid;

            yield {
                type: "narrow",
                array,
                target,
                low: left,
                high: right,
                highlightIndices: [right],
                pointers: [
                    { label: "left", index: left },
                    { label: "right", index: right }
                ],
                probes,
                message: "The slope is falling, so the peak is at mid or to the left.",
                workspace: {
                    title: "Peak Detection",
                    detail: "Keep mid in the range because it may already be the peak.",
                    rows: [
                        { label: "Peak Range", values: array.slice(left, right + 1), activeIndices: [right - left] },
                        { label: "Target", values: [target] }
                    ]
                }
            };
        }
    }

    const peak = left;

    yield {
        type: "narrow",
        array,
        target,
        low: 0,
        mid: peak,
        high: length - 1,
        highlightIndices: [peak],
        pointers: [{ label: "peak", index: peak }],
        probes,
        message: `Peak found at index ${peak} with value ${array[peak]}.`,
        workspace: {
            title: "Peak Found",
            detail: "The array can now be searched as an increasing left half and a decreasing right half.",
            rows: [
                { label: "Peak", values: [`index ${peak}`, array[peak]], activeIndices: [0, 1] },
                { label: "Target", values: [target] }
            ]
        }
    };

    if (array[peak] === target) {
        yield {
            type: "found",
            array,
            target,
            low: 0,
            mid: peak,
            high: length - 1,
            pointers: [{ label: "found", index: peak }],
            probes,
            resultIndex: peak,
            message: `Target ${target} is the peak at index ${peak}.`,
            workspace: {
                title: "Target Found",
                detail: "The peak value matches the target.",
                rows: [{ label: "Peak", values: [`index ${peak}`, array[peak]], activeIndices: [0, 1] }]
            }
        };
        return;
    }

    if (target > array[peak]) {
        yield {
            type: "miss",
            array,
            target,
            mid: peak,
            highlightIndices: [peak],
            pointers: [{ label: "peak", index: peak }],
            probes,
            resultIndex: -1,
            message: `${target} is larger than the peak value ${array[peak]}, so it cannot be in the array.`,
            workspace: {
                title: "Target Too Large",
                detail: "No value in a bitonic array can exceed its peak.",
                rows: [
                    { label: "Peak", values: [array[peak]], activeIndices: [0] },
                    { label: "Target", values: [target] }
                ]
            }
        };
        return;
    }

    const leftResult = yield* directionalBinarySearch(array, target, 0, peak - 1, peak, "increasing", probes);
    probes = leftResult.probes;

    if (leftResult.index !== -1) {
        return;
    }

    yield* directionalBinarySearch(array, target, peak + 1, length - 1, peak, "decreasing", probes);
}

function* directionalBinarySearch(
    array: number[],
    target: number,
    lowStart: number,
    highStart: number,
    peak: number,
    direction: "increasing" | "decreasing",
    probes: number
): Generator<SearchStep, { index: number; probes: number }> {
    let low = lowStart;
    let high = highStart;
    const phase = direction === "increasing" ? "left increasing half" : "right decreasing half";

    yield {
        type: "narrow",
        array,
        target,
        low,
        high,
        mid: low <= high ? Math.floor((low + high) / 2) : undefined,
        pointers: [
            { label: "peak", index: peak },
            ...(low <= high
                ? [
                    { label: "left", index: low },
                    { label: "right", index: high }
                ]
                : [])
        ],
        probes,
        message: `Search the ${phase}.`,
        workspace: {
            title: `${direction === "increasing" ? "Increasing" : "Decreasing"} Binary Search`,
            detail: `The peak is fixed. Now the ${phase} can be searched with binary search rules.`,
            rows: [
                { label: "Search Range", values: low <= high ? array.slice(low, high + 1) : [] },
                { label: "Target", values: [target] }
            ]
        }
    };

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
            highlightIndices: [mid, peak],
            pointers: [
                { label: "peak", index: peak },
                { label: "left", index: low },
                { label: "mid", index: mid },
                { label: "right", index: high }
            ],
            probes,
            message: `Search the ${phase}: compare ${value} at index ${mid} with ${target}.`,
            workspace: createBinaryWorkspace(
                array,
                target,
                low,
                mid,
                high,
                peak,
                direction,
                direction === "increasing"
                    ? "Values rise left to right, so ordinary binary search rules apply."
                    : "Values fall left to right, so the comparison direction is reversed."
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
                pointers: [
                    { label: "peak", index: peak },
                    { label: "found", index: mid }
                ],
                probes,
                resultIndex: mid,
                message: `Target ${target} found at index ${mid}.`,
                workspace: createBinaryWorkspace(
                    array,
                    target,
                    low,
                    mid,
                    high,
                    peak,
                    direction,
                    `Found ${target} in the ${phase}.`
                )
            };
            return { index: mid, probes };
        }

        if (direction === "increasing") {
            if (value < target) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        } else if (value > target) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }

        yield {
            type: "narrow",
            array,
            target,
            low,
            high,
            mid: low <= high ? Math.floor((low + high) / 2) : undefined,
            pointers: [
                { label: "peak", index: peak },
                ...(low <= high
                    ? [
                        { label: "left", index: low },
                        { label: "right", index: high }
                    ]
                    : [])
            ],
            probes,
            message: `Narrow the ${phase}.`,
            workspace: {
                title: `${direction === "increasing" ? "Increasing" : "Decreasing"} Binary Search`,
                detail: low <= high ? "The target can only remain inside the updated range." : "This half is exhausted.",
                rows: [
                    { label: "Search Range", values: low <= high ? array.slice(low, high + 1) : [] },
                    { label: "Target", values: [target] }
                ]
            }
        };
    }

    if (direction === "decreasing") {
        yield {
            type: "miss",
            array,
            target,
            pointers: [{ label: "peak", index: peak }],
            probes,
            resultIndex: -1,
            message: `Target ${target} is not in either side of the bitonic array.`,
            workspace: {
                title: "Search Complete",
                detail: "Both the increasing and decreasing halves were exhausted.",
                rows: [
                    { label: "Target", values: [target] },
                    { label: "Result", values: ["not found"] }
                ]
            }
        };
    }

    return { index: -1, probes };
}

export const defaultRotatedSortedArray = [48, 55, 63, 72, 81, 4, 9, 16, 23, 31, 39];
function createWorkspace(array, target, low, mid, high, detail) {
    const active = low <= high ? array.slice(low, high + 1) : [];
    const midIndex = mid >= low && mid <= high ? mid - low : -1;
    return {
        title: "Rotated Binary Search",
        detail,
        rows: [
            {
                label: "Active Window",
                values: active,
                activeIndices: midIndex >= 0 ? [midIndex] : []
            },
            {
                label: "Boundaries",
                values: low <= high ? [`low ${low}: ${array[low]}`, `mid ${mid}: ${array[mid]}`, `high ${high}: ${array[high]}`] : ["empty"]
            },
            {
                label: "Target",
                values: [target]
            }
        ]
    };
}
function createInsight(array, target, low, mid, high, phase, sortedSide, keepSide, comparison, decisionText, note) {
    const leftRange = low <= mid ? [low, mid] : undefined;
    const rightRange = mid <= high ? [mid, high] : undefined;
    return {
        phase,
        low,
        mid,
        high,
        sortedSide,
        keepSide,
        leftRange,
        rightRange,
        lowValue: array[low],
        midValue: array[mid],
        highValue: array[high],
        target,
        comparison,
        decisionText,
        note
    };
}
export function createRotatedSortedArraySearchInitialStep(array, target) {
    const high = array.length - 1;
    const mid = high >= 0 ? Math.floor(high / 2) : 0;
    return {
        type: "narrow",
        array,
        target,
        low: array.length > 0 ? 0 : undefined,
        mid: array.length > 0 ? mid : undefined,
        high: array.length > 0 ? high : undefined,
        pointers: array.length > 0
            ? [
                { label: "low", index: 0 },
                { label: "mid", index: mid },
                { label: "high", index: high }
            ]
            : [],
        message: "Start with the full rotated array and inspect the middle value.",
        rotatedArray: array.length > 0
            ? createInsight(array, target, 0, mid, high, "identify", "unknown", "unknown", `${array[0]} ? ${array[mid]} ? ${array[high]}`, "Find which half is sorted before deciding which half can be discarded.", "A rotated sorted array is still two sorted runs joined at the rotation point.")
            : undefined,
        workspace: array.length > 0
            ? createWorkspace(array, target, 0, mid, high, "The array is sorted, then rotated. At every step at least one half remains sorted.")
            : {
                title: "Rotated Binary Search",
                detail: "There are no values to inspect.",
                rows: [{ label: "Target", values: [target] }]
            }
    };
}
export function* rotatedSortedArraySearch(array, target) {
    let low = 0;
    let high = array.length - 1;
    let probes = 0;
    if (array.length === 0) {
        yield {
            type: "miss",
            array,
            target,
            probes,
            resultIndex: -1,
            message: "The array is empty, so the target cannot be found.",
            workspace: {
                title: "Rotated Binary Search",
                detail: "No window exists.",
                rows: [{ label: "Target", values: [target] }]
            }
        };
        return;
    }
    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const lowValue = array[low];
        const midValue = array[mid];
        const highValue = array[high];
        probes += 1;
        yield {
            type: "inspect",
            array,
            target,
            low,
            mid,
            high,
            highlightIndices: [low, mid, high],
            pointers: [
                { label: "low", index: low },
                { label: "mid", index: mid },
                { label: "high", index: high }
            ],
            probes,
            message: `Inspect index ${mid}: value ${midValue}. Decide which half is sorted.`,
            rotatedArray: createInsight(array, target, low, mid, high, "identify", lowValue <= midValue ? "left" : "right", "unknown", lowValue <= midValue ? `${lowValue} <= ${midValue}` : `${midValue} <= ${highValue}`, lowValue <= midValue ? "The left half is sorted." : "The right half is sorted.", "Rotated binary search works because one side still has normal sorted order."),
            workspace: createWorkspace(array, target, low, mid, high, "Compare low, mid, and high to locate the normally sorted half.")
        };
        if (midValue === target) {
            yield {
                type: "found",
                array,
                target,
                low,
                mid,
                high,
                highlightIndices: [mid],
                pointers: [{ label: "found", index: mid }],
                probes,
                resultIndex: mid,
                message: `Target ${target} found at index ${mid}.`,
                rotatedArray: createInsight(array, target, low, mid, high, "found", "unknown", "unknown", `${midValue} == ${target}`, `Return index ${mid}.`, "The middle value matches, so the search stops immediately."),
                workspace: createWorkspace(array, target, low, mid, high, `The target is exactly the middle value, so return index ${mid}.`)
            };
            return;
        }
        if (lowValue <= midValue) {
            if (lowValue <= target && target < midValue) {
                high = mid - 1;
                yield {
                    type: "narrow",
                    array,
                    target,
                    low,
                    high,
                    mid: low <= high ? Math.floor((low + high) / 2) : undefined,
                    highlightIndices: low <= high ? [low, high] : [],
                    pointers: low <= high
                        ? [
                            { label: "low", index: low },
                            { label: "high", index: high }
                        ]
                        : [],
                    probes,
                    message: `${target} is inside the sorted left half, so keep the left side.`,
                    rotatedArray: createInsight(array, target, low, mid, Math.max(mid, high), "keep-left", "left", "left", `${lowValue} <= ${target} < ${midValue}`, `Keep indices ${low} through ${high}.`, "When the target falls inside the sorted half's value range, the other half can be discarded."),
                    workspace: createWorkspace(array, target, low, mid, Math.max(mid, high), "Target belongs to the sorted left half, so the right side is impossible.")
                };
            }
            else {
                low = mid + 1;
                yield {
                    type: "narrow",
                    array,
                    target,
                    low,
                    high,
                    mid: low <= high ? Math.floor((low + high) / 2) : undefined,
                    highlightIndices: low <= high ? [low, high] : [],
                    pointers: low <= high
                        ? [
                            { label: "low", index: low },
                            { label: "high", index: high }
                        ]
                        : [],
                    probes,
                    message: `${target} is not inside the sorted left half, so keep the right side.`,
                    rotatedArray: createInsight(array, target, Math.min(low, mid), mid, high, "keep-right", "left", "right", `${target} not in [${lowValue}, ${midValue})`, low <= high ? `Keep indices ${low} through ${high}.` : "The candidate window is empty.", "If the target cannot fit in the sorted half, it must be in the rotated half or absent."),
                    workspace: createWorkspace(array, target, Math.min(low, mid), mid, high, "The sorted left half cannot contain the target, so search the other half.")
                };
            }
        }
        else if (midValue < target && target <= highValue) {
            low = mid + 1;
            yield {
                type: "narrow",
                array,
                target,
                low,
                high,
                mid: low <= high ? Math.floor((low + high) / 2) : undefined,
                highlightIndices: low <= high ? [low, high] : [],
                pointers: low <= high
                    ? [
                        { label: "low", index: low },
                        { label: "high", index: high }
                    ]
                    : [],
                probes,
                message: `${target} is inside the sorted right half, so keep the right side.`,
                rotatedArray: createInsight(array, target, Math.min(low, mid), mid, high, "keep-right", "right", "right", `${midValue} < ${target} <= ${highValue}`, `Keep indices ${low} through ${high}.`, "The target fits the sorted right half's value range."),
                workspace: createWorkspace(array, target, Math.min(low, mid), mid, high, "Target belongs to the sorted right half, so the left side is impossible.")
            };
        }
        else {
            high = mid - 1;
            yield {
                type: "narrow",
                array,
                target,
                low,
                high,
                mid: low <= high ? Math.floor((low + high) / 2) : undefined,
                highlightIndices: low <= high ? [low, high] : [],
                pointers: low <= high
                    ? [
                        { label: "low", index: low },
                        { label: "high", index: high }
                    ]
                    : [],
                probes,
                message: `${target} is not inside the sorted right half, so keep the left side.`,
                rotatedArray: createInsight(array, target, low, mid, Math.max(mid, high), "keep-left", "right", "left", `${target} not in (${midValue}, ${highValue}]`, low <= high ? `Keep indices ${low} through ${high}.` : "The candidate window is empty.", "The sorted right half cannot contain the target, so search the other half."),
                workspace: createWorkspace(array, target, low, mid, Math.max(mid, high), "The sorted right half cannot contain the target, so search the other half.")
            };
        }
    }
    yield {
        type: "miss",
        array,
        target,
        probes,
        resultIndex: -1,
        message: `Target ${target} is not present in the rotated sorted array.`,
        rotatedArray: {
            phase: "miss",
            low,
            mid: Math.max(0, Math.min(array.length - 1, low)),
            high,
            sortedSide: "unknown",
            keepSide: "none",
            target,
            comparison: "window empty",
            decisionText: `${target} is not present.`,
            note: "All possible candidate windows have been discarded."
        },
        workspace: {
            title: "Search Complete",
            detail: "The candidate window is empty.",
            rows: [
                { label: "Target", values: [target] },
                { label: "Result", values: ["not found"] }
            ]
        }
    };
}

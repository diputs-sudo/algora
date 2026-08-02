function createGallopWorkspace(array, target, start, bound, detail) {
    const cappedBound = Math.min(bound, array.length - 1);
    return {
        title: "Galloping Phase",
        detail,
        rows: [
            {
                label: "Covered Range",
                values: array.map((value, index) => index >= start && index <= cappedBound ? value : null),
                activeIndices: [cappedBound]
            },
            {
                label: "Bounds",
                values: [`start ${start}`, `jump ${bound}`, `value ${array[cappedBound]}`],
                activeIndices: [1]
            },
            {
                label: "Target",
                values: [target]
            }
        ]
    };
}
function createBinaryWorkspace(array, target, low, mid, high, detail) {
    return {
        title: "Binary Finish",
        detail,
        rows: [
            {
                label: "Bracket",
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
export function createGallopingSearchInitialStep(array, target) {
    return {
        type: "narrow",
        array,
        target,
        low: array.length > 0 ? 0 : undefined,
        mid: array.length > 0 ? 0 : undefined,
        high: array.length > 0 ? 0 : undefined,
        pointers: array.length > 0 ? [{ label: "start", index: 0 }] : [],
        message: "Start at the first value, then gallop by doubling the jump until the target is bracketed.",
        workspace: {
            title: "Galloping Search",
            detail: "Galloping Search is a range-first search: expand quickly, then use Binary Search inside the discovered range.",
            rows: [
                { label: "Array", values: [...array], activeIndices: array.length > 0 ? [0] : [] },
                { label: "Target", values: [target] }
            ]
        }
    };
}
export function* gallopingSearch(array, target) {
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
                title: "Galloping Search",
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
        pointers: [{ label: "start", index: 0 }],
        probes,
        message: `Check the starting value ${array[0]} at index 0.`,
        workspace: createGallopWorkspace(array, target, 0, 0, "If the first value is already enough, the bracket starts immediately.")
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
            workspace: createGallopWorkspace(array, target, 0, 0, `Found ${target} at the starting index.`)
        };
        return;
    }
    let previous = 0;
    let jump = 1;
    while (jump < length && array[jump] < target) {
        probes += 1;
        yield {
            type: "inspect",
            array,
            target,
            low: previous,
            mid: jump,
            high: jump,
            pointers: [
                { label: "prev", index: previous },
                { label: "jump", index: jump }
            ],
            probes,
            message: `Gallop to index ${jump}: ${array[jump]} is still less than ${target}, so double the jump.`,
            workspace: createGallopWorkspace(array, target, previous, jump, "The target must be farther right than the current jump point.")
        };
        previous = jump;
        jump *= 2;
    }
    const left = previous + 1;
    let low = left;
    let high = Math.min(jump, length - 1);
    if (low > high) {
        yield {
            type: "miss",
            array,
            target,
            probes,
            resultIndex: -1,
            message: `Target ${target} is larger than every value reached by galloping.`,
            workspace: {
                title: "Galloping Phase",
                detail: "The gallop ran past the end of the array with no valid bracket left.",
                rows: [
                    { label: "Last Checked", values: [`index ${previous}`, array[previous]] },
                    { label: "Target", values: [target] }
                ]
            }
        };
        return;
    }
    yield {
        type: "narrow",
        array,
        target,
        low,
        high,
        mid: Math.floor((low + high) / 2),
        pointers: [
            { label: "low", index: low },
            { label: "high", index: high }
        ],
        probes,
        message: `Galloping found the bracket ${low} through ${high}; finish with Binary Search.`,
        workspace: createBinaryWorkspace(array, target, low, Math.floor((low + high) / 2), high, "The final search is ordinary Binary Search inside the bracketed range.")
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
            probes,
            message: `Binary finish: compare ${value} at index ${mid} with ${target}.`,
            workspace: createBinaryWorkspace(array, target, low, mid, high, "Use the sorted bracket to remove half of the remaining candidates.")
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
                workspace: createBinaryWorkspace(array, target, low, mid, high, `Found ${target} inside the galloped bracket.`)
            };
            return;
        }
        if (value < target) {
            low = mid + 1;
        }
        else {
            high = mid - 1;
        }
        if (low <= high) {
            yield {
                type: "narrow",
                array,
                target,
                low,
                mid: Math.floor((low + high) / 2),
                high,
                probes,
                message: value < target
                    ? `${value} is smaller than ${target}, so keep the right side.`
                    : `${value} is larger than ${target}, so keep the left side.`,
                workspace: createBinaryWorkspace(array, target, low, Math.floor((low + high) / 2), high, "Continue Binary Search inside the narrowed bracket.")
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
        message: `Target ${target} is not in the galloped bracket.`,
        workspace: {
            title: "Binary Finish",
            detail: "The bracket is empty, so the target is not present.",
            rows: [
                { label: "Final Bounds", values: [`low ${low}`, `high ${high}`] },
                { label: "Target", values: [target] }
            ]
        }
    };
}

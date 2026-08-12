function clampIndex(index, length) {
    return Math.max(0, Math.min(index, Math.max(length - 1, 0)));
}
function buildOffsets(limit) {
    const offsets = [1];
    let value = 2;
    while (value <= Math.max(limit, 1)) {
        offsets.push(value);
        value *= 2;
    }
    return offsets;
}
function createGallopBuilderInsight(array, target, phase, previousBound, currentBound, discoveredLow, discoveredHigh, comparison, decisionText, note, nextJump) {
    const cappedCurrent = clampIndex(currentBound, array.length);
    return {
        title: "Gallop Builder",
        kind: "galloping",
        phase,
        lower: discoveredLow ?? previousBound,
        probe: cappedCurrent,
        upper: discoveredHigh ?? cappedCurrent,
        jump: currentBound,
        nextJump,
        sequence: buildOffsets(Math.max(currentBound, nextJump ?? currentBound, array.length - 1)),
        previousBound,
        currentBound,
        discoveredLow,
        discoveredHigh,
        transitionLabel: phase === "expand" ? "GALLOPING" : "GALLOPING -> NARROWING",
        probeValue: array.length === 0 ? "none" : array[cappedCurrent],
        comparison,
        decisionText,
        note
    };
}
function createGallopWorkspace(array, target, start, bound, detail) {
    const cappedBound = Math.min(bound, array.length - 1);
    return {
        title: "Gallop Builder",
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
        title: "Gallop Builder",
        detail,
        rows: [
            {
                label: "Discovered Bracket",
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
        rangeSearch: array.length > 0
            ? createGallopBuilderInsight(array, target, "expand", 0, 1, undefined, undefined, `start value ${array[0]}`, "Check the start, then try offsets +1, +2, +4, ... until the target is bracketed.", "Galloping Search moves quickly through a sorted array before narrowing inside the discovered interval.", 2)
            : undefined,
        workspace: {
            title: "Gallop Builder",
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
            rangeSearch: {
                title: "Gallop Builder",
                kind: "galloping",
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
                decisionText: "No gallop can begin.",
                note: "There are no values to inspect."
            },
            workspace: {
                title: "Gallop Builder",
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
        rangeSearch: createGallopBuilderInsight(array, target, array[0] === target ? "found" : "expand", 0, 0, undefined, undefined, `${array[0]} ${array[0] === target ? "==" : "<"} ${target}`, array[0] === target ? "The starting value is the target." : "Start galloping from index 0.", "The starting point anchors every later gallop offset.", 1),
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
            rangeSearch: createGallopBuilderInsight(array, target, "found", 0, 0, 0, 0, `${array[0]} == ${target}`, "Return index 0.", `Found ${target} at the starting index.`),
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
            rangeSearch: createGallopBuilderInsight(array, target, "expand", previous, jump, undefined, undefined, `${array[jump]} < ${target}`, `Accept offset +${jump}; next gallop tries +${jump * 2}.`, "The target is still farther right, so the gallop grows exponentially.", jump * 2),
            workspace: createGallopWorkspace(array, target, previous, jump, "The target must be farther right than the current jump point.")
        };
        previous = jump;
        jump *= 2;
    }
    const left = previous + 1;
    let low = left;
    let high = Math.min(jump, length - 1);
    const cappedJump = clampIndex(jump, length);
    if (low > high) {
        yield {
            type: "miss",
            array,
            target,
            probes,
            resultIndex: -1,
            message: `Target ${target} is larger than every value reached by galloping.`,
            rangeSearch: createGallopBuilderInsight(array, target, "miss", previous, jump, undefined, undefined, jump >= length ? `jump ${jump} outside array` : `${array[cappedJump]} < ${target}`, "The gallop ran beyond the valid array without a bracket.", "No valid narrowing interval remains."),
            workspace: {
                title: "Gallop Builder",
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
        rangeSearch: createGallopBuilderInsight(array, target, "binary", previous, jump, low, high, jump >= length ? `jump ${jump} outside array` : `${array[cappedJump]} >= ${target}`, `The discovered interval is [${low}, ${high}], so switch from galloping to narrowing.`, "The large jumps are done; now the algorithm narrows inside the bracket."),
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
            rangeSearch: createGallopBuilderInsight(array, target, value === target ? "found" : "binary", previous, jump, low, high, `${value} ? ${target}`, value === target ? `Return index ${mid}.` : "Use Binary Search rules inside the galloped bracket.", "Galloping gave the bracket; narrowing decides the exact index."),
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
                rangeSearch: createGallopBuilderInsight(array, target, "found", previous, jump, low, high, `${value} == ${target}`, `Return index ${mid}.`, `Found ${target} inside the galloped bracket.`),
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
            const nextMid = Math.floor((low + high) / 2);
            yield {
                type: "narrow",
                array,
                target,
                low,
                mid: nextMid,
                high,
                probes,
                message: value < target
                    ? `${value} is smaller than ${target}, so keep the right side.`
                    : `${value} is larger than ${target}, so keep the left side.`,
                rangeSearch: createGallopBuilderInsight(array, target, "binary", previous, jump, low, high, value < target ? `${value} < ${target}` : `${value} > ${target}`, value < target ? `Discard everything before index ${low}.` : `Discard everything after index ${high}.`, "The bracket keeps shrinking until it is empty or the target is found."),
                workspace: createBinaryWorkspace(array, target, low, nextMid, high, "Continue Binary Search inside the narrowed bracket.")
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
        rangeSearch: createGallopBuilderInsight(array, target, "miss", previous, jump, low, high, "bracket empty", `${target} is not present.`, "The galloped bracket was exhausted by Binary Search."),
        workspace: {
            title: "Gallop Builder",
            detail: "The bracket is empty, so the target is not present.",
            rows: [
                { label: "Final Bounds", values: [`low ${low}`, `high ${high}`] },
                { label: "Target", values: [target] }
            ]
        }
    };
}

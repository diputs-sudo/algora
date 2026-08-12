function getJumpSize(length) {
    return Math.max(1, Math.floor(Math.sqrt(length)));
}
function createJumpInsight(phase, blockStart, blockEnd, current, jumpSize, comparison, decisionText, note, nextStart) {
    return {
        phase,
        blockStart,
        blockEnd,
        current,
        jumpSize,
        nextStart,
        comparison,
        decisionText,
        note
    };
}
function createWorkspace(array, target, start, end, current, jumpSize, detail) {
    const boundedEnd = Math.min(end, array.length - 1);
    return {
        title: "Jump Search Workspace",
        detail,
        rows: [
            {
                label: "Candidate Block",
                values: start <= boundedEnd ? array.slice(start, boundedEnd + 1) : [],
                activeIndices: current >= start && current <= boundedEnd ? [current - start] : []
            },
            {
                label: "Pointers",
                values: [`start ${start}`, `end ${boundedEnd}`, `step ${jumpSize}`],
                activeIndices: [0, 1]
            },
            {
                label: "Target",
                values: [target]
            }
        ]
    };
}
export function createJumpSearchInitialStep(array, target) {
    const jumpSize = getJumpSize(array.length);
    const end = array.length > 0 ? Math.min(jumpSize - 1, array.length - 1) : undefined;
    return {
        type: "narrow",
        array,
        target,
        low: array.length > 0 ? 0 : undefined,
        high: end,
        pointers: array.length > 0 ? [
            { label: "start", index: 0 },
            { label: "end", index: end ?? 0 }
        ] : [],
        message: `Start with a jump size of ${jumpSize}. Check each block boundary until the target could fit inside a block.`,
        jumpSearch: array.length > 0
            ? createJumpInsight("jump", 0, end ?? 0, end ?? 0, jumpSize, `boundary index ${end ?? 0}`, "Check block boundaries first. Once a boundary is large enough, scan inside that block.", "Jump Search trades fewer boundary probes for one short linear scan.", end === undefined ? undefined : end + 1)
            : undefined,
        workspace: {
            title: "Jump Search Workspace",
            detail: "Jump Search works on sorted arrays by skipping block-by-block, then scanning one candidate block.",
            rows: [
                { label: "First Block", values: end === undefined ? [] : array.slice(0, end + 1), activeIndices: end === undefined ? [] : [end] },
                { label: "Target", values: [target] }
            ]
        }
    };
}
export function* jumpSearch(array, target) {
    const length = array.length;
    const jumpSize = getJumpSize(length);
    let start = 0;
    let end = Math.min(jumpSize - 1, length - 1);
    let probes = 0;
    if (length === 0) {
        yield {
            type: "miss",
            array,
            target,
            probes,
            resultIndex: -1,
            message: "The array is empty, so the target cannot be found.",
            jumpSearch: createJumpInsight("miss", 0, 0, 0, jumpSize, "empty array", "No block can be formed.", "There are no values to inspect."),
            workspace: {
                title: "Jump Search Workspace",
                detail: "There are no blocks to inspect.",
                rows: [{ label: "Target", values: [target] }]
            }
        };
        return;
    }
    while (start < length && array[end] < target) {
        probes += 1;
        yield {
            type: "inspect",
            array,
            target,
            low: start,
            mid: end,
            high: end,
            pointers: [
                { label: "start", index: start },
                { label: "end", index: end }
            ],
            probes,
            message: `Block ending at index ${end} has value ${array[end]}, which is still less than ${target}.`,
            jumpSearch: createJumpInsight("jump", start, end, end, jumpSize, `${array[end]} < ${target}`, `Reject this block and jump to index ${end + 1}.`, "The block boundary is still too small, so the target must be farther right.", end + 1),
            workspace: createWorkspace(array, target, start, end, end, jumpSize, `Probe the block boundary at index ${end}. Since ${array[end]} is less than ${target}, jump to the next block.`)
        };
        start = end + 1;
        end = Math.min(end + jumpSize, length - 1);
        if (start < length) {
            yield {
                type: "narrow",
                array,
                target,
                low: start,
                high: end,
                pointers: [
                    { label: "start", index: start },
                    { label: "end", index: end }
                ],
                probes,
                message: `Jump to the next block: indices ${start} through ${end}.`,
                jumpSearch: createJumpInsight("jump", start, end, start, jumpSize, `next block ${start}-${end}`, "Move the candidate block forward by one jump size.", "The scan has not started yet; we are still finding the only block that can contain the target.", end),
                workspace: createWorkspace(array, target, start, end, start, jumpSize, `The next candidate block spans index ${start} to index ${end}.`)
            };
        }
    }
    if (start >= length) {
        yield {
            type: "miss",
            array,
            target,
            probes,
            resultIndex: -1,
            message: `All block boundaries were smaller than ${target}. The target was not found.`,
            jumpSearch: createJumpInsight("miss", start, end, end, jumpSize, "past end", `${target} is larger than all checked block boundaries.`, "Jumping ran out of array before a candidate block could be scanned."),
            workspace: {
                title: "Jump Search Workspace",
                detail: `The search jumped beyond the array, so ${target} is not present.`,
                rows: [
                    { label: "Final Start", values: [start] },
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
        low: start,
        high: end,
        pointers: [
            { label: "start", index: start },
            { label: "end", index: end }
        ],
        probes,
        message: `The target can only be in indices ${start} through ${end}. Scan this block linearly.`,
        jumpSearch: createJumpInsight("scan", start, end, start, jumpSize, `${array[end]} >= ${target}`, `Boundary index ${end} is large enough, so scan indices ${start} through ${end}.`, "This is the phase switch: block jumping becomes a short linear scan."),
        workspace: createWorkspace(array, target, start, end, start, jumpSize, `Boundary value ${array[end]} is at least ${target}, so the final scan stays inside this block.`)
    };
    for (let index = start; index <= end; index++) {
        const value = array[index];
        probes += 1;
        yield {
            type: "inspect",
            array,
            target,
            low: start,
            mid: index,
            high: end,
            pointers: [
                { label: "scan", index },
                { label: "end", index: end }
            ],
            probes,
            message: `Scan index ${index}: compare ${value} with target ${target}.`,
            jumpSearch: createJumpInsight(value === target ? "found" : "scan", start, end, index, jumpSize, `${value} ${value === target ? "==" : "!="} ${target}`, value === target ? `Return index ${index}.` : "Keep scanning this candidate block.", "Only this block can still contain the target."),
            workspace: createWorkspace(array, target, start, end, index, jumpSize, `Linearly scan the candidate block. Compare ${value} at index ${index} with ${target}.`)
        };
        if (value === target) {
            yield {
                type: "found",
                array,
                target,
                low: start,
                mid: index,
                high: end,
                pointers: [{ label: "found", index }],
                probes,
                resultIndex: index,
                message: `Target ${target} found at index ${index}.`,
                jumpSearch: createJumpInsight("found", start, end, index, jumpSize, `${value} == ${target}`, `Return index ${index}.`, "The target was found during the linear scan inside the candidate block."),
                workspace: createWorkspace(array, target, start, end, index, jumpSize, `Found ${target} at index ${index}.`)
            };
            return;
        }
    }
    yield {
        type: "miss",
        array,
        target,
        low: start,
        high: end,
        probes,
        resultIndex: -1,
        message: `The candidate block was scanned and ${target} was not found.`,
        jumpSearch: createJumpInsight("miss", start, end, end, jumpSize, "block exhausted", `${target} is not present in the only possible block.`, "The boundary phase found the right block, but the scan did not find the target."),
        workspace: {
            title: "Jump Search Workspace",
            detail: `Every value from index ${start} through ${end} was checked.`,
            rows: [
                { label: "Scanned Block", values: array.slice(start, end + 1) },
                { label: "Target", values: [target] }
            ]
        }
    };
}

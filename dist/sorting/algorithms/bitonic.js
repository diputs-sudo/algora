function nextPowerOfTwo(n) {
    return 1 << Math.ceil(Math.log2(Math.max(1, n)));
}
function createWorkspace(arr, padValue, low, count, detail, compareIndices = [], activeHighlightIndices = compareIndices) {
    const activeBlockRaw = arr.slice(low, low + count).map(value => value === padValue ? null : value);
    let lastVisibleIndex = -1;
    for (let index = 0; index < activeBlockRaw.length; index++) {
        if (activeBlockRaw[index] !== null) {
            lastVisibleIndex = index;
        }
    }
    const activeBlock = lastVisibleIndex >= 0
        ? activeBlockRaw.slice(0, lastVisibleIndex + 1)
        : [null];
    const comparePair = compareIndices.length === 2
        ? compareIndices.map(index => arr[index] === padValue ? null : arr[index])
        : [null, null];
    const network = arr.map(value => value === padValue ? null : value);
    return {
        title: "Algorithm Workspace",
        detail,
        rows: [
            {
                label: "Active Block",
                values: activeBlock,
                activeIndices: activeHighlightIndices
                    .map(index => index - low)
                    .filter(index => index >= 0 && index < activeBlock.length)
            },
            {
                label: "Compare Pair",
                values: comparePair,
                activeIndices: compareIndices.length === 2 ? [0, 1] : []
            },
            {
                label: "Network View",
                values: network,
                activeIndices: compareIndices
            }
        ]
    };
}
export function* bitonicSort(input) {
    const original = [...input];
    const visibleLength = original.length;
    if (original.length === 0) {
        yield {
            type: "done",
            array: [],
            memoryUsed: 0,
            memoryLabel: "Memory",
            memoryUnit: "items",
            workspace: {
                title: "Algorithm Workspace",
                detail: "Waiting for data",
                rows: [
                    { label: "Active Block", values: [] },
                    { label: "Compare Pair", values: [] },
                    { label: "Network View", values: [] }
                ]
            }
        };
        return;
    }
    const targetLength = nextPowerOfTwo(original.length);
    const padValue = Math.max(...original) + 1;
    const arr = [...original];
    while (arr.length < targetLength) {
        arr.push(padValue);
    }
    const paddingCost = targetLength - original.length;
    function visibleArray() {
        return arr.filter(value => value !== padValue).slice(0, visibleLength);
    }
    function toVisibleIndices(indices) {
        const visibleIndices = [];
        indices.forEach(index => {
            if (arr[index] === padValue) {
                return;
            }
            let visibleIndex = 0;
            for (let scan = 0; scan < index; scan++) {
                if (arr[scan] !== padValue) {
                    visibleIndex += 1;
                }
            }
            if (visibleIndex < visibleLength) {
                visibleIndices.push(visibleIndex);
            }
        });
        return visibleIndices;
    }
    function* compareAndSwap(i, j, ascending, depth, low, count) {
        const directionLabel = ascending ? "ascending" : "descending";
        const rawCompareIndices = [i, j];
        if (arr[i] === padValue && arr[j] === padValue) {
            return;
        }
        const visibleCompareIndices = toVisibleIndices(rawCompareIndices);
        const comparisonWorkspace = createWorkspace(arr, padValue, low, count, `Compare positions ${i} and ${j} while merging a ${directionLabel} bitonic block`, rawCompareIndices, visibleCompareIndices);
        yield {
            type: "compare",
            indices: visibleCompareIndices,
            array: visibleArray(),
            memoryUsed: paddingCost + depth,
            memoryLabel: "Memory",
            memoryUnit: "items",
            workspace: comparisonWorkspace
        };
        if ((ascending && arr[i] > arr[j]) || (!ascending && arr[i] < arr[j])) {
            [arr[i], arr[j]] = [arr[j], arr[i]];
            yield {
                type: "swap",
                indices: visibleCompareIndices,
                array: visibleArray(),
                memoryUsed: paddingCost + depth,
                memoryLabel: "Memory",
                memoryUnit: "items",
                workspace: createWorkspace(arr, padValue, low, count, `Swap the pair so this block moves toward ${directionLabel} order`, rawCompareIndices, toVisibleIndices(rawCompareIndices))
            };
        }
    }
    function* merge(low, count, ascending, depth) {
        if (count <= 1) {
            return;
        }
        const half = count / 2;
        for (let index = low; index < low + half; index++) {
            yield* compareAndSwap(index, index + half, ascending, depth, low, count);
        }
        yield* merge(low, half, ascending, depth + 1);
        yield* merge(low + half, half, ascending, depth + 1);
    }
    function* sort(low, count, ascending, depth) {
        if (count <= 1) {
            return;
        }
        const half = count / 2;
        yield* sort(low, half, true, depth + 1);
        yield* sort(low + half, half, false, depth + 1);
        yield* merge(low, count, ascending, depth + 1);
    }
    yield* sort(0, arr.length, true, 1);
    const result = arr.filter(value => value !== padValue);
    yield {
        type: "done",
        array: result,
        memoryUsed: paddingCost + 1,
        memoryLabel: "Memory",
        memoryUnit: "items",
        workspace: createWorkspace(arr, padValue, 0, visibleLength, "All bitonic merge stages are complete")
    };
}

function createWorkspace(arr, low, high, detail, pivotIndex, activeRangeIndices = [], fullArrayHighlights = []) {
    const rangeValues = low <= high ? arr.slice(low, high + 1) : [null];
    return {
        title: "Algorithm Workspace",
        detail,
        rows: [
            {
                label: "Partition Range",
                values: rangeValues,
                activeIndices: activeRangeIndices
                    .map(index => index - low)
                    .filter(index => index >= 0 && index < rangeValues.length)
            },
            {
                label: "Pivot",
                values: pivotIndex === undefined ? [null] : [arr[pivotIndex]],
                activeIndices: pivotIndex === undefined ? [] : [0]
            },
            {
                label: "Full Array",
                values: [...arr],
                activeIndices: fullArrayHighlights
            }
        ]
    };
}
export function* quickSort(input) {
    const arr = [...input];
    if (arr.length === 0) {
        yield {
            type: "done",
            array: [],
            memoryUsed: 0,
            memoryLabel: "Stack",
            memoryUnit: "frames",
            workspace: {
                title: "Algorithm Workspace",
                detail: "Waiting for data",
                rows: [
                    { label: "Partition Range", values: [] },
                    { label: "Pivot", values: [] },
                    { label: "Full Array", values: [] }
                ]
            }
        };
        return;
    }
    function* partition(low, high, depth) {
        const pivot = arr[high];
        let i = low;
        for (let j = low; j < high; j++) {
            yield {
                type: "compare",
                indices: [j, high],
                array: [...arr],
                memoryUsed: depth,
                memoryLabel: "Stack",
                memoryUnit: "frames",
                workspace: createWorkspace(arr, low, high, `Compare ${arr[j]} against pivot ${pivot} while partitioning`, high, [j, high], [j, high])
            };
            if (arr[j] < pivot) {
                [arr[i], arr[j]] = [arr[j], arr[i]];
                yield {
                    type: "swap",
                    indices: [i, j],
                    array: [...arr],
                    memoryUsed: depth,
                    memoryLabel: "Stack",
                    memoryUnit: "frames",
                    workspace: createWorkspace(arr, low, high, `Move ${arr[i]} into the left partition before the pivot`, high, [i, j, high], [i, j, high])
                };
                i++;
            }
        }
        [arr[i], arr[high]] = [arr[high], arr[i]];
        yield {
            type: "swap",
            indices: [i, high],
            array: [...arr],
            memoryUsed: depth,
            memoryLabel: "Stack",
            memoryUnit: "frames",
            workspace: createWorkspace(arr, low, high, `Place pivot ${pivot} into its final partition position`, i, [i], [i, high])
        };
        return i;
    }
    function* sort(low, high, depth) {
        if (low < high) {
            const pivotIndex = yield* partition(low, high, depth);
            yield* sort(low, pivotIndex - 1, depth + 1);
            yield* sort(pivotIndex + 1, high, depth + 1);
        }
    }
    yield* sort(0, arr.length - 1, 1);
    yield {
        type: "done",
        array: [...arr],
        memoryUsed: 0,
        memoryLabel: "Stack",
        memoryUnit: "frames",
        workspace: createWorkspace(arr, 0, arr.length - 1, "All partitions are complete")
    };
}

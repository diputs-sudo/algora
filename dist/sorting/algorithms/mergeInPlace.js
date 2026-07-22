function createWorkspace(arr, left, mid, right, detail, leftPointer, rightPointer, focusValues = [null]) {
    const rangeValues = right > left ? arr.slice(left, right) : [null];
    return {
        title: "Algorithm Workspace",
        detail,
        rows: [
            {
                label: "Merge Range",
                values: rangeValues,
                activeIndices: [leftPointer, rightPointer]
                    .filter((index) => index !== undefined)
                    .map(index => index - left)
                    .filter(index => index >= 0 && index < rangeValues.length)
            },
            {
                label: "Focus",
                values: focusValues.length > 0 ? focusValues : [null]
            },
            {
                label: "Full Array",
                values: [...arr],
                activeIndices: [leftPointer, rightPointer].filter((index) => index !== undefined)
            }
        ]
    };
}
export function* mergeSortInPlace(input) {
    const arr = [...input];
    if (arr.length === 0) {
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
                    { label: "Merge Range", values: [] },
                    { label: "Focus", values: [] },
                    { label: "Full Array", values: [] }
                ]
            }
        };
        return;
    }
    function* merge(left, mid, right) {
        let i = left;
        let j = mid;
        while (i < j && j < right) {
            yield {
                type: "compare",
                indices: [i, j],
                array: [...arr],
                memoryUsed: 0,
                memoryLabel: "Memory",
                memoryUnit: "items",
                workspace: createWorkspace(arr, left, mid, right, `Compare left value ${arr[i]} with right value ${arr[j]} inside the merge range`, i, j, [arr[i], arr[j]])
            };
            if (arr[i] <= arr[j]) {
                i += 1;
                continue;
            }
            const value = arr[j];
            let k = j;
            while (k > i) {
                arr[k] = arr[k - 1];
                yield {
                    type: "swap",
                    indices: [k - 1, k],
                    array: [...arr],
                    memoryUsed: 0,
                    memoryLabel: "Memory",
                    memoryUnit: "items",
                    workspace: createWorkspace(arr, left, mid, right, `Shift values right to make room for ${value} at index ${i}`, k - 1, k, [value])
                };
                k -= 1;
            }
            arr[i] = value;
            yield {
                type: "swap",
                indices: [i],
                array: [...arr],
                memoryUsed: 0,
                memoryLabel: "Memory",
                memoryUnit: "items",
                workspace: createWorkspace(arr, left, mid, right, `Insert ${value} into the gap without using a helper array`, i, j, [value])
            };
            i += 1;
            j += 1;
            mid += 1;
        }
    }
    function* sort(left, right) {
        if (right - left <= 1) {
            return;
        }
        const mid = Math.floor((left + right) / 2);
        yield* sort(left, mid);
        yield* sort(mid, right);
        yield* merge(left, mid, right);
    }
    yield* sort(0, arr.length);
    yield {
        type: "done",
        array: [...arr],
        memoryUsed: 0,
        memoryLabel: "Memory",
        memoryUnit: "items",
        workspace: createWorkspace(arr, 0, Math.floor(arr.length / 2), arr.length, "All in-place merges are complete")
    };
}

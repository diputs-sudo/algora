function createWorkspace(arr, low, high, detail, depthLimit, focusValues = [null], activeRangeIndices = [], fullArrayHighlights = []) {
    const hasRange = low <= high;
    const rangeValues = hasRange ? arr.slice(low, high + 1) : [null];
    return {
        title: "Algorithm Workspace",
        detail,
        rows: [
            {
                label: "Active Range",
                values: rangeValues,
                activeIndices: activeRangeIndices
                    .map(index => index - low)
                    .filter(index => index >= 0 && index < rangeValues.length)
            },
            {
                label: "Focus",
                values: focusValues.length > 0 ? focusValues : [null]
            },
            {
                label: "Depth Budget",
                values: [depthLimit]
            },
            {
                label: "Full Array",
                values: [...arr],
                activeIndices: fullArrayHighlights
            }
        ]
    };
}
export function* introSort(input) {
    const arr = [...input];
    const maxDepth = arr.length > 0 ? 2 * Math.floor(Math.log2(arr.length)) : 0;
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
                    { label: "Active Range", values: [] },
                    { label: "Focus", values: [] },
                    { label: "Depth Budget", values: [0] },
                    { label: "Full Array", values: [] }
                ]
            }
        };
        return;
    }
    function memoryForDepth(depthLimit) {
        return Math.max(maxDepth - depthLimit, 0);
    }
    function* insertionSortRange(low, high, depthLimit) {
        for (let index = low + 1; index <= high; index++) {
            const key = arr[index];
            let position = index - 1;
            while (position >= low && arr[position] > key) {
                yield {
                    type: "compare",
                    indices: [position, position + 1],
                    array: [...arr],
                    memoryUsed: memoryForDepth(depthLimit),
                    memoryLabel: "Memory",
                    memoryUnit: "items",
                    workspace: createWorkspace(arr, low, high, `Use Insertion Sort on the small range ${low} to ${high}`, depthLimit, [key], [position, position + 1], [position, position + 1])
                };
                arr[position + 1] = arr[position];
                yield {
                    type: "swap",
                    indices: [position, position + 1],
                    array: [...arr],
                    memoryUsed: memoryForDepth(depthLimit),
                    memoryLabel: "Memory",
                    memoryUnit: "items",
                    workspace: createWorkspace(arr, low, high, `Shift ${arr[position + 1]} right while inserting ${key}`, depthLimit, [key], [position, position + 1], [position, position + 1])
                };
                position -= 1;
            }
            arr[position + 1] = key;
            yield {
                type: "swap",
                indices: [position + 1],
                array: [...arr],
                memoryUsed: memoryForDepth(depthLimit),
                memoryLabel: "Memory",
                memoryUnit: "items",
                workspace: createWorkspace(arr, low, high, `Place ${key} into its sorted spot inside the small range`, depthLimit, [key], [position + 1], [position + 1])
            };
        }
    }
    function* heapify(low, length, index, depthLimit) {
        let largest = index;
        const left = 2 * index + 1;
        const right = 2 * index + 2;
        if (left < length) {
            yield {
                type: "compare",
                indices: [low + largest, low + left],
                array: [...arr],
                memoryUsed: memoryForDepth(depthLimit),
                memoryLabel: "Memory",
                memoryUnit: "items",
                workspace: createWorkspace(arr, low, low + length - 1, `Depth limit reached, so Intro Sort is using Heap Sort on this range`, depthLimit, [arr[low + largest], arr[low + left]], [low + largest, low + left], [low + largest, low + left])
            };
            if (arr[low + left] > arr[low + largest]) {
                largest = left;
            }
        }
        if (right < length) {
            yield {
                type: "compare",
                indices: [low + largest, low + right],
                array: [...arr],
                memoryUsed: memoryForDepth(depthLimit),
                memoryLabel: "Memory",
                memoryUnit: "items",
                workspace: createWorkspace(arr, low, low + length - 1, `Continue Heap Sort comparisons inside the fallback range`, depthLimit, [arr[low + largest], arr[low + right]], [low + largest, low + right], [low + largest, low + right])
            };
            if (arr[low + right] > arr[low + largest]) {
                largest = right;
            }
        }
        if (largest !== index) {
            [arr[low + index], arr[low + largest]] = [arr[low + largest], arr[low + index]];
            yield {
                type: "swap",
                indices: [low + index, low + largest],
                array: [...arr],
                memoryUsed: memoryForDepth(depthLimit),
                memoryLabel: "Memory",
                memoryUnit: "items",
                workspace: createWorkspace(arr, low, low + length - 1, `Swap nodes to restore heap order inside the fallback range`, depthLimit, [arr[low + index], arr[low + largest]], [low + index, low + largest], [low + index, low + largest])
            };
            yield* heapify(low, length, largest, depthLimit);
        }
    }
    function* heapSortRange(low, high, depthLimit) {
        const length = high - low + 1;
        for (let index = Math.floor(length / 2) - 1; index >= 0; index--) {
            yield* heapify(low, length, index, depthLimit);
        }
        for (let end = length - 1; end > 0; end--) {
            [arr[low], arr[low + end]] = [arr[low + end], arr[low]];
            yield {
                type: "swap",
                indices: [low, low + end],
                array: [...arr],
                memoryUsed: memoryForDepth(depthLimit),
                memoryLabel: "Memory",
                memoryUnit: "items",
                workspace: createWorkspace(arr, low, high, `Move the current maximum to the end of the heap-fallback range`, depthLimit, [arr[low + end]], [low, low + end], [low, low + end])
            };
            yield* heapify(low, end, 0, depthLimit);
        }
    }
    function* partition(low, high, depthLimit) {
        const pivot = arr[high];
        let storeIndex = low;
        for (let index = low; index < high; index++) {
            yield {
                type: "compare",
                indices: [index, high],
                array: [...arr],
                memoryUsed: memoryForDepth(depthLimit),
                memoryLabel: "Memory",
                memoryUnit: "items",
                workspace: createWorkspace(arr, low, high, `Use Quick Sort partitioning on the active range with pivot ${pivot}`, depthLimit, [pivot], [index, high], [index, high])
            };
            if (arr[index] < pivot) {
                [arr[storeIndex], arr[index]] = [arr[index], arr[storeIndex]];
                yield {
                    type: "swap",
                    indices: [storeIndex, index],
                    array: [...arr],
                    memoryUsed: memoryForDepth(depthLimit),
                    memoryLabel: "Memory",
                    memoryUnit: "items",
                    workspace: createWorkspace(arr, low, high, `Move ${arr[storeIndex]} to the left partition before the pivot`, depthLimit, [pivot], [storeIndex, index], [storeIndex, index, high])
                };
                storeIndex += 1;
            }
        }
        [arr[storeIndex], arr[high]] = [arr[high], arr[storeIndex]];
        yield {
            type: "swap",
            indices: [storeIndex, high],
            array: [...arr],
            memoryUsed: memoryForDepth(depthLimit),
            memoryLabel: "Memory",
            memoryUnit: "items",
            workspace: createWorkspace(arr, low, high, `Place pivot ${pivot} into its final partition position`, depthLimit, [pivot], [storeIndex, high], [storeIndex, high])
        };
        return storeIndex;
    }
    function* sort(low, high, depthLimit) {
        const size = high - low + 1;
        if (size <= 1) {
            return;
        }
        if (size <= 16) {
            yield* insertionSortRange(low, high, depthLimit);
            return;
        }
        if (depthLimit === 0) {
            yield* heapSortRange(low, high, depthLimit);
            return;
        }
        const pivotIndex = yield* partition(low, high, depthLimit);
        yield* sort(low, pivotIndex - 1, depthLimit - 1);
        yield* sort(pivotIndex + 1, high, depthLimit - 1);
    }
    yield* sort(0, arr.length - 1, maxDepth);
    yield {
        type: "done",
        array: [...arr],
        memoryUsed: memoryForDepth(0),
        memoryLabel: "Memory",
        memoryUnit: "items",
        workspace: createWorkspace(arr, 0, arr.length - 1, "Quick, heap, and insertion phases are complete", 0)
    };
}

import { Step, WorkspaceState } from "../visualizer/types";

function createWorkspace(
    arr: number[],
    heapSize: number,
    detail: string,
    activeHeapIndices: number[] = [],
    activeSortedIndex?: number
): WorkspaceState {
    const heapView = arr
        .slice(0, heapSize)
        .map(value => value);
    const sortedTail = arr
        .slice(heapSize)
        .map(value => value);

    return {
        title: "Algorithm Workspace",
        detail,
        rows: [
            {
                label: "Heap View",
                values: heapView.length > 0 ? heapView : [null],
                activeIndices: activeHeapIndices.filter(index => index >= 0 && index < heapSize)
            },
            {
                label: "Sorted Tail",
                values: sortedTail.length > 0 ? sortedTail : [null],
                activeIndices: activeSortedIndex === undefined ? [] : [activeSortedIndex - heapSize]
            }
        ]
    };
}

export function* heapSort(input: number[]): Generator<Step> {
    const arr = [...input];
    const n = arr.length;

    if (n === 0) {
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
                    { label: "Heap View", values: [] },
                    { label: "Sorted Tail", values: [] }
                ]
            }
        };
        return;
    }

    function* heapify(length: number, index: number): Generator<Step> {
        let largest = index;
        const left = 2 * index + 1;
        const right = 2 * index + 2;

        if (left < length) {
            yield {
                type: "compare",
                indices: [index, left],
                array: [...arr],
                memoryUsed: 0,
                memoryLabel: "Memory",
                memoryUnit: "items",
                workspace: createWorkspace(
                    arr,
                    length,
                    `Compare parent ${arr[index]} with left child ${arr[left]} while heapifying`,
                    [index, left]
                )
            };

            if (arr[left] > arr[largest]) {
                largest = left;
            }
        }

        if (right < length) {
            yield {
                type: "compare",
                indices: [largest, right],
                array: [...arr],
                memoryUsed: 0,
                memoryLabel: "Memory",
                memoryUnit: "items",
                workspace: createWorkspace(
                    arr,
                    length,
                    `Compare current largest ${arr[largest]} with right child ${arr[right]}`,
                    [largest, right]
                )
            };

            if (arr[right] > arr[largest]) {
                largest = right;
            }
        }

        if (largest !== index) {
            [arr[index], arr[largest]] = [arr[largest], arr[index]];

            yield {
                type: "swap",
                indices: [index, largest],
                array: [...arr],
                memoryUsed: 0,
                memoryLabel: "Memory",
                memoryUnit: "items",
                workspace: createWorkspace(
                    arr,
                    length,
                    `Swap ${arr[largest]} downward and move ${arr[index]} up to restore heap order`,
                    [index, largest]
                )
            };

            yield* heapify(length, largest);
        }
    }

    for (let index = Math.floor(n / 2) - 1; index >= 0; index--) {
        yield* heapify(n, index);
    }

    for (let end = n - 1; end > 0; end--) {
        [arr[0], arr[end]] = [arr[end], arr[0]];

        yield {
            type: "swap",
            indices: [0, end],
            array: [...arr],
            memoryUsed: 0,
            memoryLabel: "Memory",
            memoryUnit: "items",
            workspace: createWorkspace(
                arr,
                end,
                `Move heap maximum ${arr[end]} into sorted position ${end}`,
                [0],
                end
            )
        };

        yield* heapify(end, 0);
    }

    yield {
        type: "done",
        array: [...arr],
        memoryUsed: 0,
        memoryLabel: "Memory",
        memoryUnit: "items",
        workspace: createWorkspace(
            arr,
            0,
            "Heap is empty and the full array is sorted"
        )
    };
}

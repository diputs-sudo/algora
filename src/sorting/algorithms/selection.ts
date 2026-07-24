import { Step } from "../visualizer/types";

export function* selectionSort(input: number[]): Generator<Step> {
    const arr = [...input];
    const n = arr.length;

    for (let start = 0; start < n; start++) {
        let minIndex = start;

        for (let index = start + 1; index < n; index++) {
            yield {
                type: "compare",
                indices: [index, minIndex],
                array: [...arr],
                memoryUsed: 0,
                memoryLabel: "Memory",
                memoryUnit: "items"
            };

            if (arr[index] < arr[minIndex]) {
                minIndex = index;
            }
        }

        if (minIndex !== start) {
            [arr[start], arr[minIndex]] = [arr[minIndex], arr[start]];

            yield {
                type: "swap",
                indices: [start, minIndex],
                array: [...arr],
                memoryUsed: 0,
                memoryLabel: "Memory",
                memoryUnit: "items"
            };
        }
    }

    yield {
        type: "done",
        array: [...arr],
        memoryUsed: 0,
        memoryLabel: "Memory",
        memoryUnit: "items"
    };
}

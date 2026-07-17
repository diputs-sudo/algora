export function* bubbleSort(input) {
    const arr = [...input];
    const n = arr.length;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            yield {
                type: "compare",
                indices: [j, j + 1],
                array: [...arr],
                memoryUsed: 0,
                memoryLabel: "Memory",
                memoryUnit: "items"
            };
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                yield {
                    type: "swap",
                    indices: [j, j + 1],
                    array: [...arr],
                    memoryUsed: 0,
                    memoryLabel: "Memory",
                    memoryUnit: "items"
                };
            }
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

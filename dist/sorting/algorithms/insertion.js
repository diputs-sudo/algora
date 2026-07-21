export function* insertionSort(input) {
    const arr = [...input];
    for (let index = 1; index < arr.length; index++) {
        const key = arr[index];
        let position = index - 1;
        yield {
            type: "compare",
            indices: [index],
            array: [...arr],
            memoryUsed: 0,
            memoryLabel: "Memory",
            memoryUnit: "items"
        };
        while (position >= 0 && arr[position] > key) {
            yield {
                type: "compare",
                indices: [position, position + 1],
                array: [...arr],
                memoryUsed: 0,
                memoryLabel: "Memory",
                memoryUnit: "items"
            };
            arr[position + 1] = arr[position];
            yield {
                type: "swap",
                indices: [position, position + 1],
                array: [...arr],
                memoryUsed: 0,
                memoryLabel: "Memory",
                memoryUnit: "items"
            };
            position -= 1;
        }
        arr[position + 1] = key;
        yield {
            type: "swap",
            indices: [position + 1],
            array: [...arr],
            memoryUsed: 0,
            memoryLabel: "Memory",
            memoryUnit: "items"
        };
    }
    yield {
        type: "done",
        array: [...arr],
        memoryUsed: 0,
        memoryLabel: "Memory",
        memoryUnit: "items"
    };
}

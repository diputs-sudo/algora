export function* shellSort(input) {
    const arr = [...input];
    const n = arr.length;
    let gap = Math.floor(n / 2);
    while (gap > 0) {
        for (let index = gap; index < n; index++) {
            const temp = arr[index];
            let position = index;
            while (position >= gap && arr[position - gap] > temp) {
                yield {
                    type: "compare",
                    indices: [position - gap, position],
                    array: [...arr],
                    memoryUsed: 0,
                    memoryLabel: "Memory",
                    memoryUnit: "items"
                };
                arr[position] = arr[position - gap];
                yield {
                    type: "swap",
                    indices: [position - gap, position],
                    array: [...arr],
                    memoryUsed: 0,
                    memoryLabel: "Memory",
                    memoryUnit: "items"
                };
                position -= gap;
            }
            arr[position] = temp;
            yield {
                type: "swap",
                indices: [position],
                array: [...arr],
                memoryUsed: 0,
                memoryLabel: "Memory",
                memoryUnit: "items"
            };
        }
        gap = Math.floor(gap / 2);
    }
    yield {
        type: "done",
        array: [...arr],
        memoryUsed: 0,
        memoryLabel: "Memory",
        memoryUnit: "items"
    };
}

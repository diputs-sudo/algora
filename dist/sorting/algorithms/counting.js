function buildWorkspace(phase, count, output, filled, activeCountIndex, activeOutputIndex) {
    return {
        title: "Algorithm Workspace",
        detail: phase,
        rows: [
            {
                label: "Count Array",
                values: [...count],
                activeIndices: activeCountIndex === undefined ? [] : [activeCountIndex]
            },
            {
                label: "Output Array",
                values: output.map((value, index) => (filled[index] ? value : null)),
                activeIndices: activeOutputIndex === undefined ? [] : [activeOutputIndex]
            }
        ]
    };
}
export function* countingSort(input) {
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
                    { label: "Count Array", values: [] },
                    { label: "Output Array", values: [] }
                ]
            }
        };
        return;
    }
    const maxValue = Math.max(...arr);
    const count = new Array(maxValue + 1).fill(0);
    const output = new Array(arr.length).fill(0);
    const filled = new Array(arr.length).fill(false);
    for (let index = 0; index < arr.length; index++) {
        const value = arr[index];
        count[value] += 1;
        yield {
            type: "compare",
            indices: [index],
            array: [...arr],
            memoryUsed: count.length + output.length,
            memoryLabel: "Memory",
            memoryUnit: "items",
            workspace: buildWorkspace(`Counting value ${value} at input index ${index}`, count, output, filled, value)
        };
    }
    for (let value = 1; value < count.length; value++) {
        count[value] += count[value - 1];
        yield {
            type: "compare",
            array: [...arr],
            memoryUsed: count.length + output.length,
            memoryLabel: "Memory",
            memoryUnit: "items",
            workspace: buildWorkspace(`Building prefix sums at count index ${value}`, count, output, filled, value)
        };
    }
    for (let index = arr.length - 1; index >= 0; index--) {
        const value = arr[index];
        const outputIndex = count[value] - 1;
        output[outputIndex] = value;
        filled[outputIndex] = true;
        count[value] -= 1;
        const display = arr.map((currentValue, fillIndex) => filled[fillIndex] ? output[fillIndex] : currentValue);
        yield {
            type: "swap",
            indices: [outputIndex],
            array: display,
            memoryUsed: count.length + output.length,
            memoryLabel: "Memory",
            memoryUnit: "items",
            workspace: buildWorkspace(`Writing value ${value} to output index ${outputIndex}`, count, output, filled, value, outputIndex)
        };
    }
    yield {
        type: "done",
        array: [...output],
        memoryUsed: count.length + output.length,
        memoryLabel: "Memory",
        memoryUnit: "items",
        workspace: buildWorkspace("Final sorted output reconstructed from memory", count, output, filled)
    };
}

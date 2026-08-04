function createWorkspace(array, target, index, detail) {
    return {
        title: "Linear Search Workspace",
        detail,
        rows: [
            {
                label: "Scanned",
                values: array.map((value, valueIndex) => valueIndex <= index ? value : null),
                activeIndices: [index]
            },
            {
                label: "Current",
                values: [`index ${index}`, array[index] ?? "-"],
                activeIndices: [0, 1]
            },
            {
                label: "Target",
                values: [target]
            }
        ]
    };
}
export function createLinearSearchInitialStep(array, target) {
    return {
        type: "narrow",
        array,
        target,
        pointers: array.length > 0 ? [{ label: "start", index: 0 }] : [],
        message: "Start at the first item and scan one value at a time.",
        workspace: {
            title: "Linear Search Workspace",
            detail: "Linear Search does not need sorted input. It checks each item until the target is found or the array ends.",
            rows: [
                { label: "Array", values: [...array], activeIndices: array.length > 0 ? [0] : [] },
                { label: "Target", values: [target] }
            ]
        }
    };
}
export function* linearSearch(array, target) {
    for (let index = 0; index < array.length; index++) {
        const value = array[index];
        const probes = index + 1;
        yield {
            type: "inspect",
            array,
            target,
            mid: index,
            pointers: [{ label: "current", index }],
            probes,
            message: `Check index ${index}: compare ${value} with target ${target}.`,
            workspace: createWorkspace(array, target, index, `Compare value ${value} at index ${index} with target ${target}.`)
        };
        if (value === target) {
            yield {
                type: "found",
                array,
                target,
                mid: index,
                pointers: [{ label: "found", index }],
                probes,
                resultIndex: index,
                message: `Target ${target} found at index ${index}.`,
                workspace: createWorkspace(array, target, index, `Found ${target} at index ${index}.`)
            };
            return;
        }
    }
    yield {
        type: "miss",
        array,
        target,
        probes: array.length,
        resultIndex: -1,
        message: `Reached the end of the array. Target ${target} was not found.`,
        workspace: {
            title: "Linear Search Workspace",
            detail: `Every value was checked and none matched ${target}.`,
            rows: [
                { label: "Scanned", values: [...array] },
                { label: "Target", values: [target] }
            ]
        }
    };
}

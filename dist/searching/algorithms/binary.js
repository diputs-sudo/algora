function createWorkspace(array, target, low, mid, high, detail) {
    const activeRange = low <= high ? array.slice(low, high + 1) : [];
    return {
        title: "Binary Search Workspace",
        detail,
        rows: [
            {
                label: "Active Range",
                values: activeRange,
                activeIndices: mid >= low && mid <= high ? [mid - low] : []
            },
            {
                label: "Pointers",
                values: [`low ${low}`, `mid ${mid}`, `high ${high}`],
                activeIndices: [1]
            },
            {
                label: "Target",
                values: [target]
            }
        ]
    };
}
export function createBinarySearchInitialStep(array, target) {
    const high = array.length - 1;
    const mid = array.length > 0 ? Math.floor(high / 2) : undefined;
    return {
        type: "narrow",
        array,
        target,
        low: array.length > 0 ? 0 : undefined,
        mid,
        high: array.length > 0 ? high : undefined,
        resultIndex: undefined,
        message: "Start with the full sorted array. The first probe checks the middle value.",
        workspace: {
            title: "Binary Search Workspace",
            detail: "Binary Search starts with the full sorted array and checks the middle value.",
            rows: [
                { label: "Active Range", values: [...array], activeIndices: mid === undefined ? [] : [mid] },
                { label: "Target", values: [target] }
            ]
        }
    };
}
export function* binarySearch(array, target) {
    let low = 0;
    let high = array.length - 1;
    let probes = 0;
    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const value = array[mid];
        probes += 1;
        yield {
            type: "inspect",
            array,
            target,
            low,
            mid,
            high,
            probes,
            message: `Compare target ${target} with middle value ${value}`,
            workspace: createWorkspace(array, target, low, mid, high, `Compare target ${target} with middle value ${value} at index ${mid}.`)
        };
        if (value === target) {
            yield {
                type: "found",
                array,
                target,
                low,
                mid,
                high,
                probes,
                resultIndex: mid,
                message: `Target ${target} found at index ${mid}`,
                workspace: createWorkspace(array, target, low, mid, high, `Found ${target} at index ${mid}.`)
            };
            return;
        }
        if (value < target) {
            low = mid + 1;
            yield {
                type: "narrow",
                array,
                target,
                low,
                mid: low <= high ? Math.floor((low + high) / 2) : undefined,
                high,
                probes,
                message: `${value} is smaller than ${target}, so discard the left side`,
                workspace: createWorkspace(array, target, low, mid, high, `${value} is smaller than ${target}, so the search continues to the right.`)
            };
        }
        else {
            high = mid - 1;
            yield {
                type: "narrow",
                array,
                target,
                low,
                mid: low <= high ? Math.floor((low + high) / 2) : undefined,
                high,
                probes,
                message: `${value} is larger than ${target}, so discard the right side`,
                workspace: createWorkspace(array, target, low, mid, high, `${value} is larger than ${target}, so the search continues to the left.`)
            };
        }
    }
    yield {
        type: "miss",
        array,
        target,
        low,
        high,
        probes,
        resultIndex: -1,
        message: `Target ${target} is not in the array`,
        workspace: {
            title: "Binary Search Workspace",
            detail: `The active range is empty, so ${target} is not present.`,
            rows: [
                { label: "Final Bounds", values: [`low ${low}`, `high ${high}`] },
                { label: "Target", values: [target] }
            ]
        }
    };
}

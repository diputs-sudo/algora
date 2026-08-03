function getProbePosition(array, target, low, high) {
    if (array[high] === array[low]) {
        return low;
    }
    const ratio = (target - array[low]) / (array[high] - array[low]);
    const position = low + Math.floor(ratio * (high - low));
    return Math.max(low, Math.min(high, position));
}
function createWorkspace(array, target, low, probe, high, detail) {
    const activeRange = low <= high ? array.slice(low, high + 1) : [];
    return {
        title: "Interpolation Search Workspace",
        detail,
        rows: [
            {
                label: "Active Range",
                values: activeRange,
                activeIndices: probe >= low && probe <= high ? [probe - low] : []
            },
            {
                label: "Estimate",
                values: [`low ${low}`, `probe ${probe}`, `high ${high}`],
                activeIndices: [1]
            },
            {
                label: "Values",
                values: [`low ${array[low]}`, `target ${target}`, `high ${array[high]}`],
                activeIndices: [1]
            }
        ]
    };
}
export function createInterpolationSearchInitialStep(array, target) {
    const high = array.length - 1;
    const probe = array.length > 0 ? getProbePosition(array, target, 0, high) : undefined;
    return {
        type: "narrow",
        array,
        target,
        low: array.length > 0 ? 0 : undefined,
        mid: probe,
        high: array.length > 0 ? high : undefined,
        pointers: array.length > 0 && probe !== undefined ? [
            { label: "low", index: 0 },
            { label: "probe", index: probe },
            { label: "high", index: high }
        ] : [],
        message: "Start with the full sorted range. Estimate the probe position from the target's value.",
        workspace: array.length > 0 && probe !== undefined
            ? createWorkspace(array, target, 0, probe, high, "Interpolation Search estimates where the target should be between the low and high values.")
            : {
                title: "Interpolation Search Workspace",
                detail: "There are no values to inspect.",
                rows: [{ label: "Target", values: [target] }]
            }
    };
}
export function* interpolationSearch(array, target) {
    let low = 0;
    let high = array.length - 1;
    let probes = 0;
    while (low <= high && array[low] <= target && target <= array[high]) {
        const probe = getProbePosition(array, target, low, high);
        const value = array[probe];
        probes += 1;
        yield {
            type: "inspect",
            array,
            target,
            low,
            mid: probe,
            high,
            pointers: [
                { label: "low", index: low },
                { label: "probe", index: probe },
                { label: "high", index: high }
            ],
            probes,
            message: `Estimate index ${probe}: compare ${value} with target ${target}.`,
            workspace: createWorkspace(array, target, low, probe, high, `Probe = ${low} + floor(((${target} - ${array[low]}) / (${array[high]} - ${array[low]})) * (${high} - ${low})).`)
        };
        if (value === target) {
            yield {
                type: "found",
                array,
                target,
                low,
                mid: probe,
                high,
                pointers: [{ label: "found", index: probe }],
                probes,
                resultIndex: probe,
                message: `Target ${target} found at estimated index ${probe}.`,
                workspace: createWorkspace(array, target, low, probe, high, `The estimated position contains ${target}.`)
            };
            return;
        }
        if (value < target) {
            low = probe + 1;
            yield {
                type: "narrow",
                array,
                target,
                low,
                high,
                mid: low <= high ? getProbePosition(array, target, low, high) : undefined,
                pointers: low <= high ? [
                    { label: "low", index: low },
                    { label: "high", index: high }
                ] : [],
                probes,
                message: `${value} is smaller than ${target}, so continue to the right of index ${probe}.`,
                workspace: {
                    title: "Interpolation Search Workspace",
                    detail: `Move low to ${low}; values at or before index ${probe} cannot contain ${target}.`,
                    rows: [
                        { label: "New Bounds", values: low <= high ? array.slice(low, high + 1) : [] },
                        { label: "Target", values: [target] }
                    ]
                }
            };
        }
        else {
            high = probe - 1;
            yield {
                type: "narrow",
                array,
                target,
                low,
                high,
                mid: low <= high ? getProbePosition(array, target, low, high) : undefined,
                pointers: low <= high ? [
                    { label: "low", index: low },
                    { label: "high", index: high }
                ] : [],
                probes,
                message: `${value} is larger than ${target}, so continue to the left of index ${probe}.`,
                workspace: {
                    title: "Interpolation Search Workspace",
                    detail: `Move high to ${high}; values at or after index ${probe} cannot contain ${target}.`,
                    rows: [
                        { label: "New Bounds", values: low <= high ? array.slice(low, high + 1) : [] },
                        { label: "Target", values: [target] }
                    ]
                }
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
        message: `Target ${target} is outside the remaining value range or the range is empty.`,
        workspace: {
            title: "Interpolation Search Workspace",
            detail: `The remaining bounds cannot contain ${target}.`,
            rows: [
                { label: "Final Bounds", values: [`low ${low}`, `high ${high}`] },
                { label: "Target", values: [target] }
            ]
        }
    };
}

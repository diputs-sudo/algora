import { InterpolationInsight, SearchStep, SearchWorkspaceState } from "../visualizer/types.js";

function getProbePosition(array: number[], target: number, low: number, high: number): number {
    if (array[high] === array[low]) {
        return low;
    }

    const ratio = (target - array[low]) / (array[high] - array[low]);
    const position = low + Math.floor(ratio * (high - low));

    return Math.max(low, Math.min(high, position));
}

function createInterpolationInsight(
    array: number[],
    target: number,
    low: number,
    probe: number,
    high: number,
    note?: string
): InterpolationInsight | undefined {
    if (low < 0 || high >= array.length || low > high) {
        return undefined;
    }

    const lowValue = array[low];
    const highValue = array[high];
    const valueSpan = highValue - lowValue;
    const valueDistance = target - lowValue;
    const ratio = valueSpan === 0 ? 0 : valueDistance / valueSpan;

    return {
        low,
        probe,
        high,
        lowValue,
        probeValue: array[probe],
        highValue,
        target,
        valueDistance,
        valueSpan,
        ratio,
        indexSpan: high - low,
        note
    };
}

function createWorkspace(
    array: number[],
    target: number,
    low: number,
    probe: number,
    high: number,
    detail: string
): SearchWorkspaceState {
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

export function createInterpolationSearchInitialStep(array: number[], target: number): SearchStep {
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
        interpolation: array.length > 0 && probe !== undefined
            ? createInterpolationInsight(
                array,
                target,
                0,
                probe,
                high,
                "Start with the full value range. The estimate maps the target's value position to the same position in the indices."
            )
            : undefined,
        workspace: array.length > 0 && probe !== undefined
            ? createWorkspace(
                array,
                target,
                0,
                probe,
                high,
                "Interpolation Search estimates where the target should be between the low and high values."
            )
            : {
                title: "Interpolation Search Workspace",
                detail: "There are no values to inspect.",
                rows: [{ label: "Target", values: [target] }]
            }
    };
}

export function* interpolationSearch(array: number[], target: number): Generator<SearchStep> {
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
            interpolation: createInterpolationInsight(
                array,
                target,
                low,
                probe,
                high,
                `Try index ${probe}. The probe value is ${value}.`
            ),
            workspace: createWorkspace(
                array,
                target,
                low,
                probe,
                high,
                `Probe = ${low} + floor(((${target} - ${array[low]}) / (${array[high]} - ${array[low]})) * (${high} - ${low})).`
            )
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
                interpolation: createInterpolationInsight(
                    array,
                    target,
                    low,
                    probe,
                    high,
                    "The estimate landed on the target."
                ),
                workspace: createWorkspace(
                    array,
                    target,
                    low,
                    probe,
                    high,
                    `The estimated position contains ${target}.`
                )
            };
            return;
        }

        if (value < target) {
            low = probe + 1;
            const nextProbe = low <= high ? getProbePosition(array, target, low, high) : undefined;

            yield {
                type: "narrow",
                array,
                target,
                low,
                high,
                mid: nextProbe,
                pointers: low <= high ? [
                    { label: "low", index: low },
                    { label: "high", index: high }
                ] : [],
                probes,
                message: `${value} is smaller than ${target}, so continue to the right of index ${probe}.`,
                interpolation: nextProbe !== undefined
                    ? createInterpolationInsight(
                        array,
                        target,
                        low,
                        nextProbe,
                        high,
                        `The probe was too low. Discard everything before index ${low}. New value range: ${array[low]} -> ${array[high]}.`
                    )
                    : undefined,
                workspace: {
                    title: "Interpolation Search Workspace",
                    detail: `Move low to ${low}; values at or before index ${probe} cannot contain ${target}.`,
                    rows: [
                        { label: "New Bounds", values: low <= high ? array.slice(low, high + 1) : [] },
                        { label: "Target", values: [target] }
                    ]
                }
            };
        } else {
            high = probe - 1;
            const nextProbe = low <= high ? getProbePosition(array, target, low, high) : undefined;

            yield {
                type: "narrow",
                array,
                target,
                low,
                high,
                mid: nextProbe,
                pointers: low <= high ? [
                    { label: "low", index: low },
                    { label: "high", index: high }
                ] : [],
                probes,
                message: `${value} is larger than ${target}, so continue to the left of index ${probe}.`,
                interpolation: nextProbe !== undefined
                    ? createInterpolationInsight(
                        array,
                        target,
                        low,
                        nextProbe,
                        high,
                        `The probe was too high. Discard everything after index ${high}. New value range: ${array[low]} -> ${array[high]}.`
                    )
                    : undefined,
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

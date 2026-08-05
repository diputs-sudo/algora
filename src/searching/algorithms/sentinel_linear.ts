import { SearchStep, SearchWorkspaceState, SentinelLinearInsight } from "../visualizer/types.js";

function createWorkspace(
    workingArray: number[],
    target: number,
    index: number,
    originalLast: number,
    detail: string
): SearchWorkspaceState {
    const lastIndex = workingArray.length - 1;

    return {
        title: "Sentinel Linear Search Workspace",
        detail,
        rows: [
            {
                label: "Working Array",
                values: workingArray,
                activeIndices: [index]
            },
            {
                label: "Sentinel",
                values: [`index ${lastIndex}`, `saved last ${originalLast}`],
                activeIndices: [0]
            },
            {
                label: "Target",
                values: [target]
            }
        ]
    };
}

function createSentinelInsight(
    phase: SentinelLinearInsight["phase"],
    current: number,
    sentinelIndex: number,
    savedLast: number,
    note: string,
    workingValue?: number,
    comparison?: string,
    decisionText?: string
): SentinelLinearInsight {
    return {
        phase,
        current,
        sentinelIndex,
        savedLast,
        workingValue,
        comparison,
        decisionText: decisionText ?? "The sentinel guarantees the scan stops; the saved last value verifies whether the match was real.",
        note
    };
}

export function createSentinelLinearSearchInitialStep(array: number[], target: number): SearchStep {
    if (array.length === 0) {
        return {
            type: "miss",
            array,
            target,
            resultIndex: -1,
            message: "The array is empty, so no sentinel can be placed.",
            workspace: {
                title: "Sentinel Linear Search Workspace",
                detail: "There are no values to inspect.",
                rows: [{ label: "Target", values: [target] }]
            }
        };
    }

    const workingArray = [...array];
    const lastIndex = workingArray.length - 1;
    const originalLast = workingArray[lastIndex];
    workingArray[lastIndex] = target;

    return {
        type: "narrow",
        array: workingArray,
        target,
        pointers: [
            { label: "start", index: 0 },
            { label: "sentinel", index: lastIndex }
        ],
        message: `Save the last value ${originalLast}, then place target ${target} at the last index as a sentinel.`,
        sentinelLinear: createSentinelInsight(
            "place",
            0,
            lastIndex,
            originalLast,
            "The last slot now temporarily contains the target, so the loop can stop without a boundary check.",
            workingArray[0],
            `saved ${originalLast}`,
            `Replace index ${lastIndex} with ${target}, but remember the original value.`
        ),
        workspace: createWorkspace(
            workingArray,
            target,
            0,
            originalLast,
            "The sentinel guarantees the scan will stop without checking the array boundary on every step."
        )
    };
}

export function* sentinelLinearSearch(array: number[], target: number): Generator<SearchStep> {
    if (array.length === 0) {
        yield createSentinelLinearSearchInitialStep(array, target);
        return;
    }

    const workingArray = [...array];
    const lastIndex = workingArray.length - 1;
    const originalLast = workingArray[lastIndex];
    workingArray[lastIndex] = target;

    let index = 0;
    let probes = 0;

    while (true) {
        const value = workingArray[index];
        probes += 1;

        yield {
            type: "inspect",
            array: workingArray,
            target,
            mid: index,
            pointers: [
                { label: "current", index },
                { label: "sentinel", index: lastIndex }
            ],
            probes,
            message: `Check index ${index}: compare ${value} with target ${target}.`,
            sentinelLinear: createSentinelInsight(
                "scan",
                index,
                lastIndex,
                originalLast,
                "The scan only checks value equality; the temporary sentinel is the guaranteed stopping point.",
                value,
                `${value} ? ${target}`,
                value === target ? "The scan stops here." : "Not a match yet, so move to the next index."
            ),
            workspace: createWorkspace(
                workingArray,
                target,
                index,
                originalLast,
                `The loop only asks whether the current value equals ${target}; the sentinel handles the stopping point.`
            )
        };

        if (value === target) {
            break;
        }

        index += 1;
    }

    if (index < lastIndex || originalLast === target) {
        yield {
            type: "found",
            array: workingArray,
            target,
            mid: index,
            pointers: [{ label: "found", index }],
            probes,
            resultIndex: index,
            message: `Target ${target} found at index ${index}.`,
            sentinelLinear: createSentinelInsight(
                index === lastIndex ? "verify" : "found",
                index,
                lastIndex,
                originalLast,
                index === lastIndex
                    ? "The scan stopped at the sentinel slot, so the saved last value must be checked."
                    : "The match happened before the sentinel slot, so it is definitely real.",
                workingArray[index],
                index === lastIndex ? `${originalLast} = ${target}` : `${workingArray[index]} = ${target}`,
                index === lastIndex
                    ? `The saved last value equals ${target}, so the last slot was a real match.`
                    : `Return index ${index}.`
            ),
            workspace: createWorkspace(
                workingArray,
                target,
                index,
                originalLast,
                index === lastIndex
                    ? `The sentinel position was also a real match because the saved last value was ${target}.`
                    : `The match happened before the sentinel position, so it is a real array value.`
            )
        };
        return;
    }

    yield {
        type: "miss",
        array: workingArray,
        target,
        mid: lastIndex,
        pointers: [{ label: "sentinel", index: lastIndex }],
        probes,
        resultIndex: -1,
        message: `The scan stopped at the sentinel, but the saved last value was ${originalLast}. Target ${target} was not found.`,
        sentinelLinear: createSentinelInsight(
            "miss",
            lastIndex,
            lastIndex,
            originalLast,
            "The scan only matched the temporary sentinel, not a real original value.",
            workingArray[lastIndex],
            `${originalLast} != ${target}`,
            `Restore ${originalLast}; ${target} was not present.`
        ),
        workspace: {
            title: "Sentinel Linear Search Workspace",
            detail: "The only match was the temporary sentinel, so the target was not present in the original array.",
            rows: [
                { label: "Saved Last", values: [originalLast] },
                { label: "Target", values: [target] }
            ]
        }
    };
}

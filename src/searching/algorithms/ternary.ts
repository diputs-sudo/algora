import { SearchStep, SearchWorkspaceState } from "../visualizer/types.js";

function createWorkspace(
    array: number[],
    target: number,
    left: number,
    mid1: number,
    mid2: number,
    right: number,
    detail: string
): SearchWorkspaceState {
    const activeRange = left <= right ? array.slice(left, right + 1) : [];

    return {
        title: "Ternary Search Workspace",
        detail,
        rows: [
            {
                label: "Active Range",
                values: activeRange,
                activeIndices: [mid1 - left, mid2 - left].filter(index => index >= 0 && index < activeRange.length)
            },
            {
                label: "Split Points",
                values: [`left ${left}`, `mid1 ${mid1}`, `mid2 ${mid2}`, `right ${right}`],
                activeIndices: [1, 2]
            },
            {
                label: "Target",
                values: [target]
            }
        ]
    };
}

function getSplitPoints(left: number, right: number): [number, number] {
    const third = Math.floor((right - left) / 3);

    return [left + third, right - third];
}

export function createTernarySearchInitialStep(array: number[], target: number): SearchStep {
    const right = array.length - 1;
    const [mid1, mid2] = array.length > 0 ? getSplitPoints(0, right) : [undefined, undefined];

    return {
        type: "narrow",
        array,
        target,
        low: array.length > 0 ? 0 : undefined,
        mid: mid1,
        high: array.length > 0 ? right : undefined,
        highlightIndices: mid1 === undefined || mid2 === undefined ? [] : [mid1, mid2],
        pointers: array.length > 0 && mid1 !== undefined && mid2 !== undefined ? [
            { label: "left", index: 0 },
            { label: "mid1", index: mid1 },
            { label: "mid2", index: mid2 },
            { label: "right", index: right }
        ] : [],
        message: "Start with the full sorted array and split the active range into three parts.",
        workspace: array.length > 0 && mid1 !== undefined && mid2 !== undefined
            ? createWorkspace(
                array,
                target,
                0,
                mid1,
                mid2,
                right,
                "Ternary Search compares the target against two split points before choosing one third to keep."
            )
            : {
                title: "Ternary Search Workspace",
                detail: "There are no values to inspect.",
                rows: [{ label: "Target", values: [target] }]
            }
    };
}

export function* ternarySearch(array: number[], target: number): Generator<SearchStep> {
    let left = 0;
    let right = array.length - 1;
    let probes = 0;

    while (left <= right) {
        const [mid1, mid2] = getSplitPoints(left, right);
        probes += 2;

        yield {
            type: "inspect",
            array,
            target,
            low: left,
            mid: mid1,
            high: right,
            highlightIndices: [mid1, mid2],
            pointers: [
                { label: "left", index: left },
                { label: "mid1", index: mid1 },
                { label: "mid2", index: mid2 },
                { label: "right", index: right }
            ],
            probes,
            message: `Compare target ${target} with ${array[mid1]} at mid1 and ${array[mid2]} at mid2.`,
            workspace: createWorkspace(
                array,
                target,
                left,
                mid1,
                mid2,
                right,
                `The split points are index ${mid1} and index ${mid2}.`
            )
        };

        if (array[mid1] === target) {
            yield {
                type: "found",
                array,
                target,
                low: left,
                mid: mid1,
                high: right,
                pointers: [{ label: "found", index: mid1 }],
                probes,
                resultIndex: mid1,
                message: `Target ${target} found at mid1 index ${mid1}.`,
                workspace: createWorkspace(array, target, left, mid1, mid2, right, `Found ${target} at mid1.`)
            };
            return;
        }

        if (array[mid2] === target) {
            yield {
                type: "found",
                array,
                target,
                low: left,
                mid: mid2,
                high: right,
                pointers: [{ label: "found", index: mid2 }],
                probes,
                resultIndex: mid2,
                message: `Target ${target} found at mid2 index ${mid2}.`,
                workspace: createWorkspace(array, target, left, mid1, mid2, right, `Found ${target} at mid2.`)
            };
            return;
        }

        if (target < array[mid1]) {
            right = mid1 - 1;
        } else if (target > array[mid2]) {
            left = mid2 + 1;
        } else {
            left = mid1 + 1;
            right = mid2 - 1;
        }

        if (left <= right) {
            const [nextMid1, nextMid2] = getSplitPoints(left, right);

            yield {
                type: "narrow",
                array,
                target,
                low: left,
                mid: nextMid1,
                high: right,
                highlightIndices: [nextMid1, nextMid2],
                pointers: [
                    { label: "left", index: left },
                    { label: "mid1", index: nextMid1 },
                    { label: "mid2", index: nextMid2 },
                    { label: "right", index: right }
                ],
                probes,
                message: `Keep the remaining range from index ${left} to ${right}.`,
                workspace: createWorkspace(
                    array,
                    target,
                    left,
                    nextMid1,
                    nextMid2,
                    right,
                    "Discard the thirds that cannot contain the target."
                )
            };
        }
    }

    yield {
        type: "miss",
        array,
        target,
        low: left,
        high: right,
        probes,
        resultIndex: -1,
        message: `Target ${target} is not in the array.`,
        workspace: {
            title: "Ternary Search Workspace",
            detail: "The active range is empty.",
            rows: [
                { label: "Final Bounds", values: [`left ${left}`, `right ${right}`] },
                { label: "Target", values: [target] }
            ]
        }
    };
}

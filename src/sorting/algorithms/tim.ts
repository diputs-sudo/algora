import { Step, WorkspaceState } from "../visualizer/types";

const MIN_RUN = 5;

function createWorkspace(
    runs: Array<Array<number | null>>,
    merged: Array<number | null>,
    detail: string,
    runHighlights: Record<number, number[]> = {},
    mergedHighlights: number[] = []
): WorkspaceState {
    return {
        title: "Algorithm Workspace",
        detail,
        rows: [
            ...runs.map((run, index) => ({
                label: `Run ${index}`,
                values: run.length > 0 ? run : [null],
                activeIndices: runHighlights[index] ?? []
            })),
            {
                label: "Merged",
                values: merged,
                activeIndices: mergedHighlights
            }
        ]
    };
}

export function* timSort(input: number[]): Generator<Step> {
    const arr = [...input];
    const n = arr.length;

    if (n === 0) {
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
                    { label: "Run 0", values: [] },
                    { label: "Merged", values: [] }
                ]
            }
        };
        return;
    }

    const display = [...arr];
    let finalWorkspace = createWorkspace(
        snapshotPlaceholder(n),
        new Array<number | null>(n).fill(null),
        "Preparing Tim Sort runs"
    );

    function snapshotPlaceholder(length: number): Array<Array<number | null>> {
        return [new Array<number | null>(Math.max(length, 1)).fill(null)];
    }

    function snapshotRuns(size: number): Array<Array<number | null>> {
        const runs: Array<Array<number | null>> = [];

        for (let start = 0; start < n; start += size) {
            runs.push(arr.slice(start, Math.min(start + size, n)));
        }

        return runs;
    }

    function getRunIndex(start: number, size: number): number {
        return Math.floor(start / size);
    }

    function* insertionSortRun(start: number, end: number): Generator<Step> {
        const runIndex = getRunIndex(start, MIN_RUN);

        for (let index = start + 1; index < end; index++) {
            const key = arr[index];
            let position = index - 1;

            while (position >= start && arr[position] > key) {
                yield {
                    type: "compare",
                    indices: [position, position + 1],
                    array: [...display],
                    memoryUsed: MIN_RUN,
                    memoryLabel: "Memory",
                    memoryUnit: "items",
                    workspace: finalWorkspace = createWorkspace(
                        snapshotRuns(MIN_RUN),
                        new Array(n).fill(null),
                        `Insertion-sort the current run from index ${start} to ${end - 1}`,
                        { [runIndex]: [position - start, position + 1 - start] }
                    )
                };

                arr[position + 1] = arr[position];
                display[position + 1] = arr[position + 1];

                yield {
                    type: "swap",
                    indices: [position, position + 1],
                    array: [...display],
                    memoryUsed: MIN_RUN,
                    memoryLabel: "Memory",
                    memoryUnit: "items",
                    workspace: finalWorkspace = createWorkspace(
                        snapshotRuns(MIN_RUN),
                        new Array(n).fill(null),
                        `Shift ${arr[position + 1]} right inside the current run`,
                        { [runIndex]: [position - start, position + 1 - start] }
                    )
                };

                position -= 1;
            }

            arr[position + 1] = key;
            display[position + 1] = key;

            yield {
                type: "swap",
                indices: [position + 1],
                array: [...display],
                memoryUsed: MIN_RUN,
                memoryLabel: "Memory",
                memoryUnit: "items",
                workspace: finalWorkspace = createWorkspace(
                    snapshotRuns(MIN_RUN),
                    new Array(n).fill(null),
                    `Insert ${key} into its run in sorted order`,
                    { [runIndex]: [position + 1 - start] }
                )
            };
        }
    }

    function mergeSlices(left: number[], right: number[]): number[] {
        const merged: number[] = [];
        let leftIndex = 0;
        let rightIndex = 0;

        while (leftIndex < left.length && rightIndex < right.length) {
            if (left[leftIndex] <= right[rightIndex]) {
                merged.push(left[leftIndex++]);
            } else {
                merged.push(right[rightIndex++]);
            }
        }

        merged.push(...left.slice(leftIndex));
        merged.push(...right.slice(rightIndex));
        return merged;
    }

    for (let start = 0; start < n; start += MIN_RUN) {
        const end = Math.min(start + MIN_RUN, n);
        yield* insertionSortRun(start, end);
    }

    let size = MIN_RUN;

    while (size < n) {
        for (let left = 0; left < n; left += 2 * size) {
            const mid = Math.min(left + size, n);
            const right = Math.min(left + 2 * size, n);

            const leftSlice = arr.slice(left, mid);
            const rightSlice = arr.slice(mid, right);
            const merged = mergeSlices(leftSlice, rightSlice);
            const mergedRow = new Array<number | null>(n).fill(null);
            const leftRunIndex = getRunIndex(left, size);
            const rightRunIndex = getRunIndex(mid, size);

            for (let index = 0; index < merged.length; index++) {
                arr[left + index] = merged[index];
                display[left + index] = merged[index];
                mergedRow[left + index] = merged[index];

                yield {
                    type: "swap",
                    indices: [left + index],
                    array: [...display],
                    memoryUsed: leftSlice.length + rightSlice.length,
                    memoryLabel: "Memory",
                    memoryUnit: "items",
                    workspace: finalWorkspace = createWorkspace(
                        snapshotRuns(size),
                        mergedRow,
                        `Merge runs of size ${size} into a larger sorted block`,
                        {
                            [leftRunIndex]: leftSlice.map((_, itemIndex) => itemIndex),
                            [rightRunIndex]: rightSlice.map((_, itemIndex) => itemIndex)
                        },
                        [left + index]
                    )
                };
            }
        }

        size *= 2;
    }

    yield {
        type: "done",
        array: [...arr],
        memoryUsed: n,
        memoryLabel: "Memory",
        memoryUnit: "items",
        workspace: createWorkspace(
            snapshotRuns(Math.max(size / 2, MIN_RUN)),
            [...arr],
            "All runs have been merged into the final sorted output"
        )
    };
}

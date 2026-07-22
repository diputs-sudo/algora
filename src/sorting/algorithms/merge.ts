import { Step, WorkspaceState } from "../visualizer/types";

function createWorkspace(
    left: Array<number | null>,
    right: Array<number | null>,
    merged: Array<number | null>,
    detail: string,
    activeLeft?: number,
    activeRight?: number,
    activeMerged?: number
): WorkspaceState {
    return {
        title: "Algorithm Workspace",
        detail,
        rows: [
            {
                label: "Left Half",
                values: left,
                activeIndices: activeLeft === undefined ? [] : [activeLeft]
            },
            {
                label: "Right Half",
                values: right,
                activeIndices: activeRight === undefined ? [] : [activeRight]
            },
            {
                label: "Merged",
                values: merged,
                activeIndices: activeMerged === undefined ? [] : [activeMerged]
            }
        ]
    };
}

export function* mergeSort(input: number[]): Generator<Step> {
    const arr = [...input];
    const display = [...input];

    function* sort(low: number, high: number): Generator<Step> {
        if (low >= high) {
            return;
        }

        const mid = Math.floor((low + high) / 2);

        yield* sort(low, mid);
        yield* sort(mid + 1, high);
        yield* merge(low, mid, high);
    }

    function* merge(low: number, mid: number, high: number): Generator<Step> {
        const left = arr.slice(low, mid + 1);
        const right = arr.slice(mid + 1, high + 1);
        const merged = new Array<number | null>(high - low + 1).fill(null);

        let leftIndex = 0;
        let rightIndex = 0;
        let writeIndex = low;

        while (leftIndex < left.length && rightIndex < right.length) {
            yield {
                type: "compare",
                indices: [low + leftIndex, mid + 1 + rightIndex],
                array: [...display],
                memoryUsed: left.length + right.length,
                memoryLabel: "Memory",
                memoryUnit: "items",
                workspace: createWorkspace(
                    [...left],
                    [...right],
                    [...merged],
                    `Compare ${left[leftIndex]} and ${right[rightIndex]} while merging`,
                    leftIndex,
                    rightIndex
                )
            };

            if (left[leftIndex] <= right[rightIndex]) {
                arr[writeIndex] = left[leftIndex];
                merged[writeIndex - low] = left[leftIndex];
                display[writeIndex] = left[leftIndex];
                leftIndex += 1;
            } else {
                arr[writeIndex] = right[rightIndex];
                merged[writeIndex - low] = right[rightIndex];
                display[writeIndex] = right[rightIndex];
                rightIndex += 1;
            }

            yield {
                type: "swap",
                indices: [writeIndex],
                array: [...display],
                memoryUsed: left.length + right.length,
                memoryLabel: "Memory",
                memoryUnit: "items",
                workspace: createWorkspace(
                    [...left],
                    [...right],
                    [...merged],
                    `Write the next smallest value into position ${writeIndex}`,
                    leftIndex < left.length ? leftIndex : undefined,
                    rightIndex < right.length ? rightIndex : undefined,
                    writeIndex - low
                )
            };

            writeIndex += 1;
        }

        while (leftIndex < left.length) {
            arr[writeIndex] = left[leftIndex];
            merged[writeIndex - low] = left[leftIndex];
            display[writeIndex] = left[leftIndex];

            yield {
                type: "swap",
                indices: [writeIndex],
                array: [...display],
                memoryUsed: left.length + right.length,
                memoryLabel: "Memory",
                memoryUnit: "items",
                workspace: createWorkspace(
                    [...left],
                    [...right],
                    [...merged],
                    `Copy remaining left value ${left[leftIndex]} into position ${writeIndex}`,
                    leftIndex,
                    undefined,
                    writeIndex - low
                )
            };

            leftIndex += 1;
            writeIndex += 1;
        }

        while (rightIndex < right.length) {
            arr[writeIndex] = right[rightIndex];
            merged[writeIndex - low] = right[rightIndex];
            display[writeIndex] = right[rightIndex];

            yield {
                type: "swap",
                indices: [writeIndex],
                array: [...display],
                memoryUsed: left.length + right.length,
                memoryLabel: "Memory",
                memoryUnit: "items",
                workspace: createWorkspace(
                    [...left],
                    [...right],
                    [...merged],
                    `Copy remaining right value ${right[rightIndex]} into position ${writeIndex}`,
                    undefined,
                    rightIndex,
                    writeIndex - low
                )
            };

            rightIndex += 1;
            writeIndex += 1;
        }
    }

    yield* sort(0, arr.length - 1);

    yield {
        type: "done",
        array: [...arr],
        memoryUsed: arr.length,
        memoryLabel: "Memory",
        memoryUnit: "items",
        workspace: {
            title: "Algorithm Workspace",
            detail: "All merges are complete",
            rows: [
                { label: "Left Half", values: [] },
                { label: "Right Half", values: [] },
                { label: "Merged", values: [...arr] }
            ]
        }
    };
}

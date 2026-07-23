import { Step, WorkspaceState } from "../visualizer/types";

function createWorkspace(
    buckets: number[][],
    output: Array<number | null>,
    exp: number,
    detail: string,
    activeBucket?: number
): WorkspaceState {
    return {
        title: "Algorithm Workspace",
        detail: `${detail} (digit place ${exp})`,
        rows: [
            ...buckets.map((bucket, index) => ({
                label: `Bucket ${index}`,
                values: bucket.length > 0 ? [...bucket] : [null],
                activeIndices: activeBucket === index ? bucket.map((_, bucketIndex) => bucketIndex) : []
            })),
            {
                label: "Collected",
                values: [...output]
            }
        ]
    };
}

export function* radixSort(input: number[]): Generator<Step> {
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
                    { label: "Bucket 0", values: [] },
                    { label: "Collected", values: [] }
                ]
            }
        };
        return;
    }

    const maxNumber = Math.max(...arr);
    let exp = 1;
    let lastBuckets = Array.from({ length: 10 }, () => [] as number[]);
    let lastOutput = arr.map(value => value as number | null);
    let lastExp = 1;

    while (Math.floor(maxNumber / exp) > 0) {
        const buckets = Array.from({ length: 10 }, () => [] as number[]);
        const output = new Array<number | null>(arr.length).fill(null);
        lastBuckets = buckets;
        lastOutput = output;
        lastExp = exp;

        for (let index = 0; index < arr.length; index++) {
            const value = arr[index];
            const digit = Math.floor(value / exp) % 10;
            buckets[digit].push(value);

            yield {
                type: "compare",
                indices: [index],
                array: [...arr],
                memoryUsed: arr.length + 10,
                memoryLabel: "Memory",
                memoryUnit: "items",
                workspace: createWorkspace(
                    buckets,
                    output,
                    exp,
                    `Place ${value} into bucket ${digit}`,
                    digit
                )
            };
        }

        let writeIndex = 0;

        for (let bucketIndex = 0; bucketIndex < buckets.length; bucketIndex++) {
            const bucket = buckets[bucketIndex];

            for (const value of bucket) {
                output[writeIndex] = value;
                arr[writeIndex] = value;

                yield {
                    type: "swap",
                    indices: [writeIndex],
                    array: [...arr],
                    memoryUsed: arr.length + 10,
                    memoryLabel: "Memory",
                    memoryUnit: "items",
                    workspace: createWorkspace(
                        buckets,
                        output,
                        exp,
                        `Collect ${value} from bucket ${bucketIndex} into position ${writeIndex}`,
                        bucketIndex
                    )
                };

                writeIndex += 1;
            }
        }

        lastBuckets = buckets.map(bucket => [...bucket]);
        lastOutput = [...output];
        lastExp = exp;

        exp *= 10;
    }

    yield {
        type: "done",
        array: [...arr],
        memoryUsed: arr.length + 10,
        memoryLabel: "Memory",
        memoryUnit: "items",
        workspace: createWorkspace(
            lastBuckets,
            lastOutput,
            lastExp,
            "All digit passes are complete"
        )
    };
}

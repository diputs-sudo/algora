const BUCKET_SIZE = 5;
function createWorkspace(buckets, output, detail, activeBucket) {
    return {
        title: "Algorithm Workspace",
        detail,
        rows: [
            ...buckets.map((bucket, index) => ({
                label: `Bucket ${index}`,
                values: bucket.length > 0 ? [...bucket] : [null],
                activeIndices: activeBucket === index ? bucket.map((_, bucketIndex) => bucketIndex) : []
            })),
            {
                label: "Output",
                values: [...output]
            }
        ]
    };
}
export function* bucketSort(input) {
    const arr = [...input];
    if (arr.length === 0) {
        yield {
            type: "done",
            array: [],
            memoryUsed: 0,
            memoryLabel: "Memory",
            memoryUnit: "items"
        };
        return;
    }
    const minValue = Math.min(...arr);
    const maxValue = Math.max(...arr);
    const bucketCount = Math.floor((maxValue - minValue) / BUCKET_SIZE) + 1;
    const buckets = Array.from({ length: bucketCount }, () => []);
    const output = new Array(arr.length).fill(null);
    const display = [...arr];
    for (let index = 0; index < arr.length; index++) {
        const value = arr[index];
        const bucketIndex = Math.floor((value - minValue) / BUCKET_SIZE);
        buckets[bucketIndex].push(value);
        yield {
            type: "compare",
            indices: [index],
            array: [...display],
            memoryUsed: bucketCount + arr.length,
            memoryLabel: "Memory",
            memoryUnit: "items",
            workspace: createWorkspace(buckets, output, `Place ${value} into bucket ${bucketIndex}`, bucketIndex)
        };
    }
    let outputIndex = 0;
    for (let bucketIndex = 0; bucketIndex < buckets.length; bucketIndex++) {
        const bucket = buckets[bucketIndex];
        bucket.sort((left, right) => left - right);
        yield {
            type: "compare",
            array: [...display],
            memoryUsed: bucketCount + arr.length,
            memoryLabel: "Memory",
            memoryUnit: "items",
            workspace: createWorkspace(buckets, output, `Sort the values inside bucket ${bucketIndex}`, bucketIndex)
        };
        for (const value of bucket) {
            output[outputIndex] = value;
            display[outputIndex] = value;
            yield {
                type: "swap",
                indices: [outputIndex],
                array: [...display],
                memoryUsed: bucketCount + arr.length,
                memoryLabel: "Memory",
                memoryUnit: "items",
                workspace: createWorkspace(buckets, output, `Write ${value} from bucket ${bucketIndex} into output position ${outputIndex}`, bucketIndex)
            };
            outputIndex += 1;
        }
    }
    yield {
        type: "done",
        array: [...display],
        memoryUsed: bucketCount + arr.length,
        memoryLabel: "Memory",
        memoryUnit: "items",
        workspace: createWorkspace(buckets, output, "All buckets have been merged into the final sorted output")
    };
}

import { SearchStep, SearchWorkspaceState } from "../visualizer/types.js";

function createWorkspace(
    array: number[],
    target: number,
    offset: number,
    index: number,
    fibM: number,
    fibMm1: number,
    fibMm2: number,
    detail: string
): SearchWorkspaceState {
    const activeStart = Math.max(offset + 1, 0);
    const activeEnd = Math.min(offset + fibM, array.length - 1);

    return {
        title: "Fibonacci Search Workspace",
        detail,
        rows: [
            {
                label: "Active Window",
                values: activeStart <= activeEnd ? array.slice(activeStart, activeEnd + 1) : [],
                activeIndices: index >= activeStart && index <= activeEnd ? [index - activeStart] : []
            },
            {
                label: "Fibonacci",
                values: [`F ${fibM}`, `F-1 ${fibMm1}`, `F-2 ${fibMm2}`],
                activeIndices: [0]
            },
            {
                label: "Probe",
                values: [`offset ${offset}`, `index ${index}`, `target ${target}`],
                activeIndices: [1]
            }
        ]
    };
}

function createFibonacciNumbers(length: number): [number, number, number] {
    let fibMm2 = 0;
    let fibMm1 = 1;
    let fibM = fibMm2 + fibMm1;

    while (fibM < length) {
        fibMm2 = fibMm1;
        fibMm1 = fibM;
        fibM = fibMm2 + fibMm1;
    }

    return [fibM, fibMm1, fibMm2];
}

export function createFibonacciSearchInitialStep(array: number[], target: number): SearchStep {
    const [fibM, fibMm1, fibMm2] = createFibonacciNumbers(array.length);
    const index = array.length > 0 ? Math.max(0, Math.min(fibMm2 - 1, array.length - 1)) : undefined;

    return {
        type: "narrow",
        array,
        target,
        low: array.length > 0 ? 0 : undefined,
        mid: index,
        high: array.length > 0 ? array.length - 1 : undefined,
        pointers: array.length > 0 && index !== undefined ? [
            { label: "offset", index: 0 },
            { label: "fib", index }
        ] : [],
        message: `Build the smallest Fibonacci number at least the array length. Here F is ${fibM}.`,
        workspace: array.length > 0 && index !== undefined
            ? createWorkspace(
                array,
                target,
                -1,
                index,
                fibM,
                fibMm1,
                fibMm2,
                "Fibonacci Search probes by offset plus the F-2 number, then shrinks the Fibonacci window."
            )
            : {
                title: "Fibonacci Search Workspace",
                detail: "There are no values to inspect.",
                rows: [{ label: "Target", values: [target] }]
            }
    };
}

export function* fibonacciSearch(array: number[], target: number): Generator<SearchStep> {
    const length = array.length;
    let [fibM, fibMm1, fibMm2] = createFibonacciNumbers(length);
    let offset = -1;
    let probes = 0;

    if (length === 0) {
        yield {
            type: "miss",
            array,
            target,
            probes,
            resultIndex: -1,
            message: "The array is empty, so the target cannot be found.",
            workspace: {
                title: "Fibonacci Search Workspace",
                detail: "There are no values to inspect.",
                rows: [{ label: "Target", values: [target] }]
            }
        };
        return;
    }

    while (fibM > 1) {
        const index = Math.min(offset + fibMm2, length - 1);
        const value = array[index];
        probes += 1;

        yield {
            type: "inspect",
            array,
            target,
            low: Math.max(offset + 1, 0),
            mid: index,
            high: Math.min(offset + fibM, length - 1),
            pointers: [
                { label: "offset", index: Math.max(offset, 0) },
                { label: "fib", index }
            ],
            probes,
            message: `Probe index ${index}: compare ${value} with target ${target}.`,
            workspace: createWorkspace(
                array,
                target,
                offset,
                index,
                fibM,
                fibMm1,
                fibMm2,
                `Use index = min(offset + F-2, n - 1) = ${index}.`
            )
        };

        if (value === target) {
            yield {
                type: "found",
                array,
                target,
                low: Math.max(offset + 1, 0),
                mid: index,
                high: Math.min(offset + fibM, length - 1),
                pointers: [{ label: "found", index }],
                probes,
                resultIndex: index,
                message: `Target ${target} found at index ${index}.`,
                workspace: createWorkspace(
                    array,
                    target,
                    offset,
                    index,
                    fibM,
                    fibMm1,
                    fibMm2,
                    `Found ${target} at the Fibonacci probe index.`
                )
            };
            return;
        }

        if (value < target) {
            fibM = fibMm1;
            fibMm1 = fibMm2;
            fibMm2 = fibM - fibMm1;
            offset = index;

            yield {
                type: "narrow",
                array,
                target,
                low: Math.max(offset + 1, 0),
                high: Math.min(offset + fibM, length - 1),
                probes,
                pointers: [
                    { label: "offset", index: offset },
                    { label: "fib", index: Math.min(offset + fibMm2, length - 1) }
                ],
                message: `${value} is smaller than ${target}, so discard values through index ${index}.`,
                workspace: createWorkspace(
                    array,
                    target,
                    offset,
                    Math.min(offset + fibMm2, length - 1),
                    fibM,
                    fibMm1,
                    fibMm2,
                    `Move the offset to ${offset} and shift the Fibonacci window right.`
                )
            };
        } else {
            fibM = fibMm2;
            fibMm1 = fibMm1 - fibMm2;
            fibMm2 = fibM - fibMm1;

            yield {
                type: "narrow",
                array,
                target,
                low: Math.max(offset + 1, 0),
                high: Math.min(offset + fibM, length - 1),
                probes,
                pointers: fibM > 1 ? [
                    { label: "offset", index: Math.max(offset, 0) },
                    { label: "fib", index: Math.min(offset + fibMm2, length - 1) }
                ] : [{ label: "offset", index: Math.max(offset, 0) }],
                message: `${value} is larger than ${target}, so shrink the window to the left.`,
                workspace: createWorkspace(
                    array,
                    target,
                    offset,
                    Math.min(offset + Math.max(fibMm2, 0), length - 1),
                    fibM,
                    fibMm1,
                    fibMm2,
                    "Drop down two Fibonacci sizes to keep the left portion."
                )
            };
        }
    }

    const finalIndex = offset + 1;

    if (fibMm1 === 1 && finalIndex < length) {
        probes += 1;

        yield {
            type: "inspect",
            array,
            target,
            low: finalIndex,
            mid: finalIndex,
            high: finalIndex,
            pointers: [{ label: "final", index: finalIndex }],
            probes,
            message: `Final check at index ${finalIndex}: compare ${array[finalIndex]} with target ${target}.`,
            workspace: createWorkspace(
                array,
                target,
                offset,
                finalIndex,
                fibM,
                fibMm1,
                fibMm2,
                "One possible value remains after the Fibonacci window collapses."
            )
        };

        if (array[finalIndex] === target) {
            yield {
                type: "found",
                array,
                target,
                low: finalIndex,
                mid: finalIndex,
                high: finalIndex,
                pointers: [{ label: "found", index: finalIndex }],
                probes,
                resultIndex: finalIndex,
                message: `Target ${target} found at index ${finalIndex}.`,
                workspace: createWorkspace(
                    array,
                    target,
                    offset,
                    finalIndex,
                    fibM,
                    fibMm1,
                    fibMm2,
                    `Found ${target} in the final remaining slot.`
                )
            };
            return;
        }
    }

    yield {
        type: "miss",
        array,
        target,
        probes,
        resultIndex: -1,
        message: `Target ${target} is not in the array.`,
        workspace: {
            title: "Fibonacci Search Workspace",
            detail: "The Fibonacci window collapsed without finding the target.",
            rows: [
                { label: "Final Offset", values: [offset] },
                { label: "Target", values: [target] }
            ]
        }
    };
}

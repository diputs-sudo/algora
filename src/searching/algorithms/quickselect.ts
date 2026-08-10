import { QuickselectInsight, SearchStep } from "../visualizer/types.js";

export const defaultQuickselectArray = [42, 17, 68, 9, 31, 55, 24, 73, 12];

function createItems(
    array: number[],
    low: number,
    high: number,
    pivotIndex: number,
    storeIndex: number,
    kthIndex: number,
    scanIndex: number | undefined,
    foundIndex?: number
): QuickselectInsight["items"] {
    return array.map((value, index) => {
        let state: QuickselectInsight["items"][number]["state"] = "candidate";

        if (index < low || index > high) {
            state = "outside";
        }

        if (index >= low && index < storeIndex) {
            state = "less";
        }

        if (index === storeIndex && index >= low && index <= high) {
            state = "store";
        }

        if (index === scanIndex) {
            state = "scan";
        }

        if (index === pivotIndex) {
            state = "pivot";
        }

        if (index === foundIndex) {
            state = "found";
        }

        return { index, value, state };
    });
}

function createInsight(
    phase: QuickselectInsight["phase"],
    array: number[],
    low: number,
    high: number,
    kthIndex: number,
    pivotIndex: number,
    storeIndex: number,
    scanIndex: number | undefined,
    comparison: string,
    decisionText: string,
    note: string,
    foundIndex?: number
): QuickselectInsight {
    return {
        phase,
        items: createItems(array, low, high, pivotIndex, storeIndex, kthIndex, scanIndex, foundIndex),
        low,
        high,
        kthIndex,
        pivotIndex,
        pivotValue: array[pivotIndex],
        storeIndex,
        scanIndex,
        comparison,
        decisionText,
        note
    };
}

function createStep(
    type: SearchStep["type"],
    array: number[],
    kthIndex: number,
    insight: QuickselectInsight,
    message: string,
    probes: number,
    resultValue?: number
): SearchStep {
    return {
        type,
        array: [...array],
        target: kthIndex + 1,
        low: insight.low,
        high: insight.high,
        mid: insight.scanIndex ?? insight.pivotIndex,
        highlightIndices: [insight.kthIndex, insight.pivotIndex, insight.storeIndex].filter(index => index >= 0 && index < array.length),
        pointers: [
            { label: "k", index: insight.kthIndex },
            { label: "pivot", index: insight.pivotIndex },
            { label: "store", index: insight.storeIndex }
        ],
        probes,
        resultIndex: resultValue,
        message,
        quickselect: insight
    };
}

function swap(array: number[], left: number, right: number) {
    const temp = array[left];
    array[left] = array[right];
    array[right] = temp;
}

export function createQuickselectInitialStep(array: number[], k: number): SearchStep {
    const kthIndex = Math.max(0, Math.min(k - 1, array.length - 1));
    const pivotIndex = Math.max(array.length - 1, 0);
    const insight = createInsight(
        "choose",
        array,
        0,
        Math.max(array.length - 1, 0),
        kthIndex,
        pivotIndex,
        0,
        undefined,
        `k = ${k}`,
        "Choose a pivot and partition values smaller than it to the left.",
        "Quickselect only recurses into the side that can contain the kth value."
    );

    return createStep(
        "narrow",
        array,
        kthIndex,
        insight,
        `Find the ${k}${ordinalSuffix(k)} smallest value without sorting the whole array.`,
        0
    );
}

export function* quickselect(array: number[], k: number): Generator<SearchStep> {
    if (array.length === 0 || k < 1 || k > array.length) {
        yield {
            type: "miss",
            array,
            target: k,
            probes: 0,
            resultIndex: -1,
            message: "Quickselect needs a non-empty array and k inside the array length."
        };
        return;
    }

    const values = [...array];
    const kthIndex = k - 1;
    let low = 0;
    let high = values.length - 1;
    let probes = 0;

    while (low <= high) {
        const pivotIndex = high;
        const pivotValue = values[pivotIndex];
        let storeIndex = low;

        yield createStep(
            "narrow",
            values,
            kthIndex,
            createInsight(
                "choose",
                values,
                low,
                high,
                kthIndex,
                pivotIndex,
                storeIndex,
                undefined,
                `pivot = ${pivotValue}`,
                `Partition indices ${low} through ${high} around pivot ${pivotValue}.`,
                "The pivot will finish in the same position it would occupy in the fully sorted array."
            ),
            `Choose ${pivotValue} as the pivot for indices ${low} through ${high}.`,
            probes
        );

        for (let scanIndex = low; scanIndex < high; scanIndex++) {
            probes += 1;
            const shouldMove = values[scanIndex] < pivotValue;

            yield createStep(
                "inspect",
                values,
                kthIndex,
                createInsight(
                    "partition",
                    values,
                    low,
                    high,
                    kthIndex,
                    pivotIndex,
                    storeIndex,
                    scanIndex,
                    `${values[scanIndex]} ${shouldMove ? "<" : ">="} ${pivotValue}`,
                    shouldMove
                        ? `Move ${values[scanIndex]} into the less-than-pivot zone, then advance the boundary.`
                        : `Keep ${values[scanIndex]} on the right side for now and continue scanning.`,
                    "The store boundary marks where the next smaller-than-pivot value should be placed."
                ),
                `Compare ${values[scanIndex]} with pivot ${pivotValue}.`,
                probes
            );

            if (shouldMove) {
                swap(values, scanIndex, storeIndex);
                storeIndex += 1;

                yield createStep(
                    "inspect",
                    values,
                    kthIndex,
                    createInsight(
                        "partition",
                        values,
                        low,
                        high,
                        kthIndex,
                        pivotIndex,
                        storeIndex,
                        scanIndex,
                        "boundary advanced",
                        `The less-than-pivot zone now ends before index ${storeIndex}.`,
                        "Only partition order matters here; the left side does not need to be sorted."
                    ),
                    "Swap into the less-than-pivot zone.",
                    probes
                );
            }
        }

        swap(values, storeIndex, high);

        yield createStep(
            "narrow",
            values,
            kthIndex,
            createInsight(
                "pivot",
                values,
                low,
                high,
                kthIndex,
                storeIndex,
                storeIndex,
                undefined,
                `pivot index ${storeIndex}`,
                `Pivot ${values[storeIndex]} is now in final sorted position ${storeIndex}.`,
                "If this pivot index equals k, the pivot is the answer."
            ),
            `Place pivot ${values[storeIndex]} at index ${storeIndex}.`,
            probes
        );

        if (storeIndex === kthIndex) {
            yield createStep(
                "found",
                values,
                kthIndex,
                createInsight(
                    "found",
                    values,
                    low,
                    high,
                    kthIndex,
                    storeIndex,
                    storeIndex,
                    undefined,
                    `${storeIndex} = ${kthIndex}`,
                    `The pivot landed on k, so ${values[storeIndex]} is the ${k}${ordinalSuffix(k)} smallest value.`,
                    "Quickselect stops here because the kth value is fixed even though the whole array is not sorted.",
                    storeIndex
                ),
                `The ${k}${ordinalSuffix(k)} smallest value is ${values[storeIndex]}.`,
                probes,
                values[storeIndex]
            );
            return;
        }

        if (storeIndex > kthIndex) {
            yield createStep(
                "narrow",
                values,
                kthIndex,
                createInsight(
                    "left",
                    values,
                    low,
                    storeIndex - 1,
                    kthIndex,
                    storeIndex,
                    low,
                    undefined,
                    `${storeIndex} > ${kthIndex}`,
                    "The kth index is left of the pivot, so discard the right side.",
                    "Everything right of the pivot is too large to be the kth value."
                ),
                "Search the left partition next.",
                probes
            );
            high = storeIndex - 1;
        } else {
            yield createStep(
                "narrow",
                values,
                kthIndex,
                createInsight(
                    "right",
                    values,
                    storeIndex + 1,
                    high,
                    kthIndex,
                    storeIndex,
                    storeIndex + 1,
                    undefined,
                    `${storeIndex} < ${kthIndex}`,
                    "The kth index is right of the pivot, so discard the left side.",
                    "The pivot and everything left of it are too small to be the kth value."
                ),
                "Search the right partition next.",
                probes
            );
            low = storeIndex + 1;
        }
    }
}

function ordinalSuffix(value: number): string {
    const lastTwo = value % 100;
    if (lastTwo >= 11 && lastTwo <= 13) {
        return "th";
    }

    switch (value % 10) {
        case 1:
            return "st";
        case 2:
            return "nd";
        case 3:
            return "rd";
        default:
            return "th";
    }
}

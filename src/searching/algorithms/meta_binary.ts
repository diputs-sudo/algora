import { MetaBinaryInsight, SearchStep, SearchWorkspaceState } from "../visualizer/types.js";

function highestPowerOfTwoBelow(length: number): number {
    let bit = 1;

    while (bit * 2 < length) {
        bit *= 2;
    }

    return bit;
}

function createWorkspace(
    array: number[],
    target: number,
    position: number,
    bit: number,
    testIndex: number,
    detail: string
): SearchWorkspaceState {
    return {
        title: "Meta Binary Search Workspace",
        detail,
        rows: [
            {
                label: "Candidate",
                values: [`base ${position}`, `bit ${bit}`, `test ${testIndex}`],
                activeIndices: [2]
            },
            {
                label: "Meaning",
                values: [
                    position < 0 ? "base before array" : `arr[${position}] <= target zone`,
                    `try +${bit}`,
                    testIndex < array.length ? array[testIndex] : "outside"
                ],
                activeIndices: [2]
            },
            {
                label: "Target",
                values: [target]
            }
        ]
    };
}

function createBitStates(
    largestBit: number,
    activeBit: number,
    keptBits: Set<number>,
    skippedBits: Set<number>
): MetaBinaryInsight["bits"] {
    const bits: MetaBinaryInsight["bits"] = [];

    for (let bit = largestBit; bit > 0; bit = Math.floor(bit / 2)) {
        let status: MetaBinaryInsight["bits"][number]["status"] = "pending";

        if (keptBits.has(bit)) {
            status = "kept";
        } else if (skippedBits.has(bit)) {
            status = "skipped";
        } else if (bit === activeBit) {
            status = "active";
        }

        bits.push({ bit, status });
    }

    return bits;
}

function createMetaInsight(
    array: number[],
    position: number,
    activeBit: number,
    largestBit: number,
    keptBits: Set<number>,
    skippedBits: Set<number>,
    decision: MetaBinaryInsight["decision"],
    note: string,
    comparison?: string,
    decisionText?: string
): MetaBinaryInsight {
    const testIndex = activeBit > 0 ? position + activeBit : position + 1;
    const candidateIndex = position + 1;
    const testValue = testIndex >= 0 && testIndex < array.length ? array[testIndex] : undefined;

    return {
        baseIndex: position,
        activeBit,
        testIndex,
        candidateIndex,
        testValue,
        decision,
        comparison,
        decisionText: decisionText ?? createDecisionText(decision, activeBit),
        bits: createBitStates(largestBit, activeBit, keptBits, skippedBits),
        note
    };
}

function createDecisionText(decision: MetaBinaryInsight["decision"], activeBit: number): string {
    switch (decision) {
        case "keep":
            return `The test value is smaller, so keep +${activeBit}.`;
        case "skip":
            return `The test value is not smaller, so reject +${activeBit}.`;
        case "outside":
            return `The jump leaves the array, so reject +${activeBit}.`;
        case "found":
            return "The final candidate equals the target.";
        case "miss":
            return "The final candidate does not equal the target.";
        default:
            return "Compare the test value with the target before deciding this bit.";
    }
}

export function createMetaBinarySearchInitialStep(array: number[], target: number): SearchStep {
    const bit = highestPowerOfTwoBelow(array.length);
    const testIndex = array.length > 0 ? bit - 1 : undefined;
    const keptBits = new Set<number>();
    const skippedBits = new Set<number>();

    return {
        type: "narrow",
        array,
        target,
        low: array.length > 0 ? 0 : undefined,
        mid: testIndex,
        high: array.length > 0 ? array.length - 1 : undefined,
        pointers: array.length > 0 && testIndex !== undefined ? [
            { label: "base", index: 0 },
            { label: "test", index: testIndex }
        ] : [],
        message: "Start before the array, then try setting index bits from largest to smallest.",
        metaBinary: array.length > 0
            ? createMetaInsight(
                array,
                -1,
                bit,
                bit,
                keptBits,
                skippedBits,
                "pending",
                `Start with the largest useful bit, +${bit}. If the test value is still smaller than ${target}, that bit becomes part of the base index.`,
                undefined,
                "No bit has been decided yet."
            )
            : undefined,
        workspace: array.length > 0 && testIndex !== undefined
            ? createWorkspace(
                array,
                target,
                -1,
                bit,
                testIndex,
                "Meta Binary Search builds the final lower-bound position with binary lifting."
            )
            : {
                title: "Meta Binary Search Workspace",
                detail: "There are no values to inspect.",
                rows: [{ label: "Target", values: [target] }]
            }
    };
}

export function* metaBinarySearch(array: number[], target: number): Generator<SearchStep> {
    const length = array.length;
    let position = -1;
    let bit = highestPowerOfTwoBelow(length);
    const largestBit = bit;
    const keptBits = new Set<number>();
    const skippedBits = new Set<number>();
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
                title: "Meta Binary Search Workspace",
                detail: "There are no candidate bits to test.",
                rows: [{ label: "Target", values: [target] }]
            }
        };
        return;
    }

    while (bit > 0) {
        const testIndex = position + bit;
        const inside = testIndex < length;
        probes += inside ? 1 : 0;

        yield {
            type: "inspect",
            array,
            target,
            low: Math.max(position + 1, 0),
            mid: inside ? testIndex : undefined,
            high: length - 1,
            highlightIndices: inside ? [testIndex] : [],
            pointers: [
                { label: "base", index: Math.max(position, 0) },
                ...(inside ? [{ label: "test", index: testIndex }] : [])
            ],
            probes,
            message: inside
                ? `Try index ${testIndex}: compare ${array[testIndex]} with target ${target}.`
                : `Bit ${bit} would jump outside the array, so skip it.`,
            metaBinary: createMetaInsight(
                array,
                position,
                bit,
                largestBit,
                keptBits,
                skippedBits,
                inside ? "pending" : "outside",
                inside
                    ? `Test base ${position < 0 ? "before start" : position} plus ${bit}, which lands on index ${testIndex}.`
                    : `Base plus ${bit} would land past the array, so this bit cannot be used.`,
                inside ? `${array[testIndex]} ? ${target}` : `${testIndex} is outside`,
                inside
                    ? "Now compare the test value with the target to decide this bit."
                    : `Reject +${bit} because it cannot point to a real array value.`
            ),
            workspace: createWorkspace(
                array,
                target,
                position,
                bit,
                testIndex,
                "If the test value is smaller than the target, keep that bit in the base index."
            )
        };

        if (inside && array[testIndex] < target) {
            position = testIndex;
            keptBits.add(bit);

            yield {
                type: "narrow",
                array,
                target,
                low: Math.min(position + 1, length - 1),
                high: length - 1,
                highlightIndices: [position],
                pointers: [{ label: "base", index: position }],
                probes,
                message: `${array[position]} is smaller than ${target}, so keep index ${position} as the current base.`,
                metaBinary: createMetaInsight(
                    array,
                    position,
                    Math.floor(bit / 2),
                    largestBit,
                    keptBits,
                    skippedBits,
                    "keep",
                    `Keep +${bit}. The base moves to index ${position}, and the next bit checks a smaller jump.`,
                    `${array[position]} < ${target}`,
                    `${array[position]} is smaller than the target, so keep +${bit}.`
                ),
                workspace: createWorkspace(
                    array,
                    target,
                    position,
                    Math.floor(bit / 2),
                    position + Math.floor(bit / 2),
                    "The base moved right. The next smaller bit will test a finer jump."
                )
            };
        } else if (inside) {
            skippedBits.add(bit);

            yield {
                type: "narrow",
                array,
                target,
                low: Math.max(position + 1, 0),
                high: testIndex,
                highlightIndices: [testIndex],
                pointers: [
                    { label: "base", index: Math.max(position, 0) },
                    { label: "limit", index: testIndex }
                ],
                probes,
                message: `${array[testIndex]} is greater than or equal to ${target}, so leave this bit off.`,
                metaBinary: createMetaInsight(
                    array,
                    position,
                    Math.floor(bit / 2),
                    largestBit,
                    keptBits,
                    skippedBits,
                    "skip",
                    `Skip +${bit}. It would move the base too far, so the base stays ${position < 0 ? "before the array" : `at index ${position}`}.`,
                    `${array[testIndex]} >= ${target}`,
                    `${array[testIndex]} is not smaller than the target, so reject +${bit}.`
                ),
                workspace: createWorkspace(
                    array,
                    target,
                    position,
                    Math.floor(bit / 2),
                    position + Math.floor(bit / 2),
                    "The candidate may be at this index or to its left, so the base stays put."
                )
            };
        }

        if (!inside) {
            skippedBits.add(bit);
        }

        bit = Math.floor(bit / 2);
    }

    const candidate = position + 1;

    if (candidate < length) {
        probes += 1;

        yield {
            type: "inspect",
            array,
            target,
            low: candidate,
            mid: candidate,
            high: candidate,
            pointers: [{ label: "final", index: candidate }],
            probes,
            message: `Final candidate is index ${candidate}: compare ${array[candidate]} with ${target}.`,
            metaBinary: createMetaInsight(
                array,
                position,
                0,
                largestBit,
                keptBits,
                skippedBits,
                array[candidate] === target ? "found" : "miss",
                `All bits are decided. The only possible match is base + 1, index ${candidate}.`,
                array[candidate] === target ? `${array[candidate]} = ${target}` : `${array[candidate]} != ${target}`,
                array[candidate] === target
                    ? "The final candidate matches the target."
                    : "The final candidate is the lower bound, but it is not the target."
            ),
            workspace: {
                title: "Final Candidate",
                detail: "The built index is the first position whose value may be greater than or equal to the target.",
                rows: [
                    { label: "Candidate", values: [`index ${candidate}`, array[candidate]], activeIndices: [0, 1] },
                    { label: "Target", values: [target] }
                ]
            }
        };

        if (array[candidate] === target) {
            yield {
                type: "found",
                array,
                target,
                low: candidate,
                mid: candidate,
                high: candidate,
                pointers: [{ label: "found", index: candidate }],
                probes,
                resultIndex: candidate,
                message: `Target ${target} found at index ${candidate}.`,
                metaBinary: createMetaInsight(
                    array,
                    position,
                    0,
                    largestBit,
                    keptBits,
                    skippedBits,
                    "found",
                    `The final candidate matches ${target}, so the search returns index ${candidate}.`,
                    `${array[candidate]} = ${target}`,
                    `Return index ${candidate}.`
                ),
                workspace: {
                    title: "Target Found",
                    detail: "The final lower-bound candidate matches the target.",
                    rows: [{ label: "Result", values: [`index ${candidate}`, array[candidate]], activeIndices: [0, 1] }]
                }
            };
            return;
        }
    }

    yield {
        type: "miss",
        array,
        target,
        low: candidate,
        high: length - 1,
        probes,
        resultIndex: -1,
        message: `Target ${target} is not in the array.`,
        metaBinary: createMetaInsight(
            array,
            position,
            0,
            largestBit,
            keptBits,
            skippedBits,
            "miss",
            candidate < length
                ? `Index ${candidate} is the lower-bound candidate, but it does not equal ${target}.`
                : `The built base reaches the last smaller value, so ${target} would be inserted at index ${candidate}.`,
            candidate < length ? `${array[candidate]} != ${target}` : `candidate ${candidate} is outside`,
            candidate < length
                ? "The lower-bound candidate does not match the target."
                : "There is no final array value left to compare."
        ),
        workspace: {
            title: "Search Complete",
            detail: "The lower-bound candidate did not match the target.",
            rows: [
                { label: "Insertion Point", values: [candidate] },
                { label: "Target", values: [target] }
            ]
        }
    };
}

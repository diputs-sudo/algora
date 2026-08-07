import { FractionalCascadingInsight, SearchStep, SearchWorkspaceState } from "../visualizer/types.js";

export const defaultFractionalCatalogs: number[][] = [
    [4, 12, 19, 27, 39, 52, 68],
    [6, 14, 23, 31, 44, 59, 72],
    [3, 16, 25, 36, 48, 61, 80],
    [8, 18, 29, 40, 55, 70, 90]
];

function clampIndex(index: number, length: number): number {
    if (length === 0) return 0;
    return Math.max(0, Math.min(index, length - 1));
}

function lowerBound(values: number[], target: number): number {
    let low = 0;
    let high = values.length;

    while (low < high) {
        const mid = Math.floor((low + high) / 2);

        if (values[mid] < target) {
            low = mid + 1;
        } else {
            high = mid;
        }
    }

    return low;
}

function createWorkspace(
    catalogs: number[][],
    target: number,
    catalogIndex: number,
    probeIndex: number,
    anchorIndex: number,
    detail: string
): SearchWorkspaceState {
    const catalog = catalogs[catalogIndex] ?? [];

    return {
        title: "Fractional Cascading Workspace",
        detail,
        rows: [
            {
                label: `Catalog ${catalogIndex + 1}`,
                values: catalog,
                activeIndices: catalog.length > 0 ? [clampIndex(probeIndex, catalog.length)] : []
            },
            {
                label: "Bridge",
                values: [`from ${anchorIndex}`, `probe ${probeIndex}`],
                activeIndices: [0, 1]
            },
            {
                label: "Target",
                values: [target]
            }
        ]
    };
}

function createInsight(
    phase: FractionalCascadingInsight["phase"],
    catalogs: number[][],
    catalogIndex: number,
    anchorIndex: number,
    probeIndex: number,
    note: string,
    resultIndex?: number,
    comparison?: string,
    decisionText?: string
): FractionalCascadingInsight {
    return {
        phase,
        catalogIndex,
        catalogCount: catalogs.length,
        catalogs: catalogs.map(catalog => [...catalog]),
        anchorIndex,
        probeIndex,
        resultIndex,
        comparison,
        decisionText: decisionText ?? "Search the first catalog, then reuse its position as a bridge into the next catalog.",
        note
    };
}

export function createFractionalCascadingInitialStep(catalogs: number[][], target: number): SearchStep {
    const first = catalogs[0] ?? [];
    const probe = first.length > 0 ? Math.floor((first.length - 1) / 2) : 0;

    return {
        type: "narrow",
        array: first,
        target,
        low: first.length > 0 ? 0 : undefined,
        mid: first.length > 0 ? probe : undefined,
        high: first.length > 0 ? first.length - 1 : undefined,
        pointers: first.length > 0 ? [
            { label: "first", index: probe }
        ] : [],
        message: "Start with one binary search in the first sorted catalog, then cascade the position through the remaining catalogs.",
        fractionalCascading: first.length > 0
            ? createInsight(
                "first-search",
                catalogs,
                0,
                probe,
                probe,
                "The first catalog pays the full binary-search cost. Later catalogs reuse this position as an anchor.",
                undefined,
                undefined,
                "Find the first lower bound normally."
            )
            : undefined,
        workspace: first.length > 0
            ? createWorkspace(catalogs, target, 0, probe, probe, "One binary search seeds the cascade.")
            : {
                title: "Fractional Cascading Workspace",
                detail: "There are no catalogs to search.",
                rows: [{ label: "Target", values: [target] }]
            }
    };
}

export function* fractionalCascadingSearch(catalogs: number[][], target: number): Generator<SearchStep> {
    if (catalogs.length === 0 || catalogs.every(catalog => catalog.length === 0)) {
        yield createFractionalCascadingInitialStep(catalogs, target);
        return;
    }

    let anchor = 0;
    let probes = 0;

    for (let catalogIndex = 0; catalogIndex < catalogs.length; catalogIndex++) {
        const catalog = catalogs[catalogIndex];

        if (catalog.length === 0) {
            continue;
        }

        const phase: FractionalCascadingInsight["phase"] = catalogIndex === 0 ? "first-search" : "cascade";
        const probe = catalogIndex === 0
            ? Math.floor((catalog.length - 1) / 2)
            : clampIndex(anchor, catalog.length);

        probes += 1;
        yield {
            type: "inspect",
            array: catalog,
            target,
            low: 0,
            mid: probe,
            high: catalog.length - 1,
            pointers: [
                { label: catalogIndex === 0 ? "first" : "bridge", index: probe }
            ],
            probes,
            message: catalogIndex === 0
                ? `Binary search catalog 1 for the lower bound of ${target}.`
                : `Use the previous lower-bound position as a bridge into catalog ${catalogIndex + 1}.`,
            fractionalCascading: createInsight(
                phase,
                catalogs,
                catalogIndex,
                anchor,
                probe,
                catalogIndex === 0
                    ? "This first search creates the position reused by the cascade."
                    : "The bridge gives a near position, so only a local correction is needed in this teaching view.",
                undefined,
                `${catalog[probe]} ? ${target}`,
                catalogIndex === 0 ? "Run full lower-bound search here." : "Adjust locally from the bridged position."
            ),
            workspace: createWorkspace(
                catalogs,
                target,
                catalogIndex,
                probe,
                anchor,
                catalogIndex === 0 ? "Seed the cascade with a normal lower-bound search." : "Reuse the previous result as a bridge."
            )
        };

        const result = lowerBound(catalog, target);
        anchor = result;
        const resultProbe = clampIndex(result, catalog.length);
        const found = result < catalog.length && catalog[result] === target;

        yield {
            type: found ? "found" : "narrow",
            array: catalog,
            target,
            low: 0,
            mid: resultProbe,
            high: catalog.length - 1,
            highlightIndices: [resultProbe],
            pointers: [
                { label: found ? "found" : "bound", index: resultProbe }
            ],
            probes,
            resultIndex: found ? result : undefined,
            message: found
                ? `Catalog ${catalogIndex + 1} contains ${target} at index ${result}.`
                : `Catalog ${catalogIndex + 1} lower bound is index ${result}.`,
            fractionalCascading: createInsight(
                found ? "found" : phase,
                catalogs,
                catalogIndex,
                probe,
                resultProbe,
                found
                    ? "The target was found in this catalog."
                    : "Carry this lower-bound position forward to the next catalog.",
                result,
                result < catalog.length ? `${catalog[result]} ${found ? "=" : ">="} ${target}` : "past end",
                found ? `Record catalog ${catalogIndex + 1}, index ${result}.` : `Bridge index ${result} into the next catalog.`
            ),
            workspace: createWorkspace(
                catalogs,
                target,
                catalogIndex,
                resultProbe,
                probe,
                found ? "This catalog has a real match." : "The lower bound becomes the next bridge."
            )
        };
    }

    yield {
        type: "done",
        array: catalogs[catalogs.length - 1] ?? [],
        target,
        probes,
        message: "Finished cascading through all catalogs.",
        fractionalCascading: createInsight(
            "done",
            catalogs,
            Math.max(catalogs.length - 1, 0),
            anchor,
            anchor,
            "All catalogs have been searched using the cascaded lower-bound position.",
            anchor,
            "cascade complete",
            "Any found matches were reported as the cascade advanced."
        ),
        workspace: {
            title: "Fractional Cascading Workspace",
            detail: "The query has been propagated through every catalog.",
            rows: [
                { label: "Catalogs", values: [catalogs.length] },
                { label: "Target", values: [target] }
            ]
        }
    };
}

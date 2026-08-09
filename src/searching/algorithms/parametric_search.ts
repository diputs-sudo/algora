import { ParametricDayLoad, ParametricSearchInsight, SearchStep } from "../visualizer/types.js";

export const defaultParametricWeights = [7, 2, 5, 10, 8, 4, 6];

function simulateShipping(weights: number[], capacity: number): ParametricDayLoad[] {
    const loads: ParametricDayLoad[] = [];
    let current: ParametricDayLoad = { day: 1, load: 0, packages: [] };

    weights.forEach(weight => {
        if (current.packages.length > 0 && current.load + weight > capacity) {
            loads.push(current);
            current = { day: current.day + 1, load: 0, packages: [] };
        }

        current.load += weight;
        current.packages.push(weight);
    });

    loads.push(current);
    return loads;
}

function createInsight(
    phase: ParametricSearchInsight["phase"],
    low: number,
    high: number,
    candidate: number,
    daysLimit: number,
    loads: ParametricDayLoad[],
    best: number | undefined,
    comparison: string,
    decisionText: string,
    note: string
): ParametricSearchInsight {
    return {
        phase,
        low,
        high,
        candidate,
        daysLimit,
        usedDays: loads.length,
        best,
        loads,
        comparison,
        decisionText,
        note
    };
}

function createStep(
    type: SearchStep["type"],
    weights: number[],
    days: number,
    insight: ParametricSearchInsight,
    message: string,
    probes: number,
    resultIndex?: number
): SearchStep {
    return {
        type,
        array: weights,
        target: days,
        probes,
        resultIndex,
        highlightIndices: [],
        pointers: [],
        message,
        parametric: insight
    };
}

export function createParametricSearchInitialStep(weights: number[], days: number): SearchStep {
    const low = Math.max(...weights, 0);
    const high = weights.reduce((sum, weight) => sum + weight, 0);
    const candidate = Math.floor((low + high) / 2);
    const loads = simulateShipping(weights, Math.max(candidate, 1));

    return createStep(
        "narrow",
        weights,
        days,
        createInsight(
            "test",
            low,
            high,
            candidate,
            days,
            loads,
            undefined,
            `${loads.length} days ? ${days}`,
            `Test capacity ${candidate}. If it ships everything within ${days} days, try a smaller answer.`,
            "Parametric search does binary search over answers, not array indices."
        ),
        "Start with the full answer range: max package weight to total package weight.",
        0
    );
}

export function* parametricSearch(weights: number[], days: number): Generator<SearchStep> {
    if (weights.length === 0 || days <= 0) {
        yield createStep(
            "miss",
            weights,
            days,
            createInsight(
                "done",
                0,
                0,
                0,
                days,
                [],
                undefined,
                "invalid input",
                "Provide at least one package and a positive day limit.",
                "The feasibility predicate needs a real workload and a real constraint."
            ),
            "Parametric search needs package weights and a positive day limit.",
            0,
            -1
        );
        return;
    }

    let low = Math.max(...weights);
    let high = weights.reduce((sum, weight) => sum + weight, 0);
    let best = high;
    let probes = 0;

    while (low <= high) {
        const candidate = Math.floor((low + high) / 2);
        const loads = simulateShipping(weights, candidate);
        const feasible = loads.length <= days;
        probes += 1;

        const insight = createInsight(
            feasible ? "feasible" : "too-low",
            low,
            high,
            candidate,
            days,
            loads,
            best,
            `${loads.length} ${feasible ? "<=" : ">"} ${days} days`,
            feasible
                ? `Capacity ${candidate} works, so record it and search lower capacities.`
                : `Capacity ${candidate} needs too many days, so every smaller capacity is impossible.`,
            feasible
                ? "The predicate is true here. Move the right edge left to find the minimum feasible answer."
                : "The predicate is false here. Move the left edge right until the capacity can satisfy the constraint."
        );

        yield createStep(
            feasible ? "narrow" : "inspect",
            weights,
            days,
            insight,
            feasible
                ? `Capacity ${candidate} ships in ${loads.length} days. Try smaller.`
                : `Capacity ${candidate} needs ${loads.length} days, more than ${days}. Try larger.`,
            probes
        );

        if (feasible) {
            best = candidate;
            high = candidate - 1;
        } else {
            low = candidate + 1;
        }
    }

    const finalLoads = simulateShipping(weights, best);

    yield createStep(
        "found",
        weights,
        days,
        createInsight(
            "done",
            low,
            high,
            best,
            days,
            finalLoads,
            best,
            `${finalLoads.length} <= ${days} days`,
            `The minimum feasible capacity is ${best}.`,
            "The search stops when the answer range crosses. The best feasible capacity is the result."
        ),
        `Minimum capacity is ${best}.`,
        probes,
        best
    );
}

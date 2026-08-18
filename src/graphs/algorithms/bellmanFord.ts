import { GraphData, GraphStep, GraphWorkspaceState, GridPoint } from "../visualizer/types.js";

function key(point: GridPoint): string {
    return `${point.row},${point.col}`;
}

function label(point: GridPoint): string {
    return `r${point.row + 1}c${point.col + 1}`;
}

function pointFromKey(value: string): GridPoint {
    const [row, col] = value.split(",").map(Number);
    return { row, col };
}

function openCells(graph: GraphData): GridPoint[] {
    const walls = new Set(graph.walls.map(key));
    const cells: GridPoint[] = [];

    for (let row = 0; row < graph.height; row++) {
        for (let col = 0; col < graph.width; col++) {
            const point = { row, col };
            if (!walls.has(key(point))) cells.push(point);
        }
    }

    return cells;
}

function neighborsFor(graph: GraphData, point: GridPoint): GridPoint[] {
    const walls = new Set(graph.walls.map(key));
    return [
        { row: point.row - 1, col: point.col },
        { row: point.row, col: point.col + 1 },
        { row: point.row + 1, col: point.col },
        { row: point.row, col: point.col - 1 }
    ].filter(next => next.row >= 0 && next.row < graph.height
        && next.col >= 0 && next.col < graph.width
        && !walls.has(key(next)));
}

function costFor(graph: GraphData, point: GridPoint): number {
    return graph.costs?.[key(point)] ?? 1;
}

function distanceValues(distances: Map<string, number>): string[] {
    return Array.from(distances.entries()).map(([value, distance]) => {
        const formatted = distance === Infinity ? "∞" : String(distance);
        return `${label(pointFromKey(value))}: ${formatted}`;
    });
}

function makeWorkspace(
    detail: string,
    pass: number,
    distances: Map<string, number>,
    relaxations: number,
    edge?: GridPoint,
    weight?: number
): GraphWorkspaceState {
    return {
        title: "Bellman-Ford Workspace",
        detail,
        rows: [
            { label: "Pass", values: [pass] },
            { label: "Distances", values: distanceValues(distances) },
            { label: "Relaxations", values: [relaxations] },
            {
                label: "Edge",
                values: edge ? [`${label(edge)} cost ${weight ?? 1}`] : ["none"],
                activeIndices: edge ? [0] : []
            }
        ]
    };
}

function reconstructPath(parent: Map<string, string>, start: GridPoint, target: GridPoint): string[] {
    const startKey = key(start);
    let currentKey = key(target);
    const path = [currentKey];

    while (currentKey !== startKey) {
        const previous = parent.get(currentKey);
        if (!previous) break;
        currentKey = previous;
        path.push(currentKey);
    }

    return path.reverse();
}

function distanceRecord(distances: Map<string, number>): Record<string, number> {
    return Object.fromEntries(distances.entries());
}

export function createBellmanFordInitialStep(graph: GraphData): GraphStep {
    return {
        type: "start",
        graph,
        current: graph.start,
        visited: [key(graph.start)],
        stack: [],
        order: [],
        distances: { [key(graph.start)]: 0 },
        message: `Initialize Bellman-Ford at ${label(graph.start)} with distance 0.`,
        workspace: {
            title: "Bellman-Ford Workspace",
            detail: "Every other reachable cell begins at infinity. Each pass may improve a distance.",
            rows: [
                { label: "Pass", values: [0] },
                { label: "Distances", values: [`${label(graph.start)}: 0`] },
                { label: "Relaxations", values: [0] },
                { label: "Edge", values: ["none"] }
            ]
        }
    };
}

export function* bellmanFord(graph: GraphData): Generator<GraphStep> {
    const cells = openCells(graph);
    const startKey = key(graph.start);
    const targetKey = key(graph.target);
    const distances = new Map<string, number>([[startKey, 0]]);
    const parent = new Map<string, string>();
    const order: string[] = [];
    let relaxations = 0;

    yield createBellmanFordInitialStep(graph);

    for (let pass = 1; pass < cells.length; pass++) {
        let changed = false;

        for (const current of cells) {
            const currentKey = key(current);
            const currentDistance = distances.get(currentKey);
            if (currentDistance === undefined) continue;

            for (const neighbor of neighborsFor(graph, current)) {
                const neighborKey = key(neighbor);
                const edgeCost = costFor(graph, neighbor);
                const candidate = currentDistance + edgeCost;
                const previous = distances.get(neighborKey) ?? Infinity;

                yield {
                    type: "inspect-cell",
                    graph,
                    current,
                    inspected: neighbor,
                    edgeWeight: edgeCost,
                    visited: Array.from(distances.keys()),
                    stack: [neighborKey],
                    order: [...order],
                    distances: distanceRecord(distances),
                    message: `Pass ${pass}: inspect ${label(neighbor)} with candidate distance ${candidate}.`,
                    workspace: makeWorkspace(
                        `Compare ${label(neighbor)}'s current distance with the candidate from ${label(current)}.`,
                        pass,
                        distances,
                        relaxations,
                        neighbor,
                        edgeCost
                    )
                };

                if (candidate >= previous) continue;

                distances.set(neighborKey, candidate);
                parent.set(neighborKey, currentKey);
                changed = true;
                relaxations++;
                if (!order.includes(label(neighbor))) order.push(label(neighbor));

                yield {
                    type: "push",
                    graph,
                    current,
                    previous: current,
                    inspected: neighbor,
                    edgeWeight: edgeCost,
                    visited: Array.from(distances.keys()),
                    stack: [neighborKey],
                    order: [...order],
                    distances: distanceRecord(distances),
                    message: `Relax ${label(neighbor)} from ${previous === Infinity ? "infinity" : previous} to ${candidate}.`,
                    workspace: makeWorkspace(
                        `Distance updated through ${label(current)} on pass ${pass}.`,
                        pass,
                        distances,
                        relaxations,
                        neighbor,
                        edgeCost
                    )
                };
            }
        }

        if (!changed) break;
    }

    for (const current of cells) {
        const currentDistance = distances.get(key(current));
        if (currentDistance === undefined) continue;

        for (const neighbor of neighborsFor(graph, current)) {
            const neighborKey = key(neighbor);
            if (currentDistance + costFor(graph, neighbor) < (distances.get(neighborKey) ?? Infinity)) {
                yield {
                    type: "done",
                    graph,
                    current,
                    visited: Array.from(distances.keys()),
                    stack: [],
                    order: [...order],
                    distances: distanceRecord(distances),
                    message: "A reachable negative-weight cycle was detected after the relaxation passes.",
                    workspace: makeWorkspace("Bellman-Ford cannot define a shortest path while a negative cycle is reachable.", cells.length - 1, distances, relaxations, neighbor, costFor(graph, neighbor))
                };
                return;
            }
        }
    }

    if (distances.has(targetKey)) {
        const target = graph.target;
        const path = reconstructPath(parent, graph.start, target);
        yield {
            type: "found",
            graph,
            current: target,
            visited: Array.from(distances.keys()),
            stack: [],
            order: [...order],
            path,
            distances: distanceRecord(distances),
            message: `Target found with shortest distance ${distances.get(targetKey)} after relaxation passes.`,
            workspace: {
                title: "Bellman-Ford Workspace",
                detail: "No further relaxation can improve the target distance, so the path is ready to reconstruct.",
                rows: [
                    { label: "Path", values: path.map(value => label(pointFromKey(value))) },
                    { label: "Distance", values: [distances.get(targetKey) ?? Infinity] },
                    { label: "Relaxations", values: [relaxations] }
                ]
            }
        };
        return;
    }

    yield {
        type: "done",
        graph,
        visited: Array.from(distances.keys()),
        stack: [],
        order: [...order],
        distances: distanceRecord(distances),
        message: "All relaxation passes finished without reaching the target.",
        workspace: makeWorkspace("Bellman-Ford finished without finding a path to the target.", cells.length - 1, distances, relaxations)
    };
}

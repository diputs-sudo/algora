function key(point) {
    return `${point.row},${point.col}`;
}
function label(point) {
    return `r${point.row + 1}c${point.col + 1}`;
}
function pointFromKey(value) {
    const [row, col] = value.split(",").map(Number);
    return { row, col };
}
function neighborsFor(graph, point) {
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
function distanceValues(distances) {
    return Array.from(distances.entries()).map(([value, distance]) => `${label(pointFromKey(value))}: ${distance}`);
}
function makeWorkspace(detail, deque, distances, order, edge, weight) {
    return {
        title: "0-1 BFS Workspace",
        detail,
        rows: [
            {
                label: "Deque",
                values: deque.length > 0 ? deque.map(point => label(point)) : ["empty"],
                activeIndices: deque.length > 0 ? [0] : []
            },
            {
                label: "Distances",
                values: distanceValues(distances).length > 0 ? distanceValues(distances) : ["infinity"]
            },
            {
                label: "Order",
                values: order.length > 0 ? order : ["none"]
            },
            {
                label: "Edge",
                values: edge ? [`${label(edge)} weight ${weight ?? 0}`] : ["none"],
                activeIndices: edge ? [0] : []
            }
        ]
    };
}
function reconstructPath(parent, start, target) {
    const startKey = key(start);
    let currentKey = key(target);
    const path = [currentKey];
    while (currentKey !== startKey) {
        const previous = parent.get(currentKey);
        if (!previous)
            break;
        currentKey = previous;
        path.push(currentKey);
    }
    return path.reverse();
}
function stepDistances(distances) {
    return Object.fromEntries(distances.entries());
}
export function createZeroOneBfsInitialStep(graph) {
    return {
        type: "start",
        graph,
        current: graph.start,
        visited: [],
        stack: [key(graph.start)],
        order: [],
        distances: { [key(graph.start)]: 0 },
        message: `Start 0-1 BFS at ${label(graph.start)}. Zero-weight moves go to the deque front; one-weight moves go to the back.`,
        workspace: {
            title: "0-1 BFS Workspace",
            detail: "The deque begins with the start cell at distance 0.",
            rows: [
                { label: "Deque", values: [label(graph.start)], activeIndices: [0] },
                { label: "Distances", values: [`${label(graph.start)}: 0`] },
                { label: "Edge", values: ["none"] }
            ]
        }
    };
}
export function* zeroOneBfs(graph) {
    const distances = new Map([[key(graph.start), 0]]);
    const parent = new Map();
    const settled = new Set();
    const order = [];
    const deque = [graph.start];
    yield createZeroOneBfsInitialStep(graph);
    while (deque.length > 0) {
        const current = deque.shift();
        const currentKey = key(current);
        if (settled.has(currentKey))
            continue;
        settled.add(currentKey);
        order.push(label(current));
        yield {
            type: "visit",
            graph,
            current,
            visited: Array.from(settled),
            stack: deque.map(key),
            order: [...order],
            distances: stepDistances(distances),
            message: `Settle ${label(current)} with distance ${distances.get(currentKey)}.`,
            workspace: makeWorkspace(`${label(current)} leaves the deque front and becomes settled.`, deque, distances, order)
        };
        if (currentKey === key(graph.target)) {
            const path = reconstructPath(parent, graph.start, graph.target);
            yield {
                type: "found",
                graph,
                current,
                visited: Array.from(settled),
                stack: deque.map(key),
                order: [...order],
                path,
                distances: stepDistances(distances),
                message: `Target found at ${label(current)} with distance ${distances.get(currentKey)}.`,
                workspace: {
                    title: "0-1 BFS Workspace",
                    detail: "The highlighted path has the minimum total cost under 0/1 edge weights.",
                    rows: [
                        { label: "Path", values: path.map(value => label(pointFromKey(value))) },
                        { label: "Cost", values: [String(distances.get(currentKey))] },
                        { label: "Order", values: [...order] }
                    ]
                }
            };
            return;
        }
        for (const neighbor of neighborsFor(graph, current)) {
            const neighborKey = key(neighbor);
            const weight = graph.weights?.[neighborKey] ?? 0;
            const currentDistance = distances.get(currentKey) ?? Infinity;
            const nextDistance = currentDistance + weight;
            yield {
                type: "inspect-cell",
                graph,
                current,
                inspected: neighbor,
                edgeWeight: weight,
                visited: Array.from(settled),
                stack: deque.map(key),
                order: [...order],
                distances: stepDistances(distances),
                message: `Inspect ${label(neighbor)} through a weight-${weight} edge.`,
                workspace: makeWorkspace(`Try ${label(neighbor)} with candidate distance ${nextDistance}.`, deque, distances, order, neighbor, weight)
            };
            const previousDistance = distances.get(neighborKey) ?? Infinity;
            if (nextDistance >= previousDistance)
                continue;
            distances.set(neighborKey, nextDistance);
            parent.set(neighborKey, currentKey);
            if (weight === 0) {
                deque.unshift(neighbor);
            }
            else {
                deque.push(neighbor);
            }
            yield {
                type: "push",
                graph,
                current,
                previous: current,
                inspected: neighbor,
                edgeWeight: weight,
                visited: Array.from(settled),
                stack: deque.map(key),
                order: [...order],
                distances: stepDistances(distances),
                message: `Relax ${label(neighbor)} to ${nextDistance}; add it to the ${weight === 0 ? "front" : "back"} of the deque.`,
                workspace: makeWorkspace(`${label(neighbor)} moves to the deque ${weight === 0 ? "front" : "back"} because its edge weight is ${weight}.`, deque, distances, order, neighbor, weight)
            };
        }
    }
    yield {
        type: "done",
        graph,
        visited: Array.from(settled),
        stack: [],
        order: [...order],
        distances: stepDistances(distances),
        message: "The deque is empty, so no path remains to explore.",
        workspace: makeWorkspace("0-1 BFS finished without reaching the target.", [], distances, order)
    };
}

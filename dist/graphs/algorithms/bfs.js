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
function makeWorkspace(detail, queue, visited, order, distances, inspected) {
    return {
        title: "BFS Grid Workspace",
        detail,
        rows: [
            {
                label: "Queue",
                values: queue.length > 0 ? queue.map(label) : ["empty"],
                activeIndices: queue.length > 0 ? [0] : []
            },
            {
                label: "Visited",
                values: visited.size > 0 ? Array.from(visited).map(value => label(pointFromKey(value))) : ["none"]
            },
            {
                label: "Distance",
                values: distances.size > 0
                    ? Array.from(distances.entries()).map(([value, distance]) => `${label(pointFromKey(value))}: ${distance}`)
                    : ["infinity"]
            },
            {
                label: "Inspect",
                values: inspected ? [label(inspected)] : ["none"],
                activeIndices: inspected ? [0] : []
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
function distanceRecord(distances) {
    return Object.fromEntries(distances.entries());
}
export function createBfsInitialStep(graph) {
    return {
        type: "start",
        graph,
        current: graph.start,
        visited: [key(graph.start)],
        stack: [key(graph.start)],
        order: [],
        distances: { [key(graph.start)]: 0 },
        message: `Start BFS at ${label(graph.start)}. The queue expands outward one layer at a time.`,
        workspace: {
            title: "BFS Grid Workspace",
            detail: "The start cell is discovered at distance 0 and waits at the front of the queue.",
            rows: [
                { label: "Queue", values: [label(graph.start)], activeIndices: [0] },
                { label: "Visited", values: [label(graph.start)] },
                { label: "Distance", values: [`${label(graph.start)}: 0`] },
                { label: "Inspect", values: ["none"] }
            ]
        }
    };
}
export function* breadthFirstSearch(graph) {
    const queue = [graph.start];
    const visited = new Set([key(graph.start)]);
    const parent = new Map();
    const distances = new Map([[key(graph.start), 0]]);
    const order = [];
    yield createBfsInitialStep(graph);
    while (queue.length > 0) {
        const current = queue.shift();
        const currentKey = key(current);
        order.push(label(current));
        yield {
            type: "visit",
            graph,
            current,
            visited: Array.from(visited),
            stack: queue.map(key),
            order: [...order],
            distances: distanceRecord(distances),
            message: `Visit ${label(current)} at distance ${distances.get(currentKey)}.`,
            workspace: makeWorkspace(`${label(current)} leaves the queue front. BFS now checks its next layer of neighbors.`, queue, visited, order, distances)
        };
        if (currentKey === key(graph.target)) {
            const path = reconstructPath(parent, graph.start, graph.target);
            yield {
                type: "found",
                graph,
                current,
                visited: Array.from(visited),
                stack: queue.map(key),
                order: [...order],
                path,
                distances: distanceRecord(distances),
                message: `Target found at the shortest unweighted distance ${distances.get(currentKey)}.`,
                workspace: {
                    title: "BFS Grid Workspace",
                    detail: "Because BFS explores in layers, the first path to the target is shortest in an unweighted grid.",
                    rows: [
                        { label: "Path", values: path.map(value => label(pointFromKey(value))) },
                        { label: "Distance", values: [distances.get(currentKey) ?? 0] },
                        { label: "Order", values: [...order] }
                    ]
                }
            };
            return;
        }
        for (const neighbor of neighborsFor(graph, current)) {
            const neighborKey = key(neighbor);
            yield {
                type: "inspect-cell",
                graph,
                current,
                inspected: neighbor,
                visited: Array.from(visited),
                stack: queue.map(key),
                order: [...order],
                distances: distanceRecord(distances),
                message: `Inspect ${label(neighbor)} from ${label(current)}.`,
                workspace: makeWorkspace(`Check whether ${label(neighbor)} has already been discovered.`, queue, visited, order, distances, neighbor)
            };
            if (visited.has(neighborKey)) {
                yield {
                    type: "skip-cell",
                    graph,
                    current,
                    inspected: neighbor,
                    visited: Array.from(visited),
                    stack: queue.map(key),
                    order: [...order],
                    distances: distanceRecord(distances),
                    message: `${label(neighbor)} is already discovered, so BFS skips it.`,
                    workspace: makeWorkspace(`${label(neighbor)} already has its shortest known layer distance.`, queue, visited, order, distances, neighbor)
                };
                continue;
            }
            visited.add(neighborKey);
            parent.set(neighborKey, currentKey);
            distances.set(neighborKey, (distances.get(currentKey) ?? 0) + 1);
            queue.push(neighbor);
            yield {
                type: "push",
                graph,
                current,
                previous: current,
                inspected: neighbor,
                visited: Array.from(visited),
                stack: queue.map(key),
                order: [...order],
                distances: distanceRecord(distances),
                message: `Enqueue ${label(neighbor)} at distance ${distances.get(neighborKey)}.`,
                workspace: makeWorkspace(`${label(neighbor)} joins the back of the queue for a later layer.`, queue, visited, order, distances, neighbor)
            };
        }
    }
    yield {
        type: "done",
        graph,
        visited: Array.from(visited),
        stack: [],
        order: [...order],
        distances: distanceRecord(distances),
        message: "The queue is empty, so no path remains to explore.",
        workspace: makeWorkspace("BFS finished without reaching the target.", [], visited, order, distances)
    };
}

function key(point) {
    return `${point.row},${point.col}`;
}
function label(point) {
    return `r${point.row + 1}c${point.col + 1}`;
}
function samePoint(a, b) {
    return a.row === b.row && a.col === b.col;
}
function pointFromKey(value) {
    const [row, col] = value.split(",").map(Number);
    return { row, col };
}
function wallSetFor(graph) {
    return new Set(graph.walls.map(key));
}
function isInside(graph, point) {
    return point.row >= 0
        && point.row < graph.height
        && point.col >= 0
        && point.col < graph.width;
}
function neighborsFor(graph, point) {
    const candidates = [
        { row: point.row - 1, col: point.col },
        { row: point.row, col: point.col + 1 },
        { row: point.row + 1, col: point.col },
        { row: point.row, col: point.col - 1 }
    ];
    const walls = wallSetFor(graph);
    return candidates.filter(candidate => isInside(graph, candidate) && !walls.has(key(candidate)));
}
function makeWorkspace(detail, visited, stack, order, inspected) {
    return {
        title: "DFS Grid Workspace",
        detail,
        rows: [
            {
                label: "Stack",
                values: stack.length > 0 ? [...stack].reverse().map(label) : ["empty"],
                activeIndices: stack.length > 0 ? [0] : []
            },
            {
                label: "Visited",
                values: visited.size > 0 ? Array.from(visited).map(value => label(pointFromKey(value))) : ["none"]
            },
            {
                label: "Order",
                values: order.length > 0 ? order : ["none"]
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
export function createDfsInitialStep(graph) {
    return {
        type: "start",
        graph,
        current: graph.start,
        visited: [],
        stack: [key(graph.start)],
        order: [],
        message: `Start DFS at ${label(graph.start)}. The goal is ${label(graph.target)}.`,
        workspace: {
            title: "DFS Grid Workspace",
            detail: "Depth-first search uses a stack to explore one path through the grid before backtracking.",
            rows: [
                { label: "Stack", values: [label(graph.start)], activeIndices: [0] },
                { label: "Visited", values: ["none"] },
                { label: "Target", values: [label(graph.target)] }
            ]
        }
    };
}
export function* depthFirstSearch(graph) {
    const visited = new Set();
    const parent = new Map();
    const order = [];
    const stack = [graph.start];
    yield createDfsInitialStep(graph);
    while (stack.length > 0) {
        const current = stack.pop();
        const currentKey = key(current);
        if (visited.has(currentKey)) {
            yield {
                type: "skip-cell",
                graph,
                current,
                visited: Array.from(visited),
                stack: stack.map(key),
                order: [...order],
                message: `${label(current)} was already visited, so DFS skips it.`,
                workspace: makeWorkspace(`${label(current)} is already visited. Continue with the next stack cell.`, visited, stack, order)
            };
            continue;
        }
        visited.add(currentKey);
        order.push(label(current));
        yield {
            type: "visit",
            graph,
            current,
            visited: Array.from(visited),
            stack: stack.map(key),
            order: [...order],
            message: `Visit ${label(current)}.`,
            workspace: makeWorkspace(`${label(current)} becomes visited. DFS now checks nearby open cells.`, visited, stack, order)
        };
        if (samePoint(current, graph.target)) {
            const path = reconstructPath(parent, graph.start, graph.target);
            yield {
                type: "found",
                graph,
                current,
                visited: Array.from(visited),
                stack: stack.map(key),
                order: [...order],
                path,
                message: `Target found at ${label(current)}. DFS can reconstruct the path from parent links.`,
                workspace: {
                    title: "DFS Grid Workspace",
                    detail: "The target was reached. The highlighted path follows the parent chain back to S.",
                    rows: [
                        { label: "Path", values: path.map(value => label(pointFromKey(value))) },
                        { label: "Visited", values: Array.from(visited).map(value => label(pointFromKey(value))) }
                    ]
                }
            };
            return;
        }
        const neighbors = neighborsFor(graph, current);
        for (const neighbor of neighbors) {
            const neighborKey = key(neighbor);
            yield {
                type: "inspect-cell",
                graph,
                current,
                inspected: neighbor,
                visited: Array.from(visited),
                stack: stack.map(key),
                order: [...order],
                message: `Inspect neighbor ${label(neighbor)} from ${label(current)}.`,
                workspace: makeWorkspace(`Check whether ${label(neighbor)} is open and unvisited.`, visited, stack, order, neighbor)
            };
            if (visited.has(neighborKey) || stack.some(point => key(point) === neighborKey)) {
                yield {
                    type: "skip-cell",
                    graph,
                    current,
                    inspected: neighbor,
                    visited: Array.from(visited),
                    stack: stack.map(key),
                    order: [...order],
                    message: `${label(neighbor)} is already visited or waiting on the stack, so skip it.`,
                    workspace: makeWorkspace(`${label(neighbor)} does not need to be added again.`, visited, stack, order, neighbor)
                };
                continue;
            }
            parent.set(neighborKey, currentKey);
            stack.push(neighbor);
            yield {
                type: "push",
                graph,
                current: neighbor,
                previous: current,
                inspected: neighbor,
                visited: Array.from(visited),
                stack: stack.map(key),
                order: [...order],
                message: `Push ${label(neighbor)} onto the stack.`,
                workspace: makeWorkspace(`${label(neighbor)} is open and unvisited, so DFS adds it to the stack.`, visited, stack, order, neighbor)
            };
        }
        yield {
            type: "backtrack",
            graph,
            current,
            visited: Array.from(visited),
            stack: stack.map(key),
            order: [...order],
            message: `Finished checking ${label(current)}. DFS backtracks to the next stack cell.`,
            workspace: makeWorkspace(`All available neighbors of ${label(current)} have been checked.`, visited, stack, order)
        };
    }
    yield {
        type: "done",
        graph,
        visited: Array.from(visited),
        stack: [],
        order: [...order],
        message: "DFS finished without reaching the target.",
        workspace: {
            title: "DFS Grid Workspace",
            detail: "The stack is empty, so no remaining reachable cells can lead to the target.",
            rows: [
                { label: "Stack", values: ["empty"] },
                { label: "Visited", values: Array.from(visited).map(value => label(pointFromKey(value))) }
            ]
        }
    };
}

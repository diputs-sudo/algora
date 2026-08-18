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
function heuristic(point, target) {
    return Math.abs(point.row - target.row) + Math.abs(point.col - target.col);
}
function normalizeWeight(weight) {
    return Number.isFinite(weight) && weight >= 1 ? weight : 1;
}
function formatWeight(weight) {
    return Number.isInteger(weight) ? String(weight) : weight.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}
function neighborsFor(graph, point) {
    const walls = new Set(graph.walls.map(key));
    return [
        { row: point.row - 1, col: point.col },
        { row: point.row, col: point.col + 1 },
        { row: point.row + 1, col: point.col },
        { row: point.row, col: point.col - 1 }
    ].filter(next => next.row >= 0 && next.row < graph.height && next.col >= 0 && next.col < graph.width && !walls.has(key(next)));
}
function scoreValues(open, gScore, fScore, target) {
    return open.map(value => {
        const point = pointFromKey(value);
        const g = gScore.get(value) ?? Infinity;
        const h = heuristic(point, target);
        const f = fScore.get(value) ?? Infinity;
        return `${label(point)}: g${g} h${h} f${f}`;
    });
}
function makeWorkspace(detail, open, closed, gScore, fScore, target, heuristicWeight, current) {
    return {
        title: "A* Workspace",
        detail,
        rows: [
            {
                label: "Open Set",
                values: open.length > 0 ? scoreValues(open, gScore, fScore, target) : ["empty"],
                activeIndices: current ? open.indexOf(key(current)) >= 0 ? [open.indexOf(key(current))] : [] : []
            },
            {
                label: "Closed Set",
                values: closed.length > 0 ? closed.map(value => label(pointFromKey(value))) : ["empty"]
            },
            {
                label: "Current",
                values: current ? [label(current)] : ["none"]
            },
            {
                label: "Heuristic",
                values: [`w = ${formatWeight(heuristicWeight)}`]
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
function scoreRecord(scores) {
    return Object.fromEntries(scores.entries());
}
export function createAStarInitialStep(graph, heuristicWeight = 1) {
    heuristicWeight = normalizeWeight(heuristicWeight);
    const startKey = key(graph.start);
    const startHeuristic = heuristic(graph.start, graph.target);
    const startF = startHeuristic * heuristicWeight;
    return {
        type: "start",
        graph,
        current: graph.start,
        visited: [],
        stack: [startKey],
        order: [],
        distances: { [startKey]: 0 },
        message: `Start A* at ${label(graph.start)} with g=0, h=${startHeuristic}, and f=${startF} using w=${formatWeight(heuristicWeight)}.`,
        workspace: {
            title: "A* Workspace",
            detail: `The start cell enters the open set with f = g + ${formatWeight(heuristicWeight)}h.`,
            rows: [
                { label: "Open Set", values: [`${label(graph.start)}: g0 h${startHeuristic} f${startF}`], activeIndices: [0] },
                { label: "Closed Set", values: ["empty"] },
                { label: "Current", values: [label(graph.start)] },
                { label: "Heuristic", values: [`w = ${formatWeight(heuristicWeight)}`] }
            ]
        }
    };
}
export function* aStar(graph, heuristicWeight = 1) {
    heuristicWeight = normalizeWeight(heuristicWeight);
    const startKey = key(graph.start);
    const targetKey = key(graph.target);
    const gScore = new Map([[startKey, 0]]);
    const fScore = new Map([[startKey, heuristic(graph.start, graph.target) * heuristicWeight]]);
    const parent = new Map();
    const open = [startKey];
    const closed = new Set();
    const order = [];
    yield createAStarInitialStep(graph, heuristicWeight);
    while (open.length > 0) {
        open.sort((left, right) => {
            const fDifference = (fScore.get(left) ?? Infinity) - (fScore.get(right) ?? Infinity);
            if (fDifference !== 0)
                return fDifference;
            return (heuristic(pointFromKey(left), graph.target) - heuristic(pointFromKey(right), graph.target));
        });
        const currentKey = open.shift();
        const current = pointFromKey(currentKey);
        if (closed.has(currentKey))
            continue;
        closed.add(currentKey);
        order.push(label(current));
        yield {
            type: "visit",
            graph,
            current,
            visited: Array.from(closed),
            stack: [...open],
            order: [...order],
            distances: scoreRecord(gScore),
            message: `Choose ${label(current)} with the lowest estimated cost f=${fScore.get(currentKey)} using w=${formatWeight(heuristicWeight)}.`,
            workspace: makeWorkspace(`${label(current)} moves from the open set to the closed set.`, open, Array.from(closed), gScore, fScore, graph.target, heuristicWeight, current)
        };
        if (currentKey === targetKey) {
            const path = reconstructPath(parent, graph.start, graph.target);
            yield {
                type: "found",
                graph,
                current,
                visited: Array.from(closed),
                stack: [...open],
                order: [...order],
                path,
                distances: scoreRecord(gScore),
                message: `Target found with path cost g=${gScore.get(currentKey)}.`,
                workspace: {
                    title: "A* Workspace",
                    detail: `The path follows the parent links created with f = g + ${formatWeight(heuristicWeight)}h.`,
                    rows: [
                        { label: "Path", values: path.map(value => label(pointFromKey(value))) },
                        { label: "Cost", values: [String(gScore.get(currentKey))] },
                        { label: "Closed Set", values: Array.from(closed).map(value => label(pointFromKey(value))) }
                    ]
                }
            };
            return;
        }
        for (const neighbor of neighborsFor(graph, current)) {
            const neighborKey = key(neighbor);
            const tentativeG = (gScore.get(currentKey) ?? Infinity) + 1;
            const h = heuristic(neighbor, graph.target);
            const weightedH = h * heuristicWeight;
            const currentG = gScore.get(neighborKey) ?? Infinity;
            yield {
                type: "inspect-cell",
                graph,
                current,
                inspected: neighbor,
                visited: Array.from(closed),
                stack: [...open],
                order: [...order],
                distances: scoreRecord(gScore),
                message: `Inspect ${label(neighbor)} with candidate g=${tentativeG}, h=${h}, and f=${tentativeG + weightedH}.`,
                workspace: makeWorkspace(`Compare the candidate g=${tentativeG} with ${label(neighbor)}'s current g=${currentG === Infinity ? "infinity" : currentG}.`, open, Array.from(closed), gScore, fScore, graph.target, heuristicWeight, neighbor)
            };
            if (closed.has(neighborKey) || tentativeG >= currentG)
                continue;
            parent.set(neighborKey, currentKey);
            gScore.set(neighborKey, tentativeG);
            fScore.set(neighborKey, tentativeG + weightedH);
            if (!open.includes(neighborKey))
                open.push(neighborKey);
            yield {
                type: "push",
                graph,
                current,
                previous: current,
                inspected: neighbor,
                visited: Array.from(closed),
                stack: [...open],
                order: [...order],
                distances: scoreRecord(gScore),
                message: `Add ${label(neighbor)} to the open set with f=${tentativeG + weightedH}.`,
                workspace: makeWorkspace(`${label(neighbor)} is now scored with g=${tentativeG}, h=${h}, and f=${tentativeG + weightedH}.`, open, Array.from(closed), gScore, fScore, graph.target, heuristicWeight, neighbor)
            };
        }
    }
    yield {
        type: "done",
        graph,
        visited: Array.from(closed),
        stack: [],
        order: [...order],
        distances: scoreRecord(gScore),
        message: "The open set is empty, so no path remains to explore.",
        workspace: makeWorkspace("A* finished without reaching the target.", [], Array.from(closed), gScore, fScore, graph.target, heuristicWeight)
    };
}

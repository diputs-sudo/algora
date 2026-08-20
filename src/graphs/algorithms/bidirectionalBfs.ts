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

    function recordDistances(
        forward: Map<string, number>,
        backward: Map<string, number>
    ): Record<string, number> {
        const distances: Record<string, number> = {};
        for (const [value, distance] of forward) distances[`f:${value}`] = distance;
        for (const [value, distance] of backward) distances[`b:${value}`] = distance;
        return distances;
    }

    function pathFromMeeting(
        meeting: string,
        forwardParent: Map<string, string>,
        backwardParent: Map<string, string>,
        start: string,
        target: string): string[] {
            const left = [meeting];
            let current = meeting;
            while (current !== start) {
                const parent = forwardParent.get(current);
                if (!parent) break;
                current = parent;
                left.push(current);
            }
            left.reverse();

            const right: string[] = [];
            current = meeting;
            while (current !== target) {
                const parent = backwardParent.get(current);
                if (!parent) break;
                current = parent;
                right.push(current);
            }
            return left.concat(right);
        }

        function makeWorkspace(
            detail: string,
            forwardFrontier: string[],
            backwardFrontier: string[],
            forwardSeen: Set<string>,
            backwardSeen: Set<string>,
            meeting?: string): GraphWorkspaceState {
                return {
                    title: "Bidirectional BFS Workspace",
                    detail,
                    rows: [
                        {
                            label: "Forward frontier",
                            values: forwardFrontier.length > 0 ? forwardFrontier.map(value => label(pointFromKey(value))) : ["empty"],
                            activeIndices: forwardFrontier.length > 0 ? [0] : []
                        },
                        {
                            label: "Backward frontier",
                            values: backwardFrontier.length > 0 ? backwardFrontier.map(value => label(pointFromKey(value))) : ["empty"],
                            activeIndices: backwardFrontier.length > 0 ? [0] : []
                        },
                        {
                            label: "Seen",
                            values: [`forward ${forwardSeen.size}`, `backward ${backwardSeen.size}`]
                        },
                        {
                            label: "Meeting",
                            values: meeting ? [label(pointFromKey(meeting))] : ["none"]
                        }
                    ]
                };
            }

            function stepState(
                graph: GraphData,
                type: GraphStep["type"],
                forwardSeen: Set<string>,
                backwardSeen: Set<string>,
                forwardFrontier: string[],
                backwardFrontier: string[],
                order: string[],
                message: string,
                workspace: GraphWorkspaceState,
                extras: Partial<GraphStep> = {}
            ): GraphStep {
                return {
                    type,
                    graph,
                    visited: [...forwardSeen],
                    secondaryVisited: [...backwardSeen],
                    stack: [...forwardFrontier],
                    secondaryStack: [...backwardFrontier],
                    order: [...order],
                    distances: extras.distances,
                    message,
                    workspace,
                    ...extras};
                }

                export function createBidirectionalBfsInitialStep(graph: GraphData): GraphStep {
                    const start = key(graph.start);
                    const target = key(graph.target);
                    return stepState(
                        graph,
                        "start",
                        new Set([start]),
                        new Set([target]),
                        [start],
                        [target],
                        [],
                        `Start forward BFS at ${label(graph.start)} and backward BFS at ${label(graph.target)}.`,
                        makeWorkspace(
                            "Two queues expand from opposite ends of the same unweighted grid.",
                            [start],
                            [target],
                            new Set([start]),
                            new Set([target])
                        ),
                        {
                            current: graph.start,
                            distances: { [`f:${start}`]: 0, [`b:${target}`]: 0 }
                        }
                    );
                }

                export function* bidirectionalBfs(graph: GraphData): Generator<GraphStep> {
                    const start = key(graph.start);
                    const target = key(graph.target);
                    const forwardSeen = new Set([start]);
                    const backwardSeen = new Set([target]);
                    const forwardParent = new Map<string, string>();
                    const backwardParent = new Map<string, string>();
                    const forwardDistance = new Map([[start, 0]]);
                    const backwardDistance = new Map([[target, 0]]);
                    let forwardFrontier = [start];
                    let backwardFrontier = [target];
                    const order: string[] = [];

                    yield createBidirectionalBfsInitialStep(graph);

                    if (start === target) {
                        yield stepState(
                            graph,
                            "found",
                            forwardSeen,
                            backwardSeen,
                            [],
                            [],
                            order,
                            "The start and target are the same cell, so the path is complete.",
                            makeWorkspace("The two searches meet immediately.", [], [], forwardSeen, backwardSeen, start),
                            { path: [start], meeting: [start], current: graph.start, distances: recordDistances(forwardDistance, backwardDistance) }
                        );
                        return;
                    }

                    while (forwardFrontier.length > 0 && backwardFrontier.length > 0) {
                        const expandForward = forwardFrontier.length <= backwardFrontier.length;
                        const side = expandForward ? "forward" : "backward";
                        const currentLayer = expandForward ? forwardFrontier : backwardFrontier;
                        const nextLayer: string[] = [];

                        for (const currentKey of currentLayer) {
                            const current = pointFromKey(currentKey);
                            order.push(`${side[0].toUpperCase()} ${label(current)}`);
                            yield stepState(
                                graph,
                                "visit",
                                forwardSeen,
                                backwardSeen,
                                expandForward ? currentLayer : forwardFrontier,
                                expandForward ? backwardFrontier : currentLayer,
                                order,
                                `${side === "forward" ? "Forward" : "Backward"} search expands ${label(current)}.`,
                                makeWorkspace(
                                    `Expand one ${side} layer; the smaller frontier is processed next.`,
                                    expandForward ? currentLayer : forwardFrontier,
                                    expandForward ? backwardFrontier : currentLayer,
                                    forwardSeen,
                                    backwardSeen),
                                    { current, distances: recordDistances(forwardDistance, backwardDistance) }
                                );

                                for (const neighbor of neighborsFor(graph, current)) {
                                    const neighborKey = key(neighbor);
                                    const ownSeen = expandForward ? forwardSeen : backwardSeen;
                                    const otherSeen = expandForward ? backwardSeen : forwardSeen;

                                    yield stepState(
                                        graph,
                                        "inspect-cell",
                                        forwardSeen,
                                        backwardSeen,
                                        expandForward ? currentLayer : forwardFrontier,
                                        expandForward ? backwardFrontier : currentLayer,
                                        order,
                                        `${side === "forward" ? "Forward" : "Backward"} search inspects ${label(neighbor)} from ${label(current)}.`,
                                        makeWorkspace(
                                            "A meeting is possible when the inspected cell is already seen from the opposite side.",
                                            expandForward ? currentLayer : forwardFrontier,
                                            expandForward ? backwardFrontier : currentLayer,
                                            forwardSeen,
                                            backwardSeen),
                                            { current, inspected: neighbor, distances: recordDistances(forwardDistance, backwardDistance) }
                                        );

                                        if (ownSeen.has(neighborKey)) continue;

                                        ownSeen.add(neighborKey);
                                        (expandForward ? forwardParent : backwardParent).set(neighborKey, currentKey);
                                        (expandForward ? forwardDistance : backwardDistance).set(
                                            neighborKey,
                                            (expandForward ? forwardDistance : backwardDistance).get(currentKey)! + 1
                                        );
                                        nextLayer.push(neighborKey);

                                        if (otherSeen.has(neighborKey)) {
                                            const path = pathFromMeeting(neighborKey, forwardParent, backwardParent, start, target);
                                            yield stepState(
                                                graph,
                                                "found",
                                                forwardSeen,
                                                backwardSeen,
                                                [],
                                                [],
                                                order,
                                                `The frontiers meet at ${label(neighbor)} after ${path.length - 1} moves.`,
                                                makeWorkspace(
                                                    "Join the forward parent chain to the backward parent chain at the meeting cell.",
                                                    [],
                                                    [],
                                                    forwardSeen,
                                                    backwardSeen,
                                                    neighborKey),
                                                    {
                                                        current: neighbor,
                                                        path,
                                                        meeting: [neighborKey],
                                                        distances: recordDistances(forwardDistance, backwardDistance)
                                                    }
                                                );
                                                return;
                                            }

                                            yield stepState(
                                                graph,
                                                "push",
                                                forwardSeen,
                                                backwardSeen,
                                                expandForward ? currentLayer : forwardFrontier,
                                                expandForward ? backwardFrontier : currentLayer,
                                                order,
                                                `${side === "forward" ? "Forward" : "Backward"} search adds ${label(neighbor)} to its next layer.`,
                                                makeWorkspace(
                                                    `${label(neighbor)} is discovered from the ${side} side.`,
                                                    expandForward ? currentLayer : forwardFrontier,
                                                    expandForward ? backwardFrontier : currentLayer,
                                                    forwardSeen,
                                                    backwardSeen),
                                                    { current, inspected: neighbor, distances: recordDistances(forwardDistance, backwardDistance) }
                                                );
                                            }
                                        }

                                        if (expandForward) forwardFrontier = nextLayer;
                                        else backwardFrontier = nextLayer;
                                    }

                                    yield stepState(
                                        graph,
                                        "done",
                                        forwardSeen,
                                        backwardSeen,
                                        [],
                                        [],
                                        order,
                                        "The two frontiers became empty without meeting, so no path exists.",
                                        makeWorkspace("Both searches are exhausted.", [], [], forwardSeen, backwardSeen),
                                        { distances: recordDistances(forwardDistance, backwardDistance) }
                                    );
                                }

                                
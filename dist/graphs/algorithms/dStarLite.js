function key(point) {
    return `${point.row},${point.col}`;
}
function pointFromKey(value) {
    const [row, col] = value.split(",").map(Number);
    return { row, col };
}
function label(value) {
    const point = pointFromKey(value);
    return `r${point.row + 1}c${point.col + 1}`;
}
function heuristic(graph, left, right) {
    const a = pointFromKey(left);
    const b = pointFromKey(right);
    const row = Math.abs(a.row - b.row);
    const col = Math.abs(a.col - b.col);
    if (graph.heuristic === "euclidean")
        return Math.hypot(row, col);
    if (graph.heuristic === "chebyshev")
        return Math.max(row, col);
    if (graph.heuristic === "octile")
        return Math.max(row, col) + (Math.SQRT2 - 1) * Math.min(row, col);
    return row + col;
}
function format(value) {
    return Number.isFinite(value) ? String(value) : "infinity";
}
export class DStarLitePlanner {
    constructor(graph) {
        this.g = new Map();
        this.rhs = new Map();
        this.queue = [];
        this.expanded = new Set();
        this.km = 0;
        this.graph = this.snapshotGraph(graph);
        this.start = key(graph.start);
        this.goal = key(graph.target);
        this.rhs.set(this.goal, 0);
        this.enqueue(this.goal);
    }
    initialStep() {
        return this.makeStep("start", "Planner initialized. The goal has rhs = 0 and is the first inconsistent vertex in the queue.", [], this.goal);
    }
    snapshot() {
        return this.snapshotGraph(this.graph);
    }
    *computeShortestPath(phase, changed = []) {
        while (this.needsRepair()) {
            const entry = this.queue.shift();
            const oldKey = [entry.first, entry.second];
            const newKey = this.calculateKey(entry.value);
            if (this.keyLess(oldKey, newKey)) {
                this.enqueue(entry.value);
                continue;
            }
            if (this.valueOf(this.g, entry.value) > this.valueOf(this.rhs, entry.value)) {
                this.g.set(entry.value, this.valueOf(this.rhs, entry.value));
                for (const predecessor of this.openNeighbors(entry.value))
                    this.updateVertex(predecessor);
            }
            else {
                this.g.set(entry.value, Infinity);
                this.updateVertex(entry.value);
                for (const predecessor of this.openNeighbors(entry.value))
                    this.updateVertex(predecessor);
            }
            this.expanded.add(entry.value);
            const verb = phase === "repair" ? "Repairing" : "Planning";
            yield this.makeStep("inspect-cell", `${verb} ${label(entry.value)}: g = ${format(this.valueOf(this.g, entry.value))}, rhs = ${format(this.valueOf(this.rhs, entry.value))}.`, changed, entry.value);
        }
        const path = this.reconstructPath();
        const message = path.length > 0
            ? phase === "repair"
                ? "Path Ready - repair complete. The previous planner state was updated locally."
                : "Path Ready - waiting for obstacle changes."
            : "No path is currently available.";
        yield this.makeStep("done", message, changed, undefined, path);
    }
    *changeWall(point) {
        const value = key(point);
        const wasWall = this.graph.walls.some(wall => key(wall) === value);
        this.graph.walls = wasWall
            ? this.graph.walls.filter(wall => key(wall) !== value)
            : [...this.graph.walls, point];
        const affected = new Set([value, ...this.adjacentKeys(value)]);
        affected.forEach(candidate => {
            if (!this.isWall(candidate))
                this.updateVertex(candidate);
        });
        const change = wasWall ? `Removed wall at ${label(value)}.` : `Added wall at ${label(value)}.`;
        yield this.makeStep("inspect-cell", `${change} Repairing only affected vertices; planner state is preserved.`, [value], value);
        yield* this.computeShortestPath("repair", [value]);
    }
    needsRepair() {
        const top = this.queue[0];
        if (!top)
            return this.valueOf(this.rhs, this.start) !== this.valueOf(this.g, this.start);
        const startKey = this.calculateKey(this.start);
        return this.keyLess([top.first, top.second], startKey)
            || this.valueOf(this.rhs, this.start) !== this.valueOf(this.g, this.start);
    }
    updateVertex(value) {
        if (value !== this.goal) {
            const best = this.openNeighbors(value).reduce((minimum, neighbor) => Math.min(minimum, 1 + this.valueOf(this.g, neighbor)), Infinity);
            this.rhs.set(value, best);
        }
        this.removeFromQueue(value);
        if (this.valueOf(this.g, value) !== this.valueOf(this.rhs, value))
            this.enqueue(value);
    }
    enqueue(value) {
        this.removeFromQueue(value);
        const [first, second] = this.calculateKey(value);
        this.queue.push({ value, first, second });
        this.queue.sort((a, b) => a.first - b.first || a.second - b.second || a.value.localeCompare(b.value));
    }
    removeFromQueue(value) {
        const index = this.queue.findIndex(entry => entry.value === value);
        if (index >= 0)
            this.queue.splice(index, 1);
    }
    calculateKey(value) {
        const minimum = Math.min(this.valueOf(this.g, value), this.valueOf(this.rhs, value));
        return [minimum + heuristic(this.graph, this.start, value) + this.km, minimum];
    }
    keyLess(left, right) {
        return left[0] < right[0] || (left[0] === right[0] && left[1] < right[1]);
    }
    openNeighbors(value) {
        return this.adjacentKeys(value).filter(candidate => !this.isWall(candidate));
    }
    adjacentKeys(value) {
        const point = pointFromKey(value);
        return [
            { row: point.row - 1, col: point.col },
            { row: point.row, col: point.col + 1 },
            { row: point.row + 1, col: point.col },
            { row: point.row, col: point.col - 1 }
        ]
            .filter(next => next.row >= 0 && next.row < this.graph.height && next.col >= 0 && next.col < this.graph.width)
            .map(key);
    }
    isWall(value) {
        return this.graph.walls.some(wall => key(wall) === value);
    }
    reconstructPath() {
        if (!Number.isFinite(this.valueOf(this.g, this.start)))
            return [];
        const path = [this.start];
        let current = this.start;
        for (let index = 0; index < this.graph.width * this.graph.height && current !== this.goal; index++) {
            const next = this.openNeighbors(current)
                .sort((a, b) => {
                const left = 1 + this.valueOf(this.g, a);
                const right = 1 + this.valueOf(this.g, b);
                return left - right || a.localeCompare(b);
            })[0];
            if (!next || !Number.isFinite(this.valueOf(this.g, next)))
                return [];
            path.push(next);
            current = next;
        }
        return current === this.goal ? path : [];
    }
    makeWorkspace(detail, changed) {
        const values = [...this.expanded].slice(-8);
        const relevant = [...new Set([...values, this.start, ...changed])];
        return {
            title: "D* Lite Workspace",
            detail,
            rows: [
                { label: "Priority Queue", values: this.queue.length > 0 ? this.queue.slice(0, 9).map(entry => `${label(entry.value)} [${entry.first.toFixed(1)},${entry.second.toFixed(1)}]`) : ["empty"] },
                { label: "g", values: relevant.map(value => `${label(value)}: ${format(this.valueOf(this.g, value))}`) },
                { label: "rhs", values: relevant.map(value => `${label(value)}: ${format(this.valueOf(this.rhs, value))}`) },
                { label: "km", values: [String(this.km)] },
                { label: "Changed", values: changed.length > 0 ? changed.map(label) : ["none"] }
            ]
        };
    }
    makeStep(type, message, changed, inspected, path = []) {
        return {
            type,
            graph: this.snapshotGraph(this.graph),
            current: pointFromKey(this.start),
            inspected: inspected ? pointFromKey(inspected) : undefined,
            visited: [...this.expanded],
            stack: this.queue.map(entry => entry.value),
            order: [...this.expanded],
            path,
            message,
            workspace: this.makeWorkspace(message, changed)
        };
    }
    valueOf(values, value) {
        return values.get(value) ?? Infinity;
    }
    snapshotGraph(graph) {
        return {
            ...graph,
            walls: graph.walls.map(point => ({ ...point })),
            costs: graph.costs ? { ...graph.costs } : undefined
        };
    }
}

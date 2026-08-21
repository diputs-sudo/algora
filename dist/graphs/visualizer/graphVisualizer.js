function key(point) {
    return `${point.row},${point.col}`;
}
export class GraphVisualizer {
    constructor(containerId) {
        this.stepCount = 0;
        this.editMode = "wall";
        this.onGridEdit = null;
        this.onRender = null;
        this.pointerDragging = false;
        this.suppressClick = false;
        const element = document.getElementById(containerId);
        if (!element) {
            throw new Error("Grid visualizer container not found");
        }
        this.container = element;
        this.container.innerHTML = "";
        this.container.classList.add("graph-visualizer", "grid-visualizer");
        this.statsRoot = document.createElement("div");
        this.statsRoot.classList.add("visualizer-stats");
        this.stepCounter = document.createElement("div");
        this.stepCounter.classList.add("visualizer-stat", "visualizer-step-counter");
        this.visitCounter = document.createElement("div");
        this.visitCounter.classList.add("visualizer-stat");
        this.statsRoot.appendChild(this.stepCounter);
        this.statsRoot.appendChild(this.visitCounter);
        this.statusRoot = document.createElement("div");
        this.statusRoot.classList.add("graph-status");
        this.gridShell = document.createElement("div");
        this.gridShell.classList.add("path-grid-shell");
        this.columnLabels = document.createElement("div");
        this.columnLabels.classList.add("path-column-labels");
        this.rowLabels = document.createElement("div");
        this.rowLabels.classList.add("path-row-labels");
        this.gridRoot = document.createElement("div");
        this.gridRoot.classList.add("path-grid");
        this.gridShell.appendChild(this.columnLabels);
        this.gridShell.appendChild(this.rowLabels);
        this.gridShell.appendChild(this.gridRoot);
        this.workspaceRoot = document.createElement("div");
        this.workspaceRoot.classList.add("visualizer-workspace", "graph-workspace");
        this.workspaceTitle = document.createElement("div");
        this.workspaceTitle.classList.add("visualizer-workspace-title");
        this.workspaceDetail = document.createElement("div");
        this.workspaceDetail.classList.add("visualizer-workspace-detail");
        this.workspaceRows = document.createElement("div");
        this.workspaceRows.classList.add("visualizer-workspace-rows");
        this.workspaceRoot.appendChild(this.workspaceTitle);
        this.workspaceRoot.appendChild(this.workspaceDetail);
        this.workspaceRoot.appendChild(this.workspaceRows);
        const counterHost = this.findCounterHost();
        counterHost?.appendChild(this.statsRoot);
        this.container.appendChild(this.statusRoot);
        this.container.appendChild(this.gridShell);
        this.container.appendChild(this.workspaceRoot);
        window.addEventListener("pointerup", () => {
            this.pointerDragging = false;
        });
        this.setStepCount(0);
        this.setVisitCount(0);
    }
    findCounterHost() {
        const visualizerSection = this.container.closest(".visualizer");
        const dedicatedHost = visualizerSection?.querySelector(".visualizer-counter-host");
        return dedicatedHost ?? this.container;
    }
    render(step) {
        this.statusRoot.textContent = step.message;
        this.setVisitCount(step.visited.length, step.counterLabel);
        this.renderGrid(step);
        this.renderWorkspace(step.workspace);
        this.onRender?.(step);
    }
    setEditMode(mode) {
        this.editMode = mode;
        this.gridRoot.dataset.editMode = mode;
    }
    setWorkspaceMode(mode) {
        this.container.dataset.workspaceMode = mode;
    }
    setGridEditHandler(handler) {
        this.onGridEdit = handler;
    }
    setRenderHandler(handler) {
        this.onRender = handler;
    }
    renderGrid(step) {
        this.gridRoot.innerHTML = "";
        this.gridRoot.style.setProperty("--grid-cols", String(step.graph.width));
        this.gridRoot.style.setProperty("--grid-rows", String(step.graph.height));
        this.columnLabels.innerHTML = "";
        this.rowLabels.innerHTML = "";
        this.columnLabels.style.setProperty("--grid-cols", String(step.graph.width));
        this.rowLabels.style.setProperty("--grid-rows", String(step.graph.height));
        for (let col = 0; col < step.graph.width; col++) {
            const label = document.createElement("span");
            label.textContent = `C${col + 1}`;
            this.columnLabels.appendChild(label);
        }
        for (let row = 0; row < step.graph.height; row++) {
            const label = document.createElement("span");
            label.textContent = `R${row + 1}`;
            this.rowLabels.appendChild(label);
        }
        const wallKeys = new Set(step.graph.walls.map(key));
        const visitedKeys = new Set(step.visited);
        const secondaryVisitedKeys = new Set(step.secondaryVisited ?? []);
        const stackKeys = new Set(step.stack);
        const secondaryStackKeys = new Set(step.secondaryStack ?? []);
        const pathKeys = new Set(step.path ?? []);
        const meetingKeys = new Set(step.meeting ?? []);
        const currentKey = step.current ? key(step.current) : "";
        const inspectedKey = step.inspected ? key(step.inspected) : "";
        const startKey = key(step.graph.start);
        const targetKey = key(step.graph.target);
        for (let row = 0; row < step.graph.height; row++) {
            for (let col = 0; col < step.graph.width; col++) {
                const pointKey = `${row},${col}`;
                const cell = document.createElement("div");
                cell.classList.add("path-cell");
                cell.setAttribute("aria-label", `row ${row + 1}, column ${col + 1}`);
                cell.setAttribute("role", "button");
                cell.tabIndex = 0;
                const edit = () => this.onGridEdit?.({ row, col }, this.editMode);
                cell.addEventListener("click", () => {
                    if (this.suppressClick) {
                        this.suppressClick = false;
                        return;
                    }
                    edit();
                });
                cell.addEventListener("pointerdown", event => {
                    if (event.button === 0) {
                        this.pointerDragging = true;
                        this.suppressClick = true;
                        edit();
                    }
                });
                cell.addEventListener("pointerenter", () => {
                    if (this.pointerDragging)
                        edit();
                });
                cell.addEventListener("keydown", event => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        edit();
                    }
                });
                if (wallKeys.has(pointKey)) {
                    cell.classList.add("is-wall");
                }
                if (visitedKeys.has(pointKey)) {
                    cell.classList.add("is-visited");
                }
                if (secondaryVisitedKeys.has(pointKey)) {
                    cell.classList.add("is-visited-secondary");
                }
                if (stackKeys.has(pointKey)) {
                    cell.classList.add("is-stacked");
                }
                if (secondaryStackKeys.has(pointKey)) {
                    cell.classList.add("is-stacked-secondary");
                }
                if (pathKeys.has(pointKey)) {
                    cell.classList.add("is-path");
                }
                if (meetingKeys.has(pointKey)) {
                    cell.classList.add("is-meeting");
                }
                if (pointKey === inspectedKey) {
                    cell.classList.add("is-inspected");
                }
                if (pointKey === currentKey) {
                    cell.classList.add("is-current");
                }
                if (pointKey === startKey) {
                    cell.classList.add("is-start");
                    cell.textContent = "S";
                }
                if (pointKey === targetKey) {
                    cell.classList.add("is-target");
                    cell.textContent = "T";
                }
                if (pointKey !== startKey && pointKey !== targetKey && !wallKeys.has(pointKey) && step.graph.costs) {
                    cell.textContent = String(step.graph.costs[pointKey] ?? 1);
                }
                else if (pointKey !== startKey && pointKey !== targetKey && !wallKeys.has(pointKey) && step.graph.weights) {
                    cell.textContent = String(step.graph.weights[pointKey] ?? 0);
                }
                this.gridRoot.appendChild(cell);
            }
        }
    }
    renderWorkspace(workspace) {
        if (!workspace || workspace.rows.length === 0) {
            this.workspaceRoot.classList.add("hidden");
            this.workspaceTitle.textContent = "";
            this.workspaceDetail.textContent = "";
            this.workspaceRows.innerHTML = "";
            return;
        }
        this.workspaceRoot.classList.remove("hidden");
        this.workspaceTitle.textContent = workspace.title ?? "Grid Workspace";
        this.workspaceDetail.textContent = workspace.detail ?? "";
        this.workspaceRows.innerHTML = "";
        workspace.rows.forEach(row => {
            const rowElement = document.createElement("div");
            rowElement.classList.add("visualizer-workspace-row");
            const labelElement = document.createElement("div");
            labelElement.classList.add("visualizer-workspace-label");
            labelElement.textContent = row.label;
            const valuesElement = document.createElement("div");
            valuesElement.classList.add("visualizer-workspace-values");
            row.values.forEach((value, index) => {
                const valueElement = document.createElement("span");
                valueElement.classList.add("visualizer-workspace-cell");
                valueElement.textContent = value === null ? "." : String(value);
                if (row.activeIndices?.includes(index)) {
                    valueElement.classList.add("active");
                }
                valuesElement.appendChild(valueElement);
            });
            rowElement.appendChild(labelElement);
            rowElement.appendChild(valuesElement);
            this.workspaceRows.appendChild(rowElement);
        });
    }
    setStepCount(count) {
        this.stepCount = count;
        this.stepCounter.textContent = `Steps ${count}`;
    }
    incrementStepCount() {
        this.setStepCount(this.stepCount + 1);
    }
    resetStepCount() {
        this.setStepCount(0);
    }
    setVisitCount(count, label = "Visited") {
        this.visitCounter.textContent = `${label} ${count}`;
    }
}

export class SearchVisualizer {
    constructor(containerId) {
        this.pointerSlots = [];
        const element = document.getElementById(containerId);
        if (!element) {
            throw new Error("Search visualizer container not found");
        }
        this.container = element;
        this.container.innerHTML = "";
        this.container.classList.add("search-visualizer");
        this.statsRoot = document.createElement("div");
        this.statsRoot.classList.add("visualizer-stats");
        this.stepCounter = document.createElement("div");
        this.stepCounter.classList.add("visualizer-stat");
        this.resultCounter = document.createElement("div");
        this.resultCounter.classList.add("visualizer-stat");
        this.statsRoot.appendChild(this.stepCounter);
        this.statsRoot.appendChild(this.resultCounter);
        this.statusRoot = document.createElement("div");
        this.statusRoot.classList.add("search-status");
        this.gridRoot = document.createElement("div");
        this.gridRoot.classList.add("search-array-grid");
        this.workspaceRoot = document.createElement("div");
        this.workspaceRoot.classList.add("visualizer-workspace", "hidden");
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
        this.container.appendChild(this.gridRoot);
        this.container.appendChild(this.workspaceRoot);
        this.setStepCount(0);
        this.setResult("Waiting");
    }
    findCounterHost() {
        const visualizerSection = this.container.closest(".visualizer");
        const dedicatedHost = visualizerSection?.querySelector(".visualizer-counter-host");
        if (dedicatedHost) {
            return dedicatedHost;
        }
        const speedControl = visualizerSection?.querySelector(".speed-control");
        return speedControl ?? this.container;
    }
    render(step) {
        this.gridRoot.innerHTML = "";
        this.pointerSlots = [];
        this.container.style.setProperty("--search-cell-count", String(Math.min(Math.max(step.array.length, 1), 20)));
        this.statusRoot.textContent = step.message ?? "Set a sorted array and target, then step through the search.";
        step.array.forEach((value, index) => {
            const item = document.createElement("div");
            item.classList.add("search-array-item");
            const indexCell = document.createElement("div");
            indexCell.classList.add("search-index");
            indexCell.textContent = String(index);
            item.appendChild(indexCell);
            const cell = document.createElement("div");
            cell.classList.add("search-cell");
            const valueElement = document.createElement("span");
            valueElement.classList.add("search-cell-value");
            valueElement.textContent = String(value);
            cell.appendChild(valueElement);
            if (step.low !== undefined && step.high !== undefined && index >= step.low && index <= step.high) {
                cell.classList.add("in-range");
            }
            if (index === step.mid || step.highlightIndices?.includes(index)) {
                cell.classList.add("mid");
            }
            if (index === step.resultIndex && step.type === "found") {
                cell.classList.add("found");
            }
            if (step.type === "miss" && index === step.mid) {
                cell.classList.add("miss");
            }
            item.appendChild(cell);
            const pointerSlot = document.createElement("div");
            pointerSlot.classList.add("search-pointer-slot");
            item.appendChild(pointerSlot);
            this.pointerSlots[index] = pointerSlot;
            this.gridRoot.appendChild(item);
        });
        this.renderPointers(step);
        this.renderWorkspace(step.workspace);
        this.setResult(this.getResultText(step));
    }
    renderPointers(step) {
        const pointers = step.pointers ?? [
            { label: "low", index: step.low },
            { label: "mid", index: step.mid },
            { label: "high", index: step.high }
        ];
        pointers.forEach(pointer => {
            if (pointer.index === undefined || pointer.index < 0 || pointer.index >= step.array.length) {
                return;
            }
            const marker = document.createElement("div");
            marker.classList.add("search-pointer", `search-pointer-${pointer.label}`);
            marker.textContent = pointer.label;
            this.pointerSlots[pointer.index]?.appendChild(marker);
        });
    }
    renderWorkspace(workspace) {
        if (!workspace || workspace.rows.length === 0) {
            this.container.classList.remove("has-workspace");
            this.workspaceRoot.classList.add("hidden");
            this.workspaceRows.innerHTML = "";
            return;
        }
        this.container.classList.add("has-workspace");
        this.workspaceRoot.classList.remove("hidden");
        this.workspaceTitle.textContent = workspace.title ?? "Search Workspace";
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
                valueElement.textContent = value === null ? "-" : String(value);
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
        this.stepCounter.textContent = `Probes ${count}`;
    }
    resetStepCount() {
        this.setStepCount(0);
    }
    setResult(text) {
        this.resultCounter.textContent = text;
    }
    getResultText(step) {
        if (step.type === "found") {
            return `Found at index ${step.resultIndex}`;
        }
        if (step.type === "miss" || step.type === "done") {
            return step.resultIndex === -1 ? "Not found" : "Complete";
        }
        return `Target ${step.target}`;
    }
}

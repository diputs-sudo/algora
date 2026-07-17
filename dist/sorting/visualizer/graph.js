export class Graph {
    constructor(containerId) {
        this.bars = [];
        this.stepCount = 0;
        this.memoryUsed = 0;
        this.peakMemoryUsed = 0;
        this.memoryLabel = "Memory";
        this.memoryUnit = "items";
        const element = document.getElementById(containerId);
        if (!element) {
            throw new Error("Graph container not found");
        }
        this.container = element;
        this.container.innerHTML = "";
        this.statsRoot = document.createElement("div");
        this.statsRoot.classList.add("visualizer-stats");
        this.stepCounter = document.createElement("div");
        this.stepCounter.classList.add("visualizer-stat", "visualizer-step-counter");
        this.memoryCounter = document.createElement("div");
        this.memoryCounter.classList.add("visualizer-stat", "visualizer-memory-counter");
        this.statsRoot.appendChild(this.stepCounter);
        this.statsRoot.appendChild(this.memoryCounter);
        this.barsRoot = document.createElement("div");
        this.barsRoot.classList.add("visualizer-bars");
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
        this.container.appendChild(this.barsRoot);
        this.container.appendChild(this.workspaceRoot);
        this.setStepCount(0);
        this.setMemoryUsage(0);
    }
    findCounterHost() {
        const visualizerSection = this.container.closest(".visualizer");
        const dedicatedHost = visualizerSection?.querySelector(".visualizer-counter-host");
        if (dedicatedHost) {
            return dedicatedHost;
        }
        const speedControl = visualizerSection?.querySelector(".speed-control");
        if (speedControl) {
            return speedControl;
        }
        const homeHeader = this.container
            .closest(".home-visualizer")
            ?.querySelector(".home-visualizer-header");
        if (homeHeader) {
            return homeHeader;
        }
        return this.container;
    }
    render(array, highlight = [], type = "default", workspace) {
        this.barsRoot.innerHTML = "";
        this.bars = [];
        const max = Math.max(...array, 0);
        const safeMax = max > 0 ? max : 1;
        array.forEach((value, index) => {
            const bar = document.createElement("div");
            bar.classList.add("bar");
            bar.style.height = `${(value / safeMax) * 100}%`;
            if (highlight.includes(index)) {
                if (type === "compare") {
                    bar.style.backgroundColor = "#facc15";
                }
                else if (type === "swap") {
                    bar.style.backgroundColor = "#ef4444";
                }
            }
            else {
                bar.style.backgroundColor = "#3b82f6";
            }
            this.barsRoot.appendChild(bar);
            this.bars.push(bar);
        });
        this.renderWorkspace(workspace);
    }
    renderWorkspace(workspace) {
        if (!workspace || workspace.rows.length === 0) {
            this.container.classList.remove("has-workspace");
            this.workspaceRoot.classList.add("hidden");
            this.workspaceTitle.textContent = "";
            this.workspaceDetail.textContent = "";
            this.workspaceRows.innerHTML = "";
            return;
        }
        this.container.classList.add("has-workspace");
        this.workspaceRoot.classList.remove("hidden");
        this.workspaceTitle.textContent = workspace.title ?? "Algorithm Workspace";
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
                valueElement.textContent = value === null ? "·" : String(value);
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
    setMemoryUsage(count, label = "Memory", unit = "items") {
        this.memoryUsed = count;
        this.peakMemoryUsed = Math.max(this.peakMemoryUsed, count);
        this.memoryLabel = label;
        this.memoryUnit = unit;
        const suffix = count === 1 ? unit.replace(/s$/, "") : unit;
        this.memoryCounter.textContent = `${label} ${count} ${suffix}`;
    }
    showPeakMemoryUsage() {
        const count = this.peakMemoryUsed;
        const suffix = count === 1 ? this.memoryUnit.replace(/s$/, "") : this.memoryUnit;
        this.memoryCounter.textContent = `Max ${this.memoryLabel} ${count} ${suffix}`;
    }
    resetMemoryUsage() {
        this.peakMemoryUsed = 0;
        this.setMemoryUsage(0, this.memoryLabel, this.memoryUnit);
    }
    markSorted() {
        this.bars.forEach(bar => {
            bar.style.backgroundColor = "#22c55e";
        });
    }
}

import { InterpolationInsight, SearchStep, SearchWorkspaceState } from "./types.js";

export class SearchVisualizer {
    private container: HTMLElement;
    private statsRoot: HTMLDivElement;
    private stepCounter: HTMLDivElement;
    private resultCounter: HTMLDivElement;
    private statusRoot: HTMLDivElement;
    private gridRoot: HTMLDivElement;
    private pointerSlots: HTMLDivElement[] = [];
    private interpolationRoot: HTMLDivElement;
    private workspaceRoot: HTMLDivElement;
    private workspaceTitle: HTMLDivElement;
    private workspaceDetail: HTMLDivElement;
    private workspaceRows: HTMLDivElement;

    constructor(containerId: string) {
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

        this.interpolationRoot = document.createElement("div");
        this.interpolationRoot.classList.add("interpolation-insight", "hidden");

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
        this.container.appendChild(this.interpolationRoot);
        this.container.appendChild(this.workspaceRoot);

        this.setStepCount(0);
        this.setResult("Waiting");
    }

    private findCounterHost(): HTMLElement | null {
        const visualizerSection = this.container.closest(".visualizer");
        const dedicatedHost = visualizerSection?.querySelector(".visualizer-counter-host") as HTMLElement | null;

        if (dedicatedHost) {
            return dedicatedHost;
        }

        const speedControl = visualizerSection?.querySelector(".speed-control") as HTMLElement | null;
        return speedControl ?? this.container;
    }

    public render(step: SearchStep) {
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
        this.renderInterpolationInsight(step.interpolation);
        this.renderWorkspace(step.workspace);

        this.setResult(this.getResultText(step));
    }

    private renderPointers(step: SearchStep) {
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

    private renderInterpolationInsight(insight?: InterpolationInsight) {
        if (!insight) {
            this.interpolationRoot.classList.add("hidden");
            this.interpolationRoot.innerHTML = "";
            return;
        }

        const ratioPercent = Math.max(0, Math.min(100, insight.ratio * 100));
        const probePercent = insight.indexSpan === 0
            ? 0
            : ((insight.probe - insight.low) / insight.indexSpan) * 100;
        const clampedProbePercent = Math.max(0, Math.min(100, probePercent));

        this.interpolationRoot.classList.remove("hidden");
        this.interpolationRoot.innerHTML = "";

        const header = document.createElement("div");
        header.classList.add("interpolation-insight-header");

        const title = document.createElement("div");
        title.classList.add("interpolation-insight-title");
        title.textContent = "How the Probe is Estimated";

        const summary = document.createElement("div");
        summary.classList.add("interpolation-insight-summary");
        summary.textContent = `Same position, different scale: ${formatPercentPrecise(ratioPercent)}.`;

        header.appendChild(title);
        header.appendChild(summary);

        const estimate = document.createElement("div");
        estimate.classList.add("interpolation-estimate");
        estimate.appendChild(createEstimateCell("Value position", formatFraction(insight.valueDistance, insight.valueSpan), formatPercentPrecise(ratioPercent)));
        estimate.appendChild(createEstimateDivider());
        estimate.appendChild(createEstimateCell("Index position", formatFraction(insight.probe - insight.low, insight.indexSpan), `probe ${insight.probe}`));

        const maps = document.createElement("div");
        maps.classList.add("interpolation-map-grid");
        maps.appendChild(createMap("Value scale", String(insight.lowValue), String(insight.highValue), String(insight.target), ratioPercent));
        maps.appendChild(createMap("Index scale", String(insight.low), String(insight.high), "Probe", clampedProbePercent));

        const note = document.createElement("p");
        note.classList.add("interpolation-note");
        note.textContent = insight.note ?? `Target sits ${formatPercentPrecise(ratioPercent)} through the values, so the next probe lands at index ${insight.probe}.`;

        this.interpolationRoot.appendChild(header);
        this.interpolationRoot.appendChild(estimate);
        this.interpolationRoot.appendChild(maps);
        this.interpolationRoot.appendChild(note);
    }

    private renderWorkspace(workspace?: SearchWorkspaceState) {
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

    public setStepCount(count: number) {
        this.stepCounter.textContent = `Probes ${count}`;
    }

    public resetStepCount() {
        this.setStepCount(0);
    }

    public setResult(text: string) {
        this.resultCounter.textContent = text;
    }

    private getResultText(step: SearchStep): string {
        if (step.type === "found") {
            return `Found at index ${step.resultIndex}`;
        }

        if (step.type === "miss" || step.type === "done") {
            return step.resultIndex === -1 ? "Not found" : "Complete";
        }

        return `Target ${step.target}`;
    }
}

function createMap(label: string, start: string, end: string, marker: string, percent: number): HTMLDivElement {
    const root = document.createElement("div");
    root.classList.add("interpolation-map");

    const labelElement = document.createElement("div");
    labelElement.classList.add("interpolation-map-label");
    labelElement.textContent = label;

    const track = document.createElement("div");
    track.classList.add("interpolation-track");

    const fill = document.createElement("div");
    fill.classList.add("interpolation-track-fill");
    fill.style.width = `${percent}%`;

    const markerElement = document.createElement("div");
    markerElement.classList.add("interpolation-track-marker");
    markerElement.style.left = `${percent}%`;

    const markerDot = document.createElement("span");
    markerDot.classList.add("interpolation-track-dot");
    markerDot.textContent = "●";

    const markerLabel = document.createElement("span");
    markerLabel.classList.add("interpolation-track-label");
    markerLabel.textContent = marker;

    markerElement.appendChild(markerDot);
    markerElement.appendChild(markerLabel);

    track.appendChild(fill);
    track.appendChild(markerElement);

    const endpoints = document.createElement("div");
    endpoints.classList.add("interpolation-map-endpoints");

    const startElement = document.createElement("span");
    startElement.textContent = start;

    const endElement = document.createElement("span");
    endElement.textContent = end;

    endpoints.appendChild(startElement);
    endpoints.appendChild(endElement);

    root.appendChild(labelElement);
    root.appendChild(track);
    root.appendChild(endpoints);

    return root;
}

function createEstimateCell(label: string, primary: string, secondary: string): HTMLDivElement {
    const root = document.createElement("div");
    root.classList.add("interpolation-estimate-cell");

    const labelElement = document.createElement("span");
    labelElement.textContent = label;

    const primaryElement = document.createElement("strong");
    primaryElement.textContent = primary;

    const secondaryElement = document.createElement("em");
    secondaryElement.textContent = secondary;

    root.appendChild(labelElement);
    root.appendChild(primaryElement);
    root.appendChild(secondaryElement);

    return root;
}

function createEstimateDivider(): HTMLDivElement {
    const divider = document.createElement("div");
    divider.classList.add("interpolation-estimate-divider");
    divider.textContent = "=";
    return divider;
}

function formatPercent(percent: number): string {
    return `${Math.round(percent)}%`;
}

function formatPercentPrecise(percent: number): string {
    return `${percent.toFixed(1)}%`;
}

function formatFraction(numerator: number, denominator: number): string {
    if (denominator === 0) {
        return "single point";
    }

    return `${numerator} / ${denominator}`;
}

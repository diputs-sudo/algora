import { DStarLitePlanner } from "./algorithms/dStarLite.js";
import { GraphController } from "./visualizer/graphController.js";
import { GraphVisualizer } from "./visualizer/graphVisualizer.js";
import { initCodeLoader } from "../ui/codeLoader.js";
import { initLearnMore } from "../ui/navigation.js";
const baseGrids = [
    { width: 11, height: 7, start: { row: 6, col: 0 }, target: { row: 0, col: 10 }, walls: [
            { row: 0, col: 3 }, { row: 0, col: 4 }, { row: 1, col: 1 }, { row: 1, col: 6 },
            { row: 2, col: 1 }, { row: 2, col: 6 }, { row: 2, col: 8 }, { row: 3, col: 3 },
            { row: 3, col: 4 }, { row: 3, col: 8 }, { row: 4, col: 4 }, { row: 4, col: 8 },
            { row: 5, col: 2 }, { row: 5, col: 6 }, { row: 6, col: 6 }
        ] },
    { width: 11, height: 7, start: { row: 6, col: 0 }, target: { row: 0, col: 10 }, walls: [
            { row: 0, col: 2 }, { row: 1, col: 2 }, { row: 1, col: 4 }, { row: 2, col: 4 },
            { row: 2, col: 7 }, { row: 3, col: 1 }, { row: 3, col: 2 }, { row: 3, col: 7 },
            { row: 4, col: 2 }, { row: 4, col: 7 }, { row: 5, col: 4 }, { row: 5, col: 5 },
            { row: 6, col: 4 }
        ] }
];
function cloneGraph(graph) {
    return { ...graph, walls: graph.walls.map(point => ({ ...point })) };
}
function key(point) {
    return `${point.row},${point.col}`;
}
function pathCost(step) {
    return step.path && step.path.length > 1 ? step.path.length - 1 : null;
}
document.addEventListener("DOMContentLoaded", () => {
    initLearnMore();
    initCodeLoader("graphs", "d_star_lite", { rootSelector: "#standardCodeSection", defaultLanguage: "python", moreInfoSelector: "#standardMoreInfo" });
    initCodeLoader("graphs", "d_star_lite_production", { rootSelector: "#productionCodeSection", defaultLanguage: "python" });
    const visualizer = new GraphVisualizer("dStarLiteContainer");
    const mapSelect = document.getElementById("mapSelect");
    const heuristicSelect = document.getElementById("heuristicSelect");
    const editBtn = document.getElementById("editBtn");
    const resetBtn = document.getElementById("resetBtn");
    const playBtn = document.getElementById("playBtn");
    const pauseBtn = document.getElementById("pauseBtn");
    const stepBtn = document.getElementById("stepBtn");
    const speedRange = document.getElementById("speedRange");
    const expandedMetric = document.getElementById("expandedMetric");
    const replannedMetric = document.getElementById("replannedMetric");
    const pathCostMetric = document.getElementById("pathCostMetric");
    const replansMetric = document.getElementById("replansMetric");
    let baseGraph = cloneGraph(baseGrids[0]);
    let graph = cloneGraph(baseGraph);
    let planner;
    let controller;
    let plannerState = "editing";
    let editingEnabled = false;
    let replans = 0;
    let replannedNodes = 0;
    function clearMetrics() {
        replans = 0;
        replannedNodes = 0;
        expandedMetric.textContent = "0";
        replannedMetric.textContent = "0";
        pathCostMetric.textContent = "--";
        replansMetric.textContent = "0";
    }
    function initializePlanner(clear = false) {
        graph = { ...cloneGraph(baseGraph), heuristic: heuristicSelect.value };
        planner = new DStarLitePlanner(graph);
        controller = new GraphController(planner.computeShortestPath("initial"), visualizer);
        controller.reset(planner.computeShortestPath("initial"), planner.initialStep());
        controller.setSpeed(Number(speedRange.value));
        plannerState = "editing";
        if (clear)
            clearMetrics();
    }
    function renderMetrics(step) {
        graph = cloneGraph(step.graph);
        expandedMetric.textContent = String(step.visited.length);
        const cost = pathCost(step);
        pathCostMetric.textContent = cost === null ? "--" : String(cost);
        if (step.message.startsWith("Repairing ")) {
            replannedNodes += 1;
            replannedMetric.textContent = String(replannedNodes);
        }
        if (step.type === "done")
            plannerState = "ready";
    }
    function runInitialPlan() {
        if (plannerState === "ready")
            return;
        plannerState = "planning";
        controller.replace(planner.computeShortestPath("initial"));
        controller.play();
    }
    function repairWall(point) {
        if (!editingEnabled)
            return;
        if (key(point) === key(graph.start) || key(point) === key(graph.target))
            return;
        plannerState = "repairing";
        replans += 1;
        replansMetric.textContent = String(replans);
        controller.replace(planner.changeWall(point));
        controller.play();
    }
    visualizer.setRenderHandler(renderMetrics);
    visualizer.setGridEditHandler(point => repairWall(point));
    function setEditingEnabled(enabled) {
        editingEnabled = enabled;
        editBtn.textContent = enabled ? "Disable wall editing" : "Enable wall editing";
        editBtn.setAttribute("aria-pressed", String(enabled));
    }
    mapSelect.addEventListener("change", () => {
        const next = baseGrids[Number(mapSelect.value)];
        if (!next)
            return;
        baseGraph = cloneGraph(next);
        initializePlanner(true);
    });
    heuristicSelect.addEventListener("change", () => initializePlanner(true));
    editBtn.addEventListener("click", () => setEditingEnabled(!editingEnabled));
    resetBtn.addEventListener("click", () => initializePlanner(true));
    playBtn.addEventListener("click", runInitialPlan);
    pauseBtn.addEventListener("click", () => controller.pause());
    stepBtn.addEventListener("click", () => {
        if (plannerState === "editing")
            plannerState = "planning";
        controller.step();
    });
    speedRange.addEventListener("input", () => controller.setSpeed(Number(speedRange.value)));
    setEditingEnabled(false);
    initializePlanner(true);
});

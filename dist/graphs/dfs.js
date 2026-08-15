import { depthFirstSearch, createDfsInitialStep } from "./algorithms/dfs.js";
import { GraphController } from "./visualizer/graphController.js";
import { GraphVisualizer } from "./visualizer/graphVisualizer.js";
import { createClusterGrid } from "./visualizer/gridGenerator.js";
import { initCodeLoader } from "../ui/codeLoader.js";
import { initLearnMore } from "../ui/navigation.js";
const sampleGrids = [
    {
        width: 10,
        height: 7,
        start: { row: 4, col: 0 },
        target: { row: 0, col: 9 },
        walls: [
            { row: 0, col: 4 },
            { row: 1, col: 1 },
            { row: 1, col: 4 },
            { row: 1, col: 7 },
            { row: 2, col: 1 },
            { row: 2, col: 7 },
            { row: 3, col: 3 },
            { row: 3, col: 4 },
            { row: 4, col: 4 },
            { row: 4, col: 6 },
            { row: 5, col: 1 },
            { row: 5, col: 2 },
            { row: 5, col: 6 },
            { row: 6, col: 4 }
        ]
    },
    {
        width: 10,
        height: 7,
        start: { row: 6, col: 0 },
        target: { row: 0, col: 9 },
        walls: [
            { row: 0, col: 2 },
            { row: 0, col: 3 },
            { row: 1, col: 5 },
            { row: 1, col: 6 },
            { row: 2, col: 1 },
            { row: 2, col: 6 },
            { row: 3, col: 1 },
            { row: 3, col: 3 },
            { row: 3, col: 4 },
            { row: 3, col: 8 },
            { row: 4, col: 4 },
            { row: 4, col: 8 },
            { row: 5, col: 2 },
            { row: 5, col: 3 },
            { row: 5, col: 6 }
        ]
    }
];
function pointKey(point) {
    return `${point.row},${point.col}`;
}
function createRandomGrid(width = 10, height = 7) {
    return createClusterGrid(width, height, { row: height - 1, col: 0 }, { row: 0, col: width - 1 });
}
function updateGrid(graph, point, mode) {
    const pointKeyValue = pointKey(point);
    const startKey = pointKey(graph.start);
    const targetKey = pointKey(graph.target);
    const isWall = graph.walls.some(wall => pointKey(wall) === pointKeyValue);
    const walls = graph.walls.filter(wall => pointKey(wall) !== pointKeyValue);
    if (mode === "wall") {
        if (!isWall && pointKeyValue !== startKey && pointKeyValue !== targetKey) {
            walls.push(point);
        }
        return { ...graph, walls };
    }
    if ((mode === "start" && pointKeyValue === targetKey) || (mode === "target" && pointKeyValue === startKey)) {
        return graph;
    }
    const nextPoint = { row: point.row, col: point.col };
    const nextWalls = walls.filter(wall => pointKey(wall) !== pointKeyValue);
    return mode === "start"
        ? { ...graph, start: nextPoint, walls: nextWalls }
        : { ...graph, target: nextPoint, walls: nextWalls };
}
document.addEventListener("DOMContentLoaded", () => {
    initLearnMore();
    initCodeLoader("graphs", "dfs", {
        rootSelector: "#standardCodeSection",
        defaultLanguage: "python",
        moreInfoSelector: "#standardMoreInfo"
    });
    initCodeLoader("graphs", "dfs_production", {
        rootSelector: "#productionCodeSection",
        defaultLanguage: "python"
    });
    const visualizer = new GraphVisualizer("graphSearchContainer");
    const graphSelect = document.getElementById("graphSelect");
    const playBtn = document.getElementById("playBtn");
    const pauseBtn = document.getElementById("pauseBtn");
    const stepBtn = document.getElementById("stepBtn");
    const resetBtn = document.getElementById("resetBtn");
    const randomBtn = document.getElementById("randomBtn");
    const speedRange = document.getElementById("speedRange");
    const editModeSelect = document.getElementById("editModeSelect");
    let graph = sampleGrids[0];
    let controller = new GraphController(depthFirstSearch(graph), visualizer);
    controller.reset(depthFirstSearch(graph), createDfsInitialStep(graph));
    controller.setSpeed(Number(speedRange.value));
    visualizer.setGridEditHandler((point, mode) => {
        controller.pause();
        graph = updateGrid(graph, point, mode);
        controller.reset(depthFirstSearch(graph), createDfsInitialStep(graph));
        graphSelect.value = "custom";
    });
    function reset() {
        const selectedIndex = Number(graphSelect.value);
        if (Number.isFinite(selectedIndex) && sampleGrids[selectedIndex]) {
            graph = sampleGrids[selectedIndex];
        }
        controller.reset(depthFirstSearch(graph), createDfsInitialStep(graph));
        controller.setSpeed(Number(speedRange.value));
    }
    graphSelect.addEventListener("change", reset);
    playBtn.addEventListener("click", () => controller.play());
    pauseBtn.addEventListener("click", () => controller.pause());
    stepBtn.addEventListener("click", () => controller.step());
    resetBtn.addEventListener("click", reset);
    randomBtn.addEventListener("click", () => {
        graph = createRandomGrid();
        graphSelect.value = "custom";
        controller.reset(depthFirstSearch(graph), createDfsInitialStep(graph));
        controller.setSpeed(Number(speedRange.value));
    });
    editModeSelect.addEventListener("change", () => {
        visualizer.setEditMode(editModeSelect.value);
    });
    speedRange.addEventListener("input", () => {
        controller.setSpeed(Number(speedRange.value));
    });
});

import { zeroOneBfs, createZeroOneBfsInitialStep } from "./algorithms/zeroOneBfs.js";
import { GraphController } from "./visualizer/graphController.js";
import { GraphVisualizer } from "./visualizer/graphVisualizer.js";
import { createClusterGrid } from "./visualizer/gridGenerator.js";
import { initCodeLoader } from "../ui/codeLoader.js";
import { initLearnMore } from "../ui/navigation.js";
function key(point) {
    return `${point.row},${point.col}`;
}
function withWeights(graph, seed) {
    const walls = new Set(graph.walls.map(key));
    const weights = {};
    for (let row = 0; row < graph.height; row++) {
        for (let col = 0; col < graph.width; col++) {
            const point = { row, col };
            if (!walls.has(key(point))) {
                weights[key(point)] = (row * 7 + col * 11 + seed) % 4 === 0 ? 1 : 0;
            }
        }
    }
    weights[key(graph.start)] = 0;
    return { ...graph, weights };
}
const baseGrids = [
    {
        width: 10,
        height: 7,
        start: { row: 4, col: 0 },
        target: { row: 0, col: 9 },
        walls: [
            { row: 0, col: 4 }, { row: 1, col: 1 }, { row: 1, col: 4 }, { row: 1, col: 7 },
            { row: 2, col: 1 }, { row: 2, col: 7 }, { row: 3, col: 3 }, { row: 3, col: 4 },
            { row: 4, col: 4 }, { row: 4, col: 6 }, { row: 5, col: 1 }, { row: 5, col: 2 },
            { row: 5, col: 6 }, { row: 6, col: 4 }
        ]
    },
    {
        width: 10,
        height: 7,
        start: { row: 6, col: 0 },
        target: { row: 0, col: 9 },
        walls: [
            { row: 0, col: 2 }, { row: 0, col: 3 }, { row: 1, col: 5 }, { row: 1, col: 6 },
            { row: 2, col: 1 }, { row: 2, col: 6 }, { row: 3, col: 1 }, { row: 3, col: 3 },
            { row: 3, col: 4 }, { row: 3, col: 8 }, { row: 4, col: 4 }, { row: 4, col: 8 },
            { row: 5, col: 2 }, { row: 5, col: 3 }, { row: 5, col: 6 }
        ]
    }
].map((graph, index) => withWeights(graph, index + 1));
function createRandomWeightedGrid() {
    const start = { row: 6, col: 0 };
    const target = { row: 0, col: 9 };
    const graph = createClusterGrid(10, 7, start, target);
    return withWeights(graph, Math.floor(Math.random() * 40));
}
document.addEventListener("DOMContentLoaded", () => {
    initLearnMore();
    initCodeLoader("graphs", "zero_one_bfs", {
        rootSelector: "#standardCodeSection",
        defaultLanguage: "python",
        moreInfoSelector: "#standardMoreInfo"
    });
    initCodeLoader("graphs", "zero_one_bfs_production", {
        rootSelector: "#productionCodeSection",
        defaultLanguage: "python"
    });
    const visualizer = new GraphVisualizer("zeroOneBfsContainer");
    const mapSelect = document.getElementById("mapSelect");
    const randomBtn = document.getElementById("randomBtn");
    const resetBtn = document.getElementById("resetBtn");
    const playBtn = document.getElementById("playBtn");
    const pauseBtn = document.getElementById("pauseBtn");
    const stepBtn = document.getElementById("stepBtn");
    const speedRange = document.getElementById("speedRange");
    let graph = baseGrids[0];
    const controller = new GraphController(zeroOneBfs(graph), visualizer);
    controller.reset(zeroOneBfs(graph), createZeroOneBfsInitialStep(graph));
    controller.setSpeed(Number(speedRange.value));
    function reset() {
        const selectedIndex = Number(mapSelect.value);
        if (Number.isFinite(selectedIndex) && baseGrids[selectedIndex])
            graph = baseGrids[selectedIndex];
        controller.reset(zeroOneBfs(graph), createZeroOneBfsInitialStep(graph));
        controller.setSpeed(Number(speedRange.value));
    }
    mapSelect.addEventListener("change", reset);
    randomBtn.addEventListener("click", () => {
        graph = createRandomWeightedGrid();
        mapSelect.value = "custom";
        controller.reset(zeroOneBfs(graph), createZeroOneBfsInitialStep(graph));
    });
    resetBtn.addEventListener("click", reset);
    playBtn.addEventListener("click", () => controller.play());
    pauseBtn.addEventListener("click", () => controller.pause());
    stepBtn.addEventListener("click", () => controller.step());
    speedRange.addEventListener("input", () => controller.setSpeed(Number(speedRange.value)));
});

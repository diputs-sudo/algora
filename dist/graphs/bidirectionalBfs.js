import { bidirectionalBfs, createBidirectionalBfsInitialStep } from "./algorithms/bidirectionalBfs.js";
import { GraphController } from "./visualizer/graphController.js";
import { GraphVisualizer } from "./visualizer/graphVisualizer.js";
import { updateGrid } from "./visualizer/gridEditor.js";
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
];
function createRandomGrid(width = 10, height = 7) {
    return createClusterGrid(width, height, { row: height - 1, col: 0 }, { row: 0, col: width - 1 });
}
document.addEventListener("DOMContentLoaded", () => {
    initLearnMore();
    initCodeLoader("graphs", "bidirectional_bfs", {
        rootSelector: "#standardCodeSection",
        defaultLanguage: "python",
        moreInfoSelector: "#standardMoreInfo"
    });
    initCodeLoader("graphs", "bidirectional_bfs_production", {
        rootSelector: "#productionCodeSection",
        defaultLanguage: "python"
    });
    const visualizer = new GraphVisualizer("bidirectionalBfsContainer");
    const graphSelect = document.getElementById("graphSelect");
    const playBtn = document.getElementById("playBtn");
    const pauseBtn = document.getElementById("pauseBtn");
    const stepBtn = document.getElementById("stepBtn");
    const resetBtn = document.getElementById("resetBtn");
    const randomBtn = document.getElementById("randomBtn");
    const speedRange = document.getElementById("speedRange");
    const editModeSelect = document.getElementById("editModeSelect");
    let graph = sampleGrids[0];
    const controller = new GraphController(bidirectionalBfs(graph), visualizer);
    controller.reset(bidirectionalBfs(graph), createBidirectionalBfsInitialStep(graph));
    controller.setSpeed(Number(speedRange.value));
    visualizer.setGridEditHandler((point, mode) => {
        controller.pause();
        graph = updateGrid(graph, point, mode);
        controller.reset(bidirectionalBfs(graph), createBidirectionalBfsInitialStep(graph));
        graphSelect.value = "custom";
    });
    function reset() {
        const selectedIndex = Number(graphSelect.value);
        if (Number.isFinite(selectedIndex) && sampleGrids[selectedIndex])
            graph = sampleGrids[selectedIndex];
        controller.reset(bidirectionalBfs(graph), createBidirectionalBfsInitialStep(graph));
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
        controller.reset(bidirectionalBfs(graph), createBidirectionalBfsInitialStep(graph));
        controller.setSpeed(Number(speedRange.value));
    });
    editModeSelect.addEventListener("change", () => visualizer.setEditMode(editModeSelect.value));
    speedRange.addEventListener("input", () => controller.setSpeed(Number(speedRange.value)));
});

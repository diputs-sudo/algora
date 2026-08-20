import { depthFirstSearch, createDfsInitialStep } from "./algorithms/dfs.js";
import { GraphController } from "./visualizer/graphController.js";
import { GraphData } from "./visualizer/types.js";
import { GraphVisualizer, GridEditMode } from "./visualizer/graphVisualizer.js";
import { updateGrid } from "./visualizer/gridEditor.js";
import { createClusterGrid } from "./visualizer/gridGenerator.js";
import { initCodeLoader } from "../ui/codeLoader.js";
import { initLearnMore } from "../ui/navigation.js";

const sampleGrids: GraphData[] = [
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

function createRandomGrid(width = 10, height = 7): GraphData {
    return createClusterGrid(width, height, { row: height - 1, col: 0 }, { row: 0, col: width - 1 });
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
    const graphSelect = document.getElementById("graphSelect") as HTMLSelectElement;
    const playBtn = document.getElementById("playBtn") as HTMLButtonElement;
    const pauseBtn = document.getElementById("pauseBtn") as HTMLButtonElement;
    const stepBtn = document.getElementById("stepBtn") as HTMLButtonElement;
    const resetBtn = document.getElementById("resetBtn") as HTMLButtonElement;
    const randomBtn = document.getElementById("randomBtn") as HTMLButtonElement;
    const speedRange = document.getElementById("speedRange") as HTMLInputElement;
    const editModeSelect = document.getElementById("editModeSelect") as HTMLSelectElement;

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
        visualizer.setEditMode(editModeSelect.value as GridEditMode);
    });
    speedRange.addEventListener("input", () => {
        controller.setSpeed(Number(speedRange.value));
    });
});

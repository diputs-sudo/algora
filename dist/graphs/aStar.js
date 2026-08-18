import { aStar, createAStarInitialStep } from "./algorithms/aStar.js";
import { GraphController } from "./visualizer/graphController.js";
import { GraphVisualizer } from "./visualizer/graphVisualizer.js";
import { createClusterGrid } from "./visualizer/gridGenerator.js";
import { updateGrid } from "./visualizer/gridEditor.js";
import { initCodeLoader } from "../ui/codeLoader.js";
import { initLearnMore } from "../ui/navigation.js";
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
];
function createRandomGrid() {
    const start = { row: 6, col: 0 };
    const target = { row: 0, col: 9 };
    return createClusterGrid(10, 7, start, target);
}
document.addEventListener("DOMContentLoaded", () => {
    initLearnMore();
    initCodeLoader("graphs", "a_star", {
        rootSelector: "#standardCodeSection",
        defaultLanguage: "python",
        moreInfoSelector: "#standardMoreInfo"
    });
    initCodeLoader("graphs", "a_star_production", {
        rootSelector: "#productionCodeSection",
        defaultLanguage: "python"
    });
    const visualizer = new GraphVisualizer("aStarContainer");
    const mapSelect = document.getElementById("mapSelect");
    const randomBtn = document.getElementById("randomBtn");
    const resetBtn = document.getElementById("resetBtn");
    const editModeSelect = document.getElementById("editModeSelect");
    const normalModeBtn = document.getElementById("normalModeBtn");
    const weightedModeBtn = document.getElementById("weightedModeBtn");
    const heuristicWeightInput = document.getElementById("heuristicWeight");
    const playBtn = document.getElementById("playBtn");
    const pauseBtn = document.getElementById("pauseBtn");
    const stepBtn = document.getElementById("stepBtn");
    const speedRange = document.getElementById("speedRange");
    let graph = baseGrids[0];
    let weightedMode = true;
    function getWeight() {
        const value = Number(heuristicWeightInput.value);
        return Number.isFinite(value) && value >= 1 ? value : 1.5;
    }
    function currentWeight() {
        return weightedMode ? getWeight() : 1;
    }
    const controller = new GraphController(aStar(graph, currentWeight()), visualizer);
    controller.reset(aStar(graph, currentWeight()), createAStarInitialStep(graph, currentWeight()));
    controller.setSpeed(Number(speedRange.value));
    visualizer.setGridEditHandler((point, mode) => {
        controller.pause();
        graph = updateGrid(graph, point, mode);
        controller.reset(aStar(graph, currentWeight()), createAStarInitialStep(graph, currentWeight()));
        mapSelect.value = "custom";
    });
    function reset() {
        const selectedIndex = Number(mapSelect.value);
        if (Number.isFinite(selectedIndex) && baseGrids[selectedIndex]) {
            graph = baseGrids[selectedIndex];
        }
        controller.reset(aStar(graph, currentWeight()), createAStarInitialStep(graph, currentWeight()));
        controller.setSpeed(Number(speedRange.value));
    }
    function setMode(weighted) {
        weightedMode = weighted;
        normalModeBtn.classList.toggle("active", !weighted);
        weightedModeBtn.classList.toggle("active", weighted);
        heuristicWeightInput.disabled = !weighted;
        reset();
    }
    mapSelect.addEventListener("change", reset);
    randomBtn.addEventListener("click", () => {
        graph = createRandomGrid();
        mapSelect.value = "custom";
        controller.reset(aStar(graph, currentWeight()), createAStarInitialStep(graph, currentWeight()));
    });
    resetBtn.addEventListener("click", reset);
    editModeSelect.addEventListener("change", () => {
        visualizer.setEditMode(editModeSelect.value);
    });
    normalModeBtn.addEventListener("click", () => setMode(false));
    weightedModeBtn.addEventListener("click", () => setMode(true));
    heuristicWeightInput.addEventListener("change", reset);
    playBtn.addEventListener("click", () => controller.play());
    pauseBtn.addEventListener("click", () => controller.pause());
    stepBtn.addEventListener("click", () => controller.step());
    speedRange.addEventListener("input", () => controller.setSpeed(Number(speedRange.value)));
});

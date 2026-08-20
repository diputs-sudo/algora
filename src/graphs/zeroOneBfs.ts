import { zeroOneBfs, createZeroOneBfsInitialStep } from "./algorithms/zeroOneBfs.js";
import { GraphController } from "./visualizer/graphController.js";
import { GraphData, GridPoint } from "./visualizer/types.js";
import { GraphVisualizer, GridEditMode } from "./visualizer/graphVisualizer.js";
import { createClusterGrid } from "./visualizer/gridGenerator.js";
import { updateGrid } from "./visualizer/gridEditor.js";
import { initCodeLoader } from "../ui/codeLoader.js";
import { initLearnMore } from "../ui/navigation.js";

function key(point: GridPoint): string {
    return `${point.row},${point.col}`;
}

function withWeights(graph: GraphData, seed: number): GraphData {
    const walls = new Set(graph.walls.map(key));
    const weights: Record<string, 0 | 1> = {};

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

const baseGrids: GraphData[] = [
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

function createRandomWeightedGrid(): GraphData {
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
    const mapSelect = document.getElementById("mapSelect") as HTMLSelectElement;
    const randomBtn = document.getElementById("randomBtn") as HTMLButtonElement;
    const resetBtn = document.getElementById("resetBtn") as HTMLButtonElement;
    const editModeSelect = document.getElementById("editModeSelect") as HTMLSelectElement;
    const playBtn = document.getElementById("playBtn") as HTMLButtonElement;
    const pauseBtn = document.getElementById("pauseBtn") as HTMLButtonElement;
    const stepBtn = document.getElementById("stepBtn") as HTMLButtonElement;
    const speedRange = document.getElementById("speedRange") as HTMLInputElement;

    let graph = baseGrids[0];
    const controller = new GraphController(zeroOneBfs(graph), visualizer);
    controller.reset(zeroOneBfs(graph), createZeroOneBfsInitialStep(graph));
    controller.setSpeed(Number(speedRange.value));

    visualizer.setGridEditHandler((point, mode) => {
        controller.pause();
        graph = updateGrid(graph, point, mode);
        controller.reset(zeroOneBfs(graph), createZeroOneBfsInitialStep(graph));
        mapSelect.value = "custom";
    });

    function reset() {
        const selectedIndex = Number(mapSelect.value);
        if (Number.isFinite(selectedIndex) && baseGrids[selectedIndex]) graph = baseGrids[selectedIndex];
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
    editModeSelect.addEventListener("change", () => {
        visualizer.setEditMode(editModeSelect.value as GridEditMode);
    });
    playBtn.addEventListener("click", () => controller.play());
    pauseBtn.addEventListener("click", () => controller.pause());
    stepBtn.addEventListener("click", () => controller.step());
    speedRange.addEventListener("input", () => controller.setSpeed(Number(speedRange.value)));
});

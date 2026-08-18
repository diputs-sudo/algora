import { bellmanFord, createBellmanFordInitialStep } from "./algorithms/bellmanFord.js";
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

function withCosts(graph: GraphData, negativeCells: GridPoint[]): GraphData {
    const walls = new Set(graph.walls.map(key));
    const negativeKeys = new Set(negativeCells.map(key));
    const costs: Record<string, number> = {};

    for (let row = 0; row < graph.height; row++) {
        for (let col = 0; col < graph.width; col++) {
            const point = { row, col };
            if (!walls.has(key(point))) {
                costs[key(point)] = negativeKeys.has(key(point)) ? -1 : 1;
            }
        }
    }

    costs[key(graph.start)] = 0;
    return { ...graph, costs };
}

const baseGrids: GraphData[] = [
    withCosts({
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
    }, [
        { row: 3, col: 1 },
        { row: 2, col: 5 },
        { row: 5, col: 8 }
    ]),
    withCosts({
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
    }, [
        { row: 5, col: 1 },
        { row: 3, col: 6 },
        { row: 1, col: 8 }
    ])
];

function createRandomGrid(): GraphData {
    const start = { row: 6, col: 0 };
    const target = { row: 0, col: 9 };
    const graph = createClusterGrid(10, 7, start, target);
    const openCells: GridPoint[] = [];

    for (let row = 0; row < graph.height; row++) {
        for (let col = 0; col < graph.width; col++) {
            const point = { row, col };
            if (!graph.walls.some(wall => key(wall) === key(point))
                && key(point) !== key(start)
                && key(point) !== key(target)) {
                openCells.push(point);
            }
        }
    }

    const negativeCells: GridPoint[] = [];
    for (const point of openCells.sort(() => Math.random() - 0.5)) {
        const awayFromStart = Math.abs(point.row - start.row) + Math.abs(point.col - start.col) > 1;
        if (awayFromStart && negativeCells.every(other => Math.abs(other.row - point.row) + Math.abs(other.col - point.col) > 1)) {
            negativeCells.push(point);
        }
        if (negativeCells.length === 3) break;
    }

    return withCosts(graph, negativeCells);
}

document.addEventListener("DOMContentLoaded", () => {
    initLearnMore();
    initCodeLoader("graphs", "bellman_ford", {
        rootSelector: "#standardCodeSection",
        defaultLanguage: "python",
        moreInfoSelector: "#standardMoreInfo"
    });
    initCodeLoader("graphs", "bellman_ford_production", {
        rootSelector: "#productionCodeSection",
        defaultLanguage: "python"
    });

    const visualizer = new GraphVisualizer("bellmanFordContainer");
    const mapSelect = document.getElementById("mapSelect") as HTMLSelectElement;
    const randomBtn = document.getElementById("randomBtn") as HTMLButtonElement;
    const resetBtn = document.getElementById("resetBtn") as HTMLButtonElement;
    const editModeSelect = document.getElementById("editModeSelect") as HTMLSelectElement;
    const playBtn = document.getElementById("playBtn") as HTMLButtonElement;
    const pauseBtn = document.getElementById("pauseBtn") as HTMLButtonElement;
    const stepBtn = document.getElementById("stepBtn") as HTMLButtonElement;
    const speedRange = document.getElementById("speedRange") as HTMLInputElement;

    let graph = baseGrids[0];
    const controller = new GraphController(bellmanFord(graph), visualizer);
    controller.reset(bellmanFord(graph), createBellmanFordInitialStep(graph));
    controller.setSpeed(Number(speedRange.value));

    visualizer.setGridEditHandler((point, mode) => {
        controller.pause();
        graph = updateGrid(graph, point, mode);
        controller.reset(bellmanFord(graph), createBellmanFordInitialStep(graph));
        mapSelect.value = "custom";
    });

    function reset() {
        const selectedIndex = Number(mapSelect.value);
        if (Number.isFinite(selectedIndex) && baseGrids[selectedIndex]) {
            graph = baseGrids[selectedIndex];
        }
        controller.reset(bellmanFord(graph), createBellmanFordInitialStep(graph));
        controller.setSpeed(Number(speedRange.value));
    }

    mapSelect.addEventListener("change", reset);
    randomBtn.addEventListener("click", () => {
        graph = createRandomGrid();
        mapSelect.value = "custom";
        controller.reset(bellmanFord(graph), createBellmanFordInitialStep(graph));
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

import { Graph } from "./visualizer/graph.js";
import { Controller } from "./visualizer/controller.js";
import { generateUniqueRandomArray } from "./visualizer/randomArray.js";
import { introSort } from "./algorithms/intro.js";
import { initLearnMore } from "../ui/navigation.js";
import { initCodeLoader } from "../ui/codeLoader.js";
function createInitialWorkspace(dataset) {
    const maxDepth = dataset.length > 0 ? 2 * Math.floor(Math.log2(dataset.length)) : 0;
    return {
        title: "Algorithm Workspace",
        detail: "Intro Sort will begin with Quick Sort, watch recursion depth, and switch strategies when needed",
        rows: [
            { label: "Active Range", values: dataset.length > 0 ? [...dataset] : [] },
            { label: "Focus", values: [null] },
            { label: "Depth Budget", values: [maxDepth] },
            { label: "Full Array", values: dataset.length > 0 ? [...dataset] : [] }
        ]
    };
}
document.addEventListener("DOMContentLoaded", () => {
    initLearnMore();
    initCodeLoader("sorting", "intro_sort", {
        rootSelector: "#standardCodeSection",
        defaultLanguage: "python",
        moreInfoSelector: "#standardMoreInfo"
    });
    const graph = new Graph("graphContainer");
    let dataset = generateRandomArray(20);
    let generator = introSort(dataset);
    let controller = new Controller(generator, graph);
    graph.render(dataset, [], "default", createInitialWorkspace(dataset));
    const datasetInput = document.getElementById("datasetInput");
    const generateBtn = document.getElementById("generateBtn");
    const playBtn = document.getElementById("playBtn");
    const pauseBtn = document.getElementById("pauseBtn");
    const stepBtn = document.getElementById("stepBtn");
    const resetBtn = document.getElementById("resetBtn");
    const speedRange = document.getElementById("speedRange");
    datasetInput.value = dataset.join(",");
    generateBtn.addEventListener("click", () => {
        dataset = generateRandomArray(20);
        datasetInput.value = dataset.join(",");
        reset();
    });
    datasetInput.addEventListener("change", () => {
        const values = datasetInput.value
            .split(",")
            .map(value => Number(value.trim()))
            .filter(value => !Number.isNaN(value));
        if (values.length > 0) {
            dataset = values;
            datasetInput.value = dataset.join(",");
            reset();
        }
    });
    playBtn.addEventListener("click", () => controller.play());
    pauseBtn.addEventListener("click", () => controller.pause());
    stepBtn.addEventListener("click", () => controller.step());
    resetBtn.addEventListener("click", () => reset());
    speedRange.addEventListener("input", () => {
        controller.setSpeed(Number(speedRange.value));
    });
    function reset() {
        generator = introSort(dataset);
        controller.reset(generator, dataset);
        graph.render(dataset, [], "default", createInitialWorkspace(dataset));
    }
    function generateRandomArray(size) {
        return generateUniqueRandomArray(size);
    }
});

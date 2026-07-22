import { Graph } from "./visualizer/graph.js";
import { Controller } from "./visualizer/controller.js";
import { generateUniqueRandomArray } from "./visualizer/randomArray.js";
import { quickSort } from "./algorithms/quick.js";
import { initLearnMore } from "../ui/navigation.js";
import { initCodeLoader } from "../ui/codeLoader.js";
function createInitialWorkspace(dataset) {
    return {
        title: "Algorithm Workspace",
        detail: "Quick Sort will choose a pivot, partition the active range, and recurse on the left and right sides",
        rows: [
            { label: "Partition Range", values: dataset.length > 0 ? [...dataset] : [] },
            { label: "Pivot", values: [null] },
            { label: "Full Array", values: dataset.length > 0 ? [...dataset] : [] }
        ]
    };
}
document.addEventListener("DOMContentLoaded", () => {
    initLearnMore();
    initCodeLoader("sorting", "quick_sort", {
        rootSelector: "#standardCodeSection",
        defaultLanguage: "python",
        moreInfoSelector: "#standardMoreInfo"
    });
    const graph = new Graph("graphContainer");
    let dataset = generateRandomArray(20);
    let generator = quickSort(dataset);
    let controller = new Controller(generator, graph);
    graph.render(dataset, [], "default", createInitialWorkspace(dataset));
    const datasetInput = document.getElementById("datasetInput");
    const generateBtn = document.getElementById("generateBtn");
    const playBtn = document.getElementById("playBtn");
    const pauseBtn = document.getElementById("pauseBtn");
    const stepBtn = document.getElementById("stepBtn");
    const resetBtn = document.getElementById("resetBtn");
    const speedRange = document.getElementById("speedRange");
    generateBtn.addEventListener("click", () => {
        dataset = generateRandomArray(20);
        datasetInput.value = dataset.join(",");
        reset();
    });
    datasetInput.addEventListener("change", () => {
        const values = datasetInput.value
            .split(",")
            .map(v => Number(v.trim()))
            .filter(v => !isNaN(v));
        if (values.length > 0) {
            dataset = values;
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
        generator = quickSort(dataset);
        controller.reset(generator, dataset);
        graph.render(dataset, [], "default", createInitialWorkspace(dataset));
    }
    function generateRandomArray(size) {
        return generateUniqueRandomArray(size);
    }
});

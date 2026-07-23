import { Graph } from "./visualizer/graph.js";
import { Controller } from "./visualizer/controller.js";
import { generateUniqueRandomArray } from "./visualizer/randomArray.js";
import { radixSort } from "./algorithms/radix.js";
import { initLearnMore } from "../ui/navigation.js";
import { initCodeLoader } from "../ui/codeLoader.js";
function createInitialWorkspace(dataset) {
    return {
        title: "Algorithm Workspace",
        detail: "Radix Sort will group numbers by one digit at a time, starting from the ones places",
        rows: [
            ...Array.from({ length: 10 }, (_, index) => ({
                label: `Bucket ${index}`,
                values: [null]
            })),
            {
                label: "Collected",
                values: new Array(dataset.length).fill(null)
            }
        ]
    };
}
document.addEventListener("DOMContentLoaded", () => {
    initLearnMore();
    initCodeLoader("sorting", "radix_sort", {
        rootSelector: "#standardCodeSection",
        defaultLanguage: "python",
        moreInfoSelector: "#standardMoreInfo"
    });
    const graph = new Graph("graphContainer");
    let dataset = generateRandomArray(20);
    let generator = radixSort(dataset);
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
            .filter(value => Number.isInteger(value) && value >= 0);
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
        generator = radixSort(dataset);
        controller.reset(generator, dataset);
        graph.render(dataset, [], "default", createInitialWorkspace(dataset));
    }
    function generateRandomArray(size) {
        return generateUniqueRandomArray(size, 0, 999);
    }
});

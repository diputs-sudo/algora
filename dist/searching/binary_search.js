import { binarySearch, createBinarySearchInitialStep } from "./algorithms/binary.js";
import { SearchController } from "./visualizer/searchController.js";
import { SearchVisualizer } from "./visualizer/searchVisualizer.js";
import { initCodeLoader } from "../ui/codeLoader.js";
import { initLearnMore } from "../ui/navigation.js";
function parseDataset(value) {
    return value
        .split(",")
        .map(item => Number(item.trim()))
        .filter(item => !Number.isNaN(item))
        .sort((a, b) => a - b);
}
function generateSortedArray(size) {
    const values = new Set();
    while (values.size < size) {
        values.add(Math.floor(Math.random() * 99) + 1);
    }
    return Array.from(values).sort((a, b) => a - b);
}
document.addEventListener("DOMContentLoaded", () => {
    initLearnMore();
    initCodeLoader("array_search", "binary_search", {
        rootSelector: "#standardCodeSection",
        defaultLanguage: "python",
        moreInfoSelector: "#standardMoreInfo"
    });
    const visualizer = new SearchVisualizer("searchGraphContainer");
    let dataset = [3, 8, 12, 19, 24, 31, 36, 42, 55, 63, 77, 88];
    let target = 42;
    let controller = new SearchController(binarySearch(dataset, target), visualizer);
    visualizer.render(createBinarySearchInitialStep(dataset, target));
    const datasetInput = document.getElementById("datasetInput");
    const targetInput = document.getElementById("targetInput");
    const generateBtn = document.getElementById("generateBtn");
    const playBtn = document.getElementById("playBtn");
    const pauseBtn = document.getElementById("pauseBtn");
    const stepBtn = document.getElementById("stepBtn");
    const resetBtn = document.getElementById("resetBtn");
    const speedRange = document.getElementById("speedRange");
    datasetInput.value = dataset.join(",");
    targetInput.value = String(target);
    function reset() {
        dataset = parseDataset(datasetInput.value);
        target = Number(targetInput.value);
        if (dataset.length === 0) {
            dataset = [3, 8, 12, 19, 24, 31, 36, 42, 55, 63, 77, 88];
        }
        if (Number.isNaN(target)) {
            target = dataset[Math.floor(dataset.length / 2)];
            targetInput.value = String(target);
        }
        datasetInput.value = dataset.join(",");
        controller.reset(binarySearch(dataset, target), createBinarySearchInitialStep(dataset, target));
        controller.setSpeed(Number(speedRange.value));
    }
    generateBtn.addEventListener("click", () => {
        dataset = generateSortedArray(12);
        target = dataset[Math.floor(dataset.length / 2)];
        datasetInput.value = dataset.join(",");
        targetInput.value = String(target);
        reset();
    });
    datasetInput.addEventListener("change", reset);
    targetInput.addEventListener("change", reset);
    playBtn.addEventListener("click", () => controller.play());
    pauseBtn.addEventListener("click", () => controller.pause());
    stepBtn.addEventListener("click", () => controller.step());
    resetBtn.addEventListener("click", reset);
    speedRange.addEventListener("input", () => {
        controller.setSpeed(Number(speedRange.value));
    });
    controller.setSpeed(Number(speedRange.value));
});

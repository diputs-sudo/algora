import { createFibonacciSearchInitialStep, fibonacciSearch } from "./algorithms/fibonacci.js";
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
        values.add(Math.floor(Math.random() * 120) + 1);
    }
    return Array.from(values).sort((a, b) => a - b);
}
document.addEventListener("DOMContentLoaded", () => {
    initLearnMore();
    initCodeLoader("array_search", "fibonacci_search", {
        rootSelector: "#standardCodeSection",
        defaultLanguage: "python",
        moreInfoSelector: "#standardMoreInfo"
    });
    initCodeLoader("array_search", "fibonacci_search_production", {
        rootSelector: "#productionCodeSection",
        defaultLanguage: "python"
    });
    const visualizer = new SearchVisualizer("searchGraphContainer");
    let dataset = [4, 9, 15, 22, 30, 37, 44, 51, 63, 74, 86, 99, 112];
    let target = 74;
    let controller = new SearchController(fibonacciSearch(dataset, target), visualizer);
    visualizer.render(createFibonacciSearchInitialStep(dataset, target));
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
            dataset = [4, 9, 15, 22, 30, 37, 44, 51, 63, 74, 86, 99, 112];
        }
        if (Number.isNaN(target)) {
            target = dataset[Math.floor(dataset.length / 2)];
            targetInput.value = String(target);
        }
        datasetInput.value = dataset.join(",");
        controller.reset(fibonacciSearch(dataset, target), createFibonacciSearchInitialStep(dataset, target));
        controller.setSpeed(Number(speedRange.value));
    }
    generateBtn.addEventListener("click", () => {
        dataset = generateSortedArray(13);
        target = dataset[Math.floor(dataset.length * 0.7)];
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

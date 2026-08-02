import { createGallopingSearchInitialStep, gallopingSearch } from "./algorithms/galloping.js";
import { SearchController } from "./visualizer/searchController.js";
import { SearchVisualizer } from "./visualizer/searchVisualizer.js";
import { initCodeLoader } from "../ui/codeLoader.js";
import { initLearnMore } from "../ui/navigation.js";
const fallbackDataset = [3, 7, 12, 18, 27, 39, 52, 68, 83, 99, 118, 137, 151, 170];
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
        values.add(Math.floor(Math.random() * 180) + 1);
    }
    return Array.from(values).sort((a, b) => a - b);
}
document.addEventListener("DOMContentLoaded", () => {
    initLearnMore();
    initCodeLoader("array_search", "galloping_search", {
        rootSelector: "#standardCodeSection",
        defaultLanguage: "python",
        moreInfoSelector: "#standardMoreInfo"
    });
    initCodeLoader("array_search", "galloping_search_production", {
        rootSelector: "#productionCodeSection",
        defaultLanguage: "python"
    });
    const visualizer = new SearchVisualizer("searchGraphContainer");
    let dataset = [...fallbackDataset];
    let target = 99;
    let controller = new SearchController(gallopingSearch(dataset, target), visualizer);
    visualizer.render(createGallopingSearchInitialStep(dataset, target));
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
            dataset = [...fallbackDataset];
        }
        if (Number.isNaN(target)) {
            target = dataset[Math.floor(dataset.length * 0.65)];
            targetInput.value = String(target);
        }
        datasetInput.value = dataset.join(",");
        controller.reset(gallopingSearch(dataset, target), createGallopingSearchInitialStep(dataset, target));
        controller.setSpeed(Number(speedRange.value));
    }
    generateBtn.addEventListener("click", () => {
        dataset = generateSortedArray(14);
        target = dataset[Math.floor(dataset.length * 0.65)];
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

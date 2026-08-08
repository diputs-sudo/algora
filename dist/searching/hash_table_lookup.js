import { createHashTableLookupInitialStep, hashTableLookup } from "./algorithms/hash_table_lookup.js";
import { SearchController } from "./visualizer/searchController.js";
import { SearchVisualizer } from "./visualizer/searchVisualizer.js";
import { initCodeLoader } from "../ui/codeLoader.js";
import { initLearnMore } from "../ui/navigation.js";
function parseDataset(value) {
    return value
        .split(",")
        .map(item => Number(item.trim()))
        .filter(item => !Number.isNaN(item));
}
function generateArray(size) {
    return Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 5);
}
document.addEventListener("DOMContentLoaded", () => {
    initLearnMore();
    initCodeLoader("array_search", "hash_search", {
        rootSelector: "#standardCodeSection",
        defaultLanguage: "python",
        moreInfoSelector: "#standardMoreInfo"
    });
    initCodeLoader("array_search", "hash_search_production", {
        rootSelector: "#productionCodeSection",
        defaultLanguage: "python"
    });
    const visualizer = new SearchVisualizer("searchGraphContainer");
    let dataset = [18, 39, 60, 5, 26, 47, 12, 33, 54, 75];
    let target = 47;
    let controller = new SearchController(hashTableLookup(dataset, target), visualizer);
    visualizer.render(createHashTableLookupInitialStep(dataset, target));
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
            dataset = [18, 39, 60, 5, 26, 47, 12, 33, 54, 75];
        }
        if (Number.isNaN(target)) {
            target = dataset[Math.floor(dataset.length / 2)];
            targetInput.value = String(target);
        }
        datasetInput.value = dataset.join(",");
        controller.reset(hashTableLookup(dataset, target), createHashTableLookupInitialStep(dataset, target));
        controller.setSpeed(Number(speedRange.value));
    }
    generateBtn.addEventListener("click", () => {
        dataset = generateArray(10);
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

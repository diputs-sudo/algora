import { createParametricSearchInitialStep, defaultParametricWeights, parametricSearch } from "./algorithms/parametric_search.js";
import { SearchController } from "./visualizer/searchController.js";
import { SearchVisualizer } from "./visualizer/searchVisualizer.js";
import { initCodeLoader } from "../ui/codeLoader.js";
import { initLearnMore } from "../ui/navigation.js";
function parseWeights(value) {
    return value
        .split(",")
        .map(item => Number(item.trim()))
        .filter(item => Number.isFinite(item) && item > 0);
}
function generateWeights(size) {
    return Array.from({ length: size }, () => Math.floor(Math.random() * 12) + 1);
}
document.addEventListener("DOMContentLoaded", () => {
    initLearnMore();
    initCodeLoader("array_search", "parametric_search", {
        rootSelector: "#standardCodeSection",
        defaultLanguage: "python",
        moreInfoSelector: "#standardMoreInfo"
    });
    initCodeLoader("array_search", "parametric_search_production", {
        rootSelector: "#productionCodeSection",
        defaultLanguage: "python"
    });
    const visualizer = new SearchVisualizer("searchGraphContainer");
    let weights = [...defaultParametricWeights];
    let days = 3;
    let controller = new SearchController(parametricSearch(weights, days), visualizer);
    visualizer.render(createParametricSearchInitialStep(weights, days));
    const datasetInput = document.getElementById("datasetInput");
    const targetInput = document.getElementById("targetInput");
    const generateBtn = document.getElementById("generateBtn");
    const playBtn = document.getElementById("playBtn");
    const pauseBtn = document.getElementById("pauseBtn");
    const stepBtn = document.getElementById("stepBtn");
    const resetBtn = document.getElementById("resetBtn");
    const speedRange = document.getElementById("speedRange");
    datasetInput.value = weights.join(",");
    targetInput.value = String(days);
    function reset() {
        weights = parseWeights(datasetInput.value);
        days = Math.floor(Number(targetInput.value));
        if (weights.length === 0) {
            weights = [...defaultParametricWeights];
        }
        if (!Number.isFinite(days) || days <= 0) {
            days = 3;
            targetInput.value = String(days);
        }
        datasetInput.value = weights.join(",");
        controller.reset(parametricSearch(weights, days), createParametricSearchInitialStep(weights, days));
        controller.setSpeed(Number(speedRange.value));
    }
    generateBtn.addEventListener("click", () => {
        weights = generateWeights(8);
        days = Math.max(2, Math.min(5, Math.ceil(weights.length / 2)));
        datasetInput.value = weights.join(",");
        targetInput.value = String(days);
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

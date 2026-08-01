import { createExponentialSearchInitialStep, exponentialSearch } from "./algorithms/exponential.js";
import { SearchController } from "./visualizer/searchController.js";
import { SearchVisualizer } from "./visualizer/searchVisualizer.js";
import { initCodeLoader } from "../ui/codeLoader.js";
import { initLearnMore } from "../ui/navigation.js";

function parseDataset(value: string): number[] {
    return value
        .split(",")
        .map(item => Number(item.trim()))
        .filter(item => !Number.isNaN(item))
        .sort((a, b) => a - b);
}

function generateSortedArray(size: number): number[] {
    const values = new Set<number>();

    while (values.size < size) {
        values.add(Math.floor(Math.random() * 120) + 1);
    }

    return Array.from(values).sort((a, b) => a - b);
}

document.addEventListener("DOMContentLoaded", () => {
    initLearnMore();
    initCodeLoader("array_search", "exponential_search", {
        rootSelector: "#standardCodeSection",
        defaultLanguage: "python",
        moreInfoSelector: "#standardMoreInfo"
    });
    initCodeLoader("array_search", "exponential_search_production", {
        rootSelector: "#productionCodeSection",
        defaultLanguage: "python"
    });

    const visualizer = new SearchVisualizer("searchGraphContainer");

    let dataset = [2, 5, 9, 14, 23, 31, 38, 47, 59, 66, 78, 91, 105, 117];
    let target = 78;
    let controller = new SearchController(exponentialSearch(dataset, target), visualizer);

    visualizer.render(createExponentialSearchInitialStep(dataset, target));

    const datasetInput = document.getElementById("datasetInput") as HTMLInputElement;
    const targetInput = document.getElementById("targetInput") as HTMLInputElement;
    const generateBtn = document.getElementById("generateBtn") as HTMLButtonElement;
    const playBtn = document.getElementById("playBtn") as HTMLButtonElement;
    const pauseBtn = document.getElementById("pauseBtn") as HTMLButtonElement;
    const stepBtn = document.getElementById("stepBtn") as HTMLButtonElement;
    const resetBtn = document.getElementById("resetBtn") as HTMLButtonElement;
    const speedRange = document.getElementById("speedRange") as HTMLInputElement;

    datasetInput.value = dataset.join(",");
    targetInput.value = String(target);

    function reset() {
        dataset = parseDataset(datasetInput.value);
        target = Number(targetInput.value);

        if (dataset.length === 0) {
            dataset = [2, 5, 9, 14, 23, 31, 38, 47, 59, 66, 78, 91, 105, 117];
        }

        if (Number.isNaN(target)) {
            target = dataset[Math.floor(dataset.length / 2)];
            targetInput.value = String(target);
        }

        datasetInput.value = dataset.join(",");
        controller.reset(
            exponentialSearch(dataset, target),
            createExponentialSearchInitialStep(dataset, target)
        );
        controller.setSpeed(Number(speedRange.value));
    }

    generateBtn.addEventListener("click", () => {
        dataset = generateSortedArray(14);
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

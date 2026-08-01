import { bitonicArraySearch, createBitonicArraySearchInitialStep } from "./algorithms/bitonic_array.js";
import { SearchController } from "./visualizer/searchController.js";
import { SearchVisualizer } from "./visualizer/searchVisualizer.js";
import { initCodeLoader } from "../ui/codeLoader.js";
import { initLearnMore } from "../ui/navigation.js";

const fallbackDataset = [4, 9, 16, 24, 37, 55, 73, 92, 81, 64, 45, 29, 11];

function parseDataset(value: string): number[] {
    const values = value
        .split(",")
        .map(item => Number(item.trim()))
        .filter(item => !Number.isNaN(item));

    return normalizeBitonicArray(values);
}

function normalizeBitonicArray(values: number[]): number[] {
    const unique = Array.from(new Set(values));

    if (unique.length < 3) {
        return [...fallbackDataset];
    }

    const sorted = unique.sort((a, b) => a - b);
    const peak = sorted[sorted.length - 1];
    const rest = sorted.slice(0, -1);
    const leftSize = Math.max(1, Math.ceil(rest.length * 0.58));
    const left = rest.slice(0, leftSize);
    const right = rest.slice(leftSize).reverse();

    return [...left, peak, ...right];
}

function generateBitonicArray(size: number): number[] {
    const values = new Set<number>();

    while (values.size < size) {
        values.add(Math.floor(Math.random() * 120) + 1);
    }

    return normalizeBitonicArray(Array.from(values));
}

document.addEventListener("DOMContentLoaded", () => {
    initLearnMore();
    initCodeLoader("array_search", "bitonic_array_search", {
        rootSelector: "#standardCodeSection",
        defaultLanguage: "python",
        moreInfoSelector: "#standardMoreInfo"
    });
    initCodeLoader("array_search", "bitonic_array_search_production", {
        rootSelector: "#productionCodeSection",
        defaultLanguage: "python"
    });

    const visualizer = new SearchVisualizer("searchGraphContainer");

    let dataset = [...fallbackDataset];
    let target = 64;
    let controller = new SearchController(bitonicArraySearch(dataset, target), visualizer);

    visualizer.render(createBitonicArraySearchInitialStep(dataset, target));

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

        if (Number.isNaN(target)) {
            target = dataset[Math.floor(dataset.length * 0.7)];
            targetInput.value = String(target);
        }

        datasetInput.value = dataset.join(",");
        controller.reset(
            bitonicArraySearch(dataset, target),
            createBitonicArraySearchInitialStep(dataset, target)
        );
        controller.setSpeed(Number(speedRange.value));
    }

    generateBtn.addEventListener("click", () => {
        dataset = generateBitonicArray(13);
        target = dataset[Math.floor(dataset.length * 0.72)];
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

import { createInterpolationSearchInitialStep, interpolationSearch } from "./algorithms/interpolation.js";
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

function generateEvenlySpacedArray(size: number): number[] {
    const start = Math.floor(Math.random() * 8) + 2;
    const step = Math.floor(Math.random() * 7) + 5;

    return Array.from({ length: size }, (_, index) => start + index * step);
}

function generateSkewedArray(size: number): number[] {
    const start = Math.floor(Math.random() * 4) + 2;
    let current = start;

    return Array.from({ length: size }, (_, index) => {
        if (index === 0) {
            return current;
        }

        const gap = index < Math.floor(size * 0.65)
            ? Math.floor(Math.random() * 3) + 1
            : Math.floor(Math.random() * 18) + 9;
        current += gap;
        return current;
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initLearnMore();
    initCodeLoader("array_search", "interpolation_search", {
        rootSelector: "#standardCodeSection",
        defaultLanguage: "python",
        moreInfoSelector: "#standardMoreInfo"
    });
    initCodeLoader("array_search", "interpolation_search_production", {
        rootSelector: "#productionCodeSection",
        defaultLanguage: "python"
    });

    const visualizer = new SearchVisualizer("searchGraphContainer");

    let dataset = [5, 12, 19, 26, 33, 40, 47, 54, 61, 68, 75, 82, 89];
    let target = 61;
    let controller = new SearchController(interpolationSearch(dataset, target), visualizer);

    visualizer.render(createInterpolationSearchInitialStep(dataset, target));

    const datasetInput = document.getElementById("datasetInput") as HTMLInputElement;
    const targetInput = document.getElementById("targetInput") as HTMLInputElement;
    const generateBtn = document.getElementById("generateBtn") as HTMLButtonElement;
    const playBtn = document.getElementById("playBtn") as HTMLButtonElement;
    const pauseBtn = document.getElementById("pauseBtn") as HTMLButtonElement;
    const stepBtn = document.getElementById("stepBtn") as HTMLButtonElement;
    const resetBtn = document.getElementById("resetBtn") as HTMLButtonElement;
    const speedRange = document.getElementById("speedRange") as HTMLInputElement;
    const modeButtons = Array.from(
        document.querySelectorAll(".interpolation-mode-btn")
    ) as HTMLButtonElement[];

    let distributionMode: "even" | "skewed" = "even";

    datasetInput.value = dataset.join(",");
    targetInput.value = String(target);

    function reset() {
        dataset = parseDataset(datasetInput.value);
        target = Number(targetInput.value);

        if (dataset.length === 0) {
            dataset = [5, 12, 19, 26, 33, 40, 47, 54, 61, 68, 75, 82, 89];
        }

        if (Number.isNaN(target)) {
            target = dataset[Math.floor(dataset.length / 2)];
            targetInput.value = String(target);
        }

        datasetInput.value = dataset.join(",");
        controller.reset(
            interpolationSearch(dataset, target),
            createInterpolationSearchInitialStep(dataset, target)
        );
        controller.setSpeed(Number(speedRange.value));
    }

    generateBtn.addEventListener("click", () => {
        dataset = distributionMode === "even"
            ? generateEvenlySpacedArray(13)
            : generateSkewedArray(13);
        target = dataset[Math.floor(dataset.length * 0.7)];
        datasetInput.value = dataset.join(",");
        targetInput.value = String(target);
        reset();
    });

    modeButtons.forEach(button => {
        button.addEventListener("click", () => {
            distributionMode = button.dataset.mode === "skewed" ? "skewed" : "even";
            modeButtons.forEach(item => {
                item.classList.toggle("active", item === button);
            });
            generateBtn.textContent = distributionMode === "even"
                ? "Generate Even Array"
                : "Generate Skewed Array";
            generateBtn.click();
        });
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

import { createQuickselectInitialStep, defaultQuickselectArray, quickselect } from "./algorithms/quickselect.js";
import { SearchController } from "./visualizer/searchController.js";
import { SearchVisualizer } from "./visualizer/searchVisualizer.js";
import { initCodeLoader } from "../ui/codeLoader.js";
import { initLearnMore } from "../ui/navigation.js";

function parseDataset(value: string): number[] {
    return value
        .split(",")
        .map(item => Number(item.trim()))
        .filter(item => Number.isFinite(item));
}

function generateArray(size: number): number[] {
    return Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 5);
}

document.addEventListener("DOMContentLoaded", () => {
    initLearnMore();
    initCodeLoader("array_search", "quickselect", {
        rootSelector: "#standardCodeSection",
        defaultLanguage: "python",
        moreInfoSelector: "#standardMoreInfo"
    });
    initCodeLoader("array_search", "quickselect_production", {
        rootSelector: "#productionCodeSection",
        defaultLanguage: "python"
    });

    const visualizer = new SearchVisualizer("searchGraphContainer");

    let dataset = [...defaultQuickselectArray];
    let k = 4;
    let controller = new SearchController(quickselect(dataset, k), visualizer);

    visualizer.render(createQuickselectInitialStep(dataset, k));

    const datasetInput = document.getElementById("datasetInput") as HTMLInputElement;
    const targetInput = document.getElementById("targetInput") as HTMLInputElement;
    const generateBtn = document.getElementById("generateBtn") as HTMLButtonElement;
    const playBtn = document.getElementById("playBtn") as HTMLButtonElement;
    const pauseBtn = document.getElementById("pauseBtn") as HTMLButtonElement;
    const stepBtn = document.getElementById("stepBtn") as HTMLButtonElement;
    const resetBtn = document.getElementById("resetBtn") as HTMLButtonElement;
    const speedRange = document.getElementById("speedRange") as HTMLInputElement;

    datasetInput.value = dataset.join(",");
    targetInput.value = String(k);

    function reset() {
        dataset = parseDataset(datasetInput.value);
        k = Math.floor(Number(targetInput.value));

        if (dataset.length === 0) {
            dataset = [...defaultQuickselectArray];
        }

        if (!Number.isFinite(k) || k < 1 || k > dataset.length) {
            k = Math.min(4, dataset.length);
            targetInput.value = String(k);
        }

        datasetInput.value = dataset.join(",");
        controller.reset(
            quickselect(dataset, k),
            createQuickselectInitialStep(dataset, k)
        );
        controller.setSpeed(Number(speedRange.value));
    }

    generateBtn.addEventListener("click", () => {
        dataset = generateArray(9);
        k = Math.ceil(dataset.length / 2);
        datasetInput.value = dataset.join(",");
        targetInput.value = String(k);
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

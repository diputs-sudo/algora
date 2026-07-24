import { Graph } from "./visualizer/graph.js";
import { Controller } from "./visualizer/controller.js";
import { generateUniqueRandomArray } from "./visualizer/randomArray.js";
import { selectionSort } from "./algorithms/selection.js";
import { initLearnMore } from "../ui/navigation.js";
import { initCodeLoader } from "../ui/codeLoader.js";

document.addEventListener("DOMContentLoaded", () => {
    initLearnMore();
    initCodeLoader("sorting", "selection_sort", {
        rootSelector: "#standardCodeSection",
        defaultLanguage: "python",
        moreInfoSelector: "#standardMoreInfo"
    });

    const graph = new Graph("graphContainer");

    let dataset: number[] = generateRandomArray(20);
    let generator = selectionSort(dataset);
    let controller = new Controller(generator, graph);

    graph.render(dataset);

    const datasetInput = document.getElementById("datasetInput") as HTMLInputElement;
    const generateBtn = document.getElementById("generateBtn") as HTMLButtonElement;
    const playBtn = document.getElementById("playBtn") as HTMLButtonElement;
    const pauseBtn = document.getElementById("pauseBtn") as HTMLButtonElement;
    const stepBtn = document.getElementById("stepBtn") as HTMLButtonElement;
    const resetBtn = document.getElementById("resetBtn") as HTMLButtonElement;
    const speedRange = document.getElementById("speedRange") as HTMLInputElement;

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
            .filter(value => !Number.isNaN(value));

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
        generator = selectionSort(dataset);
        controller.reset(generator, dataset);
    }

    function generateRandomArray(size: number): number[] {
        return generateUniqueRandomArray(size);
    }
});
